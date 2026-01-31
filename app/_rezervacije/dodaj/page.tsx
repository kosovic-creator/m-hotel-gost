'use server';

import Link from 'next/link';
import { dodajSobu } from '@/actions/soba';
import { getLocaleMessages } from '@/i18n/i18n';
import SobaForm from '../components/SobaForm';

export default async function DodajPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const t = getLocaleMessages(lang, 'sobe');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 sm:px-0 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 sm:p-8 mt-8">

        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">{t.add}</h1>
        <SobaForm action={dodajSobu} mode="dodaj" lang={lang} />
      </div>
    </div>
  );
}