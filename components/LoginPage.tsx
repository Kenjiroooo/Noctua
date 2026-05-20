"use client";

import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import OwlMascot from "./OwlMascot";

type Mode = "login" | "signup";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error);
      } else {
        setSuccess("Account created successfully! You can now log in.");
        setMode("login");
        setPassword("");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Floating background orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Card */}
      <div className="login-card relative z-10 w-full max-w-md">
        <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(107,79,58,0.12)] backdrop-blur-xl sm:p-10">
          {/* Owl + Branding */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#ffdcc4] to-[#f4ece9] ring-4 ring-[#6b4f3a]/10">
              <OwlMascot mood="idle" size="sm" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#6b4f3a]">
              Noctua
            </h1>
            <p className="mt-1 text-sm font-medium text-[#81756d]">
              Your AI Study Companion
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="mb-6 flex rounded-2xl bg-[#f4ece9] p-1">
            <button
              onClick={() => switchMode("login")}
              className={[
                "flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-300",
                mode === "login"
                  ? "bg-white text-[#6b4f3a] shadow-sm"
                  : "text-[#81756d] hover:text-[#6b4f3a]",
              ].join(" ")}
            >
              Log In
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={[
                "flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-300",
                mode === "signup"
                  ? "bg-white text-[#6b4f3a] shadow-sm"
                  : "text-[#81756d] hover:text-[#6b4f3a]",
              ].join(" ")}
            >
              Sign Up
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="animate-fade-in mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="animate-fade-in mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (signup only) */}
            {mode === "signup" && (
              <div className="animate-fade-in">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4f453e]">
                  Display Name
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#81756d]">
                    👤
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="What should we call you?"
                    className="w-full rounded-xl border border-[#d3c4ba] bg-[#faf2ee]/60 py-3 pl-11 pr-4 text-sm text-[#1e1b19] outline-none transition-all placeholder:text-[#b3a69d] focus:border-[#6b4f3a] focus:bg-white focus:ring-2 focus:ring-[#6b4f3a]/20"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4f453e]">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#81756d]">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#d3c4ba] bg-[#faf2ee]/60 py-3 pl-11 pr-4 text-sm text-[#1e1b19] outline-none transition-all placeholder:text-[#b3a69d] focus:border-[#6b4f3a] focus:bg-white focus:ring-2 focus:ring-[#6b4f3a]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4f453e]">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#81756d]">
                  🔒
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "Enter your password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="w-full rounded-xl border border-[#d3c4ba] bg-[#faf2ee]/60 py-3 pl-11 pr-12 text-sm text-[#1e1b19] outline-none transition-all placeholder:text-[#b3a69d] focus:border-[#6b4f3a] focus:bg-white focus:ring-2 focus:ring-[#6b4f3a]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-sm text-[#81756d] transition hover:text-[#6b4f3a]"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={[
                "relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-[0_4px_0_rgba(81,56,37,0.9)] transition-all",
                loading
                  ? "cursor-not-allowed bg-[#81756d] shadow-none"
                  : "bg-[#6b4f3a] hover:bg-[#513825] active:translate-y-[2px] active:shadow-none",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  {mode === "login" ? "Logging in…" : "Creating account…"}
                </>
              ) : mode === "login" ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-[#81756d]">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => switchMode("signup")}
                  className="font-bold text-[#6b4f3a] hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="font-bold text-[#6b4f3a] hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Subtle branding */}
        <p className="mt-4 text-center text-[11px] font-medium text-[#81756d]/60">
          🦉 Powered by Noctua · Localhost Edition
        </p>
      </div>
    </div>
  );
}
