"use client";
import { getLocaleMessages } from '@/i18n/i18n';
import { getLocale } from '@/i18n/locale';
import { useEffect, useState } from 'react';

export function Footer() {
  const [t, setT] = useState<{ footer_rights: string, footer_brand: string }>({ footer_rights: '', footer_brand: '' });

  useEffect(() => {
    (async () => {
      const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'sr';
      const messages = await getLocaleMessages(lang, 'common');
      setT({
        footer_rights: messages.footer_rights || 'All rights reserved.',
        footer_brand: messages.footer_brand || 'M-Hotel'
      });
    })();
  }, []);

  return (
    <footer className=" mt-auto border-t py-4 text-center text-sm text-gray-200 bg-gray-800">
      © {new Date().getFullYear()} {t.footer_brand}. {t.footer_rights}
    </footer>
  );
}
