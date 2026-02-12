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
      </div>
    </div>
  );
}