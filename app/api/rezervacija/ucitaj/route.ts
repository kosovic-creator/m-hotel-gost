import {  ucitajSobuId } from "@/actions/soba";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sobaIdParam = url.searchParams.get('sobaId');
  const sobaId = sobaIdParam ? Number(sobaIdParam) : undefined;

  if (!sobaId) {
    return new Response(JSON.stringify({ error: 'Nedostaje sobaId parametar' }), { status: 400 });
  }

  const sobe = await ucitajSobuId({
    sobaId: sobaId,
  });

  if (!sobe) {
    return new Response(JSON.stringify({ error: 'Greška pri učitavanju soba' }), { status: 500 });
  }
  return new Response(JSON.stringify(sobe), { status: 200 });
}