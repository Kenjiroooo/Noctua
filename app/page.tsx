"use client";

import { useState, useRef, useEffect } from "react";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import { StudyProvider, useStudy } from "../lib/StudyContext";
import Sidebar, { PageKey } from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import UploadNotes from "../components/UploadNotes";
import Summarizer from "../components/Summarizer";
import Explain from "../components/Explain";
import QuizGenerator from "../components/QuizGenerator";
import History from "../components/History";
import ToastContainer from "../components/Toast";
import LoginPage from "../components/LoginPage";
import OwlMascot from "../components/OwlMascot";

/* ───────────────────── Image Resize Helper ───────────────────── */
function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Crop to square from center
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ───────────────────── Loading Screen ───────────────────── */
function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fff8f5]">
      <div className="loading-pulse flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#ffdcc4] to-[#f4ece9] ring-4 ring-[#6b4f3a]/10">
        <OwlMascot mood="sleeping" size="sm" />
      </div>
      <p className="text-sm font-semibold text-[#81756d]">Waking up Noctua…</p>
    </div>
  );
}

/* ───────────────────── Auth Gate ───────────────────── */
function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}

/* ───────────────────── Avatar Dropdown ───────────────────── */
function AvatarDropdown() {
  const { user, signOut, updateProfilePicture } = useAuth();
  const { showToast } = useStudy();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      return;
    }

    try {
      const base64 = await resizeImage(file, 128);
      const { error } = await updateProfilePicture(base64);
      if (error) {
        showToast("Failed to update picture: " + error, "error");
      } else {
        showToast("Profile picture updated!", "success");
      }
    } catch {
      showToast("Failed to process image.", "error");
    }

    setOpen(false);
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayName = user?.displayName || "Student";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="grid h-9 w-9 place-items-center rounded-full bg-[#6b4f3a] text-sm font-bold text-white overflow-hidden ring-2 ring-transparent transition hover:ring-[#6b4f3a]/30"
        title={displayName}
      >
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </button>

      {open && (
        <div className="animate-fade-in absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#e9e1dd] bg-white p-2 shadow-xl z-50">
          {/* User info */}
          <div className="px-3 py-2 border-b border-[#e9e1dd] mb-1">
            <p className="text-sm font-bold text-[#1e1b19] truncate">{displayName}</p>
            <p className="text-[11px] text-[#81756d] truncate">{user?.email}</p>
          </div>

          {/* Change Picture */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#4f453e] transition hover:bg-[#faf2ee]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ece9] text-xs">
              📷
            </span>
            Change Picture
          </button>

          {/* Log Out */}
          <button
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            Log Out
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

/* ───────────────────── Notification Dropdown ───────────────────── */
function NotificationDropdown({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notifications, markNotificationRead, markAllRead, unreadCount, relativeDate } =
    useStudy();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="animate-fade-in absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[#e9e1dd] bg-white p-4 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-[#e9e1dd] pb-3">
        <h3 className="font-bold text-[#1e1b19]">
          Notifications{" "}
          {unreadCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-[#6b4f3a] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#81756d]">
            No notifications yet.
          </p>
        ) : (
          notifications.slice(0, 15).map((n) => (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={[
                "flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-[#fff8f5]",
                !n.read ? "bg-[#faf2ee]" : "",
              ].join(" ")}
            >
              {!n.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6b4f3a] animate-pulse-dot" />
              )}
              <div className="min-w-0 flex-1">
                <p className={["text-sm", !n.read ? "font-semibold" : ""].join(" ")}>
                  {n.message}
                </p>
                <p className="mt-0.5 text-xs text-[#81756d]">
                  {relativeDate(n.createdAt)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ───────────────────── Settings Panel ───────────────────── */
function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { displayName, setDisplayName, clearAllData, showToast, notes, history } =
    useStudy();
  const { user, signOut } = useAuth();
  const [nameInput, setNameInput] = useState(displayName);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setNameInput(displayName);
  }, [displayName, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-fade-in w-full max-w-md rounded-[24px] border border-[#e9e1dd] bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e9e1dd] pb-4">
          <h2 className="text-2xl font-bold text-[#1e1b19]">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-xl text-[#81756d] transition hover:bg-[#f4ece9]"
          >
            ✕
          </button>
        </div>

        {/* Logged in as */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f4ece9] p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#6b4f3a] text-sm font-bold text-white overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
            ) : (
              (user?.displayName || displayName).charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#1e1b19] truncate">{displayName}</p>
            <p className="text-xs text-[#81756d] truncate">{user?.email}</p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              showToast("Signed out!", "info");
            }}
            className="shrink-0 rounded-xl border border-[#d3c4ba] px-3 py-1.5 text-xs font-bold text-[#6b4f3a] transition hover:bg-[#6b4f3a] hover:text-white"
          >
            Sign Out
          </button>
        </div>

        {/* Display name */}
        <div className="mt-6">
          <label className="text-sm font-bold uppercase tracking-wider text-[#4f453e]">
            Display Name
          </label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 rounded-xl border border-[#d3c4ba] bg-[#faf2ee] px-4 py-2.5 text-sm outline-none transition focus:border-[#6b4f3a] focus:ring-2 focus:ring-[#6b4f3a]/20"
            />
            <button
              onClick={() => {
                if (nameInput.trim()) {
                  setDisplayName(nameInput.trim());
                  showToast("Name updated!", "success");
                }
              }}
              className="rounded-xl bg-[#6b4f3a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#513825]"
            >
              Save
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 rounded-2xl bg-[#faf2ee] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#81756d]">
            Storage
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-black text-[#6b4f3a]">{notes.length}</p>
              <p className="text-xs text-[#81756d]">Notes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-[#6b4f3a]">{history.length}</p>
              <p className="text-xs text-[#81756d]">History Items</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-red-500">
            Danger Zone
          </p>
          {confirmClear ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-red-600">Delete everything?</span>
              <button
                onClick={() => {
                  clearAllData();
                  setConfirmClear(false);
                  showToast("All data cleared.", "info");
                }}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#4f453e]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="mt-3 text-sm font-semibold text-red-500 hover:underline"
            >
              Clear all data & reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Main App ───────────────────── */
function AppContent() {
  const { displayName, unreadCount } = useStudy();
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* Use auth displayName as the "real" name — it's always correct */
  const realName = user?.displayName || displayName;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard setActivePage={setActivePage} />;
      case "notes":
        return <UploadNotes />;
      case "summarizer":
        return <Summarizer />;
      case "explain":
        return <Explain />;
      case "quiz":
        return <QuizGenerator />;
      case "history":
        return <History />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  const pageTitle: Record<PageKey, string> = {
    dashboard: "Deep Learning Mode",
    notes: "My Notes",
    summarizer: "Summarizer",
    explain: "Explain (ELI5)",
    quiz: "Quiz Generator",
    history: "History",
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1e1b19]">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e9e1dd] bg-[#fff8f5]/95 px-5 backdrop-blur md:px-10">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-[#6b4f3a] hover:bg-[#f4ece9] md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect y="3" width="20" height="2" rx="1" />
                <rect y="9" width="20" height="2" rx="1" />
                <rect y="15" width="20" height="2" rx="1" />
              </svg>
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#81756d]">
                Noctua
              </p>
              <h1 className="text-lg font-bold text-[#6b4f3a]">
                {pageTitle[activePage]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setSettingsOpen(false);
                }}
                className="relative rounded-full p-2 text-[#6b4f3a] hover:bg-[#f4ece9]"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse-dot">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
              />
            </div>

            {/* Settings */}
            <button
              onClick={() => {
                setSettingsOpen(true);
                setNotifOpen(false);
              }}
              className="rounded-full p-2 text-[#6b4f3a] hover:bg-[#f4ece9]"
            >
              ⚙️
            </button>

            {/* User avatar with dropdown */}
            <AvatarDropdown />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-10 md:py-12">
          {renderPage()}
        </main>
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
