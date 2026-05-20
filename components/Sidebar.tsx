"use client";

import { useStudy } from "../lib/StudyContext";
import { useAuth } from "../lib/AuthContext";
import OwlMascot from "./OwlMascot";

export type PageKey =
  | "dashboard"
  | "notes"
  | "summarizer"
  | "explain"
  | "quiz"
  | "history";

type SidebarProps = {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const navItems: {
  id: PageKey;
  label: string;
  icon: string;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "notes", label: "My Notes", icon: "✎" },
  { id: "summarizer", label: "Summarize", icon: "📖" },
  { id: "explain", label: "Explain (ELI5)", icon: "💬" },
  { id: "quiz", label: "Quiz Generator", icon: "❔" },
  { id: "history", label: "History", icon: "↺" },
];

export default function Sidebar({
  activePage,
  setActivePage,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const { showToast, addHistoryItem, addNotification } = useStudy();
  const { signOut, user } = useAuth();

  const handleNewSession = () => {
    addHistoryItem({
      type: "upload",
      title: "New Study Session",
      description: "Started a fresh study session.",
    });
    addNotification("New study session started!");
    showToast("New study session started!", "success");
    setActivePage("notes");
    setMobileOpen(false);
  };

  const handleNav = (id: PageKey) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  const tips = [
    "Review small chunks daily instead of cramming everything at once.",
    "Teaching what you learn to someone else is the best way to retain it.",
    "Take short breaks every 25 minutes to stay focused.",
    "Use active recall — test yourself instead of re-reading.",
    "Relate new information to things you already know.",
  ];
  const tip = tips[Math.floor(Date.now() / 86400000) % tips.length];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[#e9e1dd] bg-white px-4 py-6 shadow-[4px_0_16px_rgba(107,79,58,0.04)] transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[#ffdcc4] ring-2 ring-[#6b4f3a]/15 overflow-hidden">
            <OwlMascot mood="idle" size="sm" />
          </div>

          <div>
            <h2 className="text-lg font-black leading-tight text-[#6b4f3a]">
              Noctua
            </h2>
            <p className="text-xs font-medium text-[#81756d]">
              Your AI Study Buddy
            </p>
          </div>
        </div>

        <button
          onClick={handleNewSession}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6b4f3a] px-4 py-3 text-sm font-bold text-white shadow-[0_3px_0_rgba(81,56,37,0.9)] transition hover:bg-[#513825] active:translate-y-[2px] active:shadow-none"
        >
          <span>＋</span>
          New Study Session
        </button>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const active = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition",
                  active
                    ? "border-r-4 border-[#6b4f3a] bg-[#f4ece9] text-[#6b4f3a]"
                    : "text-[#81756d] hover:bg-[#fff8f5] hover:text-[#6b4f3a]",
                ].join(" ")}
              >
                <span className="w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User & Sign Out */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#e9e1dd] bg-[#faf2ee] p-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#6b4f3a] text-xs font-bold text-white overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
            ) : (
              (user?.displayName || "S").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#1e1b19]">
              {user?.displayName}
            </p>
            <p className="truncate text-[10px] text-[#81756d]">{user?.email}</p>
          </div>
          <button
            onClick={async () => {
              await signOut();
            }}
            className="shrink-0 rounded-lg p-1.5 text-[#81756d] transition hover:bg-[#e9e1dd] hover:text-[#6b4f3a]"
            title="Sign Out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <div className="rounded-2xl bg-[#fff8f5] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#81756d]">
            Noctua Tip
          </p>
          <p className="mt-2 text-sm leading-6 text-[#4f453e]">{tip}</p>
        </div>
      </aside>
    </>
  );
}
