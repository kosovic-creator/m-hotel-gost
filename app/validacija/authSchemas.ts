import { z } from "zod";
export type TranslateFn = (key: string) => string;

export const loginSchema  = (t: TranslateFn) => z.object({
  email: z.string().email({ message: t('login.email_error') }),
  lozinka: z.string().min(6, { message: t('login.password_error') }),
});

export const registerSchema  = (t: TranslateFn) => z.object({
  ime: z.string().min(2,  { message: t('register.name_error') }),
  email: z.string().email({ message: t('register.email_error') }),
  lozinka: z.string().min(6, { message: t('register.password_error') }),
  potvrdaLozinke: z.string().min(6, { message: t('register.password_confirmation_error') }),
}).refine((data) => data.lozinka === data.potvrdaLozinke, {
  message: t('register.passwords_do_not_match'),
  path: ["potvrdaLozinke"],
});

// Dodaj i druge auth šeme po potrebi