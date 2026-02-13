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
      setRedirectTo(result.redirectTo);
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
