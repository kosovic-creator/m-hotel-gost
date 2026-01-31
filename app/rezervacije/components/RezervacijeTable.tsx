'use client';

import { obrisiRezervaciju } from "@/actions/rezervacije";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import PotvrdaBrisanjaModal from "@/app/components/PorvrdaBrisanjaModal";


type Gost = {
  ime: string;
  prezime: string;
  // Add other fields as needed
};

type Soba = {
  broj: string | number;
  // Add other fields as needed
};

type Rezervacije = {
  id: number;
  soba: Soba;
  gost: Gost;
  datum_prijave: Date;
  datum_odjave: Date;
  broj_osoba: number;
  status: string;
  kreirano: Date;
  azurirano: Date;
};

export default function RezervacijeTable({ rezervacije }: { rezervacije: Rezervacije[] }) {
  const { i18n } = useTranslation();
  const { t } = useTranslation("rezervacije");
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
            <span>{t("addReservation")}</span>
          </Button>
        </Link>
      </div>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <Table className="w-full border rounded-lg overflow-hidden">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-16 text-center">ID</TableHead>

                <TableHead className="text-center">{t("guest_name")}</TableHead>
                <TableHead className="text-center">{t("room")}</TableHead>
                <TableHead className="text-center">{t("checkin_date")}</TableHead>
                <TableHead className="text-center">{t("checkout_date")}</TableHead>
                <TableHead className="text-center">{t("number_of_guests_label")}</TableHead>
              <TableHead className="w-32 text-center"></TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {rezervacije.map(rezervacija => (
              <TableRow key={rezervacija.id} className="hover:bg-gray-50">
                <TableCell className="text-center font-mono">{rezervacija.id}</TableCell>
                <TableCell className="text-center">
                  {rezervacija.gost?.ime} {rezervacija.gost?.prezime}
                </TableCell>
                <TableCell className="text-center">
                  {rezervacija.soba?.broj}
                </TableCell>

                <TableCell className="text-center">{rezervacija.datum_prijave.toLocaleDateString()}</TableCell>
                <TableCell className="text-center">{rezervacija.datum_odjave.toLocaleDateString()}</TableCell>
                <TableCell className="text-center">{rezervacija.broj_osoba}</TableCell>
                <TableCell>
                  <div className="flex space-x-2 flex-row justify-center">
                    <form
                      action={obrisiRezervaciju}
                      ref={selectedId === rezervacija.id ? formRef : undefined}
                    >
                      <Input type="hidden" name="id" value={rezervacija.id} />
                      <Input type="hidden" name="lang" value={i18n.language} />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        type="button"
                        onClick={() => handleDeleteClick(rezervacija.id)}
                      >
                        {t("removeReservation")}
                      </Button>
                    </form>
                    <Link href={`/rezervacije/izmeni?rezervacijaId=${rezervacija.id}&lang=${i18n.language}`}>
                      <Button variant="secondary" type="button">{t("editReservation")}</Button>
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
        {rezervacije.map(rezervacija => {
          // Since Rezervacije type does not have slike, broj, tip, kapacitet, cena,
          // you may need to adjust this block to match your data structure.
          // For now, we'll display the available fields.
          return (
            <div key={rezervacija.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-semibold">{t("guest_name")}:</span>
                <span>{rezervacija.gost?.ime} {rezervacija.gost?.prezime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t("room")}:</span>
                <span>{rezervacija.soba?.broj}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t("check_in_date")}:</span>
                <span>{rezervacija.datum_prijave.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t("check_out_date")}:</span>
                <span>{rezervacija.datum_odjave.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t("number_of_guests_label")}:</span>
                <span>{rezervacija.broj_osoba}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <form action={obrisiRezervaciju} className="flex-1">
                  <Input type="hidden" name="id" value={rezervacija.id} />
                  <Button variant="destructive" size="sm" className="w-full">{t("removeReservation")}</Button>
                </form>
                <Link href={`/rezervacije/izmeni?rezervacijaId=${rezervacija.id}&lang=${i18n.language}`} className="flex-1">
                  <Button variant="secondary" type="button" className="w-full">{t("editReservation")}</Button>
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