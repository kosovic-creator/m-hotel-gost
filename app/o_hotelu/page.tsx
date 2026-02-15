import React from 'react'
import { getLocale } from '@/i18n/locale';

const OHotelu = async () => {
  const lang = await getLocale();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-2xl text-center text-amber-500 space-y-5 px-4 py-8 rounded-lg shadow-lg">
        {lang === "sr" ? <p>Naš hotel je modernog enterijera sa prefinjenim luksuzom, prostranih i raskošno opremljenih soba i apartmana uz unikatna kupatila koja su za svaku sobu posebno rađena. Vaš potpuni ugođaj će upotpuniti naš ostali sadržaj.</p> : <p>Our hotel features a modern interior with refined luxury, spacious and lavishly equipped rooms and suites, and unique bathrooms designed for each room. Your complete experience will be enhanced by our other amenities.</p>}
      </div>
    </div>
  )
}

export default OHotelu