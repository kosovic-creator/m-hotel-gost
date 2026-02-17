/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useI18n } from '@/i18n/I18nProvider';

interface RezervacijaPlacanjeFormsProps {
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

export function RezervacijaPlacanjeForms({
  rezervacija,
  ukupnaCena,
  onPaymentSuccess,
  onCancel,
}: RezervacijaPlacanjeFormsProps) {
  const { language, t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const tr = (key: string) => t('rezervacije', key);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(language === 'sr' ? 'sr-ME' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/rezervacije/${rezervacija.id}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || tr('payment_error'));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment in our database
        try {
          const confirmResponse = await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              rezervacijaId: rezervacija.id,
            }),
          });

          if (confirmResponse.ok) {
            onPaymentSuccess?.(paymentIntent);
          } else {
            setErrorMessage(tr('payment_update_failed'));
          }
        } catch (confirmError) {
          setErrorMessage(tr('payment_update_failed'));
          console.error('Confirmation error:', confirmError);
        }
      }
    } catch {
      setErrorMessage(tr('payment_unexpected_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {tr('complete_payment')}
        </h2>
        <div className="text-3xl font-bold text-green-600 mb-4">
          {formatPrice(ukupnaCena)}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{rezervacija.gost.ime} {rezervacija.gost.prezime}</p>
          <p>{tr('room')}: {rezervacija.soba.broj}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {tr('processing_payment')}
              </>
            ) : (
                `${tr('pay_now')} ${formatPrice(ukupnaCena)}`
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {tr('cancel')}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>{tr('secure_payment')}</p>
        <div className="flex justify-center items-center mt-2 space-x-2">
          <span>🔒</span>
          <span>{tr('payment_security_ssl')}</span>
          <span>•</span>
          <span>{tr('payment_security_encryption')}</span>
        </div>
      </div>
    </div>
  );
}