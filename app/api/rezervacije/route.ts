import { dodajRezervaciju, ucitajRezervacije } from "@/actions/rezervacije";
import prisma from "@/lib/prisma";

export async function GET() {
  const rezervacije = await ucitajRezervacije();
  if (!rezervacije) {
    return new Response(JSON.stringify({ error: 'Greška pri učitavanju rezervacija' }), { status: 500 });
  }
  return new Response(JSON.stringify(rezervacije), { status: 200 });
}

export async function POST(req: Request) {
  const data = await req.json();
  const formData = new Map(Object.entries(data));
  // DodajRezervaciju vraća undefined, pa ćemo ručno kreirati rezervaciju i vratiti je
  const novaRezervacija = await prisma.rezervacija.create({
    data: {
      soba: { connect: { id: Number(formData.get('soba')) } },
      gost: { connect: { id: Number(formData.get('gost')) } },
      prijava: new Date(formData.get('prijava') as string).toISOString(),
      odjava: new Date(formData.get('odjava') as string).toISOString(),
      status: formData.get('status') as string,
    },
    include: { soba: true, gost: true },
  });
  return new Response(JSON.stringify({ success: true, rezervacija: novaRezervacija }), { status: 201 });
}

// export async function POST(request: Request) {
//   const data = await request.json();
//   const novaRezervacija = await dodajRezervaciju(data);
//   if (novaRezervacija === undefined || novaRezervacija === null) {
//     return new Response(JSON.stringify({ error: 'Greška pri dodavanju rezervacije' }), { status: 500 });
//   }
//   return new Response(JSON.stringify(novaRezervacija), { status: 201 });
// }



