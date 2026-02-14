/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rezervacijaSchema } from '@/app/validacija/rezervacijaSchema';
import { rezervacijaGostSchema } from '@/app/validacija/rezervacijaGostSchema';
import { getLocaleMessages } from '@/i18n/i18n';
import { createErrorRedirect, createSuccessRedirect, createFailureRedirect, toDateInput } from '@/lib/formHelpers';
import { sendReservationConfirmationEmail } from '@/lib/email';
import { rascunajUkupnuCenu } from '@/lib/helpers/rezervacije';


export const ucitajRezervacije = async (search?: string) => {
  try {
    const whereClause = search ? {
      gost: {
        OR: [
          { ime: { contains: search, mode: 'insensitive' as const } },
          { prezime: { contains: search, mode: 'insensitive' as const } }
        ]
      }
    } : {};

    const rezervacija = await prisma.rezervacija.findMany({
      where: whereClause,
      include: {
        gost: true,
        soba: true,
      },
      orderBy: {
        prijava: 'desc'
      }
    });
    return rezervacija;
  } catch (error) {
    console.error("Greška pri učitavanju rezervacija:", error);
    return null;
  }
}

// Pomoćna funkcija za provjeru preklapanja perioda
async function provjeriPreklapanjeRezervacije(
  sobaBroj: string,
  prijava: Date,
  odjava: Date,
  excludeId?: number
) {
  const existingReservations = await prisma.rezervacija.findMany({
    where: {
      soba: {
        broj: sobaBroj
      },
      ...(excludeId && { NOT: { id: excludeId } })
    },
  });

  return existingReservations.some(rez => {
    // Preklapanje se dešava kada:
    // nova_prijava < postojeca_odjava AND nova_odjava > postojeca_prijava
    return prijava < rez.odjava && odjava > rez.prijava;
  });
}

