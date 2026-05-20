"use client";

import { useStudy } from "../lib/StudyContext";

export default function ToastContainer() {
  const { toasts } = useStudy();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "animate-slide-up flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold shadow-lg backdrop-blur-sm transition-all",
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : toast.type === "error"
                ? "border border-red-200 bg-red-50 text-red-800"
                : "border border-sky-200 bg-sky-50 text-sky-800",
          ].join(" ")}
        >
          <span className="text-lg">
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
