import { Check, Clipboard, Download, FileText, Lightbulb, Palette, Save, Sparkles, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { CostumeStyleType, DecorStyleType, PlayAnalysis } from "../types";

type PromptCategory = "set" | "costume" | "lighting" | "poster" | "custom";
type AspectRatio = "16:9" | "3:4" | "1:1" | "4:3" | "9:16";

interface SavedPrompt {
  id: number;
  title: string;
  category: PromptCategory;
  prompt: string;
  negativePrompt: string;
  createdAt: string;
}

interface VisualsTabProps {
  analysis: PlayAnalysis | null;
  decorStyle: DecorStyleType;
  costumeStyle: CostumeStyleType;
  initialCategory?: PromptCategory;
  initialCharacter?: string;
}

const categoryLabels: Record<PromptCategory, string> = {
  set: "Sahne tasarımı",
  costume: "Karakter kostümü",
  lighting: "Işık ve atmosfer",
  poster: "Afiş / ana görsel",
  custom: "Serbest çalışma",
};

const decorLabels: Record<DecorStyleType, string> = {
  minimalist: "minimalist scenography",
  brechtian: "Brechtian epic theatre scenography",
  symbolic: "symbolic scenography",
  realist: "realist theatrical scenography",
  postmodern: "postmodern scenography",
  expressionist: "expressionist scenography",
  industrial: "industrial scenography",
};

const costumeLabels: Record<CostumeStyleType, string> = {
  dönemsel: "historically grounded period costume",
  modern: "contemporary costume adaptation",
  stilize: "stylized symbolic costume",
};

const artStyles = [
  "professional theatre concept art",
  "production-ready costume illustration",
  "cinematic editorial photography",
  "watercolor and ink design sketch",
  "architectural stage model rendering",
];

const safeJoin = (values: string[] | undefined, fallback: string) =>
  values?.filter(Boolean).join(", ") || fallback;

export const VisualsTab: React.FC<VisualsTabProps> = ({
  analysis,
  decorStyle,
  costumeStyle,
  initialCategory = "set",
  initialCharacter,
}) => {
  const [category, setCategory] = useState<PromptCategory>(initialCategory);
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [artStyle, setArtStyle] = useState(artStyles[0]);
  const [customBrief, setCustomBrief] = useState("");
  const [manualPrompt, setManualPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  useEffect(() => setCategory(initialCategory), [initialCategory]);

  useEffect(() => {
    if (!analysis || !initialCharacter) return;
    const index = analysis.characters.findIndex((character) => character.name === initialCharacter);
    if (index >= 0) setSelectedCharacter(index);
  }, [analysis, initialCharacter]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dt_prompt_archive");
      if (stored) setSavedPrompts(JSON.parse(stored));
    } catch {
      setSavedPrompts([]);
    }
  }, []);

  const generatedPrompt = useMemo(() => {
    if (!analysis) return "";
    const character = analysis.characters[selectedCharacter];
    const location = analysis.locations[selectedLocation];
    const common = [
      `Create ${artStyle} for the theatre play “${analysis.title}” by ${analysis.author}.`,
      `Genre and period: ${analysis.genreAndPeriod.text}. Time period: ${analysis.timePeriod.text}.`,
      `Core dramatic conflict: ${analysis.coreConflict.text}.`,
      `Themes: ${analysis.mainAndSubThemes.map((item) => item.text).join("; ")}.`,
    ];

    if (category === "costume" && character) {
      return [
        ...common,
        `Design one complete ${costumeLabels[costumeStyle]} for the character ${character.name}, ${character.role}.`,
        `Character psychology and dramatic function: ${character.traits}; ${character.functionInPlot}.`,
        `Garment and silhouette requirements: ${character.costumeGarment}.`,
        `Fabric, texture, wear and construction: ${character.costumeFabric}.`,
        `Color palette: ${safeJoin(character.colors, "dramaturgically appropriate restrained colors")}.`,
        `Costume evolution during the play: ${character.changeNote}. Character transformation: ${character.transformation}.`,
        "Show a full-body front three-quarter view, readable silhouette, layered garment construction, fabric behavior, footwear and essential accessories.",
        "Present only this character, neutral studio background, no text, no labels, no watermark.",
        `Composition aspect ratio ${aspectRatio}. ${customBrief}`,
      ].join("\n");
    }

    if (category === "lighting") {
      return [
        ...common,
        `Create a theatrical lighting concept for ${location?.text || "the principal playing space"}.`,
        `Scenographic language: ${decorLabels[decorStyle]}.`,
        `Lighting and atmosphere requirements: ${analysis.lightingAndAtmosphere.map((item) => item.text).join("; ")}.`,
        "Define motivated light sources, direction, contrast, shadow density, haze, practicals, transitions and a disciplined color temperature palette.",
        "Wide audience viewpoint, physically plausible stage lighting, no text, no watermark.",
        `Composition aspect ratio ${aspectRatio}. ${customBrief}`,
      ].join("\n");
    }

    if (category === "poster") {
      return [
        ...common,
        "Create a bold key visual for a professional theatre poster.",
        `Use visual metaphors derived from: ${analysis.mainAndSubThemes.map((item) => item.text).join("; ")}.`,
        `Integrate symbolic objects from the play: ${analysis.props.map((item) => item.text).join("; ")}.`,
        "Strong visual hierarchy and generous negative space for title and credits, but do not render any lettering, logos or watermark.",
        `Composition aspect ratio ${aspectRatio}. ${customBrief}`,
      ].join("\n");
    }

    if (category === "custom") {
      return [
        ...common,
        customBrief || "Develop an original visual interpretation grounded strictly in the dramaturgical analysis.",
        "Professional theatre design quality, coherent visual language, no text, no watermark.",
        `Composition aspect ratio ${aspectRatio}.`,
      ].join("\n");
    }

    return [
      ...common,
      `Design ${decorLabels[decorStyle]} for ${location?.text || "the principal stage location"}.`,
      `Set requirements: ${analysis.setRequirements.map((item) => item.text).join("; ")}.`,
      `Essential props: ${analysis.props.map((item) => item.text).join("; ")}.`,
      `Atmosphere and lighting: ${analysis.lightingAndAtmosphere.map((item) => item.text).join("; ")}.`,
      "Show the complete proscenium stage from the audience viewpoint, playable circulation, entrances, levels, scale, material logic and practical construction detail.",
      "Production-ready theatrical concept art, no performers, no text, no watermark.",
      `Composition aspect ratio ${aspectRatio}. ${customBrief}`,
    ].join("\n");
  }, [analysis, artStyle, aspectRatio, category, costumeStyle, customBrief, decorStyle, selectedCharacter, selectedLocation]);

  useEffect(() => setManualPrompt(null), [generatedPrompt]);

  const prompt = manualPrompt ?? generatedPrompt;
  const negativePrompt = "watermark, signature, logo, captions, illegible text, low resolution, blurry details, malformed anatomy, extra limbs, duplicated objects, generic stock imagery, inconsistent costume construction, modern objects not required by the concept";
  const promptTitle = useMemo(() => {
    if (!analysis) return "Prompt";
    const character = analysis.characters[selectedCharacter];
    if (category === "costume" && character) return `${analysis.title} — ${character.name}`;
    return `${analysis.title} — ${categoryLabels[category]}`;
  }, [analysis, category, selectedCharacter]);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(`${prompt}\n\nNEGATIVE PROMPT:\n${negativePrompt}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadPrompt = () => {
    const content = `${promptTitle}\n\n${prompt}\n\nNEGATIVE PROMPT:\n${negativePrompt}`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${promptTitle.replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ -]/g, "").replace(/\s+/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const savePrompt = () => {
    const entry: SavedPrompt = { id: Date.now(), title: promptTitle, category, prompt, negativePrompt, createdAt: new Date().toLocaleString("tr-TR") };
    const updated = [entry, ...savedPrompts].slice(0, 30);
    setSavedPrompts(updated);
    localStorage.setItem("dt_prompt_archive", JSON.stringify(updated));
  };

  const removePrompt = (id: number) => {
    const updated = savedPrompts.filter((item) => item.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem("dt_prompt_archive", JSON.stringify(updated));
  };

  if (!analysis) {
    return <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900"><FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" /><h3 className="font-bold">Prompt Atölyesi Henüz Aktif Değil</h3><p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Önce oyun metnini inceleyin. Sahne, kostüm ve ışık promptları rapordaki gerçek bilgilerden hazırlanacaktır.</p></div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/35"><div className="flex items-start gap-3"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" /><div><h2 className="font-bold text-indigo-950 dark:text-indigo-100">Görsel Prompt Atölyesi</h2><p className="mt-1 text-xs leading-relaxed text-indigo-800 dark:text-indigo-200">Bu bölüm görsel üretmez ve görsel kotası kullanmaz. Hazırlanan profesyonel promptu kopyalayıp Gemini Canvas veya tercih ettiğiniz görsel aracında kullanabilirsiniz.</p></div></div></div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:col-span-4">
          <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Çalışma türü</label><div className="grid grid-cols-2 gap-2">{(Object.keys(categoryLabels) as PromptCategory[]).map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${category === item ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"}`}>{categoryLabels[item]}</button>)}</div></div>

          {category === "costume" && <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Karakter</label><select value={selectedCharacter} onChange={(event) => setSelectedCharacter(Number(event.target.value))} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">{analysis.characters.map((character, index) => <option key={`${character.name}-${index}`} value={index}>{character.name} — {character.role}</option>)}</select></div>}

          {(category === "set" || category === "lighting") && <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Mekân</label><select value={selectedLocation} onChange={(event) => setSelectedLocation(Number(event.target.value))} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">{analysis.locations.map((location, index) => <option key={`${location.text}-${index}`} value={index}>{location.text}</option>)}</select></div>}

          <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Görsel üslup</label><select value={artStyle} onChange={(event) => setArtStyle(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">{artStyles.map((style) => <option key={style}>{style}</option>)}</select></div>

          <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Kadraj oranı</label><div className="flex flex-wrap gap-2">{(["16:9", "3:4", "1:1", "4:3", "9:16"] as AspectRatio[]).map((ratio) => <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`rounded-md px-2.5 py-1.5 text-xs font-bold ${aspectRatio === ratio ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{ratio}</button>)}</div></div>

          <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Ek tasarım notu</label><textarea value={customBrief} onChange={(event) => setCustomBrief(event.target.value)} rows={4} placeholder="Örn. Döner sahne kullan, kırmızı rengi yalnızca çatışma anlarında vurgula..." className="w-full resize-y rounded-lg border border-slate-300 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" /></div>
        </aside>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">İngilizce üretim promptu</span><h3 className="font-bold text-slate-900 dark:text-white">{promptTitle}</h3></div><div className="flex flex-wrap gap-2"><button onClick={copyPrompt} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500">{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}{copied ? "Kopyalandı" : "Promptu Kopyala"}</button><button onClick={downloadPrompt} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Download className="h-4 w-4" /> TXT İndir</button><button onClick={savePrompt} className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Save className="h-4 w-4" /> Kaydet</button></div></div>
          <textarea value={prompt} onChange={(event) => setManualPrompt(event.target.value)} rows={18} className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30"><div className="mb-1 flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200"><Palette className="h-4 w-4" /> Negatif prompt</div><p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">{negativePrompt}</p></div>
        </section>
      </div>

      {savedPrompts.length > 0 && <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-indigo-500" /> Kaydedilen Promptlar</h3><div className="grid gap-3 md:grid-cols-2">{savedPrompts.map((item) => <div key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"><div className="flex items-start justify-between gap-3"><button onClick={() => { setCategory(item.category); setManualPrompt(item.prompt); }} className="min-w-0 text-left"><span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</span><span className="mt-1 block text-[10px] text-slate-500">{item.createdAt}</span></button><button onClick={() => removePrompt(item.id)} title="Sil" className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></section>}
    </div>
  );
};
