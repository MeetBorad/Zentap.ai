"use client";

import React from "react";
import { Radio, QrCode, Sparkles, Check, ShieldCheck } from "lucide-react";

interface StandeeVisualProps {
  type: "card_500" | "standee_1500" | "standee_auto_2000";
  businessName?: string;
  className?: string;
}

export default function StandeeVisual({ type, businessName = "YOUR BUSINESS", className = "" }: StandeeVisualProps) {
  const displayBiz = businessName.toUpperCase();

  if (type === "card_500") {
    // Smart NFC & Dynamic QR Card (Wallet / Pocket Card Format)
    return (
      <div className={`relative w-full aspect-[1.586/1] max-w-sm rounded-2xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-black p-5 shadow-2xl border border-zinc-700/60 overflow-hidden text-white flex flex-col justify-between ${className}`}>
        {/* Subtle metallic reflection */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Card Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block leading-tight">
                Smart NFC Review Card
              </span>
              <span className="text-xs font-bold text-white tracking-wide">
                ZenTap TapCard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono text-zinc-300">
            <span>NTAG216</span>
          </div>
        </div>

        {/* Business Center Label */}
        <div className="relative z-10 my-auto py-2">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest block mb-0.5">
            Verified Partner
          </span>
          <h4 className="font-headline font-black text-lg text-white tracking-tight truncate drop-shadow">
            {displayBiz}
          </h4>
        </div>

        {/* Card Footer: Tap Chip & QR Visual */}
        <div className="flex items-end justify-between relative z-10 pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Radio className="w-3 h-3 text-emerald-400" />
            </div>
            <span>Tap with Phone or Scan QR</span>
          </div>

          <div className="w-10 h-10 rounded-lg bg-white p-1 shadow flex items-center justify-center">
            <QrCode className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "standee_1500") {
    // Customized Designed Acrylic Standee with NFC & QR
    return (
      <div className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#181822] via-[#12121A] to-[#0A0A0F] p-6 shadow-2xl border-2 border-[#D4AF37]/50 overflow-hidden text-white flex flex-col items-center text-center ${className}`}>
        {/* Luxury Gold Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Standee Top Finial / Logo */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3A0C13] to-[#120306] border border-[#D4AF37] flex items-center justify-center text-[#F7E7A9] shadow-[0_0_20px_rgba(212,175,55,0.4)] mb-3">
          <Sparkles className="w-7 h-7" />
        </div>

        <span className="text-[10px] uppercase font-bold tracking-widest text-[#F7E7A9] mb-1">
          Review Us On Google
        </span>

        <h4 className="font-serif font-black text-lg sm:text-xl text-white tracking-wide truncate max-w-full mb-1">
          {displayBiz}
        </h4>

        <div className="flex items-center gap-1 text-[#FFB800] text-sm my-1">
          {"★".repeat(5)}
        </div>

        {/* Standee NFC Waveform target */}
        <div className="my-4 p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/30 flex flex-col items-center justify-center w-full max-w-[220px] shadow-inner relative group">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/60 flex items-center justify-center text-[#F7E7A9] mb-2 animate-pulse">
            <Radio className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">
            TAP PHONE HERE
          </span>
          <span className="text-[9px] text-[#F7E7A9]/80 mt-0.5">
            Instant 5-Star AI Review
          </span>
        </div>

        {/* Bottom QR Code */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/10 w-full justify-between">
          <div className="text-left">
            <span className="text-[10px] text-gray-400 block font-medium">Or scan camera:</span>
            <span className="text-xs font-bold text-white">Dynamic Smart QR</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white p-1 shadow flex items-center justify-center">
            <QrCode className="w-10 h-10 text-black" />
          </div>
        </div>

        {/* Standee Acrylic Base */}
        <div className="w-full h-3 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 rounded-full mt-4 shadow-md border border-white/20" />
      </div>
    );
  }

  // standee_auto_2000: Brushed Brass Edition + Auto Reply
  return (
    <div className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#221B12] via-[#16120C] to-[#0D0A07] p-6 shadow-2xl border-2 border-amber-400/60 overflow-hidden text-white flex flex-col items-center text-center ${className}`}>
      {/* Luxury Brass Glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

      {/* Premium Badge */}
      <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-200 mb-2">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>PREMIUM AUTO-REPLY EDITION</span>
      </div>

      <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 border-2 border-amber-300 flex items-center justify-center text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.5)] mb-3">
        <Sparkles className="w-7 h-7" />
      </div>

      <h4 className="font-serif font-black text-lg sm:text-xl text-amber-100 tracking-wide truncate max-w-full mb-1">
        {displayBiz}
      </h4>

      <p className="text-[11px] text-amber-300/90 font-medium mb-1">
        Custom Laser-Branded Heavy Brushed Brass
      </p>

      <div className="flex items-center gap-1 text-amber-400 text-sm my-1">
        {"★".repeat(5)}
      </div>

      {/* Target Zone */}
      <div className="my-4 p-4 rounded-2xl bg-black/60 border border-amber-400/40 flex flex-col items-center justify-center w-full max-w-[220px] shadow-inner relative">
        <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/70 flex items-center justify-center text-amber-300 mb-2 animate-pulse">
          <Radio className="w-6 h-6 text-amber-400" />
        </div>
        <span className="text-xs font-bold text-white tracking-wide">
          TAP PHONE HERE
        </span>
        <span className="text-[9px] text-amber-300/80 mt-0.5">
          AI Review + Auto Sync
        </span>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center gap-3 pt-3 border-t border-amber-400/20 w-full justify-between">
        <div className="text-left">
          <span className="text-[10px] text-amber-300/70 block font-medium">Laser Engraved:</span>
          <span className="text-xs font-bold text-amber-100">Dynamic Cloud QR</span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-100 p-1 shadow flex items-center justify-center">
          <QrCode className="w-10 h-10 text-amber-950" />
        </div>
      </div>

      {/* Heavy Metal Base */}
      <div className="w-full h-3.5 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 rounded-full mt-4 shadow-lg border border-amber-300/40" />
    </div>
  );
}
