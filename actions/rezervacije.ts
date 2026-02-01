/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  redirectWithValidationErrors,
  redirectWithSuccess,
  redirectWithError,
  toDateInput
} from '@/lib/helpers/url';
import { validateFormData } from '@/lib/middleware/validation';
import { SuccessMessage, ErrorMessage } from '@/lib/constants/messages';

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
  console.log("action called");

  const soba = formData.get('soba');
  const gost = formData.get('gost');
  const prijava = formData.get('prijava');
  const odjava = formData.get('odjava');
  const status = formData.get('status');
  const lang = (formData.get('lang') as string) || 'mn';

  // Zod validacija sa lokalizacijom
  const { rezervacijaSchema } = await import('@/app/validation/rezervacijaSchema');
  const { getLocaleMessages } = await import('@/i18n/i18n');
  const messages = getLocaleMessages(lang, 'rezervacije');
  const t = (key: string) => messages[key] || key;

  const result = validateFormData(rezervacijaSchema(t), {
    soba,
    gost,
    prijava,
    odjava,
    status
  });

  if (!result.success) {
    const formValues = {
      soba: soba ? String(soba) : '',
      gost: gost ? String(gost) : '',
      prijava: toDateInput(prijava),
      odjava: toDateInput(odjava),
      status: status ? String(status) : ''
    };

    redirectWithValidationErrors('/rezervacije/dodaj', result.errors, formValues, lang);
  }

  try {
    const rezultat = await prisma.rezervacija.create({
      data: {
        soba: { connect: { id: Number(soba) } },
        gost: { connect: { id: Number(gost) } },
        prijava: new Date(prijava as string),
        odjava: new Date(odjava as string),
        status: status as string
      },
    });
    console.log('Rezervacija uspješno dodana:', rezultat);
  } catch (error: any) {
    console.error('Greška pri dodavanju rezervacije:', error);
    revalidatePath('/rezervacije');

    if (error.code === 'P2002') {
      redirectWithError('/rezervacije', ErrorMessage.ALREADY_EXISTS, lang);
    } else {
      redirectWithError('/rezervacije', ErrorMessage.DATABASE_ERROR, lang);
    }
  }

  revalidatePath('/rezervacije');
  redirectWithSuccess('/rezervacije', SuccessMessage.ADDED, lang);
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
  const lang = (formData.get('lang') as string) || 'mn';

  // Zod validacija sa lokalizacijom
  const { rezervacijaSchema } = await import('@/app/validation/rezervacijaSchema');
  const { getLocaleMessages } = await import('@/i18n/i18n');
  const messages = getLocaleMessages(lang, 'rezervacije');
  const t = (key: string) => messages[key] || key;

  const result = validateFormData(rezervacijaSchema(t), {
    soba,
    gost,
    prijava,
    odjava,
    status
  });

  if (!result.success) {
    const formValues = {
      id: id.toString(),
      soba: soba ? String(soba) : '',
      gost: gost ? String(gost) : '',
      prijava: toDateInput(prijava),
      odjava: toDateInput(odjava),
      status: status ? String(status) : ''
    };

    redirectWithValidationErrors('/rezervacije/izmeni', result.errors, formValues, lang);
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
  } catch (error: any) {
    revalidatePath('/rezervacije');
    redirectWithError('/rezervacije', ErrorMessage.DATABASE_ERROR, lang);
  }

  revalidatePath('/rezervacije');
  redirectWithSuccess('/rezervacije', SuccessMessage.UPDATED, lang);
}

export async function obrisiRezervaciju(formData: FormData) {
  const id = Number(formData.get('id'));
  const lang = (formData.get('lang') as string) || 'mn';

  try {
    const rezervacija = await prisma.rezervacija.findUnique({ where: { id } });
    if (!rezervacija) {
      throw new Error('notfound');
    }
    await prisma.rezervacija.delete({ where: { id } });
  } catch (error: any) {
    revalidatePath('/rezervacije');
    redirectWithError('/rezervacije', ErrorMessage.DATABASE_ERROR, lang);
  }

  revalidatePath('/rezervacije');
  redirectWithSuccess('/rezervacije', SuccessMessage.DELETED, lang);
}

