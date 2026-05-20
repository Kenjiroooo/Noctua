"use client";

import { useState } from "react";
import { useStudy } from "../lib/StudyContext";
import OwlMascot from "./OwlMascot";
import MarkdownRenderer from "./MarkdownRenderer";

const subjects = ["Science", "History", "Math", "English", "General"];

export default function Explain() {
  const { showToast, addHistoryItem } = useStudy();

  const [inputText, setInputText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("General");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimplify = async () => {
    if (!inputText.trim()) {
      showToast("Please enter something to explain.", "error");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          subject: selectedSubject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate explanation");
      }

      const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

      setExplanation(data.explanation);

      addHistoryItem({
        type: "explain",
        title: inputText.trim().slice(0, 50) + (inputText.trim().length > 50 ? "..." : ""),
        description: `AI explanation for ${selectedSubject} topic (${wordCount} words input)`,
        content: data.explanation,
      });

      showToast("Noctua explained it. Don't make me repeat myself. 😤", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      showToast(`Error: ${message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#1e1b19] md:text-5xl">
          Explain it to me
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#4f453e]">
          Paste a confusing concept, paragraph, or question below. Noctua will
          (reluctantly) break it down in simple words.
        </p>
      </div>

      <div className="rounded-[24px] border border-[#e9e1dd] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)] md:p-8">
        <label className="text-sm font-bold uppercase tracking-wider text-[#4f453e]">
          What should I explain?
        </label>
        <textarea
          rows={7}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Example: How does photosynthesis actually work?"
          className="mt-3 w-full resize-none rounded-2xl border border-[#d3c4ba] bg-[#faf2ee] p-4 leading-7 outline-none transition focus:border-[#6b4f3a] focus:ring-2 focus:ring-[#6b4f3a]/20"
        />

        {inputText.trim() && (
          <p className="mt-2 text-xs text-[#81756d]">
            {inputText.trim().split(/\s+/).filter(Boolean).length} words •{" "}
            {inputText.trim().length} characters
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-bold transition",
                  selectedSubject === subj
                    ? "bg-[#6b4f3a] text-white shadow-sm"
                    : "bg-[#e9e1dd] text-[#4f453e] hover:bg-[#d3c4ba]",
                ].join(" ")}
              >
                {subj}
              </button>
            ))}
          </div>

          <button
            onClick={handleSimplify}
            disabled={isProcessing || !inputText.trim()}
            className={[
              "rounded-xl px-6 py-3 font-bold text-white shadow-[0_2px_0_rgba(81,56,37,1)] transition",
              isProcessing || !inputText.trim()
                ? "cursor-not-allowed bg-[#b5a599] shadow-none"
                : "bg-[#6b4f3a] hover:bg-[#513825] active:translate-y-[1px] active:shadow-none",
            ].join(" ")}
          >
            {isProcessing ? "⏳ Noctua is grumbling..." : "🪄 Ask Noctua (if you must)"}
          </button>
        </div>
      </div>

      {/* Result area */}
      <div className="mt-6 rounded-[24px] border border-[#e9e1dd] border-t-4 border-t-[#ffab69] bg-white p-10 shadow-[0_4px_16px_rgba(107,79,58,0.08)]">
        {explanation ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#6b4f3a]">
                💡 AI Explanation
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(explanation);
                    showToast("Copied to clipboard!", "success");
                  }}
                  className="rounded-lg bg-[#fff8f5] px-3 py-2 text-xs font-bold text-[#6b4f3a] transition hover:bg-[#f4ece9]"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => {
                    setExplanation(null);
                    setInputText("");
                  }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-100"
                >
                  Clear
                </button>
              </div>
            </div>
            <MarkdownRenderer
              content={explanation}
              className="rounded-2xl bg-[#faf2ee] p-5 text-sm leading-7 text-[#1e1b19]"
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-[#fff8f5]">
              <OwlMascot mood={isProcessing ? "thinking" : "annoyed"} size="md" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#6b4f3a]">
              {isProcessing ? "*ruffles feathers* Hold on..." : "What now?"}
            </h2>
            <p className="mt-2 max-w-xl mx-auto leading-7 text-[#4f453e]">
              {isProcessing
                ? "Noctua is reluctantly crafting an explanation..."
                : 'Type your question above, pick a subject, and bother Noctua with "Ask Noctua".'}
            </p>

            {isProcessing && (
              <div className="mt-6 mx-auto h-2 w-52 overflow-hidden rounded-full bg-[#e9e1dd]">
                <div className="animate-fill h-full rounded-full bg-[#ffab69]" style={{ width: "80%" }} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
