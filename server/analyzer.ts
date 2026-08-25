import { createHash } from "node:crypto";
import { getGeminiClient } from "./geminiClient.js";

export interface CategorizedField {
  text: string;
  category: "Metinden Doğrulanan" | "Tasarım Yorumu" | "Belirsiz" | "Dış Araştırma";
  details?: string;
}

export interface CharacterRelation {
  target: string;
  relation: string;
  category: "Metinden Doğrulanan" | "Tasarım Yorumu" | "Belirsiz" | "Dış Araştırma";
}

export interface CharacterItem {
  name: string;
  role: string;
  traits: string;
  functionInPlot: string;
  category: "Metinden Doğrulanan" | "Tasarım Yorumu" | "Belirsiz" | "Dış Araştırma";
  costumeGarment: string;
  costumeFabric: string;
  colors: string[];
  changeNote: string;
  relationships: CharacterRelation[];
  transformation: string;
}

export interface ActSceneItem {
  act: string;
  scene?: string;
  summary: string;
  location: string;
  charactersInvolved: string[];
}

export interface PlayAnalysisResult {
  title: string;
  author: string;
  genreAndPeriod: CategorizedField;
  timePeriod: CategorizedField;
  locations: CategorizedField[];
  shortSummary: CategorizedField;
  detailedPlot: CategorizedField;
  actsAndScenes: ActSceneItem[];
  coreConflict: CategorizedField;
  mainAndSubThemes: CategorizedField[];
  characters: CharacterItem[];
  keyOnstageActions: CategorizedField[];
  setRequirements: CategorizedField[];
  props: CategorizedField[];
  costumeRequirements: CategorizedField[];
  lightingAndAtmosphere: CategorizedField[];
  openInterpretationAreas: CategorizedField[];
  ambiguities: CategorizedField[];
}

export function chunkPlayText(text: string): string[] {
  if (text.length <= 40000) {
    return [text];
  }

  const actRegex = /(?=(?:\n|^)\s*(?:(?:[0-9]+|[I|V|X]+)\.\s*(?:PERDE|BÖLÜM|SAHNE|ACT|SCENE)|(?:BİRİNCİ|İKİNCİ|ÜÇÜNCÜ|DÖRDÜNCÜ|BEŞİNCİ)\s+(?:PERDE|BÖLÜM|SAHNE)|(?:PERDE|SAHNE|ACT|SCENE)\s+[0-9IVX]+)\b)/gi;
  const parts = text.split(actRegex).filter((p) => p && p.trim().length > 100);

  if (parts.length > 1) {
    return parts;
  }

  const chunks: string[] = [];
  let currentChunk = "";
  const paragraphs = text.split(/\n\s*\n/);

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > 30000 && currentChunk.length > 5000) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

const SYSTEM_INSTRUCTION = `Sen Devlet Tiyatroları (DT) standartlarında uzmanlaşmış kıdemli bir Başdramaturg, Sahne Tasarımcısı (Scenographer) ve Kostüm Tasarımcısısın.

GÖREVİN:
Verilen tiyatro oyunu metnini derinlemesine inceleyerek aşağıdaki alanları içeren eksiksiz ve geçerli bir JSON çıktısı üretmektir.

KATI KURALLAR:
1. GERÇEKÇİLİK: Metinde geçmeyen karakter, mekân veya olay uydurma. Sadece metindeki gerçek replik, didaskali ve olayları temel al.
2. BİLGİ KATEGORİZASYONU: Her bilgi alanında "category" alanı zorunludur. Sadece şu 4 değerden biri olmalıdır:
   - "Metinden Doğrulanan": Metindeki doğrudan ifadeler.
   - "Tasarım Yorumu": Metinden türetilen sahneleme/kostüm önerisi.
   - "Belirsiz": Metinde açık bırakılmış unsurlar.
   - "Dış Araştırma": Dönem, tarih ve sosyokültürel araştırma notları.
3. ÇIKTI FORMATI: Yanıtın sadece ve sadece geçerli bir JSON nesnesi olmalıdır.

JSON ALANLARI:
- "title": Oyun adı (string)
- "author": Yazar adı (string)
- "genreAndPeriod": { "text": string, "category": string, "details"?: string }
- "timePeriod": { "text": string, "category": string, "details"?: string }
- "locations": Array<{ "text": string, "category": string, "details"?: string }>
- "shortSummary": { "text": string, "category": string, "details"?: string }
- "detailedPlot": { "text": string, "category": string, "details"?: string }
- "actsAndScenes": Array<{ "act": string, "scene": string, "summary": string, "location": string, "charactersInvolved": string[] }>
- "coreConflict": { "text": string, "category": string, "details"?: string }
- "mainAndSubThemes": Array<{ "text": string, "category": string, "details"?: string }>
- "characters": Array<{
    "name": string,
    "role": string,
    "traits": string,
    "functionInPlot": string,
    "category": string,
    "costumeGarment": string,
    "costumeFabric": string,
    "colors": string[], // en az 3 adet geçerli hex renk kodu örn ["#1e293b", "#b91c1c", "#f8fafc"]
    "changeNote": string,
    "relationships": Array<{ "target": string, "relation": string, "category": string }>,
    "transformation": string
  }>
- "keyOnstageActions": Array<{ "text": string, "category": string, "details"?: string }>
- "setRequirements": Array<{ "text": string, "category": string, "details"?: string }>
- "props": Array<{ "text": string, "category": string, "details"?: string }>
- "costumeRequirements": Array<{ "text": string, "category": string, "details"?: string }>
- "lightingAndAtmosphere": Array<{ "text": string, "category": string, "details"?: string }>
- "openInterpretationAreas": Array<{ "text": string, "category": string, "details"?: string }>
- "ambiguities": Array<{ "text": string, "category": string, "details"?: string }>
`;

