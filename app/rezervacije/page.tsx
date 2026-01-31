/* eslint-disable @typescript-eslint/no-explicit-any */
import { ucitajRezervacije } from '@/actions/rezervacije';
import { obrisiRezervaciju } from '@/actions/rezervacije';
import ObavještenjeUspjeha from '../components/ObavještenjeUspjeha';
import { getLocaleMessages } from '@/i18n/i18n';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
export const metadata: Metadata = {
  title: 'Rezervacije'
};
export default async function SobeStrana({ searchParams }: { searchParams: Promise<{ lang?: string;[key: string]: string | undefined }> }) {
  const rawRezervacije = await ucitajRezervacije();
  const rezervacije = (rawRezervacije ?? []).map((r: any) => ({
    ...r,
    soba: r.soba || {},
    gost: r.gost || {},
    datum_prijave: r.prijava,
    datum_odjave: r.odjava,
    broj_osoba: r.broj_osoba || 1
  }));
  const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const t = getLocaleMessages(lang, 'rezervacije');
  const successParam = params.success;
  const errorParam = params.error;

  return (
    <>
      {successParam && (
        <ObavještenjeUspjeha message={successParam} type="success" />
      )}
      {errorParam && (
        <ObavještenjeUspjeha message={errorParam} type="error" />
      )}
      <div className="container mx-auto py-4 px-2 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">{t.title}</h1>
        <div className="mb-4">
          <a href="/rezervacije/dodaj">
            <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
              {t.addReservation}
            </button>
          </a>
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block">
          <table className="w-full border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="w-16 text-center">ID</th>
                <th className="text-center">{t.guest_name}</th>
                <th className="text-center">{t.room}</th>
                <th className="text-center">{t.checkin_date}</th>
                <th className="text-center">{t.checkout_date}</th>
                <th className="text-center">{t.number_of_guests_label}</th>
                <th className="text-center">Status</th>
                <th className="w-32 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {rezervacije.map((rezervacija: any) => (
                <tr key={rezervacija.id} className="hover:bg-gray-50">
                  <td className="text-center font-mono">{rezervacija.id}</td>
                  <td className="text-center">{rezervacija.gost?.ime} {rezervacija.gost?.prezime}</td>
                  <td className="text-center">{rezervacija.soba?.broj}</td>
                  <td className="text-center">{rezervacija.datum_prijave ? new Date(rezervacija.datum_prijave).toISOString().slice(0, 10) : ''}</td>
                  <td className="text-center">{rezervacija.datum_odjave ? new Date(rezervacija.datum_odjave).toISOString().slice(0, 10) : ''}</td>
                  <td className="text-center">{rezervacija.broj_osoba}</td>
                  <td className='text-center'>{rezervacija.status}</td>

                  <td>
                    <div className="flex space-x-2 flex-row justify-center">
                      <form action={obrisiRezervaciju}>
                        <input type="hidden" name="id" value={rezervacija.id} />
                        <input type="hidden" name="lang" value={lang} />
                        <button type="submit" className="ml-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm">{t.removeReservation}</button>
                      </form>
                      <a href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`}>
                        <button className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm">{t.editReservation}</button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className="flex flex-col gap-4 sm:hidden">
          {rezervacije.map((rezervacija: any) => (
            <div key={rezervacija.id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-semibold">{t.guest_name}:</span>
                <span>{rezervacija.gost?.ime} {rezervacija.gost?.prezime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.room}:</span>
                <span>{rezervacija.soba?.broj}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.check_in_date}:</span>
                <span>{rezervacija.datum_prijave ? new Date(rezervacija.datum_prijave).toISOString().slice(0, 10) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.check_out_date}:</span>
                <span>{rezervacija.datum_odjave ? new Date(rezervacija.datum_odjave).toISOString().slice(0, 10) : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{t.number_of_guests_label}:</span>
                <span>{rezervacija.broj_osoba}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <form action={obrisiRezervaciju} className="flex-1">
                  <input type="hidden" name="id" value={rezervacija.id} />
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm">{t.removeReservation}</Button>
                </form>
                <a href={`/rezervacije/izmeni?id=${rezervacija.id}&lang=${lang}`} className="flex-1">
                  <Button className="w-full bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm">{t.editReservation}</Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}