import { z } from "zod";
export type TranslateFn = (key: string) => string;

export const rezervacijaSchema = (t: TranslateFn) => z.object({
  soba: z.string().min(1, { message: t("soba_error") }),
  gost: z.string().min(1, { message: t("gost_error") }),
  prijava: z.string().min(1, { message: t("datum_prijave_error") }).refine(
    (val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    { message: t("past_date_error") }
  ),
  odjava: z.string().min(1, { message: t("datum_odjave_error") }),
  broj_osoba: z.string().min(1, { message: t("broj_osoba_error") }).refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 1,
    { message: t("broj_osoba_error") }
  ),
  popust: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
    { message: t("popust_error") }
  ),
  status: z.string().min(3, { message: t("status_error") }),
});

