/**
 * Funkcije za računanje rezervacija
 */

// Računa broj dana između dva datuma
export function rascunajBrojDana(prijava: Date, odjava: Date): number {
  const diffTime = Math.abs(odjava.getTime() - prijava.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Računa ukupnu cenu rezervacije sa popustom
export function rascunajUkupnuCenu(
  cenaSobe: number,
  prijava: Date,
  odjava: Date,
  popustProcenat: number = 0
): number {
  const brojDana = rascunajBrojDana(prijava, odjava);
  const osnovnaCena = brojDana * cenaSobe;
  const popust = osnovnaCena * (popustProcenat / 100);
  const konacnaCena = osnovnaCena - popust;

  return Math.round(konacnaCena * 100) / 100; // zaokruži na 2 decimale
}

// Računa podatke o rezervaciji za prikaz
export function dajPodatkeORezervaciji(rezervacija: {
  prijava: Date;
  odjava: Date;
  popust: number;
  soba: { cena: number };
}) {
  const brojDana = rascunajBrojDana(rezervacija.prijava, rezervacija.odjava);
  const osnovnaCena = brojDana * rezervacija.soba.cena;
  const ukupnaCena = rascunajUkupnuCenu(
    rezervacija.soba.cena,
    rezervacija.prijava,
    rezervacija.odjava,
    rezervacija.popust
  );
  const iznosPopusta = osnovnaCena - ukupnaCena;

  return {
    brojDana,
    cenaPoDanu: rezervacija.soba.cena,
    osnovnaCena,
    popustProcenat: rezervacija.popust,
    iznosPopusta,
    ukupnaCena
  };
}

// Računa ukupnu vrednost svih plaćenih rezervacija
export function rascunajUkupnePrihode(rezervacije: Array<{
  prijava: Date | string;
  odjava: Date | string;
  popust: number;
  status: string;
  soba: { cena: number };
}>): number {
  return rezervacije
    .filter(r => r.status === 'completed' || r.status === 'confirmed' || r.status === 'paid')
    .reduce((ukupno, rezervacija) => {
      const prijava = new Date(rezervacija.prijava);
      const odjava = new Date(rezervacija.odjava);
      const ukupnaCena = rascunajUkupnuCenu(
        rezervacija.soba.cena,
        prijava,
        odjava,
        rezervacija.popust
      );
      return ukupno + ukupnaCena;
    }, 0);
}