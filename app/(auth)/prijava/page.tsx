"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { loginSchema } from "@/app/validation/authSchemas";
import { useTranslation } from "react-i18next";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; lozinka?: string }>({});
  const router = useRouter();
  const { t } = useTranslation("auth");

  const validateField = (field: "email" | "lozinka", value: string) => {
    const result = loginSchema(t).safeParse({ email, lozinka, [field]: value });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors(prev => ({ ...prev, [field]: errors[field]?.[0] }));
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = loginSchema(t).safeParse({ email, lozinka });
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        lozinka: errors.lozinka?.[0],
      });
      return;
    }
    // Optionally handle remember me logic here (e.g., set cookie/localStorage)
    const res = await signIn("credentials", {
      email,
      lozinka,
      redirect: false,
    });
    if (res?.error) setError(res.error);
    else router.push("/");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{t("login.title")}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder={t("login.email")}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={e => validateField("email", e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {fieldErrors.email && <div className="text-red-500">{fieldErrors.email}</div>}
        <Input
          type="password"
          placeholder={t("login.password")}
          value={lozinka}
          onChange={e => setLozinka(e.target.value)}
          onBlur={e => validateField("lozinka", e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {fieldErrors.lozinka && <div className="text-red-500">{fieldErrors.lozinka}</div>}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm ">
            <Checkbox  checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-black" />
            {t("login.rememberMe") || "Zapamti prijavu"}
          </label>
          <Link href="/registracija" className="text-blue-600 hover:underline text-sm">
            {t("login.noAccount") || "Nemate nalog? Registrujte se"}
          </Link>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" variant="default" size="default" className="w-full">{t("login.submit")}</Button>
      </form>
    </div>
  );
}
