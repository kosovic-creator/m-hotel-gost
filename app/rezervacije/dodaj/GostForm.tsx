'use client';

import { useEffect, useState } from 'react';
import { InputField, SelectField } from '@/components/form/FormComponents';

interface Gost {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  telefon: string | null;
}

interface GostFormProps {
  gosti: Gost[];
  gostMessages: Record<string, string>;
  errors: Record<string, string[] | undefined>;
  formData: Record<string, string>;
}

export default function GostForm({ gosti, gostMessages, errors, formData }: GostFormProps) {
  const [koristiPostojeceg, setKoristiPostojeceg] = useState(formData.koristi_postojeceg_gosta === 'true');
  const [izabraniGostId, setIzabraniGostId] = useState(formData.postojeci_gost || '');
  const [gostPodaci, setGostPodaci] = useState({
    ime: formData.gost_ime || '',
    prezime: formData.gost_prezime || '',
    email: formData.gost_email || '',
    telefon: formData.gost_telefon || '',
    titula: formData.gost_titula || '',
  });

  // Helper funkcija za konvertovanje errors
  const getError = (field: string): string | undefined => {
    const error = errors[field];
    return error && Array.isArray(error) ? error[0] : undefined;
  };

  useEffect(() => {
    if (koristiPostojeceg && izabraniGostId) {
      const izabraniGost = gosti.find(g => String(g.id) === izabraniGostId);
      if (izabraniGost) {
        // Updateuj podatke odmah
        const noviPodaci = {
          ime: izabraniGost.ime,
          prezime: izabraniGost.prezime,
          email: izabraniGost.email,
          telefon: izabraniGost.telefon || '',
          // titula nije u Gost, pa fallback na formData ili prazno
          titula: formData.gost_titula || '',
        };
        setGostPodaci(noviPodaci);
      }
    } else if (!koristiPostojeceg) {
      // Očisti polja kada se prebaci na novog gosta
      const praznaPodaci = {
        ime: '',
        prezime: '',
        email: '',
        telefon: '',
        titula: '',
      };
      setGostPodaci(praznaPodaci);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [koristiPostojeceg, izabraniGostId]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKoristiPostojeceg(e.target.checked);
  };

  const handleGostSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIzabraniGostId(e.target.value);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!koristiPostojeceg) {
      setGostPodaci(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    }
  };

  const handleSelectChange = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!koristiPostojeceg) {
      setGostPodaci(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validacija titule gosta
    if (!formData.gost_titula || formData.gost_titula === '') {
      // Postavi grešku (možeš koristiti setErrors ako postoji)
      alert(gostMessages.titula_required); // ili prikazati poruku na formi
      return;
    }

    // ...dalji kod za submit...
  };

  return (
    <div className="border-b pb-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{gostMessages.guest_details}</h3>

      {/* Toggle za postojećeg gosta */}
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="koristi_postojeceg_gosta"
            value="true"
            checked={koristiPostojeceg}
            onChange={handleCheckboxChange}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">{gostMessages.use_existing_guest}</span>
        </label>
      </div>

      {/* Dropdown za postojećeg gosta */}
      {koristiPostojeceg && (
        <div className="mb-4">
          <SelectField
            name="postojeci_gost"
            label={gostMessages.select_existing_guest}
            placeholder={gostMessages.select_guest}
            defaultValue={izabraniGostId}
            error={getError('postojeci_gost')}
            options={gosti.map((g) => ({
              value: String(g.id),
              label: `${g.ime} ${g.prezime} (${g.email})`,
            }))}
            onChange={handleGostSelectChange}
          />
        </div>
      )}

      {/* Polja za gosta */}
      <div className="space-y-4">
        {/* Prvi gost */}
        <h4 className="text-md font-medium text-gray-700 mt-6 mb-4">
          {koristiPostojeceg ? gostMessages.guest_details : gostMessages.add_new_guest}
        </h4>

        <InputField
          name="gost_ime"
          label={gostMessages.first_name}
          placeholder={gostMessages.first_name_placeholder}
          value={gostPodaci.ime}
          error={getError('gost_ime')}
          readOnly={koristiPostojeceg}
          onChange={handleInputChange('ime')}
        />

        <InputField
          name="gost_prezime"
          label={gostMessages.last_name}
          placeholder={gostMessages.last_name_placeholder}
          value={gostPodaci.prezime}
          error={getError('gost_prezime')}
          readOnly={koristiPostojeceg}
          onChange={handleInputChange('prezime')}
        />

        <InputField
          name="gost_email"
          type="email"
          label={gostMessages.email}
          placeholder={gostMessages.email_placeholder}
          value={gostPodaci.email}
          error={getError('gost_email')}
          readOnly={koristiPostojeceg}
          onChange={handleInputChange('email')}
        />

        <InputField
          name="gost_telefon"
          label={gostMessages.phone}
          placeholder={gostMessages.phone_placeholder}
          value={gostPodaci.telefon}
          error={getError('gost_telefon')}
          readOnly={koristiPostojeceg}
          onChange={handleInputChange('telefon')}
        />

        <InputField
          name="gost_adresa"
          label={gostMessages.address}
          placeholder={gostMessages.address_placeholder}
          defaultValue={formData.gost_adresa || ''}
          error={getError('gost_adresa')}
        />

        <InputField
          name="gost_grad"
          label={gostMessages.city}
          placeholder={gostMessages.city_placeholder}
          defaultValue={formData.gost_grad || ''}
          error={getError('gost_grad')}
        />

        <SelectField
          name="gost_drzava"
          label={gostMessages.country}
          placeholder={gostMessages.select_country}
          defaultValue={formData.gost_drzava || ''}
          error={getError('gost_drzava')}
          options={[
            { value: '', label: gostMessages.select_country },
            { value: 'Montenegro', label: gostMessages.montenegro },
            { value: 'Serbia', label: gostMessages.serbia },
            { value: 'Bosnia and Herzegovina', label: gostMessages.bosnia },
            { value: 'Croatia', label: gostMessages.croatia },
            { value: 'Other', label: gostMessages.other },
          ]}
        />

        <SelectField
          name="gost_titula"
          label={gostMessages.titula}
          placeholder={gostMessages.select_title}
          value={gostPodaci.titula || ''}
          error={getError('gost_titula')}
          required
          options={[
            { value: '', label: gostMessages.select_title },
            { value: 'Mr', label: 'Mr' },
            { value: 'Mrs', label: 'Mrs' },
            { value: 'Ms', label: 'Ms' },
            { value: 'Dr', label: 'Dr' },
          ]}
          onChange={handleSelectChange('titula')}
        />

        {/* Drugi gost (opciono) */}
        <h4 className="text-md font-medium text-gray-700 mt-8 mb-4">
          {gostMessages.second_guest_optional}
        </h4>

        <SelectField
          name="gost_titula_drugog_gosta"
          label={gostMessages.second_guest_title}
          placeholder={gostMessages.select_title}
          defaultValue={formData.gost_titula_drugog_gosta || ''}
          error={getError('gost_titula_drugog_gosta')}
          options={[
            { value: '', label: gostMessages.select_title },
            { value: 'Mr', label: 'Mr' },
            { value: 'Mrs', label: 'Mrs' },
            { value: 'Ms', label: 'Ms' },
            { value: 'Dr', label: 'Dr' },
          ]}
          onChange={handleSelectChange('titula_drugog_gosta')}
        />

        <InputField
          name="gost_ime_drugog_gosta"
          label={gostMessages.second_guest_first_name}
          placeholder={gostMessages.first_name_placeholder}
          defaultValue={formData.gost_ime_drugog_gosta || ''}
          error={getError('gost_ime_drugog_gosta')}
          onChange={handleInputChange('ime_drugog_gosta')}
        />

        <InputField
          name="gost_prezime_drugog_gosta"
          label={gostMessages.second_guest_last_name}
          placeholder={gostMessages.last_name_placeholder}
          defaultValue={formData.gost_prezime_drugog_gosta || ''}
          error={getError('gost_prezime_drugog_gosta')}
          onChange={handleInputChange('prezime_drugog_gosta')}
        />
      </div>


      {/* ...ostala polja... */}
      <SelectField
        name="gost_titula"
        label={gostMessages.titula}
        placeholder={gostMessages.select_title}
        value={gostPodaci.titula || ''}
        error={getError('gost_titula')}
        required
        options={[
          { value: '', label: gostMessages.select_title },
          { value: 'Mr', label: 'Mr' },
          { value: 'Mrs', label: 'Mrs' },
          { value: 'Ms', label: 'Ms' },
          { value: 'Dr', label: 'Dr' },
        ]}
        onChange={handleSelectChange('titula')}
      />
      {/* ...ostala polja... */}

    </div>
  );
}