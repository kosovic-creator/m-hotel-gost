import { getLocaleMessages } from "@/i18n/i18n";


export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
   const params = await searchParams;
  const lang: "en" | "mn" = params?.lang === "mn" ? "mn" : "en";
    const t = getLocaleMessages(lang, 'common');
  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="container mx-auto py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{t.welcome}</h1>
        </div>
      </div>
    </>
  );
}
