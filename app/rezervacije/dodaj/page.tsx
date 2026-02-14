import { dodajRezervacijuSaGostom } from '@/actions/rezervacije';
import Link from 'next/link';
import { InputField, HiddenField, SelectField, FormActions } from '@/components/form/FormComponents';
import ClientRedirectForm from './ClientRedirectForm';
import { getLocaleMessages } from '@/i18n/i18n';
import prisma from '@/lib/prisma';
import { RezervacijaSearchParams } from '@/lib/types/searchParams';
import { extractErrors, getFieldValue } from '@/lib/helpers/url';


const DodajRezervacijuPage = async ({
  searchParams,
}: {
  searchParams: Promise<RezervacijaSearchParams>;
}) => {
  const params = await searchParams;

  // Extract errors and formData from params
  const errors = extractErrors(params);
  const formData = params || {};

  // Klijentski redirect workaround
  const lang = params?.lang === 'mn' ? 'mn' : 'en';
  const messages = getLocaleMessages(lang, 'rezervacije');
  const gostMessages = getLocaleMessages(lang, 'gosti');
  const commonMessages = getLocaleMessages(lang, 'common');

  const sobe = await prisma.soba.findMany();

  return (
    <>
      {/* Prikaz error poruke ako postoji */}
      {params?.error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 border border-red-300">
          <div>
            {(() => {
              if (params.error === 'guestNotFound') return 'Selected guest does not exist.';
              return messages[params.error] || commonMessages.error_general || 'An error occurred.';
            })()}
          </div>
          {/* Prikaz svih polja greške */}
          {Object.entries(errors).map(([field, errArr]) => (
            Array.isArray(errArr) && errArr.length > 0 ? (
              <div key={field}>
                <strong>{field}:</strong> {errArr.join(', ')}
              </div>
            ) : null
          ))}
        </div>
      )}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 pt-24">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{messages.book_now}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{commonMessages.form_description}</p>
          </div>
          <ClientRedirectForm action={dodajRezervacijuSaGostom}>
            <HiddenField name="lang" value={lang} />
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
            {/* SEKCIJA ZA GOSTA - ručni unos */}
            <div className="pb-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{gostMessages.guest_details}</h3>
              <SelectField
                name="gost_titula"
                label={gostMessages.title}
                defaultValue={formData.gost_titula}
                error={errors.gost_titula}
                options={[
                  { value: "", label: gostMessages.select_title },
                  { value: "Mr", label: "Mr" },
                  { value: "Mrs", label: "Mrs" },
                  { value: "Ms", label: "Ms" },
                  { value: "Dr", label: "Dr" },
                ]}
              />
              <InputField
                name="gost_ime"
                label={gostMessages.first_name}
                defaultValue={formData.gost_ime}
                error={errors.gost_ime}
                required
              />
              <InputField
                name="gost_prezime"
                label={gostMessages.last_name}
                defaultValue={formData.gost_prezime}
                error={errors.gost_prezime}
                required
              />
              <InputField
                name="gost_email"
                label={gostMessages.email}
                defaultValue={formData.gost_email}
                error={errors.gost_email}
                required
              />
              <InputField
                name="gost_telefon"
                label={gostMessages.phone}
                defaultValue={formData.gost_telefon}
                error={errors.gost_telefon}
              />
              <InputField
                name="gost_adresa"
                label={gostMessages.address}
                defaultValue={formData.gost_adresa}
                error={errors.gost_adresa}
              />
              <InputField
                name="gost_grad"
                label={gostMessages.city}
                defaultValue={formData.gost_grad}
                error={errors.gost_grad}
              />
              <InputField
                name="gost_drzava"
                label={gostMessages.country}
                defaultValue={formData.gost_drzava}
                error={errors.gost_drzava}
              />
              {/* Drugi gost polja */}
              <SelectField
                name="gost_titula_drugog_gosta"
                label={gostMessages.second_guest_title}
                defaultValue={formData.gost_titula_drugog_gosta}
                error={errors.gost_titula_drugog_gosta}
                options={[
                  { value: "", label: gostMessages.select_title },
                  { value: "Mr", label: "Mr" },
                  { value: "Mrs", label: "Mrs" },
                  { value: "Ms", label: "Ms" },
                  { value: "Dr", label: "Dr" },
                ]}
              />
              <InputField
                name="gost_ime_drugog_gosta"
                label={gostMessages.second_guest_first_name}
                defaultValue={formData.gost_ime_drugog_gosta}
                error={errors.gost_ime_drugog_gosta}
              />
              <InputField
                name="gost_prezime_drugog_gosta"
                label={gostMessages.second_guest_last_name}
                defaultValue={formData.gost_prezime_drugog_gosta}
                error={errors.gost_prezime_drugog_gosta}
              />
            </div>
            {/* Dugmad za akcije forme */}
            <FormActions
              submitLabel={messages.book_now}
              cancelLabel={messages.cancel}
              cancelHref={`/rezervacije?lang=${lang}`}
            />
          </ClientRedirectForm>
        </div>
      </div>
    </>
  );

  // Removed unreachable and invalid JSX code
};

export default DodajRezervacijuPage;