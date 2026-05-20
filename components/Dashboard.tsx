"use client";

import { useStudy } from "../lib/StudyContext";
import { PageKey } from "./Sidebar";
import OwlMascot from "./OwlMascot";

type DashboardProps = {
  setActivePage: (page: PageKey) => void;
};

const cards: {
  title: string;
  description: string;
  icon: string;
  button: string;
  page: PageKey;
}[] = [
  {
    title: "Upload Notes",
    description: "Bring in lectures, PDFs, handwritten notes, or copied text.",
    icon: "☁️",
    button: "Get Started",
    page: "notes",
  },
  {
    title: "Summarize Notes",
    description: "Turn long readings into short, digestible summaries.",
    icon: "📚",
    button: "Create Summary",
    page: "summarizer",
  },
  {
    title: "Generate Quiz",
    description: "Create multiple-choice or identification quizzes from your notes.",
    icon: "🧠",
    button: "Start Quiz",
    page: "quiz",
  },
];

export default function Dashboard({ setActivePage }: DashboardProps) {
  const { notes, history, displayName } = useStudy();

  const recentNotes = notes.slice(0, 3);
  const totalQuizzes = history.filter((h) => h.type === "quiz").length;
  const totalSummaries = history.filter((h) => h.type === "summary").length;

  return (
    <section>
      <div className="mb-10">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-[#1e1b19] md:text-5xl">
          What would you like to learn today?
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-[#4f453e]">
          Select an action below to start your study session with your owl AI
          assistant.
        </p>
      </div>

      {/* Stats bar */}
      {(notes.length > 0 || history.length > 0) && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#e9e1dd] bg-white p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-[#6b4f3a]">{notes.length}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#81756d]">
              Notes Saved
            </p>
          </div>
          <div className="rounded-2xl border border-[#e9e1dd] bg-white p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-[#6b4f3a]">{totalQuizzes}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#81756d]">
              Quizzes Taken
            </p>
          </div>
          <div className="rounded-2xl border border-[#e9e1dd] bg-white p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-[#6b4f3a]">{totalSummaries}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#81756d]">
              Summaries
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="grid gap-6 lg:col-span-8 md:grid-cols-2">
          {cards.map((card, index) => (
            <button
              key={card.title}
              onClick={() => setActivePage(card.page)}
              className={[
                "group flex flex-col rounded-[24px] border border-[#e9e1dd] bg-white p-6 text-left shadow-[0_4px_16px_rgba(107,79,58,0.06)] transition hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(107,79,58,0.12)]",
                index === 2 ? "md:col-span-2 md:flex-row md:items-center" : "",
              ].join(" ")}
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#ffdcc4] text-3xl md:mb-0 md:mr-5">
                {card.icon}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#1e1b19]">
                  {card.title}
                </h2>
                <p className="mt-2 leading-7 text-[#4f453e]">
                  {card.description}
                </p>
                <p className="mt-6 font-bold text-[#6b4f3a]">
                  {card.button} →
                </p>
              </div>
            </button>
          ))}
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <div className="rounded-[24px] border border-[#b9ecee]/60 bg-[#b9ecee]/20 p-6 shadow-[0_4px_16px_rgba(107,79,58,0.06)]">
            <div className="mb-4 flex items-center gap-2 font-bold uppercase tracking-wider text-[#0d4447]">
              💡 Pro Tip
            </div>

            <p className="leading-8 text-[#4f453e]">
              Consistent study in small chunks works better than cramming. Try the
              <strong className="text-[#1e1b19]"> Summarize </strong>
              feature on your hardest subject today.
            </p>

            <div className="mt-8 grid h-56 place-items-center rounded-2xl bg-white shadow-inner">
              <OwlMascot mood="idle" size="lg" />
            </div>
          </div>

          {/* Recent notes preview */}
          {recentNotes.length > 0 && (
            <div className="rounded-[24px] border border-[#e9e1dd] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.06)]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#81756d]">
                Recent Notes
              </h3>
              <div className="mt-4 space-y-3">
                {recentNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActivePage("notes")}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[#fff8f5]"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#ffdcc4] text-lg">
                      {note.type === "file" ? "📄" : "📝"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1e1b19]">
                        {note.title}
                      </p>
                      <p className="truncate text-xs text-[#81756d]">
                        {note.type === "file" && note.fileSize
                          ? `${(note.fileSize / 1024).toFixed(1)} KB`
                          : `${note.content.length} characters`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
