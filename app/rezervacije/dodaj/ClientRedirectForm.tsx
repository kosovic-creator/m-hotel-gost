"use client";
import { useState } from "react";
import RezervacijaRedirectHandler from "@/components/form/RezervacijaRedirectHandler";

export default function ClientRedirectForm({ action, children }: { action: (formData: FormData) => Promise<any>, children: React.ReactNode }) {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await action(formData);
    if (result?.redirectTo) {
      // Dodaj lang parametar ako postoji u formi
      const lang = formData.get('lang');
      let redirectUrl = result.redirectTo;
      if (lang && typeof redirectUrl === 'string' && !redirectUrl.includes('lang=')) {
        const hasQuery = redirectUrl.includes('?');
        redirectUrl += (hasQuery ? '&' : '?') + `lang=${lang}`;
      }
      setRedirectTo(redirectUrl);
    }
  }

  return (
    <>
      {redirectTo && <RezervacijaRedirectHandler redirectTo={redirectTo} />}
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </>
  );
}
