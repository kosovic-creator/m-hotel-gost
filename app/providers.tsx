"use client";
import { SessionProvider } from "next-auth/react";
import "@/i18n/config"; // Dodaj OVO ovde!

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}