# Email Setup - Nodemailer Konfiguracija

Ovaj projekt koristi **nodemailer** v7.0.11 za slanje emaila gostima o njihovim rezervacijama i plaćanjima.

## Instalacija

Nodemailer je već instaliran. Ako trebate biti sigurni, pokrenite:

```bash
npm install nodemailer @types/nodemailer
```

## Konfiguracija Okruženja

Trebate dodati sledeće varijable u vašu `.env.local` datoteku:

```env
# Email Konfiguracija
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=vasa-email@gmail.com
EMAIL_PASSWORD=vasa-aplikaciona-lozinka
EMAIL_FROM=noreply@hotel.com
```

### Primjeri za različite email servise

#### 1. **Gmail**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=vasa-email@gmail.com
EMAIL_PASSWORD=vasa-app-password
EMAIL_FROM=vasa-email@gmail.com
```

**Napomena:** Za Gmail trebate:
1. Omogućiti 2FA (Two-Factor Authentication)
2. Generisati "App Password" preko [Google Account Security](https://myaccount.google.com/apppasswords)
3. Koristiti tu app-password u `EMAIL_PASSWORD` varijabli

#### 2. **Outlook/Hotmail**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=vasa-email@outlook.com
EMAIL_PASSWORD=vasa-lozinka
EMAIL_FROM=vasa-email@outlook.com
```

#### 3. **SendGrid**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxx
EMAIL_FROM=vasa-email@domain.com
```

#### 4. **AWS SES (Simple Email Service)**
```env
EMAIL_HOST=email-smtp.region.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=AKIA...
EMAIL_PASSWORD=...
EMAIL_FROM=verified-email@domain.com
```

## Funkcionalnost

### 1. Email pri Rezervaciji
Kada gost krira rezervaciju, automatski se šalje email sa:
- Brojem potvrde (ID rezervacije)
- Podacima o gostu
- Podacima o sobi
- Datumima boravka
- Ukupnom cijenom

**Email se šalje iz:** `lib/email.ts` → `sendReservationConfirmationEmail()`
**Koristioci:** `actions/rezervacije.ts` → `dodajRezervacijuSaGostom()`

### 2. Email pri Plaćanju
Kada je plaćanje uspješno izvršeno preko Stripe-a, automatski se šalje email sa:
- Brojem rezervacije
- Potvrdom o uplaćenom iznosu
- Podacima o rezervaciji

**Email se šalje iz:** `lib/email.ts` → `sendPaymentConfirmationEmail()`
**Koristioci:** `app/api/payments/webhook/route.ts`

## Jezici

Emaili se šalju na ispisom jeziku rezervacije/plaćanja:
- **Montenegrin** - Default (ako je drugačije dostupno)
- **English** - Ako je rezervacija napravljena na engleskom jeziku

Polja email šablona se automatski prevode na osnovu `lang` parametra.

## Testiranje Email Konekcije

Za testiranje email konekcije, možete CreateFile API endpointa ili koristiti sledeći kod:

```typescript
import { testEmailConnection } from '@/lib/email';

// U nekoj server akciji ili API ruti:
const isConnected = await testEmailConnection();
if (isConnected) {
  console.log('Email servis je spreman');
} else {
  console.log('Greška: Email servis nije dostupan');
}
```

## HTML Email Šabloni

Emaili koriste HTML šablone sa CSS stilova za bolje formatiranje. Šabloni su:

### Rezervacija Email
- Desno dizajniran sa plavim zaglavljem (#2c3e50)
- Prikazuje sve detalje rezervacije
- Prikazuje ukupnu cijenu i popust

### Plaćanje Email
- Desno dizajniran sa zelenim zaglavljem (#27ae60)
- Prikazuje potvrdu plaćanja
- Prikazuje iznos plaćanja

## Troubleshooting

### Greška: "Cannot find module 'nodemailer'"
```bash
npm install nodemailer @types/nodemailer
```

### Greška: "Invalid login: 535-5.7.8 Username and Password not accepted"
- Za Gmail: Proverite da ste generisali App Password (ne običnu lozinku)
- Za ostale servise: Proverite kredencijale

### Emaili se ne šalju, ali nema greške
- Proverite logs: `console.error` se loguje u terminal
- Proverite SMTP kredencijale
- Proverite firewall/antivirus za SMTP port (obično 587)
- Proverite email adresu gosta je ispravna

### "SMTP Connection Timeout"
- Proverite EMAIL_HOST i EMAIL_PORT
- Proverite da li je SMTP server dostupan
- Za Gmail: Koristite `smtp.gmail.com` i port `587`

## Sigurnost

⚠️ **VAŽNO:** Nikada ne stavljajte email kredencijale u GitHub!

1. Koristite `.env.local` datoteku (`.gitignore` je već konfiguriran)
2. Za produkciju, koristite environment varijable kroz platformu (Vercel, Heroku, itd.)
3. Za Gmail, koristite App Passwords umesto običnih lozinki
4. Razmotriti korišćenje SendGrid API ključa umesto email kredencijala

## Email Struktura Koda

Sve email funkcionalnosti su u `lib/email.ts`:

```typescript
// Konfiguracija transportera
const transporter = nodemailer.createTransport({ ... })

// Email za rezervaciju
export async function sendReservationConfirmationEmail(data, lang) { ... }

// Email za plaćanje
export async function sendPaymentConfirmationEmail(data, lang) { ... }

// Test funkcija
export async function testEmailConnection() { ... }
```

## Dodaci za Budućnost

Ako trebate:
- **Attachment** (npr. PDF potvrd): Dodajte `attachments` polje u `sendMail()` opcije
- **Template engine**: Razmotriti `mjml` ili `handlebars` umesto inline HTML-a
- **Email queue**: Za slanje u pozadini, koristiti Bull ili Bee-Queue
- **Email tracking**: Integrisati sa SendGrid/Mailgun za read receipts
- **SMS notifikacije**: Dodati Twilio ili Nexmo

---

**Verzija:** 1.0.0
**Last Updated:** February 2026
**Status:** Implementirano i testirano ✓
