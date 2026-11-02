"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Store, Lock, Mail, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAdmin, signInWithEmail, resetPasswordForEmail } = useAuth();
  const [roleMode, setRoleMode] = useState<"merchant" | "admin">("merchant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      router.push("/?view=admin");
    } else if (user) {
      router.push("/?view=portal");
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email.toLowerCase().trim();
    const adminEmails = [
      "admin@zentapdigitalsolutions.com",
      "admin@zentap.ai",
      "meet@zentap.ai",
      "mbborad143bmb@gmail.com",
      "meetborad@hotmail.com",
    ];

    // Master superadmin bypass check
    if (adminEmails.includes(cleanEmail) && password === "Admin@2026") {
      if (typeof window !== "undefined") {
        localStorage.setItem("zentap_admin_supreme", "true");
      }
      signInWithEmail(cleanEmail, password).catch(() => {});
      setSuccessMessage("Superadmin Authenticated! Launching Console...");
      setTimeout(() => {
        router.push("/?view=admin");
      }, 500);
      return;
    }

    try {
      const { error } = await signInWithEmail(cleanEmail, password);
      if (error) {
        setErrorMessage(error.message || "Invalid credentials. Please verify your email and password.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Credentials verified! Loading your dashboard...");
      setTimeout(() => {
        if (adminEmails.includes(cleanEmail) || roleMode === "admin") {
          router.push("/?view=admin");
        } else {
          router.push("/?view=portal");
        }
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your account email address.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMessage(error.message || "Failed to dispatch password recovery link.");
      } else {
        setSuccessMessage(`Recovery link dispatched to ${email.trim()}. Please check inbox.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Could not request password recovery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,0,0.07)_0%,transparent_70%)] pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-[#141720] border border-[#232734] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-6">
        
        {/* Header Icon & Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#ff7a00]/15 border border-[#ff7a00]/30 flex items-center justify-center mx-auto shadow-inner text-[#ff7a00]">
            {roleMode === "admin" ? <ShieldCheck className="w-7 h-7" /> : <Store className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isResetMode
              ? "Reset Password"
              : roleMode === "admin"
              ? "Superadmin Portal"
              : "Merchant Dashboard"}
          </h1>
          <p className="text-xs text-zinc-400">
            {isResetMode
              ? "Enter your email to receive a password reset link"
              : roleMode === "admin"
              ? "Sign in to manage fleets, review routing, and payments"
              : "Access your business profile, review analytics, and standee controls"}
          </p>
        </div>

        {/* Role Mode Selector (Merchant vs Admin) */}
        {!isResetMode && (
          <div className="flex p-1 bg-[#0e1015] border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setRoleMode("merchant");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleMode === "merchant"
                  ? "bg-[#ff7a00] text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleMode("admin");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleMode === "admin"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Login / Reset Form */}
        {!isResetMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {roleMode === "admin" ? "Admin Email Address" : "Registered Business Email"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder={roleMode === "admin" ? "admin@zentapdigitalsolutions.com" : "owner@yourbusiness.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0e1015] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">Password</label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-[11px] text-[#ff7a00] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0e1015] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                roleMode === "admin"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[#ff7a00] hover:bg-[#e56d00] text-black"
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {roleMode === "admin" ? "Admin Console" : "Dashboard"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Account Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0e1015] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#ff7a00] text-black font-bold text-sm hover:bg-[#e56d00] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="w-full text-center text-xs text-zinc-400 hover:text-white cursor-pointer pt-2"
            >
              ← Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
