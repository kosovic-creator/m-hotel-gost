/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { dodajRezervacijuSaGostom } from '@/actions/rezervacije';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const result = await dodajRezervacijuSaGostom(formData);

  // Ensure result is not void before checking properties
  if (
    result &&
    typeof result === 'object' &&
    result !== null &&
    'rezervacija' in result &&
    typeof (result as any).rezervacija === 'object' &&
    (result as any).rezervacija !== null &&
    'id' in (result as any).rezervacija &&
    (result as any).rezervacija.id
  ) {
    return NextResponse.redirect(new URL(`/rezervacije/${(result as any).rezervacija.id}`, req.url));
  }

  // Ako ima grešku, redirect na dodaj
  return NextResponse.redirect(new URL('/rezervacije/dodaj?error=errorGeneral', req.url));
}
