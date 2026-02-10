import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

/**
 * TEST ENDPOINT - Direktno testiranje email slanja za plaćanja
 * Korištenje: POST /api/test/send-payment-email
 *
 * Body:
 * {
 *   "rezervacijaId": 1
 * }
 *
 * NAPOMENA: Trebate postaviti EMAIL_USER i EMAIL_PASSWORD u .env.local
 */
export async function POST(request: NextRequest) {
  try {
    const { rezervacijaId } = await request.json();

    if (!rezervacijaId) {
      return NextResponse.json(
        { error: 'Trebate prosljeđiti rezervacijaId' },
        { status: 400 }
      );
    }

    console.log(`🧪 Test: Slanje email-a za plaćanja - Rezervacija ${rezervacijaId}`);

    // Učitaj rezervaciju sa svim podacima
    const rezervacija = await prisma.rezervacija.findUnique({
      where: { id: parseInt(rezervacijaId) },
      include: {
        gost: true,
      }
    });

    if (!rezervacija) {
      return NextResponse.json(
        { error: `Rezervacija ${rezervacijaId} nije pronađena` },
        { status: 404 }
      );
    }

    if (!rezervacija.gost) {
      return NextResponse.json(
        { error: `Gost nije pronađen za rezervaciju ${rezervacijaId}` },
        { status: 404 }
      );
    }

    // Fetch soba data separately
    const soba = await prisma.soba.findUnique({
      where: { broj: rezervacija.sobaBroj }
    });

    if (!soba) {
      return NextResponse.json(
        { error: `Soba ${rezervacija.sobaBroj} nije pronađena` },
        { status: 404 }
      );
    }

    console.log(`📧 Email će biti poslana na: ${rezervacija.gost.email}`);

    // Testiraj slanje email-a
    const emailSent = await sendPaymentConfirmationEmail(
      {
        gost: rezervacija.gost,
        rezervacija: { ...rezervacija, soba } as any,
        paymentAmount: 100.00 // Test iznos
      },
      'mn'
    );

    if (emailSent) {
      return NextResponse.json({
        status: '✓ SUCCESS',
        message: `Email uspješno poslana na ${rezervacija.gost.email}`,
        details: {
          to: rezervacija.gost.email,
          guestName: `${rezervacija.gost.ime} ${rezervacija.gost.prezime}`,
          reservationId: rezervacija.id,
          roomNumber: soba.broj
        }
      });
    } else {
      return NextResponse.json({
        status: '⚠️ WARNING',
        message: 'Email nije poslana - verovatno nisu dostupni kredencijali',
        details: {
          to: rezervacija.gost.email,
          reason: 'EMAIL_USER i EMAIL_PASSWORD nisu postavljeni u .env.local'
        }
      });
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json(
      {
        status: '✗ ERROR',
        error: String(error),
        message: 'Greška pri testiranju email slanja'
      },
      { status: 500 }
    );
  }
}
