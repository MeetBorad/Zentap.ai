"use client";

import React, { useRef, useState } from "react";
import { Zap, Check, RotateCw, ShieldCheck, Radio, QrCode } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface Standee3DPreviewProps {
  onTapSuccess?: () => void;
}

export default function Standee3DPreview({ onTapSuccess }: Standee3DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTapping, setIsTapping] = useState(false);
  const [tapSuccess, setTapSuccess] = useState(false);

  // GSAP 3D Flip animation
  const { contextSafe } = useGSAP({ scope: containerRef });

  const flipStandee = contextSafe(() => {
    if (!cardRef.current) return;
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    gsap.to(cardRef.current, {
      rotateY: nextFlipped ? 180 : 0,
      duration: 0.75,
      ease: "power2.inOut",
      transformPerspective: 1000,
    });
  });

  const triggerNfcTap = () => {
    setIsTapping(true);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.10, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext fallback
    }

    // GSAP haptic feedback shake/press
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.96 },
        { scale: 1, duration: 0.35, ease: "back.out(2)" }
      );
    }

    setTimeout(() => {
      setIsTapping(false);
      setTapSuccess(true);

      if (onTapSuccess) {
        onTapSuccess();
      }

      setTimeout(() => {
        setTapSuccess(false);
      }, 3500);
    }, 450);
  };

  return (
    <div ref={containerRef} className="relative rounded-3xl bg-[#1C1B1A] p-6 sm:p-8 text-white border border-[#2C2B2A] shadow-2xl">
      {/* Top Spec Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-300">
            Hardware Specimen
          </span>
        </div>
        <button
          type="button"
          onClick={flipStandee}
          className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/15 transition-all cursor-pointer active:scale-95"
          title="Inspect 360° reverse side"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFlipped ? "View Front (NFC)" : "Inspect Reverse (QR)"}</span>
        </button>
      </div>

      {/* 3D Stage with GSAP preserve-3d */}
      <div className="relative w-full py-8 rounded-2xl bg-[#141414] border border-white/10 mb-6 flex flex-col items-center justify-center [perspective:1000px]">
        {/* Physical Standee Representation with 3D Flip */}
        <div
          ref={cardRef}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-48 sm:w-56 h-[270px] rounded-2xl transition-shadow shadow-2xl cursor-pointer"
          onClick={flipStandee}
          title="Click to flip standee"
        >
          {/* ==================== FRONT FACE (NFC TAP) ==================== */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 p-5 rounded-2xl bg-[#202020] border border-white/20 shadow-2xl flex flex-col items-center justify-between text-center select-none"
          >
            {/* Brand & Chip */}
            <div className="flex items-center justify-between w-full px-1">
              <span className="font-headline font-bold text-xs tracking-tight text-white">
                Zen<span className="text-[#D94826]">Tap</span>
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                NTAG216
              </span>
            </div>

            {/* Tap Hotspot Icon */}
            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#D94826]/15 border-2 border-[#D94826]/40 flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform">
                <Radio className="w-8 h-8 text-[#D94826] animate-pulse" />
              </div>
              <p className="text-xs font-bold text-white tracking-wide font-headline">
                TAP PHONE HERE
              </p>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Instant 0.6s Handshake
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono pt-2 border-t border-white/10 w-full justify-center">
              <span>13.56 MHz</span>
              <span>·</span>
              <span>ISO 14443A</span>
            </div>

            {isTapping && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="tap-ripple" />
              </div>
            )}
          </div>

          {/* ==================== BACK FACE (DYNAMIC QR) ==================== */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 p-5 rounded-2xl bg-[#1A1A1A] border border-[#D4AF37]/40 shadow-2xl flex flex-col items-center justify-between text-center select-none"
          >
            {/* Brand Header */}
            <div className="flex items-center justify-between w-full px-1">
              <span className="font-headline font-bold text-xs tracking-tight text-[#F7E7A9]">
                Zen<span className="text-[#D94826]">Tap</span> Dynamic
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                Level Q
              </span>
            </div>

            {/* Dynamic QR Code */}
            <div className="p-2.5 rounded-xl bg-white text-black shadow-md my-auto relative">
              <svg viewBox="0 0 40 40" className="w-24 h-24" aria-hidden>
                <rect x="2" y="2" width="11" height="11" rx="2" fill="#0f172a" />
                <rect x="5" y="5" width="5" height="5" rx="1" fill="#fff" />
                <rect x="27" y="2" width="11" height="11" rx="2" fill="#0f172a" />
                <rect x="30" y="5" width="5" height="5" rx="1" fill="#fff" />
                <rect x="2" y="27" width="11" height="11" rx="2" fill="#0f172a" />
                <rect x="5" y="30" width="5" height="5" rx="1" fill="#fff" />
                <rect x="24" y="24" width="5" height="5" rx="1" fill="#D94826" />
                <rect x="31" y="24" width="5" height="5" rx="1" fill="#D94826" />
                <rect x="24" y="31" width="5" height="5" rx="1" fill="#D94826" />
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
                <div className="w-5 h-5 rounded bg-[#D94826] text-white flex items-center justify-center font-bold text-[9px] shadow">
                  Z
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-300 font-medium">
              Or Scan with Smartphone Camera
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col items-center">
          <button
            onClick={triggerNfcTap}
            disabled={isTapping}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs transition-all shadow-md cursor-pointer ${
              tapSuccess
                ? "bg-emerald-600 text-white"
                : "bg-[#D94826] hover:bg-[#C23C1D] text-white active:scale-95"
            }`}
          >
            {tapSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>NFC Handshake Confirmed (0.6s)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-200" />
                <span>Simulate Physical Phone Tap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Technical Telemetry */}
      <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-white/10 text-xs font-mono text-zinc-400">
        <div>
          <p className="text-white font-bold text-sm">888 bytes</p>
          <p className="text-[10px]">EEPROM Memory</p>
        </div>
        <div>
          <p className="text-white font-bold text-sm">Level Q</p>
          <p className="text-[10px]">QR Error Correction</p>
        </div>
        <div>
          <p className="text-white font-bold text-sm">AES-128</p>
          <p className="text-[10px]">Tamper Protection</p>
        </div>
      </div>
    </div>
  );
}
