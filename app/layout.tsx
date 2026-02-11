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
