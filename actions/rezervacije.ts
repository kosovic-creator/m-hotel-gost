/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
  const result = rezervacijaSchema(t).safeParse({
    soba,
    gost,
    prijava,
    odjava,
    status
  });
  if (!result.success) {
    const params = new URLSearchParams();
    const fieldErrors = result.error.flatten().fieldErrors;
    if (fieldErrors?.gost?.[0]) params.append('gostError', fieldErrors.gost[0]);
    if (fieldErrors?.soba?.[0]) params.append('sobaError', fieldErrors.soba[0]);
    if (fieldErrors?.prijava?.[0]) params.append('prijavaError', fieldErrors.prijava[0]);
    if (fieldErrors?.odjava?.[0]) params.append('odjavaError', fieldErrors.odjava[0]);
    if (fieldErrors?.status?.[0]) params.append('statusError', fieldErrors.status[0]);
    params.append('lang', lang);
    // Dodaj vrijednosti polja u query parametre
    params.append('soba', soba ? String(soba) : '');
    params.append('gost', gost ? String(gost) : '');
    function toDateInput(val: unknown) {
      if (!val) return '';
      const d = new Date(val as string);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    }
    params.append('prijava', toDateInput(prijava));
    params.append('odjava', toDateInput(odjava));
    params.append('status', status ? String(status) : '');
    redirect(`/rezervacije/dodaj?${params.toString()}`);
    return;
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
    const params = new URLSearchParams();
    if (error.code === 'P2002') {
      params.append('error', 'exists');
    } else {
      params.append('error', 'error');
    }
    redirect(`/rezervacije?${params.toString()}`);
    return;
  }
  revalidatePath('/rezervacije');
  const params = new URLSearchParams();
  params.append('success', 'added');
  redirect(`/rezervacije?${params.toString()}`);

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
  const result = rezervacijaSchema(t).safeParse({
    soba,
    gost,
    prijava,
    odjava,
    status
  });
  if (!result.success) {
    const params = new URLSearchParams();
    const fieldErrors = result.error.flatten().fieldErrors;
    if (fieldErrors?.gost?.[0]) params.append('gostError', fieldErrors.gost[0]);
    if (fieldErrors?.soba?.[0]) params.append('sobaError', fieldErrors.soba[0]);
    if (fieldErrors?.prijava?.[0]) params.append('prijavaError', fieldErrors.prijava[0]);
    if (fieldErrors?.odjava?.[0]) params.append('odjavaError', fieldErrors.odjava[0]);
    if (fieldErrors?.status?.[0]) params.append('statusError', fieldErrors.status[0]);
    params.append('id', id.toString());
    params.append('lang', lang);
    // Dodaj vrijednosti polja u query parametre
    params.append('soba', soba ? String(soba) : '');
    params.append('gost', gost ? String(gost) : '');
    // Helper za validan date string (YYYY-MM-DD)
    function toDateInput(val: unknown) {
      if (!val) return '';
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
      const d = new Date(val as string);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    }
    params.append('prijava', toDateInput(prijava));
    params.append('odjava', toDateInput(odjava));
    params.append('status', status ? String(status) : '');
    redirect(`/rezervacije/izmeni?${params.toString()}`);
    return;
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
    const params = new URLSearchParams();
    params.append('error', 'error');
    redirect(`/rezervacije?${params.toString()}`);
    return;
  }
  revalidatePath('/rezervacije');
  const params = new URLSearchParams();
  params.append('success', 'updated');
  redirect(`/rezervacije?${params.toString()}`);
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
    const params = new URLSearchParams();
    params.append('error', 'error');
    redirect(`/rezervacije?${params.toString()}`);
    return;
  }
  revalidatePath('/rezervacije');
  const params = new URLSearchParams();
  params.append('success', 'deleted');
  redirect(`/rezervacije?${params.toString()}`);
}

