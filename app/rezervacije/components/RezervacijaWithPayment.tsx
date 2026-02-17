'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import RezervacijaDetalji, { useRezervacijaDetalji } from './RezervacijaDetalji';
import RezervacijaPlacanje from './RezervacijaPlacanje';
import { useI18n } from '@/i18n/I18nProvider';
import Link from 'next/link';

interface RezervacijaWithPaymentProps {
  rezervacija: {
    id: number;
    prijava: Date | string;
    odjava: Date | string;
    popust: number;
    broj_osoba: number;
    status: string;
    soba: { cena: number; broj: string };
    gost: { ime: string; prezime: string };
  };
  showPaymentOption?: boolean;
}

import { PrintButton } from '@/components/ui/print-button';

export default function RezervacijaWithPayment({
  rezervacija,
  showPaymentOption = true,
}: RezervacijaWithPaymentProps) {
  const { t } = useI18n();
  const trRez = (key: string) => t('rezervacije', key);
  const trCommon = (key: string) => t('common', key);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const podaci = useRezervacijaDetalji(rezervacija);

  const canPay = showPaymentOption &&
                 rezervacija.status !== 'paid' &&
                 rezervacija.status !== 'cancelled' &&
                 !paymentCompleted;

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    setShowPayment(false);
    // Optionally refresh the page or update state
    // window.location.reload();
  };

  const handleCancelPayment = () => {
    setShowPayment(false);
  };

  if (showPayment && podaci) {
    return (
      <RezervacijaPlacanje
        rezervacija={rezervacija}
        ukupnaCena={podaci.ukupnaCena}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={handleCancelPayment}
      />
    );
  }

  return (
    <>
      <RezervacijaDetalji
        rezervacija={rezervacija}
      />

      {/* Payment Actions & Navigation Actions */}
      <div className="px-2 pb-2 border-t bg-gray-50">
        <div className="pt-2">
          {paymentCompleted && (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {trRez('payment_completed')}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-2 md:flex md:flex-row md:justify-center md:items-center">
            <Link href="/rezervacije" className="w-full md:flex-1">
              <Button type="button" className="w-full h-10 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-semibold text-sm md:text-base hover:bg-gray-200 transition cursor-pointer print:hidden">
                {trCommon('back')}
              </Button>
            </Link>
            <Link href={`/rezervacije/izmeni?id=${rezervacija.id}`} className="w-full md:flex-1">
              <Button type="button" className="w-full h-10 rounded-lg border bg-gray-700 text-white font-semibold text-sm md:text-base hover:bg-gray-800 transition cursor-pointer print:hidden">
                {trRez('editReservation')}
              </Button>
            </Link>
            <div className="w-full md:flex-1">
              <PrintButton className="w-full h-10 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-semibold text-sm md:text-base hover:bg-gray-200 transition cursor-pointer print:hidden">
                <span className="inline-flex items-center">
                  <svg className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  {trCommon('print')}
                </span>
              </PrintButton>
            </div>
            {canPay && (
              <div className="w-full md:flex-1">
                <Button
                  onClick={() => setShowPayment(true)}
                  className="w-full h-10 rounded-lg border border-green-600 bg-green-600 text-white font-semibold text-sm md:text-base hover:bg-green-700 transition cursor-pointer print:hidden"
                >
                  <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {trRez('pay_now')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}