import { FormWrapper, InputField, HiddenField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import prisma from '@/lib/prisma';
import { extractErrors, getFieldValue } from '@/lib/helpers/url';
import { GostiSearchParams } from '@/lib/types/searchParams';
import { dodajGosta } from '@/actions/gosti';

const DodajGostaPage = async ({
  searchParams,
}: {
  searchParams: Promise<GostiSearchParams>;
}) => {
  const params = await searchParams;
  const lang = params?.lang === 'mn' ? 'mn' : 'en';
  const messages = await getLocaleMessages(lang, 'gosti');
  const commonMessages = await getLocaleMessages(lang, 'common');

  await Promise.all([
    prisma.gost.findMany(),
  ]);

  const errors = extractErrors(params);

  const formData: Record<string, string> = {
    titula: getFieldValue(params?.titula, undefined),
    ime: getFieldValue(params?.ime, undefined),
    prezime: getFieldValue(params?.prezime, undefined),
    titula_drugog_gosta: getFieldValue(params?.titula_drugog_gosta, undefined),
    ime_drugog_gosta: getFieldValue(params?.ime_drugog_gosta, undefined),
    prezime_drugog_gosta: getFieldValue(params?.prezime_drugog_gosta, undefined),
    adresa: getFieldValue(params?.adresa, undefined),
    grad: getFieldValue(params?.grad, undefined),
    drzava: getFieldValue(params?.drzava, undefined),
    email: getFieldValue(params?.email, undefined),
    telefon: getFieldValue(params?.telefon, undefined),
  };

  return (
    <FormWrapper
      title={messages.dodaj_gosta}
      action={dodajGosta}
      submitLabel={messages.dodaj_gosta}
      cancelLabel={messages.otkazi}

      cancelHref="/gosti"
      description={commonMessages.form_description}
    >
      <HiddenField name="lang" value={lang} />

      <InputField
        name="titula"
        label={messages.titula}
        defaultValue={formData.titula}
        error={errors.titula}
        required
      />

      <InputField
        name="ime"
        label={messages.ime}
        defaultValue={formData.ime}
        error={errors.ime}
        required
      />

      <InputField
        name="prezime"
        label={messages.prezime}
        defaultValue={formData.prezime}
        error={errors.prezime}
        required
      />

      <InputField
        name="titula_drugog_gosta"
        label={messages.titula_drugog_gosta}
        defaultValue={formData.titula_drugog_gosta}
        error={errors.titula_drugog_gosta}
      />

      <InputField
        name="ime_drugog_gosta"
        label={messages.ime_drugog_gosta}
        defaultValue={formData.ime_drugog_gosta}
        error={errors.ime_drugog_gosta}
      />

      <InputField
        name="prezime_drugog_gosta"
        label={messages.prezime_drugog_gosta}
        defaultValue={formData.prezime_drugog_gosta}
        error={errors.prezime_drugog_gosta}
      />

      <InputField
        name="adresa"
        label={messages.adresa}
        defaultValue={formData.adresa}
        error={errors.adresa}
      />

      <InputField
        name="grad"
        label={messages.grad}
        defaultValue={formData.grad}
        error={errors.grad}
      />

      <InputField
        name="drzava"
        label={messages.drzava}
        defaultValue={formData.drzava}
        error={errors.drzava}
        required
      />

      <InputField
        name="email"
        type="email"
        label={messages.email}
        defaultValue={formData.email}
        error={errors.email}
        required
      />

      <InputField
        name="telefon"
        type="tel"
        label={messages.telefon}
        defaultValue={formData.telefon}
        error={errors.telefon}
      />


    </FormWrapper>
  );
};

export default DodajGostaPage;