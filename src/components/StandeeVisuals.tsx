"use client";

import React from "react";
import { Radio, QrCode, Sparkles, Check, ShieldCheck } from "lucide-react";

interface StandeeVisualProps {
  type: "card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom";
  businessName?: string;
  className?: string;
}

export default function StandeeVisual({ type, businessName = "YOUR BUSINESS", className = "" }: StandeeVisualProps) {
  const displayBiz = businessName.toUpperCase();

  if (type === "card_500") {
    // Smart NFC & Dynamic QR Card (Wallet / Pocket Card Format with Real Steel Texture)
    return (
      <div className={`relative w-full aspect-[1.586/1] max-w-sm rounded-2xl bg-[#141720] border border-[#232734] shadow-2xl overflow-hidden text-white flex flex-col justify-between p-5 group ${className}`}>
        {/* Real Hardware Card Image Background */}
        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
          <img src="/standees/Steel.webp" alt="ZenTap NFC Card" className="w-full h-full object-cover scale-150 -translate-y-10" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-[#141720]/80 to-transparent pointer-events-none" />
        
        {/* Card Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff7a00]/20 border border-[#ff7a00]/40 flex items-center justify-center text-[#ff7a00]">
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

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-mono text-emerald-400">
            <span>NTAG216</span>
          </div>
        </div>

        {/* Business Center Label */}
        <div className="relative z-10 my-auto py-2">
          <span className="text-[10px] text-[#ff7a00] font-semibold uppercase tracking-widest block mb-0.5">
            Verified Partner
          </span>
          <h4 className="font-headline font-black text-lg text-white tracking-tight truncate drop-shadow">
            {displayBiz}
          </h4>
        </div>

        {/* Card Footer: Tap Chip & QR Visual */}
        <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/15">
          <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-medium">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Radio className="w-3 h-3 text-[#ff7a00]" />
            </div>
            <span>Tap Phone or Scan QR</span>
          </div>

          <div className="w-10 h-10 rounded-lg bg-white p-1 shadow-md flex items-center justify-center">
            <QrCode className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "standee_1500") {
    // Customized Acrylic Standee with Real Wood & Transparent Acrylic Photography
    return (
      <div className={`relative w-full max-w-sm rounded-3xl bg-[#141720] border-2 border-[#232734] hover:border-[#ff7a00]/50 shadow-2xl overflow-hidden text-white flex flex-col items-center text-center p-6 transition-all ${className}`}>
        
        {/* Real Standee Photo Container */}
        <div className="relative w-full aspect-[3/4] max-h-56 rounded-2xl overflow-hidden bg-[#0e1015] border border-[#232734] mb-4 flex items-center justify-center p-2">
          <img
            src="/standees/Wood Trans.webp"
            alt="Acrylic Review Standee with Wood Base"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[9px] font-mono text-emerald-400 font-bold">
            Wood &amp; Acrylic
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff7a00] mb-0.5">
          Review Us On Google
        </span>

        <h4 className="font-headline font-black text-lg text-white tracking-wide truncate max-w-full">
          {displayBiz}
        </h4>

        <div className="flex items-center gap-1 text-amber-400 text-sm my-1">
          {"★".repeat(5)}
        </div>

        {/* Standee NFC Specs */}
        <div className="w-full mt-3 pt-3 border-t border-[#232734] flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#ff7a00]" />
            <span>NTAG216 Chip</span>
          </span>
          <span className="flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-zinc-300" />
            <span>Dynamic QR</span>
          </span>
        </div>
      </div>
    );
  }

  if (type === "franchise_custom") {
    // Multi-Outlet Franchise Custom Standee Fleet Visual with 4-Finish Real Grid
    return (
      <div className={`relative w-full max-w-sm rounded-3xl bg-[#141720] border-2 border-amber-500/60 shadow-2xl overflow-hidden text-white flex flex-col items-center text-center p-6 ${className}`}>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>FRANCHISE MULTI-OUTLET FLEET</span>
        </div>

        <h4 className="font-headline font-black text-lg text-white tracking-wide truncate max-w-full mb-0.5">
          {displayBiz}
        </h4>

        <p className="text-[11px] text-amber-200/80 font-medium mb-3">
          Multi-Branch Fleet · Choose from 4 Premium Finishes
        </p>

        {/* 4 Real Standee Photos Preview Grid */}
        <div className="grid grid-cols-2 gap-2 w-full mb-4">
          <div className="aspect-[3/4] rounded-xl bg-[#0e1015] border border-[#232734] overflow-hidden p-1 flex flex-col items-center justify-center">
            <img src="/standees/Gold.webp" alt="Gold Standee" className="w-full h-full object-contain" />
            <span className="text-[8px] font-mono font-bold text-amber-300 pb-0.5">Gold Mirror</span>
          </div>
          <div className="aspect-[3/4] rounded-xl bg-[#0e1015] border border-[#232734] overflow-hidden p-1 flex flex-col items-center justify-center">
            <img src="/standees/Steel.webp" alt="Steel Standee" className="w-full h-full object-contain" />
            <span className="text-[8px] font-mono font-bold text-slate-300 pb-0.5">Brushed Steel</span>
          </div>
          <div className="aspect-[3/4] rounded-xl bg-[#0e1015] border border-[#232734] overflow-hidden p-1 flex flex-col items-center justify-center">
            <img src="/standees/Wood Trans.webp" alt="Wood Standee" className="w-full h-full object-contain" />
            <span className="text-[8px] font-mono font-bold text-amber-400 pb-0.5">Wood Base</span>
          </div>
          <div className="aspect-[3/4] rounded-xl bg-[#0e1015] border border-[#232734] overflow-hidden p-1 flex flex-col items-center justify-center">
            <img src="/standees/Pink.webp" alt="Rose Gold Standee" className="w-full h-full object-contain" />
            <span className="text-[8px] font-mono font-bold text-rose-300 pb-0.5">Rose Gold</span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full pt-3 border-t border-amber-500/30 grid grid-cols-2 gap-2 text-left text-[10px]">
          <div className="flex items-center gap-1.5 text-amber-200">
            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span>Unique QR per Branch</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-200">
            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span>Central Admin Hub</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-200">
            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span>Separate Google Links</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-200">
            <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span>Volume Pricing</span>
          </div>
        </div>
      </div>
    );
  }

  // standee_auto_2000: Brushed Brass Edition + Auto Reply with Real Gold Photography
  return (
    <div className={`relative w-full max-w-sm rounded-3xl bg-[#141720] border-2 border-[#D4AF37] shadow-2xl overflow-hidden text-white flex flex-col items-center text-center p-6 ${className}`}>
      
      {/* Premium Badge */}
      <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-200 mb-2">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>PREMIUM AUTO-REPLY EDITION</span>
      </div>

      {/* Real Standee Photo Container (Gold Mirror) */}
      <div className="relative w-full aspect-[3/4] max-h-56 rounded-2xl overflow-hidden bg-[#0e1015] border border-[#D4AF37]/40 mb-4 flex items-center justify-center p-2">
        <img
          src="/standees/Gold.webp"
          alt="Brushed Champagne Gold Standee"
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-[#D4AF37] text-[9px] font-mono text-[#F7E7A9] font-bold">
          Champagne Gold
        </div>
      </div>

      <h4 className="font-headline font-black text-lg text-amber-100 tracking-wide truncate max-w-full">
        {displayBiz}
      </h4>

      <p className="text-[11px] text-amber-300/90 font-medium my-0.5">
        Custom Laser-Branded Luxury Metal + 24/7 Auto Replies
      </p>

      <div className="flex items-center gap-1 text-amber-400 text-sm my-1">
        {"★".repeat(5)}
      </div>

      {/* Bottom Bar */}
      <div className="w-full mt-3 pt-3 border-t border-[#232734] flex items-center justify-between text-[11px] font-mono text-zinc-300">
        <span className="flex items-center gap-1.5 text-amber-300 font-bold">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>NTAG216 NFC</span>
        </span>
        <span className="flex items-center gap-1.5 text-zinc-300">
          <QrCode className="w-3.5 h-3.5 text-white" />
          <span>Level-Q Laser QR</span>
        </span>
      </div>
    </div>
  );
}
