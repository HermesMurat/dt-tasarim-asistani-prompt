import {
  Bot,
  HelpCircle,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { CostumeStyleType, DecorStyleType, PlayAnalysis } from "../types";

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

interface AssistantChatTabProps {
  analysis: PlayAnalysis | null;
  decorStyle: DecorStyleType;
  costumeStyle: CostumeStyleType;
}

export const AssistantChatTab: React.FC<AssistantChatTabProps> = ({
  analysis,
  decorStyle,
  costumeStyle,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: analysis
        ? `Merhaba! "${analysis.title}" oyunu için dramaturji, dekor, malzeme seçimi, kostüm dokuları veya reji konsepti ile ilgili sorularınızı yanıtlamaya hazırım.`
        : "Merhaba! Lütfen önce bir tiyatro oyunu metni yükleyiniz.",
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
        <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Asistan Henüz Aktif Değil
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Bu sekme bir tiyatro oyunu metni başarıyla incelendikten sonra oyunun dramaturjik bağlamı ile etkinleşecektir.
        </p>
      </div>
    );
  }

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          playContext: analysis,
          decorStyle,
          costumeStyle,
        }),
      });

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Asistan sunucusundan geçersiz yanıt alındı.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Asistan yanıt veremedi.");
      }

      const botMsg: Message = {
        sender: "bot",
        text: data.reply,
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Hata: ${err.message || "Asistan ile iletişim kurulurken bir sorun oluştu."}`,
          time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        sender: "bot",
        text: `Sohbet temizlendi. "${analysis.title}" oyunu hakkında yeni sorularınızı sorabilirsiniz.`,
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const quickPrompts = [
    "Bu oyunun reji konseptinde ne tür sembolik dekor elemanları kullanılabilir?",
    "Ana karakterin kostümünde hangi renk ve doku zıtlıkları öne çıkarılmalı?",
    "Mekân değişimlerinde ışık ve sahne müziği nasıl entegre edilebilir?",
    "Bütçe dostu epik tiyatro dekor malzemeleri nelerdir?",
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[650px]">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              DT Dramaturji & Tasarım Asistanı
            </h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Aktif Oyun: {analysis.title} ({decorStyle.toUpperCase()} Dekor)
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Temizle</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-grow my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 overflow-y-auto space-y-3.5 text-xs sm:text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-xl max-w-xl leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none text-xs sm:text-sm"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none text-xs sm:text-sm"
              }`}
            >
              <p>{msg.text}</p>
              <span
                className={`block text-[10px] mt-1.5 ${
                  msg.sender === "user" ? "text-indigo-200 text-right" : "text-slate-400"
                }`}
              >
                {msg.time}
              </span>
            </div>

            {msg.sender === "user" && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span>Asistan düşünüyor ve sahne bağlamını inceliyor...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-[11px]">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white whitespace-nowrap transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          placeholder="Oyunun sahneleme ve dramaturjisi hakkında soru sorun..."
          className="flex-grow p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`p-2.5 rounded-lg font-semibold shadow-xs transition-all ${
            !inputText.trim() || isLoading
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          }`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
