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
import mnSobe from './locales/mn/sobe.json';
import enSobe from './locales/en/sobe.json';
import enOHotelu from './locales/en/o_hotelu.json';
import mnOHotelu from './locales/mn/o_hotelu.json';


const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    navbar: enNavbar,
    rezervacije: enRezervacije,
    gosti: enGosti,
    sobe: enSobe,
    o_hotelu: enOHotelu,
  },
  mn: {
    common: mnCommon,
    auth: mnAuth,
    navbar: mnNavbar,
    rezervacije: mnRezervacije,
    gosti: mnGosti,
    sobe: mnSobe,
    o_hotelu: mnOHotelu,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'mn'],
      debug: false,
      ns: ['common', 'auth', 'navbar', 'rezervacije', 'gosti', 'sobe', 'o_hotelu'],
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
