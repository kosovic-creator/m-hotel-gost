/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from '@/lib/prisma';
import { getLocaleMessages } from '@/i18n/i18n';
import { getLocale } from '@/i18n/locale';
import { createErrorRedirect, createFailureRedirect, createSuccessRedirect } from '@/lib/formHelpers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { gostSchema } from '@/app/validacija/gostSchema'; // Adjust path to match your project structure

type GostFormValues = {
    id?: number;
    titula: string;
    ime: string;
    prezime: string;
    titula_drugog_gosta?: string;
    ime_drugog_gosta?: string;
    prezime_drugog_gosta?: string;
    adresa?: string;
    grad?: string;
    drzava: string;
    email: string;
    telefon?: string;
};

const parseGostForm = (formData: FormData): GostFormValues => {
    const idRaw = formData.get('id');
    const id = idRaw != null ? Number(idRaw) : undefined;

    return {
        id: Number.isFinite(id) && id! > 0 ? id : undefined,
        titula: formData.get('titula') ? String(formData.get('titula')) : '',
        ime: formData.get('ime') ? String(formData.get('ime')) : '',
        prezime: formData.get('prezime') ? String(formData.get('prezime')) : '',
        titula_drugog_gosta: formData.get('titula_drugog_gosta') ? String(formData.get('titula_drugog_gosta')) : undefined,
        ime_drugog_gosta: formData.get('ime_drugog_gosta') ? String(formData.get('ime_drugog_gosta')) : undefined,
        prezime_drugog_gosta: formData.get('prezime_drugog_gosta') ? String(formData.get('prezime_drugog_gosta')) : undefined,
        adresa: formData.get('adresa') ? String(formData.get('adresa')) : undefined,
        grad: formData.get('grad') ? String(formData.get('grad')) : undefined,
        drzava: formData.get('drzava') ? String(formData.get('drzava')) : '',
        email: formData.get('email') ? String(formData.get('email')) : '',
        telefon: formData.get('telefon') ? String(formData.get('telefon')) : undefined
    };
};

type Lang = 'en' | 'sr';

interface GostValues extends Omit<GostFormValues, 'id'> {
    titula: string;
    ime: string;
    prezime: string;
    titula_drugog_gosta?: string;
    ime_drugog_gosta?: string;
    prezime_drugog_gosta?: string;
    adresa?: string;
    grad?: string;
    drzava: string;
    email: string;
    telefon?: string;
}

const validateGost = (lang: Lang, values: GostValues) => {
    const messages = getLocaleMessages(lang, 'gosti');
    const t = (key: string) => messages[key] || key;
    return gostSchema(t).safeParse(values);
};

const requireValidId = async (id: number | undefined, failurePath = '/gosti') => {
    if (!id) {
        redirect(createFailureRedirect(failurePath, 'errorGeneral'));
    }
};

const handleDbError = async (
    error: any,
    failurePath: string,
    revalidateOnError: string,
    logLabel: string
) => {
    console.error(logLabel, error);
    revalidatePath(revalidateOnError);
    const message = error?.code === 'P2002' ? 'errorExists' : 'errorGeneral';
    redirect(createFailureRedirect(failurePath, message));
};

export const ucitajGoste = async (search?: string) => {
    try {
        const whereClause = search ? {
            OR: [
                { ime: { contains: search, mode: 'insensitive' as const } },
                { prezime: { contains: search, mode: 'insensitive' as const } }
            ]
        } : {};

        const gost = await prisma.gost.findMany({
            where: whereClause,
            orderBy: [
                { prezime: 'asc' },
                { ime: 'asc' }
            ]
        });
        return gost;
    } catch (error) {
        console.error("Greška pri učitavanju gostiju:", error);
        return null;
    }
}

export const ucitajGostaId = async (searchParams: { gostId: number }) => {
    try {
        const gost = await prisma.gost.findUnique({
            where: { id: searchParams.gostId },
        });
        return gost;
    } catch (error) {
        console.error("Greška pri učitavanju gosta:", error);
        return null;
    }
};

