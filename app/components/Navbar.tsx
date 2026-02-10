"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation("navbar");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted] = useState(true);

  useEffect(() => {
    const urlLang = searchParams.get("lang");
    if (urlLang === "en" || urlLang === "mn") {
      if (i18n.language !== urlLang) {
        i18n.changeLanguage(urlLang);
      }
    }
  }, [searchParams, i18n]);

  const handleChangeLanguage = (lng: "en" | "mn") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", lng);
    router.push(`${pathname}?${params.toString()}`);
    i18n.changeLanguage(lng);
    setMenuOpen(false);
  };

  const handleprijava = () => {
    setMenuOpen(false);
    router.push(`/prijava?lang=${i18n.language}`);
  };
  const handleSignOut = () => {
    setMenuOpen(false);
    setTimeout(() => {
      signOut({ callbackUrl: `/prijava?lang=${i18n.language}` });
    }, 100);
  };

  return (
    <nav className="w-full bg-white shadow px-4 py-3 flex justify-between items-center md:px-6 md:py-4 relative z-20 print:hidden">
      {/* Logo & desktop nav */}
      <div className="flex flex-col items-start gap-1">
        <Link href={`/?lang=${i18n.language}`} className="text-xl font-bold">
          <span className="font-bold text-sm sm:text-base truncate ">
            <span className="text-black">⭕️ </span>
            <span className="text-black">{'M-HOTEL Admin'.slice(0, 7)}</span>
            <span className="text-red-600">{'M-HOTEL Admin'.slice(7)}</span>
          </span>
        </Link>
        <div className="hidden sm:block">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sobe?lang=${i18n.language}`}>{t("rooms")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/rezervacije?lang=${i18n.language}`}>{t("reservations")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/gosti?lang=${i18n.language}`}>{t("guests")}</Link>
          </Button>

        </div>

      </div>

      {/* Mobile nav sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform
          transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          sm:hidden
        `}
        style={{ willChange: "transform" }}
      >
        <div className="flex flex-col h-full p-4">
          {/* Close button */}
          <button
            className="self-end mb-4 text-2xl"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            &times;
          </button>
          <Button variant="ghost" size="sm" asChild onClick={() => setMenuOpen(false)}>
            <Link href={`/sobe?lang=${i18n.language}`}>{t("rooms")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild onClick={() => setMenuOpen(false)}>
            <Link href={`/rezervacije?lang=${i18n.language}`}>{t("reservations")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild onClick={() => setMenuOpen(false)}>
            <Link href={`/rezervacije?lang=${i18n.language}`}>{t("reservations")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild onClick={() => setMenuOpen(false)}>
            <Link href={`/gosti?lang=${i18n.language}`}>{t("guests")}</Link>
          </Button>

          {/* Auth buttons: show only one, with icon */}
          {mounted && (session?.user ? (
            <Button variant="ghost" onClick={handleSignOut} className="w-full flex items-center gap-2 mt-2">
              <FaSignOutAlt />
              {t("logout")}
            </Button>
          ) : (
              <Button variant="ghost" onClick={handleprijava} className="w-full flex items-center gap-2 mt-2">
              <FaSignInAlt />
              {t("login")}
            </Button>
          ))}
          {/* Language buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={() => handleChangeLanguage("en")}
              className={`flex items-center gap-1 ${i18n.language === "en" ? "font-bold underline" : ""}`}
            >
              <span role="img" aria-label="English">🇬🇧</span> EN
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleChangeLanguage("mn")}
              className={`flex items-center gap-1 ${i18n.language === "mn" ? "font-bold underline" : ""}`}
            >
              <span role="img" aria-label="Montenegrin">🇲🇪</span> MN
            </Button>
          </div>
        </div>
      </div>
      {/* Overlay for sidebar */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-sm z-30 sm:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {/* Hamburger icon for mobile */}
      <button
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open menu"
      >
        <span className="block w-6 h-0.5 bg-black mb-1"></span>
        <span className="block w-6 h-0.5 bg-black mb-1"></span>
        <span className="block w-6 h-0.5 bg-black"></span>
      </button>

      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-4">
        {/* Prikaz imena korisnika ako je prijavljen */}
        {mounted && session?.user && (
          <span className="text-gray-900 font-semibold mr-2">
            {session.user.name || session.user.email}
          </span>
        )}
        {/* Auth buttons: show only one, with icon */}
        {mounted && (session?.user ? (
          <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2">
            <FaSignOutAlt />
            {t("logout")}
          </Button>
        ) : (
            <Button variant="ghost" onClick={handleprijava} className="flex items-center gap-2">
              <FaSignInAlt />
              {t("login")}
            </Button>
        ))}
        {/* Language buttons */}
        <Button
          variant="ghost"
          onClick={() => handleChangeLanguage("en")}
          className={`flex items-center gap-1 ${i18n.language === "en" ? "font-bold underline" : ""}`}
        >
          <span role="img" aria-label="English">🇬🇧</span> EN
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleChangeLanguage("mn")}
          className={`flex items-center gap-1 ${i18n.language === "mn" ? "font-bold underline" : ""}`}
        >
          <span role="img" aria-label="Montenegrin">🇲🇪</span> MN
        </Button>
      </div>


    </nav>
  );
}