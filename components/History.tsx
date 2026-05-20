"use client";

import { useState } from "react";
import { useStudy } from "../lib/StudyContext";
import OwlMascot from "./OwlMascot";
import MarkdownRenderer from "./MarkdownRenderer";

type FilterType = "all" | "upload" | "summary" | "quiz" | "explain";

const filterLabels: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "summary", label: "Summaries" },
  { key: "quiz", label: "Quizzes" },
  { key: "explain", label: "Explanations" },
  { key: "upload", label: "Uploads" },
];

const typeIcons: Record<string, string> = {
  upload: "📤",
  summary: "📋",
  quiz: "📝",
  explain: "💡",
};

export default function History() {
  const { history, deleteHistoryItem, clearHistory, showToast, relativeDate } =
    useStudy();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [viewingItem, setViewingItem] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered =
    activeFilter === "all"
      ? history
      : history.filter((h) => h.type === activeFilter);

  const viewedItem = viewingItem
    ? history.find((h) => h.id === viewingItem)
    : null;

  return (
    <section>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1e1b19]">
            History
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-[#4f453e]">
            Your saved Noctua outputs will appear here once database storage is enabled, including your past notes, summaries, explanations, and quizzes.
          </p>
        </div>

        {history.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-500 font-semibold">Clear all?</span>
                <button
                  onClick={() => {
                    clearHistory();
                    setConfirmClear(false);
                    showToast("History cleared", "info");
                  }}
                  className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg bg-[#e9e1dd] px-3 py-2 text-xs font-bold text-[#4f453e] transition hover:bg-[#d3c4ba]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-100"
              >
                🗑️ Clear History
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {filterLabels.map((filter) => {
          const count =
            filter.key === "all"
              ? history.length
              : history.filter((h) => h.type === filter.key).length;

          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={[
                "rounded-full px-4 py-2 text-sm font-bold transition",
                activeFilter === filter.key
                  ? "bg-[#6b4f3a] text-white shadow-sm"
                  : "bg-white text-[#6b4f3a] ring-1 ring-[#e9e1dd] hover:bg-[#fff8f5]",
              ].join(" ")}
            >
              {filter.label}
              {count > 0 && (
                <span
                  className={[
                    "ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    activeFilter === filter.key
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ece9] text-[#6b4f3a]",
                  ].join(" ")}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="group rounded-[24px] border border-[#e9e1dd] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)] transition hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(107,79,58,0.12)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-[#b9ecee] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#002021]">
                  <span>{typeIcons[item.type] || "📌"}</span>
                  {item.type}
                </span>
                <span className="text-sm text-[#81756d]">
                  {relativeDate(item.createdAt)}
                </span>
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#1e1b19]">
                {item.title}
              </h2>
              <p className="mt-3 line-clamp-2 leading-7 text-[#4f453e]">
                {item.description}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (item.content) {
                      setViewingItem(item.id);
                    } else {
                      showToast("No detailed content for this item.", "info");
                    }
                  }}
                  className="font-bold text-[#6b4f3a] transition hover:text-[#513825]"
                >
                  {item.content ? "Open item →" : "View →"}
                </button>
                <button
                  onClick={() => {
                    deleteHistoryItem(item.id);
                    showToast("Item removed from history", "info");
                  }}
                  className="rounded-lg p-2 text-[#81756d] opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[24px] border border-dashed border-[#d3c4ba] bg-[#faf2ee] p-8 text-center flex flex-col items-center justify-center">
          <OwlMascot mood="sleeping" size="md" />
          <h2 className="mt-4 text-2xl font-bold text-[#1e1b19]">
            {history.length === 0
              ? "No history yet"
              : "No items match this filter"}
          </h2>
          <p className="mt-2 text-[#4f453e]">
            {history.length === 0
              ? "Start uploading notes, taking quizzes, or summarizing to build your history."
              : "Try selecting a different filter above."}
          </p>
        </div>
      )}

      {/* Item viewer modal */}
      {viewedItem && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setViewingItem(null)}
        >
          <div
            className="animate-fade-in max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#e9e1dd] bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="flex items-center gap-1.5 rounded-full bg-[#b9ecee] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#002021]">
                  <span>{typeIcons[viewedItem.type] || "📌"}</span>
                  {viewedItem.type}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-[#1e1b19]">
                  {viewedItem.title}
                </h2>
                <p className="mt-1 text-sm text-[#81756d]">
                  {relativeDate(viewedItem.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="shrink-0 rounded-full p-2 text-xl text-[#81756d] transition hover:bg-[#f4ece9]"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 leading-7 text-[#4f453e]">{viewedItem.description}</p>

            {viewedItem.content && (
              <MarkdownRenderer
                content={viewedItem.content}
                className="mt-6 rounded-2xl bg-[#faf2ee] p-5 text-sm leading-7 text-[#1e1b19]"
              />
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (viewedItem.content) {
                    navigator.clipboard.writeText(viewedItem.content);
                    showToast("Content copied!", "success");
                  }
                }}
                className="rounded-lg bg-[#fff8f5] px-4 py-2 text-sm font-bold text-[#6b4f3a] transition hover:bg-[#f4ece9]"
              >
                📋 Copy
              </button>
              <button
                onClick={() => setViewingItem(null)}
                className="rounded-lg bg-[#6b4f3a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#513825]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
