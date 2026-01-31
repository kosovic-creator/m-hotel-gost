import { getRezervacijaById } from '@/actions/rezervacije';
import { izmeniRezervaciju } from '@/actions/rezervacije';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLocaleMessages } from '@/i18n/i18n';

type SearchParams = {
    id?: string;
    gostError?: string;
    sobaError?: string;
    prijavaError?: string;
    odjavaError?: string;
    statusError?: string;
    gost?: string;
    soba?: string;
    prijava?: string;
    odjava?: string;
    status?: string;
    lang?: string;
};

const IzmeniStrana = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
    const params = await searchParams;
    const id = params?.id ? Number(params.id) : undefined;
    if (id === undefined) {
        return <div>Nije pronađen ID rezervacije.</div>;
    }
    const rezervacije = await getRezervacijaById({ rezervacijaId: id });

        // Prikaz grešaka preko query parametara (npr. ?gostError=Required)
        const errors: Record<string, string> = {};
        if (params?.gostError) errors.gost = params.gostError;
        if (params?.sobaError) errors.soba = params.sobaError;
        if (params?.prijavaError) errors.prijava = params.prijavaError;
        if (params?.odjavaError) errors.odjava = params.odjavaError;
        if (params?.statusError) errors.status = params.statusError;
                // Popuni formData iz query parametara samo ako postoje, u suprotnom koristi iz baze
                                // Helper za validan date string (YYYY-MM-DD)
                                function toDateInput(val: any): string {
                                    if (!val) return '';
                                    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
                                    const d = new Date(val);
                                    if (isNaN(d.getTime())) return '';
                                    return d.toISOString().slice(0, 10);
                                }
                                function getFieldValue(paramVal: string | undefined, dbVal: any, isDate = false) {
                                    if (isDate) {
                                        if (paramVal && paramVal !== '') return toDateInput(paramVal);
                                        if (dbVal) return toDateInput(dbVal);
                                        return '';
                                    }
                                    if (paramVal && paramVal !== '') return paramVal;
                                    return dbVal ?? '';
                                }
                                const formData: Record<string, string> = {
                                    gost: getFieldValue(params?.gost, rezervacije?.gost?.id),
                                    soba: getFieldValue(params?.soba, rezervacije?.soba?.id),
                                    prijava: getFieldValue(params?.prijava, rezervacije?.prijava, true),
                                    odjava: getFieldValue(params?.odjava, rezervacije?.odjava, true),
                                    status: getFieldValue(params?.status, rezervacije?.status)
                                };
                                // Debug: log vrijednosti datuma
                                console.log('prijava:', formData.prijava, typeof formData.prijava);
                                console.log('odjava:', formData.odjava, typeof formData.odjava);

    const lang = params?.lang === 'mn' ? 'mn' : 'en';
    const messages = getLocaleMessages(lang, 'rezervacije');
    const t = (key: string) => messages[key] || key;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-2 sm:px-0 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 sm:p-8 mt-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">Izmeni rezervaciju ID: {rezervacije?.id}</h1>
                <form action={izmeniRezervaciju} className="mb-8 flex gap-4 flex-col max-w-md mt-4 w-full" noValidate>
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <Input name="id" id="id" value={rezervacije?.id} readOnly />
                    <Input name="gost" defaultValue={formData.gost} />
                    {errors.gost && <span className="text-red-600 text-xs">{errors.gost}</span>}
                    <Input name="soba" defaultValue={formData.soba} />
                    {errors.soba && <span className="text-red-600 text-xs">{errors.soba}</span>}
                    <input name="prijava" type="date" className="border rounded px-2 py-1 w-full" defaultValue={formData.prijava} />
                    {errors.prijava && <span className="text-red-600 text-xs">{errors.prijava}</span>}
                    <input name="odjava" type="date" className="border rounded px-2 py-1 w-full" defaultValue={formData.odjava} />
                    {errors.odjava && <span className="text-red-600 text-xs">{errors.odjava}</span>}
                    <Input name="status" defaultValue={formData.status} />
                    {errors.status && <span className="text-red-600 text-xs">{errors.status}</span>}
                    <div className="flex flex-col sm:flex-row sm:gap-x-0 gap-y-3 mt-1 pt-3 border-t">
                        <a
                            href={`/rezervacije`}
                            className="flex-1 py-2 text-base text-gray-600 hover:text-blue-900 border rounded text-center flex items-center justify-center"
                        >
                            Otkaži
                        </a>
                        <Button type="submit">
                            Sačuvaj izmene
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default IzmeniStrana