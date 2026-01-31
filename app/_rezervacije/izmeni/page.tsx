import { ucitajSobuId, azurirajSobu } from '@/actions/soba';
import { getLocaleMessages } from '@/i18n/i18n';
import SobaForm from '../components/SobaForm';

export default async function IzmjeniPage({ searchParams }: { searchParams: Promise<{ lang?: string; sobaId?: string }> }) {
    const params = typeof searchParams === 'object' && 'then' in searchParams
        ? await searchParams
        : searchParams;

    const lang: "en" | "mn" = params.lang === "mn" ? "mn" : "en";
    const t = getLocaleMessages(lang, 'sobe');
    const id = Number(params.sobaId);

    if (!params.sobaId || isNaN(id)) {
        return <div>{t("invalid")}</div>;
    }

    const room = await ucitajSobuId({ sobaId: id });

    if (!room) {
        return <div>{t("notfound")}</div>;
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen px-2 sm:px-0 bg-gray-50">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 sm:p-8 mt-8">

                    <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">{t.edit}</h1>
                    <SobaForm
                        action={azurirajSobu}
                        initialData={{ ...room, id: String(room.id), slike: Array.isArray(room.slike) ? room.slike.join(', ') : (room.slike ?? undefined) }}
                        mode="izmeni"
                        lang={lang}
                    />
                </div>
            </div>
        </>
    );
}