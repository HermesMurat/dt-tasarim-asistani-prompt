import {
  Archive,
  BookOpen,
  Boxes,
  HelpCircle,
  Image as ImageIcon,
  Moon,
  Shirt,
  Sparkles,
  Sun
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isAnalysisReady: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isAnalysisReady,
  darkMode,
  onToggleDarkMode,
}) => {
  const [serverHealth, setServerHealth] = useState<{
    ok: boolean;
    hasKey: boolean;
    checked: boolean;
  }>({ ok: false, hasKey: false, checked: false });

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setServerHealth({
          ok: data.status === "ok",
          hasKey: Boolean(data.hasApiKey),
          checked: true,
        });
      })
      .catch(() => {
        setServerHealth({ ok: false, hasKey: false, checked: true });
      });
  }, []);

  const navItems = [
    { id: "tab-inceleme", label: "Oyun İncelemesi", icon: BookOpen, alwaysActive: true },
    { id: "tab-sahne", label: "Sahne Tasarımı", icon: Boxes, alwaysActive: false },
    { id: "tab-kostum", label: "Kostüm Tasarımı", icon: Shirt, alwaysActive: false },
    { id: "tab-gorsel", label: "Prompt Atölyesi", icon: ImageIcon, alwaysActive: false },
    { id: "tab-asistan", label: "Asistana Sor", icon: HelpCircle, alwaysActive: false },
    { id: "tab-kaydedilenler", label: "Arşiv", icon: Archive, alwaysActive: true },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs">
              <span className="text-white font-bold text-xs tracking-wider">DT</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-800 dark:text-white">
                  Tasarım Asistanı
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  v2.0 Independent
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal hidden md:block">
                Devlet Tiyatroları Standartlarında Dramaturji & Tasarım Raporu
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {serverHealth.checked && (
              <div
                className={`flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                  serverHealth.ok && serverHealth.hasKey
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    : serverHealth.ok
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                }`}
                title={
                  serverHealth.ok && serverHealth.hasKey
                    ? "Sunucu ve Gemini API bağlantısı hazır"
                    : serverHealth.ok
                    ? "Sunucu çalışıyor ancak GEMINI_API_KEY eksik"
                    : "Sunucu bağlantısı kurulamadı"
                }
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    serverHealth.ok && serverHealth.hasKey
                      ? "bg-emerald-500"
                      : serverHealth.ok
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-[11px] font-medium hidden sm:inline">
                  {serverHealth.ok && serverHealth.hasKey
                    ? "Sistem Hazır"
                    : serverHealth.ok
                    ? "API Anahtarı Gerekli"
                    : "Bağlantı Hatası"}
                </span>
              </div>
            )}

            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
              title={darkMode ? "Açık Moda Geç" : "Koyu Moda Geç"}
              aria-label="Karanlık/Aydınlık mod değiştir"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <nav className="bg-slate-50/80 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-1.5 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentTab === item.id;
            const isEnabled = item.alwaysActive || isAnalysisReady;

            return (
              <button
                key={item.id}
                onClick={() => isEnabled && onSelectTab(item.id)}
                disabled={!isEnabled}
                title={
                  !isEnabled
                    ? "Bu sekme bir oyun metni analiz edildikten sonra etkinleşecektir"
                    : item.label
                }
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-all text-xs font-medium ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs border border-slate-200 dark:border-slate-800"
                    : isEnabled
                    ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-900/60"
                    : "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {!isEnabled && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-normal">
                    Kilitli
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
