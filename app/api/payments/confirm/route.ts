import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { sendPaymentConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27' as any,
});

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, rezervacijaId } = await request.json();

    console.log(`💳 Payment Confirm pozvan - Rezervacija: ${rezervacijaId}, PaymentIntent: ${paymentIntentId}`);

    if (!paymentIntentId || !rezervacijaId) {
      console.error('❌ Nedostaju parametri');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      console.warn(`⚠️ Payment nije completed - status: ${paymentIntent.status}`);
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    console.log(`✓ Payment verified sa status: ${paymentIntent.status}`);

    // Update reservation status in database
    const updatedRezervacija = await prisma.rezervacija.update({
      where: {
        id: parseInt(rezervacijaId),
      },
      data: {
        status: 'paid',
      },
      include: {
        gost: true,
      },
    });

    console.log(`✓ Rezervacija ${rezervacijaId} ažurirana sa statusom 'paid'`);

    // Fetch soba data separately
    const soba = await prisma.soba.findUnique({
      where: { broj: updatedRezervacija.sobaBroj }
    });

    // Pošalji email potvrdu plaćanja
    if (updatedRezervacija.gost && soba) {
      try {
        const paymentAmount = paymentIntent.amount / 100; // Stripe koristi cente
        console.log(`📧 Slanje email potvrde za plaćanje na: ${updatedRezervacija.gost.email}`);

        const emailSent = await sendPaymentConfirmationEmail(
          {
            gost: updatedRezervacija.gost,
            rezervacija: { ...updatedRezervacija, soba } as any,
            paymentAmount
          },
          'mn' // Default language - možete dodati lang parametar ako trebate
        );

        if (emailSent) {
          console.log(`✓ Email plaćanja uspješno poslana za rezervaciju ${rezervacijaId}`);
        } else {
          console.warn(`⚠️ Email plaćanja nije poslana (možda nisu dostupni kredencijali)`);
        }
      } catch (emailError) {
        console.error(`✗ Greška pri slanju emaila plaćanja za rezervaciju ${rezervacijaId}:`, emailError);
        // Ne prekidaj request ako email fajla
      }
    } else {
      console.warn(`⚠️ Gost nije pronađen za rezervaciju ${rezervacijaId}`);
    }

    return NextResponse.json({
      success: true,
      rezervacija: updatedRezervacija,
      emailSent: true, // Indikatcija da je email pokušan
    });
  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}