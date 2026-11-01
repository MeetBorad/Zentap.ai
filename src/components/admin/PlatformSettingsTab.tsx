// src/components/admin/PlatformSettingsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Lock, 
  KeyRound, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Save, 
  AlertTriangle,
  RotateCcw,
  Clock,
  Database
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AiModelManagerTab from "./AiModelManagerTab";

interface PlatformSettingsTabProps {
  showToast: (msg: string) => void;
  onOpenPasswordModal: () => void;
}

export default function PlatformSettingsTab({ showToast, onOpenPasswordModal }: PlatformSettingsTabProps) {
  const { user } = useAuth();

  const [adminWhatsapp, setAdminWhatsapp] = useState("919274560880");
  const [siteDomain, setSiteDomain] = useState("https://zentap.in");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [subTab, setSubTab] = useState<"general" | "ai_models">("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wa = localStorage.getItem("zentap_admin_whatsapp");
      if (wa) setAdminWhatsapp(wa);
      const dom = localStorage.getItem("zentap_site_domain");
      if (dom) setSiteDomain(dom);
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("zentap_admin_whatsapp", adminWhatsapp.trim().replace(/\D/g, ""));
      localStorage.setItem("zentap_site_domain", siteDomain.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    showToast("✓ Platform settings saved successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      
      {/* Page Title & Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-headline font-bold text-zinc-900">
            Super Admin Settings
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure system endpoints, AI generation engine &amp; failover, and hardware routing.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-200/80 rounded-2xl text-xs font-bold text-zinc-600">
          <button
            type="button"
            onClick={() => setSubTab("general")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              subTab === "general"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900"
            }`}
          >
            General Platform
          </button>
          <button
            type="button"
            onClick={() => setSubTab("ai_models")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === "ai_models"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Models &amp; Failover</span>
          </button>
        </div>
      </div>

      {subTab === "ai_models" ? (
        <AiModelManagerTab showToast={showToast} />
      ) : (
        <>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>✓ Settings saved and applied across routing!</span>
        </div>
      )}

      {/* Card 1: Core Routing & Communications */}
      <form onSubmit={handleSaveSettings} className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Hardware Links &amp; WhatsApp Master Routing
            </h3>
            <p className="text-xs text-zinc-500">
              Root configuration for all physical QR and NFC standee codes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Super Admin WhatsApp Dispatch Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400 font-bold">+</span>
              <input
                type="text"
                required
                value={adminWhatsapp}
                onChange={(e) => setAdminWhatsapp(e.target.value)}
                placeholder="919274560880"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Used for "Order on WhatsApp", owner PIN recovery, and direct notifications.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Permanent Tag Domain Base
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={siteDomain}
                onChange={(e) => setSiteDomain(e.target.value)}
                placeholder="https://zentap.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Base URL encoded into physical NFC chips and printed QR stickers ({siteDomain}/t/zt-XXXX).
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
          >
            <Save className="w-3.5 h-3.5 text-white" />
            <span>Save Platform Settings</span>
          </button>
        </div>
      </form>

      {/* Card 2: Security & Lockout Rules */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Card Owner PIN Security &amp; Lockout Rules
            </h3>
            <p className="text-xs text-zinc-500">
              Tamper protection and anti-brute force mechanisms for physical hardware.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-700 font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Lockout Threshold</span>
            </div>
            <p className="font-mono text-base font-bold text-zinc-900">5 Attempts</p>
            <p className="text-[10px] text-zinc-400">Card locks for 30 minutes on 5 consecutive wrong PINs.</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-700 font-bold">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Session Expiry</span>
            </div>
            <p className="font-mono text-base font-bold text-zinc-900">15 Minutes</p>
            <p className="text-[10px] text-zinc-400">Owner panels expire automatically after 15 minutes of inactivity.</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>PIN Storage</span>
            </div>
            <p className="font-mono text-base font-bold text-zinc-900">SHA-256 Hashed</p>
            <p className="text-[10px] text-zinc-400">Zero plaintext PIN storage. Uniform error message on failure.</p>
          </div>
        </div>

        {/* Database & Purge Safeguard */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-zinc-600" />
              <span>Database Engine &amp; Safeguards</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
              Supabase PostgreSQL RLS Active
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            <strong>Purge Safeguard:</strong> The database function <code className="font-mono text-zinc-900">purge_business()</code> strictly refuses deletion if any physical standee or card is currently assigned. Standees must be released first.
          </p>
        </div>
      </div>

      {/* Card 3: Root Superadmin Master Password */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-zinc-900">
                Root Superadmin Credentials
              </h3>
              <p className="text-xs text-zinc-500">
                Logged in as: <span className="font-mono font-semibold text-zinc-800">{user?.email || "admin@zentapdigitalsolutions.com"}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPasswordModal}
            className="tactile-btn px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm"
          >
            Update Admin Password
          </button>
        </div>
      </div>
      </>
      )}

    </div>
  );
}
