/* eslint-disable @typescript-eslint/no-explicit-any */
import { dodajRezervacijuSaGostom } from '@/actions/rezervacije';
import { FormWrapper, InputField, HiddenField, SelectField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import prisma from '@/lib/prisma';
import DodajRezervacijuClient from './DodajRezervacijuClient';
import { getFieldValue } from '@/lib/formHelpers';

interface DodajRezervacijuPageProps {
  searchParams: Record<string, any>;
}

export default async function DodajRezervacijuPage({ searchParams }: DodajRezervacijuPageProps) {
  const params = await searchParams;
  const lang = params?.lang === 'mn' ? 'mn' : 'en';
  const messages = getLocaleMessages(lang, 'rezervacije');
  const gostMessages = getLocaleMessages(lang, 'gosti');
  const commonMessages = getLocaleMessages(lang, 'common');

  // Temporary stub for errors to fix reference error
  const errors: Record<string, any> = {};

  const sobe = await prisma.soba.findMany();
  const gosti = await prisma.gost.findMany();

  // NEMA FormWrapper ovdje!
  return (
    <DodajRezervacijuClient
      params={params}
      lang={lang}
      messages={messages}
      gostMessages={gostMessages}
      commonMessages={commonMessages}
      sobe={sobe}
      gosti={gosti}
    />
  );
}