/* Hallmark · macrostructure: Minimal Specimen · genre: modern-minimal · theme: tactile-obsidian */

import React from "react";
import Link from "next/link";
import { AlertCircle, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Page Unavailable | ZenTap",
  description: "This standee or card is currently unavailable or unassigned.",
};

export default function UnavailablePage() {
  const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER || "919274560880";
  const waContactUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent("Hi, I scanned a ZenTap standee/card showing 'Page Unavailable'. Can you help?")}`;

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white flex flex-col items-center justify-center p-6 text-center selection:bg-amber-500 selection:text-black font-sans">
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="font-headline font-bold text-2xl text-white tracking-tight mb-2">
          Business Profile Under Process
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          This QR Code / NFC Standee has not been activated yet or is currently being configured. The business review profile page is under process and will be live shortly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <a
            href={waContactUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.978]"
          >
            <MessageCircle className="w-4 h-4 text-black" />
            <span>Contact on WhatsApp</span>
          </a>

          <Link
            href="/"
            className="w-full py-3 px-5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold transition-all text-center"
          >
            Return to Homepage
          </Link>
        </div>

        <span className="text-[10px] text-zinc-600 font-mono mt-10">
          ZenTap Hardware &amp; Review Network
        </span>
      </div>
    </div>
  );
}
