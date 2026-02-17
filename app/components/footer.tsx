"use client";
import { useI18n } from '@/i18n/I18nProvider';

export function Footer() {
  const { t } = useI18n();
  const tr = (key: string) => t('common', key);

  return (
    <footer className="mt-auto border-t py-4 text-center text-sm text-gray-200 bg-gray-800">
      © {new Date().getFullYear()} {tr('footer_brand')}. {tr('footer_rights_reserved')}
    </footer>
  );
}
