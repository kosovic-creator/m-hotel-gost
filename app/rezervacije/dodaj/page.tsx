'use server';

import { dodajRezervaciju } from '@/actions/rezervacije';
import { FormWrapper, SelectField, InputField, HiddenField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import prisma from '@/lib/prisma';
import { RezervacijaSearchParams } from '@/lib/types/searchParams';
import { extractErrors, extractFormValues } from '@/lib/helpers/url';

export default async function DodajPage({
  searchParams
}: {
  searchParams: Promise<RezervacijaSearchParams>
}) {
  const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const messages = getLocaleMessages(lang, 'rezervacije');

  const sobe = await prisma.soba.findMany();
  const gosti = await prisma.gost.findMany();

  // Ekstrauj greške iz query parametara
  const errors = extractErrors(params);

  // Popunjavanje polja iz query parametara (ako postoji)
  const formData = extractFormValues(params, {
    soba: '',
    gost: '',
    prijava: '',
    odjava: '',
    status: ''
  });

  return (
    <FormWrapper
      title={messages.addReservation}
      action={dodajRezervaciju}
      submitLabel={messages.addReservation}
      cancelLabel={messages.cancel}
      cancelHref={`/rezervacije?lang=${lang}`}
    >
      <HiddenField name="lang" value={lang || 'mn'} />

      <SelectField
        name="soba"
        label={messages.soba}
        options={sobe.map(s => ({ value: s.id, label: s.broj }))}
        placeholder={messages.choose_room}
        defaultValue={formData.soba}
        error={errors.soba}
        required
      />

      <SelectField
        name="gost"
        label={messages.gost}
        options={gosti.map(g => ({ value: g.id, label: `${g.ime} ${g.prezime}` }))}
        placeholder={messages.choose_guest}
        defaultValue={formData.gost}
        error={errors.gost}
        required
      />

      <InputField
        name="prijava"
        type="date"
        placeholder={messages.prijava}
        defaultValue={formData.prijava}
        error={errors.prijava}
        required
      />

      <InputField
        name="odjava"
        type="date"
        placeholder={messages.odjava}
        defaultValue={formData.odjava}
        error={errors.odjava}
        required
      />

      <InputField
        name="status"
        type="text"
        placeholder={messages.status}
        defaultValue={formData.status}
        error={errors.status}
        required
      />
    </FormWrapper>
  );
}