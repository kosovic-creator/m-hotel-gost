/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormActions } from '@/components/form/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RezervacijaDetalji, { useRezervacijaDetalji } from './RezervacijaDetalji';
import RezervacijaPlacanje from './RezervacijaPlacanje';

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
  lang: 'en' | 'mn';
  t: Record<string, string>;
  commonT?: Record<string, string>;
  showPaymentOption?: boolean;
}

import Link from 'next/link';
import { PrintButton } from '@/components/ui/print-button';

export default function RezervacijaWithPayment({
  rezervacija,
  lang,
  t,
  commonT,
  showPaymentOption = true,
}: RezervacijaWithPaymentProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const podaci = useRezervacijaDetalji(rezervacija);

  const canPay = showPaymentOption &&
                 rezervacija.status !== 'paid' &&
                 rezervacija.status !== 'cancelled' &&
                 !paymentCompleted;

  const handlePaymentSuccess = (paymentIntent: any) => {
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
        lang={lang}
        t={t}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={handleCancelPayment}
      />
    );
  }

  return (
    <>
      <RezervacijaDetalji
        rezervacija={rezervacija}
        lang={lang}
        t={t}
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
                {t.payment_completed || 'Payment Completed Successfully'}
              </div>
            </div>
          )}
          <div className="flex flex-row justify-center items-center gap-2 pt-2">
            <a href={`/rezervacije?lang=${lang}`} className="flex-1">
              <Button type="button" className="w-full h-10 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-semibold text-base hover:bg-gray-200 transition cursor-pointer print:hidden">
                {commonT?.back || 'Nazad'}
              </Button>
            </a>
            <a href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`} className="flex-1">
              <Button type="button" className="w-full h-10 rounded-lg border bg-gray-700 text-white font-semibold text-base hover:bg-gray-800 transition cursor-pointer print:hidden">
                {t.editReservation || 'Izmeni rezervaciju'}
              </Button>
            </a>
            <PrintButton className="flex-1 w-full h-10 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 font-semibold text-base hover:bg-gray-200 transition cursor-pointer print:hidden">
              <span className="inline-flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {commonT?.print || 'Štampaj'}
              </span>
            </PrintButton>
            {canPay && (
              <Button
                onClick={() => setShowPayment(true)}
                className="flex-1 h-10 rounded-lg border border-green-600 bg-green-600 text-white font-semibold text-base hover:bg-green-700 transition cursor-pointer print:hidden"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {t.pay_now || 'Pay Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}