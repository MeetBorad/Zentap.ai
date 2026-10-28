"use client";

import React, { useState } from "react";
import { Sparkles, Star, Zap, QrCode, Shield, Check, ArrowRight } from "lucide-react";

interface Standee3DPreviewProps {
  onTapSuccess?: () => void;
}

export default function Standee3DPreview({ onTapSuccess }: Standee3DPreviewProps) {
  const [isTapping, setIsTapping] = useState(false);
  const [tapSuccess, setTapSuccess] = useState(false);
  const [tapCount, setTapCount] = useState(148);

  const triggerNfcTap = () => {
    setIsTapping(true);

    // Audio chime effect using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext not available or blocked
    }

    setTimeout(() => {
      setIsTapping(false);
      setTapSuccess(true);
      setTapCount((prev) => prev + 1);

      if (onTapSuccess) {
        onTapSuccess();
      }

      setTimeout(() => {
        setTapSuccess(false);
      }, 4000);
    }, 600);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-primary-container p-6 sm:p-8 text-on-primary shadow-2xl transition-all duration-300 border border-white/10 group">
      {/* Background glow orb */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-on-tertiary-container/15 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-on-primary-container">
            Live Hardware Simulator
          </span>
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-on-primary backdrop-blur-md border border-white/10 font-medium">
          Matte Obsidian Acrylic
        </span>
      </div>

      {/* Standee Device Showcase */}
      <div className="relative w-full h-72 sm:h-84 rounded-2xl overflow-hidden bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-white/10 mb-6 flex flex-col items-center justify-center shadow-inner">
        
        {/* Standee Body Mockup */}
        <div className="relative w-48 sm:w-56 p-5 rounded-2xl bg-gradient-to-b from-[#262626] to-[#171717] border border-white/20 shadow-2xl flex flex-col items-center text-center">
          
          {/* Top Brand Tag */}
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <span className="font-headline font-bold text-xs tracking-tight text-white flex items-center gap-1">
              Zen<span className="text-secondary-container">tap</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              ONLINE
            </span>
          </div>

          {/* Standee Realistic QR & NFC Target */}
          <div className="relative p-3 rounded-xl bg-white text-black shadow-md mb-3 flex flex-col items-center">
            {/* SVG Dynamic QR Code */}
            <svg viewBox="0 0 40 40" className="w-24 h-24" aria-hidden>
              <rect x="2" y="2" width="11" height="11" rx="2" fill="#0f172a" />
              <rect x="5" y="5" width="5" height="5" rx="1" fill="#fff" />
              <rect x="27" y="2" width="11" height="11" rx="2" fill="#0f172a" />
              <rect x="30" y="5" width="5" height="5" rx="1" fill="#fff" />
              <rect x="2" y="27" width="11" height="11" rx="2" fill="#0f172a" />
              <rect x="5" y="30" width="5" height="5" rx="1" fill="#fff" />
              <rect x="24" y="24" width="5" height="5" rx="1" fill="#db3327" />
              <rect x="31" y="24" width="5" height="5" rx="1" fill="#db3327" />
              <rect x="24" y="31" width="5" height="5" rx="1" fill="#db3327" />
              <rect x="16" y="2" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="20" y="7" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="16" y="14" width="8" height="8" rx="2" fill="#0f172a" />
              <rect x="2" y="16" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="9" y="20" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="27" y="16" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="34" y="20" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="16" y="27" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="16" y="34" width="8" height="4" rx="1" fill="#0f172a" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 rounded-md bg-secondary-container text-white flex items-center justify-center font-bold text-[10px] shadow">
                Z
              </div>
            </div>
          </div>

          <p className="text-[11px] font-bold text-white tracking-wide">
            Tap phone or scan QR
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
            <span>Instant Review</span>
            <span>•</span>
            <span className="text-secondary-fixed">NTAG216</span>
          </div>
        </div>

        {/* Interactive Phone Tap Action Button */}
        <div className="absolute bottom-4 z-20 flex flex-col items-center">
          <button
            onClick={triggerNfcTap}
            disabled={isTapping}
            className={`relative flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-xs transition-all shadow-xl cursor-pointer ${
              isTapping
                ? "bg-secondary scale-95"
                : "bg-secondary-container hover:bg-secondary-container/90 hover:scale-105 active:scale-95 text-white"
            }`}
          >
            {/* Ripple rings on tap */}
            {isTapping && (
              <>
                <span className="tap-ripple" />
                <span className="tap-ripple" style={{ animationDelay: "0.3s" }} />
              </>
            )}

            <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span>{isTapping ? "Reading NFC..." : "Tap Phone on Standee"}</span>
          </button>
        </div>

        {/* Tap Feedback Overlay Toast */}
        {tapSuccess && (
          <div className="absolute inset-0 z-30 bg-secondary-container/95 backdrop-blur-md flex flex-col items-center justify-center text-on-secondary-container p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-secondary-container mb-3 shadow-xl">
              <Star className="w-8 h-8 fill-amber-400 text-amber-500" />
            </div>
            <h4 className="font-headline font-bold text-lg text-white">
              5-Star Review Prompt Dispatched!
            </h4>
            <p className="text-xs text-white/90 mt-1 max-w-xs">
              Customer phone instantly opens Google Business Profile review screen with 5 stars pre-selected.
            </p>
            <div className="mt-4 px-3 py-1 rounded-full bg-white/20 text-[11px] font-mono text-white">
              Redirected in 0.6s • Telemetry logged
            </div>
          </div>
        )}
      </div>

      {/* Hardware Bullet Points */}
      <div className="flex flex-wrap items-center justify-between text-xs text-on-primary-container gap-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-secondary-fixed" />
          <span>Zero App Installation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-secondary-fixed" />
          <span>Laser-Engraved Dynamic QR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-secondary-fixed" />
          <span>Tamper-Proof Encryption</span>
        </div>
      </div>
    </div>
  );
}
