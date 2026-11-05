import React from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

import { useShop } from "@/context/ShopContext";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success" || !toast.type;
        const isInfo = toast.type === "info";
        const isWarning = toast.type === "warning";

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 bg-white/95 dark:bg-slate-900/95 border-emerald-100 dark:border-slate-800 text-slate-800 dark:text-slate-100"
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && (
                <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {isInfo && (
                <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Info className="w-4 h-4" />
                </div>
              )}
              {isWarning && (
                <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              aria-label="Đóng thông báo"
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              onClick={() => removeToast(toast.id)}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
