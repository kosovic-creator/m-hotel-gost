
import Link from "next/link";


export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang: "en" | "sr" = params?.lang === "en" ? "en" : "sr";

  return (
    <>
      {/* Hotel Banner - Full Screen Hero */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Content */}
        <div className="relative h-full flex items-center justify-center px-4 pt-20">
          <div className="text-center text-white max-w-3xl">
            {/* Logo/Title Area */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-lg">
                M-HOTEL
              </h1>
              <div className="h-1 w-24 bg-linear-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
            </div>

            {/* Main Heading */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-5xl font-light mb-4 drop-shadow-lg leading-tight">
                {lang === "sr"
                  ? "Uživajte luksuz i udobnost"
                  : "Experience Luxury & Comfort"}
              </h2>
              <p className="text-lg md:text-xl font-light drop-shadow-lg text-gray-200">
                {lang === "sr"
                  ? "Otkrijte savršenu kombinaciju udobnosti, elegancije i vrhunske usluge"
                  : "Discover the perfect blend of comfort, elegance, and world-class service"}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/rezervacije"
                className="px-8 py-3 bg-linear-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {lang === "sr" ? "Rezerviriši sada" : "Book Now"}
              </Link>
              <button
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 hover:shadow-lg"
              >
                {lang === "sr" ? "Saznajte više" : "Learn More"}
              </button>
            </div>

            {/* Stats Section */}
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl md:text-4xl font-bold">25+</p>
                <p className="text-sm text-gray-200">
                  {lang === "sr" ? "Sobe" : "Rooms"}
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold">4.8★</p>
                <p className="text-sm text-gray-200">
                  {lang === "sr" ? "Ocjene" : "Rating"}
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold">1000+</p>
                <p className="text-sm text-gray-200">
                  {lang === "sr" ? "Recenzije" : "Reviews"}
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
