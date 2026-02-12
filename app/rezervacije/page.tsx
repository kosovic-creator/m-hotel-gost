/* eslint-disable @typescript-eslint/no-explicit-any */
import { ucitajRezervacije } from '@/actions/rezervacije';
import { ucitajSobe } from '@/actions/sobe';
import { obrisiRezervaciju } from '@/actions/rezervacije';
import { getLocaleMessages } from '@/i18n/i18n';
import { Metadata } from 'next';
import { SuccessMessage, ErrorMessage } from '@/components/messages/MessageComponents';
import RezervacijeContent from './RezervacijeContent';

export const metadata: Metadata = {
  title: 'Rezervacije'
};

export default async function RezervacijePage({ searchParams }: { searchParams: Promise<{ lang?: string; search?: string;[key: string]: string | undefined }> }) {
  const params = await searchParams;
  const search = params.search || '';

  const rawRezervacije = await ucitajRezervacije(search);
  const rawSobe = await ucitajSobe();
  const rezervacije = (rawRezervacije ?? []).map((r: any) => ({
    ...r,
    soba: r.soba || {},
    gost: r.gost || {},
    datum_prijave: r.prijava,
    datum_odjave: r.odjava,
    broj_osoba: r.broj_osoba || 1
  }));

  const sobe = (Array.isArray(rawSobe) ? rawSobe : []).map((s: any) => ({
    id: s.id,
    broj: s.broj,
    tip: s.tip,
    tip_en: s.tip_en,
    kapacitet: s.kapacitet,
    cena: s.cena,
    slike: s.slike, // <-- dodaj ovo!
    opis: s.opis,
    opis_en: s.opis_en,
  }));

  const rawGosti = (rawRezervacije ?? []).map((r: any) => r.gost);
  const gosti = rawGosti.map((g: any) => ({
    id: g.id,
    ime: g.ime,
    prezime: g.prezime,
    email: g.email,
    telefon: g.mob_telefon, // <-- dodaj ovo!
  // ...ostala polja...
  }));

  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const t = getLocaleMessages(lang, 'rezervacije');
  const successParam = params.success;
  const errorParam = params.error;

  return (
    <>
      {successParam && (
        <SuccessMessage message={successParam} namespace="rezervacije" />
      )}
      {errorParam && (
        <ErrorMessage message={errorParam} namespace="rezervacije" autoClose={false} />
      )}
      <RezervacijeContent
        rezervacije={rezervacije}
        sobe={sobe}
        lang={lang}
        t={t}
      />
    </>
  );
}