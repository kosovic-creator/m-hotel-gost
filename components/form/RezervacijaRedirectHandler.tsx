"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RezervacijaRedirectHandler({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [redirectTo, router]);

  return null;
}
