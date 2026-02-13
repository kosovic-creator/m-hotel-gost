# M-Hotel Admin - Email Setup

## 🚀 Brzi start za Email funkcionalnost

Email funkcionalnost je u potpunosti implementirana. Trebate samo postaviti kredencijale.

### 1. Kreirajte `.env.local` datoteku:

```bash
cp .env.example .env.local
```

### 2. Unesite email kredencijale

Za **Gmail** (preporučeno):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=vasa-email@gmail.com
EMAIL_PASSWORD=xxxxx xxxx xxxx xxxx
EMAIL_FROM=vasa-email@gmail.com
```

**Važno:** Za Gmail trebate App Password, NE običnu lozinku!
- Idite na: https://myaccount.google.com/apppasswords
- Generirajte App Password
- Kopirajte 16-znaknu šifru

### 3. Testira je konekcija (opciono)

```typescript
// U .env.local testira je sa:
EMAIL_USER=vasa-email@gmail.com
EMAIL_PASSWORD=xxxxx xxxx xxxx xxxx
```

### ✅ Rezultati

- ✓ Rezevacije dobijaju email potvrdu
- ✓ Plaćanja dobijaju email potvrdu
- ✓ Emaili su lokalizovani (Montenegrin/English)
- ✓ Pretty HTML emaili sa CSS stilom

### 📚 Detaljne instrukcije

Za više detalja, vidi: [EMAIL_SETUP_README.md](EMAIL_SETUP_README.md)

### 🔧 Ako Email za Plaćanja ne Radi

Ako dobijate email za rezervaciju ALI ne dobijate za plaćanja:

**Brz test:**
- Vidi: [QUICK_TEST_README.md](QUICK_TEST_README.md)

**Detaljno debugging:**
- Vidi: [WEBHOOK_DEBUG_README.md](WEBHOOK_DEBUG_README.md)



---

# Potencijalna poboljšanja

1. Helper funkcije za URL parametrizaciju
Kreirati DRY helper funkciju za ponovno popunjavanje forme:

2. Typed SearchParams
Umjesto Record<string, string>, kreirati tipove:

3. Reusable Form Component Pattern
Kreirati abstraktnu formu komponentu:

4. Middleware za validaciju
Centralizovati validaciju:

5. Standardizovati success/error poruke
Kreirati enum za poruke:

benifiti:
Maintainability (lakše održavanje)
Type safety (sigurnost tipova)
DRY princip (manje dupliranog koda)
Skalabilnost (lakše dodavanje novih entiteta)


Mjenja se samo: searchParams.ts (lib/types/searchParams.ts)

import { FormWrapper, InputField, SelectField } from "@/components/form/FormComponents";

export default function MyForm() {
  async function handleSubmit(formData: FormData) {
    // server action
  }

  return (
    <FormWrapper
      title="Nova forma"
      description="Popunite polja ispod"
      action={handleSubmit}
      submitLabel="Sačuvaj"
      cancelLabel="Otkaži"
      cancelHref="/back"
    >
      <InputField name="name" label="Ime" required />
      <InputField name="email" label="Email" type="email" required />
      <SelectField name="role" label="Uloga" options={[...]} />
    </FormWrapper>
  );
}

# Ubiaj proces na portovima:

# Port 3000 (HTTP development):
kill $(lsof -ti:3000)
kill $(lsof -ti:4000)

# Port 3443 (HTTPS development):
kill $(lsof -ti:3443)

# Ili ručno ubiaj proces:
lsof -xi:3000  # vidi koji proces koristi port 3000
lsof -xi:3443  # vidi koji proces koristi port 3443
kill <PID>     # ubiaj taj proces

# Development serveri:
npm run dev        # HTTP na portu 3000 (preporučeno)
npm run dev:https  # HTTPS na portu 3443 (ako HTTP ne radi za Stripe)


aa