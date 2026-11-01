"use client";

import React, { useRef, useState } from "react";
import { Zap, Check, RotateCw, ShieldCheck, Radio, QrCode, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface Standee3DPreviewProps {
  onTapSuccess?: () => void;
}

const FINISHES = [
  { id: "gold", name: "Gold", img: "/standees/Gold.png", color: "from-[#F7E7A9] to-[#D4AF37]" },
  { id: "steel", name: "Steel", img: "/standees/Steel.png", color: "from-slate-200 to-slate-400" },
  { id: "wood", name: "Wood Base", img: "/standees/Wood Trans.png", color: "from-amber-200 to-amber-600" },
  { id: "pink", name: "Blush Pink", img: "/standees/Pink.png", color: "from-pink-300 to-rose-400" },
];

export default function Standee3DPreview({ onTapSuccess }: Standee3DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedFinish, setSelectedFinish] = useState(FINISHES[0]);
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
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
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
        { scale: 0.95 },
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
    <div ref={containerRef} className="relative rounded-3xl bg-[#141720] p-6 sm:p-7 text-white border border-[#232734] shadow-2xl">
      
      {/* Top Spec Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#232734]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
            Physical Specimen
          </span>
        </div>
        <button
          type="button"
          onClick={flipStandee}
          className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-[#1e2230] hover:bg-[#252b3d] text-zinc-200 border border-[#2d3345] transition-all cursor-pointer active:scale-95"
          title="Inspect reverse dynamic QR"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#ff7a00]" />
          <span>{isFlipped ? "View Front (NFC)" : "Inspect Reverse (QR)"}</span>
        </button>
      </div>

      {/* Finish Switcher Buttons */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {FINISHES.map((f) => {
          const isSelected = selectedFinish.id === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFinish(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#ff7a00] text-black font-bold shadow-md scale-105"
                  : "bg-[#0e1015] hover:bg-[#1e2230] text-slate-300 hover:text-white border border-[#232734]"
              }`}
            >
              {f.name}
            </button>
          );
        })}
      </div>

      {/* 3D Stage with GSAP preserve-3d */}
      <div className="relative w-full py-6 rounded-2xl bg-gradient-to-b from-[#10131b]/80 to-[#0a0c10]/80 mb-4 flex flex-col items-center justify-center [perspective:1000px] overflow-hidden">
        
        {/* Soft Radial Backlight Glow */}
        <div className="absolute inset-0 bg-radial from-[#ff7a00]/10 via-transparent to-transparent pointer-events-none" />

        {/* Physical Standee Representation with 3D Flip */}
        <div
          ref={cardRef}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-52 sm:w-60 h-[310px] rounded-2xl transition-shadow cursor-pointer select-none"
          onClick={triggerNfcTap}
          title="Tap phone against standee"
        >
          {/* ==================== FRONT FACE (REAL HARDWARE PHOTOGRAPHY) ==================== */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/60 flex flex-col items-center justify-between p-2"
          >
            {/* Real Photograph of Selected Standee */}
            <img
              src={selectedFinish.img}
              alt={selectedFinish.name}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Live Tap Hotspot Overlay */}
            <div className="relative z-10 w-full flex items-center justify-between px-3 pt-2">
              <span className="font-headline font-bold text-[11px] tracking-tight text-white drop-shadow-md">
                Zen<span className="text-[#ff7a00]">Tap</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono border border-emerald-400/40 backdrop-blur-sm">
                NTAG216
              </span>
            </div>

            {/* Glowing Interactive Tap Target Indicator */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#ff7a00]/25 border-2 border-[#ff7a00] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform backdrop-blur-xs">
                <Radio className="w-8 h-8 text-[#ff7a00]" />
              </div>
              <span className="mt-2 text-xs font-bold text-white tracking-wider uppercase font-headline drop-shadow-md bg-black/60 px-3 py-1 rounded-full border border-white/10">
                TAP PHONE HERE
              </span>
            </div>

            {/* Footer Spec Overlay */}
            <div className="relative z-10 w-full flex items-center justify-center gap-2 text-[11px] text-white/90 font-mono pb-2 drop-shadow">
              <span>13.56 MHz</span>
              <span>·</span>
              <span>0.6s Handshake</span>
            </div>

            {isTapping && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="w-32 h-32 rounded-full border-4 border-[#ff7a00] animate-ping opacity-75" />
              </div>
            )}
          </div>

          {/* ==================== BACK FACE (DYNAMIC QR) ==================== */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 p-5 rounded-2xl bg-[#0e1015] border border-[#ff7a00]/40 shadow-2xl flex flex-col items-center justify-between text-center select-none"
          >
            {/* Brand Header */}
            <div className="flex items-center justify-between w-full px-1">
              <span className="font-headline font-bold text-xs tracking-tight text-white">
                Zen<span className="text-[#ff7a00]">Tap</span> Dynamic
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40">
                Level Q
              </span>
            </div>

            {/* Dynamic QR Code */}
            <div className="p-3 rounded-xl bg-white text-black shadow-xl my-auto relative">
              <QrCode className="w-24 h-24 text-black" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-6 h-6 rounded bg-[#ff7a00] text-black flex items-center justify-center font-black text-xs shadow">
                  Z
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-medium">
              Or Scan with Smartphone Camera
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex flex-col items-center">
          <button
            onClick={triggerNfcTap}
            disabled={isTapping}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-all shadow-md cursor-pointer ${
              tapSuccess
                ? "bg-emerald-500 text-black shadow-emerald-500/25"
                : "bg-[#ff7a00] hover:bg-[#e56d00] text-black active:scale-95 shadow-[#ff7a00]/25"
            }`}
          >
            {tapSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>NFC Handshake Confirmed (0.6s)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-black" />
                <span>Simulate Physical Phone Tap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Technical Telemetry */}
      <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-[#232734] text-xs font-mono text-zinc-400">
        <div>
          <p className="text-white font-bold text-sm">888 bytes</p>
          <p className="text-[11px]">EEPROM Memory</p>
        </div>
        <div>
          <p className="text-white font-bold text-sm">Level Q</p>
          <p className="text-[11px]">Laser QR Precision</p>
        </div>
        <div>
          <p className="text-white font-bold text-sm">Zero Wire</p>
          <p className="text-[11px]">Battery-Free Passive</p>
        </div>
      </div>
    </div>
  );
}
