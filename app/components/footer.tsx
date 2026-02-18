"use client";
import { useI18n } from '@/i18n/I18nProvider';
import Link from 'next/link';

export function Footer() {
  const { t } = useI18n();
  const tr = (key: string) => t('common', key);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-linear-to-b from-black/80 to-black border-t border-amber-600/30 text-gray-300">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                {tr('footer_brand')}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {tr('footer_description')}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="h-1 w-8 bg-amber-500 rounded" />
              {tr('footer_quick_links')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                  <span className="text-amber-500">›</span> {tr('footer_home')}
                </Link>
              </li>
              <li>
                <Link href="/sobe" className="text-gray-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                  <span className="text-amber-500">›</span> {tr('footer_rooms')}
                </Link>
              </li>
              <li>
                <Link href="/rezervacije" className="text-gray-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                  <span className="text-amber-500">›</span> {tr('footer_reservations')}
                </Link>
              </li>
              <li>
                <Link href="/mapa" className="text-gray-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                  <span className="text-amber-500">›</span> {tr('footer_map')}
                </Link>
              </li>
              <li>
                <Link href="/o_hotelu" className="text-gray-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2">
                  <span className="text-amber-500">›</span> {tr('footer_about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="h-1 w-8 bg-amber-500 rounded" />
              {tr('footer_contact')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400 text-sm hover:text-amber-500 transition-colors cursor-pointer">
                  {tr('footer_email')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-400 text-sm hover:text-amber-500 transition-colors cursor-pointer">
                  {tr('footer_phone')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm font-medium">{tr('footer_follow_us')}:</span>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-amber-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5c-.563-.074-1.396-.074-2.59-.074-2.833 0-4.777 1.745-4.777 4.933v1.667z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-amber-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-amber-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="currentColor" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-500 text-sm">
                © {currentYear} <span className="text-amber-500 font-semibold">{tr('footer_brand')}</span>. {tr('footer_rights_reserved')}
              </p>
              <p className="text-gray-600 text-xs mt-2 flex items-center justify-center md:justify-end gap-2">
                <span>{tr('footer_privacy_policy')}</span>
                <span className="text-gray-700">•</span>
                <span>{tr('footer_terms_conditions')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
