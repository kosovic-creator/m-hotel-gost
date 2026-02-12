import { dodajRezervacijuSaGostom } from '@/actions/rezervacije';
import { FormWrapper, InputField, HiddenField, SelectField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import prisma from '@/lib/prisma';
import { RezervacijaSearchParams } from '@/lib/types/searchParams';
import { extractErrors, getFieldValue } from '@/lib/helpers/url';
import GostForm from './GostForm';

const DodajRezervacijuPage = async ({
  searchParams,
}: {
  searchParams: Promise<RezervacijaSearchParams>;
}) => {
  const params = await searchParams;
  const lang = params?.lang === 'mn' ? 'mn' : 'en';
  const messages = getLocaleMessages(lang, 'rezervacije');
  const gostMessages = getLocaleMessages(lang, 'gosti');
  const commonMessages = getLocaleMessages(lang, 'common');

  const [sobe, gosti] = await Promise.all([
    prisma.soba.findMany(),
    prisma.gost.findMany(),
  ]);

  const errors = extractErrors(params);

  // Konvertuj errors u format koji GostForm očekuje
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

    // Gost polja
    gost_titula: getFieldValue(params?.gost_titula, undefined),
    gost_ime: getFieldValue(params?.gost_ime, undefined),
    gost_prezime: getFieldValue(params?.gost_prezime, undefined),
    gost_titula_drugog_gosta: getFieldValue(params?.gost_titula_drugog_gosta, undefined),
    gost_ime_drugog_gosta: getFieldValue(params?.gost_ime_drugog_gosta, undefined),
    gost_prezime_drugog_gosta: getFieldValue(params?.gost_prezime_drugog_gosta, undefined),
    gost_adresa: getFieldValue(params?.gost_adresa, undefined),
    gost_grad: getFieldValue(params?.gost_grad, undefined),
    gost_drzava: getFieldValue(params?.gost_drzava, undefined),
    gost_email: getFieldValue(params?.gost_email, undefined),
    gost_telefon: getFieldValue(params?.gost_telefon, undefined),
    postojeci_gost: getFieldValue(params?.postojeci_gost, undefined),
    koristi_postojeceg_gosta: getFieldValue(params?.koristi_postojeceg_gosta, 'false'),
  };

  return (
    <FormWrapper
      title={messages.book_now}
      action={dodajRezervacijuSaGostom}
      submitLabel={messages.book_now}
      cancelLabel={messages.cancel}
      cancelHref="/rezervacije"
      description={commonMessages.form_description}
    >
      <HiddenField name="lang" value={lang} />

      {/* SEKCIJA ZA SAVU REZERVACIJU */}
      <div className="border-b pb-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{messages.reservation_details}</h3>

        <SelectField
          name="soba"
          label={messages.room}
          placeholder={messages.select_room}
          defaultValue={formData.soba}
          error={errors.soba}
          required
          options={sobe.map((s) => ({
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
          defaultValue={getFieldValue(params?.popust, '0')}
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
            { value: "pending", label: messages.pending, statusColor: 'bg-yellow-100 text-yellow-800' },
            { value: "confirmed", label: messages.confirmed, statusColor: 'bg-green-400 text-green-800' },
            { value: "cancelled", label: messages.cancelled, statusColor: 'bg-red-100 text-red-800' },
            { value: "completed", label: messages.completed, statusColor: 'bg-blue-100 text-blue-800' },
            { value: "free_rooms", label: messages.free_rooms, statusColor: 'bg-green-100 text-green-800' },
            { value: "no_free_rooms", label: messages.no_free_rooms, statusColor: 'bg-red-100 text-red-800' }
          ]}
        />
      </div>

      {/* SEKCIJA ZA GOSTA */}
      <GostForm
        gosti={gosti}
        gostMessages={gostMessages}
        errors={errorsArray}
        formData={formData}
      />

    </FormWrapper>
  );
};

export default DodajRezervacijuPage;