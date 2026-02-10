
import Link from 'next/link';
import { getLocaleMessages } from "@/i18n/i18n";
export default async function NotFound({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
 const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
    const t = getLocaleMessages(lang, 'common');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-600 mb-8">
          {t.not_found_message}
        </p>
        <Link
          href={`/?lang=${lang}`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
         {t.go_home}
        </Link>
      </div>
    </div>
  )
}