export async function dodajRezervaciju(formData: FormData) {
  const soba = formData.get('soba');
  const gost = formData.get('gost');
  const prijava = formData.get('prijava');
  const odjava = formData.get('odjava');
  const broj_osoba = formData.get('broj_osoba');
  const popust = formData.get('popust');
  const status = formData.get('status');
  const lang= (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  const messages = getLocaleMessages(lang, 'rezervacije');
  const t = (key: string) => messages[key] || key;
  const result = rezervacijaSchema(t).safeParse({
    soba,
    gost,
    prijava,
    odjava,
    broj_osoba,
    popust,
    status
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formValues = {
      soba: soba ? String(soba) : '',
      gost: gost ? String(gost) : '',
      prijava: toDateInput(prijava),
      odjava: toDateInput(odjava),
      broj_osoba: broj_osoba ? String(broj_osoba) : '1',
      popust: popust ? String(popust) : '0',
      status: status ? String(status) : ''
    };
    redirect(createErrorRedirect('/rezervacije/dodaj', errors, formValues, lang));
  }

  let rezervacijaId: number | null = null;
  try {
    const sobaBroj = soba as string;
    const gostId = Number(gost);
    const prijavaDate = new Date(prijava as string);
    const odjavyDate = new Date(odjava as string);

    // Provjeri da li je soba već rezervisana u tom periodu
    const prekolapanje = await provjeriPreklapanjeRezervacije(sobaBroj, prijavaDate, odjavyDate);

    if (prekolapanje) {
      redirect(createFailureRedirect('/rezervacije/dodaj', 'overlapError', lang));
    }

    // Kreiraj rezervaciju i učitaj sve potrebne podatke
    const novaRezervacija = await prisma.rezervacija.create({
      data: {
        soba: { connect: { broj: sobaBroj } },
        gost: { connect: { id: gostId } },
        prijava: prijavaDate,
        odjava: odjavyDate,
        broj_osoba: Number(broj_osoba) || 1,
        popust: Number(popust) || 0,
        status: status as string
      },
      include: {
        gost: true,
        soba: true,
      }
    });
    rezervacijaId = novaRezervacija.id;

    // Pošalji email potvrdu nakon što je rezervacija kreirana
    try {
      const totalPrice = rascunajUkupnuCenu(
        novaRezervacija.soba.cena,
        novaRezervacija.prijava,
        novaRezervacija.odjava,
        novaRezervacija.popust
      );

      await sendReservationConfirmationEmail(
        {
          gost: novaRezervacija.gost,
          rezervacija: novaRezervacija,
          totalPrice
        },
        lang
      );
    } catch (emailError) {
      console.error('Greška pri slanju potvrdnog emaila:', emailError);
      // Nastavi sa redirekcijom čak i ako email slanje ne uspije
    }
  } catch (error: any) {
    revalidatePath('/rezervacije');
    const message = error.code === 'P2002' ? 'errorExists' : 'errorGeneral';
    return { success: false, message };
  }

  revalidatePath('/rezervacije');
  return { success: true, redirectTo: `/rezervacije/${rezervacijaId}` };
}

export async function getRezervacijaById(searchParams: { rezervacijaId: number }) {
  try {
    const id = Number(searchParams.rezervacijaId);
    if (!id || isNaN(id)) {
      throw new Error('Neispravan ID rezervacije');
    }
    const rezervacija = await prisma.rezervacija.findUnique({
      where: { id },
      include: {
        gost: true,
        soba: true,
      },
    });
    return rezervacija;
  } catch (error) {
    console.error("Greška pri učitavanju rezervacije:", error);
    return null;
  }
}

export async function izmeniRezervaciju(formData: FormData) {
  const id = Number(formData.get('id'));
  const soba = formData.get('soba');
  const gost = formData.get('gost');
  const prijava = formData.get('prijava');
  const odjava = formData.get('odjava');
  const broj_osoba = formData.get('broj_osoba');
  const popust = formData.get('popust');
  const status = formData.get('status');
  const lang= (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  const messages = getLocaleMessages(lang, 'rezervacije');
  const t = (key: string) => messages[key] || key;
  const result = rezervacijaSchema(t).safeParse({ soba, gost, prijava, odjava, broj_osoba, popust, status });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formValues = {
      id,
      soba: soba ? String(soba) : '',
      gost: gost ? String(gost) : '',
      prijava: toDateInput(prijava),
      odjava: toDateInput(odjava),
      broj_osoba: broj_osoba ? String(broj_osoba) : '1',
      popust: popust ? String(popust) : '0',
      status: status ? String(status) : ''
    };
    redirect(createErrorRedirect('/rezervacije/izmeni', errors, formValues, lang));
  }

  try {
    const sobaBroj = soba as string;
    const gostId = Number(gost);
    const prijavaDate = new Date(prijava as string);
    const odjavyDate = new Date(odjava as string);

    // Provjeri da li je soba već rezervisana u tom periodu (isključi trenutnu rezervaciju)
    const prekolapanje = await provjeriPreklapanjeRezervacije(sobaBroj, prijavaDate, odjavyDate, id);

    if (prekolapanje) {
      redirect(createFailureRedirect('/rezervacije/izmeni', 'overlapError', lang));
    }

    await prisma.rezervacija.update({
      where: { id },
      data: {
        soba: { connect: { broj: sobaBroj } },
        gost: { connect: { id: gostId } },
        prijava: prijavaDate,
        odjava: odjavyDate,
        broj_osoba: Number(broj_osoba) || 1,
        popust: Number(popust) || 0,
        status: status as string
      },
    });
  } catch {
    revalidatePath('/rezervacije');
    redirect(createFailureRedirect('/rezervacije', 'errorGeneral', lang));
  }

  revalidatePath('/rezervacije');
  redirect(createSuccessRedirect('/rezervacije', 'successUpdated', lang));
}

export async function obrisiRezervaciju(formData: FormData) {
  const id = Number(formData.get('id'));
  const lang= (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  try {
    const rezervacija = await prisma.rezervacija.findUnique({ where: { id } });
    if (!rezervacija) {
      throw new Error('errorNotFound');
    }
    await prisma.rezervacija.delete({ where: { id } });
  } catch {
    revalidatePath('/rezervacije');
    redirect(createFailureRedirect('/rezervacije', 'errorGeneral', lang));
  }

  revalidatePath('/rezervacije');
  redirect(createSuccessRedirect('/rezervacije', 'successDeleted', lang));
}

// Nova transakcijska funkcija za kreiranje rezervacije sa gostom

export async function dodajRezervacijuSaGostom(formData: FormData) {
  const soba = formData.get('soba');
  const prijava = formData.get('prijava');
  const odjava = formData.get('odjava');
  const broj_osoba = formData.get('broj_osoba');
  const popust = formData.get('popust');
  const status = formData.get('status');
  const lang = (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  // Podaci o gostu
  const gost_titula = formData.get('gost_titula');
  const gost_ime = formData.get('gost_ime');
  const gost_prezime = formData.get('gost_prezime');
  const gost_titula_drugog_gosta = formData.get('gost_titula_drugog_gosta');
  const gost_ime_drugog_gosta = formData.get('gost_ime_drugog_gosta');
  const gost_prezime_drugog_gosta = formData.get('gost_prezime_drugog_gosta');
  const gost_adresa = formData.get('gost_adresa');
  const gost_grad = formData.get('gost_grad');
  const gost_drzava = formData.get('gost_drzava');
  const gost_email = formData.get('gost_email');
  const gost_telefon = formData.get('gost_telefon');

  // Postojeći gost opcije
  const postojeci_gost = formData.get('postojeci_gost');
  const koristi_postojeceg_gosta = formData.get('koristi_postojeceg_gosta') === 'true';

  const messages = getLocaleMessages(lang, 'rezervacije');
  const t = (key: string) => messages[key] || key;

  const result = rezervacijaGostSchema(t).safeParse({
    soba,
    prijava,
    odjava,
    broj_osoba,
    popust,
    status,
    gost_titula,
    gost_ime,
    gost_prezime,
    gost_titula_drugog_gosta,
    gost_ime_drugog_gosta,
    gost_prezime_drugog_gosta,
    gost_adresa,
    gost_grad,
    gost_drzava,
    gost_email,
    gost_telefon,
    postojeci_gost,
    koristi_postojeceg_gosta
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formValues = {
      soba: soba ? String(soba) : '',
      prijava: toDateInput(prijava),
      odjava: toDateInput(odjava),
      broj_osoba: broj_osoba ? String(broj_osoba) : '1',
      popust: popust ? String(popust) : '0',
      status: status ? String(status) : '',
      gost_titula: gost_titula ? String(gost_titula) : '',
      gost_ime: gost_ime ? String(gost_ime) : '',
      gost_prezime: gost_prezime ? String(gost_prezime) : '',
      gost_titula_drugog_gosta: gost_titula_drugog_gosta ? String(gost_titula_drugog_gosta) : '',
      gost_ime_drugog_gosta: gost_ime_drugog_gosta ? String(gost_ime_drugog_gosta) : '',
      gost_prezime_drugog_gosta: gost_prezime_drugog_gosta ? String(gost_prezime_drugog_gosta) : '',
      gost_adresa: gost_adresa ? String(gost_adresa) : '',
      gost_grad: gost_grad ? String(gost_grad) : '',
      gost_drzava: gost_drzava ? String(gost_drzava) : '',
      gost_email: gost_email ? String(gost_email) : '',
      gost_telefon: gost_telefon ? String(gost_telefon) : '',
      postojeci_gost: postojeci_gost ? String(postojeci_gost) : '',
      koristi_postojeceg_gosta: String(koristi_postojeceg_gosta)
    };
    redirect(createErrorRedirect('/rezervacije/dodaj', errors, formValues, lang));
  }

  try {
    const sobaBroj = soba as string;
    const prijavaDate = new Date(prijava as string);
    const odjawaDate = new Date(odjava as string);

    // Provjeri preklapanje rezervacije
    const prekolapanje = await provjeriPreklapanjeRezervacije(sobaBroj, prijavaDate, odjawaDate);

    if (prekolapanje) {
      redirect(createFailureRedirect('/rezervacije/dodaj', 'overlapError', lang));
    }

    // Transakcija: kreiraj gosta i rezervaciju ovdje počinje transakciona funkcija
    const result = await prisma.$transaction(async (tx) => {
      let gostId: number;
      let gostData: any;

        if (koristi_postojeceg_gosta && postojeci_gost) {
          gostId = Number(postojeci_gost);

          // Provjeri da li gost postoji
          const postojiGost = await tx.gost.findUnique({
            where: { id: gostId }
          });

          if (!postojiGost) {
            throw new Error('Odabrani gost ne postoji');
          }
          gostData = postojiGost;
        } else {
          // Kreiraj novog gosta
          const noviGost = await tx.gost.create({
            data: {
              titula: gost_titula as string,
              ime: gost_ime as string,
              prezime: gost_prezime as string,
              titula_drugog_gosta: gost_titula_drugog_gosta ? String(gost_titula_drugog_gosta) : undefined,
              ime_drugog_gosta: gost_ime_drugog_gosta ? String(gost_ime_drugog_gosta) : undefined,
              prezime_drugog_gosta: gost_prezime_drugog_gosta ? String(gost_prezime_drugog_gosta) : undefined,
              adresa: gost_adresa ? String(gost_adresa) : undefined,
              grad: gost_grad ? String(gost_grad) : undefined,
              drzava: gost_drzava as string,
              email: gost_email as string,
              mob_telefon: gost_telefon ? String(gost_telefon) : undefined,
            },
          });
          gostId = noviGost.id;
          gostData = noviGost;
        }

        // Kreiraj rezervaciju
        const rezervacija = await tx.rezervacija.create({
          data: {
            soba: { connect: { broj: sobaBroj } },
            gost: { connect: { id: gostId } },
            prijava: prijavaDate,
            odjava: odjawaDate,
            broj_osoba: Number(broj_osoba) || 1,
            popust: Number(popust) || 0,
            status: status as string
          },
          include: {
            soba: true,
          }
        });

        return { gost: gostData, rezervacija, gostId };
      });

    console.log(`Kreiran gost ${result.gostId} i rezervacija ${result.rezervacija.id}`);

    // Pošalji email potvrdu nakon što je rezervacija kreirana
    try {
      const totalPrice = rascunajUkupnuCenu(
        result.rezervacija.soba.cena,
        result.rezervacija.prijava,
        result.rezervacija.odjava,
        result.rezervacija.popust
      );

        await sendReservationConfirmationEmail(
          {
            gost: result.gost,
            rezervacija: result.rezervacija,
            totalPrice
          },
          lang
        );
      } catch (emailError) {
        console.error('Greška pri slanju potvrdnog emaila:', emailError);
        // Nastavi sa redirekcijom čak i ako email slanje ne uspije
      }

    revalidatePath('/rezervacije');
    return { rezervacija: result.rezervacija };
  } catch (error: any) {
    // Ignoriraj NEXT_REDIRECT grešku, dozvoli redirect
    if (error?.digest && error.digest.startsWith('NEXT_REDIRECT')) {
      return;
    }
    revalidatePath('/rezervacije');
    console.error('Greška pri dodavanju rezervacije sa gostom:', error);

    // Prisma unique error
    if (error.code === 'P2002') {
      redirect(createFailureRedirect('/rezervacije/dodaj', 'emailExists', lang));
      return;
    }
    // Preklapanje rezervacije
    if (error.message && error.message.includes('overlapError')) {
      redirect(createFailureRedirect('/rezervacije/dodaj', 'overlapError', lang));
      return;
    }
    // Odabrani gost ne postoji
    if (error.message && error.message.includes('Odabrani gost ne postoji')) {
      redirect(createFailureRedirect('/rezervacije/dodaj', 'guestNotFound', lang));
      return;
    }
    // Ostale greške
    redirect(createFailureRedirect('/rezervacije/dodaj', 'errorGeneral', lang));
  }
}
// Remove the stray closing bracket here.
// There is no need for an extra `}` after the dodajRezervacijuSaGostom function.
// Just delete it.

// Funkcija za izmjenu rezervacije sa ažuriranjem gosta
export async function izmeniRezervacijuSaGostom(formData: FormData) {
  const id = Number(formData.get('id'));
  const soba = formData.get('soba');
  const prijava = formData.get('prijava');
  const odjava = formData.get('odjava');
  const broj_osoba = formData.get('broj_osoba');
  const popust = formData.get('popust');
  const status = formData.get('status');
  const lang = (formData.get('lang') as string) === 'en' ? 'en' : 'mn';

  // Podaci o gostu
  const gost_id = formData.get('gost_id'); // ID postojećeg gosta ili 'new' za novog
  const gost_titula = formData.get('gost_titula');
  const gost_ime = formData.get('gost_ime');
  const gost_prezime = formData.get('gost_prezime');
  const gost_titula_drugog_gosta = formData.get('gost_titula_drugog_gosta');
  const gost_ime_drugog_gosta = formData.get('gost_ime_drugog_gosta');
  const gost_prezime_drugog_gosta = formData.get('gost_prezime_drugog_gosta');
  const gost_adresa = formData.get('gost_adresa');
  const gost_grad = formData.get('gost_grad');
  const gost_drzava = formData.get('gost_drzava');
  const gost_email = formData.get('gost_email');
  const gost_telefon = formData.get('gost_telefon');

  const postojeci_gost = formData.get('postojeci_gost');
  const koristi_postojeceg_gosta = formData.get('koristi_postojeceg_gosta') === 'true';

  const messages = getLocaleMessages(lang, 'rezervacije');
  const t = (key: string) => messages[key] || key;

  const result = rezervacijaGostSchema(t).safeParse({
    soba,
    prijava,
    odjava,
    broj_osoba,
    popust,
    status,
    gost_titula,
    gost_ime,
    gost_prezime,
    gost_titula_drugog_gosta,
    gost_ime_drugog_gosta,
    gost_prezime_drugog_gosta,
    gost_adresa,
    gost_grad,
    gost_drzava,
    gost_email,
    gost_telefon,
    postojeci_gost,
    koristi_postojeceg_gosta
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formValues = {
      id,
      soba: soba ? String(soba) : '',
      prijava: toDateInput(prijava),
      odjava: toDateInput(odjava),
      broj_osoba: broj_osoba ? String(broj_osoba) : '1',
      popust: popust ? String(popust) : '0',
      status: status ? String(status) : '',
      gost_id: gost_id ? String(gost_id) : '',
      gost_titula: gost_titula ? String(gost_titula) : '',
      gost_ime: gost_ime ? String(gost_ime) : '',
      gost_prezime: gost_prezime ? String(gost_prezime) : '',
      gost_titula_drugog_gosta: gost_titula_drugog_gosta ? String(gost_titula_drugog_gosta) : '',
      gost_ime_drugog_gosta: gost_ime_drugog_gosta ? String(gost_ime_drugog_gosta) : '',
      gost_prezime_drugog_gosta: gost_prezime_drugog_gosta ? String(gost_prezime_drugog_gosta) : '',
      gost_adresa: gost_adresa ? String(gost_adresa) : '',
      gost_grad: gost_grad ? String(gost_grad) : '',
      gost_drzava: gost_drzava ? String(gost_drzava) : '',
      gost_email: gost_email ? String(gost_email) : '',
      gost_telefon: gost_telefon ? String(gost_telefon) : '',
      postojeci_gost: postojeci_gost ? String(postojeci_gost) : '',
      koristi_postojeceg_gosta: String(koristi_postojeceg_gosta)
    };
    redirect(createErrorRedirect('/rezervacije/izmeni', errors, formValues, lang));
  }

  try {
    const sobaBroj = soba as string;
    const prijavaDate = new Date(prijava as string);
    const odjawaDate = new Date(odjava as string);

    // Provjeri preklapanje rezervacije (isključujući trenutnu rezervaciju)
    const prekolapanje = await provjeriPreklapanjeRezervacije(sobaBroj, prijavaDate, odjawaDate, id);

    if (prekolapanje) {
      redirect(createFailureRedirect('/rezervacije/izmeni', 'overlapError', lang));
    }

    // Transakcija: ažuriraj gosta i rezervaciju
    await prisma.$transaction(async (tx) => {
      let gostId: number;

      if (koristi_postojeceg_gosta && postojeci_gost) {
        gostId = Number(postojeci_gost);

        // Provjeri da li gost postoji
        const postojiGost = await tx.gost.findUnique({
          where: { id: gostId }
        });

        if (!postojiGost) {
          throw new Error('Odabrani gost ne postoji');
        }
      } else {
        // Ako se mijenja postojeći gost ili se kreira novi
        if (gost_id && gost_id !== 'new') {
          // Ažuriraj postojećeg gosta
          gostId = Number(gost_id);
          await tx.gost.update({
            where: { id: gostId },
            data: {
              titula: gost_titula as string,
              ime: gost_ime as string,
              prezime: gost_prezime as string,
              titula_drugog_gosta: gost_titula_drugog_gosta ? String(gost_titula_drugog_gosta) : undefined,
              ime_drugog_gosta: gost_ime_drugog_gosta ? String(gost_ime_drugog_gosta) : undefined,
              prezime_drugog_gosta: gost_prezime_drugog_gosta ? String(gost_prezime_drugog_gosta) : undefined,
              adresa: gost_adresa ? String(gost_adresa) : undefined,
              grad: gost_grad ? String(gost_grad) : undefined,
              drzava: gost_drzava as string,
              email: gost_email as string,
              mob_telefon: gost_telefon ? String(gost_telefon) : undefined,
            },
          });
        } else {
          // Kreiraj novog gosta
          const noviGost = await tx.gost.create({
            data: {
              titula: gost_titula as string,
              ime: gost_ime as string,
              prezime: gost_prezime as string,
              titula_drugog_gosta: gost_titula_drugog_gosta ? String(gost_titula_drugog_gosta) : undefined,
              ime_drugog_gosta: gost_ime_drugog_gosta ? String(gost_ime_drugog_gosta) : undefined,
              prezime_drugog_gosta: gost_prezime_drugog_gosta ? String(gost_prezime_drugog_gosta) : undefined,
              adresa: gost_adresa ? String(gost_adresa) : undefined,
              grad: gost_grad ? String(gost_grad) : undefined,
              drzava: gost_drzava as string,
              email: gost_email as string,
              mob_telefon: gost_telefon ? String(gost_telefon) : undefined,
            },
          });
          gostId = noviGost.id;
        }
      }

      // Ažuriraj rezervaciju
      await tx.rezervacija.update({
        where: { id },
        data: {
          soba: { connect: { broj: sobaBroj } },
          gost: { connect: { id: gostId } },
          prijava: prijavaDate,
          odjava: odjawaDate,
          broj_osoba: Number(broj_osoba) || 1,
          popust: Number(popust) || 0,
          status: status as string
        },
      });
    });

  } catch (error: any) {
    revalidatePath('/rezervacije');
    console.error('Greška pri ažuriranju rezervacije sa gostom:', error);

    if (error.code === 'P2002') {
      // return { error: 'emailExists' };
      redirect(createFailureRedirect('/rezervacije/izmeni', 'emailExists', lang));
    } else {
      // return { error: 'errorGeneral' };
      redirect(createFailureRedirect('/rezervacije/izmeni', 'errorGeneral', lang));
    }
  }
}export async function dajDetaljeRezervacije(rezervacijaId: number) {
  try {
    const rezervacija = await prisma.rezervacija.findUnique({
      where: { id: rezervacijaId },
      include: {
        soba: true,
        gost: true
      },
    });

    if (!rezervacija) return null;

    // Importujemo funkciju za računanje podataka
    const { dajPodatkeORezervaciji } = await import('@/lib/helpers/rezervacije');

    return {
      ...rezervacija,
      podaci: dajPodatkeORezervaciji(rezervacija)
    };
  } catch (error) {
    console.error("Greška pri dobijanju detalja rezervacije:", error);
    return null;
  }
}

