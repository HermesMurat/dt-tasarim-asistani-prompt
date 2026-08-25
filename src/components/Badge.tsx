import React from "react";
import { CategoryType } from "../types";

interface BadgeProps {
  category?: CategoryType | string;
  size?: "xs" | "sm";
  className?: string;
}

export const CategoryBadge: React.FC<BadgeProps> = ({
  category = "Metinden Doğrulanan",
  size = "xs",
  className = "",
}) => {
  const sizeClasses = size === "xs" ? "px-2 py-0.5 text-[9px] sm:text-[10px]" : "px-2.5 py-1 text-xs";

  switch (category) {
    case "Metinden Doğrulanan":
      return (
        <span
          className={`inline-flex items-center rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Doğrulanan
        </span>
      );
    case "Tasarım Yorumu":
      return (
        <span
          className={`inline-flex items-center rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
          Tasarım Yorumu
        </span>
      );
    case "Belirsiz":
      return (
        <span
          className={`inline-flex items-center rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Belirsiz
        </span>
      );
    case "Dış Araştırma":
      return (
        <span
          className={`inline-flex items-center rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
          Dış Araştırma
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses} ${className}`}
        >
          {category}
        </span>
      );
  }
};

