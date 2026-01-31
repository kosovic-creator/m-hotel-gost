import { z } from "zod";
export type TranslateFn = (key: string) => string;

export const rezervacijaSchema = (t: TranslateFn) => z.object({
  soba: z.string().min(1, { message: t("soba_error") }),
  gost: z.string().min(1, { message: t("gost_error") }),
  prijava: z.string().min(1, { message: t("datum_prijave_error") }),
  odjava: z.string().min(1, { message: t("datum_odjave_error") }),
  status: z.string().min(3, { message: t("status_error") }),

});

