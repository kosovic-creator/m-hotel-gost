/* eslint-disable @typescript-eslint/no-explicit-any */
import { ucitajSobe, obrisiSobu } from '@/actions/sobe';
import { getLocaleMessages } from '@/i18n/i18n';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { SuccessMessage, ErrorMessage } from '@/components/messages/MessageComponents';
import SobeContent from './SobeContent';

export const metadata: Metadata = {
  title: 'Sobe'
};

export default async function SobeStrana({ searchParams }: { searchParams: Promise<{ lang?: string;[key: string]: string | undefined }> }) {
  const rawSobe = await ucitajSobe();
  const sobe = (Array.isArray(rawSobe) ? rawSobe : []).map((s: any) => ({
    ...s,
    slike: s.slike ?? ''
  }));

  const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const t = getLocaleMessages(lang, 'sobe');
  const successParam = params.success;
  const errorParam = params.error;

  return (
    <>
      {successParam && (
        <SuccessMessage message={successParam} />
      )}
      {errorParam && (
        <ErrorMessage message={errorParam} />
      )}
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">{t.rooms}</h1>
          <Button asChild className="w-full sm:w-auto">
            <a href={`/sobe/dodaj?lang=${lang}`}>{t.add}</a>
          </Button>
        </div>

        <SobeContent
          sobe={sobe}
          lang={lang}
          t={t}
          obrisiSobu={obrisiSobu}
        />
      </div>
    </>
  );
}