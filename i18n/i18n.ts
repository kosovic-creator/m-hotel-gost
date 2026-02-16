/**
 * Učitaj prevode za dati jezik i namespace (npr. "proizvodi", "profil", ...)
 * @param lang Jezik (npr. "sr", "en")
 * @param namespace Naziv json fajla bez ekstenzije (npr. "proizvodi")
 */
export async function getLocaleMessages(lang: string, namespace: string) {
  // If running on the server, use fs
  if (typeof window === 'undefined') {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'i18n/locales', lang, `${namespace}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  }
  // If running in the browser, use dynamic import
  const messages = await import(`../i18n/locales/${lang}/${namespace}.json`);
  return messages.default || messages;
}