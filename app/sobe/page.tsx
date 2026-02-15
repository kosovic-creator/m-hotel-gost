/* eslint-disable @typescript-eslint/no-explicit-any */
import { ucitajSobe } from '@/actions/sobe';
import { getLocaleMessages } from '@/i18n/i18n';
import { Metadata } from 'next';
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
  const lang: "en" | "sr" = params?.lang === "en" ? "en" : "sr";
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
      <SobeContent
        sobe={sobe}
        lang={lang}
        t={t}
      />
    </>
  );
}