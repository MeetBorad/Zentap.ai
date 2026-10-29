"use client";

import React from "react";
import { 
  ArrowRight, 
  Radio, 
  Zap, 
  ShieldCheck, 
  QrCode, 
  TrendingUp, 
  Layers, 
  Cpu, 
  RefreshCw 
} from "lucide-react";
import Standee3DPreview from "../Standee3DPreview";
import SentimentSimulator from "../SentimentSimulator";
import { ActiveView } from "../Header";

interface HomeViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
  onTriggerTapReviewModal: () => void;
}

export default function HomeView({
  onNavigate,
  onOpenAuth,
  onTriggerTapReviewModal,
}: HomeViewProps) {
  return (
    <div className="flex flex-col w-full">
      
      {/* 1. Asymmetric Workbench Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Specimen & Positioning */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Architectural Hardware Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#F2F0EB] mb-6 border border-[#E2DFD8]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-mono font-medium text-[#1C1B1A]">
                NFC NTAG216 · Laser-Etched Acrylic Standees
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-headline font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1C1B1A] tracking-tight leading-[1.12] mb-5">
              Turn physical guest footfall into{" "}
              <span className="text-[#D94826] underline decoration-[#D94826]/30 decoration-wavy">
                5-star Google Reviews
              </span>{" "}
              in 0.6 seconds.
            </h1>

            {/* Honest Technical Value Proposition */}
            <p className="text-base sm:text-lg text-[#615E5B] mb-6 leading-relaxed max-w-2xl font-sans">
              Precision-machined NFC &amp; Dynamic QR standees built for dining counters, salon desks, and clinic reception. Zero apps to download, zero Bluetooth pairing, and fully compliant with Google anti-gating policies.
            </p>

            {/* Core Feature Callout Bar */}
            <div className="mb-8 p-3.5 rounded-xl bg-[#F2F0EB] border border-[#E2DFD8] flex items-center gap-3 text-xs text-[#1C1B1A]">
              <TrendingUp className="w-4 h-4 text-[#D94826] flex-shrink-0" />
              <span>
                <strong>Verified Google Maps SEO Lift:</strong> Consistent high-velocity reviews directly enhance your Google Business Profile local 3-pack ranking.
              </span>
            </div>

            {/* CTA Pairing */}
            <div className="flex flex-col sm:flex-row gap-3.5 mb-10">
              <button
                onClick={() => onNavigate("sample-dashboard")}
                className="py-3 px-6 rounded-xl bg-[#1C1B1A] text-white hover:bg-[#2C2B2A] font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate("how-it-works")}
                className="py-3 px-6 rounded-xl bg-white hover:bg-[#F2F0EB] text-[#1C1B1A] font-semibold text-xs border border-[#E2DFD8] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-[#D94826]" />
                <span>How Hardware Works</span>
              </button>
            </div>

            {/* Technical Verification Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E2DFD8] text-xs">
              <div>
                <p className="font-headline font-bold text-xl text-[#1C1B1A]">0.6s</p>
                <p className="text-[11px] font-mono text-[#615E5B] mt-0.5">Average Tap Velocity</p>
              </div>
              <div>
                <p className="font-headline font-bold text-xl text-[#1C1B1A]">100%</p>
                <p className="text-[11px] font-mono text-[#615E5B] mt-0.5">Zero App Install Required</p>
              </div>
              <div>
                <p className="font-headline font-bold text-xl text-[#1C1B1A]">NTAG216</p>
                <p className="text-[11px] font-mono text-[#615E5B] mt-0.5">888 Byte EEPROM Chip</p>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Standee Specimen */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <Standee3DPreview onTapSuccess={onTriggerTapReviewModal} />
          </div>
        </div>
      </section>

      {/* 2. Interactive Sentiment Interceptor Workbench */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
        <SentimentSimulator />
      </section>

      {/* 3. Asymmetric Bento Grid: Hardware & Cloud Ecosystem */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#D94826]">
            Engineering &amp; Materials
          </span>
          <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#1C1B1A] mt-1">
            Built for High-Footfall Commercial Desks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Item 1: Hardware Build (Spans 7 cols) */}
          <div className="md:col-span-7 p-7 rounded-3xl bg-[#FAF9F6] border border-[#E2DFD8] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#1C1B1A] text-white flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-[#D94826]" />
              </div>
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mb-2">
                4mm Laser-Cut Acrylic &amp; Embedded NFC Antenna
              </h3>
              <p className="text-xs text-[#615E5B] leading-relaxed">
                Machined from UV-stable, scratch-resistant acrylic with high-permeability copper antenna coils tuned to 13.56 MHz. Withstands daily spillages, sanitizer wipe-downs, and intensive restaurant use.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-center justify-between text-xs font-mono text-[#615E5B]">
              <span>Durability: 100,000+ Write Cycles</span>
              <span className="text-[#1C1B1A] font-semibold">Matte Obsidian Finish</span>
            </div>
          </div>

          {/* Bento Item 2: Dynamic URL Repointing (Spans 5 cols) */}
          <div className="md:col-span-5 p-7 rounded-3xl bg-[#FAF9F6] border border-[#E2DFD8] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F2F0EB] text-[#1C1B1A] flex items-center justify-center mb-4 border border-[#E2DFD8]">
                <RefreshCw className="w-5 h-5 text-[#D94826]" />
              </div>
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mb-2">
                Instant Cloud Destination Updates
              </h3>
              <p className="text-xs text-[#615E5B] leading-relaxed">
                Repoint your standee destination instantly from your merchant dashboard. Switch between Google Reviews, TripAdvisor, Instagram, or promotional landing pages without replacing physical hardware.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-center justify-between text-xs font-mono text-[#615E5B]">
              <span>Real-time OTA Repointing</span>
              <span className="text-[#D94826] font-semibold">Zero Hardware Waste</span>
            </div>
          </div>

          {/* Bento Item 3: Dual-Mode Dynamic QR (Spans 5 cols) */}
          <div className="md:col-span-5 p-7 rounded-3xl bg-[#FAF9F6] border border-[#E2DFD8] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F2F0EB] text-[#1C1B1A] flex items-center justify-center mb-4 border border-[#E2DFD8]">
                <QrCode className="w-5 h-5 text-[#1C1B1A]" />
              </div>
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mb-2">
                Level-Q Dynamic QR Fallback
              </h3>
              <p className="text-xs text-[#615E5B] leading-relaxed">
                Laser-etched QR code with 25% Reed-Solomon error correction ensures 100% scanning reliability even on older smartphones without NFC sensors.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-center justify-between text-xs font-mono text-[#615E5B]">
              <span>Universal Camera Scan</span>
              <span className="text-[#1C1B1A] font-semibold">Any iOS / Android</span>
            </div>
          </div>

          {/* Bento Item 4: Google Compliance (Spans 7 cols) */}
          <div className="md:col-span-7 p-7 rounded-3xl bg-[#FAF9F6] border border-[#E2DFD8] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mb-2">
                100% Google Anti-Review-Gating Compliant
              </h3>
              <p className="text-xs text-[#615E5B] leading-relaxed">
                Unlike illegal gating solutions that block customers from writing public reviews, ZenTap preserves direct Google Maps review access for all star ratings, while providing a fast-track private resolution channel that guests willingly prefer.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-center justify-between text-xs font-mono text-emerald-800">
              <span>Google Merchant Policies Compliant</span>
              <span className="font-semibold">Safe for Profile Growth</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-[#1C1B1A] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#2C2B2A]">
          <div className="max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#D94826] font-semibold">
              Commercial Hardware Dispatch
            </span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white mt-1">
              Equip your front desk with smart review standees.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Laser-engraved with your custom business name and pre-programmed to your Google Maps review link. Includes courier delivery across India.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => onNavigate("pricing")}
              className="py-3 px-6 rounded-xl bg-[#D94826] hover:bg-[#C23C1D] text-white font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              View All 4 Standee &amp; Franchise Plans (From ₹500)
            </button>
            <button
              onClick={() => onOpenAuth("signup")}
              className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors cursor-pointer text-center"
            >
              Register Business Profile
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
