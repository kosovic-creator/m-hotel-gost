/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/dialog';

interface GostiContentProps {
  gosti: any[];
  lang: 'en' | 'mn';
  t: any;
  obrisiGosta: any;
  initialSearch?: string;
}

export default function GostiContent({
  gosti,
  lang,
  t,
  obrisiGosta,
  initialSearch = ''
}: GostiContentProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGostId, setSelectedGostId] = useState<number | null>(null);
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

  const handleDeleteClick = (id: number) => {
    setSelectedGostId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedGostId) {
      const formData = new FormData();
      formData.append('id', selectedGostId.toString());
      formData.append('lang', lang);

      obrisiGosta(formData);

      setIsDeleteModalOpen(false);
      setSelectedGostId(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedGostId(null);
  };

  return (
    <>
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder={t.search_placeholder || 'Pretraži po imenu ili prezimenu...'}
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

      {/* Desktop table */}
      <div className="hidden sm:block rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">ID</TableHead>
              <TableHead className="text-center">{t.titula}</TableHead>
              <TableHead className="text-center">{t.ime}</TableHead>
              <TableHead className="text-center">{t.prezime}</TableHead>
              <TableHead className="text-center">{t.drzava}</TableHead>
              <TableHead className="text-center">{t.email}</TableHead>
              <TableHead className="text-center">{t.telefon}</TableHead>
              <TableHead className="w-40 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gosti.map((gost: any) => (
              <TableRow key={gost.id}>
                <TableCell className="text-center font-mono">{gost.id}</TableCell>
                <TableCell className="text-center">{gost.titula}</TableCell>
                <TableCell className="text-center">{gost.ime}</TableCell>
                <TableCell className="text-center">{gost.prezime}</TableCell>
                <TableCell className="text-center">{gost.drzava}</TableCell>
                <TableCell className="text-center">{gost.email}</TableCell>
                <TableCell className="text-center">{gost.telefon}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button asChild variant="secondary" size="sm" aria-label={t.uredi_gosta} title={t.uredi_gosta}>
                      <a href={`/gosti/izmeni?id=${gost.id}&lang=${lang}`}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(gost.id)}
                      variant="destructive"
                      size="sm"
                      aria-label={t.obrisi_gosta}
                      title={t.obrisi_gosta}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-4 sm:hidden">
        {gosti.map((gost: any) => (
          <div key={gost.id} className="rounded-lg border bg-card shadow-sm p-4 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="font-semibold">ID:</span>
              <span>{gost.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">{t.titula}:</span>
              <span>{gost.titula}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">{t.ime}:</span>
              <span>{gost.ime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">{t.prezime}:</span>
              <span>{gost.prezime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">{t.drzava}:</span>
              <span>{gost.drzava}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">{t.email}:</span>
              <span>{gost.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">{t.telefon}:</span>
              <span>{gost.telefon}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => handleDeleteClick(gost.id)}
                variant="destructive"
                className="w-full flex-1"
              >
                {t.obrisi_gosta}
              </Button>
              <Button asChild variant="secondary" className="w-full flex-1">
                <a href={`/gosti/izmeni?id=${gost.id}&lang=${lang}`}>
                  {t.uredi_gosta}
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDelete || 'Potvrdi brisanje'}
        message={t.confirmDeleteMessage || 'Da li ste sigurni da želite da obrišete ovog gosta? Ova akcija se ne može poništiti.'}
        confirmText={t.delete || 'Obriši'}
        cancelText={t.cancel || 'Otkaži'}
        variant="destructive"
      />
    </>
  );
}