function normalizeCategorizedField(
  field: any,
  defaultText: string,
  defaultCat: "Metinden Doğrulanan" | "Tasarım Yorumu" | "Belirsiz" | "Dış Araştırma" = "Metinden Doğrulanan"
): CategorizedField {
  if (!field) {
    return { text: defaultText, category: defaultCat };
  }
  if (typeof field === "string") {
    return { text: field, category: defaultCat };
  }
  return {
    text: field.text || defaultText,
    category:
      field.category === "Metinden Doğrulanan" ||
      field.category === "Tasarım Yorumu" ||
      field.category === "Belirsiz" ||
      field.category === "Dış Araştırma"
        ? field.category
        : defaultCat,
    details: field.details || undefined,
  };
}

function normalizeCategorizedArray(
  arr: any[],
  defaultCat: "Metinden Doğrulanan" | "Tasarım Yorumu" | "Belirsiz" | "Dış Araştırma" = "Metinden Doğrulanan"
): CategorizedField[] {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.map((item) => normalizeCategorizedField(item, typeof item === "string" ? item : "Belirtilmemiş", defaultCat));
}

function normalizeAnalysis(raw: any, fileName?: string): PlayAnalysisResult {
  return {
    title: raw.title || (fileName ? fileName.replace(/\.[^/.]+$/, "") : "İsimsiz Oyun Metni"),
    author: raw.author || "Belirtilmemiş",
    genreAndPeriod: normalizeCategorizedField(raw.genreAndPeriod, "Tiyatro Oyunu"),
    timePeriod: normalizeCategorizedField(raw.timePeriod, "Belirtilmemiş"),
    locations: normalizeCategorizedArray(raw.locations),
    shortSummary: normalizeCategorizedField(raw.shortSummary, "Özet çıkarılamadı."),
    detailedPlot: normalizeCategorizedField(raw.detailedPlot, "Detaylı olay örgüsü metinden incelenmiştir."),
    actsAndScenes: Array.isArray(raw.actsAndScenes)
      ? raw.actsAndScenes.map((as: any) => ({
          act: as.act || "1. Perde",
          scene: as.scene || "1. Sahne",
          summary: as.summary || "",
          location: as.location || "Sahne",
          charactersInvolved: Array.isArray(as.charactersInvolved) ? as.charactersInvolved : [],
        }))
      : [],
    coreConflict: normalizeCategorizedField(raw.coreConflict, "Temel dramatik çatışma"),
    mainAndSubThemes: normalizeCategorizedArray(raw.mainAndSubThemes),
    characters: Array.isArray(raw.characters)
      ? raw.characters.map((c: any) => ({
          name: c.name || "Karakter",
          role: c.role || "Oyuncu",
          traits: c.traits || "",
          functionInPlot: c.functionInPlot || "",
          category:
            c.category === "Metinden Doğrulanan" ||
            c.category === "Tasarım Yorumu" ||
            c.category === "Belirsiz" ||
            c.category === "Dış Araştırma"
              ? c.category
              : "Metinden Doğrulanan",
          costumeGarment: c.costumeGarment || "Döneme uygun standart giysi",
          costumeFabric: c.costumeFabric || "Doğal dokuma kumaş",
          colors: Array.isArray(c.colors) && c.colors.length > 0 ? c.colors : ["#1e293b", "#dc2626", "#f8fafc"],
          changeNote: c.changeNote || "Belirtilmemiş",
          relationships: Array.isArray(c.relationships)
            ? c.relationships.map((r: any) => ({
                target: r.target || "Diğer Karakter",
                relation: r.relation || "İlişki",
                category: r.category || "Metinden Doğrulanan",
              }))
            : [],
          transformation: c.transformation || "Metin boyunca karakter gelişimi",
        }))
      : [],
    keyOnstageActions: normalizeCategorizedArray(raw.keyOnstageActions),
    setRequirements: normalizeCategorizedArray(raw.setRequirements),
    props: normalizeCategorizedArray(raw.props),
    costumeRequirements: normalizeCategorizedArray(raw.costumeRequirements),
    lightingAndAtmosphere: normalizeCategorizedArray(raw.lightingAndAtmosphere),
    openInterpretationAreas: normalizeCategorizedArray(raw.openInterpretationAreas, "Tasarım Yorumu"),
    ambiguities: normalizeCategorizedArray(raw.ambiguities, "Belirsiz"),
  };
}

