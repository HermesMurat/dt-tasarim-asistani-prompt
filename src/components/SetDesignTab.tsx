import {
  Boxes,
  Building,
  Check,
  Flame,
  Lamp,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Palette,
  RotateCw,
  Sparkles,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { DecorStyleType, PlayAnalysis } from "../types";

interface SetDesignTabProps {
  analysis: PlayAnalysis | null;
  decorStyle: DecorStyleType;
  onSelectDecorStyle: (style: DecorStyleType) => void;
  onGoToVisuals?: () => void;
}

export const SetDesignTab: React.FC<SetDesignTabProps> = ({
  analysis,
  decorStyle,
  onSelectDecorStyle,
  onGoToVisuals,
}) => {
  if (!analysis) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <Boxes className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Sahne Tasarımı Henüz Aktif Değil
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Bu sekme bir tiyatro oyunu metni başarıyla incelendikten sonra otomatik olarak mekân ve dekor verileriyle etkinleşecektir.
        </p>
      </div>
    );
  }

  const stylesConfig: Record<
    DecorStyleType,
    {
      title: string;
      desc: string;
      material: string;
      lighting: string;
      logistics: string;
    }
  > = {
    minimalist: {
      title: "Minimalist Dekor",
      desc: "Yalın geometrik formlar, fazlalıklardan arındırılmış alan, yüksek kontrast.",
      material:
        "Monokrom podyumlar, mat yüzeyler, tek bir odak nesnesi veya heykelimsi form.",
      lighting:
        "Keskin hatlı spot ışıklar, zemin aydınlatması ve yüksek gölge kontrastı.",
      logistics:
        "Oyuncuların kolayca taşıyabileceği hafif modüler bloklar ve boş sahne açıklığı.",
    },
    brechtian: {
      title: "Brechtyen / Epik Dekor",
      desc: "İllüzyonu kıran, açık sahneleme ve yabancılaştırma (V-Effekt) estetiği.",
      material:
        "Açığa çıkarılmış çelik iskeleler, yarı saydam kumaş perdeler, ham ahşap ve projeksiyon yüzeyleri.",
      lighting:
        "Görünür ışık köprüleri, dik sepya tonlar, sahneyi gizlemeyen çıplak armatürler.",
      logistics:
        "Seyircinin gözü önünde oyuncular tarafından çevrilen paneller ve döner platform.",
    },
    symbolic: {
      title: "Sembolik / Soyut",
      desc: "Metnin temel çatışmasını metaforik heykelsi objeler ve soyut formlarla aktarma.",
      material:
        "Kırılmış ayna enstalasyonları, asılı devasa halkalar, gerilmiş endüstriyel halatlar.",
      lighting:
        "Duygusal renklendirilmiş koyu amber ve mor hüzmeleri, siluet ağırlıklı aydınlatma.",
      logistics:
        "Işık ve projeksiyon katmanlarıyla mekân algısının anında dönüştürülmesi.",
    },
    realist: {
      title: "Dönem / Realist",
      desc: "Oyunun geçtiği tarihsel dönemin mimari dokusu ve otantik atmosferi.",
      material:
        "Birebir ölçekli ahşap lambri, eskitilmiş tuğla duvarlar, otantik kapı kasaları ve dönem mobilyaları.",
      lighting:
        "Pencere boşluklarından süzülen doğal gün ışığı ve sıcak iç mekân lambaları.",
      logistics:
        "Arka sahne raylı pano sistemleri veya döner sahne ile tam mekân değişimi.",
    },
    postmodern: {
      title: "Postmodern / Eklektik",
      desc: "Tarihsel referanslar ile çağdaş popüler kültür ve dijital medyanın birleşimi.",
      material:
        "Neon tüpler, LED ekran panelleri, antik sütun parçaları ve endüstriyel konteynerler.",
      lighting:
        "Canlı RGB LED şeritler, stroboskopik vuruşlar ve video projeksiyon mapping.",
      logistics:
        "Çok katmanlı, zaman ve mekân kaymalarını eşzamanlı gösteren hibrit podyum düzeni.",
    },
    expressionist: {
      title: "Ekspresyonist",
      desc: "Karakterlerin iç dünyasını yansıtan çarpık açılar, dik merdivenler ve keskin hatlar.",
      material:
        "Eğik açılı kapı kasaları, çarpıtılmış perspektifli duvar panelleri, dik açılı dikitler.",
      lighting:
        "Kara film (film noir) tarzı sert yan ışıklar, aşırı dik açılı dramatik gölgeler.",
      logistics:
        "Karakterin psikolojik kırılma anına göre açısı değişen hidrolik eğik platformlar.",
    },
    industrial: {
      title: "Endüstriyel / Brütalist",
      desc: "Ham beton, paslı metal ve sanayi çağının soğuk yapısal estetiği.",
      material:
        "Ham brüt beton yüzeyler, paslandırılmış çelik konstrüksiyon, metal ızgara zeminler.",
      lighting:
        "Soğuk beyaz sanayi projektörleri, floresan tüpler ve buhar/sis efektleri.",
      logistics:
        "Vinç sistemleri, asansörlü yükseltilebilir platformlar ve metal sürgülü kapılar.",
    },
  };

  const activeConfig = stylesConfig[decorStyle];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
            {analysis.title}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Sahne Scenography & Dekor Konsept Çalışması</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mekânların mimari formu, malzeme dokuları, ışık paleti ve sahne değişim lojistiği
          </p>
        </div>

        {onGoToVisuals && (
          <button
            onClick={onGoToVisuals}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sahne Promptu Hazırla</span>
          </button>
        )}
      </div>

      {/* 7 Decor Styles Selector */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Sahne Tasarımı Üslup Seçenekleri (7 Farklı Yaklaşım):</span>
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
            Seçili: {activeConfig.title}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {(Object.keys(stylesConfig) as DecorStyleType[]).map((key) => {
            const cfg = stylesConfig[key];
            const isSelected = decorStyle === key;

            return (
              <button
                key={key}
                onClick={() => onSelectDecorStyle(key)}
                className={`p-2.5 rounded-lg border text-center transition-all text-xs flex flex-col items-center justify-center space-y-1.5 ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span className="text-[11px]">{cfg.title.split("/")[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Style Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block flex items-center space-x-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>Mimari Yapı & Malzeme</span>
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeConfig.material}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <span className="font-semibold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider block flex items-center space-x-1.5">
            <Lamp className="w-3.5 h-3.5" />
            <span>Işık ve Atmosfer Paleti</span>
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeConfig.lighting}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block flex items-center space-x-1.5">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Mekân Değişim Lojistiği</span>
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeConfig.logistics}
          </p>
        </div>
      </div>

      {/* Real Locations Breakdown */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Oyun Mekânları ve Tasarım Çözümleri ({(analysis.locations || []).length} Mekân)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(analysis.locations || []).map((loc, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                  {loc.text}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 font-semibold text-[10px]">
                    Mekân {idx + 1}
                  </span>
                  {onGoToVisuals && (
                    <button
                      onClick={onGoToVisuals}
                      className="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] flex items-center space-x-1 transition-colors"
                      title="Bu mekân için görsel promptu hazırla"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>Prompt Hazırla</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeConfig.title} üslubuna uyarlanmış sahne açısı: {loc.text} mekânı için{" "}
                {activeConfig.material.toLowerCase()} ve yönlendirilmiş ışık huzmeleri ile kurulmalıdır.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Set Requirements Direct from Script */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Metinden Doğrudan Çıkarılan Sahne Gereksinimleri</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
          {(analysis.setRequirements || []).map((req, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-start space-x-2"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{req.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
