import { ucitajGostaId,updateGost} from '@/actions/gosti';
import { FormWrapper, InputField, HiddenField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import { extractErrors, getFieldValue } from '@/lib/helpers/url';
import { GostiSearchParams } from '@/lib/types/searchParams';

export default async function IzmjeniGostaPage({ searchParams }: { searchParams: Promise<GostiSearchParams> }) {
    const params = await searchParams;
    const lang = params?.lang === 'mn' ? 'mn' : 'en';
    const t = getLocaleMessages(lang, 'gosti');
    const commonMessages = getLocaleMessages(lang, 'common');
    const id = Number(params.id || params.id);

    if ((!params.id && !params.id) || isNaN(id)) {
        return <div>{t.neispravan_gost_id}</div>;
    }

    const gost = await ucitajGostaId({ gostId: id });
    if (!gost) {
        return <div>{t.gost_nije_pronadjen}</div>;
    }

    const errors = extractErrors(params);

    const formData: Record<string, string> = {
        ime: getFieldValue(params?.ime, gost.ime),
        prezime: getFieldValue(params?.prezime, gost.prezime),
        email: getFieldValue(params?.email, gost.email),
        telefon: getFieldValue(params?.telefon, gost.telefon || ''),
    };

    return (
        <FormWrapper
            title={`${t.uredi_gosta} - ID: ${gost.id}`}
            action={updateGost}
            submitLabel={t.uredi_gosta}
            cancelLabel={t.otkazi}
            cancelHref="/gosti"
            description={commonMessages.form_description}
        >
            <HiddenField name="lang" value={lang} />
            <HiddenField name="id" value={gost.id} />

            <InputField
                name="ime"
                label={t.ime}
                placeholder={t.ime}
                required
                defaultValue={formData.ime}
                error={errors.ime}
            />

            <InputField
                name="prezime"
                label={t.prezime}
                placeholder={t.prezime}
                required
                defaultValue={formData.prezime}
                error={errors.prezime}
            />

            <InputField
                name="email"
                label={t.email}
                placeholder={t.email}
                required
                defaultValue={formData.email}
                error={errors.email}
            />

            <InputField
                name="telefon"
                label={t.telefon}
                placeholder={t.telefon}
                defaultValue={formData.telefon}
                error={errors.telefon}
            />

        </FormWrapper>
    );
}