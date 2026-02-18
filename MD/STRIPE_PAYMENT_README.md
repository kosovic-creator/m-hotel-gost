# Stripe Payment Integration

## 🚀 Implementirane komponente

- **`RezervacijaPlacanje.tsx`** - Glavna komponenta za plaćanje
- **`RezervacijaPlacanjeForms.tsx`** - Stripe Elements forms
- **`RezervacijaWithPayment.tsx`** - Kombinuje detalje i payment opcije

## ⚡ API Endpoints

- **`/api/payments/create-payment-intent`** - Kreiranje PaymentIntent-a
- **`/api/payments/webhook`** - Stripe webhook za status update
- **`/api/payments/confirm`** - Manual confirmation plaćanja

## 🛠️ Setup
sas
### 1. Environment Variables

Dodajte u `.env.local`:

```bash
# Stripe Keys (dobijate na https://dashboard.stripe.com/apikeys)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Public key za client-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
```

### 2. Stripe Dashboard Setup

1. Idite na [Stripe Dashboard](https://dashboard.stripe.com)
2. **API Keys** sekciji kopirajte:
   - Publishable key → `STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

3. **Webhooks** sekciji:
   - Dodajte endpoint: `https://your-domain.com/api/payments/webhook`
   - Dodajte events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Kopirajte signing secret → `STRIPE_WEBHOOK_SECRET`

### 3. Database Schema (Optional)

Možete dodati polja u `Rezervacija` model:

```prisma
model Rezervacija {
  // postojeća polja...

  payment_intent_id String?
  paid_at           DateTime?
  amount_paid       Float?
}
```

## 📱 Korišćenje

### Osnovni način:

```tsx
import RezervacijaWithPayment from '@/components/rezervacije/RezervacijaWithPayment';

<RezervacijaWithPayment
  rezervacija={rezervacija}
  lang={lang}
  t={t}
  showPaymentOption={true}
/>
```

### Custom payload success handler:

```tsx
<RezervacijaPlacanje
  rezervacija={rezervacija}
  ukupnaCena={podaci.ukupnaCena}
  lang={lang}
  t={t}
  onPaymentSuccess={(paymentIntent) => {
    console.log('Payment successful!', paymentIntent);
    // redirect or update UI
  }}
  onCancel={() => setShowPayment(false)}
/>
```

## 💳 Podržane Payment Methods

- **Credit/Debit Cards** (Visa, Mastercard, American Express)
- **Google Pay** / **Apple Pay** (automatic)
- **SEPA** (za EU customers)

## 🔧 Kustomizacija

### Theme/Styling:

Modifikujte `options.appearance` u `RezervacijaPlacanje.tsx`:

```typescript
appearance: {
  theme: 'stripe', // ili 'night', 'flat'
  variables: {
    colorPrimary: '#your-brand-color',
    colorBackground: '#ffffff',
    // ...
  },
}
```

### Locale:

Stripe automatski detektuje jezik iz `lang` prop-a:
- `en` → English
- `mn` → Croatian (najbliži jezik)

## ⚠️ Sigurnost

1. **Nikad ne stavljajte Secret Key na client-side**
2. **Uvek koristite HTTPS u production-u**
3. **Validacija webhook-a** je implementirana
4. **Environment varijable** nikad dodajte u git

## 🧪 Testiranje

### Test kartice:

- **Successul**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Koristite bilo koji budući datum i CVC.

## 🐛 Debugging

```bash
# Check Stripe logs
npx stripe logs --tail

# Webhook testing
npx stripe listen --forward-to localhost:3000/api/payments/webhook
```

## 📋 Workflow

1. Korisnik klika "Pay Now" dugme
2. Kreira se PaymentIntent na backend-u
3. Stripe Elements se učitava
4. Korisnik unosi karticu i potvrdi
5. Stripe procesuje plaćanje
6. Webhook ili confirm endpoint update-uje status
7. UI prikazuje success poruku

## Status Flow

```
pending → paid (successful payment)
       → payment_failed (failed payment)
```