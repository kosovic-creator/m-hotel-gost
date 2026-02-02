import { getRezervacijaById, izmeniRezervaciju } from '@/actions/rezervacije';
import { FormWrapper, InputField, HiddenField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import { RezervacijaSearchParams } from '@/lib/types/searchParams';
import { extractErrors, getFieldValue } from '@/lib/helpers/url';

const IzmeniStrana = async ({
    searchParams
}: {
    searchParams: Promise<RezervacijaSearchParams>
}) => {
    const params = await searchParams;
    const id = params?.id ? Number(params.id) : undefined;

    if (id === undefined) {
        return <div>Nije pronađen ID rezervacije.</div>;
    }

    const rezervacije = await getRezervacijaById({ rezervacijaId: id });

    // Ekstrauj greške iz query parametara
    const errors = extractErrors(params);

    // Popuni formData iz query parametara ili iz baze
    const formData: Record<string, string> = {
        gost: getFieldValue(params?.gost, rezervacije?.gost?.id),
        soba: getFieldValue(params?.soba, rezervacije?.soba?.id),
        prijava: getFieldValue(params?.prijava, rezervacije?.prijava, true),
        odjava: getFieldValue(params?.odjava, rezervacije?.odjava, true),
        status: getFieldValue(params?.status, rezervacije?.status)
    };

    const lang = params?.lang === 'mn' ? 'mn' : 'en';
    const messages = getLocaleMessages(lang, 'rezervacije');

    return (
      <FormWrapper
          title={`${messages.editReservation} ID: ${rezervacije?.id}`}
          action={izmeniRezervaciju}
          submitLabel="Sačuvaj izmene"
          cancelLabel="Otkaži"
          cancelHref="/rezervacije"
      >
            <HiddenField name="id" value={rezervacije?.id || ''} />

            <InputField
                name="gost"
                label="Gost ID"
                defaultValue={formData.gost}
                error={errors.gost}
                required
            />

            <InputField
                name="soba"
                label="Soba ID"
                defaultValue={formData.soba}
                error={errors.soba}
                required
            />

            <InputField
                name="prijava"
                type="date"
                label="Prijava"
                defaultValue={formData.prijava}
                error={errors.prijava}
                required
            />

            <InputField
                name="odjava"
                type="date"
                label="Odjava"
                defaultValue={formData.odjava}
                error={errors.odjava}
                required
            />

            <InputField
                name="status"
                label="Status"
                defaultValue={formData.status}
                error={errors.status}
                required
            />
        </FormWrapper>
    );
};

export default IzmeniStrana;