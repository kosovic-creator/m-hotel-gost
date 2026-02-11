import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import { Providers } from "./providers";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | M-HOTEL Gost`,
    default: "M-HOTEL Gost",
  },
  description: "Aplikacija za upravljanje M-HOTEL sistemom",
  metadataBase: new URL("http://localhost:4000"),
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1280"><defs><linearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:%23D4A574;stop-opacity:1" /><stop offset="50%25" style="stop-color:%238B7355;stop-opacity:1" /><stop offset="100%25" style="stop-color:%23654321;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad1)" width="1920" height="1280"/><path fill="%23F5DEB3" opacity="0.3" d="M0 0 L1920 400 L1920 0 Z"/><circle cx="200" cy="300" r="80" fill="%2327AE60" opacity="0.2"/><circle cx="1800" cy="400" r="120" fill="%2327AE60" opacity="0.15"/><rect x="300" y="800" width="400" height="300" fill="%23D2B48C" opacity="0.4" rx="20"/><circle cx="700" cy="900" r="60" fill="%23FFFFFF" opacity="0.3"/><path fill="%23E8D5C4" opacity="0.25" d="M100 1100 Q480 900 960 1100 T1820 1100 L1920 1280 L0 1280 Z"/></svg>')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
        }}
      >
        <Providers>
          <Suspense fallback={null}>
            <div className="absolute top-0 left-0 right-0 z-50">
              <Navbar />
            </div>
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
