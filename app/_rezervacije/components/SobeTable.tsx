'use client';

import { obrisiSobu } from "@/actions/soba";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import PotvrdaBrisanjaModal from "@/app/components/PorvrdaBrisanjaModal";

type Soba = {
  id: number;
  broj: string;
  tip: string;
  kapacitet: number;
  cena: number;
  opis: string;
  slike: string | string[];
  tip_en: string;
  opis_en: string;
};

export default function SobeTable({ sobe }: { sobe: Soba[] }) {
  const { i18n } = useTranslation();
  const { t } = useTranslation("sobe");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setModalOpen(true);
  };
  const handleCancel = () => {
    setModalOpen(false);
    setSelectedId(null);
  };
  const handleConfirm = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
    setModalOpen(false);
    setSelectedId(null);
  };

  return (
    <div>
      <div className="mb-4">
        <Link href="/sobe/dodaj" passHref>
          <Button asChild variant="default" className="w-full sm:w-auto">
            <span>{t("add")}</span>
          </Button>
        </Link>
      </div>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <Table className="w-full border rounded-lg overflow-hidden">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-16 text-center">ID</TableHead>
              <TableHead className="w-24 text-center">{t("number")}</TableHead>
              <TableHead className="w-32 text-center">{t("type")}</TableHead>
              <TableHead className="w-20 text-center">{t("capacity")}</TableHead>
              <TableHead className="w-24 text-center">{t("price")}</TableHead>
              <TableHead className="w-40 text-center">{t("description")}</TableHead>
              <TableHead className="w-40 text-center">{t("description_en")}</TableHead>
              <TableHead className="w-32 text-center">{t("type_en")}</TableHead>
              <TableHead className="w-40 text-center">{t("images")}</TableHead>
              <TableHead className="w-32 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sobe.map(soba => (
              <TableRow key={soba.id} className="hover:bg-gray-50">
                <TableCell className="text-center font-mono">{soba.id}</TableCell>
                <TableCell className="text-center">{soba.broj}</TableCell>
                <TableCell className="text-center">{soba.tip}</TableCell>
                <TableCell className="text-center">{soba.kapacitet}</TableCell>
                <TableCell className="text-center">{soba.cena}</TableCell>
                <TableCell className="truncate max-w-xs" title={soba.opis}>{soba.opis}</TableCell>
                <TableCell className="truncate max-w-xs" title={soba.opis_en}>{soba.opis_en}</TableCell>
                <TableCell className="text-center">{soba.tip_en}</TableCell>
                <TableCell className="truncate max-w-xs text-center">
                  {(() => {
                    let slikeArr: string[] = [];
                    if (Array.isArray(soba.slike)) {
                      slikeArr = soba.slike;
                    } else if (typeof soba.slike === 'string') {
                      slikeArr = soba.slike.split(',').map(s => s.trim()).filter(Boolean);
                    }
                    return slikeArr.length > 0 ? (
                      <img src={slikeArr[0]} alt="soba" style={{ maxWidth: 60, maxHeight: 40, borderRadius: 4, objectFit: 'cover', margin: '0 auto' }} />
                    ) : (
                      <span style={{ color: '#aaa' }}>Nema slike</span>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 flex-row justify-center">
                    <form
                      action={obrisiSobu}
                      ref={selectedId === soba.id ? formRef : undefined}
                    >
                      <Input type="hidden" name="id" value={soba.id} />
                      <Input type="hidden" name="lang" value={i18n.language} />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        type="button"
                        onClick={() => handleDeleteClick(soba.id)}
                      >
                        {t("removeRoom")}
                      </Button>
                    </form>
                    <Link href={`/sobe/izmeni?sobaId=${soba.id}&lang=${i18n.language}`}>
                      <Button variant="secondary" type="button">{t("editRoom")}</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Mobile cards */}
      <div className="flex flex-col gap-4 sm:hidden">
        {sobe.map(soba => {
          let slikeArr: string[] = [];
          if (Array.isArray(soba.slike)) {
            slikeArr = soba.slike;
          } else if (typeof soba.slike === 'string') {
            slikeArr = soba.slike.split(',').map(s => s.trim()).filter(Boolean);
          }
          return (
            <div key={soba.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex justify-center mb-2">
                {slikeArr.length > 0 ? (
                  <img src={slikeArr[0]} alt="soba" style={{ maxWidth: 80, maxHeight: 60, borderRadius: 4, objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#aaa' }}>Nema slike</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t("number")}:</span>
                <span>{soba.broj}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t("type")}:</span>
                <span>{soba.tip}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t("capacity")}:</span>
                <span>{soba.kapacitet}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t("price")}:</span>
                <span>{soba.cena}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <form action={obrisiSobu} className="flex-1">
                  <Input type="hidden" name="id" value={soba.id} />
                  <Button variant="destructive" size="sm" className="w-full">{t("removeRoom")}</Button>
                </form>
                <Link href={`/sobe/izmeni?sobaId=${soba.id}&lang=${i18n.language}`} className="flex-1">
                  <Button variant="secondary" type="button" className="w-full">{t("editRoom")}</Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <PotvrdaBrisanjaModal
        open={modalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
}