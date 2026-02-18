# Popust i Računanje Cena u Rezervacijama

Ovaj projekat je ažuriran sa novom funkcionalnosti za upravljanje popustima i automatsko računanje ukupne cene rezervacija.

## 🆕 Nove funkcionalnosis

### 1. Polje "popust" u tabeli rezervacije
- Dodano novo polje `popust` (tip: Float) u Prisma schema
- Default vrednost: 0
- Opseg: 0-100 (procenti)
- Uključeno u validation schema sa proper error handling

### 2. Funkcije za računanje cena (`/lib/helpers/rezervacije.ts`)

#### `rascunajBrojDana(prijava: Date, odjava: Date): number`
Računa broj dana između datuma prijave i odjave.

#### `rascunajUkupnuCenu(cenaSobe: number, prijava: Date, odjava: Date, popustProcenat: number): number`
Računa ukupnu cenu rezervacije:
- Broj dana × cena sobe = osnovna cena
- Popust = osnovna cena × (popust % / 100)
- Ukupna cena = osnovna cena - popust

#### `dajPodatkeORezervaciji(rezervacija): object`
Vraća detaljan objekat sa svim računskim podacima:
```javascript
{
  brojDana: number,
  cenaPoDanu: number,
  osnovnaCena: number,
  popustProcenat: number,
  iznosPopusta: number,
  ukupnaCena: number
}
```

#### `rascunajUkupnePrihode(rezervacije): number`
Računa ukupne prihode od svih plaćenih rezervacija (status: 'completed' ili 'confirmed').

### 3. UI Updates

#### Forme za rezervacije (`/app/rezervacije/dodaj/` i `/app/rezervacije/izmeni/`)
- Dodano input field za popust (0-100%)
- Ažurirane validacije
- Ažurirani search params types

#### Tabela rezervacija (`RezervacijeContent.tsx`)
- Nova kolona "Popust (%)"
- Nova kolona "Ukupna Cena"
- Prikaz ukupnih prihoda na vrhu stranice
- Automatsko računanje cena za svaki red

#### Nova komponenta `RezervacijaDetalji`
Detaljan prikaz rezervacije sa kompletnim računom:
- Osnovni podaci rezervacije
- Raspored cene (osnovna cena, popust, ukupna cena)
- Formatiran prikaz valute i datuma
- Responsive design

### 4. Lokalizacija
Dodani prevodi za nova polja u oba jezika (mn/en):
- `popust`: "Popust (%)" / "Discount (%)"
- `ukupna_cena`: "Ukupna Cena" / "Total Price"
- `osnovna_cena`: "Osnovna Cena" / "Base Price"
- `broj_dana`: "Broj Dana" / "Number of Days"
- `cena_po_danu`: "Cena po Danu" / "Price per Day"
- `iznos_popusta`: "Iznos Popusta" / "Discount Amount"
- `ukupni_prihodi`: "Ukupni Prihodi" / "Total Revenue"

## 🚀 Kako koristiti

### U komponenti:
```tsx
import { dajPodatkeORezervaciji, rascunajUkupnuCenu } from '@/lib/helpers/rezervacije';

// Za jednostavno računanje cene
const ukupnaCena = rascunajUkupnuCenu(
  soba.cena,
  new Date(rezervacija.prijava),
  new Date(rezervacija.odjava),
  rezervacija.popust
);

// Za detaljan prikaz
const podaci = dajPodatkeORezervaciji(rezervacija);
console.log(`Ukupna cena: €${podaci.ukupnaCena}`);
```

### U action funkcijama:
```typescript
import { ucitajUkupnePrihode } from '@/actions/rezervacije';

// Ukupni prihodi se automatski računaju
const prihodi = await ucitajUkupnePrihode();
```

### Korišćenje komponente za detalje:
```tsx
import RezervacijaDetalji from '@/components/rezervacije/RezervacijaDetalji';

<RezervacijaDetalji
  rezervacija={rezervacija}
  lang={lang}
  t={translations}
/>
```

## 🧪 Test i Demo

`/lib/demo/rezervacijeDemo.ts` sadrži:
- Demo podatke
- Primere korišćenja svih funkcija
- Utility helpere za formatiranje
- Console output za debug

Pokretanje demo:
```bash
npx ts-node lib/demo/rezervacijeDemo.ts
```

## 📊 Primer računanja

**Rezervacija:**
- Soba: €80 po noći
- Period: 3 dana (15.03 - 18.03)
- Popust: 10%

**Račun:**
- Osnovna cena: 3 × €80 = €240
- Popust: €240 × 10% = €24
- **Ukupna cena: €216**

## 🔄 Migracija baze

Nova popust kolona je dodana u bazu koristeći:
```bash
npx prisma db push
```

Existing rezervacije automatski dobijaju `popust = 0` (default value).

## ⚡ Performance

- Svi izračuni se izvršavaju u memoriji
- Minimum database queries
- Caching friendly (rezervacije se učitavaju jednom)
- Optimized rendering (useMemo za expensive calculations)

## 🛠 Troubleshooting

1. **Type errors** - Pokrenuti `npx prisma generate`
2. **Migration issues** - Koristiti `npx prisma db push` umesto migrate dev
3. **Missing translations** - Check `/i18n/locales/` fajlovi
4. **Calculation errors** - Verifikovati da su datumi valid Date objekti