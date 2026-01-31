
import { ucitajRezervacije} from "@/actions/rezervacije";

export async function GET() {
  const rezervacije = await ucitajRezervacije();
  if (!rezervacije) {
    return new Response(JSON.stringify({ error: 'Greška pri učitavanju rezervacija' }), { status: 500 });
  }
  return new Response(JSON.stringify(rezervacije), { status: 200 });
}

// export async function POST(request: Request) {
//   const data = await request.json();
//   const novaRezervacija = await dodajRezervaciju(data);
//   if (novaRezervacija === undefined || novaRezervacija === null) {
//     return new Response(JSON.stringify({ error: 'Greška pri dodavanju rezervacije' }), { status: 500 });
//   }
//   return new Response(JSON.stringify(novaRezervacija), { status: 201 });
// }



