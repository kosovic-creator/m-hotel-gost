/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { RezervacijaPlacanjeForms } from './RezervacijaPlacanjeForms';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface RezervacijaPlacanjeProps {
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
  ukupnaCena: number;
  lang: 'en' | 'sr';
  t: Record<string, string>;
  onPaymentSuccess?: (paymentIntent: any) => void;
  onCancel?: () => void;
}

export default function RezervacijaPlacanje({
  rezervacija,
  ukupnaCena,
  lang,
  t,
  onPaymentSuccess,
  onCancel,
}: RezervacijaPlacanjeProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(lang === 'sr' ? 'sr-ME' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);

  const handleCreatePaymentIntent = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: ukupnaCena,
          currency: 'eur',
          rezervacijaId: rezervacija.id,
          metadata: {
            guestName: `${rezervacija.gost.ime} ${rezervacija.gost.prezime}`,
            roomNumber: rezervacija.soba.broj,
            checkIn: rezervacija.prijava,
            checkOut: rezervacija.odjava,
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
    locale: lang === 'sr' ? 'hr' : 'en',
  };

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t.payment_title || 'Plaćanje Rezervacije'}
          </h2>
          <div className="text-3xl font-bold text-green-600 mb-4">
            {formatPrice(ukupnaCena)}
          </div>
          <p className="text-gray-600 text-sm">
            {t.payment_description || 'Reserved for'} {rezervacija.gost.ime} {rezervacija.gost.prezime}
          </p>
          <p className="text-gray-600 text-sm">
            {t.room}: {rezervacija.soba.broj}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCreatePaymentIntent}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading
              ? (t.processing || 'Processing...')
              : (t.proceed_to_payment || 'Proceed to Payment')
            }
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {t.cancel || 'Cancel'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <RezervacijaPlacanjeForms
        rezervacija={rezervacija}
        ukupnaCena={ukupnaCena}
        lang={lang}
        t={t}
        onPaymentSuccess={onPaymentSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}