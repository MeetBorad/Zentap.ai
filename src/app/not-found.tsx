import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag, Radio } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 text-zinc-900 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/80 shadow-xl text-center space-y-6">
        {/* Error Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto shadow-inner">
          <Radio className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#B91C1C]">
            Error 404 · Touchpoint Missing
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed font-sans">
            The link you tapped may have expired, or this merchant touchpoint has been repositioned.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3.5 px-4 rounded-xl bg-[#1C1B1A] text-white hover:bg-[#2C2B2A] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to ZenTap Homepage</span>
          </Link>

          <Link
            href="/?view=pricing"
            className="w-full py-3 px-4 rounded-xl bg-zinc-100 text-zinc-800 hover:bg-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View NFC Standees &amp; Pricing</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-zinc-100 text-[11px] font-mono text-zinc-400">
          ZenTap Digital Solutions · Tactile NFC &amp; Dynamic QR Solutions
        </div>
      </div>
    </main>
  );
}
