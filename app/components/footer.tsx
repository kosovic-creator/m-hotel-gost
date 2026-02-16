"use client";
import { getLocaleMessages } from '@/i18n/i18n';
import { useEffect, useState } from 'react';

export function Footer() {
  const [t, setT] = useState<{ footer_rights_reserved: string; footer_brand: string }>({
    footer_rights_reserved: '',
    footer_brand: ''
  });
  const [lang, setLang] = useState<'sr' | 'en'>('sr');

  useEffect(() => {
    const loadMessages = async () => {
      const currentLang = (document.documentElement.lang || 'sr') as 'sr' | 'en';
      setLang(currentLang);

      try {
        const messages = await getLocaleMessages(currentLang, 'common');
        setT({
          footer_rights_reserved: messages?.footer_rights_reserved || 'All rights reserved.',
          footer_brand: messages?.footer_brand || 'M-Hotel'
        });
      } catch (error) {
        console.error('Footer localization error:', error);
      }
    };

    loadMessages();

    // Pratite promjene atributa
    const observer = new MutationObserver(() => {
      loadMessages();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="mt-auto border-t py-4 text-center text-sm text-gray-200 bg-gray-800">
      © {new Date().getFullYear()} {t.footer_brand}. {t.footer_rights_reserved}
    </footer>
  );
}
