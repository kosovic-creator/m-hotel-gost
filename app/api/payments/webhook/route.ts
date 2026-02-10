import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { sendPaymentConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook pozvan - početak procesiranja...');

  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Nema Stripe signature-a u header-u');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log(`✓ Webhook event verifikovan: ${event.type}`);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💳 PaymentIntent succeeded:', paymentIntent.id);

        // Update reservation status
        if (paymentIntent.metadata?.rezervacijaId) {
          try {
            const rezId = parseInt(paymentIntent.metadata.rezervacijaId);

            // Učitaj kompletan podatke o rezervaciji sa gostom
            const rezervacija = await prisma.rezervacija.findUnique({
              where: { id: rezId },
              include: {
                gost: true,
              }
            });

            if (!rezervacija) {
              console.warn(`⚠️ Rezervacija ${rezId} nije pronađena u bazi`);
              break;
            }

            if (!rezervacija.gost) {
              console.warn(`⚠️ Gost nije pronađen za rezervaciju ${rezId}`);
              break;
            }

            // Ažuriraj status rezervacije
            const updatedReservacija = await prisma.rezervacija.update({
              where: { id: rezId },
              data: {
                status: 'paid', // ili 'confirmed'
              },
              include: {
                gost: true,
              }
            });

            console.log(`✓ Rezervacija ${rezId} ažurirana sa statusom 'paid'`);

            // Fetch soba data separately
            const soba = await prisma.soba.findUnique({
              where: { broj: updatedReservacija.sobaBroj }
            });

            // Pošalji email potvrdu plaćanja
            try {
              const paymentAmount = paymentIntent.amount / 100; // Stripe koristi cente
              console.log(`📧 Slanje email potvrde za plaćanje na: ${rezervacija.gost.email}`);

              const emailSent = await sendPaymentConfirmationEmail(
                {
                  gost: rezervacija.gost,
                  rezervacija: { ...updatedReservacija, soba } as any,
                  paymentAmount
                },
                'mn' // Default language
              );

              if (emailSent) {
                console.log(`✓ Email plaćanja uspješno poslana za rezervaciju ${rezId}`);
              } else {
                console.warn(`⚠️ Email plaćanja nije poslana (verovatno nisu dostupni kredencijali)`);
              }
            } catch (emailError) {
              console.error(`✗ Greška pri slanju emaila plaćanja za rezervaciju ${rezId}:`, emailError);
            }
          } catch (dbError) {
            console.error('✗ Database greška pri ažuriranju rezervacije:', dbError);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', failedPayment.id);

        // Možete dodati logiku za neuspešna plaćanja
        if (failedPayment.metadata?.rezervacijaId) {
          try {
            await prisma.rezervacija.update({
              where: {
                id: parseInt(failedPayment.metadata.rezervacijaId),
              },
              data: {
                status: 'payment_failed',
              },
            });
          } catch (dbError) {
            console.error('Database update error:', dbError);
          }
        }
        break;

      default:
        console.log(`⏭️  Unhandled event type ${event.type}`);
    }

    console.log('✓ Webhook kompletno obrađen - vraćanje 200 OK');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}