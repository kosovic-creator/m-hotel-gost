/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createErrorRedirect, createSuccessRedirect, createFailureRedirect } from '@/lib/formHelpers';


export const ucitajSobe = async () => {
  try {
    const soba = await prisma.soba.findMany();
    return soba;
  } catch (error) {
    console.error("Greška pri učitavanju soba:", error);
    return null;
  }
}
export const ucitajSobuId = async (searchParams: { sobaId: number }) => {
  try {
    const soba = await prisma.soba.findUnique({
      where: { id: searchParams.sobaId },
    });
    return soba;
  } catch (error) {
    console.error("Greška pri učitavanju sobe:", error);
    return null;
  }
};
export async function dodajSobu(formData: FormData) {
  const { sobaSchema } = await import('@/app/validacija/sobeSchema');
  const { getLocaleMessages } = await import('@/i18n/i18n');

  const broj = formData.get('broj') as string;
  const tip = formData.get('tip') as string;
  const kapacitet = Number(formData.get('kapacitet'));
  const cena = Number(formData.get('cena'));
  const opis = formData.get('opis') as string;
  const slikeRaw = formData.get('slike') as string;
  const tip_en = formData.get('tip_en') as string;
  const opis_en = formData.get('opis_en') as string;
  const lang = (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  const slike = slikeRaw ? slikeRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const t = await getLocaleMessages(lang, 'sobe');
  const tFunc = (key: string) => t[key] || key;
  const result = sobaSchema(tFunc).safeParse({ broj, tip, kapacitet, cena, opis, slike, tip_en, opis_en });

  if (!result.success) {
    revalidatePath('/sobe/dodaj');
    const errors = result.error.flatten().fieldErrors;
    const formValues = { broj, tip, kapacitet, cena, opis, slike: slikeRaw, tip_en, opis_en };
    redirect(createErrorRedirect('/sobe/dodaj', errors, formValues, lang));
  }

  try {
    await prisma.soba.create({
      data: { broj, tip, kapacitet, cena, opis, slike, tip_en, opis_en },
    });
  } catch (error: any) {
    revalidatePath('/sobe');
    const message = error.code === 'P2002' ? 'errorExists' : 'errorGeneral';
    redirect(createFailureRedirect('/sobe', message, lang));
  }

  revalidatePath('/sobe');
  redirect(createSuccessRedirect('/sobe', 'successAdded', lang));
}

export const azurirajSobu = async (formData: FormData) => {
  const { sobaSchema } = await import('@/app/validacija/sobeSchema');
  const { getLocaleMessages } = await import('@/i18n/i18n');

  const id = Number(formData.get('id'));
  const broj = formData.get('broj') as string;
  const tip = formData.get('tip') as string;
  const kapacitet = Number(formData.get('kapacitet'));
  const cena = Number(formData.get('cena'));
  const opis = formData.get('opis') as string;
  const tip_en = formData.get('tip_en') as string;
  const opis_en = formData.get('opis_en') as string;
  const slikeRaw = formData.get('slike') as string;
  const lang = (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  const slike = slikeRaw ? slikeRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const t = await getLocaleMessages(lang, 'sobe');
  const tFunc = (key: string) => t[key] || key;
  const result = sobaSchema(tFunc).safeParse({ broj, tip, kapacitet, cena, opis, slike, tip_en, opis_en });

  if (!result.success) {
    revalidatePath('/sobe/izmeni');
    const errors = result.error.flatten().fieldErrors;
    const formValues = { broj, tip, kapacitet, cena, opis, slike: slikeRaw, tip_en, opis_en, sobaId: id };
    redirect(createErrorRedirect('/sobe/izmeni', errors, formValues, lang));
  }

  try {
    await prisma.soba.update({
      where: { id },
      data: { broj, tip, kapacitet, cena, opis, slike, tip_en, opis_en },
    });
  } catch (error: any) {
    revalidatePath('/sobe');
    const message = error.code === 'P2002' ? 'errorExists' : 'errorGeneral';
    redirect(createFailureRedirect('/sobe', message, lang));
  }

  revalidatePath('/sobe');
  redirect(createSuccessRedirect('/sobe', 'successUpdated', lang));
};


export async function obrisiSobu(formData: FormData) {
  const id = Number(formData.get('id'));
  const lang = (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  try {
    const soba = await prisma.soba.findUnique({ where: { id } });
    if (!soba) {
      throw new Error('errorNotFound');
    }
    await prisma.soba.delete({ where: { id } });
  } catch (error) {
    revalidatePath('/sobe');
    redirect(createFailureRedirect('/sobe', 'errorGeneral', lang));
  }

  revalidatePath('/sobe');
  redirect(createSuccessRedirect('/sobe', 'successDeleted', lang));
}

