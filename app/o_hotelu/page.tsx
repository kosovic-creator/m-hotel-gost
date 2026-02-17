import React from 'react'
import { getLocale } from '@/i18n/locale';
import { getLocaleMessages } from '@/i18n/i18n';

const OHotelu = async () => {
  const lang = await getLocale();
  const t = await getLocaleMessages(lang, 'o_hotelu');
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-2xl text-center text-amber-500 space-y-5 px-4 py-8 rounded-lg shadow-lg">
        <p>{t.description}</p>
      </div>
    </div>
  )
}

export default OHotelu