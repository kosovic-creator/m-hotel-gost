/* eslint-disable @typescript-eslint/no-explicit-any */
import { ucitajRezervacije } from '@/actions/rezervacije';
import { obrisiRezervaciju } from '@/actions/rezervacije';
import ObavještenjeUspjeha from '../components/ObavještenjeUspjeha';
import { getLocaleMessages } from '@/i18n/i18n';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rezervacije'
};

export default async function SobeStrana({ searchParams }: { searchParams: Promise<{ lang?: string;[key: string]: string | undefined }> }) {
  const rawRezervacije = await ucitajRezervacije();
  const rezervacije = (rawRezervacije ?? []).map((r: any) => ({
    ...r,
    soba: r.soba || {},
    gost: r.gost || {},
    datum_prijave: r.prijava,
    datum_odjave: r.odjava,
    broj_osoba: r.broj_osoba || 1
  }));
  const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const t = getLocaleMessages(lang, 'rezervacije');
  const successParam = params.success;
  const errorParam = params.error;

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(lang === 'mn' ? 'sr-Latn-ME' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'POTVRDJENO': 'bg-green-100 text-green-800 border-green-200',
      'NA_CEKANJU': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'OTKANZANO': 'bg-red-100 text-red-800 border-red-200',
      'ZAVRSENO': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <>
      {successParam && (
        <ObavještenjeUspjeha message={successParam} type="success" />
      )}
      {errorParam && (
        <ObavještenjeUspjeha message={errorParam} type="error" />
      )}

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {t.title}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {rezervacije.length === 0
                  ? lang === 'mn' ? 'Nema aktivnih rezervacija' : 'No active reservations'
                  : `${rezervacije.length} ${rezervacije.length === 1 ? (lang === 'mn' ? 'rezervacija' : 'reservation') : (lang === 'mn' ? 'rezervacija' : 'reservations')}`
                }
              </p>
            </div>
            <Link href={`/rezervacije/dodaj?lang=${lang}`}>
              <Button size="lg" className="w-full sm:w-auto">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.addReservation}
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableHead className="w-20 text-center font-semibold">ID</TableHead>
                <TableHead className="font-semibold">{t.guest_name}</TableHead>
                <TableHead className="text-center font-semibold">{t.room}</TableHead>
                <TableHead className="text-center font-semibold">{t.checkin_date}</TableHead>
                <TableHead className="text-center font-semibold">{t.checkout_date}</TableHead>
                <TableHead className="text-center font-semibold">{t.number_of_guests_label}</TableHead>
                <TableHead className="text-center font-semibold">Status</TableHead>
                <TableHead className="text-center font-semibold w-48">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rezervacije.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                    {lang === 'mn' ? 'Nema rezervacija za prikaz' : 'No reservations to display'}
                  </TableCell>
                </TableRow>
              ) : (
                rezervacije.map((rezervacija: any) => (
                  <TableRow key={rezervacija.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <TableCell className="text-center font-mono text-sm text-gray-600 dark:text-gray-400">
                      #{rezervacija.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                          {rezervacija.gost?.ime?.[0]}{rezervacija.gost?.prezime?.[0]}
                        </div>
                        <span>{rezervacija.gost?.ime} {rezervacija.gost?.prezime}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        {rezervacija.soba?.broj || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatDate(rezervacija.datum_prijave)}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatDate(rezervacija.datum_odjave)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {rezervacija.broj_osoba}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(rezervacija.status)}`}>
                        {rezervacija.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`}>
                          <Button variant="outline" size="sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        </Link>
                        <form action={obrisiRezervaciju}>
                          <input type="hidden" name="id" value={rezervacija.id} />
                          <input type="hidden" name="lang" value={lang} />
                          <Button type="submit" variant="destructive" size="sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-4 md:hidden">
          {rezervacije.length === 0 ? (
            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {lang === 'mn' ? 'Nema rezervacija za prikaz' : 'No reservations to display'}
              </p>
            </div>
          ) : (
            rezervacije.map((rezervacija: any) => (
              <div key={rezervacija.id} className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {rezervacija.gost?.ime?.[0]}{rezervacija.gost?.prezime?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {rezervacija.gost?.ime} {rezervacija.gost?.prezime}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: #{rezervacija.id}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(rezervacija.status)}`}>
                      {rezervacija.status}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {t.room}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {rezervacija.soba?.broj || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t.checkin_date}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {formatDate(rezervacija.datum_prijave)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t.checkout_date}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {formatDate(rezervacija.datum_odjave)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {t.number_of_guests_label}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {rezervacija.broj_osoba}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  <Link href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {t.editReservation}
                    </Button>
                  </Link>
                  <form action={obrisiRezervaciju} className="flex-1">
                    <input type="hidden" name="id" value={rezervacija.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <Button type="submit" variant="destructive" className="w-full" size="sm">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t.removeReservation}
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}