"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAdmin, signInWithEmail, resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("zentap_admin_expired") === "true") {
        setErrorMessage("Your administrative session expired due to inactivity. Please log in again to resume.");
        localStorage.removeItem("zentap_admin_expired");
      }
    }
    if (isAdmin) {
      router.push("/?view=admin");
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email.toLowerCase().trim();
    const allowedAdminList = [
      "admin@zentapdigitalsolutions.com",
      "admin@zentap.ai",
      "meet@zentap.ai",
      "mbborad143bmb@gmail.com",
      "meetborad@hotmail.com",
    ];

    // 1. Direct root superadmin master bypass
    if (allowedAdminList.includes(cleanEmail) && password === "Admin@2026") {
      if (typeof window !== "undefined") {
        localStorage.setItem("zentap_admin_supreme", "true");
        localStorage.setItem("zentap_admin_last_active", Date.now().toString());
        localStorage.removeItem("zentap_admin_expired");
      }
      signInWithEmail(cleanEmail, password).catch(() => {});
      setSuccessMessage("Superadmin Authenticated! Opening Fleet Console...");
      setTimeout(() => {
        router.push("/?view=admin");
      }, 500);
      return;
    }

    // 2. Standard Supabase admin authentication
    try {
      const { error } = await signInWithEmail(cleanEmail, password);
      if (error) {
        setErrorMessage(error.message || "Invalid administrative credentials.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("zentap_admin_supreme", "true");
        localStorage.setItem("zentap_admin_last_active", Date.now().toString());
        localStorage.removeItem("zentap_admin_expired");
      }

      setSuccessMessage("Credentials verified. Launching Fleet Console...");
      setTimeout(() => {
        router.push("/?view=admin");
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during administrative login.");
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your administrator email.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMessage(error.message || "Failed to dispatch recovery link.");
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
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,0,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Return to Home link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to ZenTap Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md rounded-3xl bg-[#141720] border border-[#232734] shadow-2xl p-8 relative z-10">
        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#232734]">
          <div className="w-12 h-12 rounded-2xl bg-[#ff7a00]/10 border border-[#ff7a00]/30 flex items-center justify-center text-[#ff7a00] flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-white tracking-tight">Super Admin Portal</h1>
            <p className="text-xs text-zinc-400">Fleet Control &amp; Standee Deployment</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {!isResetMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-mono uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zentapdigitalsolutions.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1015] border border-[#2d3345] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
                  Admin Master Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-[11px] text-[#ff7a00] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1015] border border-[#2d3345] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tactile-btn w-full mt-2 py-3 rounded-xl bg-[#ff7a00] hover:bg-[#e56d00] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-[0.978] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Super Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-xs text-zinc-400 mb-3">
              Enter your registered administrator email to receive password recovery instructions.
            </p>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-mono uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zentapdigitalsolutions.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1015] border border-[#2d3345] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="w-1/2 py-2.5 rounded-xl bg-[#1e2230] hover:bg-[#252b3d] text-zinc-300 text-xs font-semibold"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#e56d00] text-black font-bold text-xs"
              >
                Send Link
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-[#232734] text-center">
          <p className="text-[11px] text-zinc-400">
            For ordering new standees,{" "}
            <a
              href="https://wa.me/919274560880?text=Hi,%20I%20want%20to%20order%20a%20ZenTap%20standee"
              target="_blank"
              rel="noreferrer"
              className="text-[#25D366] hover:underline font-semibold"
            >
              Order on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
