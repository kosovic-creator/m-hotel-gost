/* eslint-disable @typescript-eslint/no-explicit-any */
import { ucitajRezervacije } from '@/actions/rezervacije';
import ObavještenjeUspjeha from '../components/ObavještenjeUspjeha';
import { getLocaleMessages } from '@/i18n/i18n';
import RezervacijeTable from './components/RezervacijeTable';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Rezervacije'
};
export default async function SobeStrana({ searchParams }: { searchParams: Promise<{ lang?: string;[key: string]: string | undefined }> }) {
  const rawRezervacije = await ucitajRezervacije();
  const rezervacije = (rawRezervacije ?? []).map((r: any) => ({
    ...r,
    soba: r.soba || {}, // Provide default or fetch related data as needed
    gost: r.gost || {},
    datum_prijave: r.prijava,
    datum_odjave: r.odjava,
    broj_osoba: r.broj_osoba || 1 // Provide a sensible default or fetch as needed
  }));
  const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const t = getLocaleMessages(lang, 'rezervacije');
  const successParam = params.success;
  const errorParam = params.error;

  return (
    <>
      {successParam && (
        <ObavještenjeUspjeha message={successParam} type="success" />
      )}

      {
        errorParam && (
          <ObavještenjeUspjeha message={errorParam} type="error" />
        )
      }
      <div className="container mx-auto py-4 px-2 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">{t.title}</h1>
        <div className="overflow-x-auto rounded-md shadow-sm bg-white p-2 sm:p-4">
          <RezervacijeTable rezervacije={rezervacije || []} />
        </div>
      </div>
    </>

  );
}