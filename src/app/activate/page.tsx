// app/activate/page.tsx
// Fallback portal for businesses whose tag is set to Direct Google (no ZenTap page)
// Accessible at /activate?card={code} or /activate

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  KeyRound, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  ExternalLink, 
  Clock, 
  Building2, 
  Phone, 
  Instagram, 
  QrCode,
  ArrowRight
} from "lucide-react";
import OwnerAccessModal from "@/components/modals/OwnerAccessModal";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cardParam = searchParams.get("card") || "";

  const [cardCode, setCardCode] = useState(cardParam);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (cardParam) {
      setCardCode(cardParam);
      setModalOpen(true);
    }
  }, [cardParam]);

  const handleOpenManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardCode.trim()) return;
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0e1015] text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff7a00] to-amber-500 text-black flex items-center justify-center font-black text-sm shadow-md">
            Z
          </div>
          <span className="font-headline font-bold text-lg text-white tracking-tight">
            Zen<span className="text-[#ff7a00]">Tap</span>
          </span>
        </Link>

        <span className="text-xs text-gray-400 font-mono">
          Hardware Owner Hub
        </span>
      </header>

      {/* Main Card */}
      <main className="max-w-md mx-auto w-full py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-white tracking-tight">
            Manage Your Standee or Card
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter the hardware code printed on your ZenTap standee or NFC card to manage Google Review destination, contact links, and scans.
          </p>
        </div>

        <form onSubmit={handleOpenManager} className="p-6 rounded-3xl bg-[#141720] border border-[#2a3042] shadow-2xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Card / Standee Code *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. zt-0042 or your business slug"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-sm font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400 uppercase"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Printed on the back or bottom of your physical standee / card.
            </p>
          </div>

          <button
            type="submit"
            className="tactile-btn w-full py-3 px-4 rounded-xl bg-[#ff7a00] hover:bg-[#e56d00] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform active:scale-[0.978]"
          >
            <span>Proceed to PIN Verification</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
          <p className="text-xs font-semibold text-gray-300">
            Why use /activate?
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            If your standee is set to <strong>Direct Google</strong>, tapping it automatically sends customers straight to your Google Review page. This page lets you log in with your PIN to change details or switch back to the ZenTap Smart Review Assistant anytime.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full py-4 border-t border-white/10 text-center text-xs text-gray-500">
        © 2026 ZenTap Digital Solutions. All rights reserved.
      </footer>

      {/* Owner Access Modal */}
      {cardCode.trim() && (
        <OwnerAccessModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          tagCode={cardCode.trim()}
          businessSlug={cardCode.trim()}
        />
      )}
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0e1015] flex items-center justify-center text-white">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}
