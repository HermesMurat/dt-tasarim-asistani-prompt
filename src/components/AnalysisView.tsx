import {
  AlertCircle,
  BookOpen,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  HelpCircle,
  Lamp,
  Layers,
  Lightbulb,
  MapPin,
  Palette,
  Package,
  Scroll,
  Shirt,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { CategorizedField, PlayAnalysis } from "../types";
import { CategoryBadge } from "./Badge";

interface AnalysisViewProps {
  analysis: PlayAnalysis | null;
  onSaveToArchive?: () => void;
  onGoToSetDesign?: () => void;
  onGoToCostumeDesign?: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis,
  onSaveToArchive,
  onGoToSetDesign,
  onGoToCostumeDesign,
}) => {
  const [expandedSection, setExpandedSection] = useState<string>("all");
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number>(0);
  const [showFullPlot, setShowFullPlot] = useState<boolean>(false);

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs text-center py-16">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
          <Scroll className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Henüz Bir Oyun İncelenmedi
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
          Sol panelden bir tiyatro oyunu dosyası (PDF, DOCX, TXT, MD) yükleyerek veya metin yapıştırarak gerçek dramaturjik ve tasarımsal incelemeyi başlatınız.
        </p>
      </div>
    );
  }

  const characters = analysis.characters || [];
  const selectedChar = characters[selectedCharacterIndex] || characters[0];

  return (
    <div className="space-y-6">
      {/* Header Card: Title, Author, Period, Locations */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Dramaturjik ve Tasarımsal Rapor
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {analysis.title}
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
              Yazar: <span className="text-slate-900 dark:text-slate-200 font-semibold">{analysis.author}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={analysis.genreAndPeriod?.category || "Metinden Doğrulanan"} />
            {onSaveToArchive && (
              <button
                onClick={onSaveToArchive}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Raporu Arşive Kaydet</span>
              </button>
            )}
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 mr-1.5" /> Tür & Dönem:
              </span>
              <CategoryBadge category={analysis.genreAndPeriod?.category} />
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">
              {analysis.genreAndPeriod?.text}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <Clock className="w-3.5 h-3.5 text-amber-500 mr-1.5" /> Oyunun Zamanı:
              </span>
              <CategoryBadge category={analysis.timePeriod?.category} />
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">
              {analysis.timePeriod?.text}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <MapPin className="w-3.5 h-3.5 text-red-500 mr-1.5" /> Mekânlar:
              </span>
              <span className="text-[10px] text-slate-400">
                {(analysis.locations || []).length} Mekân
              </span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-xs font-medium truncate">
              {(analysis.locations || []).map((l) => l.text).join(", ")}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Bilgi Sınıfları:</span>
          <CategoryBadge category="Metinden Doğrulanan" />
          <CategoryBadge category="Tasarım Yorumu" />
          <CategoryBadge category="Belirsiz" />
          <CategoryBadge category="Dış Araştırma" />
        </div>
      </div>

      {/* Summary & Core Conflict & Detailed Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Short Summary & Conflict */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Scroll className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kısa Özet</span>
              </h3>
              <CategoryBadge category={analysis.shortSummary?.category} />
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {analysis.shortSummary?.text}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-red-500" />
                <span>Temel Çatışma</span>
              </h3>
              <CategoryBadge category={analysis.coreConflict?.category} />
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {analysis.coreConflict?.text}
            </p>
          </div>
        </div>

        {/* Themes & Detailed Plot */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ana ve Alt Temalar</span>
              </h3>
            </div>
            <div className="space-y-2">
              {(analysis.mainAndSubThemes || []).map((th, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-2"
                >
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {th.text}
                  </p>
                  <CategoryBadge category={th.category} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Ayrıntılı Olay Örgüsü</span>
              </h3>
              <button
                onClick={() => setShowFullPlot(!showFullPlot)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center space-x-1"
              >
                <span>{showFullPlot ? "Kısalt" : "Tamamını Göster"}</span>
                {showFullPlot ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div
              className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 whitespace-pre-line ${
                !showFullPlot ? "line-clamp-4" : ""
              }`}
            >
              {analysis.detailedPlot?.text}
            </div>
          </div>
        </div>
      </div>

      {/* Acts & Scenes Structure Table */}
      {analysis.actsAndScenes && analysis.actsAndScenes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Perde ve Sahne Yapısı ({analysis.actsAndScenes.length} Bölüm)</span>
            </h3>
            <span className="text-xs text-slate-400">Dramatik Bölümleme</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.actsAndScenes.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>{item.act} {item.scene ? `• ${item.scene}` : ""}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3 h-3 inline mr-1 text-red-500" />
                    {item.location}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.summary}
                </p>
                {item.charactersInvolved && item.charactersInvolved.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1">
                    <Users className="w-3 h-3 mr-1" />
                    {item.charactersInvolved.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Characters Analysis & Relationships & Transformations */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Karakterler, İlişkiler ve Dönüşümler ({characters.length} Karakter)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Metinden çıkarılan roller, dramatik işlevler ve tasarım notları
            </p>
          </div>

          {onGoToCostumeDesign && (
            <button
              onClick={onGoToCostumeDesign}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-xs self-start sm:self-auto"
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Kostüm Tasarım Sekmesine Git</span>
            </button>
          )}
        </div>

        {/* Character Tabs Selector */}
        <div className="flex flex-wrap gap-2">
          {characters.map((c, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCharacterIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                selectedCharacterIndex === idx
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{c.name}</span>
              <span className="text-[10px] opacity-75">({c.role})</span>
            </button>
          ))}
        </div>

        {/* Selected Character Deep Profile */}
        {selectedChar && (
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedChar.name}
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {selectedChar.role}
                </p>
              </div>
              <CategoryBadge category={selectedChar.category} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Kişilik ve Karakter Özellikleri:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  {selectedChar.traits}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Olay Örgüsündeki Dramatik İşlevi:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  {selectedChar.functionInPlot}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Karakter Dönüşümü (Ark):
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  {selectedChar.transformation}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Perde / Sahne İçi Değişim & Dönüşüm:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  {selectedChar.changeNote}
                </p>
              </div>
            </div>

            {/* Costume & Swatches */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Giysi / Kostüm Parçaları:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedChar.costumeGarment}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kumaş Dokusu & Malzeme:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedChar.costumeFabric}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Karakter Renk Paleti:
                </span>
                <div className="flex items-center space-x-2">
                  {(selectedChar.colors || ["#1e293b", "#4f46e5"]).map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="w-7 h-7 rounded-lg border border-white/20 shadow-xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Character Relationships */}
            {selectedChar.relationships && selectedChar.relationships.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 block">
                  Diğer Karakterlerle İlişkiler:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedChar.relationships.map((rel, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">{rel.target}</strong>:{" "}
                        <span className="text-slate-600 dark:text-slate-400">{rel.relation}</span>
                      </div>
                      <CategoryBadge category={rel.category} size="xs" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Technical Design Dossier: Sets, Props, Costumes, Lighting, Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Set Requirements */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Boxes className="w-3.5 h-3.5 text-indigo-500" />
              <span>Dekor ve Sahneleme Gereksinimleri</span>
            </h3>
            {onGoToSetDesign && (
              <button
                onClick={onGoToSetDesign}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Sahne Tasarımı →
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(analysis.setRequirements || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.text}
                </span>
                <CategoryBadge category={item.category} />
              </div>
            ))}
          </div>
        </div>

        {/* Props (Aksesuarlar) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Package className="w-3.5 h-3.5 text-amber-500" />
              <span>Aksesuarlar (El & Sahne Aksesuarları)</span>
            </h3>
          </div>
          <div className="space-y-2">
            {(analysis.props || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.text}
                </span>
                <CategoryBadge category={item.category} />
              </div>
            ))}
          </div>
        </div>

        {/* Lighting and Atmosphere */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Lamp className="w-3.5 h-3.5 text-yellow-500" />
              <span>Işık ve Atmosfer İpuçları</span>
            </h3>
          </div>
          <div className="space-y-2">
            {(analysis.lightingAndAtmosphere || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.text}
                </span>
                <CategoryBadge category={item.category} />
              </div>
            ))}
          </div>
        </div>

        {/* Key Onstage Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sahne Üzerindeki Önemli Eylemler</span>
            </h3>
          </div>
          <div className="space-y-2">
            {(analysis.keyOnstageActions || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.text}
                </span>
                <CategoryBadge category={item.category} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Designer Open Areas & Ambiguities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Open Interpretation Areas */}
        <div className="bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-indigo-900 dark:text-indigo-200 flex items-center space-x-2">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Tasarımcının Yorumuna Açık Noktalar</span>
            </h3>
            <CategoryBadge category="Tasarım Yorumu" />
          </div>
          <div className="space-y-2">
            {(analysis.openInterpretationAreas || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100/80 dark:border-indigo-900/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Ambiguities */}
        <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-5 border border-amber-100 dark:border-amber-900/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-amber-900 dark:text-amber-200 flex items-center space-x-2">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Belirsiz veya Çelişkili Bilgiler</span>
            </h3>
            <CategoryBadge category="Belirsiz" />
          </div>
          <div className="space-y-2">
            {(analysis.ambiguities || []).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-100/80 dark:border-amber-900/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
