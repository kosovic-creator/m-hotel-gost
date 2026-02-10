/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RezervacijeKalendar from './RezervacijeKalendar';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useMemo, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { rascunajBrojDana, rascunajUkupnuCenu, rascunajUkupnePrihode } from '@/lib/helpers/rezervacije';

interface RezervacijeContentProps {
  rezervacije: any[];
  sobe: Array<{
    id: number;
    broj: string;
    tip: string;
    tip_en?: string | null;
    kapacitet: number;
    cena: number;
  }>;
  lang: 'en' | 'mn';
  t: any;
  obrisiRezervaciju: any;
  initialSearch?: string;
}

export default function RezervacijeContent({
  rezervacije,
  sobe,
  lang,
  t,
  obrisiRezervaciju,
  initialSearch = ''
}: RezervacijeContentProps) {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [numberOfGuestsInput, setNumberOfGuestsInput] = useState('1');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    startTransition(() => {
      const params = new URLSearchParams();
      params.set('lang', lang);
      if (value.trim()) {
        params.set('search', value.trim());
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClearSearch = () => {
    setSearchValue('');

    startTransition(() => {
      const params = new URLSearchParams();
      params.set('lang', lang);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

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

  // Proveri da li je start datum u prošlosti
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isStartInPast = parsedStart && parsedStart < today;
  const isRangeValid = Boolean(parsedStart && parsedEnd && parsedEnd > parsedStart && !isStartInPast);

  const freeRooms = useMemo(() => {
    if (!parsedStart || !parsedEnd || parsedEnd <= parsedStart || isStartInPast) return [];

    const start = parsedStart;
    const end = parsedEnd;

    return sobe.filter((soba) => {
      // Proveri da li soba ima dovoljno kapaciteta za broj gostiju
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

  // Računaj ukupne prihode
  const ukupniPrihodi = useMemo(() => {
    return rascunajUkupnePrihode(rezervacije);
  }, [rezervacije]);

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

  const canBookFromRange = isRangeValid;

  const handleDeleteClick = (id: number) => {
    setSelectedReservationId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedReservationId) {
      // Kreiraj FormData objekat sa potrebnim podacima
      const formData = new FormData();
      formData.append('id', selectedReservationId.toString());
      formData.append('lang', lang);

      // Pozovi server akciju
      obrisiRezervaciju(formData);

      // Zatvori modal i resetuj state
      setIsDeleteModalOpen(false);
      setSelectedReservationId(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedReservationId(null);
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'confirmed': t.confirmed || 'Confirmed',
      'pending': t.pending || 'Pending',
      'cancelled': t.cancelled || 'Cancelled',
      'completed': t.completed || 'Completed',
      'free_rooms': t.free_rooms || 'Free Rooms',
      'no_free_rooms': t.no_free_rooms || 'No Free Rooms'
    };
    return statusLabels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'confirmed': 'bg-green-400 text-green-800 border-green-600',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'free_rooms': 'bg-green-100 text-green-800 border-green-200',
      'no_free_rooms': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center">{t.title}</h1>
        {/* Prikaz ukupnih prihoda */}
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-600">{t.ukupni_prihodi}: </span>
          <span className="text-lg font-semibold text-green-600">
            €{formatPrice(ukupniPrihodi)}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Input
            type="text"
            placeholder={t.search_placeholder || 'Pretraži po imenu ili prezimenu gosta...'}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchValue && !isPending && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Očisti pretragu"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="table">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {t.table_view}
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t.calendar_view}
          </TabsTrigger>
          <TabsTrigger value="free-rooms">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {t.free_rooms_tab || t.free_rooms}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          {/* Desktop table */}
          <div className="hidden sm:block rounded-lg border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">ID</TableHead>
                  <TableHead className="text-center">{t.guest_name}</TableHead>
                  <TableHead className="text-center">{t.room}</TableHead>
                  <TableHead className="text-center">{t.checkin_date}</TableHead>
                  <TableHead className="text-center">{t.checkout_date}</TableHead>
                  <TableHead className="text-center">{t.number_of_guests_label}</TableHead>
                  <TableHead className="text-center">{t.popust}</TableHead>
                  <TableHead className="text-center">{t.ukupna_cena}</TableHead>
                  <TableHead className="text-center">{t.status}</TableHead>
                  <TableHead className="w-40 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rezervacije.map((rezervacija: any) => {
                  const ukupnaCena = rascunajUkupnuCenu(
                    rezervacija.soba?.cena || 0,
                    new Date(rezervacija.datum_prijave || rezervacija.prijava),
                    new Date(rezervacija.datum_odjave || rezervacija.odjava),
                    rezervacija.popust || 0
                  );

                  return (
                    <TableRow key={rezervacija.id}>
                      <TableCell className="text-center font-mono">
                        <Link
                          href={`/rezervacije/${rezervacija.id}?lang=${lang}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          #{rezervacija.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{rezervacija.gost?.ime} {rezervacija.gost?.prezime}</TableCell>
                      <TableCell className="text-center">{rezervacija.soba?.broj}</TableCell>
                      <TableCell className="text-center">{rezervacija.datum_prijave ? new Date(rezervacija.datum_prijave).toISOString().slice(0, 10) : new Date(rezervacija.prijava).toISOString().slice(0, 10)}</TableCell>
                      <TableCell className="text-center">{rezervacija.datum_odjave ? new Date(rezervacija.datum_odjave).toISOString().slice(0, 10) : new Date(rezervacija.odjava).toISOString().slice(0, 10)}</TableCell>
                      <TableCell className="text-center">{rezervacija.broj_osoba}</TableCell>
                      <TableCell className="text-center">{rezervacija.popust || 0}%</TableCell>
                      <TableCell className="text-center font-semibold">€{formatPrice(ukupnaCena)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(rezervacija.status)}`}>
                          {getStatusLabel(rezervacija.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button asChild variant="outline" size="sm" aria-label={"View Details"} title={"View Details"}>
                            <Link href={`/rezervacije/${rezervacija.id}?lang=${lang}`}>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                          </Button>
                          <Button asChild variant="secondary" size="sm" aria-label={t.editReservation} title={t.editReservation}>
                            <a href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`}>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </a>
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(rezervacija.id)}
                            variant="destructive"
                            size="sm"
                            aria-label={t.removeReservation}
                            title={t.removeReservation}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-4 sm:hidden">
            {rezervacije.map((rezervacija: any) => (
              <div key={rezervacija.id} className="rounded-lg border bg-card shadow-sm p-4 flex flex-col gap-2">
                {/* ID - clickable header */}
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <span className="font-semibold text-sm text-gray-500">Rezervacija</span>
                  <Link
                    href={`/rezervacije/${rezervacija.id}?lang=${lang}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-mono font-bold"
                  >
                    #{rezervacija.id}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t.guest_name}:</span>
                  <span>{rezervacija.gost?.ime} {rezervacija.gost?.prezime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t.room}:</span>
                  <span>{rezervacija.soba?.broj}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t.checkin_date}:</span>
                  <span>{rezervacija.datum_prijave ? new Date(rezervacija.datum_prijave).toISOString().slice(0, 10) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t.checkout_date}:</span>
                  <span>{rezervacija.datum_odjave ? new Date(rezervacija.datum_odjave).toISOString().slice(0, 10) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t.number_of_guests_label}:</span>
                  <span>{rezervacija.broj_osoba}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t.status}:</span>
                  <span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(rezervacija.status)}`}>
                      {getStatusLabel(rezervacija.status)}
                    </span>
                  </span>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  <Link href={`/rezervacije/${rezervacija.id}?lang=${lang}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm" aria-label="View Details" title="View Details">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Button>
                  </Link>
                  <Link href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm" aria-label={t.editReservation} title={t.editReservation}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                  </Link>
                  <div className="flex-1">
                    <Button
                      onClick={() => handleDeleteClick(rezervacija.id)}
                      variant="destructive"
                      className="w-full"
                      size="sm"
                      aria-label={t.removeReservation}
                      title={t.removeReservation}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <RezervacijeKalendar
            rezervacije={rezervacije}
            lang={lang}
            translations={{
              calendar_view: t.calendar_view,
              reservations_on: t.reservations_on,
              guest_name: t.guest_name,
              room: t.room,
              checkin_date: t.checkin_date,
              checkout_date: t.checkout_date,
              number_of_guests_label: t.number_of_guests_label,
              status: t.status,
              no_reservations: t.no_reservations,              confirmed: t.confirmed,
              pending: t.pending,
              cancelled: t.cancelled,
              completed: t.completed,
              free_rooms: t.free_rooms,
              no_free_rooms: t.no_free_rooms,
              cannot_book_past_date: t.cannot_book_past_date,
            }}
          />
        </TabsContent>

        <TabsContent value="free-rooms" className="mt-6">
          <div className="rounded-lg border bg-card shadow-sm p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium" htmlFor="free-rooms-start">
                  {t.start_date || t.checkin_date}
                </label>
                <Input
                  id="free-rooms-start"
                  type="date"
                  value={periodStart}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(event) => {
                    setPeriodStart(event.target.value);
                    if (periodEnd && event.target.value > periodEnd) {
                      setPeriodEnd('');
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium" htmlFor="free-rooms-end">
                  {t.end_date || t.checkout_date}
                </label>
                <Input
                  id="free-rooms-end"
                  type="date"
                  value={periodEnd}
                  min={periodStart || undefined}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                />
              </div>
              <div className="flex-1 sm:max-w-40">
                <label className="mb-1 block text-sm font-medium" htmlFor="free-rooms-guests">
                  {t.number_of_guests_label || 'Broj osoba'}
                </label>
                <Input
                  id="free-rooms-guests"
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
                />
              </div>
            </div>

            {!periodStart || !periodEnd ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {t.select_period || t.free_rooms}
              </p>
            ) : isStartInPast ? (
              <p className="mt-4 text-sm text-destructive">
                {t.select_future_date || 'Molimo odaberite budući datum za pretragu dostupnih soba.'}
              </p>
            ) : !isRangeValid ? (
              <p className="mt-4 text-sm text-destructive">
                {t.invalid_period || t.checkout_date}
              </p>
            ) : freeRooms.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{t.no_free_rooms}</p>
            ) : (
              <>
                <div className="mt-6 hidden sm:block rounded-lg border bg-card shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">{t.room}</TableHead>
                        <TableHead className="text-center">{t.room_type || t.type}</TableHead>
                        <TableHead className="text-center">{t.capacity || t.number_of_guests_label}</TableHead>
                        <TableHead className="text-center">{t.price || t.cena}</TableHead>
                        <TableHead className="text-center"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {freeRooms.map((soba) => (
                        <TableRow key={soba.id}>
                          <TableCell className="text-center font-medium">{soba.broj}</TableCell>
                          <TableCell className="text-center">
                            {lang === 'en' ? soba.tip_en || soba.tip : soba.tip}
                          </TableCell>
                          <TableCell className="text-center">{soba.kapacitet}</TableCell>
                          <TableCell className="text-center">{formatPrice(soba.cena)}</TableCell>
                          <TableCell className="text-center">
                            {canBookFromRange ? (
                              <Button asChild size="sm">
                                <Link href={getBookingUrl(soba.broj)}>{t.book_room || t.book_now}</Link>
                              </Button>
                            ) : (
                              <Button size="sm" disabled title={t.invalid_period || t.checkout_date}>
                                {t.book_room || t.book_now}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:hidden">
                  {freeRooms.map((soba) => (
                    <div key={soba.id} className="rounded-lg border bg-card shadow-sm p-4 flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">{t.room}:</span>
                        <span>{soba.broj}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">{t.room_type || t.type}:</span>
                        <span>{lang === 'en' ? soba.tip_en || soba.tip : soba.tip}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">{t.capacity || t.number_of_guests_label}:</span>
                        <span>{soba.kapacitet}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">{t.price || t.cena}:</span>
                        <span>{formatPrice(soba.cena)}</span>
                      </div>
                      {canBookFromRange ? (
                        <Button asChild size="sm" className="mt-2">
                          <Link href={getBookingUrl(soba.broj)}>{t.book_room || t.book_now}</Link>
                        </Button>
                      ) : (
                        <Button size="sm" className="mt-2" disabled title={t.invalid_period || t.checkout_date}>
                          {t.book_room || t.book_now}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDelete || 'Potvrdi brisanje'}
        message={t.confirmDeleteMessage || 'Da li ste sigurni da želite da obrišete ovu rezervaciju? Ova akcija se ne može poništiti.'}
        confirmText={t.delete || 'Obriši'}
        cancelText={t.cancel || 'Otkaži'}
        variant="destructive"
      />
    </div>
  );
}
