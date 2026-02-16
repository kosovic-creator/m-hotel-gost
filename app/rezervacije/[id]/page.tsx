import { dajDetaljeRezervacije } from '@/actions/rezervacije';
import { getLocaleMessages } from '@/i18n/i18n';
import { getLocale } from '@/i18n/locale';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RezervacijaWithPayment from '../components/RezervacijaWithPayment';
import { SuccessMessage } from '@/components/messages/MessageComponents';

export const metadata: Metadata = {
  title: 'Detalji Rezervacije'
};

interface RezervacijaPageProps {
  params: Promise<{ id: string }>;
    searchParams: Promise<{ success?: string }>;
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

    const lang = await getLocale();
  const t = await getLocaleMessages(lang, 'rezervacije');
  const commonT = await getLocaleMessages(lang, 'common');
    const successKey = resolvedSearchParams?.success;
    const successMessage = successKey ? (t[successKey] || commonT.success_general || successKey) : null;

  return (
      <div className="min-h-screen">
          {successMessage && <SuccessMessage message={successMessage} position="fixed" rawMessage={true} />}
          <div className="container mx-auto px-4 py-6 lg:py-8">
              <Card className="max-w-2xl mx-auto shadow-lg">
                  <CardHeader className="bg-linear-to-r from-gray-600 to-gray-400 text-white rounded-t-lg print:hidden">
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
                                  {rezervacija.gost.ime} {rezervacija.gost.prezime} • Soba {rezervacija.soba.broj} • #{rezervacija.id}
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
                              commonT={commonT}
                              showPaymentOption={true}
                          />
                      </div>
                  </CardContent>
              </Card>
      </div>
    </div>
  );
}