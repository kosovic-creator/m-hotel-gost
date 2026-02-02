/**
 * Tipovi za search parametre stranica
 */

// Tipovi za sobe
export type SobaFormErrors = {
  brojError?: string;
  tipError?: string;
  kapacitetError?: string;
  cenaError?: string;
  opisError?: string;
  slikeError?: string;
  tip_enError?: string;
  opis_enError?: string;
};

export type SobaFormData = {
  broj?: string;
  tip?: string;
  kapacitet?: string;
  cena?: string;
  opis?: string;
  slike?: string;
  tip_en?: string;
  opis_en?: string;
};

export type SobaSearchParams = SobaFormErrors & SobaFormData & {
  lang?: string;
  sobaId?: string;
  success?: string;
  error?: string;
};

// Tipovi za rezervacije
export type RezervacijaFormErrors = {
  gostError?: string;
  sobaError?: string;
  prijavaError?: string;
  odjavaError?: string;
  statusError?: string;
};

export type RezervacijaFormData = {
  gost?: string;
  soba?: string;
  prijava?: string;
  odjava?: string;
  status?: string;
};

export type RezervacijaSearchParams = RezervacijaFormErrors & RezervacijaFormData & {
  lang?: string;
  id?: string;
  success?: string;
  error?: string;
};

// Zajednički tip za lang
export type Lang = "en" | "mn";

// Helper tip za sve search params
export type BaseSearchParams = {
  lang?: string;
  success?: string;
  error?: string;
  [key: string]: string | undefined;
};
