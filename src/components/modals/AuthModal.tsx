"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  Store, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Building2,
  User as UserIcon
} from "lucide-react";
import { ActiveView } from "../Header";
import { useAuth } from "@/context/AuthContext";
import { getUserBusiness } from "@/lib/businessStore";
import { upsertUserBusinessInDb } from "@/lib/supabase/service";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
  onSuccessNavigate: (view: ActiveView) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "signin",
  onSuccessNavigate,
}: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authSuccessMessage, setAuthSuccessMessage] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMessage("");
    setAuthSuccessMessage("");
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

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

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (activeTab === "signin") {
        const { error } = await signInWithEmail(cleanEmail, password);
        if (error) {
          const errLower = (error.message || "").toLowerCase();
          if (
            errLower.includes("invalid login credentials") ||
            errLower.includes("invalid credentials") ||
            errLower.includes("invalid password") ||
            errLower.includes("incorrect") ||
            (error as any).status === 400
          ) {
            setErrorMessage("Incorrect password or email. Please verify your password and try again.");
          } else {
            setErrorMessage(error.message || "Failed to sign in. Please verify your credentials.");
          }
          setLoading(false);
          return;
        }

        // Clean user session -> Strictly directed to Client Merchant Portal
        if (typeof window !== "undefined") {
          localStorage.removeItem("zentap_admin_supreme");
        }

        setAuthSuccessMessage("Sign in successful! Loading your Business Dashboard...");
        setTimeout(() => {
          setLoading(false);
          onClose();
          onSuccessNavigate("portal");
        }, 500);

      } else {
        // Merchant Sign Up
        const { error, requiresEmailConfirmation } = await signUpWithEmail(
          cleanEmail,
          password,
          { full_name: fullName, business_name: businessName }
        );

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("zentap_admin_supreme");
        }

        // Initialize business profile immediately in store
        const newBiz = getUserBusiness(cleanEmail, cleanEmail, businessName || fullName);

        // Asynchronously persist initial business record to Supabase
        upsertUserBusinessInDb({
          id: newBiz.id,
          owner_user_id: cleanEmail,
          slug: newBiz.slug,
          name: newBiz.name,
          email: cleanEmail,
          payment_status: "pending",
          active: true,
        }).catch((e) => console.warn("Supabase initial business sync notice:", e));

        if (requiresEmailConfirmation) {
          setAuthSuccessMessage(
            "Account created! Please check your email inbox to confirm your registration."
          );
          setLoading(false);
          setTimeout(() => {
            onClose();
            onSuccessNavigate("portal");
          }, 1200);
        } else {
          setAuthSuccessMessage("Account created! Accessing your business dashboard...");
          setTimeout(() => {
            setLoading(false);
            onClose();
            onSuccessNavigate("portal");
          }, 500);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF9F6] rounded-3xl shadow-2xl border border-[#E2DFD8] p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2DFD8] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C1B1A] text-white flex items-center justify-center font-headline font-bold text-lg shadow-sm">
              <Store className="w-5 h-5 text-[#D94826]" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A]">
                Client Merchant Portal
              </h3>
              <p className="text-[11px] text-[#615E5B]">
                Access your business profile &amp; standee controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2F0EB] hover:bg-[#E2DFD8] flex items-center justify-center text-[#615E5B] hover:text-[#1C1B1A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: ONLY Sign In and Register */}
        <div className="grid grid-cols-2 p-1 bg-[#F2F0EB] rounded-2xl mb-5 border border-[#E2DFD8]">
          <button
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage("");
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "signin"
                ? "bg-[#1C1B1A] text-white shadow-sm"
                : "text-[#615E5B] hover:text-[#1C1B1A]"
            }`}
          >
            Merchant Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setErrorMessage("");
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-[#1C1B1A] text-white shadow-sm"
                : "text-[#615E5B] hover:text-[#1C1B1A]"
            }`}
          >
            Register Business
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {authSuccessMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{authSuccessMessage}</span>
          </div>
        )}

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-50 border border-[#E2DFD8] text-xs font-semibold text-[#1C1B1A] transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#E2DFD8]"></div>
          <span className="flex-shrink mx-3 text-[10px] text-[#615E5B] uppercase font-mono tracking-wider">
            Or with business email
          </span>
          <div className="flex-grow border-t border-[#E2DFD8]"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === "signup" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#615E5B]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                  Registered Business Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#615E5B]" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Copper Kettle Roasters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
              Business Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#615E5B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@yourbusiness.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#615E5B]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1C1B1A] hover:bg-[#2C2B2A] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>
                  {activeTab === "signin"
                    ? "Open Merchant Dashboard"
                    : "Create Business Account"}
                </span>
                <ArrowRight className="w-4 h-4 text-[#D94826]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#E2DFD8] text-center">
          <p className="text-[11px] text-[#615E5B]">
            {activeTab === "signin" ? (
              <>
                Don&apos;t have a business account yet?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="font-bold text-[#D94826] hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already registered with ZenTap?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="font-bold text-[#D94826] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
