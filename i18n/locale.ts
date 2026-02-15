import { cookies } from 'next/headers';

export type Language = 'sr' | 'en';

/**
 * Čita jezik iz cookies na serveru
 * @returns Trenutni jezik ('sr' ili 'en'), default je 'sr'
 */
export async function getLocale(): Promise<Language> {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value;

  if (lang === 'en' || lang === 'sr') {
    return lang;
  }

  return 'sr'; // default jezik
}
