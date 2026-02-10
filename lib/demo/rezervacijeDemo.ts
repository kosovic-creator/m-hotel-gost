/**
 * Demo i test fajl za funkcije rezervacije
 * Ovaj fajl demonstrira kako koristiti nove funkcije za računanje cena
 */

import {
  rascunajBrojDana,
  rascunajUkupnuCenu,
  dajPodatkeORezervaciji,
  rascunajUkupnePrihode
} from '../helpers/rezervacije';

// Demo podaci za testiranje
const demoRezervacija = {
  prijava: new Date('2025-03-15'),
  odjava: new Date('2025-03-18'), // 3 dana
  popust: 10, // 10% popust
  soba: { cena: 80 } // €80 po noći
};

const demoRezervacije = [
  {
    prijava: '2025-01-01',
    odjava: '2025-01-05', // 4 dana
    popust: 5,
    status: 'completed',
    soba: { cena: 100 }
  },
  {
    prijava: '2025-01-10',
    odjava: '2025-01-12', // 2 dana
    popust: 0,
    status: 'confirmed',
    soba: { cena: 75 }
  },
  {
    prijava: '2025-01-15',
    odjava: '2025-01-18', // 3 dana
    popust: 15,
    status: 'cancelled', // Ova se neće računati u prihode
    soba: { cena: 90 }
  }
];

/**
 * Demo kako koristiti funkcije
 */
export function demoRezervacijeFunkcije() {
  console.log('=== DEMO: Funkcije za rezervacije ===\n');

  // 1. Računanje broja dana
  const brojDana = rascunajBrojDana(demoRezervacija.prijava, demoRezervacija.odjava);
  console.log(`📅 Broj dana: ${brojDana}`);

  // 2. Računanje ukupne cene sa popustom
  const ukupnaCena = rascunajUkupnuCenu(
    demoRezervacija.soba.cena,
    demoRezervacija.prijava,
    demoRezervacija.odjava,
    demoRezervacija.popust
  );
  console.log(`💰 Ukupna cena: €${ukupnaCena}`);

  // 3. Detaljan prikaz rezervacije
  const podaci = dajPodatkeORezervaciji(demoRezervacija);
  console.log('\n📊 Detalji rezervacije:');
  console.log(`   Broj dana: ${podaci.brojDana}`);
  console.log(`   Cena po danu: €${podaci.cenaPoDanu}`);
  console.log(`   Osnovna cena: €${podaci.osnovnaCena}`);
  console.log(`   Popust: ${podaci.popustProcenat}%`);
  console.log(`   Iznos popusta: €${podaci.iznosPopusta}`);
  console.log(`   UKUPNA CENA: €${podaci.ukupnaCena}`);

  // 4. Računanje ukupnih prihoda
  const ukupniPrihodi = rascunajUkupnePrihode(demoRezervacije);
  console.log(`\n🏦 Ukupni prihodi iz ${demoRezervacije.length} rezervacija: €${ukupniPrihodi}`);

  return {
    brojDana,
    ukupnaCena,
    podaci,
    ukupniPrihodi
  };
}

/**
 * Utility helper za formatiranje cene u komponenti
 */
export function formatCurrency(amount: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Utility helper za izračunavanje popusta u procentima
 */
export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

// Izvršava demo ako je fajl pokrenut direktno
if (typeof window === 'undefined' && require.main === module) {
  demoRezervacijeFunkcije();
}