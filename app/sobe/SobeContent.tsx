/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/dialog';

interface SobeContentProps {
  sobe: any[];
  lang: 'en' | 'mn';
  t: any;
  obrisiSobu: any;
}

export default function SobeContent({
  sobe,
  lang,
  t,
  obrisiSobu
}: SobeContentProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSobaId, setSelectedSobaId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setSelectedSobaId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedSobaId) {
      const formData = new FormData();
      formData.append('id', selectedSobaId.toString());
      formData.append('lang', lang);

      obrisiSobu(formData);

      setIsDeleteModalOpen(false);
      setSelectedSobaId(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedSobaId(null);
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">ID</TableHead>
              <TableHead className="text-center">{t.number}</TableHead>
              <TableHead className="text-center">{t.type}</TableHead>
              <TableHead className="text-center">{t.capacity}</TableHead>
              <TableHead className="text-center">{t.price}</TableHead>
              <TableHead className="text-center">{t.description}</TableHead>
              <TableHead className="text-center">{t.description_en}</TableHead>
              <TableHead className="text-center">{t.type_en}</TableHead>
              <TableHead className="text-center">{t.images}</TableHead>
              <TableHead className="w-40 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sobe.map((soba: any) => {
              let slikeArr: string[] = [];
              if (Array.isArray(soba.slike)) {
                slikeArr = soba.slike;
              } else if (typeof soba.slike === 'string') {
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
                <TableRow key={soba.id}>
                  <TableCell className="text-center font-mono">{soba.id}</TableCell>
                  <TableCell className="text-center">{soba.broj}</TableCell>
                  <TableCell className="text-center">{soba.tip}</TableCell>
                  <TableCell className="text-center">{soba.kapacitet}</TableCell>
                  <TableCell className="text-center">{soba.cena}</TableCell>
                  <TableCell className="truncate max-w-xs" title={soba.opis}>{soba.opis}</TableCell>
                  <TableCell className="truncate max-w-xs" title={soba.opis_en}>{soba.opis_en}</TableCell>
                  <TableCell className="text-center">{soba.tip_en}</TableCell>
                  <TableCell className="text-center">
                    {slikeArr.length > 0 ? (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Image src={slikeArr[0]} alt="soba" width={60} height={40} style={{ borderRadius: 4, objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <span style={{ color: '#aaa' }}>Nema slike</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button asChild variant="secondary" size="sm" aria-label={t.editRoom} title={t.editRoom}>
                        <a href={`/sobe/izmeni?id=${soba.id}&lang=${lang}`}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(soba.id)}
                        variant="destructive"
                        size="sm"
                        aria-label={t.removeRoom}
                        title={t.removeRoom}
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
        {sobe.map((soba: any) => {
          let slikeArr: string[] = [];
          if (Array.isArray(soba.slike)) {
            slikeArr = soba.slike;
          } else if (typeof soba.slike === 'string') {
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
            <div key={soba.id} className="rounded-lg border bg-card shadow-sm p-4 flex flex-col gap-2">
              <div className="flex justify-center mb-2">
                {slikeArr.length > 0 ? (
                  <Image src={slikeArr[0]} alt="soba" width={80} height={60} style={{ borderRadius: 4, objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#aaa' }}>Nema slike</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.number}:</span>
                <span>{soba.broj}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.type}:</span>
                <span>{soba.tip}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.capacity}:</span>
                <span>{soba.kapacitet}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.price}:</span>
                <span>{soba.cena}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => handleDeleteClick(soba.id)}
                  variant="destructive"
                  className="w-full flex-1"
                >
                  {t.removeRoom}
                </Button>
                <Button asChild variant="secondary" className="w-full flex-1">
                  <a href={`/sobe/izmeni?sobaId=${soba.id}&lang=${lang}`}>
                    {t.editRoom}
                  </a>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDelete || 'Potvrdi brisanje'}
        message={t.confirmDeleteMessage || 'Da li ste sigurni da želite da obrišete ovu sobu? Ova akcija se ne može poništiti.'}
        confirmText={t.delete || 'Obriši'}
        cancelText={t.cancel || 'Otkaži'}
        variant="destructive"
      />
    </>
  );
}