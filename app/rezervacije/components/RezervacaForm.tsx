'use client';
import React, { useState, useRef } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { rezervacijaSchema } from "@/app/validation/rezervacijaSchema";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


type RezervacijaData = {
    id?: string;
    broj: string;
    tip: string;
    kapacitet: number;
    cena: number;
    opis?: string;
    tip_en?: string;
    opis_en?: string;
    slike?: string;
    slikeArr?: string[];
};


interface RezervacijaFormProps {
    action: (formData: FormData) => Promise<void>;
    initialData?: Partial<RezervacijaData>;
    mode?: 'dodaj' | 'izmeni';
    lang?: string; // dodaj ovo
}

export default function RezervacijaForm({ action, initialData, mode, lang }: RezervacijaFormProps) {

    const { t } = useTranslation("rezervacije");
    const router = useRouter();
    const [form, setForm] = useState({
        broj: initialData?.broj || '',
        tip: initialData?.tip || '',
        kapacitet: initialData?.kapacitet?.toString() || '',
        cena: initialData?.cena?.toString() || '',
        opis: initialData?.opis || '',
        slike: Array.isArray(initialData?.slike) ? initialData.slike.join(', ') : (initialData?.slike || ''),
        tip_en: initialData?.tip_en || '',
        opis_en: initialData?.opis_en || '',
    });

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setForm(f => ({ ...f, slike: f.slike ? f.slike + ', ' + data.url : data.url }));
            } else {
                setError('Greška pri uploadu slike.');
            }
        } catch {
            setError('Greška pri uploadu slike.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const [fieldErrors, setFieldErrors] = useState<{ broj?: string; tip?: string; kapacitet?: string; cena?: string; opis?: string; tip_en?: string; opis_en?: string; slike?: string }>({});
    const [error, setError] = useState("");

    type RezervacijeField = "broj_osoba" | "datum_prijave" | "datum_odjave" | "status" | "kreirano" | "azurirano";
    const validateField = (field: RezervacijeField, value: string) => {
        let slikeArr = form.slike;
        if (field === 'slike') {
            slikeArr = value;
        }
        const slikeArray = slikeArr.split(',').map(s => s.trim()).filter(Boolean);
        const data = { ...form, [field]: value, slike: slikeArray };
        const parsedData = {
            ...data,
            broj_osoba: Number(data.broj_osoba),
            datum_prijave: data.datum_prijave,
            datum_odjave: data.datum_odjave,
            status: data.status,
            kreirano: data.kreirano,
            azurirano: data.azurirano
        };
        const result = rezervacijaSchema(t).safeParse(parsedData);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setFieldErrors(prev => ({ ...prev, [field]: errors[field]?.[0] }));
        } else {
            setFieldErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const slikeArray = form.slike.split(',').map(s => s.trim()).filter(Boolean);
        const parsedData = {
            ...form,
            slike: slikeArray,
            kapacitet: Number(form.kapacitet),
            cena: Number(form.cena)
        };
        const result = rezervacijaSchema(t).safeParse(parsedData);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setFieldErrors({
                broj_osoba: errors.broj_osoba?.[0],
                datum_prijave: errors.datum_prijave?.[0],
                datum_odjave: errors.datum_odjave?.[0],
                status: errors.status?.[0],
                kreirano: errors.kreirano?.[0],
                azurirano: errors.azurirano?.[0],
            });
            return;
        }
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });
        if (initialData?.id) formData.append("id", initialData.id);
        await action(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4 flex-col max-w-md mt-4 w-full">
            <input type="hidden" name="lang" value={lang || 'mn'} />
            <input type="hidden" name="id" value={initialData?.id ?? ''} />
            <Input
                name="broj"
                placeholder={t("number_pl")}
                required
                value={form.broj}
                onChange={e => setForm(f => ({ ...f, broj: e.target.value }))}
                onBlur={e => validateField("broj", e.target.value)}
                className="w-full"
            />
            {fieldErrors.broj && <div className="text-red-500 text-xs pl-1">{fieldErrors.broj}</div>}
            <Input
                name="kapacitet"
                placeholder={t("capacity_pl")}
                type="number"
                required
                value={form.kapacitet}
                onChange={e => setForm(f => ({ ...f, kapacitet: e.target.value }))}
                onBlur={e => validateField("kapacitet", e.target.value)}
                className="w-full"
            />
            {fieldErrors.kapacitet && <div className="text-red-500 text-xs pl-1">{fieldErrors.kapacitet}</div>}
            <Input
                name="cena"
                placeholder={t("price_pl")}
                type="number"
                required
                value={form.cena}
                onChange={e => setForm(f => ({ ...f, cena: e.target.value }))}
                onBlur={e => validateField("cena", e.target.value)}
                className="w-full"
            />
            {fieldErrors.cena && <div className="text-red-500 text-xs pl-1">{fieldErrors.cena}</div>}
            {error && <div className="text-red-500 text-xs pl-1">{error}</div>}

            <Tabs defaultValue="mn" className="w-full">
                <TabsList className="mb-0 gap-x-2">
                    <TabsTrigger value="mn">🇲🇪 Montenegro</TabsTrigger>
                    <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                </TabsList>
                <TabsContent value="mn">
                    <Input
                        name="tip"
                        placeholder={t("type_mn")}
                        required
                        value={form.tip}
                        onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}
                        onBlur={e => validateField("tip", e.target.value)}
                        className="w-full"
                    />
                    {fieldErrors.tip && <div className="text-red-500 text-xs pl-1">{fieldErrors.tip}</div>}
                    <Input
                        name="opis"
                        placeholder={t("description_mn")}
                        required
                        value={form.opis}
                        onChange={e => setForm(f => ({ ...f, opis: e.target.value }))}
                        onBlur={e => validateField("opis", e.target.value)}
                        className="w-full"
                    />
                    {fieldErrors.opis && <div className="text-red-500 text-xs pl-1">{fieldErrors.opis}</div>}
                </TabsContent>
                <TabsContent value="en">
                    <Input
                        name="tip_en"
                        placeholder={t("type_en")}
                        required
                        value={form.tip_en}
                        onChange={e => setForm(f => ({ ...f, tip_en: e.target.value }))}
                        onBlur={e => validateField("tip_en", e.target.value)}
                        className="w-full"
                    />
                    {fieldErrors.tip_en && <div className="text-red-500 text-xs pl-1">{fieldErrors.tip_en}</div>}
                    <Input
                        name="opis_en"
                        placeholder={t("description_en")}
                        required
                        value={form.opis_en}
                        onChange={e => setForm(f => ({ ...f, opis_en: e.target.value }))}
                        onBlur={e => validateField("opis_en", e.target.value)}
                        className="w-full"
                    />
                    {fieldErrors.opis_en && <div className="text-red-500 text-xs pl-1">{fieldErrors.opis_en}</div>}
                </TabsContent>
            </Tabs>

            <div className="flex flex-col gap-2 mb-2">
                <label className="font-medium">{t("images")}</label>
                <Input
                    name="slike"
                    placeholder={t("images")}
                    required
                    value={form.slike}
                    onChange={e => setForm(f => ({ ...f, slike: e.target.value }))}
                    onBlur={e => validateField("slike", e.target.value)}
                    className="w-full"
                />
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    disabled={uploading}
                />
                <small style={{ color: '#666' }}>
                    Više slika unesite kao CSV, odvojeno zarezom.
                </small>
                {uploading && <span className="text-blue-500 text-xs">Slika se uploaduje...</span>}
                {fieldErrors.slike && <div className="text-red-500 text-xs pl-1">{fieldErrors.slike}</div>}
                {/* Prikaz izabranih slika */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {form.slike.split(',').map((url, idx) => {
                        const trimmed = url.trim();
                        if (!trimmed) return null;
                        return (
                            <Image
                                key={idx}
                                src={trimmed}
                                alt={`slika-${idx + 1}`}
                                width={80}
                                height={80}
                                className="w-20 h-20 object-cover rounded border"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                unoptimized
                            />
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:gap-x-0 gap-y-3 mt-1 pt-3 border-t">
                <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 py-2 text-base text-gray-600 hover:text-blue-900 "
                    onClick={() => router.push(`/sobe?lang=${lang}`)}
                >
                    {t("back")}
                </Button>
                <Button type="submit" variant="default" className="flex-1 py-2 text-base ">
                    {mode === 'izmeni' ? t("edit") : t("add")}
                </Button>
            </div>
        </form>
    );
}