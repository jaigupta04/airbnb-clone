"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md animate-[slideup_0.2s_ease-out]",
              t.type === "success" && "border-emerald-200 bg-white/95 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800/95 dark:text-neutral-100",
              t.type === "error" && "border-red-200 bg-white/95 text-red-700 dark:border-red-900 dark:bg-neutral-800/95 dark:text-red-300",
              t.type === "info" && "border-neutral-200 bg-white/95 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/95 dark:text-neutral-200",
            )}
          >
            {t.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-500" />}
            {t.type === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            {t.type === "info" && <Info className="h-5 w-5 text-neutral-400" />}
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}