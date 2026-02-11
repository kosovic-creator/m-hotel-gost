/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface SobeContentProps {
  sobe: any[];
  lang: 'en' | 'mn';
  t: any;
}

export default function SobeContent({
  sobe,
  lang,
  t
}: SobeContentProps) {
  return (
    <>
      {/* Full Screen Hero Banner Background */}
      <div
        className="relative min-h-screen w-full"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1280"><defs><linearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%23D4A574;stop-opacity:1" /><stop offset="50%25" style="stop-color:%238B7355;stop-opacity:1" /><stop offset="100%25" style="stop-color:%23654321;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad1)" width="1920" height="1280"/><path fill="%23F5DEB3" opacity="0.3" d="M0 0 L1920 400 L1920 0 Z"/><circle cx="200" cy="300" r="80" fill="%2327AE60" opacity="0.2"/><circle cx="1800" cy="400" r="120" fill="%2327AE60" opacity="0.15"/><rect x="300" y="800" width="400" height="300" fill="%23D2B48C" opacity="0.4" rx="20"/><circle cx="700" cy="900" r="60" fill="%23FFFFFF" opacity="0.3"/><path fill="%23E8D5C4" opacity="0.25" d="M100 1100 Q480 900 960 1100 T1820 1100 L1920 1280 L0 1280 Z"/></svg>')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Title Section */}
        <div className="text-center text-white py-20 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            {lang === "mn" ? "Naše Sobe" : "Our Rooms"}
          </h1>
          <p className="text-lg md:text-xl font-light drop-shadow-lg max-w-2xl mx-auto">
            {lang === "mn"
              ? "Pronađite savršenu sobu za vašu posjetu"
              : "Find the perfect room for your stay"}
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sobe.map((soba: any) => {
              let slikeArr: string[] = [];
              if (Array.isArray(soba.slike)) {
                slikeArr = soba.slike;
              } else if (typeof soba.slike === 'string') {
                try {
                  slikeArr = JSON.parse(soba.slike);
                  if (!Array.isArray(slikeArr)) {
                    slikeArr = soba.slike.split(',').map((s: string) => s.trim()).filter(Boolean);
                  }
                } catch {
                  slikeArr = soba.slike.split(',').map((s: string) => s.trim()).filter(Boolean);
                }
              }

              return (
                <div
                  key={soba.id}
                  className="rounded-lg bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm bg-white/95"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {slikeArr.length > 0 ? (
                      <Image
                        src={slikeArr[0]}
                        alt={`${t.room} ${soba.broj}`}
                        fill
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-500">{t.no_image || "Nema slike"}</span>
                        </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Room Number and Type */}
                    <div className="mb-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {t.room || "Soba"} {soba.broj}
                      </h2>
                      <p className="text-yellow-600 font-semibold">
                        {lang === "en" ? soba.tip_en || soba.tip : soba.tip}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {lang === "en" ? soba.opis_en || soba.opis : soba.opis}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-gray-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a1 1 0 11-2 0 1 1 0 012 0ZM9 12a1 1 0 11-2 0 1 1 0 012 0ZM10.5 1.5H5.75A2.75 2.75 0 003 4.25v11.5A2.75 2.75 0 005.75 18.5h8.5A2.75 2.75 0 0017 15.75V4.25A2.75 2.75 0 0014.25 1.5Z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">{t.capacity || "Kapacitet"}</p>
                          <p className="font-semibold text-gray-900">{soba.kapacitet}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-500">{t.price || "Cijena"}</p>
                          <p className="font-semibold text-gray-900">€{soba.cena}</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                      <a href={`/rezervacije?soba=${soba.broj}&lang=${lang}`}>
                        {lang === "mn" ? "Rezerviriši" : "Book Now"}
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}