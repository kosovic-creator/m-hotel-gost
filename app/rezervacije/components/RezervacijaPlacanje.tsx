/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { RezervacijaPlacanjeForms } from './RezervacijaPlacanjeForms';
import { useI18n } from '@/i18n/I18nProvider';

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
  onPaymentSuccess?: (paymentIntent: any) => void;
  onCancel?: () => void;
}

export default function RezervacijaPlacanje({
  rezervacija,
  ukupnaCena,
  onPaymentSuccess,
  onCancel,
}: RezervacijaPlacanjeProps) {
  const { language, t } = useI18n();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const tr = (key: string) => t('rezervacije', key);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(language === 'sr' ? 'sr-ME' : 'en-US', {
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
      setError(err instanceof Error ? err.message : tr('payment_generic_error'));
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
    locale: language === 'sr' ? 'hr' : 'en',
  };

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {tr('payment_title')}
          </h2>
          <div className="text-3xl font-bold text-green-600 mb-4">
            {formatPrice(ukupnaCena)}
          </div>
          <p className="text-gray-600 text-sm">
            {tr('payment_description')} {rezervacija.gost.ime} {rezervacija.gost.prezime}
          </p>
          <p className="text-gray-600 text-sm">
            {tr('room')}: {rezervacija.soba.broj}
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
              ? tr('processing')
              : tr('proceed_to_payment')
            }
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {tr('cancel')}
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
        onPaymentSuccess={onPaymentSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}