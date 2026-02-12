/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from 'react';
import { dodajRezervacijuSaGostom } from '@/actions/rezervacije';
import { FormWrapper, InputField, HiddenField, SelectField } from '@/components/form/FormComponents';
import GostForm from './GostForm'; // If GostForm is not a module, try importing as default or named export
// If './GostForm' does not export default, try:
// import { GostForm } from './GostForm';
// Or if it exports as module.exports:
// const GostForm = require('./GostForm');
import RezervacijaWithPayment from '@/components/rezervacije/RezervacijaWithPayment';
import { extractErrors, getFieldValue } from '@/lib/helpers/url';

interface DodajRezervacijuClientProps {
  params: Record<string, any>;
  lang: 'en' | 'mn';
  messages: any;
  gostMessages: any;
  commonMessages: any;
  sobe: any;
  gosti: any;
}

export default function DodajRezervacijuClient({
  params,
  lang,
  messages,
  gostMessages,
  commonMessages,
  sobe,
  gosti,
}: DodajRezervacijuClientProps) {
  const [rezervacija, setRezervacija] = useState<any>(null);


  const errors = extractErrors(params);

  const errorsArray: Record<string, string[] | undefined> = {};
  Object.entries(errors).forEach(([key, value]) => {
    errorsArray[key] = value ? [value] : undefined;
  });

  const formData: Record<string, string> = {
    soba: getFieldValue(params?.soba, undefined),
    prijava: getFieldValue(params?.prijava, undefined, true),
    odjava: getFieldValue(params?.odjava, undefined, true),
    broj_osoba: getFieldValue(params?.broj_osoba, '1'),
    popust: getFieldValue(params?.popust, '0'),
    status: getFieldValue(params?.status, 'pending'),
    // ...gost polja...
  };

  const rawGosti = gosti.map((g: any) => ({
    id: g.id,
    titula: g.titula,
    ime: g.ime,
    prezime: g.prezime,
    titula_drugog_gosta: g.titula_drugog_gosta,
    ime_drugog_gosta: g.ime_drugog_gosta,
    prezime_drugog_gosta: g.prezime_drugog_gosta,
    adresa: g.adresa,
    grad: g.grad,
    drzava: g.drzava,
    email: g.email,
    mob_telefon: g.mob_telefon,
    telefon: g.mob_telefon ?? '',
  }));

  const handleSubmit = async (data: FormData) => {
    const rezultat = await dodajRezervacijuSaGostom(data);
    if (rezultat && typeof rezultat === 'object' && 'rezervacija' in rezultat && rezultat.rezervacija) {
      setRezervacija(rezultat.rezervacija);
    } else if (rezultat && typeof rezultat === 'object' && 'error' in rezultat && rezultat.error) {
      // Prikaži poruku o grešci korisniku
    }
  };

  if (rezervacija) {
    return (
      <RezervacijaWithPayment
        rezervacija={rezervacija}
        lang={lang}
        t={messages}
        showPaymentOption={true}
      />
    );
  }

  return (
    <FormWrapper
      title={messages.book_now}
      action={handleSubmit}
      submitLabel={messages.book_now}
      cancelLabel={messages.cancel}
      cancelHref="/rezervacije"
      description={commonMessages.form_description}
    >
      <HiddenField name="lang" value={lang} />

      {/* SEKCIJA ZA REZERVACIJU */}
      <div className="border-b pb-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{messages.reservation_details}</h3>

        <SelectField
          name="soba"
          label={messages.room}
          placeholder={messages.select_room}
          defaultValue={formData.soba}
          error={errors.soba}
          required
          options={sobe.map((s: { broj: any; }) => ({
            value: s.broj,
            label: s.broj,
          }))}
        />

        <InputField
          name="prijava"
          type="date"
          label={messages.check_in}
          defaultValue={formData.prijava}
          error={errors.prijava}
          required
        />

        <InputField
          name="odjava"
          type="date"
          label={messages.check_out}
          defaultValue={formData.odjava}
          error={errors.odjava}
          required
        />

        <InputField
          name="broj_osoba"
          type="number"
          label={messages.number_of_guests_label}
          defaultValue={formData.broj_osoba}
          error={errors.broj_osoba}
          required
          min="1"
        />

        <InputField
          name="popust"
          type="number"
          label={messages.popust}
          defaultValue={formData.popust}
          error={errors.popust}
          min="0"
          max="100"
          placeholder="0"
        />

        <SelectField
          name="status"
          label={messages.status}
          placeholder={messages.select_status}
          defaultValue={formData.status}
          error={errors.status}
          required
          options={[
            { value: "pending", label: messages.pending },
            { value: "confirmed", label: messages.confirmed },
            { value: "cancelled", label: messages.cancelled },
            { value: "completed", label: messages.completed },
            { value: "free_rooms", label: messages.free_rooms },
            { value: "no_free_rooms", label: messages.no_free_rooms }
          ]}
        />
      </div>

      {/* SEKCIJA ZA GOSTA */}
      <GostForm
        gosti={rawGosti}
        gostMessages={gostMessages}
        errors={errorsArray}
        formData={formData}
      />
<pre>{JSON.stringify(gostMessages, null, 2)}</pre>
    </FormWrapper>
  );
}