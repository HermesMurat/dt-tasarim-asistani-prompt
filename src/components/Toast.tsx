import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import React, { useEffect } from "react";

export interface ToastData {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastData[];
  onClose: (id: number) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border flex items-start space-x-3 transition-all duration-200 backdrop-blur-md ${
            toast.type === "success"
              ? "bg-slate-900/95 text-white border-emerald-500/40"
              : toast.type === "error"
              ? "bg-slate-900/95 text-white border-red-500/40"
              : "bg-slate-900/95 text-white border-indigo-500/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-grow text-xs">
            <h4 className="font-semibold text-white text-xs">{toast.title}</h4>
            <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => onClose(toast.id)}
            className="text-slate-400 hover:text-white p-0.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
