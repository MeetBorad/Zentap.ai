"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Cpu, 
  ShieldCheck, 
  BarChart3, 
  Palette, 
  Check, 
  ArrowRight,
  Sparkles,
  QrCode,
  Layers,
  Radio
} from "lucide-react";
import SentimentSimulator from "../SentimentSimulator";
import { ActiveView } from "../Header";

interface FeaturesViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
}

export default function FeaturesView({ onNavigate, onOpenAuth }: FeaturesViewProps) {
  const [selectedColor, setSelectedColor] = useState<"obsidian" | "gold" | "white" | "crimson">("obsidian");

  const colorOptions = [
    { id: "obsidian", name: "Matte Obsidian", bg: "bg-zinc-900", border: "border-zinc-700", text: "text-white" },
    { id: "gold", name: "Brushed Brass / Gold", bg: "bg-[#b89547]", border: "border-[#d8b567]", text: "text-white" },
    { id: "white", name: "Minimalist Ceramic", bg: "bg-white", border: "border-zinc-300", text: "text-zinc-900" },
    { id: "crimson", name: "Signature Crimson", bg: "bg-[#db3327]", border: "border-[#b71511]", text: "text-white" },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-12 max-w-3xl">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Complete Hardware &amp; Software Suite
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface mt-1 tracking-tight">
          Enterprise-Grade NFC Chips Meet Cloud AI Routing
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant mt-3 leading-relaxed">
          Every ZenTap standee is custom manufactured using aerospace-grade acrylic, encrypted NTAG216 circuitry, and dynamic QR fallbacks connected to real-time cloud analytics.
        </p>
      </div>

      {/* Feature Grid 1: Hardware Core */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        
        {/* Chip Specs */}
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              NTAG216 High-Performance Chip
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              Embedded with NXP NTAG216 semiconductors featuring 888 bytes user memory, 10-year data retention, and proprietary write-locking that prevents unauthorized overwrites.
            </p>

            <div className="space-y-2.5 text-xs text-on-surface font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Sub-0.4 second read speed on both iOS &amp; Android</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Penetrates heavy phone protective cases up to 45mm distance</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero power consumption — operates indefinitely via phone induction</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-surface-variant/30 flex justify-between items-center text-xs font-mono text-zinc-500">
            <span>Protocol: ISO 14443-A</span>
            <span className="text-emerald-600 font-bold">100% Battery-Free</span>
          </div>
        </div>

        {/* Dynamic Laser QR */}
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center mb-6">
              <QrCode className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              Laser-Engraved Dynamic QR Fallback
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              For older devices or customers who prefer camera scanning, our dynamic QR code redirects through the same cloud-managed intelligent routing pipeline.
            </p>

            <div className="space-y-2.5 text-xs text-on-surface font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Dynamic URL updating without ever reprinting or replacing standees</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>High-contrast UV-cured ink resistant to bleach, alcohol &amp; coffee spills</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Sub-millimeter laser precision guarantees 100% scan clarity</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-surface-variant/30 flex justify-between items-center text-xs font-mono text-zinc-500">
            <span>Resolution: 600 DPI Laser</span>
            <span className="text-secondary font-bold">Spill &amp; Scratch Proof</span>
          </div>
        </div>
      </div>

      {/* Interactive AI Sentiment Guard Section */}
      <div className="mb-14">
        <SentimentSimulator />
      </div>

      {/* Feature Grid 2: Telemetry & Branding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        
        {/* Real-Time Telemetry */}
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-secondary flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              Live Tap Telemetry &amp; Analytics
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              Track the exact flow of customer engagement: monitor peak review hours, measure conversion rates per checkout station, and identify which staff shifts generate the highest review volume.
            </p>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface">Peak Tap Hour:</span>
                <span className="font-mono text-secondary-container font-bold">7:30 PM - 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface">Scan-to-Review Conversion:</span>
                <span className="font-mono text-emerald-600 font-bold">90.1%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface">Monthly Average Rating Gain:</span>
                <span className="font-mono text-on-surface font-bold">+1.1 Stars</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("portal")}
            className="mt-8 py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Inspect Live Merchant Telemetry</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Pantone Branding */}
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center mb-6">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              Custom Pantone &amp; Material Finishes
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              Seamlessly match your interior design. Select from our signature finishes or customize your standee with bespoke corporate pantone shades and metallic inlays.
            </p>

            {/* Color preview buttons */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-on-surface">
                Interactive Color Preview:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedColor(opt.id as any)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      selectedColor === opt.id
                        ? "border-secondary-container bg-surface-container-low shadow-sm"
                        : "border-surface-variant/40 hover:bg-surface-container-low/50"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full ${opt.bg} border ${opt.border}`} />
                    <span className="text-xs font-medium text-on-surface truncate">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-surface-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Laser engraved with your business logo</span>
            <span className="text-secondary font-bold">Free Custom Proof</span>
          </div>
        </div>
      </div>
    </div>
  );
}
