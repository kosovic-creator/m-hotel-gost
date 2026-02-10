/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from '@/lib/prisma';
import { getLocaleMessages } from '@/i18n/i18n';
import { createErrorRedirect, createFailureRedirect, createSuccessRedirect } from '@/lib/formHelpers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { gostSchema } from '@/app/validacija/gostSchema'; // Adjust path to match your project structure

type GostFormValues = {
    id?: number;
    ime: string;
    prezime: string;
    email: string;
    telefon?: string;
};

const getLang = (formData: FormData) => {
    const lang = formData.get('lang');
    return lang === 'en' ? 'en' : 'mn';
};

const parseGostForm = (formData: FormData): GostFormValues => {
    const idRaw = formData.get('id');
    const id = idRaw != null ? Number(idRaw) : undefined;

    return {
        id: Number.isFinite(id) && id! > 0 ? id : undefined,
        ime: formData.get('ime') ? String(formData.get('ime')) : '',
        prezime: formData.get('prezime') ? String(formData.get('prezime')) : '',
        email: formData.get('email') ? String(formData.get('email')) : '',
        telefon: formData.get('telefon') ? String(formData.get('telefon')) : undefined
    };
};

type Lang = 'en' | 'mn';

interface GostValues extends Omit<GostFormValues, 'id'> {
    ime: string;
    prezime: string;
    email: string;
    telefon?: string;
}

const validateGost = (lang: Lang, values: GostValues) => {
    const messages = getLocaleMessages(lang, 'gosti');
    const t = (key: string) => messages[key] || key;
    return gostSchema(t).safeParse(values);
};

const requireValidId = (id: number | undefined, lang: Lang, failurePath = '/gosti') => {
    if (!id) {
        redirect(createFailureRedirect(failurePath, 'errorGeneral', lang));
    }
};

const handleDbError = (
    error: any,
    lang: Lang,
    failurePath: string,
    revalidateOnError: string,
    logLabel: string
) => {
    console.error(logLabel, error);
    revalidatePath(revalidateOnError);
    const message = error?.code === 'P2002' ? 'errorExists' : 'errorGeneral';
    redirect(createFailureRedirect(failurePath, message, lang));
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
        ime,
        prezime,
        email,
        telefon
    } = parseGostForm(formData);
    const lang = getLang(formData);

    const result = validateGost(lang, {
        ime,
        prezime,
        email,
        telefon
    });

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const formValues = {
            ime,
            prezime,
            email,
            telefon: telefon || ''
        };
        redirect(createErrorRedirect('/gosti', errors, formValues, lang));
    }

    try {
        await prisma.gost.create({
            data: {
                ime,
                prezime,
                email,
                telefon: telefon || undefined
            },
        });
    } catch (error: any) {
        handleDbError(error, lang, '/gosti', '/gosti/dodaj', "Greška pri dodavanju gosta:");
    }

    revalidatePath('/gosti');
    redirect(createSuccessRedirect('/gosti', 'successAdded', lang));
}

export async function updateGost(formData: FormData) {
    const {
        id,
        ime,
        prezime,
        email,
        telefon
    } = parseGostForm(formData);
    const lang = getLang(formData);

    requireValidId(id, lang, '/gosti/izmeni');

    const result = validateGost(lang, {
        ime,
        prezime,
        email,
        telefon
    });

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const formValues = {
            id: id!,
            ime,
            prezime,
            email,
            telefon: telefon || ''
        };
        redirect(createErrorRedirect('/gosti/izmeni', errors, formValues, lang));
    }

    try {
        await prisma.gost.update({
            where: { id: id! },
            data: {
                ime,
                prezime,
                email,
                telefon: telefon || undefined
            },
        });
    } catch (error: any) {
        handleDbError(error, lang, '/gosti/izmeni', '/gosti/izmeni', "Greška pri izmeni gosta:");
    }

    revalidatePath('/gosti');
    redirect(createSuccessRedirect('/gosti', 'successUpdated', lang));
}

export async function obrisiGosta(formData: FormData) {
    const { id } = parseGostForm(formData);
    const lang = getLang(formData);

    requireValidId(id, lang, '/gosti');

    try {
        await prisma.gost.delete({
            where: { id: id! },
        });
    } catch {
        revalidatePath('/gosti');
        redirect(createFailureRedirect('/gosti', 'errorGeneral', lang));
    }

    revalidatePath('/gosti');
    redirect(createSuccessRedirect('/gosti', 'successDeleted', lang));
}


