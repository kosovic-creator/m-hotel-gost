/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';

// Tipovi za email podatke
interface Gost {
  id: number;
  email: string;
  ime: string;
  prezime: string;
  [key: string]: any;
}

interface Soba {
  id: number;
  broj: string;
  tip: string;
  cena: number;
  [key: string]: any;
}

interface Rezervacija {
  id: number;
  prijava: Date;
  odjava: Date;
  popust: number;
  status: string;
  [key: string]: any;
}

// Kreiraj transporter sa konfiguracijomenv varijabli
// Trebate postaviti sledeće u .env.local:
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_SECURE=false
// EMAIL_USER=vasa-email@gmail.com
// EMAIL_PASSWORD=vasa-app-password (ili app-specific password za Gmail)
// EMAIL_FROM=noreply@hotel.com

const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

interface ReservationEmailData {
  gost: Gost;
  rezervacija: Rezervacija & { soba: Soba };
  totalPrice: number;
}

interface PaymentEmailData {
  gost: Gost;
  rezervacija: Rezervacija & { soba: Soba };
  paymentAmount: number;
}

// Email šablon za uspješnu rezervaciju
function getReservationConfirmationHTML(data: ReservationEmailData, lang: string = 'sr'): string {
  const { gost, rezervacija, totalPrice } = data;

  const prijava = new Date(rezervacija.prijava).toLocaleDateString();
  const odjava = new Date(rezervacija.odjava).toLocaleDateString();

  const textMn = {
    title: 'Rezervacija Uspješno Potvrđena',
    hello: 'Poštovani/a,',
    confirmed: 'Vaša rezervacija je uspješno potvrđena!',
    confirmationNumber: 'Broj potvrde:',
    guestDetails: 'Podaci o gostu:',
    roomDetails: 'Podaci o sobi:',
    reservationDates: 'Datumi boravka:',
    checkIn: 'Prijava:',
    checkOut: 'Odjava:',
    guests: 'Broj gostiju:',
    discount: 'Popust:',
    totalPrice: 'Ukupna cijena:',
    thankyou: 'Hvala što ste odabrali naš hotel!',
    regards: 'Srdačan pozdrav,',
  };

  const textEn = {
    title: 'Reservation Successfully Confirmed',
    hello: 'Dear,',
    confirmed: 'Your reservation has been successfully confirmed!',
    confirmationNumber: 'Confirmation number:',
    guestDetails: 'Guest details:',
    roomDetails: 'Room details:',
    reservationDates: 'Stay dates:',
    checkIn: 'Check-in:',
    checkOut: 'Check-out:',
    guests: 'Number of guests:',
    discount: 'Discount:',
    totalPrice: 'Total price:',
    thankyou: 'Thank you for choosing our hotel!',
    regards: 'Best regards,',
  };

  const t = lang === 'en' ? textEn : textMn;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: white; padding: 20px; border-radius: 0 0 5px 5px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
          .detail { margin: 8px 0; }
          .detail-label { font-weight: bold; display: inline-block; width: 150px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${t.title}</h1>
          </div>
          <div class="content">
            <p>${t.hello} ${gost.ime} ${gost.prezime},</p>

            <p><strong>${t.confirmed}</strong></p>

            <div class="section">
              <div class="section-title">${t.confirmationNumber}</div>
              <div class="detail">#${rezervacija.id}</div>
            </div>

            <div class="section">
              <div class="section-title">${t.guestDetails}</div>
              <div class="detail"><span class="detail-label">${t.hello}:</span> ${gost.ime} ${gost.prezime}</div>
              <div class="detail"><span class="detail-label">Email:</span> ${gost.email}</div>
              ${gost.mob_telefon ? `<div class="detail"><span class="detail-label">Telefon:</span> ${gost.mob_telefon}</div>` : ''}
            </div>

            <div class="section">
              <div class="section-title">${t.roomDetails}</div>
              <div class="detail"><span class="detail-label">Soba broj:</span> ${rezervacija.soba.broj}</div>
              <div class="detail"><span class="detail-label">Tip sobe:</span> ${rezervacija.soba.tip}</div>
              <div class="detail"><span class="detail-label">Kapacitet:</span> ${rezervacija.soba.kapacitet} osoba</div>
            </div>

            <div class="section">
              <div class="section-title">${t.reservationDates}</div>
              <div class="detail"><span class="detail-label">${t.checkIn}:</span> ${prijava}</div>
              <div class="detail"><span class="detail-label">${t.checkOut}:</span> ${odjava}</div>
              <div class="detail"><span class="detail-label">${t.guests}:</span> ${rezervacija.broj_osoba}</div>
            </div>

            <div class="section">
              <div class="detail"><span class="detail-label">${t.discount}:</span> ${rezervacija.popust}%</div>
              <div class="detail" style="font-size: 18px; color: #2c3e50; font-weight: bold;">
                <span class="detail-label">${t.totalPrice}:</span> €${totalPrice.toFixed(2)}
              </div>
            </div>

            <p>${t.thankyou}</p>

            <div class="footer">
              <p>${t.regards},<br/>M-Hotel Tim</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Email šablon za potvrdu plaćanja
function getPaymentConfirmationHTML(data: PaymentEmailData, lang: string = 'sr'): string {
  const { gost, rezervacija, paymentAmount } = data;

  const textMn = {
    title: 'Plaćanje Potvrđeno',
    hello: 'Poštovani/a,',
    paymentSuccessful: 'Vaše plaćanje je uspješno izvršeno!',
    paymentDetails: 'Detalji plaćanja:',
    reservationNumber: 'Broj rezervacije:',
    paymentAmount: 'Iznos plaćanja:',
    guestName: 'Gost:',
    roomNumber: 'Broj sobe:',
    checkIn: 'Prijava:',
    checkOut: 'Odjava:',
    thankyou: 'Hvala što ste platili!',
    regards: 'Srdačan pozdrav,',
  };

  const textEn = {
    title: 'Payment Confirmed',
    hello: 'Dear,',
    paymentSuccessful: 'Your payment has been successfully processed!',
    paymentDetails: 'Payment details:',
    reservationNumber: 'Reservation number:',
    paymentAmount: 'Payment amount:',
    guestName: 'Guest:',
    roomNumber: 'Room number:',
    checkIn: 'Check-in:',
    checkOut: 'Check-out:',
    thankyou: 'Thank you for your payment!',
    regards: 'Best regards,',
  };

  const t = lang === 'en' ? textEn : textMn;

  const prijava = new Date(rezervacija.prijava).toLocaleDateString();
  const odjava = new Date(rezervacija.odjava).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: white; padding: 20px; border-radius: 0 0 5px 5px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; color: #27ae60; margin-bottom: 10px; }
          .detail { margin: 8px 0; }
          .detail-label { font-weight: bold; display: inline-block; width: 150px; }
          .amount { font-size: 24px; color: #27ae60; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${t.title}</h1>
          </div>
          <div class="content">
            <p>${t.hello} ${gost.ime} ${gost.prezime},</p>

            <p><strong>${t.paymentSuccessful}</strong></p>

            <div class="section">
              <div class="section-title">${t.paymentDetails}</div>
              <div class="detail"><span class="detail-label">${t.reservationNumber}:</span> #${rezervacija.id}</div>
              <div class="detail"><span class="detail-label">${t.guestName}:</span> ${gost.ime} ${gost.prezime}</div>
              <div class="detail"><span class="detail-label">${t.roomNumber}:</span> ${rezervacija.soba.broj}</div>
              <div class="detail"><span class="detail-label">${t.checkIn}:</span> ${prijava}</div>
              <div class="detail"><span class="detail-label">${t.checkOut}:</span> ${odjava}</div>
            </div>

            <div class="section">
              <div class="detail"><span class="detail-label amount">${t.paymentAmount}:</span> <span class="amount">€${paymentAmount.toFixed(2)}</span></div>
            </div>

            <p>${t.thankyou}</p>

            <div class="footer">
              <p>${t.regards},<br/>M-Hotel Tim</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Pošalji email za potvrdu rezervacije
export async function sendReservationConfirmationEmail(
  data: ReservationEmailData,
  lang: string = 'sr'
): Promise<boolean> {
  try {
    // Provjeri da li su email kredencijali postavljeni
    if (!isEmailConfigured) {
      console.warn(
        '⚠️ Email servis nije konfiguriran. ' +
        'Trebate postaviti EMAIL_USER i EMAIL_PASSWORD u .env.local datoteci. ' +
        `Rezervacija #${data.rezervacija.id} je kreirana, ali email nije poslana.`
      );
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: data.gost.email,
      subject: lang === 'en' ? 'Reservation Confirmation' : 'Potvrda Rezervacije',
      html: getReservationConfirmationHTML(data, lang),
      text: `Vaša rezervacija #${data.rezervacija.id} je potvrđena.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email poslana:', info.response);
    return true;
  } catch (error) {
    console.error('Greška pri slanju emaila za rezervaciju:', error);
    return false;
  }
}

// Pošalji email za potvrdu plaćanja
export async function sendPaymentConfirmationEmail(
  data: PaymentEmailData,
  lang: string = 'sr'
): Promise<boolean> {
  try {
    // Provjeri da li su email kredencijali postavljeni
    if (!isEmailConfigured) {
      console.warn(
        '⚠️ Email servis nije konfiguriran. ' +
        'Trebate postaviti EMAIL_USER i EMAIL_PASSWORD u .env.local datoteci. ' +
        `Plaćanje za rezervaciju #${data.rezervacija.id} je obavljeno, ali email nije poslana.`
      );
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: data.gost.email,
      subject: lang === 'en' ? 'Payment Confirmation' : 'Potvrda Plaćanja',
      html: getPaymentConfirmationHTML(data, lang),
      text: `Plaćanje za rezervaciju #${data.rezervacija.id} je uspješno izvršeno.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email plaćanja poslana:', info.response);
    return true;
  } catch (error) {
    console.error('Greška pri slanju emaila za plaćanje:', error);
    return false;
  }
}

// Testiraj konekciju
export async function testEmailConnection(): Promise<boolean> {
  if (!isEmailConfigured) {
    console.warn('⚠️ Email servis nije konfiguriran. Trebate postaviti EMAIL_USER i EMAIL_PASSWORD u .env.local');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✓ Email konekcija je validna');
    return true;
  } catch (error) {
    console.error('✗ Email konekcija greška:', error);
    return false;
  }
}
