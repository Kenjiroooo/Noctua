"use client";

import { useState, useRef, useCallback } from "react";
import { useStudy } from "../lib/StudyContext";
import OwlMascot from "./OwlMascot";
import type { OwlMood } from "./OwlMascot";

export default function UploadNotes() {
  const { notes, addNote, deleteNote, showToast, addHistoryItem } = useStudy();

  const [pasteText, setPasteText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [viewingNote, setViewingNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── file handling ─── */
  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      arr.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          addNote({
            title: file.name.replace(/\.[^/.]+$/, ""),
            content: content || `[File: ${file.name}]`,
            type: "file",
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
          addHistoryItem({
            type: "upload",
            title: file.name,
            description: `Uploaded ${file.type || "file"} (${(file.size / 1024).toFixed(1)} KB)`,
          });
          showToast(`"${file.name}" uploaded successfully!`, "success");
        };

        if (
          file.type.startsWith("text/") ||
          file.name.endsWith(".txt") ||
          file.name.endsWith(".md") ||
          file.name.endsWith(".csv")
        ) {
          reader.readAsText(file);
        } else {
          // For non-text files, store metadata
          addNote({
            title: file.name.replace(/\.[^/.]+$/, ""),
            content: `[Binary file: ${file.name}]\nType: ${file.type || "unknown"}\nSize: ${(file.size / 1024).toFixed(1)} KB`,
            type: "file",
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          });
          addHistoryItem({
            type: "upload",
            title: file.name,
            description: `Uploaded ${file.type || "file"} (${(file.size / 1024).toFixed(1)} KB)`,
          });
          showToast(`"${file.name}" uploaded successfully!`, "success");
        }
      });
    },
    [addNote, addHistoryItem, showToast],
  );

  const handleBrowse = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  /* ─── drag & drop ─── */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  /* ─── paste / text ─── */
  const handleProcessText = () => {
    const text = pasteText.trim();
    if (!text) {
      showToast("Please enter some text first.", "error");
      return;
    }
    const title = noteTitle.trim() || `Note — ${new Date().toLocaleDateString()}`;
    addNote({
      title,
      content: text,
      type: "text",
    });
    addHistoryItem({
      type: "upload",
      title,
      description: `Saved ${text.length} characters of pasted text.`,
    });
    showToast(`"${title}" saved successfully!`, "success");
    setPasteText("");
    setNoteTitle("");
  };

  /* ─── note viewer ─── */
  const viewedNote = viewingNote ? notes.find((n) => n.id === viewingNote) : null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-[#1e1b19]">
          Upload Notes
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-8 text-[#4f453e]">
          Add your study materials so Noctua can help you review, summarize,
          and generate quizzes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-[24px] border border-[#e9e1dd] border-t-4 border-t-[#ffab69] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)] lg:col-span-8 md:p-8">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.md,.csv"
            onChange={handleFileChange}
          />

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowse}
            className={[
              "grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[#d3c4ba] bg-[#faf2ee] px-6 py-12 text-center transition-all duration-200 hover:bg-[#f4ece9]",
              dragOver ? "drag-over" : "",
            ].join(" ")}
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#ffdcc4] text-3xl">
              {dragOver ? "📥" : "☁️"}
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-[#1e1b19]">
              {dragOver ? "Drop files here!" : "Drag & Drop your files here"}
            </h2>
            <p className="mt-2 text-[#4f453e]">
              Supports PDF, DOCX, TXT, and JPG
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBrowse();
              }}
              className="mt-6 rounded-lg bg-[#0d4447] px-6 py-3 text-sm font-bold text-white shadow-[0_2px_0_rgba(13,68,71,1)] transition hover:bg-[#1a5c5f] active:translate-y-[1px] active:shadow-none"
            >
              Browse Files
            </button>
          </div>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e9e1dd]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#81756d]">
              or paste text
            </span>
            <div className="h-px flex-1 bg-[#e9e1dd]" />
          </div>

          {/* Note title */}
          <label className="text-sm font-bold uppercase tracking-wider text-[#4f453e]">
            Note Title (optional)
          </label>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="e.g., Biology Chapter 4 Notes"
            className="mt-2 mb-4 w-full rounded-xl border border-[#d3c4ba] bg-[#faf2ee] px-4 py-3 text-sm outline-none transition focus:border-[#6b4f3a] focus:ring-2 focus:ring-[#6b4f3a]/20"
          />

          <label className="text-sm font-bold uppercase tracking-wider text-[#4f453e]">
            Paste your notes directly
          </label>
          <textarea
            rows={9}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Start typing or pasting your study materials here..."
            className="mt-3 w-full resize-none rounded-2xl border border-[#d3c4ba] bg-[#faf2ee] p-4 leading-7 outline-none transition focus:border-[#6b4f3a] focus:ring-2 focus:ring-[#6b4f3a]/20"
          />

          {pasteText.trim() && (
            <p className="mt-2 text-xs text-[#81756d]">
              {pasteText.trim().length} characters •{" "}
              {pasteText.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleProcessText}
              disabled={!pasteText.trim()}
              className={[
                "rounded-xl px-8 py-3 font-bold text-white shadow-[0_2px_0_rgba(81,56,37,1)] transition",
                pasteText.trim()
                  ? "bg-[#6b4f3a] hover:bg-[#513825] active:translate-y-[1px] active:shadow-none"
                  : "cursor-not-allowed bg-[#b5a599] shadow-none",
              ].join(" ")}
            >
              ✨ Process Notes
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <div className="rounded-[24px] border border-[#e9e1dd] bg-white p-6 text-center shadow-[0_4px_16px_rgba(107,79,58,0.08)]">
            <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-[#fff8f5]">
              <OwlMascot mood={pasteText.trim() ? "writing" : dragOver ? "happy" : "teaching"} size="md" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-[#1e1b19]">
              Need help organizing?
            </h2>
            <p className="mt-3 leading-7 text-[#4f453e]">
              Noctua can extract key concepts, create summaries, and build
              quizzes from your raw notes.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-[#b9ecee] px-3 py-1 text-xs font-bold text-[#002021]">
                Extraction
              </span>
              <span className="rounded-full bg-[#b9ecee] px-3 py-1 text-xs font-bold text-[#002021]">
                Summarization
              </span>
            </div>
          </div>

          {/* Saved notes list */}
          <div className="rounded-[24px] border border-[#e9e1dd] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#81756d]">
              {notes.length > 0 ? `My Notes (${notes.length})` : "Recently Uploaded"}
            </h3>

            {notes.length === 0 ? (
              <p className="mt-4 text-sm text-[#81756d]">
                No notes yet. Upload or paste your first note!
              </p>
            ) : (
              <div className="mt-4 max-h-80 space-y-1 overflow-y-auto">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#fff8f5]"
                  >
                    <button
                      onClick={() => setViewingNote(note.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#ffdcc4]">
                        {note.type === "file" ? "📄" : "📝"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1e1b19]">
                          {note.title}
                        </p>
                        <p className="text-xs text-[#81756d]">
                          {note.type === "file" && note.fileSize
                            ? formatSize(note.fileSize)
                            : `${note.content.length} chars`}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        deleteNote(note.id);
                        showToast("Note deleted", "info");
                      }}
                      className="shrink-0 rounded-lg p-2 text-[#81756d] opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Note viewer modal */}
      {viewedNote && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setViewingNote(null)}
        >
          <div
            className="animate-fade-in max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[#e9e1dd] bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[#b9ecee] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#002021]">
                  {viewedNote.type === "file" ? "Uploaded File" : "Pasted Note"}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-[#1e1b19]">
                  {viewedNote.title}
                </h2>
                {viewedNote.fileName && (
                  <p className="mt-1 text-sm text-[#81756d]">
                    {viewedNote.fileName}{" "}
                    {viewedNote.fileSize ? `• ${formatSize(viewedNote.fileSize)}` : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => setViewingNote(null)}
                className="shrink-0 rounded-full p-2 text-xl text-[#81756d] transition hover:bg-[#f4ece9]"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 whitespace-pre-wrap rounded-2xl bg-[#faf2ee] p-5 text-sm leading-7 text-[#1e1b19]">
              {viewedNote.content}
            </div>

            <p className="mt-4 text-xs text-[#81756d]">
              Created: {new Date(viewedNote.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