export async function dodajGosta(formData: FormData) {
    const {
        titula,
        ime,
        prezime,
        titula_drugog_gosta,
        ime_drugog_gosta,
        prezime_drugog_gosta,
        adresa,
        grad,
        drzava,
        email,
        telefon
    } = parseGostForm(formData);
    const lang = await getLocale();

    const result = validateGost(lang, {
        titula,
        ime,
        prezime,
        titula_drugog_gosta,
        ime_drugog_gosta,
        prezime_drugog_gosta,
        adresa,
        grad,
        drzava,
        email,
        telefon
    });

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const formValues = {
            titula,
            ime,
            prezime,
            titula_drugog_gosta: titula_drugog_gosta || '',
            ime_drugog_gosta: ime_drugog_gosta || '',
            prezime_drugog_gosta: prezime_drugog_gosta || '',
            adresa: adresa || '',
            grad: grad || '',
            drzava,
            email,
            telefon: telefon || ''
        };
        redirect(createErrorRedirect('/gosti', errors, formValues));
    }

    try {
        await prisma.gost.create({
            data: {
                titula,
                ime,
                prezime,
                titula_drugog_gosta,
                ime_drugog_gosta,
                prezime_drugog_gosta,
                adresa,
                grad,
                drzava,
                email,
                mob_telefon: telefon
            },
        });
    } catch (error: any) {
        await handleDbError(error, '/gosti', '/gosti/dodaj', "Greška pri dodavanju gosta:");
    }

    revalidatePath('/gosti');
    redirect(createSuccessRedirect('/gosti', 'successAdded'));
}

export async function updateGost(formData: FormData) {
    const {
        id,
        titula,
        ime,
        prezime,
        titula_drugog_gosta,
        ime_drugog_gosta,
        prezime_drugog_gosta,
        adresa,
        grad,
        drzava,
        email,
        telefon
    } = parseGostForm(formData);
    const lang = await getLocale();

    await requireValidId(id, '/gosti/izmeni');

    const result = validateGost(lang, {
        titula,
        ime,
        prezime,
        titula_drugog_gosta,
        ime_drugog_gosta,
        prezime_drugog_gosta,
        adresa,
        grad,
        drzava,
        email,
        telefon
    });

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const formValues = {
            id: id!,
            titula,
            ime,
            prezime,
            titula_drugog_gosta: titula_drugog_gosta || '',
            ime_drugog_gosta: ime_drugog_gosta || '',
            prezime_drugog_gosta: prezime_drugog_gosta || '',
            adresa: adresa || '',
            grad: grad || '',
            drzava,
            email,
            telefon: telefon || ''
        };
        redirect(createErrorRedirect('/gosti/izmeni', errors, formValues));
    }

    try {
        await prisma.gost.update({
            where: { id: id! },
            data: {
                titula,
                ime,
                prezime,
                titula_drugog_gosta,
                ime_drugog_gosta,
                prezime_drugog_gosta,
                adresa,
                grad,
                drzava,
                email,
                mob_telefon: telefon
            },
        });
    } catch (error: any) {
        await handleDbError(error, '/gosti/izmeni', '/gosti/izmeni', "Greška pri izmeni gosta:");
    }

    revalidatePath('/gosti');
    redirect(createSuccessRedirect('/gosti', 'successUpdated'));
}

export async function obrisiGosta(formData: FormData) {
    const { id } = parseGostForm(formData);

    await requireValidId(id, '/gosti');

    try {
        await prisma.gost.delete({
            where: { id: id! },
        });
    } catch {
        revalidatePath('/gosti');
        redirect(createFailureRedirect('/gosti', 'errorGeneral'));
    }

    revalidatePath('/gosti');
    redirect(createSuccessRedirect('/gosti', 'successDeleted'));
}


