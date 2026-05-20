"use client";

import { useState, useRef } from "react";
import { useStudy } from "../lib/StudyContext";
import OwlMascot from "./OwlMascot";
import MarkdownRenderer from "./MarkdownRenderer";

export default function Summarizer() {
  const { notes, showToast, addHistoryItem } = useStudy();

  const [sourceText, setSourceText] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── load note into source ─── */
  const handleLoadNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setSourceText(note.content);
      setSelectedNoteId(noteId);
      showToast(`Loaded "${note.title}" into source`, "info");
    }
  };

  /* ─── upload PDF to source ─── */
  const handleUploadPDF = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setSourceText(content || `[Uploaded: ${file.name}]`);
      showToast(`Loaded "${file.name}"`, "success");
    };

    if (file.type.startsWith("text/") || file.name.match(/\.(txt|md|csv)$/)) {
      reader.readAsText(file);
    } else {
      setSourceText(`[Binary file loaded: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]\n\nAI summarization will process this file when connected.`);
      showToast(`"${file.name}" loaded (AI needed to extract text from this format)`, "info");
    }
    e.target.value = "";
  };

  /* ─── summarize with Noctua AI ─── */
  const handleSummarize = async () => {
    if (!sourceText.trim()) {
      showToast("Please add source material first.", "error");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      const wordCount = sourceText.split(/\s+/).filter(Boolean).length;

      setSummaryResult(data.summary);

      addHistoryItem({
        type: "summary",
        title: selectedNoteId
          ? notes.find((n) => n.id === selectedNoteId)?.title || "Summary"
          : `Summary (${wordCount} words)`,
        description: `AI-generated summary from ${wordCount}-word document.`,
        content: data.summary,
      });

      showToast("Noctua begrudgingly delivered your summary. You're welcome. 😤", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      showToast(`Error: ${message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-[#1e1b19]">
          Summarizer
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-[#4f453e]">
          Condense lengthy source material into focused study notes. Noctua will do it... eventually.
        </p>
      </div>

      {/* Quick-load saved notes */}
      {notes.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#81756d]">
            Load from notes:
          </span>
          {notes.slice(0, 5).map((note) => (
            <button
              key={note.id}
              onClick={() => handleLoadNote(note.id)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                selectedNoteId === note.id
                  ? "bg-[#6b4f3a] text-white"
                  : "bg-[#fff8f5] text-[#6b4f3a] ring-1 ring-[#e9e1dd] hover:bg-[#f4ece9]",
              ].join(" ")}
            >
              {note.title}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source panel */}
        <div className="flex min-h-[560px] flex-col rounded-[24px] border border-[#e9e1dd] border-t-4 border-t-[#ffab69] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)]">
          <label className="mb-4 flex items-center gap-2 text-2xl font-semibold text-[#1e1b19]">
            📄 Source Material
          </label>

          <textarea
            value={sourceText}
            onChange={(e) => {
              setSourceText(e.target.value);
              setSelectedNoteId(null);
            }}
            placeholder="Paste your lecture notes, textbook excerpts, or articles here..."
            className="min-h-[360px] flex-1 resize-none rounded-2xl border border-[#e9e1dd] bg-[#faf2ee] p-4 leading-7 outline-none transition focus:border-[#6b4f3a] focus:ring-2 focus:ring-[#6b4f3a]/20"
          />

          {sourceText.trim() && (
            <p className="mt-2 text-xs text-[#81756d]">
              {sourceText.trim().split(/\s+/).filter(Boolean).length} words •{" "}
              {sourceText.trim().length} characters
            </p>
          )}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <span className="rounded-full bg-[#b9ecee]/50 px-3 py-1 text-xs font-bold text-[#2b5c5e]">
                Text
              </span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.md,.docx,.csv"
                onChange={handleFileChange}
              />
              <button
                onClick={handleUploadPDF}
                className="rounded-full bg-[#e9e1dd] px-3 py-1 text-xs font-bold text-[#4f453e] transition hover:bg-[#d3c4ba]"
              >
                Upload PDF
              </button>
              {sourceText.trim() && (
                <button
                  onClick={() => {
                    setSourceText("");
                    setSelectedNoteId(null);
                    setSummaryResult(null);
                  }}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500 transition hover:bg-red-100"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={handleSummarize}
              disabled={isProcessing || !sourceText.trim()}
              className={[
                "rounded-xl px-6 py-3 font-bold text-white shadow-[0_2px_0_rgba(81,56,37,1)] transition",
                isProcessing || !sourceText.trim()
                  ? "cursor-not-allowed bg-[#b5a599] shadow-none"
                  : "bg-[#6b4f3a] hover:bg-[#513825] active:translate-y-[1px] active:shadow-none",
              ].join(" ")}
            >
              {isProcessing ? "⏳ Noctua is reluctantly working..." : "😤 Make Noctua Summarize"}
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="flex min-h-[560px] flex-col rounded-[24px] border border-[#e9e1dd] bg-white p-8 shadow-[0_4px_16px_rgba(107,79,58,0.08)]">
          {summaryResult ? (
            <div className="flex flex-1 flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1e1b19]">📋 AI Summary</h2>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(summaryResult);
                    showToast("Summary copied to clipboard!", "success");
                  }}
                  className="rounded-lg bg-[#fff8f5] px-3 py-2 text-xs font-bold text-[#6b4f3a] transition hover:bg-[#f4ece9]"
                >
                  📋 Copy
                </button>
              </div>
              <MarkdownRenderer
                content={summaryResult}
                className="flex-1 rounded-2xl bg-[#faf2ee] p-5 text-sm leading-7 text-[#1e1b19]"
              />
            </div>
          ) : (
            <div className="grid flex-1 place-items-center text-center">
              <div>
                <div className="mx-auto grid h-44 w-44 place-items-center rounded-[32px] bg-[#fff8f5]">
                  <OwlMascot mood={isProcessing ? "thinking" : "annoyed"} size="lg" />
                </div>
                <h2 className="mt-6 text-3xl font-bold text-[#1e1b19]">
                  {isProcessing ? "*sigh* Fine, I'm reading it..." : "Oh, it's you again..."}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-lg leading-8 text-[#4f453e]">
                  {isProcessing
                    ? "Noctua is begrudgingly generating your summary..."
                    : "Paste your notes on the left. I'll summarize them... eventually."}
                </p>

                {isProcessing && (
                  <div className="mt-6 mx-auto h-2 w-52 overflow-hidden rounded-full bg-[#e9e1dd]">
                    <div className="animate-fill h-full rounded-full bg-[#ffab69]" style={{ width: "80%" }} />
                  </div>
                )}

                {!isProcessing && (
                  <div className="mt-8 rounded-2xl bg-[#faf2ee] p-5 text-left">
                    <p className="text-sm font-bold uppercase tracking-wider text-[#81756d]">
                      Powered by Noctua 🦉
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-[#4f453e]">
                      <li>Intelligent AI-powered summarization</li>
                      <li>Key concepts and definitions extracted</li>
                      <li>Study-friendly format with takeaways</li>
                      <li>All results saved to Supabase database</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
