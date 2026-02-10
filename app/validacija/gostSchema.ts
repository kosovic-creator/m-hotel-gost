import { z } from "zod";
export type TranslateFn = (key: string) => string;

export const gostSchema = (t: TranslateFn) => z.object({
    ime: z.string().min(2,  { message: t('ime_error') }),
    prezime: z.string().min(2, { message: t('prezime_error') }),
    email: z.string().email({ message: t('email_error') }),
    telefon: z.string().optional(),
});