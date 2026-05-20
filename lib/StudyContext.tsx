"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Note, HistoryItem, ToastData, Notification } from "./types";
import { supabase } from "./supabase";
import { useAuth } from "./AuthContext";

/* ────────────────────────── helpers ────────────────────────── */

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

/* ────────────────────────── context shape ────────────────────────── */

interface StudyContextValue {
  /* notes */
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  deleteNote: (id: string) => void;

  /* history */
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, "id" | "createdAt" | "relativeDate">) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;

  /* notifications */
  notifications: Notification[];
  addNotification: (message: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;

  /* toast */
  toasts: ToastData[];
  showToast: (message: string, type?: ToastData["type"]) => void;

  /* settings */
  displayName: string;
  setDisplayName: (n: string) => void;
  clearAllData: () => void;

  /* helpers */
  relativeDate: (iso: string) => string;

  /* loading state */
  isLoading: boolean;
}

const StudyContext = createContext<StudyContextValue | null>(null);

/* ────────────────────────── provider ────────────────────────── */

export function StudyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  /* ─── persistent state ─── */
  const [notes, setNotes] = useState<Note[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [displayName, setDisplayNameRaw] = useState(user?.displayName || "Student");
  const [isLoading, setIsLoading] = useState(true);

  /* ─── hydrate from Supabase after mount ─── */
  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      try {
        // Load notes (RLS filters by user automatically)
        const { data: notesData } = await supabase
          .from("notes")
          .select("*")
          .order("created_at", { ascending: false });

        if (notesData) {
          setNotes(
            notesData.map((n: Record<string, unknown>) => ({
              id: n.id as string,
              title: n.title as string,
              content: n.content as string,
              type: n.type as "text" | "file",
              fileName: n.file_name as string | undefined,
              fileSize: n.file_size as number | undefined,
              fileType: n.file_type as string | undefined,
              createdAt: n.created_at as string,
            })),
          );
        }

        // Load history
        const { data: historyData } = await supabase
          .from("history")
          .select("*")
          .order("created_at", { ascending: false });

        if (historyData) {
          setHistory(
            historyData.map((h: Record<string, unknown>) => ({
              id: h.id as string,
              type: h.type as "upload" | "summary" | "quiz" | "explain",
              title: h.title as string,
              description: h.description as string,
              content: h.content as string | undefined,
              createdAt: h.created_at as string,
            })),
          );
        }

        // Load notifications
        const { data: notifData } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (notifData) {
          setNotifications(
            notifData.map((n: Record<string, unknown>) => ({
              id: n.id as string,
              message: n.message as string,
              read: n.read as boolean,
              createdAt: n.created_at as string,
            })),
          );
        }

        // Load settings (displayName)
        const { data: settingsData } = await supabase
          .from("settings")
          .select("*")
          .eq("key", "displayName")
          .maybeSingle();

        if (settingsData?.value) {
          try {
            setDisplayNameRaw(JSON.parse(settingsData.value));
          } catch {
            setDisplayNameRaw(settingsData.value);
          }
        } else {
          // Fall back to auth metadata display name
          setDisplayNameRaw(user?.displayName || "Student");
        }
      } catch (err) {
        console.warn("Supabase load failed, using empty state:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [userId, user?.displayName]);

  /* ─── toast (ephemeral) ─── */
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastData["type"] = "success") => {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  /* ─── notes ─── */
  const addNote = useCallback(
    (note: Omit<Note, "id" | "createdAt">) => {
      const id = uid();
      const createdAt = new Date().toISOString();
      const newNote: Note = { ...note, id, createdAt };
      setNotes((prev) => [newNote, ...prev]);

      // Save to Supabase (user_id defaults to auth.uid() in DB)
      supabase
        .from("notes")
        .insert({
          id,
          title: note.title,
          content: note.content,
          type: note.type,
          file_name: note.fileName || null,
          file_size: note.fileSize || null,
          file_type: note.fileType || null,
          created_at: createdAt,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to save note to Supabase:", error);
        });

      // Add notification
      addNotificationInternal(`Note "${newNote.title}" saved`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to delete note from Supabase:", error);
      });
  }, []);

  /* ─── history ─── */
  const addHistoryItem = useCallback(
    (item: Omit<HistoryItem, "id" | "createdAt" | "relativeDate">) => {
      const id = uid();
      const createdAt = new Date().toISOString();
      const newItem: HistoryItem = { ...item, id, createdAt };
      setHistory((prev) => [newItem, ...prev]);

      // Save to Supabase
      supabase
        .from("history")
        .insert({
          id,
          type: item.type,
          title: item.title,
          description: item.description,
          content: item.content || null,
          created_at: createdAt,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to save history to Supabase:", error);
        });
    },
    [],
  );

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    supabase
      .from("history")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to delete history from Supabase:", error);
      });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    supabase
      .from("history")
      .delete()
      .neq("id", "")
      .then(({ error }) => {
        if (error) console.error("Failed to clear history in Supabase:", error);
      });
  }, []);

  /* ─── notifications ─── */
  const addNotificationInternal = (message: string) => {
    const id = uid();
    const createdAt = new Date().toISOString();
    setNotifications((prev) => [
      { id, message, read: false, createdAt },
      ...prev.slice(0, 49),
    ]);

    supabase
      .from("notifications")
      .insert({ id, message, read: false, created_at: createdAt })
      .then(({ error }) => {
        if (error) console.error("Failed to save notification to Supabase:", error);
      });
  };

  const addNotification = useCallback((message: string) => {
    addNotificationInternal(message);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to update notification in Supabase:", error);
      });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false)
      .then(({ error }) => {
        if (error) console.error("Failed to mark all read in Supabase:", error);
      });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ─── settings ─── */
  const setDisplayName = useCallback((n: string) => {
    setDisplayNameRaw(n);
    supabase
      .from("settings")
      .upsert({ key: "displayName", value: JSON.stringify(n) })
      .then(({ error }) => {
        if (error) console.error("Failed to save displayName to Supabase:", error);
      });
  }, []);

  const clearAllData = useCallback(() => {
    setNotes([]);
    setHistory([]);
    setNotifications([]);
    setDisplayNameRaw("Student");

    // Clear all Supabase tables (RLS ensures only current user's data is deleted)
    Promise.all([
      supabase.from("notes").delete().neq("id", ""),
      supabase.from("history").delete().neq("id", ""),
      supabase.from("notifications").delete().neq("id", ""),
      supabase.from("quiz_results").delete().neq("id", ""),
      supabase.from("settings").upsert({ key: "displayName", value: JSON.stringify("Student") }),
    ]).catch((err) => {
      console.error("Failed to clear Supabase data:", err);
    });
  }, []);

  /* ─── value ─── */
  const value: StudyContextValue = {
    notes,
    addNote,
    deleteNote,
    history,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
    notifications,
    addNotification,
    markNotificationRead,
    markAllRead,
    unreadCount,
    toasts,
    showToast,
    displayName,
    setDisplayName,
    clearAllData,
    relativeDate,
    isLoading,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

/* ────────────────────────── hook ────────────────────────── */

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within <StudyProvider>");
  return ctx;
}
