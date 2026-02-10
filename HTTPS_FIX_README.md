# 🔒 HTTP vs HTTPS Problem - Rešenje

## 🚨 Greška koju vidite:

**"Automatic payment methods filling is disabled because this form does not use a secure connection"**

Ova greška se javlja jer **Stripe zahteva HTTPS konekciju** za sve payment funkcionalnosti, a vaša aplikacija radi na `http://localhost:3000`.

## ✅ Rešenje 1: HTTPS Development Server (Preporučeno)

### 1. Pokretanje HTTPS development servera:

```bash
npm run dev:https
```

Aplikacija će biti dostupna na: **https://localhost:3443** ⚡

### 2. Browser Warning (Normal):

Prvi put kad odete na https://localhost:3443, browser će prikazati sliku:
```
Your connection is not private
NET::ERR_CERT_AUTHORITY_INVALID
```

**Kliknite "Advanced" → "Proceed to localhost (unsafe)"** ✅

Ovo je normalno jer koristimo self-signed certificate.

### 3. Testiranje Stripe plaćanja:

Sada kad otvorite rezervaciju sa HTTPS URL-om, payment forma će raditi bez greške! 🎉

---

## ✅ Rešenje 2: Jednostavanje za testiranje

### Koristite ove **test kartice** sa bilo kojim MM/YY i CVC:

- **Za uspešno plaćanje**: `4242 4242 4242 4242`
- **Za odbačeno plaćanje**: `4000 0000 0000 0002`
- **Za 3D Secure test**: `4000 0025 0000 3155`

---

## 📋 Korak po korak:

1. **Stop trenutni dev server**:
   ```bash
   Ctrl + C  # stop current npm run dev
   ```

2. **Pokretanje HTTPS servera**:
   ```bash
   npm run dev:https
   ```

3. **Otvorite browser na**:
   ```
   https://localhost:3443/rezervacije/1?lang=mn
   ```

4. **Accept certificate warning** (jednom)

5. **Testirajte payment**: Klicnite "Plati Sada" i unesite test karticu `4242 4242 4242 4242`

---

## 🔧 Šta je kreirano:

- **SSL Certificate**: `certs/localhost.pem` (self-signed)
- **Private Key**: `certs/localhost-key.pem`
- **HTTPS Server**: `https-server.js`
- **NPM Script**: `npm run dev:https`

## ⚠️ Napomene:

- SSL certifikat je samo za **development** - ne koristite u production
- Za production ćete trebati pruveren SSL certificate (Let's Encrypt, Cloudflare, itd.)
- Certifikati su dodati u `.gitignore` (bez-bedno)

---

## 🚀 Nakon testiranja:

Kad potvrdite da payment radi na HTTPS-u, možete nastaviti development na normalnom HTTP serveru:

```bash
npm run dev  # za običan development
npm run dev:https  # kad testirate Stripe payment
```