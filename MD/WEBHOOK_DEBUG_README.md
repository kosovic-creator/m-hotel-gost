# Webhook Debugging - Plaćanja i Email

Korisnik ne prima email nakon što završi plaćanje? Evo kako da debugirate problem.

## 1. Prvo - Proverite Email Konfiguraciju

### Pristupite debug endpoint-u:
```
http://localhost:3000/api/debug/email-status
```

Trebalo bi da vidite nešto kao:
```json
{
  "status": "✓ KONFIGURISAN",
  "emailUser": "✓ Postavljeno",
  "emailPassword": "✓ Postavljeno",
  "configuration_complete": true
}
```

Ako je `false`, trebate:
1. Kreirti `.env.local` datoteku
2. Postaviti `EMAIL_USER` i `EMAIL_PASSWORD`
3. Restartovati dev server (`npm run dev`)

## 2. Logs koji trebali biste vidjeti

### Za Rezervaciju (RADI):
```
✓ Rezervacija uspješno kreirana i emaila je zašteđeno
✓ Email poslana: Potvrda Rezervacije na: gost@email.com
```

### Za Plaćanje (TREBALI BI):
```
🔔 Webhook pozvan - početak procesiranja...
✓ Webhook event verifikovan: payment_intent.succeeded
💳 PaymentIntent succeeded: pi_xxxxxxxxxxxxx
✓ Rezervacija XXX ažurirana sa statusom 'paid'
📧 Slanje email potvrde za plaćanje na: gost@email.com
✓ Email plaćanja uspješno poslana za rezervaciju XXX
✓ Webhook kompletno obrađen - vraćanje 200 OK
```

## 3. Kako vidjeti Logs

### Terminal gdje trči `npm run dev`:
```bash
# Trebali biste vidjeti sve logove u real-time
npm run dev
```

Pogledajte terminal kada kreirate rezervaciju ili završite plaćanje.

## 4. Česta Greška - Email nije Poslana

### Simptom:
```
⚠️ Email servis nije konfiguriran.
Trebate postaviti EMAIL_USER i EMAIL_PASSWORD u .env.local datoteci.
```

### Rješenje:
1. Kreirajte `.env.local` datoteku u projektu
2. Dodajte:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=vasa-email@gmail.com
EMAIL_PASSWORD=xxxxx xxxx xxxx xxxx
EMAIL_FROM=vasa-email@gmail.com
```
3. Restartovati dev server

## 5. Gmail App Password Setup

Ako koristite Gmail:

### Korak 1 - Omogući 2FA
- Idite na https://myaccount.google.com/security
- Omogućite 2-Factor Authentication

### Korak 2 - Kreiraj App Password
- Idite na https://myaccount.google.com/apppasswords
- Odaberite "Mail" i "Other (custom name)"
- Generirajte password
- Google će vam dati 16-znaknu šifru sa razmakom

### Korak 3 - Kopirajte u `.env.local`
```env
EMAIL_PASSWORD=xxxxx xxxx xxxx xxxx
```

## 6. Kako Testirati Webhook Lokalno

### Problem: Webhook se ne poziva lokalno
Stripe webhook default ne može pristupiti `localhost:3000` sa interneta.

### Rješenje - Koristiti Stripe CLI:

#### Instalacija:
```bash
# Mac
brew install stripe/stripe-cli/stripe

# Ili preuzmite sa https://stripe.com/docs/stripe-cli
```

#### Forward webhook-e lokalno:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

#### Simulirajte plaćanje:
```bash
# U drugom terminalu:
stripe trigger payment_intent.succeeded
```

## 7. Proverite Stripe Dashboard

1. Idite na https://dashboard.stripe.com
2. Idite na "Logs" → "Events"
3. Trebali biste vidjeti `payment_intent.succeeded` evente
4. Kliknite na event da vidite tačnu payload

## 8. Ako se Email JAVI ali je u SPAM-u

### Gmail SPAM filter:
- Proverite fajl: junk, spam, promotional
- Dodajte `noreply@hotel.com` kao trusted sender

### Rješenja:
- Koristite pravi domain umjesto gmail-a za EMAIL_FROM
- Dodajte SPF/DKIM records ako imate domain

## 9. Logs koji Ukazuju na Problem

### Email kredencijali nisu dobri:
```
✗ Greška pri slanju emaila plaćanja:
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
→ Proverite EMAIL_USER i EMAIL_PASSWORD

### Reservation nije pronađena:
```
⚠️ Rezervacija 123 nije pronađena u bazi
```
→ Provjerite da li je rezervija ID ispravan

### Baza nije dostupna:
```
✗ Database greška pri ažuriranju rezervacije
```
→ Provjerite da li je PostgreSQL dostupan

## 10. Debug Checklist

- [ ] `.env.local` datoteka postoji
- [ ] `EMAIL_USER` i `EMAIL_PASSWORD` su postavljeni
- [ ] Email konfiguracija je potvrđena na `/api/debug/email-status`
- [ ] Dev server je restartovan nakon `.env.local` izmjene
- [ ] Stripe webhook URL je ispravno registriran
- [ ] Proverite logs pri slanju plaćanja
- [ ] Proverite Gmail da li je 2FA omogućen i App Password je generiše
- [ ] Proverite inbox i spam folder

## 11. FAQ

**P: Zašto email za rezervaciju radi ali ne za plaćanje?**
O: Možda webhook nikada nije pozvan. Proverite Stripe Dashboard eventloge.

**P: Gdje vidim sve Stripe eventor?**
O: https://dashboard.stripe.com → Logs → Events

**P: Kako znam da li webhook koristi moje email kredencijale?**
O: Pristupite `/api/debug/email-status` i provjerite da je status 'KONFIGURISAN'.

**P: Trebam li ponovo da kreiram payment intent nakon .env promjene?**
O: Da, restartovati dev server pa ponovo testirati plaćanje.

---

**Problemu? Javite se sa logsima iz terminala gde trči `npm run dev`!**
