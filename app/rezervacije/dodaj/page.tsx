'use server';


import { dodajRezervaciju } from '@/actions/rezervacije';
import { Button } from '@/components/ui/button';
import { getLocaleMessages } from '@/i18n/i18n';
import prisma from '@/lib/prisma';

export default async function DodajPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const messages = getLocaleMessages(lang, 'rezervacije');
  const sobe = await prisma.soba.findMany();
  const gosti = await prisma.gost.findMany();

  // Prikupimo error poruke iz query parametara
  const errors: Record<string, string> = {
    soba: params.sobaError || '',
    gost: params.gostError || '',
    prijava: params.prijavaError || '',
    odjava: params.odjavaError || '',
    status: params.statusError || ''
  };

  // Popunjavanje polja iz query parametara (ako postoji)
  const formData: any = {
    soba: params.soba || '',
    gost: params.gost || '',
    prijava: params.prijava || '',
    odjava: params.odjava || '',
    status: params.status || ''
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 sm:px-0 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 sm:p-8 mt-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">{messages.addReservation}</h1>
        <form action={dodajRezervaciju} className="mb-8 flex gap-4 flex-col max-w-md mt-4 w-full" noValidate>
          <input type="hidden" name="lang" value={lang || 'mn'} />
          <label>{messages.soba}
            <select name="soba" className="border rounded px-2 py-1 w-full" required defaultValue={formData.soba}>
              <option value="">{messages.choose_room}</option>
              {sobe.map(s => (
                <option key={s.id} value={s.id}>{s.broj}</option>
              ))}
            </select>
            {errors.soba && <span className="text-red-600 text-xs">{errors.soba}</span>}
          </label>
          <label>{messages.gost}
            <select name="gost" className="border rounded px-2 py-1 w-full" required defaultValue={formData.gost}>
              <option value="">{messages.choose_guest}</option>
              {gosti.map(g => (
                <option key={g.id} value={g.id}>{g.ime} {g.prezime}</option>
              ))}
            </select>
            {errors.gost && <span className="text-red-600 text-xs">{errors.gost}</span>}
          </label>
          <input type="date" name="prijava" required className="border rounded px-2 py-1 w-full" placeholder={messages.prijava} defaultValue={formData.prijava} />
          {errors.prijava && <span className="text-red-600 text-xs">{errors.prijava}</span>}
          <input type="date" name="odjava" required className="border rounded px-2 py-1 w-full" placeholder={messages.odjava} defaultValue={formData.odjava} />
          {errors.odjava && <span className="text-red-600 text-xs">{errors.odjava}</span>}
          <input type="text" name="status" required className="border rounded px-2 py-1 w-full" placeholder={messages.status} defaultValue={formData.status} />
          {errors.status && <span className="text-red-600 text-xs">{errors.status}</span>}
          <div className="flex flex-col sm:flex-row sm:gap-x-0 gap-y-3 mt-1 pt-3 border-t">
            <a
              href={`/rezervacije?lang=${lang}`}
              className="flex-1 py-2 text-base text-gray-600 hover:text-blue-900 border rounded text-center flex items-center justify-center"
            >
              {messages.cancel}
            </a>
            <Button type="submit" >
              {messages.addReservation}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}