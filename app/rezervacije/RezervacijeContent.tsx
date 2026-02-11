/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { rascunajUkupnuCenu } from '@/lib/helpers/rezervacije';

interface RezervacijeContentProps {
  sobe: Array<{
    id: number;
    broj: string;
    tip: string;
    tip_en?: string | null;
    kapacitet: number;
    cena: number;
    slike?: string;
    opis?: string;
    opis_en?: string;
  }>;
  lang: 'en' | 'mn';
  t: any;
  rezervacije?: any[];
}

export default function RezervacijeContent({
  sobe,
  lang,
  t,
  rezervacije = []
}: RezervacijeContentProps) {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [numberOfGuestsInput, setNumberOfGuestsInput] = useState('1');

  const parseDateInput = (value: string) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map((part) => Number(part));
    if (!year || !month || !day) return null;
    const result = new Date(year, month - 1, day);
    return result;
  };

  const normalizeDate = (value: Date | string) => {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const isBlockingStatus = (status: string) => status !== 'cancelled';

  const parsedStart = parseDateInput(periodStart);
  const parsedEnd = parseDateInput(periodEnd);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isStartInPast = parsedStart && parsedStart < today;
  const isRangeValid = Boolean(parsedStart && parsedEnd && parsedEnd > parsedStart && !isStartInPast);

  const freeRooms = useMemo(() => {
    if (!parsedStart || !parsedEnd || parsedEnd <= parsedStart || isStartInPast) return [];

    const start = parsedStart;
    const end = parsedEnd;

    return sobe.filter((soba) => {
      if (soba.kapacitet < numberOfGuests) return false;

      const hasOverlap = rezervacije.some((rezervacija) => {
        if (!isBlockingStatus(rezervacija.status)) return false;
        if (rezervacija.soba?.broj !== soba.broj) return false;

        const rezStart = normalizeDate(rezervacija.datum_prijave);
        const rezEnd = normalizeDate(rezervacija.datum_odjave);

        return start < rezEnd && end > rezStart;
      });

      return !hasOverlap;
    });
  }, [parsedStart, parsedEnd, numberOfGuests, sobe, rezervacije, isStartInPast]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(lang === 'mn' ? 'me-ME' : 'en-US').format(value);

  const getBookingUrl = (roomNumber: string) => {
    const params = new URLSearchParams({
      lang,
      soba: roomNumber,
      prijava: periodStart,
      odjava: periodEnd,
      broj_osoba: numberOfGuests.toString()
    });
    return `/rezervacije/dodaj?${params.toString()}`;
  };

  return (
    <>
      {/* Full Screen Hero Banner Background */}
      <div className="relative min-h-screen w-full pt-16">
        {/* Title Section */}
        <div className="text-center text-white py-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            {lang === "mn" ? "Pronađite Svoju Idealnu sobu" : "Find Your Perfect Room"}
          </h1>
          <p className="text-lg md:text-xl font-light drop-shadow-lg max-w-2xl mx-auto">
            {lang === "mn"
              ? "Pretraži dostupne sobe i rezerviši sada"
              : "Search available rooms and book now"}
          </p>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 mb-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.start_date || t.checkin_date}
                </label>
                <Input
                  type="date"
                  value={periodStart}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(event) => {
                    setPeriodStart(event.target.value);
                    if (periodEnd && event.target.value > periodEnd) {
                      setPeriodEnd('');
                    }
                  }}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.end_date || t.checkout_date}
                </label>
                <Input
                  type="date"
                  value={periodEnd}
                  min={periodStart || undefined}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1 sm:max-w-40">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.number_of_guests_label || 'Broj osoba'}
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfGuestsInput}
                  onChange={(event) => {
                    setNumberOfGuestsInput(event.target.value);
                    const newValue = parseInt(event.target.value) || 1;
                    setNumberOfGuests(Math.max(1, Math.min(10, newValue)));
                  }}
                  onBlur={() => {
                    const newValue = parseInt(numberOfGuestsInput) || 1;
                    const validValue = Math.max(1, Math.min(10, newValue));
                    setNumberOfGuests(validValue);
                    setNumberOfGuestsInput(validValue.toString());
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="container mx-auto px-4 pb-16">
          {!periodStart || !periodEnd ? (
            <div className="text-center text-white">
              <p className="text-lg font-light drop-shadow-lg">
                {t.select_period || t.free_rooms}
              </p>
            </div>
          ) : isStartInPast ? (
              <div className="text-center text-white">
                <p className="text-lg font-light drop-shadow-lg">
                  {t.select_future_date || 'Molimo odaberite budući datum za pretragu dostupnih soba.'}
                </p>
              </div>
            ) : !isRangeValid ? (
                <div className="text-center text-white">
                  <p className="text-lg font-light drop-shadow-lg">
                    {t.invalid_period || t.checkout_date}
                  </p>
                </div>
              ) : freeRooms.length === 0 ? (
                  <div className="text-center text-white">
                    <p className="text-lg font-light drop-shadow-lg">{t.no_free_rooms}</p>
                  </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {freeRooms.map((soba) => {
                        let slikeArr: string[] = [];
                        if (Array.isArray(soba.slike)) {
                          slikeArr = soba.slike;
                        } else if (typeof soba.slike === 'string' && soba.slike) {
                          try {
                            slikeArr = JSON.parse(soba.slike);
                            if (!Array.isArray(slikeArr)) {
                              slikeArr = soba.slike.split(',').map((s: string) => s.trim()).filter(Boolean);
                            }
                          } catch {
                            slikeArr = soba.slike.split(',').map((s: string) => s.trim()).filter(Boolean);
                          }
                        }

                        return (
                          <div
                            key={soba.id}
                            className="rounded-lg bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm bg-white/95"
                          >
                            {/* Image */}
                            <div className="relative h-48 bg-gray-200 overflow-hidden">
                              {slikeArr.length > 0 ? (
                                <Image
                                  src={slikeArr[0]}
                                  alt={`${t.room} ${soba.broj}`}
                                  fill
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500">{t.no_image || "Nema slike"}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Room Number and Type */}
                      <div className="mb-3">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {t.room || "Soba"} {soba.broj}
                        </h2>
                        <p className="text-yellow-600 font-semibold">
                          {lang === "en" ? soba.tip_en || soba.tip : soba.tip}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {lang === "en" ? soba.opis_en || soba.opis : soba.opis}
                      </p>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-gray-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a1 1 0 11-2 0 1 1 0 012 0ZM9 12a1 1 0 11-2 0 1 1 0 012 0ZM10.5 1.5H5.75A2.75 2.75 0 003 4.25v11.5A2.75 2.75 0 005.75 18.5h8.5A2.75 2.75 0 0017 15.75V4.25A2.75 2.75 0 0014.25 1.5Z" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">{t.capacity || "Kapacitet"}</p>
                            <p className="font-semibold text-gray-900">{soba.kapacitet}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-500">{t.price || "Cijena"}</p>
                            <p className="font-semibold text-gray-900">€{formatPrice(soba.cena)}</p>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                        <Link href={getBookingUrl(soba.broj)}>
                          {lang === "mn" ? "Rezerviriši" : "Book Now"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
