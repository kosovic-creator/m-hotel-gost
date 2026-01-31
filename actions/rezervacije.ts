/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const ucitajRezervacije = async () => {
  try {
    const rezervacija = await prisma.rezervacija.findMany();
    return rezervacija;
  } catch (error) {
    console.error("Greška pri učitavanju rezervacija:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
// }
// export const ucitajRezervacijuId = async (searchParams: { rezervacijaId: number }) => {
//   try {
//     const rezervacija = await prisma.rezervacija.findUnique({
//       where: { id: searchParams.rezervacijaId },
//     });
//     return rezervacija;
//   } catch (error) {
//     console.error("Greška pri učitavanju rezervacije:", error);
//     return null;
//   } finally {
//     await prisma.$disconnect();
//   }
// };
// export async function dodajRezervaciju(formData: FormData) {
//   // Server-side validacija
//   // Dinamički import zbog servera
//   const rezervacijaSchema = (await import('@/app/validation/rezervacijaSchema'));
//   const broj = formData.get('broj') as string;
//   const tip = formData.get('tip') as string;
//   const kapacitet = Number(formData.get('kapacitet'));
//   const cena = Number(formData.get('cena'));
//   const opis = formData.get('opis') as string;
//   const slikeRaw = formData.get('slike') as string;
//   const tip_en = formData.get('tip_en') as string;
//   const opis_en = formData.get('opis_en') as string;
//   const lang = (formData.get('lang') as string) || 'mn';

//   // Pretvori slike iz CSV u array
//   const slike = slikeRaw.split(',').map(s => s.trim()).filter(Boolean);

//   // Validacija
//   // const t = (key: string) => key; // fallback za server
//   // const result = rezervacijaSchema(t).safeParse({ broj, tip, kapacitet, cena, opis, slike, tip_en, opis_en });
//   // if (!result.success) {
//   //   revalidatePath('/sobe');
//   //   const params = new URLSearchParams();
//   //   params.append('error', 'error');
//   //   redirect(`/sobe?${params.toString()}`);
//   //   return;
//   // }

//   try {
//     await prisma.rezervacija.create({
//       data: { broj, tip, kapacitet, cena, opis, slike, tip_en, opis_en },
//     });
//   } catch (error: any) {
//     revalidatePath('/sobe');
//     const params = new URLSearchParams();
//     if (error.code === 'P2002') {
//       params.append('error', 'exists');
//     } else {
//       params.append('error', 'error');
//     }
//     redirect(`/sobe?${params.toString()}`);
//     return;
//   }
//   revalidatePath('/sobe');
//   const params = new URLSearchParams();
//   params.append('success', 'added');
//   redirect(`/sobe?${params.toString()}`);

// }



// export const azurirajSobu = async (formData: FormData) => {
//   "use server";
//   const id = Number(formData.get('id'));


//   const broj = formData.get('broj') as string | null;
//   const tip = formData.get('tip') as string | null;
//   const kapacitet = formData.get('kapacitet') ? Number(formData.get('kapacitet')) : null;
//   const cena = formData.get('cena') ? Number(formData.get('cena')) : null;
//   const opis = formData.get('opis') as string | null;
//   const tip_en = formData.get('tip_en') as string | null;
//   const opis_en = formData.get('opis_en') as string | null;
//   const slikeRaw = formData.get('slike') as string | null;
//   const lang = (formData.get('lang') as string) || 'mn';

//   // Pretvori slike iz CSV u array
//   const slike = slikeRaw ? slikeRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;

//   // Priprema objekta za ažuriranje
//   const updatedDetails: { broj?: string; tip?: string; kapacitet?: number; cena?: number; opis?: string; tip_en?: string; opis_en?: string; slike?: string[] } = {};
//   if (broj !== null) updatedDetails.broj = broj;
//   if (tip !== null) updatedDetails.tip = tip;
//   if (kapacitet !== null) updatedDetails.kapacitet = kapacitet;
//   if (cena !== null) updatedDetails.cena = cena;
//   if (opis !== null) updatedDetails.opis = opis;
//   if (tip_en !== null) updatedDetails.tip_en = tip_en;
//   if (opis_en !== null) updatedDetails.opis_en = opis_en;
//   if (slike !== undefined) updatedDetails.slike = slike;
//   if (opis !== null) updatedDetails.opis = opis;
//   if (tip_en !== null) updatedDetails.tip_en = tip_en;
//   if (opis_en !== null) updatedDetails.opis_en = opis_en;
//   if (slike !== null) updatedDetails.slike = slike;

//   try {
//     await prisma.rezervacija.update({
//       where: { id },
//       data: updatedDetails,
//     });
//   } catch (error: any) {
//     revalidatePath('/sobe');
//     const params = new URLSearchParams();
//     if (error.code === 'P2002') {
//       params.append('error', 'exists');
//     } else {
//       params.append('error', 'error');
//     }
//     redirect(`/sobe?${params.toString()}`);
//     return;
//   }
//   if (tip === null) {
//     revalidatePath('/sobe');
//     const params = new URLSearchParams();
//     params.append('error', 'error'); // ili poseban ključ za "Izaberite Tip Sobe"
//     redirect(`/sobe?${params.toString()}`);
//     return;
//   } else if (tip.toString().length < 2) {
//     revalidatePath('/sobe');
//     const params = new URLSearchParams();
//     params.append('error', 'error'); // ili poseban ključ za "Mora biti više od 2 karaktera"
//     redirect(`/sobe?${params.toString()}`);
//     return;
//   }
//   revalidatePath('/sobe');
//   const params = new URLSearchParams();
//   params.append('success', 'updated');
//   redirect(`/sobe?${params.toString()}`);

// };


export async function obrisiSobu(formData: FormData) {
  const id = Number(formData.get('id'));
  const lang = (formData.get('lang') as string) || 'mn';
  try {
    const rezervacija = await prisma.rezervacija.findUnique({ where: { id } });
    if (!rezervacija) {
      throw new Error('notfound');
    }
    await prisma.rezervacija.delete({ where: { id } });
  } catch (error: any) {
    revalidatePath('/sobe');
    const params = new URLSearchParams();
    params.append('error', 'error');
    redirect(`/sobe?${params.toString()}`);
    return;
  }
  revalidatePath('/sobe');
  const params = new URLSearchParams();
  params.append('success', 'deleted');
  redirect(`/sobe?${params.toString()}`);
}

