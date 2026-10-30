"use client";

import React, { useState, useRef } from "react";
import { 
  ArrowRight, 
  Radio, 
  Zap, 
  ShieldCheck, 
  QrCode, 
  TrendingUp, 
  Layers, 
  Cpu, 
  RefreshCw,
  MessageCircle,
  Calendar,
  Briefcase,
  Send,
  Palette,
  Check,
  Sparkles,
  Star,
  Sliders,
  Building2,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import Standee3DPreview from "../Standee3DPreview";
import SentimentSimulator from "../SentimentSimulator";
import { ActiveView } from "../Header";
import CardCustomizerModal from "@/components/CardCustomizerModal";
import { CustomCardDesign } from "@/lib/businessStore";
import { trackCtaClick, trackWhatsAppClick, trackPhoneClick } from "@/lib/analytics";
import { SpotlightCard, ShinyText, BlurText, CountUp, AuroraBackground, TiltedCard } from "@/components/react-bits";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

interface HomeViewProps {
  onNavigate: (view: ActiveView, plan?: any) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
  onTriggerTapReviewModal: () => void;
}

export default function HomeView({
  onNavigate,
  onOpenAuth,
  onTriggerTapReviewModal,
}: HomeViewProps) {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customDesign, setCustomDesign] = useState<CustomCardDesign | null>(null);
  const homeContainerRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Animations for smooth section entries
  useGSAP(() => {
    // 1. Staggered reveal for 3-step How It Works cards
    gsap.from(".step-card-stagger", {
      scrollTrigger: {
        trigger: ".steps-grid-trigger",
        start: "top 85%",
        once: true,
      },
      y: 35,
      opacity: 0,
      stagger: 0.15,
      duration: 0.75,
      ease: "power2.out",
    });

    // 2. Staggered reveal for 4 hardware product cards
    gsap.from(".product-card-stagger", {
      scrollTrigger: {
        trigger: ".products-grid-trigger",
        start: "top 85%",
        once: true,
      },
      y: 40,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: "power3.out",
    });
  }, { scope: homeContainerRef });

  return (
    <div ref={homeContainerRef} className="flex flex-col w-full animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. MINIMAL HERO SECTION (CLEAN, BOLD, EASY TO UNDERSTAND + REACT BITS)    */}
      {/* ========================================================================= */}
      <AuroraBackground className="w-full">
        <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Value Proposition */}
            <div className="lg:col-span-7 flex flex-col">
              
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#F2F0EB]/90 backdrop-blur-sm mb-6 border border-[#E2DFD8]">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[11px] font-mono font-semibold text-[#1C1B1A]">
                  Smart NFC &amp; Dynamic QR Standees &amp; Cards
                </span>
              </div>

              {/* Headline with React Bits BlurText & ShinyText */}
              <h1 className="font-headline font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#1C1B1A] tracking-tight leading-snug sm:leading-[1.14] mb-5">
                <BlurText text="Turn customer footfall into" delay={35} className="inline font-headline" />{" "}
                <ShinyText 
                  text="5-Star Google Reviews" 
                  color="#B91C1C" 
                  shineColor="#D4AF37" 
                  speed={3.5}
                  className="font-headline font-black underline decoration-[#D94826]/30 decoration-wavy inline-block"
                />{" "}
                and qualified leads instantly.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#615E5B] mb-6 leading-relaxed max-w-2xl font-sans">
                Precision-crafted NFC &amp; Dynamic QR cards and counter standees for restaurants, salons, clinics, and professional networking. Zero apps to download, 0.6-second instant tap detection, and 100% Google policy compliant.
              </p>

              {/* Local SEO Callout Bar */}
              <div className="mb-8 p-4 rounded-2xl bg-[#F2F0EB]/85 backdrop-blur-sm border border-[#E2DFD8] flex items-center gap-3.5 text-xs text-[#1C1B1A]">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#E2DFD8]">
                  <TrendingUp className="w-4 h-4 text-[#D94826]" />
                </div>
                <span>
                  <strong>Verified Google Maps SEO Lift:</strong> High review velocity and customer interaction signal high authority to Google algorithms, driving your business to the Local 3-Pack.
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-10">
                <button
                  onClick={() => {
                    trackCtaClick("hero_view_products", "pricing");
                    onNavigate("pricing");
                  }}
                  className="py-3.5 px-6 rounded-xl bg-[#1C1B1A] text-white hover:bg-[#2C2B2A] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>View Products &amp; Pricing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    trackCtaClick("hero_customize_standee", "customizer_modal");
                    setIsCustomizerOpen(true);
                  }}
                  className="py-3.5 px-6 rounded-xl bg-white hover:bg-[#F2F0EB] text-[#1C1B1A] font-bold text-xs border border-[#E2DFD8] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[44px]"
                >
                  <Palette className="w-4 h-4 text-[#D94826]" />
                  <span>Customize Standee &amp; Logo</span>
                </button>

                <button
                  onClick={() => {
                    trackCtaClick("hero_tap_simulator", "tap_modal");
                    onTriggerTapReviewModal();
                  }}
                  className="py-3.5 px-5 rounded-xl bg-[#F2F0EB] hover:bg-[#E2DFD8] text-[#1C1B1A] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Tap Simulator</span>
                </button>
              </div>

              {/* Technical Verification Metrics with React Bits CountUp */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E2DFD8] text-xs">
                <div>
                  <p className="font-headline font-extrabold text-2xl text-[#1C1B1A]">
                    <CountUp to={0.6} decimals={1} suffix="s" />
                  </p>
                  <p className="text-[11px] font-mono text-[#615E5B] mt-0.5">Average Tap Velocity</p>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-2xl text-[#1C1B1A]">
                    <CountUp to={100} suffix="%" />
                  </p>
                  <p className="text-[11px] font-mono text-[#615E5B] mt-0.5">Zero App Install Required</p>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-2xl text-[#1C1B1A]">NTAG216</p>
                  <p className="text-[11px] font-mono text-[#615E5B] mt-0.5">Certified 888-Byte NFC Chip</p>
                </div>
              </div>
            </div>

            {/* Right: Physical Standee Specimen */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <Standee3DPreview onTapSuccess={onTriggerTapReviewModal} />
            </div>
          </div>
        </section>
      </AuroraBackground>

      {/* ========================================================================= */}
      {/* 2. HOW IT WORKS (3 SIMPLE STEPS — MINIMAL & EASY TO UNDERSTAND)           */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#FAF9F6] border-y border-[#E2DFD8] w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D94826] font-bold">
              Simple 3-Step Process
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1C1B1A] mt-1 tracking-tight">
              How ZenTap Works
            </h2>
            <p className="text-xs sm:text-sm text-[#615E5B] mt-2 leading-relaxed">
              Designed for zero friction. Guests tap with their smartphone and connect with your business in under 1 second.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 steps-grid-trigger">
            
            {/* Step 1 */}
            <div className="p-7 rounded-3xl bg-white border border-[#E2DFD8] shadow-sm flex flex-col justify-between step-card-stagger">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#F2F0EB] border border-[#E2DFD8] flex items-center justify-center text-[#1C1B1A] font-headline font-bold text-lg mb-5">
                  1
                </div>
                <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mb-2">
                  1. Tap Phone or Scan QR
                </h3>
                <p className="text-xs text-[#615E5B] leading-relaxed">
                  Guest brings any iPhone or Android phone within 4cm of your standee or smart card. No app, download, or Bluetooth pairing needed.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-center gap-2 text-[11px] text-[#1C1B1A] font-semibold">
                <Radio className="w-3.5 h-3.5 text-[#D94826]" />
                <span>Instant 0.6s NFC detection</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-3xl bg-white border border-[#E2DFD8] shadow-sm flex flex-col justify-between step-card-stagger">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#F2F0EB] border border-[#E2DFD8] flex items-center justify-center text-[#1C1B1A] font-headline font-bold text-lg mb-5">
                  2
                </div>
                <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mb-2">
                  2. Direct Review or Dynamic Profile
                </h3>
                <p className="text-xs text-[#615E5B] leading-relaxed">
                  Opens Google Review directly or launches your interactive profile with WhatsApp chat, table booking, and digital portfolio showcase.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-center gap-2 text-[11px] text-[#1C1B1A] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Review assistant in EN, GU, HI</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-3xl bg-white border border-[#E2DFD8] shadow-sm flex flex-col justify-between step-card-stagger">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#F2F0EB] border border-[#E2DFD8] flex items-center justify-center text-[#1C1B1A] font-headline font-bold text-lg mb-5">
                  3
                </div>
                <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mb-2">
                  3. Capture Leads &amp; Boost SEO
                </h3>
                <p className="text-xs text-[#615E5B] leading-relaxed">
                  Inquiries from built-in forms route straight to your merchant dashboard, while verified reviews elevate your Google Business ranking.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E2DFD8] flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live leads &amp; Google Local 3-Pack lift</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE 4 PRODUCTS LINEUP                                                 */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D94826] font-bold">
              Product Ecosystem
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1C1B1A] mt-1 tracking-tight">
              Smart NFC Hardware Lineup
            </h2>
            <p className="text-xs sm:text-sm text-[#615E5B] mt-1.5 max-w-xl">
              Choose between pure direct Google review hardware, luxury metal with auto-replies, dynamic PVC cards, or corporate bulk fleets.
            </p>
          </div>

          <button
            onClick={() => onNavigate("pricing")}
            className="self-start md:self-auto py-2.5 px-5 rounded-xl bg-[#1C1B1A] text-white font-bold text-xs hover:bg-[#2C2B2A] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Compare All Features</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 products-grid-trigger">
          
          {/* Product 1: Simple QR/NFC */}
          <SpotlightCard 
            onClick={() => onNavigate("pricing", "card_500")}
            spotlightColor="rgba(217, 72, 38, 0.16)"
            className="p-6 rounded-3xl bg-white border border-[#E2DFD8] hover:border-[#D94826]/60 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F2F0EB] text-[#1C1B1A] text-[10px] font-bold uppercase tracking-wider">
                Direct Review Mode
              </span>
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mt-3 group-hover:text-[#D94826] transition-colors">
                Simple QR / NFC
              </h3>
              <p className="text-xs text-[#615E5B] mt-1 leading-relaxed">
                Card or Counter Standee. Opens the Google review page directly without intermediate steps.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E2DFD8]">
                <span className="font-headline font-extrabold text-2xl text-[#1C1B1A]">₹499</span>
                <span className="text-[10px] text-[#615E5B] block font-semibold">Card • ₹999 Standee</span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-[#1C1B1A]">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D94826] flex-shrink-0" />
                  <span>Pure 1-tap/scan direct to Google review</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D94826] flex-shrink-0" />
                  <span>Zero monthly subscription fees</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D94826] flex-shrink-0" />
                  <span>NTAG216 chip + Level-Q QR code</span>
                </li>
              </ul>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-xl bg-[#F2F0EB] group-hover:bg-[#1C1B1A] group-hover:text-white text-xs font-bold transition-all text-center">
              Order Simple NFC
            </button>
          </SpotlightCard>

          {/* Product 2: Metal NFC/QR with Auto Replies */}
          <SpotlightCard 
            onClick={() => onNavigate("pricing", "standee_auto_2000")}
            spotlightColor="rgba(212, 175, 55, 0.28)"
            className="p-6 rounded-3xl bg-[#1C1B1A] text-white border-2 border-[#D4AF37] shadow-xl transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between relative overflow-hidden product-card-stagger"
          >
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-wider">
              Popular • Metal
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#F7E7A9] text-[10px] font-bold uppercase tracking-wider">
                Luxury Finish
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3">
                Metal NFC / Standee + Replies
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Brushed luxury metal card or acrylic standee with review assistant + 24/7 automated Google review replies.
              </p>
              <div className="mt-4 pt-3 border-t border-white/20">
                <span className="font-headline font-extrabold text-2xl text-white">₹1,999</span>
                <span className="text-[10px] text-zinc-300 block font-semibold">+ Auto Reply Engine</span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-zinc-200">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>24/7 Automated Google review replies</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>Review suggestions in English, Gujarati, Hindi</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>Negative review shield (1-2★ private)</span>
                </li>
              </ul>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F7E7A9] via-[#D4AF37] to-[#9A7B1C] text-black text-xs font-bold transition-all text-center shadow-md">
              Order Metal Review
            </button>
          </SpotlightCard>

          {/* Product 3: PVC NFC Card */}
          <SpotlightCard 
            onClick={() => onNavigate("pricing", "standee_1500")}
            spotlightColor="rgba(14, 165, 233, 0.16)"
            className="p-6 rounded-3xl bg-white border border-[#E2DFD8] hover:border-[#D94826]/60 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider">
                Dynamic Profile
              </span>
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mt-3 group-hover:text-[#D94826] transition-colors">
                PVC NFC Card
              </h3>
              <p className="text-xs text-[#615E5B] mt-1 leading-relaxed">
                Full-color custom printed PVC card with Dynamic Profile: WhatsApp, Booking, Portfolio &amp; Lead Capture.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E2DFD8]">
                <span className="font-headline font-extrabold text-2xl text-[#1C1B1A]">₹699</span>
                <span className="text-[10px] text-[#615E5B] block font-semibold">Custom Printed Card</span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-[#1C1B1A]">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D94826] flex-shrink-0" />
                  <span>Dynamic Profile with WhatsApp &amp; Booking</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D94826] flex-shrink-0" />
                  <span>Built-in lead capture enquiry form</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D94826] flex-shrink-0" />
                  <span>High-durability waterproof PVC print</span>
                </li>
              </ul>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-xl bg-[#F2F0EB] group-hover:bg-[#1C1B1A] group-hover:text-white text-xs font-bold transition-all text-center">
              Order PVC Card
            </button>
          </SpotlightCard>

          {/* Product 4: Corporate Bulk Cards */}
          <SpotlightCard 
            onClick={() => onNavigate("pricing", "franchise_custom")}
            spotlightColor="rgba(217, 119, 6, 0.18)"
            className="p-6 rounded-3xl bg-white border border-[#E2DFD8] hover:border-amber-500/60 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                Enterprise Teams
              </span>
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A] mt-3 group-hover:text-amber-600 transition-colors">
                Corporate Bulk Cards
              </h3>
              <p className="text-xs text-[#615E5B] mt-1 leading-relaxed">
                Centralized dashboard management to issue, update, and reassign employee cards without physical reprints.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E2DFD8]">
                <span className="font-headline font-extrabold text-2xl text-amber-600">Custom Quote</span>
                <span className="text-[10px] text-[#615E5B] block font-semibold">From ₹499/Card</span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-[#1C1B1A]">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Centralized team &amp; employee portal</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Zero reprint cost on role or contact updates</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Multi-location PAN-India logistics</span>
                </li>
              </ul>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all text-center">
              Get Corporate Quote
            </button>
          </SpotlightCard>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DYNAMIC PROFILE & LEAD CAPTURE HIGHLIGHT                               */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-[#FAF9F6] border-y border-[#E2DFD8] w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D94826] font-bold">
              Interaction &amp; Lead Generation
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#1C1B1A] tracking-tight">
              More than reviews: Your Complete Digital Customer Front Desk
            </h2>
            <p className="text-xs sm:text-sm text-[#615E5B] leading-relaxed">
              When guests tap your standee or card, they can not only write 5-star Google reviews, but also engage directly with your brand through an app-free digital hub:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E2DFD8] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1B1A]">1-Tap WhatsApp Direct Chat</h4>
                  <p className="text-[11px] text-[#615E5B]">Connects guests with your staff or owner directly with a prefilled message.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2DFD8] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1B1A]">Table &amp; Appointment Booking</h4>
                  <p className="text-[11px] text-[#615E5B]">Direct link to your Calendly, table reservation system, or clinic booking.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2DFD8] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#8C6D2B] flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1B1A]">Digital Menu &amp; Portfolio Showcase</h4>
                  <p className="text-[11px] text-[#615E5B]">Allows diners and clients to view your services, photo galleries &amp; PDF menus.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E2DFD8] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1B1A]">Built-in Lead Capture Form</h4>
                  <p className="text-[11px] text-[#615E5B]">Inquiries route straight to your merchant dashboard with real-time alerts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Card Preview Teaser */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 rounded-3xl bg-white border border-[#E2DFD8] shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#615E5B] mb-4 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#D94826]" />
              <span>Interactive Hardware Design Studio</span>
            </span>

            <p className="text-xs text-[#615E5B] text-center max-w-sm mb-6">
              Preview your logo engraved on Matte Obsidian Black, Brushed Silver Metal, Champagne Gold, or Emerald finish.
            </p>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="py-3 px-6 rounded-2xl bg-[#1C1B1A] text-white hover:bg-[#2C2B2A] font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Sliders className="w-4 h-4" />
              <span>Launch 3D Card &amp; Standee Customizer</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE SENTIMENT SIMULATOR (GOOGLE COMPLIANCE BENCHMARK)          */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
        <SentimentSimulator />
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION BANNER                                                  */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-[#1C1B1A] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#2C2B2A] shadow-xl">
          <div className="max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#D94826] font-bold">
              Express PAN-India Courier Dispatch
            </span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white mt-1">
              Equip your front desk with smart review standees today.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Custom laser-engraved with your business name and logo, pre-configured with your Google Maps link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => onNavigate("pricing")}
              className="py-3.5 px-6 rounded-xl bg-[#D94826] hover:bg-[#C23C1D] text-white font-bold text-xs transition-colors cursor-pointer text-center shadow-md"
            >
              Order Standee or Card (From ₹499)
            </button>
            <button
              onClick={() => onOpenAuth("signup")}
              className="py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors cursor-pointer text-center"
            >
              Merchant Sign In / Register
            </button>
          </div>
        </div>
      </section>

      {/* Hardware Design Studio Customizer Modal */}
      <CardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        initialDesign={customDesign || undefined}
        businessName="YOUR BUSINESS"
        onSaveDesign={(d) => setCustomDesign(d)}
        onProceedOrder={(d) => {
          setCustomDesign(d);
          onNavigate("pricing");
        }}
      />

    </div>
  );
}
