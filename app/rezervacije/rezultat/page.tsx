import { getRezervacijaById } from '@/actions/rezervacije';

export default async function Rezultat(props: { searchParams: Record<string, string> }) {
  // searchParams je Promise, moraš ga await-ovati
  const searchParams = await props.searchParams;
  const rezervacijaId = Number(searchParams.id);

  if (!rezervacijaId || isNaN(rezervacijaId)) {
    return <div>Neispravan ID rezervacije.</div>;
  }

  const rezervacija = await getRezervacijaById({ rezervacijaId });

  if (!rezervacija) {
    return <div>Rezervacija nije pronađena.</div>;
  }

  return (
    <div>
      <h2>Rezervacija uspješna!</h2>
      <p>Broj rezervacije: {rezervacija.id}</p>
      <p>Gost: {rezervacija.gost.ime} {rezervacija.gost.prezime}</p>
      <p>Period: {rezervacija.prijava instanceof Date ? rezervacija.prijava.toLocaleDateString() : rezervacija.prijava} - {rezervacija.odjava instanceof Date ? rezervacija.odjava.toLocaleDateString() : rezervacija.odjava}</p>
      <p>Soba: {rezervacija.soba.broj} ({rezervacija.soba.tip})</p>
      <p>Ukupan iznos: {rezervacija.soba.cena} €</p>
      {/* Stripe dugme za plaćanje */}
      <form action="/api/payments" method="POST">
        <input type="hidden" name="rezervacijaId" value={rezervacija.id} />
        <input type="hidden" name="amount" value={rezervacija.soba.cena * 100} /> {/* Stripe traži iznos u centima */}
        <button type="submit">Proceed to Payment</button>
      </form>
    </div>
  );
}