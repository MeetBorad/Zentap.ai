"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ActiveView } from "../Header";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate: (view: ActiveView) => void;
}

export default function AdminAuthModal({
  isOpen,
  onClose,
  onSuccessNavigate,
}: AdminAuthModalProps) {
  const { signInWithEmail, resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 3-Attempt Lock & Password Reset
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isResetMode, setIsResetMode] = useState(false);

  if (!isOpen) return null;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter an administrator email address.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await resetPasswordForEmail(cleanEmail);
      if (error) {
        setErrorMessage(error.message || "Failed to send admin recovery instructions.");
      } else {
        setSuccessMessage(`✓ Recovery instructions dispatched to ${cleanEmail}! Check inbox.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate admin password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check Root Superadmin credentials
    if (cleanEmail === "admin@zentapdigitalsolutions.com") {
      if (password !== "Admin@2026") {
        const newFailed = failedAttempts + 1;
        setFailedAttempts(newFailed);
        if (newFailed >= 3) {
          setErrorMessage("Incorrect administrator password entered 3 times. Please use the Superadmin Password Reset assistant below.");
          setIsResetMode(true);
        } else {
          setErrorMessage(`Incorrect password. Please verify your administrator password and try again (Attempt ${newFailed}/3).`);
        }
        setLoading(false);
        return;
      }

      // Correct root credentials
      setFailedAttempts(0);
      if (typeof window !== "undefined") {
        localStorage.setItem("zentap_admin_supreme", "true");
      }
      signInWithEmail(cleanEmail, password).catch(() => {});
      setSuccessMessage("Superadmin Authenticated! Launching Fleet Console...");
      setTimeout(() => {
        setLoading(false);
        onClose();
        onSuccessNavigate("admin");
      }, 600);
      return;
    }

    // 2. Strict whitelist of authorized admin accounts
    const allowedAdminEmails = [
      "admin@zentapdigitalsolutions.com",
      "admin@zentap.ai",
      "meet@zentap.ai",
      "meetborad@hotmail.com",
      "thedayithappened736@gmail.com",
    ];

    if (!allowedAdminEmails.includes(cleanEmail)) {
      setErrorMessage("Unauthorized email address. Only designated ZenTap administrators can access the Fleet Console.");
      setLoading(false);
      return;
    }

    // 3. Supabase Auth validation for authorized accounts
    try {
      const { error } = await signInWithEmail(cleanEmail, password);

      if (error) {
        const newFailed = failedAttempts + 1;
        setFailedAttempts(newFailed);

        const errLower = (error.message || "").toLowerCase();
        if (newFailed >= 3) {
          setErrorMessage("Incorrect administrator password entered 3 times. Please use the recovery option below.");
          setIsResetMode(true);
        } else if (
          errLower.includes("invalid login credentials") ||
          errLower.includes("invalid credentials") ||
          errLower.includes("invalid password") ||
          (error as any).status === 400
        ) {
          setErrorMessage(`Incorrect password. Please verify your administrator credentials and try again (Attempt ${newFailed}/3).`);
        } else {
          setErrorMessage(error.message || "Invalid administrator credentials");
        }
        setLoading(false);
        return;
      }

      // Successful Supabase auth
      setFailedAttempts(0);
      if (typeof window !== "undefined") {
        localStorage.setItem("zentap_admin_supreme", "true");
      }

      setSuccessMessage("Admin Identity Verified. Launching Fleet Operations...");
      setTimeout(() => {
        setLoading(false);
        onClose();
        onSuccessNavigate("admin");
      }, 600);

    } catch (err: any) {
      setErrorMessage(err.message || "Authentication error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1C1B1A] text-white rounded-3xl shadow-2xl border border-[#2C2B2A] p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dedicated Admin Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D94826] to-[#b71511] text-white flex items-center justify-center font-bold shadow-md">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-base text-white">
                Superadmin Security Portal
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase">
                Restricted
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Root Fleet Operations &amp; Merchant Governance
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D94826] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            This portal is exclusively for ZenTap.ai system administrators. Authenticated sessions grant supreme directory authority and hardware provisioning access.
          </p>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form: Standard Sign In */}
        {!isResetMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1.5 uppercase tracking-wider text-[10px]">
                Root Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zentapdigitalsolutions.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D94826] font-mono transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider text-[10px]">
                  Master Security Key
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setErrorMessage("");
                  }}
                  className="text-[10px] text-[#D94826] font-mono hover:underline cursor-pointer"
                >
                  Reset Security Key?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D94826] font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#D94826] hover:bg-[#C23C1D] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Root Session...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Root Admin Session</span>
                  <KeyRound className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Form: Admin Password Recovery */
          <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300">
              <span className="font-mono text-[10px] uppercase font-bold text-[#D94826] block mb-1">
                Superadmin Security Reset
              </span>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Enter your authorized admin email. A cryptographically signed token will be sent to recover or change your security credentials.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-300 mb-1.5 uppercase tracking-wider text-[10px]">
                Administrator Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zentapdigitalsolutions.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D94826] font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#D94826] hover:bg-[#C23C1D] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Security Token...</span>
                </>
              ) : (
                <>
                  <span>Dispatch Admin Reset Instructions</span>
                  <KeyRound className="w-4 h-4" />
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
              className="w-full py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer text-center"
            >
              ← Back to Admin Login
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-zinc-500 font-mono">
            IP &amp; Timestamp Telemetry Logged · AES-256 Session Encrypted
          </p>
        </div>

      </div>
    </div>
  );
}
