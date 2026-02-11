/* eslint-disable @typescript-eslint/no-explicit-any */
import { ucitajSobe } from '@/actions/sobe';
import { getLocaleMessages } from '@/i18n/i18n';
import { Metadata } from 'next';
import { SuccessMessage, ErrorMessage } from '@/components/messages/MessageComponents';
import RezervacijeContent from './RezervacijeContent';

export const metadata: Metadata = {
  title: 'Rezervacije'
};

export default async function RezervacijePage({ searchParams }: { searchParams: Promise<{ lang?: string;[key: string]: string | undefined }> }) {
  const params = await searchParams;

  const rawSobe = await ucitajSobe();
  const sobe = (Array.isArray(rawSobe) ? rawSobe : []).map((s: any) => ({
    id: s.id,
    broj: s.broj,
    tip: s.tip,
    tip_en: s.tip_en,
    kapacitet: s.kapacitet,
    cena: s.cena,
    slike: s.slike,
    opis: s.opis,
    opis_en: s.opis_en
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
        sobe={sobe}
        lang={lang}
        t={t}
      />
    </>
  );
}