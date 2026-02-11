'use client';


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import mnCommon from './locales/mn/common.json';
import mnAuth from './locales/mn/auth.json';
import mnNavbar from './locales/mn/navbar.json';
import enNavbar from './locales/en/navbar.json';
import enRezervacije from './locales/en/rezervacije.json';
import mnRezervacije from './locales/mn/rezervacije.json';
import mnGosti from './locales/mn/gosti.json';
import enGosti from './locales/en/gosti.json';


const resources = {
  en: {
    common: enCommon,
    auth: enAuth,



    navbar: enNavbar,
    rezervacije: enRezervacije,
    gosti: enGosti,

  },
  mn: {
    common: mnCommon,
    auth: mnAuth,
    navbar: mnNavbar,
    rezervacije: mnRezervacije,
    gosti: mnGosti,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'mn'],
      debug: false,
      ns: ['common', 'auth', 'navbar', 'rezervacije', 'gosti'],
      defaultNS: 'common',
      resources,
      backend: false, // onemogući backend loader i na klijentu
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
