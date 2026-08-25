import React, { useEffect, useState } from "react";
import { AnalysisView } from "./components/AnalysisView";
import { ArchivesTab } from "./components/ArchivesTab";
import { AssistantChatTab } from "./components/AssistantChatTab";
import { CostumeDesignTab } from "./components/CostumeDesignTab";
import { Header } from "./components/Header";
import { SetDesignTab } from "./components/SetDesignTab";
import { ToastContainer, ToastData } from "./components/Toast";
import { UploadSection } from "./components/UploadSection";
import { VisualsTab } from "./components/VisualsTab";
import {
  CostumeStyleType,
  DecorStyleType,
  FileMetadata,
  PlayAnalysis,
  ProcessStatus,
  SavedArchive,
} from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("tab-inceleme");
  const [analysis, setAnalysis] = useState<PlayAnalysis | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorInfo, setErrorInfo] = useState<{ code: string; message: string } | null>(null);

  const [decorStyle, setDecorStyle] = useState<DecorStyleType>("brechtian");
  const [costumeStyle, setCostumeStyle] = useState<CostumeStyleType>("dönemsel");
  const [visualTargetCategory, setVisualTargetCategory] = useState<"set" | "costume" | "lighting" | "poster" | "custom">("set");
  const [visualTargetCharacter, setVisualTargetCharacter] = useState<string | undefined>(undefined);

  const [archives, setArchives] = useState<SavedArchive[]>([]);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Always start in light mode. Dark mode remains optional for the current session.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("dt_theme");
    setDarkMode(false);

    try {
      const stored = localStorage.getItem("dt_design_archives");
      if (stored) {
        setArchives(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load local archives:", e);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCloseToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Called when real server analysis finishes successfully
  const handleAnalysisSuccess = (
    resultAnalysis: PlayAnalysis,
    resultMeta: FileMetadata,
    resultRawText: string
  ) => {
    setAnalysis(resultAnalysis);
    setFileMeta(resultMeta);
    setRawText(resultRawText);
    showToast(
      "success",
      "Analiz Başarıyla Tamamlandı",
      `"${resultAnalysis.title}" için dramaturjik rapor ve tasarım gereksinimleri çıkarıldı.`
    );
  };

  // Save current analysis into local archives
  const handleSaveToArchive = (customTitle?: string) => {
    if (!analysis) return;

    const newArchive: SavedArchive = {
      id: Date.now(),
      title: customTitle || analysis.title,
      author: analysis.author,
      decorStyle,
      costumeStyle,
      date: new Date().toLocaleDateString("tr-TR"),
      summary: analysis.shortSummary?.text || "",
      analysis,
      meta: fileMeta || undefined,
    };

    const updated = [newArchive, ...archives];
    setArchives(updated);
    try {
      localStorage.setItem("dt_design_archives", JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage error:", e);
    }

    showToast("success", "Arşive Kaydedildi", `"${analysis.title}" çalışması yerel arşive kaydedildi.`);
  };

  const handleDeleteArchive = (id: number) => {
    const updated = archives.filter((a) => a.id !== id);
    setArchives(updated);
    try {
      localStorage.setItem("dt_design_archives", JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage error:", e);
    }
    showToast("info", "Silindi", "Kayıt arşivden kaldırıldı.");
  };

  const handleLoadArchive = (archive: SavedArchive) => {
    setAnalysis(archive.analysis);
    if (archive.meta) setFileMeta(archive.meta);
    if (archive.decorStyle) setDecorStyle(archive.decorStyle);
    if (archive.costumeStyle) setCostumeStyle(archive.costumeStyle);
    setCurrentTab("tab-inceleme");
    showToast("info", "Arşiv Yüklendi", `"${archive.title}" raporu görüntülendi.`);
  };

  const handleExportJSON = () => {
    if (archives.length === 0) return;
    const blob = new Blob([JSON.stringify(archives, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dt-tasarim-arsivleri-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Dışa Aktarıldı", "Arşiv JSON dosyası olarak indirildi.");
  };

  return (
    <div className="bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Header with real health info and tab bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isAnalysisReady={Boolean(analysis)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Tab 1: New Play Script Upload & Full Dramaturgical Analysis */}
        {currentTab === "tab-inceleme" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Upload and Real extraction */}
              <div className="lg:col-span-5">
                <UploadSection
                  onAnalysisSuccess={handleAnalysisSuccess}
                  status={status}
                  setStatus={setStatus}
                  statusMessage={statusMessage}
                  setStatusMessage={setStatusMessage}
                  errorInfo={errorInfo}
                  setErrorInfo={setErrorInfo}
                />
              </div>

              {/* Right: Detailed Dramaturgical Analysis Output */}
              <div className="lg:col-span-7">
                <AnalysisView
                  analysis={analysis}
                  onSaveToArchive={() => handleSaveToArchive()}
                  onGoToSetDesign={() => setCurrentTab("tab-sahne")}
                  onGoToCostumeDesign={() => setCurrentTab("tab-kostum")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Set & Scenography Design */}
        {currentTab === "tab-sahne" && (
          <SetDesignTab
            analysis={analysis}
            decorStyle={decorStyle}
            onSelectDecorStyle={setDecorStyle}
            onGoToVisuals={() => {
              setVisualTargetCategory("set");
              setVisualTargetCharacter(undefined);
              setCurrentTab("tab-gorsel");
            }}
          />
        )}

        {/* Tab 3: Costume Design */}
        {currentTab === "tab-kostum" && (
          <CostumeDesignTab
            analysis={analysis}
            costumeStyle={costumeStyle}
            onSelectCostumeStyle={setCostumeStyle}
            onGoToVisuals={(characterName) => {
              setVisualTargetCategory("costume");
              setVisualTargetCharacter(characterName);
              setCurrentTab("tab-gorsel");
            }}
          />
        )}

        {/* Tab 4: AI Concept Visual Studio */}
        {currentTab === "tab-gorsel" && (
          <VisualsTab
            analysis={analysis}
            decorStyle={decorStyle}
            costumeStyle={costumeStyle}
            initialCategory={visualTargetCategory}
            initialCharacter={visualTargetCharacter}
          />
        )}

        {/* Tab 5: Assistant Chat */}
        {currentTab === "tab-asistan" && (
          <AssistantChatTab
            analysis={analysis}
            decorStyle={decorStyle}
            costumeStyle={costumeStyle}
          />
        )}

        {/* Tab 6: Saved Archives */}
        {currentTab === "tab-kaydedilenler" && (
          <ArchivesTab
            archives={archives}
            onLoadArchive={handleLoadArchive}
            onDeleteArchive={handleDeleteArchive}
            onExportJSON={handleExportJSON}
            currentAnalysis={analysis}
            onSaveCurrentAnalysis={() => handleSaveToArchive()}
          />
        )}
      </main>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
    </div>
  );
}
