'use client';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DayButton } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Rezervacija {
  id: number;
  soba: {
    broj: string;
    tip: string;
  };
  gost: {
    ime: string;
    prezime: string;
  };
  datum_prijave: Date | string;
  datum_odjave: Date | string;
  status: string;
  broj_osoba: number;
}

interface RezervacijeKalendarProps {
  rezervacije: Rezervacija[];
  lang: 'en' | 'mn';
  translations: {
    calendar_view: string;
    reservations_on: string;
    guest_name: string;
    room: string;
    checkin_date: string;
    checkout_date: string;
    number_of_guests_label: string;
    status: string;
    no_reservations: string;
    confirmed?: string;
    pending?: string;
    cancelled?: string;
    completed?: string;
    free_rooms?: string;
    no_free_rooms?: string;
    cannot_book_past_date?: string;
  };
}

export default function RezervacijeKalendar({
  rezervacije,
  lang,
  translations
}: RezervacijeKalendarProps) {
    const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Custom date formatter for Montenegrin Latin script
  const formatDate = (date: Date) => {
    if (lang === 'mn') {
      const monthsLatinFull = [
        'januar', 'februar', 'mart', 'april', 'maj', 'juni',
        'juli', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
      ];

      const day = date.getDate();
      const month = monthsLatinFull[date.getMonth()];
      const year = date.getFullYear();

      return `${day}. ${month} ${year}.`;
    }

    return date.toLocaleDateString('en-US');
  };

  // Funkcija za dobijanje lokalizovanog naziva statusa
  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'confirmed': translations.confirmed || 'Confirmed',
      'pending': translations.pending || 'Pending',
      'cancelled': translations.cancelled || 'Cancelled',
      'completed': translations.completed || 'Completed',
      'free_rooms': translations.free_rooms || 'Free Rooms',
      'no_free_rooms': translations.no_free_rooms || 'No Free Rooms'
    };
    return statusLabels[status] || status;
  };

  // Funkcija za dobijanje boja statusa
  const getStatusBadgeClasses = (status: string): string => {
    const statusColors: Record<string, string> = {
      'confirmed': 'bg-green-400 text-green-800 border border-green-600',
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'cancelled': 'bg-red-100 text-red-800 border border-red-200',
      'completed': 'bg-blue-100 text-blue-800 border border-blue-200',
      'free_rooms': 'bg-green-100 text-green-800 border border-green-200',
      'no_free_rooms': 'bg-red-100 text-red-800 border border-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Funkcija za dobijanje rezervacija za određeni datum
  const getRezervacijeZaDatum = (datum: Date) => {
    return rezervacije.filter((rez) => {
      const prijava = new Date(rez.datum_prijave);
      const odjava = new Date(rez.datum_odjave);
      const provera = new Date(datum);

      // Normalizuj datume na ponoć
      prijava.setHours(0, 0, 0, 0);
      odjava.setHours(0, 0, 0, 0);
      provera.setHours(0, 0, 0, 0);

      return provera >= prijava && provera <= odjava;
    });
  };

  // Funkcija za dobijanje soba i statusa za datum
  const getRoomsForDate = (datum: Date): Array<{ roomNumber: string; status: string }> => {
    const rooms = new Map<string, string>();
    getRezervacijeZaDatum(datum).forEach((rez) => {
      const roomNumber = rez.soba?.broj ? String(rez.soba.broj) : '';
      if (!roomNumber) return;
      if (!rooms.has(roomNumber)) {
        rooms.set(roomNumber, rez.status);
      }
    });
    return Array.from(rooms.entries()).map(([roomNumber, status]) => ({ roomNumber, status }));
  };

  // Funkcija za dobijanje boje za mali indikator
  const getStatusIndicatorColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'confirmed': 'bg-green-400',
      'pending': 'bg-yellow-400',
      'cancelled': 'bg-red-400',
      'completed': 'bg-blue-400',
      'free_rooms': 'bg-green-300',
      'no_free_rooms': 'bg-red-300'
    };
    return statusColors[status] || 'bg-gray-400';
  };

  const DayButtonCell = ({
    className,
    day,
    modifiers,
    ...props
  }: React.ComponentProps<typeof DayButton>) => {
    const ref = useRef<HTMLButtonElement>(null);
    useEffect(() => {
      if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    const rooms = getRoomsForDate(day.date);
    const maxRooms = 10;

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        data-day={day.date.toLocaleDateString()}
        data-selected-single={
          modifiers.selected &&
          !modifiers.range_start &&
          !modifiers.range_end &&
          !modifiers.range_middle
        }
        data-range-start={modifiers.range_start}
        data-range-end={modifiers.range_end}
        data-range-middle={modifiers.range_middle}
        className={cn(
          "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md",
          className
        )}
        {...props}
      >
        <div className="flex h-full w-full flex-col items-start justify-between p-1">
          <div className="text-xs font-medium">{day.date.getDate()}</div>
          {rooms.length > 0 && (
            <div className="flex w-full flex-col gap-0.5">
              {rooms.slice(0, maxRooms).map((room) => (
                <div
                  key={room.roomNumber}
                  className="flex items-center gap-1"
                  title={`${translations.room}: ${room.roomNumber} • ${getStatusLabel(room.status)}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusIndicatorColor(room.status)}`} />
                  <span className="text-[10px] leading-none">{room.roomNumber}</span>
                </div>
              ))}
              {rooms.length > maxRooms && (
                <span className="text-[10px] text-muted-foreground">+{rooms.length - maxRooms}</span>
              )}
            </div>
          )}
        </div>
      </Button>
    );
  };

  // Prilagođeni renderer za dane koji imaju rezervacije
  const modifiers = {
    booked: (date: Date) => {
      const rez = getRezervacijeZaDatum(date);
      return rez.length > 0;
    }
  };

  // Onemogući pretekle datume
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabledDays = {
    before: today
  };

  const modifiersStyles = {
    booked: {
      fontWeight: 'bold',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '2px solid rgb(59, 130, 246)',
      borderRadius: '8px',
    }
  };

    const formatDateForInput = (value: Date) => {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

  const handleDayClick = (day: Date | undefined) => {
      if (!day) return;

    // Proveri da li je datum u prošlosti
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(day);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      // Možeš dodati alert ili toast poruku ovde
      alert(translations.cannot_book_past_date || 'Ne možete rezervisati za prošle datume.');
      return;
    }

    setSelectedDate(day);
      setDate(day);
      if (getRezervacijeZaDatum(day).length === 0) {
          const prijava = formatDateForInput(day);
          router.push(`/rezervacije/dodaj?lang=${lang}&prijava=${prijava}`);
      }
  };

  const selectedRezervacije = selectedDate ? getRezervacijeZaDatum(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kalendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl">{translations.calendar_view}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            onDayClick={handleDayClick}
            disabled={disabledDays}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            components={{ DayButton: DayButtonCell }}
            className="rounded-md border w-full"
          />
        </CardContent>
      </Card>

      {/* Detalji rezervacija za izabrani datum */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate
              ? `${translations.reservations_on} ${formatDate(selectedDate)}`
              : translations.reservations_on
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRezervacije.length === 0 ? (
            <p className="text-sm text-muted-foreground">{translations.no_reservations}</p>
          ) : (
            <div className="space-y-4">
              {selectedRezervacije.map((rez) => (
                <div
                  key={rez.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {rez.gost.ime} {rez.gost.prezime}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(rez.status)}`}>
                      {getStatusLabel(rez.status)}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium">{translations.room}:</span> {rez.soba.broj} ({rez.soba.tip})
                    </p>
                    <p>
                      <span className="font-medium">{translations.checkin_date}:</span>{' '}
                      {formatDate(new Date(rez.datum_prijave))}
                    </p>
                    <p>
                      <span className="font-medium">{translations.checkout_date}:</span>{' '}
                      {formatDate(new Date(rez.datum_odjave))}
                    </p>
                    <p>
                      <span className="font-medium">{translations.number_of_guests_label}:</span>{' '}
                      {rez.broj_osoba}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
              <span className="text-sm">{lang === 'en' ? 'Days with reservations' : 'Dani sa rezervacijama'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses('confirmed')}`}>{getStatusLabel('confirmed')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses('pending')}`}>{getStatusLabel('pending')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses('cancelled')}`}>{getStatusLabel('cancelled')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses('completed')}`}>{getStatusLabel('completed')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
