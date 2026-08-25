import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";
import { createServer as createViteServer } from "vite";
import { analyzePlayText, chunkPlayText, PlayAnalysisResult } from "./server/analyzer.js";
import { extractTextFromBuffer, ExtractedTextResult } from "./server/extractor.js";
import { getGeminiClient } from "./server/geminiClient.js";

const app = express();
const PORT = 3000;

// Configure body parsing and file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB maximum
  },
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Extract text from uploaded file (supports multipart or base64 JSON)
app.post(
  "/api/extract-text",
  (req, res, next) => {
    // If request is application/json, skip multer
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
      return next();
    }
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        const isSize = err.code === "LIMIT_FILE_SIZE";
        return res.status(isSize ? 413 : 400).json({
          success: false,
          errorType: isSize ? "FILE_TOO_LARGE" : err.code || "UPLOAD_ERROR",
          message: isSize
            ? "Dosya boyutu 30 MB sınırını aşıyor."
            : err.message || "Dosya yüklenirken hata oluştu.",
        });
      }
      next();
    });
  },
  async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      let fileBuffer: Buffer | null = null;
      let originalName = "oyun_metni.txt";
      let mimeType = "";

      if (req.file) {
        fileBuffer = req.file.buffer;
        originalName = req.file.originalname || "oyun_metni.txt";
        mimeType = req.file.mimetype;
      } else if (req.body?.fileBase64) {
        fileBuffer = Buffer.from(req.body.fileBase64, "base64");
        originalName = req.body.fileName || "oyun_metni.pdf";
        mimeType = req.body.mimeType || "";
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        return res.status(400).json({
          success: false,
          errorType: "FILE_MISSING",
          message: "Lütfen bir dosya seçiniz.",
        });
      }

      const result: ExtractedTextResult = await extractTextFromBuffer(
        fileBuffer,
        originalName,
        mimeType
      );

      return res.json({
        success: true,
        text: result.text,
        meta: result.meta,
      });
    } catch (err: any) {
      console.error("Text extraction error:", err);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const code = err.code || "FILE_EXTRACT_ERROR";
      let status = 400;

      if (code === "UNSUPPORTED_FORMAT") status = 400;
      else if (code === "PDF_NO_TEXT_OCR") status = 422;
      else if (code === "FILE_CORRUPT") status = 422;

      return res.status(status).json({
        success: false,
        errorType: code.toUpperCase(),
        message: err.message || "Dosya metni çıkarılamadı.",
      });
    }
  }
);

// Endpoint: Full analysis (accepts either uploaded file OR raw text payload)
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    let rawText = "";
    let fileMeta: any = null;

    if (req.file) {
      // Extract from file
      const originalName = req.file.originalname || "oyun_metni.txt";
      const extractResult = await extractTextFromBuffer(
        req.file.buffer,
        originalName,
        req.file.mimetype
      );
      rawText = extractResult.text;
      fileMeta = extractResult.meta;
    } else if (req.body.text) {
      // Directly provided text
      rawText = String(req.body.text).trim();
      const charCount = rawText.length;
      const wordCount = rawText.split(/\s+/).filter(Boolean).length;
      const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));
      fileMeta = {
        fileName: req.body.fileName || "Yapıştırılan Metin",
        fileType: "TXT",
        fileSize: Buffer.byteLength(rawText, "utf8"),
        charCount,
        wordCount,
        estimatedPages,
        preview1000: rawText.slice(0, 1000),
      };
    } else {
      return res.status(400).json({
        success: false,
        errorType: "empty_payload",
        message: "Analiz edilecek oyun metni bulunamadı. Lütfen bir dosya yükleyin veya metin yapıştırın.",
      });
    }

    if (rawText.length < 50) {
      return res.status(400).json({
        success: false,
        errorType: "text_too_short",
        message: "Metin analiz için çok kısa (en az 50 karakter olmalıdır).",
      });
    }

    // Perform analysis with Gemini
    const chunks = chunkPlayText(rawText);
    const analysis: PlayAnalysisResult = await analyzePlayText(rawText, fileMeta?.fileName);

    return res.json({
      success: true,
      meta: fileMeta,
      chunksCount: chunks.length,
      analysis,
    });
  } catch (err: any) {
    console.error("Analysis route error:", err);
    const code = err.code || "SERVER_ERROR";
    let httpStatus = 500;

    if (code === "QUOTA_EXCEEDED") httpStatus = 429;
    else if (code === "FREE_TEXT_TOO_LONG") httpStatus = 413;
    else if (code === "MODEL_UNAVAILABLE") httpStatus = 503;
    else if (code === "PDF_NO_TEXT_OCR" || code === "FILE_CORRUPT") httpStatus = 422;
    else if (code === "UNSUPPORTED_FORMAT" || code === "FILE_EMPTY") httpStatus = 400;

    return res.status(httpStatus).json({
      success: false,
      errorType: code.toLowerCase(),
      message: err.message || "Oyun metni analizi sırasında bir hata oluştu.",
    });
  }
});

