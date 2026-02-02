/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rezervacijaSchema } from '@/app/validacija/rezervacijaSchema';
import { getLocaleMessages } from '@/i18n/i18n';
import { createErrorRedirect, createSuccessRedirect, createFailureRedirect, toDateInput } from '@/lib/formHelpers';
import type { Lang } from '@/types/searchParams';

export const ucitajRezervacije = async () => {
  try {
    const rezervacija = await prisma.rezervacija.findMany({
      include: {
        gost: true,
        soba: true,
      },
    });
    return rezervacija;
  } catch (error) {
    console.error("Greška pri učitavanju rezervacija:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export async function dodajRezervaciju(formData: FormData) {
  const soba = formData.get('soba');
  const gost = formData.get('gost');
  const prijava = formData.get('prijava');
  const odjava = formData.get('odjava');
  const status = formData.get('status');
  const lang: Lang = (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  const messages = getLocaleMessages(lang, 'rezervacije');
  const t = (key: string) => messages[key] || key;
  const result = rezervacijaSchema(t).safeParse({
    soba,
    gost,
    prijava,
    odjava,
    status
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formValues = {
      soba: soba ? String(soba) : '',
      gost: gost ? String(gost) : '',
      prijava: toDateInput(prijava),
      odjava: toDateInput(odjava),
      status: status ? String(status) : ''
    };
    redirect(createErrorRedirect('/rezervacije/dodaj', errors, formValues, lang));
  }

  try {
    await prisma.rezervacija.create({
      data: {
        soba: { connect: { id: Number(soba) } },
        gost: { connect: { id: Number(gost) } },
        prijava: new Date(prijava as string),
        odjava: new Date(odjava as string),
        status: status as string
      },
    });
  } catch (error: any) {
    revalidatePath('/rezervacije');
    const message = error.code === 'P2002' ? 'errorExists' : 'errorGeneral';
    redirect(createFailureRedirect('/rezervacije', message, lang));
  }

  revalidatePath('/rezervacije');
  redirect(createSuccessRedirect('/rezervacije', 'successAdded', lang));
}

export async function getRezervacijaById(searchParams: { rezervacijaId: number }) {
  try {
    const id = Number(searchParams.rezervacijaId);
    if (!id || isNaN(id)) {
      throw new Error('Neispravan ID rezervacije');
    }
    const rezervacija = await prisma.rezervacija.findUnique({
      where: { id },
      include: {
        gost: true,
        soba: true,
      },
    });
    return rezervacija;
  } catch (error) {
    console.error("Greška pri učitavanju rezervacije:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export async function izmeniRezervaciju(formData: FormData) {
  const id = Number(formData.get('id'));
  const soba = formData.get('soba');
  const gost = formData.get('gost');
  const prijava = formData.get('prijava');
  const odjava = formData.get('odjava');
  const status = formData.get('status');
  const lang: Lang = (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  const messages = getLocaleMessages(lang, 'rezervacije');
  const t = (key: string) => messages[key] || key;
  const result = rezervacijaSchema(t).safeParse({ soba, gost, prijava, odjava, status });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formValues = {
      id,
      soba: soba ? String(soba) : '',
      gost: gost ? String(gost) : '',
      prijava: toDateInput(prijava),
      odjava: toDateInput(odjava),
      status: status ? String(status) : ''
    };
    redirect(createErrorRedirect('/rezervacije/izmeni', errors, formValues, lang));
  }

  try {
    await prisma.rezervacija.update({
      where: { id },
      data: {
        soba: { connect: { id: Number(soba) } },
        gost: { connect: { id: Number(gost) } },
        prijava: new Date(prijava as string),
        odjava: new Date(odjava as string),
        status: status as string
      },
    });
  } catch {
    revalidatePath('/rezervacije');
    redirect(createFailureRedirect('/rezervacije', 'errorGeneral', lang));
  }

  revalidatePath('/rezervacije');
  redirect(createSuccessRedirect('/rezervacije', 'successUpdated', lang));
}

export async function obrisiRezervaciju(formData: FormData) {
  const id = Number(formData.get('id'));
  const lang: Lang = (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  try {
    const rezervacija = await prisma.rezervacija.findUnique({ where: { id } });
    if (!rezervacija) {
      throw new Error('errorNotFound');
    }
    await prisma.rezervacija.delete({ where: { id } });
  } catch {
    revalidatePath('/rezervacije');
    redirect(createFailureRedirect('/rezervacije', 'errorGeneral', lang));
  }

  revalidatePath('/rezervacije');
  redirect(createSuccessRedirect('/rezervacije', 'successDeleted', lang));
}

