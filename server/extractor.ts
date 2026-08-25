import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export interface ExtractedTextResult {
  text: string;
  meta: {
    fileName: string;
    fileType: string;
    fileSize: number;
    charCount: number;
    wordCount: number;
    estimatedPages: number;
    preview1000: string;
  };
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<ExtractedTextResult> {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Reject unsupported legacy formats
  if (extension === "doc" || extension === "rtf") {
    const error = new Error(
      "Eski DOC ve RTF formatları doğrudan desteklenmemektedir. Lütfen dosyanızı Microsoft Word veya LibreOffice ile açıp PDF (.pdf) veya DOCX (.docx) formatına dönüştürerek yükleyiniz."
    );
    (error as any).code = "UNSUPPORTED_FORMAT";
    throw error;
  }

  let rawText = "";

  if (extension === "pdf" || mimeType === "application/pdf") {
    let parser: any = null;
    try {
      const uint8 = new Uint8Array(buffer);
      parser = new PDFParse({ data: uint8 });
      const textResult = await parser.getText();
      rawText = textResult?.text || "";
    } catch (err: any) {
      const error = new Error(
        `PDF dosyası okunurken hata oluştu: ${err.message || "Bozuk veya şifreli dosya"}`
      );
      (error as any).code = "FILE_CORRUPT";
      throw error;
    } finally {
      if (parser && typeof parser.destroy === "function") {
        try {
          await parser.destroy();
        } catch (_) {}
      }
    }

    // Check if the PDF has actual extracted text or is scanned/image-only
    const cleanText = rawText.replace(/\s+/g, " ").trim();
    if (cleanText.length < 20) {
      const error = new Error(
        "PDF dosyasında okunabilir dijital metin katmanı bulunamadı. Dosyanız taranmış (resim/fotoğraf) formatında veya korumalı olabilir. Lütfen OCR işlemi uygulanmış veya dijital metin içeren bir PDF/DOCX yükleyiniz."
      );
      (error as any).code = "PDF_NO_TEXT_OCR";
      throw error;
    }
  } else if (
    extension === "docx" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const docxData = await mammoth.extractRawText({ buffer });
      rawText = docxData.value || "";
    } catch (err: any) {
      const error = new Error(
        `DOCX dosyası okunurken hata oluştu: ${err.message || "Bozuk dosya yapısı"}`
      );
      (error as any).code = "FILE_CORRUPT";
      throw error;
    }

    const cleanText = rawText.replace(/\s+/g, " ").trim();
    if (cleanText.length < 10) {
      const error = new Error("DOCX dosyası boş veya okunabilir metin içermiyor.");
      (error as any).code = "FILE_EMPTY";
      throw error;
    }
  } else if (
    extension === "txt" ||
    extension === "md" ||
    mimeType?.startsWith("text/")
  ) {
    try {
      rawText = buffer.toString("utf-8");
    } catch (err: any) {
      const error = new Error("Metin dosyası UTF-8 olarak okunamadı.");
      (error as any).code = "FILE_CORRUPT";
      throw error;
    }

    const cleanText = rawText.replace(/\s+/g, " ").trim();
    if (cleanText.length < 10) {
      const error = new Error("Metin dosyası boş.");
      (error as any).code = "FILE_EMPTY";
      throw error;
    }
  } else {
    const error = new Error(
      `Desteklenmeyen dosya türü: .${extension}. Lütfen PDF, DOCX, TXT veya MD dosyası yükleyin.`
    );
    (error as any).code = "UNSUPPORTED_FORMAT";
    throw error;
  }

  // Normalize line breaks, strip UTF-8 BOM and control characters
  const normalizedText = rawText
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\0/g, "")
    .trim();

  // Calculate statistics
  const charCount = normalizedText.length;
  const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
  // Approximately 250-300 words per script page
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));
  const preview1000 = normalizedText.slice(0, 1000);

  return {
    text: normalizedText,
    meta: {
      fileName,
      fileType: extension.toUpperCase(),
      fileSize: buffer.length,
      charCount,
      wordCount,
      estimatedPages,
      preview1000,
    },
  };
}
