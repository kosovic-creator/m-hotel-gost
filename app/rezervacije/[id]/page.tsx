import { dajDetaljeRezervacije } from '@/actions/rezervacije';
import { getLocaleMessages } from '@/i18n/i18n';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PrintButton } from '@/components/ui/print-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RezervacijaWithPayment from '@/components/rezervacije/RezervacijaWithPayment';

export const metadata: Metadata = {
  title: 'Detalji Rezervacije'
};

interface RezervacijaPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function RezervacijaPage({ params, searchParams }: RezervacijaPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const rezervacijaId = parseInt(resolvedParams.id);

  if (isNaN(rezervacijaId)) {
    notFound();
  }

  const rezervacija = await dajDetaljeRezervacije(rezervacijaId);

  if (!rezervacija) {
    notFound();
  }

  const lang: "en" | "mn" = resolvedSearchParams?.lang === "mn" ? "mn" : "en";
  const t = getLocaleMessages(lang, 'rezervacije');
  const commonT = getLocaleMessages(lang, 'common');

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 py-6 lg:py-8">
              {/* Navigation Card */}
              <Card className="mb-6 shadow-sm border-l-4 border-l-blue-500 print:hidden">
                  <CardContent className="p-4 print:hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                              <Button asChild variant="outline" size="sm">
                                  <Link href={`/rezervacije?lang=${lang}`}>
                                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                      {commonT.back || 'Nazad'}
                                  </Link>
                              </Button>
                              <div>
                                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                      {t.reservation_details || 'Detalji Rezervacije'}
                                  </h1>
                                  <p className="text-sm text-gray-500 mt-1">
                                      Rezervacija #{rezervacija.id}
                                  </p>
                              </div>
                          </div>

                          <div className="flex gap-2">
                              <PrintButton>
                                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                  </svg>
                                  {commonT.print || 'Štampaj'}
                              </PrintButton>
                              <Button asChild variant="default" size="sm">
                                  <Link href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`}>
                                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      {t.editReservation || 'Izmeni'}
                                  </Link>
                              </Button>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Main Content Card */}
              <Card className="max-w-2xl mx-auto shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg print:hidden">
                      <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                          </div>
                          <div>
                              <span className="text-lg font-semibold">
                                  {t.reservation_details || 'Detalji Rezervacije'}
                              </span>
                              <div className="text-blue-100 text-sm font-normal mt-1">
                                  {rezervacija.gost.ime} {rezervacija.gost.prezime} • Soba {rezervacija.soba.broj}
                              </div>
                          </div>
                      </CardTitle>
                  </CardHeader>

                  <CardContent className="p-0">
                      <div className="bg-white">
                          <RezervacijaWithPayment
                              rezervacija={rezervacija}
                              lang={lang}
                              t={t}
                              showPaymentOption={true}
                          />
                      </div>
                  </CardContent>
              </Card>
      </div>
    </div>
  );
}