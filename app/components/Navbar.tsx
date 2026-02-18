"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const tr = (key: string) => t('navbar', key);

  const handleChangeLanguage = (lng: "en" | "sr") => {
    setLanguage(lng);
    setMenuOpen(false);
  };

  return (
    <nav className="w-full bg-transparent px-4 py-3 flex justify-between items-center md:px-6 md:py-4 relative z-20 print:hidden">
      {/* Logo & desktop nav */}
      <div className="flex flex-row items-center gap-2 sm:gap-4">
        <Link href="/" className="text-xl font-bold">
          <Image
            src="/apple-touch-icon.png"
            alt="M-HOTEL Gost"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
        </Link>

        {/* Rooms link - mobile & desktop */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-amber-500 hover:text-gray-600 text-lg sm:text-base"
        >
          <Link href="/sobe">
            {tr('rooms')}
          </Link>
        </Button>

        {/* Desktop navigation */}
        {/* <div className="hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={() => setMenuOpen(false)}
            className="text-amber-500 hover:text-gray-300 text-lg"
          >
            <Link href="/o_hotelu">
              {tr('about')}
            </Link>
          </Button>
        </div> */}
      </div>

      {/* Mobile nav sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-lg z-40 transform
          transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          sm:hidden
        `}
        style={{ willChange: "transform" }}
      >
        {/* <div className="flex flex-col h-full p-4 gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={() => setMenuOpen(false)}
            className="text-amber-500 hover:text-gray-300"
          >
            <Link href="/o_hotelu">
              {tr('about')}
            </Link>
          </Button>
        </div> */}
      </div>

      {/* Overlay for sidebar */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-sm z-30 sm:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile nav controls */}
      <div className="sm:hidden flex items-center gap-2">
        {/* Language buttons for mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleChangeLanguage("en")}
          className={`px-2 py-1 text-lg font-medium ${language === "en" ? "text-amber-500" : "text-gray-300"} hover:text-amber-400`}
        >
          <span role="img" aria-label="EN">
            🇬🇧
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleChangeLanguage("sr")}
          className={`px-2 py-1 text-lg font-medium ${language === "sr" ? "text-amber-500" : "text-gray-300"} hover:text-amber-400`}
        >
          <span role="img" aria-label="SR">
            🇲🇪
          </span>
        </Button>

        {/* Hamburger icon */}
        <button
          className="flex flex-col justify-center items-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={tr('open_menu')}
        >
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => handleChangeLanguage("en")}
          className={`flex items-center gap-1 text-2xl text-white hover:text-gray-400 ${language === "en" ? "font-bold" : ""}`}
        >
          <span role="img" aria-label="EN">
            🇬🇧
          </span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleChangeLanguage("sr")}
          className={`flex items-center gap-1 text-2xl text-white hover:text-gray-400 ${language === "sr" ? "font-bold" : ""}`}
        >
          <span role="img" aria-label="MN">
            🇲🇪
          </span>
        </Button>
      </div>
    </nav>
  );
}