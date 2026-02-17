import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import { Suspense } from "react";
import { Footer } from "./components/footer";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocale } from "@/i18n/locale";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLocale();

  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/hotel2.jpg')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
        }}
      >
        <I18nProvider initialLang={lang}>
          <Suspense fallback={null}>
            <div className="absolute top-0 left-0 right-0 z-50">
              <Navbar />
            </div>
          </Suspense>
          {children}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
