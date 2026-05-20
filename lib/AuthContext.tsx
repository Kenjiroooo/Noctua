"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";

/* ────────────────────────── types ────────────────────────── */

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  profilePicture: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfilePicture: (base64: string) => Promise<{ error: string | null }>;
  removeProfilePicture: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ────────────────────────── provider ────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapUser = (
    supaUser: {
      id: string;
      email?: string;
      user_metadata?: Record<string, string>;
    } | null,
  ): AuthUser | null => {
    if (!supaUser) return null;
    return {
      id: supaUser.id,
      email: supaUser.email || "",
      displayName:
        supaUser.user_metadata?.display_name ||
        supaUser.email?.split("@")[0] ||
        "Student",
      profilePicture: supaUser.user_metadata?.avatar_url || null,
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapUser(session?.user ?? null));
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || email.split("@")[0] },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfilePicture = useCallback(async (base64: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: base64 },
    });
    if (error) return { error: error.message };
    // Immediately update local state so UI reflects the change
    setUser((prev) => (prev ? { ...prev, profilePicture: base64 } : null));
    return { error: null };
  }, []);

  const removeProfilePicture = useCallback(async () => {
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: "" },
    });
    if (error) return { error: error.message };
    setUser((prev) => (prev ? { ...prev, profilePicture: null } : null));
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfilePicture,
        removeProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ────────────────────────── hook ────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
