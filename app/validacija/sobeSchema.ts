import { z } from "zod";
export type TranslateFn = (key: string) => string;

export const sobaSchema = (t: TranslateFn) => z.object({
  broj: z.string().min(1, { message: t("broj_error") }),
  tip: z.string().min(1, { message: t("tip_error") }),
  kapacitet: z.coerce.number().int().min(1, { message: t("kapacitet_error") }),
  cena: z.coerce.number().min(0, { message: t("cena_error") }),
  opis: z.string().min(1, { message: t("opis_error") }),
  slike: z.array(z.string()).min(1, { message: t("slike_error") }),
  tip_en: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.string().min(1, { message: t("tip_en_error") }).optional()
  ),
  opis_en: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.string().min(1, { message: t("opis_en_error") }).optional()
  ),
});