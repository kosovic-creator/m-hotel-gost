"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/app/validation/authSchemas";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [potvrdaLozinke, setPotvrdaLozinke] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ ime?: string; email?: string; lozinka?: string; potvrdaLozinke?: string }>({});
  const router = useRouter();
  const { t } = useTranslation("auth");
  const validateField = (field: "ime" | "email" | "lozinka" | "potvrdaLozinke", value: string) => {
    const result = registerSchema(t).safeParse({ ime, email, lozinka, potvrdaLozinke, [field]: value });
    if (!result.success) {
      const errors: { ime?: string[]; email?: string[]; lozinka?: string[]; potvrdaLozinke?: string[] } = result.error.flatten().fieldErrors;
      setFieldErrors(prev => ({ ...prev, [field]: errors[field as keyof typeof errors]?.[0] }));
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = registerSchema(t).safeParse({ ime, email, lozinka, potvrdaLozinke });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        ime: errors.ime?.[0],
        email: errors.email?.[0],
        lozinka: errors.lozinka?.[0],
        potvrdaLozinke: errors.potvrdaLozinke?.[0],
      });
      return;
    }
    if (lozinka !== potvrdaLozinke) {
      setFieldErrors(prev => ({ ...prev, potvrdaLozinke: "Lozinke se ne poklapaju" }));
      return;
    }
    try {
      const res = await fetch("/api/auth/registracija", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime, email, lozinka, potvrdaLozinke }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška pri registraciji");
        return;
      }
      router.push("/authprijava");
    } catch {
      setError("Greška na serveru");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{t("register.register")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder={t("register.name")}
          value={ime}
          onChange={e => setIme(e.target.value)}
          onBlur={e => validateField("ime", e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {fieldErrors.ime && <div className="text-red-500">{fieldErrors.ime}</div>}
        <Input
          type="email"
          placeholder={t("register.email")}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={e => validateField("email", e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {fieldErrors.email && <div className="text-red-500">{fieldErrors.email}</div>}
        <Input
          type="password"
          placeholder={t("register.password")}
          value={lozinka}
          onChange={e => setLozinka(e.target.value)}
          onBlur={e => validateField("lozinka", e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {fieldErrors.lozinka && <div className="text-red-500">{fieldErrors.lozinka}</div>}
        <Input
          type="password"
          placeholder={t("register.passwordConfirmation") || "Potvrda lozinke"}
          value={potvrdaLozinke}
          onChange={e => setPotvrdaLozinke(e.target.value)}
          onBlur={e => validateField("potvrdaLozinke", e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {fieldErrors.potvrdaLozinke && <div className="text-red-500">{fieldErrors.potvrdaLozinke}</div>}
        {error && <div className="text-red-500">{error}</div>}

        <div className="flex flex-col sm:flex-row sm:gap-x-0 gap-y-3 mt-8 pt-6 border-t">

          <Button
            type="button"
            variant="secondary"
            className="flex-1 py-2 text-base text-gray-600 hover:text-blue-900 "
            onClick={() => router.push(`/`)}
          >
            {t("back")}
          </Button>
          <Button type="submit" variant="default" size="default" className="flex-1 ">
            {t("register.submit")}
          </Button>

        </div>
      </form>
    </div>
  );
}
