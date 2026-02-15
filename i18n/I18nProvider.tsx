'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import i18n from './config';

type Language = 'sr' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (namespace: string, key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  children,
  initialLang = 'sr',
}: {
  children: ReactNode;
  initialLang?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLang);
  const router = useRouter();

  // Inicijalizuj i18next sa početnim jezikom
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    // Postavi cookie
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;

    // Ažuriraj state
    setLanguageState(lang);

    // Promeni jezik u i18next
    i18n.changeLanguage(lang);

    // Refreshuj stranicu da bi server komponente učitale novi jezik
    router.refresh();
  };

  const t = (namespace: string, key: string): string => {
    return i18n.t(key, { ns: namespace }) || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
