import {
  Archive,
  Calendar,
  Download,
  Eye,
  FileCode,
  FileSpreadsheet,
  Plus,
  Trash2,
} from "lucide-react";
import React from "react";
import { PlayAnalysis, SavedArchive } from "../types";

interface ArchivesTabProps {
  archives: SavedArchive[];
  onLoadArchive: (archive: SavedArchive) => void;
  onDeleteArchive: (id: number) => void;
  onExportJSON: () => void;
  currentAnalysis: PlayAnalysis | null;
  onSaveCurrentAnalysis: () => void;
}

export const ArchivesTab: React.FC<ArchivesTabProps> = ({
  archives,
  onLoadArchive,
  onDeleteArchive,
  onExportJSON,
  currentAnalysis,
  onSaveCurrentAnalysis,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Archive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Kaydedilen Tasarım Çalışmaları ve Rapor Arşivi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            İncelenen oyun metinleri, dramaturjik raporlar ve konsept kayıtları
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportJSON}
            disabled={archives.length === 0}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              archives.length === 0
                ? "border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Dışa Aktar</span>
          </button>

          {currentAnalysis && (
            <button
              onClick={onSaveCurrentAnalysis}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Mevcut Raporu Kaydet</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Saved Archives */}
      {archives.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <Archive className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Henüz Kaydedilmiş Çalışma Yok
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bir oyun metni inceledikten sonra "Raporu Arşive Kaydet" butonuna tıklayarak buraya ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archives.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.author}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 font-semibold text-[10px] uppercase">
                    {item.decorStyle}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {item.summary || item.analysis?.shortSummary?.text}
                </p>

                <div className="flex items-center text-[10px] text-slate-400 pt-1">
                  <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                  <span>{item.date}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-slate-800 mt-2">
                <button
                  onClick={() => onDeleteArchive(item.id)}
                  className="text-red-500 hover:text-red-600 font-medium text-[11px] flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Sil</span>
                </button>

                <button
                  onClick={() => onLoadArchive(item)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px] flex items-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Raporu Aç</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
