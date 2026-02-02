/* eslint-disable @typescript-eslint/no-explicit-any */
import { ucitajRezervacije } from '@/actions/rezervacije';
import { obrisiRezervaciju } from '@/actions/rezervacije';
import { getLocaleMessages } from '@/i18n/i18n';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { SuccessMessage, ErrorMessage } from '@/components/messages/MessageComponents';
export const metadata: Metadata = {
  title: 'Rezervacije'
};
export default async function RezervacijePage({ searchParams }: { searchParams: Promise<{ lang?: string;[key: string]: string | undefined }> }) {
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
        <SuccessMessage message={successParam} namespace="rezervacije" />
      )}
      {errorParam && (
        <ErrorMessage message={errorParam} namespace="rezervacije" />
      )}
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">{t.title}</h1>
          <Link href={`/rezervacije/dodaj?lang=${lang}`}>
            <Button size="lg" className="w-full sm:w-auto">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.book_now}
            </Button>
          </Link>
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">ID</TableHead>
                <TableHead className="text-center">{t.guest_name}</TableHead>
                <TableHead className="text-center">{t.room}</TableHead>
                <TableHead className="text-center">{t.checkin_date}</TableHead>
                <TableHead className="text-center">{t.checkout_date}</TableHead>
                <TableHead className="text-center">{t.number_of_guests_label}</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-40 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rezervacije.map((rezervacija: any) => (
                <TableRow key={rezervacija.id}>
                  <TableCell className="text-center font-mono">{rezervacija.id}</TableCell>
                  <TableCell className="text-center">{rezervacija.gost?.ime} {rezervacija.gost?.prezime}</TableCell>
                  <TableCell className="text-center">{rezervacija.soba?.broj}</TableCell>
                  <TableCell className="text-center">{rezervacija.datum_prijave ? new Date(rezervacija.datum_prijave).toISOString().slice(0, 10) : ''}</TableCell>
                  <TableCell className="text-center">{rezervacija.datum_odjave ? new Date(rezervacija.datum_odjave).toISOString().slice(0, 10) : ''}</TableCell>
                  <TableCell className="text-center">{rezervacija.broj_osoba}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(rezervacija.status)}`}>
                      {rezervacija.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button asChild variant="secondary" size="sm" aria-label={t.editReservation} title={t.editReservation}>
                        <a href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                      </Button>
                      <form action={obrisiRezervaciju}>
                        <input type="hidden" name="id" value={rezervacija.id} />
                        <input type="hidden" name="lang" value={lang} />
                        <Button type="submit" variant="destructive" size="sm" aria-label={t.removeReservation} title={t.removeReservation}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Mobile cards */}
        <div className="flex flex-col gap-4 sm:hidden">
          {rezervacije.map((rezervacija: any) => (
            <div key={rezervacija.id} className="rounded-lg border bg-card shadow-sm p-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-semibold">{t.guest_name}:</span>
                <span>{rezervacija.gost?.ime} {rezervacija.gost?.prezime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.room}:</span>
                <span>{rezervacija.soba?.broj}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.checkin_date}:</span>
                <span>{rezervacija.datum_prijave ? new Date(rezervacija.datum_prijave).toISOString().slice(0, 10) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.checkout_date}:</span>
                <span>{rezervacija.datum_odjave ? new Date(rezervacija.datum_odjave).toISOString().slice(0, 10) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.number_of_guests_label}:</span>
                <span>{rezervacija.broj_osoba}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.status}:</span>
                <span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(rezervacija.status)}`}>
                    {rezervacija.status}
                  </span>
                </span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <Link href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm" aria-label={t.editReservation} title={t.editReservation}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </Link>
                <form action={obrisiRezervaciju} className="flex-1">
                  <input type="hidden" name="id" value={rezervacija.id} />
                  <input type="hidden" name="lang" value={lang} />
                  <Button type="submit" variant="destructive" className="w-full" size="sm" aria-label={t.removeReservation} title={t.removeReservation}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}