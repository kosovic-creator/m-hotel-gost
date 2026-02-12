import { getRezervacijaById, izmeniRezervacijuSaGostom } from '@/actions/rezervacije';
import { FormWrapper, InputField, HiddenField, SelectField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import prisma from '@/lib/prisma';
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

    const [rezervacije, sobe, gosti] = await Promise.all([
        getRezervacijaById({ rezervacijaId: id }),
        prisma.soba.findMany(),
        prisma.gost.findMany(),
    ]);

    // Ektauj greške iz query parametara
    const errors = extractErrors(params);
    const lang = params?.lang === 'mn' ? 'mn' : 'en';
    const messages = getLocaleMessages(lang, 'rezervacije');
    const gostMessages = getLocaleMessages(lang, 'gosti');
    const commonMessages = getLocaleMessages(lang, 'common');

    // Popuni formData iz query parametara ili iz baze
    const formData: Record<string, string> = {
        // Rezervacija podaci
        soba: getFieldValue(params?.soba, rezervacije?.soba?.broj),
        prijava: getFieldValue(params?.prijava, rezervacije?.prijava, true),
        odjava: getFieldValue(params?.odjava, rezervacije?.odjava, true),
        broj_osoba: getFieldValue(params?.broj_osoba, rezervacije?.broj_osoba),
        popust: String(rezervacije?.popust ?? 0), // Eksplicitno postavljanje na 0 ako je null/undefined
        status: getFieldValue(params?.status, rezervacije?.status),

        // Gost podaci iz trenutne rezervacije ili query parametara
        gost_id: getFieldValue(params?.gost_id, rezervacije?.gost?.id),
        gost_titula: getFieldValue(params?.gost_titula, rezervacije?.gost?.titula),
        gost_ime: getFieldValue(params?.gost_ime, rezervacije?.gost?.ime),
        gost_prezime: getFieldValue(params?.gost_prezime, rezervacije?.gost?.prezime),
        gost_titula_drugog_gosta: getFieldValue(params?.gost_titula_drugog_gosta, rezervacije?.gost?.titula_drugog_gosta),
        gost_ime_drugog_gosta: getFieldValue(params?.gost_ime_drugog_gosta, rezervacije?.gost?.ime_drugog_gosta),
        gost_prezime_drugog_gosta: getFieldValue(params?.gost_prezime_drugog_gosta, rezervacije?.gost?.prezime_drugog_gosta),
        gost_adresa: getFieldValue(params?.gost_adresa, rezervacije?.gost?.adresa),
        gost_grad: getFieldValue(params?.gost_grad, rezervacije?.gost?.grad),
        gost_drzava: getFieldValue(params?.gost_drzava, rezervacije?.gost?.drzava),
        gost_email: getFieldValue(params?.gost_email, rezervacije?.gost?.email),
        gost_telefon: getFieldValue(params?.gost_telefon, rezervacije?.gost?.mob_telefon),
        postojeci_gost: getFieldValue(params?.postojeci_gost, undefined),
        koristi_postojeceg_gosta: getFieldValue(params?.koristi_postojeceg_gosta, 'false'),
    };

    return (
      <FormWrapper
          title={`${messages.editReservation} ID: ${rezervacije?.id}`}
            action={izmeniRezervacijuSaGostom}
          submitLabel={messages.saveChanges}
          cancelLabel={messages.cancel}
          cancelHref="/rezervacije"
            description={commonMessages.form_description}
      >
            <HiddenField name="id" value={rezervacije?.id || ''} />
            <HiddenField name="lang" value={lang} />
            <HiddenField name="gost_id" value={rezervacije?.gost?.id || ''} />

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
                    defaultValue={formData.popust}
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
            <div className="border-b pb-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{gostMessages.guest_details}</h3>

                {/* Trenutni gost info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{gostMessages.current_guest}</h4>
                    <p className="text-sm text-gray-600">
                        {rezervacije?.gost?.ime} {rezervacije?.gost?.prezime} ({rezervacije?.gost?.email})
                    </p>
                </div>

                {/* Toggle za postojećeg gosta */}
                <div className="mb-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            name="koristi_postojeceg_gosta"
                            value="true"
                            defaultChecked={formData.koristi_postojeceg_gosta === 'true'}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-600">{gostMessages.change_to_existing_guest}</span>
                    </label>
                </div>

                {/* Dropdown za postojećeg gosta */}
                <div id="postojeci-gost-container" style={{ display: 'none' }}>
                    <SelectField
                        name="postojeci_gost"
                        label={gostMessages.select_existing_guest}
                        placeholder={gostMessages.select_guest}
                        defaultValue={formData.postojeci_gost}
                        error={errors.postojeci_gost}
                        options={gosti.map((g) => ({
                            value: String(g.id),
                            label: `${g.ime} ${g.prezime} (${g.email})`,
                        }))}
                    />
                </div>

                {/* Polja za izmjenu gosta */}
                <div id="izmijeni-gost-container">
                    <h4 className="text-md font-medium text-gray-700 mt-6 mb-4">{gostMessages.edit_guest_details}</h4>

                    <SelectField
                        name="gost_titula"
                        label={gostMessages.title}
                        placeholder={gostMessages.select_title}
                        defaultValue={formData.gost_titula}
                        error={errors.gost_titula}
                        options={[
                            { value: "Mr", label: "Mr" },
                            { value: "Mrs", label: "Mrs" },
                            { value: "Ms", label: "Ms" },
                            { value: "Dr", label: "Dr" }
                        ]}
                    />

                    <InputField
                        name="gost_ime"
                        label={gostMessages.first_name}
                        placeholder={gostMessages.first_name_placeholder}
                        defaultValue={formData.gost_ime}
                        error={errors.gost_ime}
                    />

                    <InputField
                        name="gost_prezime"
                        label={gostMessages.last_name}
                        placeholder={gostMessages.last_name_placeholder}
                        defaultValue={formData.gost_prezime}
                        error={errors.gost_prezime}
                    />

                    <InputField
                        name="gost_email"
                        type="email"
                        label={gostMessages.email}
                        placeholder={gostMessages.email_placeholder}
                        defaultValue={formData.gost_email}
                        error={errors.gost_email}
                    />

                    <SelectField
                        name="gost_drzava"
                        label={gostMessages.country}
                        placeholder={gostMessages.select_country}
                        defaultValue={formData.gost_drzava}
                        error={errors.gost_drzava}
                        options={[
                            { value: "Montenegro", label: gostMessages.montenegro },
                            { value: "Serbia", label: gostMessages.serbia },
                            { value: "Bosnia and Herzegovina", label: gostMessages.bosnia },
                            { value: "Croatia", label: gostMessages.croatia },
                            { value: "Other", label: gostMessages.other }
                        ]}
                    />

                    <InputField
                        name="gost_telefon"
                        label={gostMessages.phone}
                        placeholder={gostMessages.phone_placeholder}
                        defaultValue={formData.gost_telefon}
                        error={errors.gost_telefon}
                    />

                    <InputField
                        name="gost_adresa"
                        label={gostMessages.address}
                        placeholder={gostMessages.address_placeholder}
                        defaultValue={formData.gost_adresa}
                        error={errors.gost_adresa}
                    />

                    <InputField
                        name="gost_grad"
                        label={gostMessages.city}
                        placeholder={gostMessages.city_placeholder}
                        defaultValue={formData.gost_grad}
                        error={errors.gost_grad}
                    />

                    {/* Drugi gost (opciono) */}
                    <div className="border-t pt-4 mt-6">
                        <h5 className="text-sm font-medium text-gray-600 mb-3">{gostMessages.second_guest_optional}</h5>

                        <SelectField
                            name="gost_titula_drugog_gosta"
                            label={gostMessages.second_guest_title}
                            placeholder={gostMessages.select_title}
                            defaultValue={formData.gost_titula_drugog_gosta}
                            error={errors.gost_titula_drugog_gosta}
                            options={[
                                { value: "Mr", label: "Mr" },
                                { value: "Mrs", label: "Mrs" },
                                { value: "Ms", label: "Ms" },
                                { value: "Dr", label: "Dr" }
                            ]}
                        />

                        <InputField
                            name="gost_ime_drugog_gosta"
                            label={gostMessages.second_guest_first_name}
                            placeholder={gostMessages.first_name_placeholder}
                            defaultValue={formData.gost_ime_drugog_gosta}
                            error={errors.gost_ime_drugog_gosta}
                        />

                        <InputField
                            name="gost_prezime_drugog_gosta"
                            label={gostMessages.second_guest_last_name}
                            placeholder={gostMessages.last_name_placeholder}
                            defaultValue={formData.gost_prezime_drugog_gosta}
                            error={errors.gost_prezime_drugog_gosta}
                        />
                    </div>
                </div>
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    const checkbox = document.querySelector('input[name="koristi_postojeceg_gosta"]');
                    const postojeciContainer = document.getElementById('postojeci-gost-container');
                    const izmijeniContainer = document.getElementById('izmijeni-gost-container');

                    function toggleContainers() {
                      if (checkbox.checked) {
                        postojeciContainer.style.display = 'block';
                        izmijeniContainer.style.display = 'none';
                      } else {
                        postojeciContainer.style.display = 'none';
                        izmijeniContainer.style.display = 'block';
                      }
                    }

                    checkbox.addEventListener('change', toggleContainers);
                    toggleContainers(); // Initial state
                  })();
                `
            }} />
        </FormWrapper>
    );
};

export default IzmeniStrana;