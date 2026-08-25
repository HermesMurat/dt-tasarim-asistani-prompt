import {
  Clock,
  Palette,
  RefreshCw,
  Scissors,
  Shirt,
  Sparkles,
  User,
  UserCheck,
  Wand2,
} from "lucide-react";
import React, { useState } from "react";
import { CostumeStyleType, PlayAnalysis } from "../types";
import { CategoryBadge } from "./Badge";

interface CostumeDesignTabProps {
  analysis: PlayAnalysis | null;
  costumeStyle: CostumeStyleType;
  onSelectCostumeStyle: (style: CostumeStyleType) => void;
  onGoToVisuals?: (characterName?: string) => void;
}

export const CostumeDesignTab: React.FC<CostumeDesignTabProps> = ({
  analysis,
  costumeStyle,
  onSelectCostumeStyle,
  onGoToVisuals,
}) => {
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <Shirt className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Kostüm Tasarımı Henüz Aktif Değil
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Bu sekme bir tiyatro oyunu metni başarıyla incelendikten sonra otomatik olarak karakter ve kostüm verileriyle etkinleşecektir.
        </p>
      </div>
    );
  }

  const characters = analysis.characters || [];
  const activeChar = characters[selectedCharIndex] || characters[0];

  const costumeStyleDescriptions: Record<
    CostumeStyleType,
    { title: string; desc: string; fabricTone: string }
  > = {
    dönemsel: {
      title: "Otantik Dönemsel",
      desc: "Oyunun geçtiği tarihsel dönemin kesim kuralları, dikiş teknikleri ve orijinal aksesuarları.",
      fabricTone: "Geleneksel dokuma kumaşlar, döneme özgü renk tonları ve otantik düğme/fisto detayları.",
    },
    modern: {
      title: "Çağdaş / Modern Uyarlama",
      desc: "Karakterin sınıfsal konumunu ve psikolojisini günümüz giyim kodlarıyla yeniden yorumlama.",
      fabricTone: "Sentetik ve pamuklu modern hazır giyim karışımları, güncel renk kontrastları ve çağdaş aksesuarlar.",
    },
    stilize: {
      title: "Stilize / Sembolik Doku",
      desc: "Realist detaylar yerine karakterin arketipsel veya sembolik özünü öne çıkaran renk ve silüet tasarımı.",
      fabricTone: "Heykelsi dökümlü kumaşlar, monokrom renk blokları ve doku kontrastları.",
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
            {analysis.title}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Shirt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Karakter Kostüm ve Stil Rehberi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Karakter bazlı giysi silüetleri, kumaş dokuları, renk paletleri ve sahne içi dönüşümler
          </p>
        </div>

        {onGoToVisuals && (
          <button
            onClick={() => onGoToVisuals(activeChar?.name)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kostüm Promptu Hazırla</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Character Selector and Costume Style Selector */}
        <div className="md:col-span-4 space-y-4">
          {/* Character Selector */}
          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              İncelenecek Karakter:
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {characters.map((char, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCharIndex(idx)}
                  className={`w-full p-2.5 rounded-lg text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedCharIndex === idx
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  <div className="truncate">
                    <span className="block font-bold">{char.name}</span>
                    <span className="text-[10px] opacity-75 block truncate">{char.role}</span>
                  </div>
                  {selectedCharIndex === idx && <UserCheck className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Costume Style */}
          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Kostüm Tasarımı Üslubu:
            </label>
            <div className="space-y-2">
              <button
                onClick={() => onSelectCostumeStyle("dönemsel")}
                className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                  costumeStyle === "dönemsel"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold"
                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Otantik Dönemsel</span>
                </div>
              </button>

              <button
                onClick={() => onSelectCostumeStyle("modern")}
                className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                  costumeStyle === "modern"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold"
                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shirt className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Çağdaş / Modern Uyarlama</span>
                </div>
              </button>

              <button
                onClick={() => onSelectCostumeStyle("stilize")}
                className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                  costumeStyle === "stilize"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold"
                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Stilize / Sembolik Doku</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Character Costume Detail Sheet */}
        {activeChar ? (
          <div className="md:col-span-8 bg-slate-50 dark:bg-slate-950/70 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeChar.name}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeChar.role}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                  {costumeStyleDescriptions[costumeStyle].title}
                </span>
                {onGoToVisuals && (
                  <button
                    onClick={() => onGoToVisuals(activeChar.name)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1 shadow-xs transition-colors"
                    title="Bu karakter için görsel promptu hazırla"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Prompt Hazırla</span>
                  </button>
                )}
              </div>
            </div>

            {/* Garment & Fabric */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                  <Shirt className="w-3.5 h-3.5 text-indigo-500 mr-1.5" /> Giysi ve Parça Detayları:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  {activeChar.costumeGarment}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                  <Scissors className="w-3.5 h-3.5 text-amber-500 mr-1.5" /> Kumaş Dokusu & Eskitme:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  {activeChar.costumeFabric}
                </p>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Karakter Renk Paleti:
              </span>
              <div className="flex items-center space-x-2">
                {(activeChar.colors || ["#1e293b", "#4f46e5", "#f8fafc"]).map((hex, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <div
                      className="w-7 h-7 rounded-lg border border-white/20 shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    ></div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Change note */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
                Perde / Sahne İçi Kostüm Değişimleri:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeChar.changeNote}
              </p>
            </div>

            {/* Transformation & Character Function */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Karakter Arkı & Dönüşüm:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {activeChar.transformation}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Dramatik İşlev:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {activeChar.functionInPlot}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