export function repairAndParseJson(raw: string): any {
  let cleaned = raw.trim();
  // Strip markdown formatting if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) {
    throw new Error("Geçerli bir JSON nesnesi bulunamadı.");
  }
  cleaned = cleaned.substring(firstBrace);

  // 1. Try standard parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // proceed to repair
  }

  // 2. Fix trailing commas before closing braces/brackets
  let fixed = cleaned.replace(/,\s*([}\]])/g, "$1");
  try {
    return JSON.parse(fixed);
  } catch {
    // proceed to deep scan repair
  }

  // 3. Scan character by character: fix unescaped control chars, track open containers, close truncated strings
  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];
  let result = "";

  for (let i = 0; i < fixed.length; i++) {
    const char = fixed[i];
    if (inString) {
      if (char === "\\" && !isEscaped) {
        isEscaped = true;
        result += char;
      } else if (char === "\"" && !isEscaped) {
        inString = false;
        result += char;
      } else if (char === "\n") {
        result += "\\n";
      } else if (char === "\r") {
        result += "\\r";
      } else if (char === "\t") {
        result += "\\t";
      } else {
        result += char;
        isEscaped = false;
      }
    } else {
      if (char === "\"") {
        inString = true;
        isEscaped = false;
        result += char;
      } else if (char === "{" || char === "[") {
        stack.push(char);
        result += char;
      } else if (char === "}") {
        if (stack.length > 0 && stack[stack.length - 1] === "{") {
          stack.pop();
        }
        result += char;
      } else if (char === "]") {
        if (stack.length > 0 && stack[stack.length - 1] === "[") {
          stack.pop();
        }
        result += char;
      } else {
        result += char;
      }
    }
  }

  // If string was truncated mid-way, close quote
  if (inString) {
    result += "\"";
  }

  // Clean trailing commas and trailing colon
  result = result.trim().replace(/,\s*$/, "");
  result = result.replace(/,\s*([}\]])/g, "$1");
  if (result.endsWith(":")) {
    result += " null";
  }

  // Close remaining unclosed containers
  while (stack.length > 0) {
    const open = stack.pop();
    result = result.trim().replace(/,\s*$/, "");
    result = result.replace(/,\s*([}\]])/g, "$1");
    if (open === "{") result += "}";
    else if (open === "[") result += "]";
  }

  try {
    return JSON.parse(result);
  } catch (e2) {
    // If still failing, try cutting at last valid property boundary
    const lastComma = result.lastIndexOf(",");
    if (lastComma > 0) {
      const cut = result.substring(0, lastComma).trim() + "}";
      try {
        return JSON.parse(cut);
      } catch {
        // Fall through
      }
    }
    throw e2;
  }
}

const TEXT_MODEL = "gemini-2.5-flash";
const FALLBACK_TEXT_MODEL = "gemini-3.5-flash-lite";
const MAX_FREE_ANALYSIS_CHARS = 300_000;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 saat
const MAX_CACHE_ITEMS = 30;
const analysisCache = new Map<string, { expiresAt: number; analysis: PlayAnalysisResult }>();

function isTransientModelError(err: any): boolean {
  const status = Number(err?.status || err?.statusCode || 0);
  const message = String(err?.message || err || "").toLowerCase();
  return (
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    message.includes("resource_exhausted") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("timeout") ||
    message.includes("etimedout") ||
    message.includes("econnreset") ||
    message.includes("fetch failed")
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateAnalysisResponse(
  ai: ReturnType<typeof getGeminiClient>,
  model: string,
  promptContent: string,
  maxAttempts: number
): Promise<string> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      };

      if (model.startsWith("gemini-2.5")) {
        config.temperature = 0.2;
        config.thinkingConfig = { thinkingBudget: 0 };
      } else {
        // Gemini 3.x sayısal thinkingBudget yerine thinkingLevel kullanır.
        config.thinkingConfig = { thinkingLevel: "minimal" };
      }

      const response = await ai.models.generateContent({
        model,
        contents: promptContent,
        config,
      });
      return response.text || "";
    } catch (err: any) {
      lastError = err;
      if (!isTransientModelError(err) || attempt === maxAttempts) throw err;

      // 503/429 gibi geçici hatalarda kısa, artan ve küçük rastgele paylı bekleme.
      const delayMs = 1_000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 400);
      console.warn(
        `[Analyzer] '${model}' geçici hata verdi. ${delayMs} ms sonra yeniden deneniyor (${attempt}/${maxAttempts}).`
      );
      await wait(delayMs);
    }
  }

  throw lastError;
}

