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
      sobaBroj: sobaBroj,
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

    // Fetaj sobu da bi dobio cijenu
    const sobaData = await prisma.soba.findUnique({
      where: { broj: sobaBroj }
    });

    if (!sobaData) {
      redirect(createFailureRedirect('/rezervacije/dodaj', 'errorGeneral', lang));
    }

    // Kreiraj rezervaciju i učitaj sve potrebne podatke
    const novaRezervacija = await prisma.rezervacija.create({
      data: {
        sobaBroj: sobaBroj,
        gost: { connect: { id: gostId } },
        prijava: prijavaDate,
        odjava: odjavyDate,
        broj_osoba: Number(broj_osoba) || 1,
        status: status as string,
        azurirano: new Date()
      },
      include: {
        gost: true,
      }
    });

    // Pošalji email potvrdu nakon što je rezervacija kreirana
    try {
      const totalPrice = rascunajUkupnuCenu(
        sobaData.cena,
        novaRezervacija.prijava,
        novaRezervacija.odjava,
        Number(popust) || 0
      );

      await sendReservationConfirmationEmail(
        {
          gost: novaRezervacija.gost,
          rezervacija: { ...novaRezervacija, soba: sobaData, popust: Number(popust) || 0 } as any,
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
    redirect(createFailureRedirect('/rezervacije', message, lang));
  }

  revalidatePath('/rezervacije');
  redirect(createSuccessRedirect('/rezervacije', 'successAdded', lang));
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
        sobaBroj: sobaBroj,
        gost: { connect: { id: gostId } },
        prijava: prijavaDate,
        odjava: odjavyDate,
        broj_osoba: Number(broj_osoba) || 1,
        status: status as string,
        azurirano: new Date()
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
            ime: gost_ime as string,
            prezime: gost_prezime as string,
            email: gost_email as string,
            telefon: gost_telefon ? String(gost_telefon) : undefined,
          },
        });
        gostId = noviGost.id;
        gostData = noviGost;
      }

      // Kreiraj rezervaciju
      // Fetaj sobu da bi dobio cijenu
      const sobaData = await tx.soba.findUnique({
        where: { broj: sobaBroj }
      });

      if (!sobaData) {
        throw new Error('Soba nije pronađena');
      }

      const rezervacija = await tx.rezervacija.create({
        data: {
          sobaBroj: sobaBroj,
          gost: { connect: { id: gostId } },
          prijava: prijavaDate,
          odjava: odjawaDate,
          broj_osoba: Number(broj_osoba) || 1,
          status: status as string,
          azurirano: new Date()
        },
        include: {
          gost: true,
        }
      });

      return { gost: gostData, rezervacija, gostId, sobaData };
    });

    console.log(`Kreiran gost ${result.gostId} i rezervacija ${result.rezervacija.id}`);

    // Pošalji email potvrdu nakon što je rezervacija kreirana
    try {
      const totalPrice = rascunajUkupnuCenu(
        result.sobaData.cena,
        result.rezervacija.prijava,
        result.rezervacija.odjava,
        Number(popust) || 0
      );

      await sendReservationConfirmationEmail(
        {
          gost: result.gost,
          rezervacija: { ...result.rezervacija, soba: result.sobaData, popust: Number(popust) || 0 } as any,
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
    console.error('Greška pri kreiranju rezervacije sa gostom:', error);

    if (error.code === 'P2002') {
      redirect(createFailureRedirect('/rezervacije/dodaj', 'emailExists', lang));
    } else {
      redirect(createFailureRedirect('/rezervacije/dodaj', 'errorGeneral', lang));
    }
  }

  revalidatePath('/rezervacije');
  redirect(createSuccessRedirect('/rezervacije', 'successAddedWithGuest', lang));
}

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
              ime: gost_ime as string,
              prezime: gost_prezime as string,
              email: gost_email as string,
              telefon: gost_telefon ? String(gost_telefon) : undefined,
            },
          });
        } else {
          // Kreiraj novog gosta
          const noviGost = await tx.gost.create({
            data: {
              ime: gost_ime as string,
              prezime: gost_prezime as string,
              email: gost_email as string,
              telefon: gost_telefon ? String(gost_telefon) : undefined,
            },
          });
          gostId = noviGost.id;
        }
      }

      // Ažuriraj rezervaciju
      const sobaData = await tx.soba.findUnique({
        where: { broj: sobaBroj }
      });

      if (!sobaData) {
        throw new Error('Soba nije pronađena');
      }

      await tx.rezervacija.update({
        where: { id },
        data: {
          sobaBroj: sobaBroj,
          gost: { connect: { id: gostId } },
          prijava: prijavaDate,
          odjava: odjawaDate,
          broj_osoba: Number(broj_osoba) || 1,
          status: status as string,
          azurirano: new Date()
        },
      });

      return { sobaData };
    });

  } catch (error: any) {
    revalidatePath('/rezervacije');
    console.error('Greška pri ažuriranju rezervacije sa gostom:', error);

    if (error.code === 'P2002') {
      redirect(createFailureRedirect('/rezervacije/izmeni', 'emailExists', lang));
    } else {
      redirect(createFailureRedirect('/rezervacije/izmeni', 'errorGeneral', lang));
    }
  }

  revalidatePath('/rezervacije');
  redirect(createSuccessRedirect('/rezervacije', 'successUpdatedWithGuest', lang));
}

// Nova funkcija za računanje ukupnih prihoda
export async function ucitajUkupnePrihode() {
  try {
    const rezervacije = await prisma.rezervacija.findMany({
      where: {
        OR: [
          { status: 'confirmed' },
          { status: 'completed' }
        ]
      },
    });

    // Fetch soba data separately for each reservation
    const rezervacijeWithSoba = await Promise.all(
      rezervacije.map(async (rez) => {
        const soba = await prisma.soba.findUnique({
          where: { broj: rez.sobaBroj },
          select: { cena: true }
        });
        return {
          ...rez,
          popust: 0, // Default popust since it's not stored in database
          soba: { cena: soba?.cena || 0 }
        };
      })
    );

    // Importujemo funkciju za računanje prihoda
    const { rascunajUkupnePrihode } = await import('@/lib/helpers/rezervacije');

    return rascunajUkupnePrihode(rezervacijeWithSoba);
  } catch (error) {
    console.error("Greška pri računanju ukupnih prihoda:", error);
    return 0;
  }
}

// Nova funkcija za dobijanje detaljnih podataka o rezervaciji
export async function dajDetaljeRezervacije(rezervacijaId: number) {
  try {
    const rezervacija = await prisma.rezervacija.findUnique({
      where: { id: rezervacijaId },
      include: {
        gost: true
      },
    });

    if (!rezervacija) return null;

    // Fetch soba data separately
    const soba = await prisma.soba.findUnique({
      where: { broj: rezervacija.sobaBroj }
    });

    if (!soba) return null; // Return null if soba not found

    const rezervacijaWithSoba = {
      ...rezervacija,
      soba,
      popust: 0 // Default popust since it's not stored in database
    };

    // Importujemo funkciju za računanje podataka
    const { dajPodatkeORezervaciji } = await import('@/lib/helpers/rezervacije');

    return {
      ...rezervacijaWithSoba,
      podaci: dajPodatkeORezervaciji(rezervacijaWithSoba)
    };
  } catch (error) {
    console.error("Greška pri dobijanju detalja rezervacije:", error);
    return null;
  }
}

