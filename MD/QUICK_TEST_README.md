# Brzo Testiranje - Email za Plaćanja

Ako ne dobijate email nakon plaćanja, slijedi ove korake za debugging:

## ⚠️ VAŽNO - Dva Načina Plaćanja

Postoje **dva endpoint-a** koji procesiraju plaćanja:

1. **`/api/payments/confirm`** - Koristi se za **lokalni development**
   - Poziva se odmah nakon što se plaćanje prihvati
   - Email se šalje ovdje za lokalno testiranje

2. **`/api/payments/webhook`** - Koristi se za **production**
   - Stripe poziva ovaj endpoint sa interneta
   - NE radia lokalno bez Stripe CLI
   - Email se šalje ovdje za production

**Za lokalni development, email bi trebao biti poslan iz `/api/payments/confirm`!**

## 📋 Prije Nego Počnete

1. Pazite `.env.local` datoteka postoji i ima EMAIL_USER i EMAIL_PASSWORD
2. Restartovate dev server (`Ctrl+C` i `npm run dev`)
3. Otvorite terminal gdje vidi sve logove

## 🔍 Korak 1 - Provjerite Email Konfiguraciju

U pregledniku idite na:
```
http://localhost:3000/api/debug/email-status
```

Trebalo bi da vidite:
```json
{
  "status": "✓ KONFIGURISAN",
  "emailUser": "✓ Postavljeno",
  "emailPassword": "✓ Postavljeno",
  "configuration_complete": true
}
```

**Ako je `false`:**
- Provjerite `.env.local` datoteku
- Dodajte `EMAIL_USER` i `EMAIL_PASSWORD`
- Restartovate dev server

## 🧪 Korak 2 - Testirajte Direktno Email za Plaćanja

Kreirajte test rezervaciju tako što:
1. Idite na "Rezervacije" → "Dodaj"
2. Popunite formu i kreirajte rezervaciju
3. Zabilježite ID rezervacije (trebalo bi da vidite potvrdu)

Zatim u drugom prozoru/terminalu pokrenite:
```bash
curl -X POST http://localhost:3000/api/test/send-payment-email \
  -H "Content-Type: application/json" \
  -d '{"rezervacijaId": 1}'
```

Zamijenjujući `1` sa ID-om rezervacije.

**Trebalo bi da vidite:**
- U pregledniku: `"status": "✓ SUCCESS"` i email rezultat
- U terminalu sa `npm run dev`: Detaljne logove sa ✓ ikonom

## 📧 Korak 3 - Kreirajte Rezervaciju sa Emula u Trenutnom Procesu

1. Idite na `/rezervacije/dodaj`
2. Kreirajte novu rezervaciju
3. **Odmah proverite terminal sa `npm run dev`** - trebati vidite:

```
✓ Rezervacija uspješno kreirana
✓ Email poslana na: gost@email.com
```

## 💳 Korak 4 - Testirajte Plaćanje (Webhook)

Dopo što kreirate rezervaciju, trebate testirati plaćanja. To zahteva webhook:

### Lokalno (Best Option - Stripe CLI):

1. **Instalirajte Stripe CLI**
   ```bash
   brew install stripe/stripe-cli/stripe  # Mac
   ```

2. **U novom terminalu pokrenite**
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

3. **U drugom terminalu testirajte**
   ```bash
   stripe trigger payment_intent.succeeded --add payment_intent:metadata.rezervacijaId=1
   ```

4. **Proverite terminal sa `npm run dev`**
   - Trebalo bi da vidite kompletan webhook log:
   ```
   🔔 Webhook pozvan - početak procesiranja...
   ✓ Webhook event verifikovan: payment_intent.succeeded
   💳 PaymentIntent succeeded: pi_xxxxx
   ✓ Rezervacija 1 ažurirana sa statusom 'paid'
   📧 Slanje email potvrde za plaćanje na: gost@email.com
   ✓ Email plaćanja uspješno poslana za rezervacija 1
   ✓ Webhook kompletno obrađen
   ```

## 🔴 Ako Nešto Fali

### Nema email log-a za plaćanja:
- Webhook se može ne poziva
- Proverite Stripe dashboard za event logs

### Green Webhook ali nema email-a:
- Email kredencijali nisu dostupni
- Proverite `/api/debug/email-status`

### Email pokazuje kako se ne pošilje jer nedostaju kredencijali:
```
⚠️ Email servis nije konfiguriran
```
→ Dodajte u `.env.local`:
```env
EMAIL_USER=vasa-email@gmail.com
EMAIL_PASSWORD=xxxxx xxxx xxxx xxxx
```

## 📚 Vise Informacija

- [EMAIL_SETUP_README.md](EMAIL_SETUP_README.md) - Email setup instrukcije
- [WEBHOOK_DEBUG_README.md](WEBHOOK_DEBUG_README.md) - Detaljan webhook debugging guide
