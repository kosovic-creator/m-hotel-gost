import { dodajSobu } from '@/actions/sobe';
import { FormWrapper, InputField, HiddenField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import { ImageUpload } from '@/app/components/ImageUpload';
import { SobaSearchParams } from '@/lib/types/searchParams';
import { extractErrors, getFieldValue } from '@/lib/helpers/url';

export default async function DodajSobuPage({ searchParams }: { searchParams: Promise<SobaSearchParams> }) {
  const params = await searchParams;
  const lang = params?.lang === 'mn' ? 'mn' : 'en';
  const t = getLocaleMessages(lang, 'sobe');
  const commonMessages = getLocaleMessages(lang, 'common');

  const errors = extractErrors(params);

  const formData: Record<string, string> = {
    broj: getFieldValue(params?.broj, undefined),
    tip: getFieldValue(params?.tip, undefined),
    kapacitet: getFieldValue(params?.kapacitet, undefined),
    cena: getFieldValue(params?.cena, undefined),
    opis: getFieldValue(params?.opis, undefined),
    slike: getFieldValue(params?.slike, undefined),
    tip_en: getFieldValue(params?.tip_en, undefined),
    opis_en: getFieldValue(params?.opis_en, undefined),
  };

  return (
    <FormWrapper
      title={t.add}
      action={dodajSobu}
      submitLabel={t.add}
      cancelLabel={t.back}
      cancelHref="/sobe"
      description={commonMessages.form_description}
    >
      <HiddenField name="lang" value={lang} />

      <InputField
        name="broj"
        label={t.number_pl}
        placeholder={t.number_pl}
        required
        defaultValue={formData.broj}
        error={errors.broj}
      />

      <InputField
        name="kapacitet"
        label={t.capacity_pl}
        placeholder={t.capacity_pl}
        type="number"
        required
        defaultValue={formData.kapacitet}
        error={errors.kapacitet}
      />

      <InputField
        name="cena"
        label={t.price_pl}
        placeholder={t.price_pl}
        type="number"
        required
        defaultValue={formData.cena}
        error={errors.cena}
      />

      <InputField
        name="tip"
        label={'🇲🇪 ' + t.type_mn}
        placeholder={t.type_mn}
        required
        defaultValue={formData.tip}
        error={errors.tip}
        className="mb-2"
      />
      <InputField
        name="opis"
        label={'🇲🇪 ' + t.description_mn}
        placeholder={t.description_mn}
        required
        defaultValue={formData.opis}
        error={errors.opis}
      />

      <InputField
        name="tip_en"
        label={'🇬🇧 ' + t.type_en}
        placeholder={t.type_en}
        required
        defaultValue={formData.tip_en}
        error={errors.tip_en}
        className="mb-2"
      />
      <InputField
        name="opis_en"
        label={'🇬🇧 ' + t.description_en}
        placeholder={t.description_en}
        required
        defaultValue={formData.opis_en}
        error={errors.opis_en}
      />
      <ImageUpload
        name="slike"
        label={t.images}
        defaultValue={formData.slike}
        error={errors.slike}
        onlyUrls={false}
      />
    </FormWrapper>
  );
}