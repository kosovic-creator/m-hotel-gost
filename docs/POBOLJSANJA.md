# Poboljšanja Arhitekture - DRY Princip

Ova dokumentacija opisuje implementirana poboljšanja koja slede DRY (Don't Repeat Yourself) princip i povećavaju maintainability, type safety i skalabilnost aplikacije.

## 📁 Struktura

```
lib/
├── helpers/
│   ├── url.ts              # URL parametrizacija i redirects
│   └── index.ts
├── types/
│   ├── searchParams.ts     # Typed search params
│   ├── form.ts            # Form tipovi
│   └── index.ts
├── middleware/
│   └── validacija.ts       # Centralizovana validacija
└── constants/
    └── messages.ts         # Standardizovane poruke

components/
├── form/
│   ├── FormComponents.tsx  # Reusable form komponente
│   └── index.ts
└── messages/
    ├── MessageComponents.tsx # Message komponente
    └── index.ts
```

## 🎯 Implementirana Poboljšanja

### 1. Helper Funkcije za URL Parametrizaciju

**Lokacija:** `lib/helpers/url.ts`

**Funkcije:**
- `buildvalidacijaErrorUrl()` - Kreira URL sa greškama i vrijednostima forme
- `buildSuccessUrl()` - Kreira URL sa success porukom
- `buildErrorUrl()` - Kreira URL sa error porukom
- `redirectWithvalidacijaErrors()` - Redirect sa validacionim greškama
- `redirectWithSuccess()` - Redirect sa success porukom
- `redirectWithError()` - Redirect sa error porukom
- `toDateInput()` - Konvertuje datum u YYYY-MM-DD format
- `extractErrors()` - Ekstrauje greške iz search params
- `extractFormValues()` - Ekstrauje vrijednosti forme iz search params
- `getFieldValue()` - Vraća vrijednost polja sa prioritetom: params > dbValue > ''

**Primjer upotrebe:**

```typescript
// Prije
const params = new URLSearchParams();
if (fieldErrors?.gost?.[0]) params.append('gostError', fieldErrors.gost[0]);
if (fieldErrors?.soba?.[0]) params.append('sobaError', fieldErrors.soba[0]);
params.append('soba', soba ? String(soba) : '');
params.append('gost', gost ? String(gost) : '');
redirect(`/rezervacije/dodaj?${params.toString()}`);

// Poslije
redirectWithvalidacijaErrors('/rezervacije/dodaj', result.errors, formValues, lang);
```

### 2. Typed SearchParams

**Lokacija:** `lib/types/searchParams.ts`

**Tipovi:**
- `validacijaSearchParams<T>` - Opšti tip za search params sa validacionim greškama
- `RezervacijaSearchParams` - Search params za rezervacije
- `AuthSearchParams` - Search params za auth
- `AsyncSearchParams<T>` - Async search params wrapper
- `PagePropsWithSearchParams<T>` - Props za stranice sa search params

**Primjer upotrebe:**

```typescript
// Prije
type SearchParams = {
  id?: string;
  gostError?: string;
  sobaError?: string;
  // ... mnogo dupliciranja
};

// Poslije
import { RezervacijaSearchParams } from '@/lib/types/searchParams';

export default async function Page({
  searchParams
}: {
  searchParams: Promise<RezervacijaSearchParams>
}) {
  const params = await searchParams;
  // Type-safe pristup
}
```

### 3. Reusable Form Components

**Lokacija:** `components/form/FormComponents.tsx`

**Komponente:**
- `FormWrapper` - Wrapper za cijelu formu
- `FormField` - Wrapper za pojedinačna polja sa label i error
- `InputField` - Input polje sa validacijom
- `SelectField` - Select polje sa opcijama
- `HiddenField` - Hidden input polje
- `FormActions` - Submit i cancel dugmad

**Primjer upotrebe:**

```tsx
// Prije
<div className="flex flex-col items-center justify-center min-h-screen px-2 sm:px-0 bg-gray-50">
  <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 sm:p-8 mt-8">
    <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">{title}</h1>
    <form action={action} className="mb-8 flex gap-4 flex-col max-w-md mt-4 w-full" noValidate>
      <input type="date" name="prijava" required className="border rounded px-2 py-1 w-full" />
      {errors.prijava && <span className="text-red-600 text-xs">{errors.prijava}</span>}
      {/* ... više polja */}
    </form>
  </div>
</div>

// Poslije
<FormWrapper
  title={messages.addReservation}
  action={dodajRezervaciju}
  submitLabel={messages.addReservation}
  cancelLabel={messages.cancel}
  cancelHref={`/rezervacije?lang=${lang}`}
>
  <InputField
    name="prijava"
    type="date"
    placeholder={messages.prijava}
    defaultValue={formData.prijava}
    error={errors.prijava}
    required
  />
  {/* ... ostala polja */}
</FormWrapper>
```

### 4. Middleware za Validaciju

**Lokacija:** `lib/middleware/validacija.ts`

**Funkcije:**
- `validateFormData()` - Validira form data sa Zod schema
- `validateWithRedirect()` - Middleware funkcija za validaciju i automatski redirect
- `extractFormData()` - Ekstrauje FormData u object
- `prepareFormDataForvalidacija()` - Priprema form data za validaciju
- `createvalidacijaErrorResponse()` - Kreira error response
- `validateWithAsyncRules()` - Async validacija sa custom async rules

**Primjer upotrebe:**

```typescript
// Prije
const result = rezervacijaSchema(t).safeParse({
  soba,
  gost,
  prijava,
  odjava,
  status
});
if (!result.success) {
  const params = new URLSearchParams();
  const fieldErrors = result.error.flatten().fieldErrors;
  if (fieldErrors?.gost?.[0]) params.append('gostError', fieldErrors.gost[0]);
  // ... mnogo koda
  redirect(`/rezervacije/dodaj?${params.toString()}`);
}

// Poslije
const result = validateFormData(rezervacijaSchema(t), {
  soba,
  gost,
  prijava,
  odjava,
  status
});

if (!result.success) {
  redirectWithvalidacijaErrors('/rezervacije/dodaj', result.errors, formValues, lang);
}
```

### 5. Standardizovane Poruke

**Lokacija:** `lib/constants/messages.ts`

**Enumi:**
- `MessageType` - Tipovi poruka (SUCCESS, ERROR, WARNING, INFO)
- `SuccessMessage` - Success poruke (ADDED, UPDATED, DELETED, itd.)
- `ErrorMessage` - Error poruke (NOT_FOUND, ALREADY_EXISTS, itd.)
- `WarningMessage` - Warning poruke
- `InfoMessage` - Info poruke
- `EntityMessages` - Mapa poruka za različite entitete

**Message Komponente:** `components/messages/MessageComponents.tsx`

- `MessageBanner` - Osnovna banner komponenta
- `SuccessMessage` - Success poruka
- `ErrorMessage` - Error poruka
- `WarningMessage` - Warning poruka
- `InfoMessage` - Info poruka

**Primjer upotrebe:**

```typescript
// Prije
const params = new URLSearchParams();
params.append('success', 'added');
redirect(`/rezervacije?${params.toString()}`);

// Poslije
import { SuccessMessage } from '@/lib/constants/messages';
redirectWithSuccess('/rezervacije', SuccessMessage.ADDED, lang);
```

```tsx
// Prikaz poruka
import { SuccessMessage } from '@/components/messages';

if (params.success === 'added') {
  <SuccessMessage message={messages.rezervacija_dodana} />
}
```

## 🎨 Benefiti

### 1. Maintainability (Lakše Održavanje)
- Centralizovan kod za URL manipulaciju
- Jedna funkcija za sve redirecte sa greškama
- Promjene na jednom mjestu utiču na cijelu aplikaciju

### 2. Type Safety (Sigurnost Tipova)
- TypeScript tipovi za sve search params
- Auto-completion u VS Code
- Compile-time provjera tipova
- Manje runtime grešaka

### 3. DRY Princip (Manje Dupliciranog Koda)
- Reusable form komponente
- Helper funkcije umjesto copy-paste koda
- Centralizovana validacija
- Standardizovane poruke

### 4. Skalabilnost (Lakše Dodavanje Novih Entiteta)
- Template pattern za forme
- Jednostavno dodavanje novih tipova search params
- Reusable validacija middleware
- Standardizovan način rukovanja porukama

## 📊 Prije i Poslije

### Broj Linija Koda - Forma

**Prije:** ~80 linija koda po formi
**Poslije:** ~40 linija koda po formi

**Smanjenje:** 50% manje koda! ✅

### Broj Linija Koda - Actions

**Prije:** ~30 linija za redirect sa greškama
**Poslije:** ~3 linije za redirect sa greškama

**Smanjenje:** 90% manje koda! ✅

## 🚀 Kako Koristiti

### Kreiranje Nove Forme

```tsx
import { FormWrapper, InputField, SelectField, HiddenField } from '@/components/form';
import { extractErrors, extractFormValues } from '@/lib/helpers';
import { YourEntitySearchParams } from '@/lib/types';

export default async function NovaFormaPage({
  searchParams
}: {
  searchParams: Promise<YourEntitySearchParams>
}) {
  const params = await searchParams;
  const errors = extractErrors(params);
  const formData = extractFormValues(params, { /* default values */ });

  return (
    <FormWrapper
      title="Nova Forma"
      action={yourAction}
      submitLabel="Sačuvaj"
      cancelLabel="Otkaži"
      cancelHref="/back"
    >
      <HiddenField name="lang" value={lang} />
      <InputField name="field1" error={errors.field1} required />
      <SelectField name="field2" options={options} error={errors.field2} />
    </FormWrapper>
  );
}
```

### Kreiranje Nove Action Funkcije

```typescript
import { validateFormData } from '@/lib/middleware/validacija';
import { redirectWithvalidacijaErrors, redirectWithSuccess, redirectWithError } from '@/lib/helpers';
import { SuccessMessage, ErrorMessage } from '@/lib/constants/messages';

export async function yourAction(formData: FormData) {
  const data = Object.fromEntries(formData);
  const lang = data.lang as string;

  const result = validateFormData(yourSchema(t), data);

  if (!result.success) {
    redirectWithvalidacijaErrors('/your/path', result.errors, data, lang);
  }

  try {
    // Your logic here
    redirectWithSuccess('/success/path', SuccessMessage.ADDED, lang);
  } catch (error) {
    redirectWithError('/error/path', ErrorMessage.DATABASE_ERROR, lang);
  }
}
```

## 📝 Najbolje Prakse

1. **Uvijek koristi typed search params** umjesto `Record<string, string>`
2. **Koristi helper funkcije** za URL manipulaciju
3. **Koristi reusable komponente** za forme
4. **Centralizuj validaciju** sa middleware funkcijama
5. **Koristi standardizovane poruke** umjesto hardcoded stringova
6. **Dodaj index.ts** fajlove za lakši import
7. **Dokumentuj nove komponente** sa JSDoc komentarima

## 🔄 Migracija Postojećeg Koda

1. Zamijeni `Record<string, string>` sa `YourEntitySearchParams`
2. Zamijeni URL building kod sa `redirectWith*` funkcijama
3. Zamijeni manual form rendering sa `FormWrapper` i `*Field` komponentama
4. Zamijeni `schema.safeParse` sa `validateFormData`
5. Zamijeni hardcoded message strings sa enumi

## 📚 Dodatne Reference

- [Zod Documentation](https://zod.dev/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
