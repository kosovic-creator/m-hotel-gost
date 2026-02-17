/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';

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
  rezervacije?: any[];
}

export default function RezervacijeContent({
  sobe,
  rezervacije = []
}: RezervacijeContentProps) {
  const { language, t } = useI18n();
  const tr = (key: string) => t('rezervacije', key);
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
    new Intl.NumberFormat(language === 'sr' ? 'sr-ME' : 'en-US').format(value);

  const getBookingUrl = (roomNumber: string) => {
    const params = new URLSearchParams({
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
        {/* Title Section with gradient overlay */}
        <div className="relative py-16 px-4 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
          <div className="relative z-20 text-center text-white max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-2 bg-amber-500/20 rounded-full border border-amber-400/50 backdrop-blur-sm">
              <span className="text-sm font-semibold text-amber-200">{tr('special_offers')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
              {tr('hero_title')}
            </h1>
            <p className="text-lg md:text-xl font-light drop-shadow-lg max-w-2xl mx-auto text-gray-100">
              {tr('hero_subtitle')}
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 mb-20 -mt-8 relative z-30">
          <div className="bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {tr('search_title')}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-5 sm:items-end">
              {/* Check-in Date */}
              <div className="group">
                <label htmlFor="checkin" className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {tr('start_date')} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="checkin"
                  type="date"
                  value={periodStart}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(event) => {
                    setPeriodStart(event.target.value);
                    if (periodEnd && event.target.value > periodEnd) {
                      setPeriodEnd('');
                    }
                  }}
                  className="w-full text-base border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>

              {/* Check-out Date */}
              <div className="group">
                <label htmlFor="checkout" className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {tr('end_date')} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="checkout"
                  type="date"
                  value={periodEnd}
                  min={periodStart || undefined}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                  className="w-full text-base border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>

              {/* Number of Guests */}
              <div className="group">
                <label htmlFor="guests" className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 4H9m6 16H9m0-11h6m0 11v-6a2 2 0 10-4 0v6m4-6V8.75" />
                  </svg>
                  {tr('number_of_guests_label')} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="guests"
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
                  className="w-full text-base border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="container mx-auto px-4 pb-20">
          {!periodStart || !periodEnd ? (
            <div className="text-center py-16">
              <div className="inline-block">
                <svg className="w-16 h-16 text-white/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xl font-light drop-shadow-lg text-white">
                {tr('select_period')}
              </p>
            </div>
          ) : isStartInPast ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-light drop-shadow-lg text-white">
                  {tr('select_future_date')}
                </p>
              </div>
            ) : !isRangeValid ? (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-light drop-shadow-lg text-white">
                    {tr('invalid_period')}
                  </p>
                </div>
              ) : freeRooms.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-yellow-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-light drop-shadow-lg text-white">{tr('no_free_rooms')}</p>
                  </div>
                ) : (
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-10 drop-shadow-lg flex items-center gap-3">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Dostupne sobe
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {freeRooms.map((soba) => {
                          let slikeArr: string[] = [];
                          if (Array.isArray(soba.slike)) {
                            slikeArr = soba.slike.filter((s) => !!s && s.trim() !== '');
                          } else if (typeof soba.slike === 'string' && soba.slike.trim()) {
                            try {
                              slikeArr = JSON.parse(soba.slike);
                              if (!Array.isArray(slikeArr)) {
                                slikeArr = soba.slike.split(',').map((s: string) => s.trim()).filter(Boolean);
                              }
                            } catch {
                              slikeArr = soba.slike.split(',').map((s: string) => s.trim()).filter(Boolean);
                            }
                            slikeArr = slikeArr.filter((s) => !!s && s.trim() !== '');
                          }

                          return (
                            <div
                              key={soba.id}
                              className="group rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 backdrop-blur-sm bg-white/95 border border-white/50 hover:-translate-y-2 hover:scale-105"
                            >
                              {/* Image Container */}
                              <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                                {slikeArr.length > 0 ? (
                                  <Image
                                    src={slikeArr[0]}
                                    alt={`${tr('room')} ${soba.broj}`}
                                    fill
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>

                              {/* Content */}
                              <div className="p-7">
                                {/* Room Number and Type */}
                                <div className="mb-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                                        {tr('room')} {soba.broj}
                                      </h2>
                                      <p className="text-amber-600 font-semibold text-sm mt-1">
                                        {language === "en" ? soba.tip_en || soba.tip : soba.tip}
                                      </p>
                                    </div>
                                    <div className="bg-amber-100 px-3 py-1 rounded-full">
                                      <span className="text-amber-700 font-bold text-sm">€{formatPrice(soba.cena)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                                  {language === "en" ? soba.opis_en || soba.opis : soba.opis}
                                </p>

                                {/* Features Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-t border-b border-gray-200">
                                  <div className="flex items-center gap-3 bg-blue-50 p-2 rounded-lg">
                                    <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 6a1 1 0 11-2 0 1 1 0 012 0ZM9 12a1 1 0 11-2 0 1 1 0 012 0ZM10.5 1.5H5.75A2.75 2.75 0 003 4.25v11.5A2.75 2.75 0 005.75 18.5h8.5A2.75 2.75 0 0017 15.75V4.25A2.75 2.75 0 0014.25 1.5Z" />
                                    </svg>
                                    <div>
                                      <p className="text-xs text-gray-500 font-medium">{tr('capacity')}</p>
                                      <p className="font-bold text-gray-900 text-lg">{soba.kapacitet}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 bg-green-50 p-2 rounded-lg">
                                    <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                      <p className="text-xs text-gray-500 font-medium">{tr('price_per_night')}</p>
                                      <p className="font-bold text-gray-900 text-lg">€{formatPrice(soba.cena)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* CTA Button */}
                                <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95">
                                  <Link href={getBookingUrl(soba.broj)}>
                                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                    {tr('book_room')}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
          )}
        </div>
      </div>
    </>
  );
}