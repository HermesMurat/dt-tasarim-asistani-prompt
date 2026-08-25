import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { FileMetadata, PlayAnalysis, ProcessStatus } from "../types";
import { extractTextClientSide } from "../utils/clientExtractor";

interface UploadSectionProps {
  onAnalysisSuccess: (analysis: PlayAnalysis, meta: FileMetadata, rawText: string) => void;
  status: ProcessStatus;
  setStatus: (status: ProcessStatus) => void;
  statusMessage: string;
  setStatusMessage: (msg: string) => void;
  errorInfo: { code: string; message: string } | null;
  setErrorInfo: (err: { code: string; message: string } | null) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalysisSuccess,
  status,
  setStatus,
  statusMessage,
  setStatusMessage,
  errorInfo,
  setErrorInfo,
}) => {
  const [uploadMode, setUploadMode] = useState<"file" | "paste">("file");
  const [pastedText, setPastedText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedMeta, setExtractedMeta] = useState<FileMetadata | null>(null);
  const [extractedRawText, setExtractedRawText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate and extract text when file is selected
  const handleFileChange = async (file: File) => {
    setErrorInfo(null);
    setSelectedFile(file);
    setExtractedMeta(null);
    setExtractedRawText("");

    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    // Check for legacy formats
    if (ext === "doc" || ext === "rtf") {
      setErrorInfo({
        code: "UNSUPPORTED_FORMAT",
        message:
          "Eski .doc ve .rtf dosyaları doğrudan desteklenmemektedir. Lütfen dosyanızı Microsoft Word veya LibreOffice ile açıp PDF (.pdf) veya DOCX (.docx) formatına dönüştürerek yükleyiniz.",
      });
      return;
    }

    if (!["pdf", "docx", "txt", "md"].includes(ext)) {
      setErrorInfo({
        code: "UNSUPPORTED_FORMAT",
        message:
          `Desteklenmeyen dosya türü (.${ext}). Lütfen PDF, DOCX, TXT veya MD formatında bir oyun metni yükleyiniz.`,
      });
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setErrorInfo({
        code: "FILE_TOO_LARGE",
        message: "Dosya boyutu 30 MB sınırını aşıyor. Lütfen daha küçük bir dosya seçiniz.",
      });
      return;
    }

    setIsExtracting(true);
    setStatus("extracting");
    setStatusMessage("Dosya içeriği ve sayfa yapısı inceleniyor...");

    // 1. Try instant client-side extraction first (for TXT, MD, and DOCX)
    try {
      const clientResult = await extractTextClientSide(file);
      if (clientResult && clientResult.text.length >= 10) {
        setExtractedMeta(clientResult.meta);
        setExtractedRawText(clientResult.text);
        setStatus("idle");
        setStatusMessage("Metin başarıyla okundu. Analize hazır.");
        setIsExtracting(false);
        return;
      }
    } catch (clientErr: any) {
      console.warn("Client extraction error, trying server fallback:", clientErr);
    }

    // 2. Server-side extraction (for PDF or if client extraction needed fallback)
    try {
      let data: any = null;
      let lastError: any = null;

      // Retry up to 2 times in case dev server was briefly initializing
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/extract-text", {
            method: "POST",
            body: formData,
          });

          const contentType = response.headers.get("content-type") || "";
          const responseText = await response.text();

          if (contentType.includes("application/json")) {
            try {
              data = JSON.parse(responseText);
              if (response.ok && data?.success) {
                break;
              }
            } catch (pErr) {
              console.warn("JSON parse attempt error:", pErr);
            }
          }

          if (!data?.success && attempt < 2) {
            await new Promise((r) => setTimeout(r, 600));
            continue;
          }

          if (!response.ok || !data || !data.success) {
            const code =
              data?.errorType?.toUpperCase() ||
              (response.status === 413 ? "FILE_TOO_LARGE" : "FILE_EXTRACT_ERROR");
            let message = data?.message;

            if (!message) {
              if (response.status === 413) {
                message = "Yüklenen dosya boyutu izin verilen sınırı aşıyor.";
              } else if (response.status === 422) {
                message =
                  "PDF dosyasında okunabilir dijital metin katmanı bulunamadı. Lütfen OCR uygulanmış veya dijital PDF/DOCX yükleyiniz.";
              } else if (response.status === 503) {
                message = "Sunucu geçici olarak meşgul (503). Lütfen tekrar deneyiniz.";
              } else if (response.status === 429) {
                message = "İstek kotası aşıldı (429). Lütfen biraz bekleyip tekrar deneyiniz.";
              } else {
                message = "Dosyadan metin çıkarılamadı. Lütfen 'Metin Yapıştır' sekmesinden doğrudan yapıştırarak deneyiniz.";
              }
            }

            lastError = { code, message };
          }
        } catch (fetchErr: any) {
          const rawMsg = fetchErr?.message || "";
          const isFetchFailed = rawMsg.toLowerCase().includes("failed to fetch") || rawMsg.toLowerCase().includes("network");
          lastError = {
            code: "NETWORK_ERROR",
            message: isFetchFailed
              ? "Sunucu bağlantısı kurulamadı. Lütfen 'Metin Yapıştır' sekmesinden metni doğrudan yapıştırarak deneyiniz veya bağlantınızı kontrol ediniz."
              : rawMsg || "Sunucuya bağlanılamadı.",
          };
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      }

      if (!data || !data.success) {
        throw lastError || {
          code: "EXTRACT_FAILED",
          message: "Dosyadan metin katmanı okunamadı.",
        };
      }

      setExtractedMeta(data.meta);
      setExtractedRawText(data.text);
      setStatus("idle");
      setStatusMessage("Metin başarıyla okundu. Analize hazır.");
    } catch (err: any) {
      console.error("Text extraction failed:", err);
      setStatus("error");
      const rawMsg = err.message || "";
      const isFetchFailed = rawMsg.toLowerCase().includes("failed to fetch") || rawMsg.toLowerCase().includes("network");
      setErrorInfo({
        code: err.code || "EXTRACT_FAILED",
        message: isFetchFailed
          ? "Sunucu bağlantısı sağlanamadı. Lütfen 'Metin Yapıştır' sekmesinden metni doğrudan yapıştırarak analiz edebilirsiniz."
          : err.message || "Dosyadan metin okunamadı.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Run Real Analysis on Server
  const handleStartAnalysis = async () => {
    setErrorInfo(null);

    let textToSend = "";
    let metaToSend: FileMetadata | null = extractedMeta;

    if (uploadMode === "paste") {
      const cleanPasted = pastedText.trim();
      if (cleanPasted.length < 50) {
        setErrorInfo({
          code: "TEXT_TOO_SHORT",
          message: "Lütfen en az 50 karakter uzunluğunda bir oyun metni yapıştırınız.",
        });
        return;
      }
      textToSend = cleanPasted;
      const charCount = cleanPasted.length;
      const wordCount = cleanPasted.split(/\s+/).filter(Boolean).length;
      const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));
      metaToSend = {
        fileName: "Yapıştırılan Oyun Metni",
        fileType: "TXT",
        fileSize: new Blob([cleanPasted]).size,
        charCount,
        wordCount,
        estimatedPages,
        preview1000: cleanPasted.slice(0, 1000),
      };
      setExtractedMeta(metaToSend);
      setExtractedRawText(cleanPasted);
    } else {
      if (!extractedRawText || !extractedMeta) {
        setErrorInfo({
          code: "NO_FILE",
          message: "Lütfen önce geçerli bir oyun metni dosyası yükleyiniz.",
        });
        return;
      }
      textToSend = extractedRawText;
    }

    try {
      // Step 1: Validating
      setStatus("validating");
      setStatusMessage("Dosya içeriği doğrulanıyor...");
      await new Promise((r) => setTimeout(r, 300));

      // Step 2: Segmenting / Chunking
      setStatus("chunking");
      setStatusMessage("Perde, sahne ve dramatik bölümler belirleniyor...");
      await new Promise((r) => setTimeout(r, 400));

      // Step 3: Analyzing with Gemini
      setStatus("analyzing");
      setStatusMessage("Gemini yapay zekâ modeli metni ve dramaturjik yapıyı inceliyor...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToSend,
          fileName: metaToSend?.fileName,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();
      let data: any = null;

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          console.error(`Analiz JSON ayrıştırma hatası (HTTP ${response.status}):`, responseText.slice(0, 200));
        }
      } else {
        console.error(
          `Analiz yanıtı JSON değil: "${contentType}" (HTTP ${response.status}). Yanıt başı:`,
          responseText.slice(0, 200)
        );
      }

      if (!response.ok || !data || !data.success) {
        let code = data?.errorType?.toUpperCase() || "ANALYSIS_FAILED";
        let message = data?.message;

        if (!message) {
          if (response.status === 503) {
            code = "MODEL_UNAVAILABLE";
            message =
              "Gemini modeli şu anda geçici olarak aşırı yüklü (503). Lütfen tekrar deneyiniz.";
          } else if (response.status === 429) {
            code = "QUOTA_EXCEEDED";
            message =
              "Ücretsiz Gemini kotası şu anda dolu. Uygulama yeniden istek göndermedi. Bir süre sonra tekrar deneyin.";
          } else if (response.status === 413 || code === "FREE_TEXT_TOO_LONG") {
            code = "FREE_TEXT_TOO_LONG";
            message =
              "Ücretsiz modda tek analiz için en fazla 300.000 karakter kabul edilmektedir. Lütfen metninizi perde veya bölüm olarak ayırarak yükleyiniz.";
          } else if (response.status === 504 || response.status === 502) {
            code = "TIMEOUT";
            message = "Sunucu yanıtı zaman aşımına uğradı. Lütfen tekrar deneyiniz.";
          } else {
            code = "SERVER_RESPONSE_INVALID";
            message = `Sunucudan geçerli bir analiz yanıtı alınamadı (HTTP ${response.status}). Lütfen tekrar deneyiniz.`;
          }
        }

        throw { code, message };
      }

      // Step 4: Synthesizing results
      setStatus("synthesizing");
      setStatusMessage("Karakter, mekân, dekor ve kostüm verileri birleştiriliyor...");
      await new Promise((r) => setTimeout(r, 300));

      // Step 5: Completed
      setStatus("completed");
      setStatusMessage("Dramaturjik ve tasarımsal inceleme başarıyla tamamlandı.");
      onAnalysisSuccess(data.analysis, metaToSend!, textToSend);
    } catch (err: any) {
      console.error("Analysis process error:", err);
      setStatus("error");
      const rawMsg = err.message || "";
      const isFetchFailed = rawMsg.toLowerCase().includes("failed to fetch") || rawMsg.toLowerCase().includes("network");
      setErrorInfo({
        code: err.code || "ANALYSIS_ERROR",
        message: isFetchFailed
          ? "Sunucu bağlantısı sağlanamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz."
          : err.message || "Oyun metni analiz edilirken sunucu veya model tarafında bir hata oluştu.",
      });
    }
  };

  const stepsList = [
    { key: "validating", label: "Doğrulandı" },
    { key: "extracting", label: "Metin Çıkarıldı" },
    { key: "chunking", label: "Bölümlendi" },
    { key: "analyzing", label: "Analiz Ediliyor (Gemini)" },
    { key: "synthesizing", label: "Birleştiriliyor" },
    { key: "completed", label: "Tamamlandı" },
  ];

  const getCurrentStepIndex = () => {
    switch (status) {
      case "validating":
        return 0;
      case "extracting":
        return 1;
      case "chunking":
        return 2;
      case "analyzing":
        return 3;
      case "synthesizing":
        return 4;
      case "completed":
        return 5;
      default:
        return -1;
    }
  };

  const isBusy =
    status === "validating" ||
    status === "extracting" ||
    status === "chunking" ||
    status === "analyzing" ||
    status === "synthesizing" ||
    isExtracting;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      <div className="space-y-1">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Dosya Yükleme
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Devlet Tiyatroları standartlarında dramaturji ve tasarım incelemesi
        </p>
      </div>

      {/* Upload Mode Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => {
            setUploadMode("file");
            setErrorInfo(null);
          }}
          disabled={isBusy}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            uploadMode === "file"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Dosya Yükle
        </button>
        <button
          onClick={() => {
            setUploadMode("paste");
            setErrorInfo(null);
          }}
          disabled={isBusy}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${
            uploadMode === "paste"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Metin Yapıştır
        </button>
      </div>

      {/* File Upload Box */}
      {uploadMode === "file" ? (
        <div className="space-y-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !isBusy && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isBusy
                ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-70 cursor-not-allowed"
                : "border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-800"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              {isExtracting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-indigo-500" />
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              PDF, DOCX, TXT, MD
            </p>
            <button
              type="button"
              className="mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
            >
              Dosya Seç
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            rows={7}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={isBusy}
            placeholder="Tiyatro oyunu metninin tamamını veya perdelere ayrılmış kısımlarını buraya yapıştırınız..."
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-sans leading-relaxed resize-y"
          ></textarea>
        </div>
      )}

      {/* Extracted File / Metadata Box */}
      {extractedMeta && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Aktif Dosya Detayları
          </h3>
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Dosya Adı</p>
              <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                {extractedMeta.fileName}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Kelimeler</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {extractedMeta.wordCount.toLocaleString("tr-TR")}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sayfa</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  ~{extractedMeta.estimatedPages}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Tür</p>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {extractedMeta.fileType}
                </p>
              </div>
            </div>

            {/* First 1000 characters preview */}
            {extractedMeta.preview1000 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center justify-between w-full text-left text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:underline"
                >
                  <span>İlk 1.000 Karakterlik Metin Önizlemesi</span>
                  {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showPreview && (
                  <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                    {extractedMeta.preview1000}
                    {extractedMeta.charCount > 1000 && " ... (devamı var)"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info / Scanning Warning Note */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl">
        <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed font-semibold uppercase mb-0.5">
          Tarama ve Format Bilgisi
        </p>
        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-tight">
          Metin katmanı olan PDF, DOCX, TXT veya MD dosyaları doğrudan analiz edilir. Taranmış PDF'lerde metin katmanı gereklidir.
        </p>
      </div>

      {/* Real Process Status Timeline (No Fake Percentages) */}
      {isBusy && (
        <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 font-semibold text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span>{statusMessage}</span>
          </div>

          {/* Operational Steps Timeline */}
          <div className="space-y-1.5 pt-1">
            {stepsList.map((st, idx) => {
              const currentIdx = getCurrentStepIndex();
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={st.key} className="flex items-center space-x-2 text-xs">
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0"></div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0"></div>
                  )}
                  <span
                    className={`text-[11px] ${
                      isCurrent
                        ? "font-bold text-indigo-600 dark:text-indigo-400"
                        : isPast
                        ? "text-slate-600 dark:text-slate-400 font-medium"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Display */}
      {errorInfo && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-2 text-xs">
          <div className="flex items-start space-x-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <span className="font-bold block">
                {errorInfo.code === "QUOTA_EXCEEDED"
                  ? "Gemini API Kotası Doldu (429)"
                  : errorInfo.code === "PDF_NO_TEXT_OCR"
                  ? "PDF Metin İçermiyor (OCR Gerekli)"
                  : errorInfo.code === "UNSUPPORTED_FORMAT"
                  ? "Desteklenmeyen Dosya Formatı"
                  : errorInfo.code === "MODEL_UNAVAILABLE"
                  ? "Model Geçici Olarak Kullanılamıyor (503)"
                  : errorInfo.code === "FILE_TOO_LARGE"
                  ? "Dosya Boyutu Sınırı Aşıldı"
                  : errorInfo.code === "TIMEOUT"
                  ? "Bağlantı Zaman Aşımı"
                  : errorInfo.code === "SERVER_RESPONSE_INVALID"
                  ? "Sunucu Yanıt Uyarısı"
                  : "İşlem Uyarısı"}
              </span>
              <p className="text-[11px] text-red-600 dark:text-red-300/90 mt-1 leading-relaxed">
                {errorInfo.message}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={isBusy}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tekrar Dene</span>
                </button>

                {uploadMode === "file" && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode("paste");
                      setErrorInfo(null);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Metin Yapıştır Sekmesine Geç</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleStartAnalysis}
          disabled={
            isBusy ||
            (uploadMode === "file" && !extractedRawText) ||
            (uploadMode === "paste" && pastedText.trim().length < 50)
          }
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 ${
            isBusy ||
            (uploadMode === "file" && !extractedRawText) ||
            (uploadMode === "paste" && pastedText.trim().length < 50)
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          }`}
        >
          {isBusy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analiz Yapılıyor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Dramaturjik ve Tasarımsal İncelemeyi Başlat</span>
            </>
          )}
        </button>

        {uploadMode === "file" && selectedFile && !isBusy && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors flex items-center justify-center space-x-1.5 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Farklı Bir Dosya Seç</span>
          </button>
        )}
      </div>
    </div>
  );
};

