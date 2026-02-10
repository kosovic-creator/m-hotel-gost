import { z } from "zod";
export type TranslateFn = (key: string) => string;

export const rezervacijaGostSchema = (t: TranslateFn) => z.object({
    // Rezervacija polja
    soba: z.string().min(1, { message: t('soba_error') }),
    prijava: z.string().min(1, { message: t('prijava_error') }),
    odjava: z.string().min(1, { message: t('odjava_error') }),
    broj_osoba: z.coerce.number().min(1, { message: t('broj_osoba_error') }),
    popust: z.string().optional().refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
        { message: t('popust_error') }
    ),
    status: z.string().min(1, { message: t('status_error') }),

    // Gost polja
    gost_titula: z.string().optional().default(''),
    gost_ime: z.string().min(2, { message: t('ime_error') }),
    gost_prezime: z.string().min(2, { message: t('prezime_error') }),
    gost_titula_drugog_gosta: z.string().optional(),
    gost_ime_drugog_gosta: z.string().optional(),
    gost_prezime_drugog_gosta: z.string().optional(),
    gost_adresa: z.string().optional(),
    gost_grad: z.string().optional(),
    gost_drzava: z.string().optional().default(''),
    gost_email: z.string().email({ message: t('email_error') }),
    gost_telefon: z.string().optional(),

    // Postojeći gost (opciono)
    postojeci_gost: z.string().optional(),
    koristi_postojeceg_gosta: z.boolean().default(false)
}).superRefine((data, ctx) => {
    // Ako se koristi postojeći gost, onda je postojeci_gost obavezno
    if (data.koristi_postojeceg_gosta && !data.postojeci_gost) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('postojeci_gost_error'),
            path: ['postojeci_gost']
        });
    }

    // Ako se ne koristi postojeći gost, onda su polja za novog gosta obavezna
    if (!data.koristi_postojeceg_gosta) {
        if (!data.gost_titula) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('titula_error'),
                path: ['gost_titula']
            });
        }
        if (!data.gost_ime) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('ime_error'),
                path: ['gost_ime']
            });
        }
        if (!data.gost_prezime) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('prezime_error'),
                path: ['gost_prezime']
            });
        }
        if (!data.gost_drzava) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('drzava_error'),
                path: ['gost_drzava']
            });
        }
        if (!data.gost_email) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('email_error'),
                path: ['gost_email']
            });
        }
    }

    // Validacija datuma - odjava mora biti nakon prijave
    const prijavaDate = new Date(data.prijava);
    const odjawaDate = new Date(data.odjava);

    if (odjawaDate <= prijavaDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('odjava_mora_biti_nakon_prijave'),
            path: ['odjava']
        });
    }
});