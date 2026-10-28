"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Radio, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  QrCode, 
  Truck, 
  Activity, 
  ArrowRight,
  Copy,
  Info
} from "lucide-react";
import StandeeVisual from "@/components/StandeeVisuals";

interface SampleDashboardViewProps {
  onNavigateToPricing: () => void;
  onOpenAuth: (tab: "signin" | "signup" | "admin") => void;
}

export default function SampleDashboardView({ onNavigateToPricing, onOpenAuth }: SampleDashboardViewProps) {
  const [totalTaps, setTotalTaps] = useState(1428);
  const [nfcTaps, setNfcTaps] = useState(1114);
  const [qrScans, setQrScans] = useState(314);
  const [simulatedToast, setSimulatedToast] = useState("");

  const handleSimulate = (type: "nfc" | "qr") => {
    setTotalTaps((prev) => prev + 1);
    if (type === "nfc") setNfcTaps((prev) => prev + 1);
    else setQrScans((prev) => prev + 1);

    setSimulatedToast(`✓ Simulated guest ${type.toUpperCase()} tap! Total taps: ${totalTaps + 1}`);
    setTimeout(() => setSimulatedToast(""), 3500);
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://zentap.ai";

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      
      {/* Toast Alert */}
      {simulatedToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{simulatedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Interactive Merchant Showcase</span>
        </div>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface tracking-tight">
          Sample Dashboard for Business Owners
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          See exactly what your merchant portal looks like once your custom standee is deployed and active at your counter.
        </p>
      </div>

      {/* Read-Only Demo Notice with Sample Data Badge */}
      <div className="mb-8 p-4 rounded-2xl bg-secondary/10 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-headline font-black text-xs uppercase tracking-wider">
            Sample Data Demo
          </span>
          <p className="text-xs text-on-surface-variant">
            Demonstrating active merchant metrics for <strong className="text-on-surface">Virat Gold Palace (Nikol, Ahmedabad)</strong>. Test live taps below!
          </p>
        </div>

        <button
          onClick={onNavigateToPricing}
          className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          Buy Your Standee Now
        </button>
      </div>

      {/* Top Profile Summary Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-surface-container-low p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-surface-variant/40 shadow-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-on-primary flex items-center justify-center font-headline font-black text-2xl shadow-md border border-white/20">
            V
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Integration Status: Live
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Fleet Unit #ZT-94102
              </span>
            </div>

            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
              Virat Gold Palace
            </h2>

            <p className="text-xs text-on-surface-variant mt-0.5 flex flex-wrap items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>Shop 12-14, Shivalik Arcade, Nikol Gam Road, Ahmedabad, Gujarat, 382350</span>
              <span className="mx-1">•</span>
              <Phone className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>+91 87884 16911</span>
            </p>
          </div>
        </div>

        {/* Live Simulator Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => handleSimulate("nfc")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 shadow-sm transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Simulate NFC Tap (+1)</span>
          </button>

          <button
            onClick={() => handleSimulate("qr")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface border border-secondary/40 text-xs font-bold text-on-surface hover:border-secondary shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-secondary" />
            <span>Simulate QR Scan (+1)</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        
        {/* Total Guest Taps */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Total Guest Scans
            </span>
            <Radio className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-3">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              {totalTaps}
            </span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
              {nfcTaps} NFC Taps • {qrScans} QR Scans
            </span>
          </div>
          <div className="w-full bg-emerald-100 dark:bg-emerald-950/40 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[78%]" />
          </div>
        </div>

        {/* Google Star Rating */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Live Google Rating
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
                4.9
              </span>
              <span className="text-xs text-on-surface-variant font-medium">/ 5.0</span>
            </div>
            <span className="block text-[11px] text-amber-600 font-semibold mt-1">
              Top Ranked in Nikol
            </span>
          </div>
          <div className="flex text-amber-500 text-xs">
            {"★".repeat(5)}
          </div>
        </div>

        {/* Reviews Generated */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              5-Star Conversions
            </span>
            <Sparkles className="w-4 h-4 text-secondary" />
          </div>
          <div className="my-3">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              382
            </span>
            <span className="block text-[11px] text-secondary font-semibold mt-1">
              ~88% Conversion Velocity
            </span>
          </div>
          <div className="w-full bg-secondary/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full w-[92%]" />
          </div>
        </div>

        {/* Rating Shield Interceptions */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Rating Shield Saved
            </span>
            <ShieldCheck className="w-4 h-4 text-red-500" />
          </div>
          <div className="my-3">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              14
            </span>
            <span className="block text-[11px] text-red-500 font-semibold mt-1">
              Negative complaints kept private
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant">
            Direct manager SMS resolution
          </span>
        </div>

      </div>

      {/* SEO Boost Callout Box */}
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-secondary/15 via-primary/10 to-secondary/15 border border-secondary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">
              Helps Boost Your Google Profile Reach, Views &amp; Optimizes Overall SEO
            </h4>
            <p className="text-xs text-on-surface-variant">
              Every customer review directly strengthens your business profile keywords, search volume, and Google Maps ranking.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToPricing}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          Get This Dashboard with Standee
        </button>
      </div>

      {/* Hardware + Live Assistant Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">
            What You Receive: Custom Laser-Engraved Standee
          </span>
          <StandeeVisual
            type="standee_auto_2000"
            businessName="VIRAT GOLD PALACE"
          />
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between h-full">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
              What Customers Experience
            </span>
            <h3 className="font-headline font-bold text-xl text-on-surface mt-1 mb-2">
              Customized Google Review Assistant
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              When customers tap this standee, they launch a branded assistant tailored to your business with Gujarati, Hindi, and English options. All ratings (1 to 5) can post to Google, and 1-2 star ratings additionally offer confidential feedback directly to you.
            </p>

            <div className="p-3.5 rounded-2xl bg-surface-container space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">NFC Standee Target:</span>
                <span className="font-mono font-bold text-on-surface">{originUrl}/r/virat-gold-palace?s=nfc</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Laser QR Target:</span>
                <span className="font-mono font-bold text-on-surface">{originUrl}/r/virat-gold-palace?s=qr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Google Redirect:</span>
                <span className="font-bold text-emerald-600">302 to Live Google Maps Review Form</span>
              </div>
            </div>
          </div>

          <a
            href={`${originUrl}/r/virat-gold-palace?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-secondary-container" />
            <span>Test Customer Review Assistant in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
}
