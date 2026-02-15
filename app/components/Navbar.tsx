"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLang =
    searchParams?.get("lang") === "en" || searchParams?.get("lang") === "sr"
      ? (searchParams.get("lang") as "en" | "sr")
      : "sr";

  const handleChangeLanguage = (lng: "en" | "sr") => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("lang", lng);
    router.push(`${pathname}?${params.toString()}`);
    setMenuOpen(false);
  };

  return (
    <nav className="w-full bg-transparent px-4 py-3 flex justify-between items-center md:px-6 md:py-4 relative z-20 print:hidden">
      {/* Logo & desktop nav */}
      <div className="flex flex-row items-center gap-4">
        <Link href={`/?lang=${currentLang}`} className="text-xl font-bold">
          <span className="font-bold text-sm sm:text-base truncate ">
            <span className="text-gray-800">⭕️ </span>
            <span className="text-gray-800">{"M-HOTEL Gost".slice(0, 7)}</span>
            <span className="text-red-600">{"M-HOTEL Gost".slice(7)}</span>
          </span>
        </Link>
        <div className="hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-amber-500 hover:text-gray-600"
          >
            <Link href={`/sobe?lang=${currentLang}`}>
              {currentLang === "sr" ? "Sobe" : "Rooms"}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={() => setMenuOpen(false)}
            className="text-amber-500 hover:text-gray-300"
          >
            <Link href={`/o_hotelu?lang=${currentLang}`}>
              {currentLang === "sr" ? "O hotelu" : "About"}
            </Link>
          </Button>
        </div>
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
        <div className="flex flex-col h-full p-4 gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={() => setMenuOpen(false)}
            className="text-amber-500 hover:text-gray-300"
          >
            <Link href={`/sobe?lang=${currentLang}`}>
              {currentLang === "sr" ? "Sobe" : "Rooms"}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={() => setMenuOpen(false)}
            className="text-amber-500 hover:text-gray-300"
          >
            <Link href={`/o_hotelu?lang=${currentLang}`}>
              {currentLang === "sr" ? "O hotelu" : "About"}
            </Link>
          </Button>
          {/* Language buttons */}
          <div className="flex flex-col gap-2 border-t border-gray-700 pt-4 mt-4">
            <Button
              variant="ghost"
              onClick={() => handleChangeLanguage("en")}
              className={`flex items-center gap-1 text-white hover:text-gray-400 ${currentLang === "en" ? "font-bold" : ""}`}
            >
              <span role="img" aria-label="EN">
                🇬🇧
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleChangeLanguage("sr")}
              className={`flex items-center gap-1 text-white hover:text-gray-400 ${currentLang === "sr" ? "font-bold" : ""}`}
            >
              <span role="img" aria-label="MN">
                🇲🇪
              </span>
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
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open menu"
      >
        <span className="block w-6 h-0.5 bg-white mb-1"></span>
        <span className="block w-6 h-0.5 bg-white mb-1"></span>
        <span className="block w-6 h-0.5 bg-white"></span>
      </button>

      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => handleChangeLanguage("en")}
          className={`flex items-center gap-1 text-white hover:text-gray-400 ${currentLang === "en" ? "font-bold" : ""}`}
        >
          <span role="img" aria-label="EN">
            🇬🇧
          </span>{" "}
          EN
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleChangeLanguage("sr")}
          className={`flex items-center gap-1 text-white hover:text-gray-400 ${currentLang === "sr" ? "font-bold" : ""}`}
        >
          <span role="img" aria-label="MN">
            🇲🇪
          </span>{" "}
          MN
        </Button>
      </div>
    </nav>
  );
}