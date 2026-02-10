import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { registerSchema } from '@/app/validacija/authSchemas';
import { getLocaleMessages } from '@/i18n/i18n';

export async function POST(request: Request) {
  try {
    const { email, lozinka, ime, potvrdaLozinke } = await request.json();
    const lang = 'mn';

    const messages = getLocaleMessages(lang, 'auth');
    const t = (key: string) => messages[key] || key;
    const result = registerSchema(t).safeParse({ email, lozinka, ime, potvrdaLozinke });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: 'Validacija nije uspješna',
          fieldErrors: errors,
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.korisnik.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Korisnik s tim email-om već postoji' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(lozinka, 10);
    const korisnik = await prisma.korisnik.create({
      data: {
        email,
        ime,
        lozinka: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        id: korisnik.id,
        email: korisnik.email,
        ime: korisnik.ime,
        uloga: korisnik.uloga,
        message: 'Korisnik uspješno registriran',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Greška pri registraciji:', error);
    return NextResponse.json(
      { error: 'Greška pri registraciji. Molimo pokušajte ponovno.' },
      { status: 500 }
    );
  }
}
