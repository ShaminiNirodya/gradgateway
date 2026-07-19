"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Toast = {
  id: number;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number; // ms
};

const ToastContext = createContext<{
  toasts: Toast[];
  show: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const t: Toast = { id, duration: 2500, variant: "default", ...toast };
    setToasts((prev) => [...prev, t]);
    if (t.duration && t.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, t.duration);
    }
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function Toaster() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, dismiss } = ctx;

  return (
    <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[240px] max-w-sm rounded-xl shadow-lg px-4 py-3 text-sm bg-white border flex items-start gap-3 animate-in fade-in-0 zoom-in-95`}
          role="status"
          aria-live="polite"
        >
          <div
            className={`w-2 h-2 rounded-full mt-1 ${
              t.variant === "success"
                ? "bg-emerald-500"
                : t.variant === "error"
                ? "bg-red-500"
                : t.variant === "warning"
                ? "bg-yellow-500"
                : "bg-slate-400"
            }`}
          />
          <div className="flex-1">
            {t.title && <div className="font-bold text-slate-800">{t.title}</div>}
            {t.description && <div className="text-slate-600">{t.description}</div>}
          </div>
          <button
            aria-label="Dismiss"
            className="text-slate-500 hover:text-slate-700"
            onClick={() => dismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
