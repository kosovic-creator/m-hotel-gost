'use client';

import { dajPodatkeORezervaciji } from '@/lib/helpers/rezervacije';
import PaymentStatusBadge from './PaymentStatusBadge';
import { useI18n } from '@/i18n/I18nProvider';

interface RezervacijaDetaljiProps {
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
}

export default function RezervacijaDetalji({ rezervacija }: RezervacijaDetaljiProps) {
  const { language, t } = useI18n();
  const tr = (key: string) => t('rezervacije', key);
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(language === 'sr' ? 'sr-ME' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);

  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date);

    if (language === 'sr') {
    // Custom formatting for Serbian Latin script
      const monthsLatinFull = [
        'januar', 'februar', 'mart', 'april', 'maj', 'juni',
        'juli', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
      ];

      const day = dateObj.getDate();
      const month = monthsLatinFull[dateObj.getMonth()];
      const year = dateObj.getFullYear();

      return `${day}. ${month} ${year}.`;
    }

    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const prijava = new Date(rezervacija.prijava);
  const odjava = new Date(rezervacija.odjava);

  const podaci = dajPodatkeORezervaciji({
    prijava,
    odjava,
    popust: rezervacija.popust,
    soba: rezervacija.soba
  });

  return (
    <div className="p-6">
      {/* Header već je u Card header-u, ne treba duplirat */}
      {/* <div className="text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {t.reservation_details || 'Detalji Rezervacije'}
        </h2>
        <p className="text-gray-600">#{rezervacija.id}</p>
      </div> */}

      {/* Osnovni podaci */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">{tr('guest_name')}:</span>
          <span className="font-medium">{rezervacija.gost.ime} {rezervacija.gost.prezime}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">{tr('room')}:</span>
          <span className="font-medium">{rezervacija.soba.broj}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">{tr('check_in')}:</span>
          <span className="font-medium">{formatDate(prijava)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">{tr('check_out')}:</span>
          <span className="font-medium">{formatDate(odjava)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">{tr('broj_dana')}:</span>
          <span className="font-medium">{podaci.brojDana}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">{tr('number_of_guests_label')}:</span>
          <span className="font-medium">{rezervacija.broj_osoba}</span>
        </div>
      </div>

      {/* Računanje cene */}
      <div className="border-t pt-4 space-y-2">
        <h3 className="font-semibold text-gray-900 mb-3">{tr('price_breakdown')}</h3>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{tr('cena_po_danu')}:</span>
          <span>{formatPrice(podaci.cenaPoDanu)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{tr('broj_dana')}:</span>
          <span>{podaci.brojDana}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{tr('osnovna_cena')}:</span>
          <span>{formatPrice(podaci.osnovnaCena)}</span>
        </div>

        {podaci.popustProcenat > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{tr('popust')} ({podaci.popustProcenat}%):</span>
              <span className="text-red-600">-{formatPrice(podaci.iznosPopusta)}</span>
            </div>
          </>
        )}

        <div className="border-t pt-2 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span className="text-gray-900">{tr('ukupna_cena')}:</span>
            <span className="text-green-600">{formatPrice(podaci.ukupnaCena)}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-6 pt-4 border-t">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">{tr('status')}:</p>
          <PaymentStatusBadge
            status={rezervacija.status || 'pending'}
          />
        </div>
      </div>
    </div>
  );
}

// Hook/funkcija za korišćenje van komponente
export function useRezervacijaDetalji(rezervacija: {
    prijava: Date | string;
    odjava: Date | string;
    popust?: number;
    soba: { cena: number };
} | null) {
  if (!rezervacija) return null;

  const prijava = new Date(rezervacija.prijava);
  const odjava = new Date(rezervacija.odjava);

  return dajPodatkeORezervaciji({
    prijava,
    odjava,
    popust: rezervacija.popust || 0,
    soba: rezervacija.soba
  });
}