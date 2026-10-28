"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Lock, 
  Mail, 
  Shield, 
  Check, 
  ArrowRight, 
  Store, 
  KeyRound, 
  Sparkles, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { ActiveView } from "../Header";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup" | "admin";
  onSuccessNavigate: (view: ActiveView) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "signin",
  onSuccessNavigate,
}: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, user } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "admin">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authSuccessMessage, setAuthSuccessMessage] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMessage("");
    setAuthSuccessMessage("");
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleDemoAutofill = (type: "merchant" | "admin") => {
    setErrorMessage("");
    if (type === "merchant") {
      setActiveTab("signin");
      setEmail("demo@zentap.ai");
      setPassword("demo12345");
    } else {
      setActiveTab("admin");
      setEmail("root@zentap.ai");
      setPassword("master_auth_key_2026");
      setTotpCode("849 201");
    }
  };

  // Google SSO Handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Google sign in");
      setLoading(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setAuthSuccessMessage("");

    try {
      if (activeTab === "signin") {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        setAuthSuccessMessage("Sign In Successful! Redirecting to Merchant Portal...");
        setTimeout(() => {
          setLoading(false);
          onClose();
          onSuccessNavigate("portal");
        }, 800);

      } else if (activeTab === "signup") {
        const { error, requiresEmailConfirmation } = await signUpWithEmail(
          email,
          password,
          { full_name: fullName, business_name: businessName }
        );

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (requiresEmailConfirmation) {
          setAuthSuccessMessage(
            "Account created! Please check your email inbox to confirm your registration."
          );
          setLoading(false);
        } else {
          setAuthSuccessMessage("Account created! Accessing your merchant portal...");
          setTimeout(() => {
            setLoading(false);
            onClose();
            onSuccessNavigate("portal");
          }, 1000);
        }

      } else if (activeTab === "admin") {
        // Superadmin simulation / verification
        setTimeout(() => {
          setLoading(false);
          setAuthSuccessMessage("Root Session Verified. Redirecting to Fleet Master Console...");
          setTimeout(() => {
            onClose();
            onSuccessNavigate("admin");
          }, 800);
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-variant/40 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-variant/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-lg shadow-sm">
              Z
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                ZenTap Cloud Access
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Email &amp; Google SSO Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 mb-5 text-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            Quick Demo:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleDemoAutofill("merchant")}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-[11px] font-medium text-zinc-800 border border-zinc-200 transition-colors cursor-pointer"
            >
              Autofill Merchant
            </button>
            <button
              onClick={() => handleDemoAutofill("admin")}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-medium text-white transition-colors cursor-pointer"
            >
              Autofill Admin
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-1 bg-surface-container-low rounded-2xl mb-5 border border-surface-variant/30">
          <button
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage("");
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "signin"
                ? "bg-surface-container-lowest text-secondary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setErrorMessage("");
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-surface-container-lowest text-secondary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Create Trial
          </button>
          <button
            onClick={() => {
              setActiveTab("admin");
              setErrorMessage("");
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "admin"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2 border border-red-200 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {authSuccessMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{authSuccessMessage}</span>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          
          {/* Tab 1: Sign In */}
          {activeTab === "signin" && (
            <>
              {/* Google SSO Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors text-xs font-semibold text-on-surface cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-0.5">
                <div className="flex-grow border-t border-surface-variant/40" />
                <span className="px-3 text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  or sign in with email
                </span>
                <div className="flex-grow border-t border-surface-variant/40" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@urbanbistro.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-on-surface">Password</label>
                  <a href="#forgot" className="text-[11px] text-secondary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Merchant Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {/* Tab 2: Create Account / Free Trial */}
          {activeTab === "signup" && (
            <>
              {/* Google Signup Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors text-xs font-semibold text-on-surface cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Sign Up with Google</span>
              </button>

              <div className="flex items-center my-0.5">
                <div className="flex-grow border-t border-surface-variant/40" />
                <span className="px-3 text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  or register with email
                </span>
                <div className="flex-grow border-t border-surface-variant/40" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Connor"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Cafe Milano"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@cafemilano.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>14-day free pilot • No credit card required • Instant Standee setup</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 px-4 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Start 14-Day Free Pilot</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {/* Tab 3: Superadmin */}
          {activeTab === "admin" && (
            <>
              <div className="p-3.5 rounded-2xl bg-primary text-on-primary flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-tertiary-fixed" />
                  <div>
                    <span className="text-xs font-bold block text-white">
                      Fleet Master Superadmin
                    </span>
                    <span className="text-[10px] text-on-primary-container">
                      Hardware Provisioning &amp; Routing
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-mono text-tertiary-fixed font-bold uppercase">
                  Root
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Root Admin Identifier
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="root@zentap.ai"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Master Security Key
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  2FA TOTP Code (6 Digits)
                </label>
                <input
                  type="text"
                  maxLength={7}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="849 201"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-mono font-bold tracking-widest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Root Session</span>
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
