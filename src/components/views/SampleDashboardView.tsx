"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
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
  Info,
  Check,
  Download,
  Cpu,
  Wifi,
  ShieldAlert,
  ShoppingBag,
  ChevronRight,
  Lock
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
  const [reviewClicks, setReviewClicks] = useState(382);
  const [privateFeedbacks, setPrivateFeedbacks] = useState(14);
  const [simulatedToast, setSimulatedToast] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Sample Profile form state
  const [sampleReviewUrl, setSampleReviewUrl] = useState("https://www.google.com/maps/place//@23.0393793,72.6446507,17z/data=!3m1!4b1!4m3!3m2!1s0x395e87bea719fdfb:0x6828d7aee1d857d2!12e1?entry=ttu&g_ep=EgoyMDI2MTAyNy4wIKXMDSoASAFQAw%3D%3D");
  const [sampleBizName, setSampleBizName] = useState("ZenTap.in Digital Solutions");
  const [samplePhone, setSamplePhone] = useState("+91 92745 60880");
  const [sampleCity, setSampleCity] = useState("Ahmedabad");

  const handleSimulate = (type: "nfc" | "qr") => {
    setTotalTaps((prev) => prev + 1);
    if (type === "nfc") setNfcTaps((prev) => prev + 1);
    else setQrScans((prev) => prev + 1);

    setSimulatedToast(`✓ Simulated guest ${type.toUpperCase()} tap! Live scan counter updated.`);
    setTimeout(() => setSimulatedToast(""), 3500);
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setSimulatedToast("✓ Copied Review Assistant link to clipboard!");
      setTimeout(() => {
        setCopiedLink(false);
        setSimulatedToast("");
      }, 2500);
    }
  };

  const handleSaveDemoLink = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulatedToast("✓ Google Review link updated! Real-time NFC and QR routing synced.");
    setTimeout(() => setSimulatedToast(""), 3500);
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://www.zentapdigitalsolutions.com";
  const assistantUrl = `${originUrl}/r/zentap`;

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Alert */}
      {simulatedToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{simulatedToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-headline font-black text-xs uppercase tracking-wider">
            Interactive Showcase
          </span>
          <p className="text-xs text-on-surface-variant">
            Full demonstration of the <strong className="text-on-surface">Client Merchant Dashboard</strong> for ZenTap.in Digital Solutions (Ahmedabad).
          </p>
        </div>

        <button
          onClick={onNavigateToPricing}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          Order Your Standee (₹1,500)
        </button>
      </div>

      {/* Top Profile Summary Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-low p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-surface-variant/40 shadow-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-on-primary flex items-center justify-center font-headline font-black text-2xl shadow-md border border-white/20">
            Z
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Subscribed Client · Paid
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Slug: /r/zentap
              </span>
            </div>

            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
              ZenTap.in Digital Solutions
            </h1>

            <p className="text-xs text-on-surface-variant mt-0.5 flex flex-wrap items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>Ahmedabad, Gujarat, India</span>
              <span className="mx-1">•</span>
              <Phone className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>+91 92745 60880</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <a
            href={`${originUrl}/r/zentap?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface border border-secondary/40 text-xs font-bold text-on-surface hover:border-secondary shadow-sm transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-secondary" />
            <span>Test Customer Flow</span>
          </a>

          <button
            onClick={() => onOpenAuth("signup")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 shadow-sm transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Register Your Business</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GOOGLE REVIEW ASSISTANT PAGE LINK & CURRENT PLAN                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Destination link card */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-bold text-secondary">
                  Live Customer Destination
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700">
                ✓ Google Review Link Active
              </span>
            </div>

            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              Your Google Review Assistant Page
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              When customers tap your physical standee or scan the QR code at your billing counter, they launch this high-converting review page. 4-5★ ratings post to Google Maps; 1-2★ ratings provide confidential feedback directly to you.
            </p>

            {/* 1-Click Copy Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-surface-container-low border border-surface-variant/50 mb-4">
              <div className="flex items-center gap-2 px-2 flex-1 min-w-0">
                <Wifi className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-xs font-mono text-on-surface truncate select-all">
                  {assistantUrl}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(assistantUrl)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-container-high border border-surface-variant/50 text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                </button>
                <a
                  href={`${assistantUrl}?preview=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Flow</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-variant/30 flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-secondary" />
              <span>NFC Direct Tap URL: <code className="font-mono text-on-surface font-semibold">{assistantUrl}?s=nfc</code></span>
            </span>
            <span className="text-emerald-600 font-bold">
              ✓ NTAG216 Chip Programmed
            </span>
          </div>
        </div>

        {/* Current Plan with Us */}
        <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                Current Plan With Us
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold">
                Paid &amp; Active
              </span>
            </div>

            <div className="my-2">
              <h4 className="font-headline font-bold text-xl text-on-surface">
                Standee + AI Automation Engine (₹2,000)
              </h4>
              <span className="block text-xs text-emerald-600 font-semibold mt-1">
                ✓ Lifetime Standee &amp; WhatsApp AI Engine
              </span>
            </div>

            <div className="space-y-2 mt-4 text-xs text-on-surface-variant">
              <div className="flex justify-between py-1 border-b border-surface-variant/20">
                <span>Hardware Chip:</span>
                <span className="font-semibold text-on-surface">NTAG216 (888 Bytes)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-variant/20">
                <span>Payment Status:</span>
                <span className="font-semibold text-emerald-600">Paid &amp; Verified</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-variant/20">
                <span>Counter Touchpoints:</span>
                <span className="font-semibold text-on-surface">1 Standee Deployed</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Google Anti-Gating:</span>
                <span className="font-semibold text-emerald-600">100% Policy Compliant</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-surface-variant/30">
            <button
              onClick={onNavigateToPricing}
              className="w-full py-2.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Additional Touchpoints</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. QR & NFC SCAN ANALYTICS                                                */}
      {/* ========================================================================= */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface">
              QR &amp; NFC Scan Analytics
            </h3>
            <p className="text-xs text-on-surface-variant">
              Real-time telemetry from your counter touchpoint. Try clicking the test buttons!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulate("nfc")}
              className="px-3.5 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-secondary animate-pulse" />
              <span>+ Test NFC Tap</span>
            </button>
            <button
              onClick={() => handleSimulate("qr")}
              className="px-3.5 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-secondary" />
              <span>+ Test QR Scan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Total Customer Scans
            </span>
            <div className="my-2">
              <span className="font-headline font-black text-3xl sm:text-4xl text-on-surface">
                {totalTaps}
              </span>
              <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
                NFC: {nfcTaps} • QR: {qrScans}
              </span>
            </div>
            <div className="w-full bg-surface-variant/30 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-emerald-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, (nfcTaps / (totalTaps || 1)) * 100)}%` }} 
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Google Review Clicks
            </span>
            <div className="my-2">
              <span className="font-headline font-black text-3xl sm:text-4xl text-secondary">
                {reviewClicks}
              </span>
              <span className="block text-[11px] text-secondary font-semibold mt-1">
                ~88% Conversion to Google Maps
              </span>
            </div>
            <div className="w-full bg-secondary/20 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-secondary h-full rounded-full w-[88%]" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Private Feedbacks (1-2★)
            </span>
            <div className="my-2">
              <span className="font-headline font-black text-3xl sm:text-4xl text-red-500">
                {privateFeedbacks}
              </span>
              <span className="block text-[11px] text-red-500 font-semibold mt-1">
                Defused privately out of Google
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant">
              Direct store management notes
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Stars Distribution
            </span>
            <div className="space-y-1 my-1 text-[11px]">
              <div className="flex justify-between">
                <span>5 Stars:</span>
                <span className="font-bold text-amber-500">320</span>
              </div>
              <div className="flex justify-between">
                <span>4 Stars:</span>
                <span className="font-bold text-amber-500">62</span>
              </div>
              <div className="flex justify-between">
                <span>1-3 Stars:</span>
                <span className="font-bold text-zinc-400">32</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">91% Positive Ratio</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LINK GOOGLE BUSINESS PROFILE & STANDEE VISUAL                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* FORM: LINK GOOGLE BUSINESS PROFILE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-secondary" />
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Link Google Business Profile Review URL
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            Connect your business&apos;s real Google Maps review dialog. You can change this link anytime—your physical standee will automatically redirect to the new link.
          </p>

          <form onSubmit={handleSaveDemoLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Google Review URL (Direct Write-Review Link) *
              </label>
              <input
                type="url"
                value={sampleReviewUrl}
                onChange={(e) => setSampleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/your-code/review"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px]">
                <span className="text-on-surface-variant">
                  Example: <code className="text-secondary font-mono">https://g.page/r/.../review</code>
                </span>
                <a
                  href={sampleReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-secondary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={sampleBizName}
                  onChange={(e) => setSampleBizName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Store Phone Number
                </label>
                <input
                  type="text"
                  value={samplePhone}
                  onChange={(e) => setSamplePhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Link to Standee</span>
            </button>
          </form>
        </div>

        {/* Laser Standee Visual & QR Preview */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col items-center text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">
            Hardware Touchpoint
          </span>
          <h3 className="font-headline font-bold text-xl text-on-surface mb-4">
            Custom Laser-Engraved Standee
          </h3>

          <div className="mb-4">
            <StandeeVisual type="standee_auto_2000" businessName="ZENTAP.IN" />
          </div>

          <div className="w-full p-2.5 rounded-xl bg-surface border border-surface-variant/40 text-xs font-mono text-on-surface truncate mb-4">
            {assistantUrl}?s=qr
          </div>

          <a
            href={`${assistantUrl}?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Live Customer Assistant</span>
          </a>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. STANDEE ORDER TRACKING & DISPATCH STATUS                               */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Standee Order Tracking &amp; Delivery Status
              </h3>
              <p className="text-xs text-on-surface-variant">
                Live production status from CNC laser cutting to store counter delivery.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-xs border border-emerald-500/30">
            Order Dispatched &amp; Delivered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/30">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
            <h4 className="font-bold text-xs text-on-surface">1. Order Confirmed</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Razorpay payment verified.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/30">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
            <h4 className="font-bold text-xs text-on-surface">2. Laser Engraving</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">NTAG216 chip encoded &amp; tested.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/30">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
            <h4 className="font-bold text-xs text-on-surface">3. Signal Inspection</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">RF 13.56MHz compliance verified.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/50 shadow-sm relative overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
            <h4 className="font-bold text-xs text-on-surface">4. Delivered to Counter</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">BlueDart Express AWB #BD-84920194</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container text-xs space-y-2">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-on-surface-variant">Order Identifier:</span>
            <span className="font-mono font-bold text-on-surface">#ZT-ORD-VGP-94102</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-on-surface-variant">Product Model:</span>
            <span className="font-bold text-on-surface">Standee + AI Automation Engine (₹2,000)</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-on-surface-variant">Courier Partner:</span>
            <span className="font-bold text-on-surface">BlueDart Express</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-on-surface-variant">Delivery Address:</span>
            <span className="font-bold text-on-surface">Shop 12-14, Shivalik Arcade, Nikol Gam Road, Ahmedabad, Gujarat 382350</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PRIVATE NEGATIVE FEEDBACK INBOX                                        */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Private Customer Feedbacks (2 Active)
            </h3>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">
            Confidential guest alerts defused before reaching Google
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-red-500/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold text-xs">★★☆☆☆</span>
                <span className="font-bold text-xs text-on-surface">Krunal Shah</span>
              </div>
              <span className="text-[10px] text-on-surface-variant">Yesterday, 6:42 PM</span>
            </div>
            <p className="text-xs text-on-surface-variant italic mb-2">
              &quot;Waiting time at counter was 20 minutes for gold hallmarking certificate.&quot;
            </p>
            <a
              href="tel:+919825012345"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              <Phone className="w-3 h-3" />
              <span>Call Customer: +91 98250 12345</span>
            </a>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-red-500/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold text-xs">★☆☆☆☆</span>
                <span className="font-bold text-xs text-on-surface">Bhavik Mehta</span>
              </div>
              <span className="text-[10px] text-on-surface-variant">3 days ago</span>
            </div>
            <p className="text-xs text-on-surface-variant italic mb-2">
              &quot;Parking was completely full during Diwali evening rush.&quot;
            </p>
            <a
              href="tel:+919712345678"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              <Phone className="w-3 h-3" />
              <span>Call Customer: +91 97123 45678</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
