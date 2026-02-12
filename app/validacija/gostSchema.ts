import { z } from "zod";
export type TranslateFn = (key: string) => string;

export const gostSchema = (t: TranslateFn) => z.object({
    titula: z.string().min(1, { message: t('titula_error') }),
    ime: z.string().min(2,  { message: t('ime_error') }),
    prezime: z.string().min(2,  { message: t('prezime_error') }),
    titula_drugog_gosta: z.string().optional(),
    ime_drugog_gosta: z.string().optional(),
    prezime_drugog_gosta: z.string().optional(),
    adresa: z.string().optional(),
    grad: z.string().optional(),
    drzava: z.string().min(1, { message: t('drzava_error') }),
    email: z.string().email({ message: t('email_error') }),
    telefon: z.string().optional(),
});