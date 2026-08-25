import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Initialize worker for PDF.js in browser
try {
  if (typeof window !== "undefined") {
    // Set fallback worker URL or bundled worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn("Could not set pdfjs workerSrc:", e);
}

export interface ClientFileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  charCount: number;
  wordCount: number;
  estimatedPages: number;
  preview1000: string;
}

export interface ClientExtractResult {
  text: string;
  meta: ClientFileMetadata;
}

export async function extractTextClientSide(file: File): Promise<ClientExtractResult | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  // 1. Plain text / Markdown
  if (ext === "txt" || ext === "md") {
    const raw = await file.text();
    const clean = raw
      .replace(/^\uFEFF/, "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();

    if (clean.length < 10) {
      throw new Error("Metin dosyası boş veya okunamadı.");
    }

    const charCount = clean.length;
    const wordCount = clean.split(/\s+/).filter(Boolean).length;
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));

    return {
      text: clean,
      meta: {
        fileName: file.name,
        fileType: ext.toUpperCase(),
        fileSize: file.size,
        charCount,
        wordCount,
        estimatedPages,
        preview1000: clean.slice(0, 1000),
      },
    };
  }

  // 2. Word (.docx)
  if (ext === "docx") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await mammoth.extractRawText({ arrayBuffer });
      const raw = res.value || "";
      const clean = raw
        .replace(/^\uFEFF/, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();

      if (clean.length < 10) {
        throw new Error("DOCX dosyası boş veya okunamadı.");
      }

      const charCount = clean.length;
      const wordCount = clean.split(/\s+/).filter(Boolean).length;
      const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));

      return {
        text: clean,
        meta: {
          fileName: file.name,
          fileType: "DOCX",
          fileSize: file.size,
          charCount,
          wordCount,
          estimatedPages,
          preview1000: clean.slice(0, 1000),
        },
      };
    } catch (err: any) {
      console.warn("Client-side DOCX extraction error:", err);
      return null;
    }
  }

  // 3. PDF (.pdf)
  if (ext === "pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      } as any);

      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      const pageTexts: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageStr = textContent.items
            .map((item: any) => (item.str ? item.str : ""))
            .join(" ")
            .trim();
          if (pageStr) {
            pageTexts.push(pageStr);
          }
        } catch (pageErr) {
          console.warn(`Error reading PDF page ${pageNum}:`, pageErr);
        }
      }

      const fullText = pageTexts
        .join("\n\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();

      if (fullText.length >= 10) {
        const charCount = fullText.length;
        const wordCount = fullText.split(/\s+/).filter(Boolean).length;
        const estimatedPages = numPages || Math.max(1, Math.ceil(wordCount / 250));

        return {
          text: fullText,
          meta: {
            fileName: file.name,
            fileType: "PDF",
            fileSize: file.size,
            charCount,
            wordCount,
            estimatedPages,
            preview1000: fullText.slice(0, 1000),
          },
        };
      }
    } catch (pdfErr: any) {
      console.warn("Client-side PDF extraction error, falling back to server:", pdfErr);
      return null;
    }
  }

  return null;
}
