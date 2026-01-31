import { z } from "zod";
export type TranslateFn = (key: string) => string;

export const rezervacijaSchema = (t: TranslateFn) => z.object({
  soba: z.string().min(1, { message: t("soba_error") }),
  gost: z.string().min(1, { message: t("gost_error") }),
  datum_prijave: z.string().min(1, { message: t("datum_prijave_error") }),
  datum_odjave: z.string().min(1, { message: t("datum_odjave_error") }),
  broj_osoba: z.coerce.number().int().min(1, { message: t("broj_osoba_error") }),
  
});