// Endpoint: Assistant contextual chat for the analyzed play
app.post("/api/chat", async (req, res) => {
  try {
    const { message, playContext, decorStyle, costumeStyle } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Lütfen bir soru giriniz.",
      });
    }

    const ai = getGeminiClient();

    const systemPrompt = `Sen Devlet Tiyatroları (DT) Dramaturji ve Sahne/Kostüm Tasarım Asistanısın.
Kullanıcı seninle analiz edilmiş tiyatro oyunu hakkında konuşmaktadır.
Mevcut Oyun Bağlamı:
- Eser: ${playContext?.title || "Bilinmiyor"}
- Yazar: ${playContext?.author || "Bilinmiyor"}
- Tür & Dönem: ${playContext?.genreAndPeriod?.text || "Bilinmiyor"}
- Seçili Sahne Üslubu: ${decorStyle || "Brechtyen / Epik"}
- Seçili Kostüm Üslubu: ${costumeStyle || "Otantik Dönemsel"}
- Temel Çatışma: ${playContext?.coreConflict?.text || "Bilinmiyor"}
- Mekânlar: ${(playContext?.locations || []).map((l: any) => l.text).join(", ")}

Soruları profesyonel tiyatro ve scenography terminolojisiyle, doğrudan, somut ve yönlendirici şekilde yanıtla.`;

    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 512 },
      },
    });

    const chatResponseText = chatResponse.text || "";
    if (!chatResponseText) {
      throw new Error("Asistan cevap üretemedi.");
    }

    return res.json({
      success: true,
      reply: chatResponseText,
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    const status = err.status || err.statusCode;
    const msg = err.message || String(err);

    if (
      status === 429 ||
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.toLowerCase().includes("quota")
    ) {
      return res.status(429).json({
        success: false,
        errorType: "quota_exceeded",
        message:
          "Ücretsiz Gemini kotası şu anda dolu. Uygulama yeniden istek göndermedi. Bir süre sonra tekrar deneyin.",
      });
    }

    return res.status(500).json({
      success: false,
      errorType: err.code || "CHAT_ERROR",
      message: err.message || "Asistan yanıtı oluşturulurken hata oluştu.",
    });
  }
});

// Explicit 404 handler for any /api route so it never falls through to SPA index.html
app.all("/api/*", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(404).json({
    success: false,
    errorType: "API_NOT_FOUND",
    message: `API endpoint bulunamadı: ${req.method} ${req.originalUrl}`,
  });
});

// Express error handler for API routes
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("Express middleware error:", err);
  res.setHeader("Content-Type", "application/json");
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    errorType: (err.code || "SERVER_ERROR").toUpperCase(),
    message: err.message || "Sunucu tarafında bir hata oluştu.",
  });
});

// Start server with Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DT Tasarım Asistanı server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
