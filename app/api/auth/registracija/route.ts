import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { email, lozinka, ime } = await request.json();
  if (!email || !lozinka) {
    return NextResponse.json({ error: 'Email i lozinka su obavezni' }, { status: 400 });
  }
  const existingUser = await prisma.korisnik.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Korisnik već postoji' }, { status: 409 });
  }
  const hashedPassword = await bcrypt.hash(lozinka, 10);
  const korisnik = await prisma.korisnik.create({
    data: {
      email,
      ime,
      lozinka: hashedPassword,
      // uloga se ne šalje, koristi se default iz šeme ("admin")
    },
  });
  return NextResponse.json({ id: korisnik.id, email: korisnik.email, ime: korisnik.ime, uloga: korisnik.uloga });
}