function cacheKey(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function readCache(key: string): PlayAnalysisResult | null {
  const cached = analysisCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    analysisCache.delete(key);
    return null;
  }
  return cached.analysis;
}

function writeCache(key: string, analysis: PlayAnalysisResult): void {
  if (analysisCache.size >= MAX_CACHE_ITEMS) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, analysis });
}

export async function analyzePlayText(
  text: string,
  fileName?: string
): Promise<PlayAnalysisResult> {
  if (text.length > MAX_FREE_ANALYSIS_CHARS) {
    const error = new Error(
      `Ücretsiz modda tek analiz için en fazla ${MAX_FREE_ANALYSIS_CHARS.toLocaleString("tr-TR")} karakter kabul edilmektedir. Lütfen metninizi perde veya bölüm olarak ayırarak yükleyiniz.`
    );
    (error as any).code = "FREE_TEXT_TOO_LONG";
    throw error;
  }

  // 12 Saatlik SHA-256 önbellek kontrolü
  const key = cacheKey(text);
  const cached = readCache(key);
  if (cached) {
    console.log("[Analyzer] Aynı metin için 12 saatlik önbellekteki analiz sonucu kullanıldı (Gemini isteği gönderilmedi).");
    return cached;
  }

  const ai = getGeminiClient();
  const promptContent = `Aşağıdaki tiyatro oyunu metnini analiz et ve belirtilen JSON şemasına uygun dramaturjik ve tasarım raporunu üret:\n\n${text}`;

  try {
    console.log(`[Analyzer] '${TEXT_MODEL}' modeline tekil analiz isteği gönderiliyor (Karakter sayısı: ${text.length})...`);
    let responseText = "";

    try {
      responseText = await generateAnalysisResponse(ai, TEXT_MODEL, promptContent, 3);
    } catch (primaryErr: any) {
      console.warn(`[Analyzer] Primary model '${TEXT_MODEL}' failed, trying fallback:`, primaryErr?.message || primaryErr);
      responseText = await generateAnalysisResponse(ai, FALLBACK_TEXT_MODEL, promptContent, 2);
    }

    if (!responseText || responseText.trim().length === 0) {
      throw new Error("Modelden boş yanıt alındı.");
    }

    const parsedData = repairAndParseJson(responseText);
    const analysis = normalizeAnalysis(parsedData, fileName);

    // Sonucu önbelleğe yaz
    writeCache(key, analysis);
    console.log(`[Analyzer] Analiz '${TEXT_MODEL}' ile başarıyla tamamlandı ve önbelleğe kaydedildi.`);
    return analysis;
  } catch (err: any) {
    const status = err.status || err.statusCode;
    const msg = err.message || String(err);
    console.error(`[Analyzer] Model '${TEXT_MODEL}' analiz hatası:`, msg);

    if (
      status === 429 ||
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.toLowerCase().includes("quota")
    ) {
      const error = new Error(
        "Ücretsiz Gemini kotası şu anda dolu. Uygulama yeniden istek göndermedi. Bir süre sonra tekrar deneyin."
      );
      (error as any).code = "QUOTA_EXCEEDED";
      throw error;
    }

    if (
      status === 503 ||
      msg.includes("503") ||
      msg.includes("UNAVAILABLE") ||
      msg.includes("overloaded")
    ) {
      const error = new Error(
        "Gemini modelleri otomatik olarak yeniden denendi ancak hizmet hâlâ geçici olarak yoğun (503). Lütfen birkaç dakika sonra Tekrar Dene düğmesine basınız."
      );
      (error as any).code = "MODEL_UNAVAILABLE";
      throw error;
    }

    if (
      msg.includes("fetch failed") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("ECONNRESET")
    ) {
      const error = new Error(
        "Yapay zekâ sunucusu ile bağlantı kurulamadı. Ağ bağlantınızı kontrol ediniz."
      );
      (error as any).code = "CONNECTION_ERROR";
      throw error;
    }

    if (msg.includes("GEMINI_API_KEY")) {
      const error = new Error(
        "GEMINI_API_KEY anahtarı eksik veya geçersiz. Lütfen AI Studio Secrets panelinden yapılandırınız."
      );
      (error as any).code = "API_KEY_ERROR";
      throw error;
    }

    const error = new Error(`Analiz sırasında hata oluştu: ${msg}`);
    (error as any).code = "ANALYSIS_FAILED";
    throw error;
  }
}
