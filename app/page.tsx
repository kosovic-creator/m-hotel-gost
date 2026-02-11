''
import { getLocaleMessages } from "@/i18n/i18n";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
  const t = getLocaleMessages(lang, 'common');

  return (
    <>
      {/* Hotel Banner - Full Screen Hero */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background Image - Luxury Hotel */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1280"><defs><linearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%23D4A574;stop-opacity:1" /><stop offset="50%25" style="stop-color:%238B7355;stop-opacity:1" /><stop offset="100%25" style="stop-color:%23654321;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad1)" width="1920" height="1280"/><path fill="%23F5DEB3" opacity="0.3" d="M0 0 L1920 400 L1920 0 Z"/><circle cx="200" cy="300" r="80" fill="%2327AE60" opacity="0.2"/><circle cx="1800" cy="400" r="120" fill="%2327AE60" opacity="0.15"/><rect x="300" y="800" width="400" height="300" fill="%23D2B48C" opacity="0.4" rx="20"/><circle cx="700" cy="900" r="60" fill="%23FFFFFF" opacity="0.3"/><path fill="%23E8D5C4" opacity="0.25" d="M100 1100 Q480 900 960 1100 T1820 1100 L1920 1280 L0 1280 Z"/></svg>')`,
            backgroundAttachment: 'fixed',
          }}
        ></div>

        {/* Navbar - Positioned absolutely on top */}
        {/* <div className="absolute top-0 left-0 right-0 z-50">
          <Navbar />
        </div> */}

        {/* Content */}
        <div className="relative h-full flex items-center justify-center px-4 pt-20">
          <div className="text-center text-white max-w-3xl">
            {/* Logo/Title Area */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-lg">
                M-HOTEL
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
            </div>

            {/* Main Heading */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-5xl font-light mb-4 drop-shadow-lg leading-tight">
                {lang === "mn"
                  ? "Uživajte luksuz i udobnost"
                  : "Experience Luxury & Comfort"}
              </h2>
              <p className="text-lg md:text-xl font-light drop-shadow-lg text-gray-200">
                {lang === "mn"
                  ? "Otkrijte savršenu kombinaciju udobnosti, elegancije i vrhunske usluge"
                  : "Discover the perfect blend of comfort, elegance, and world-class service"}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/rezervacije"
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {lang === "mn" ? "Rezerviriši sada" : "Book Now"}
              </Link>
              <button
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 hover:shadow-lg"
              >
                {lang === "mn" ? "Saznajte više" : "Learn More"}
              </button>
            </div>

            {/* Stats Section */}
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl md:text-4xl font-bold">25+</p>
                <p className="text-sm text-gray-200">
                  {lang === "mn" ? "Sobe" : "Rooms"}
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold">4.8★</p>
                <p className="text-sm text-gray-200">
                  {lang === "mn" ? "Ocjene" : "Rating"}
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold">1000+</p>
                <p className="text-sm text-gray-200">
                  {lang === "mn" ? "Recenzije" : "Reviews"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white opacity-70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
