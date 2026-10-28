"use client";

import React, { useState } from "react";
import { Zap, QrCode, Shield, Check, Radio } from "lucide-react";

interface Standee3DPreviewProps {
  onTapSuccess?: () => void;
}

export default function Standee3DPreview({ onTapSuccess }: Standee3DPreviewProps) {
  const [isTapping, setIsTapping] = useState(false);
  const [tapSuccess, setTapSuccess] = useState(false);

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

    setTimeout(() => {
      setIsTapping(false);
      setTapSuccess(true);

      if (onTapSuccess) {
        onTapSuccess();
      }

      setTimeout(() => {
        setTapSuccess(false);
      }, 3500);
    }, 500);
  };

  return (
    <div className="relative rounded-3xl bg-[#1C1B1A] p-6 sm:p-8 text-white border border-[#2C2B2A] shadow-xl">
      {/* Top Spec Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-300">
            Physical Hardware Specimen
          </span>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/10 text-zinc-200 border border-white/10">
          Matte Obsidian Acrylic
        </span>
      </div>

      {/* Standee Body Showcase */}
      <div className="relative w-full py-8 rounded-2xl bg-[#141414] border border-white/10 mb-6 flex flex-col items-center justify-center">
        {/* Physical Standee Representation */}
        <div className={`relative w-48 sm:w-56 p-5 rounded-2xl bg-[#202020] border border-white/20 shadow-2xl flex flex-col items-center text-center transition-transform duration-200 ${isTapping ? "scale-[0.98]" : ""}`}>
          
          {/* Brand & State */}
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <span className="font-headline font-bold text-xs tracking-tight text-white">
              Zen<span className="text-[#D94826]">tap</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              NTAG216
            </span>
          </div>

          {/* Dynamic Laser-etched QR code */}
          <div className="relative p-3 rounded-xl bg-white text-black shadow-md mb-3 flex flex-col items-center">
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
              <div className="w-6 h-6 rounded-md bg-[#D94826] text-white flex items-center justify-center font-bold text-[10px] shadow">
                Z
              </div>
            </div>
          </div>

          <p className="text-[11px] font-bold text-white tracking-wide font-headline">
            Tap NFC or Scan QR
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-mono">
            <span>Instant Dispatch</span>
            <span>·</span>
            <span>13.56 MHz</span>
          </div>

          {isTapping && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="tap-ripple" />
            </div>
          )}
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
