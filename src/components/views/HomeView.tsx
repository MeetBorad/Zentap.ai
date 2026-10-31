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
import HyperFramesPlayer from "../HyperFramesPlayer";
import PhysicalStandeeGallery from "../PhysicalStandeeGallery";
import { ActiveView } from "../Header";
import CardCustomizerModal from "@/components/CardCustomizerModal";
import { CustomCardDesign } from "@/lib/businessStore";
import { trackCtaClick, trackWhatsAppClick, trackPhoneClick } from "@/lib/analytics";
import { SpotlightCard, ShinyText, BlurText, CountUp, AuroraBackground, TiltedCard } from "@/components/react-bits";
import { OpenDesignButton, OpenDesignBadge, OpenDesignCard } from "@/components/open-design";
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
    // 1. Staggered reveal for 3-step How It Works cards (with safe initial opacity)
    gsap.fromTo(
      ".step-card-stagger",
      { y: 25, opacity: 0.3 },
      {
        scrollTrigger: {
          trigger: ".steps-grid-trigger",
          start: "top 90%",
          once: true,
        },
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.65,
        ease: "power2.out",
      }
    );

    // 2. Staggered reveal for 4 hardware product cards (with safe initial opacity)
    gsap.fromTo(
      ".product-card-stagger",
      { y: 25, opacity: 0.3 },
      {
        scrollTrigger: {
          trigger: ".products-grid-trigger",
          start: "top 90%",
          once: true,
        },
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.65,
        ease: "power3.out",
      }
    );
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
              
              {/* OpenDesign Pill Badge */}
              <div className="mb-6 self-start">
                <OpenDesignBadge variant="neutral">
                  Smart NFC &amp; Dynamic QR Standees &amp; Cards
                </OpenDesignBadge>
              </div>

              {/* Headline with 100% visible high contrast typography */}
              <h1 className="font-headline font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-snug sm:leading-[1.14] mb-5">
                Turn customer footfall into{" "}
                <span className="text-[#ff7a00] font-black underline decoration-[#ff7a00]/40 decoration-wavy inline-block">
                  5-Star Google Reviews
                </span>{" "}
                and qualified leads instantly.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-200 mb-6 leading-relaxed max-w-2xl font-sans">
                Precision-crafted NFC &amp; Dynamic QR cards and counter standees for restaurants, salons, clinics, and professional networking. Zero apps to download, 0.6-second instant tap detection, and 100% Google policy compliant.
              </p>

              {/* Local SEO Callout Bar */}
              <div className="mb-8 p-4 rounded-2xl bg-[#161a26] border border-[#2d3345] flex items-center gap-3.5 text-xs text-white">
                <div className="w-8 h-8 rounded-xl bg-[#1e2230] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#2d3345]">
                  <TrendingUp className="w-4 h-4 text-[#ff7a00]" />
                </div>
                <span className="text-slate-200 leading-normal">
                  <strong className="text-white font-bold">Verified Google Maps SEO Lift:</strong> High review velocity and customer interaction signal high authority to Google algorithms, driving your business to the Local 3-Pack.
                </span>
              </div>

              {/* OpenDesign Tactile CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-10">
                <OpenDesignButton
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => {
                    trackCtaClick("hero_view_products", "pricing");
                    onNavigate("pricing");
                  }}
                >
                  View Products &amp; Pricing
                </OpenDesignButton>

                <OpenDesignButton
                  variant="secondary"
                  size="lg"
                  icon={<Palette className="w-4 h-4 text-[#ff7a00]" />}
                  iconPosition="left"
                  onClick={() => {
                    trackCtaClick("hero_customize_standee", "customizer_modal");
                    setIsCustomizerOpen(true);
                  }}
                >
                  Customize Standee &amp; Logo
                </OpenDesignButton>

                <OpenDesignButton
                  variant="subtle"
                  size="lg"
                  icon={<Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                  iconPosition="left"
                  onClick={() => {
                    trackCtaClick("hero_tap_simulator", "tap_modal");
                    onTriggerTapReviewModal();
                  }}
                >
                  Tap Simulator
                </OpenDesignButton>
              </div>

              {/* Technical Verification Metrics with React Bits CountUp */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#232734] text-xs">
                <div>
                  <p className="font-headline font-extrabold text-2xl text-white">
                    <CountUp to={0.6} decimals={1} suffix="s" />
                  </p>
                  <p className="text-[11px] font-mono text-slate-300 mt-0.5">Average Tap Velocity</p>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-2xl text-white">
                    <CountUp to={100} suffix="%" />
                  </p>
                  <p className="text-[11px] font-mono text-slate-300 mt-0.5">Zero App Install Required</p>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-2xl text-white">NTAG216</p>
                  <p className="text-[11px] font-mono text-slate-300 mt-0.5">Certified 888-Byte NFC Chip</p>
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
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#0a0c10] border-y border-[#232734] w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff7a00] font-bold">
              Simple 3-Step Process
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white mt-1 tracking-tight">
              How ZenTap Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
              Designed for zero friction. Guests tap with their smartphone and connect with your business in under 1 second.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 steps-grid-trigger">
            
            {/* Step 1 */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1e2230] border border-[#2d3345] flex items-center justify-center text-white font-headline font-bold text-lg mb-5">
                  1
                </div>
                <h3 className="font-headline font-bold text-lg text-white mb-2">
                  1. Tap Phone or Scan QR
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  Guest brings any iPhone or Android phone within 4cm of your standee or smart card. No app, download, or Bluetooth pairing needed.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-[11px] text-[#ff7a00] font-semibold">
                <Radio className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>Instant 0.6s NFC detection</span>
              </div>
            </OpenDesignCard>

            {/* Step 2 */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1e2230] border border-[#2d3345] flex items-center justify-center text-white font-headline font-bold text-lg mb-5">
                  2
                </div>
                <h3 className="font-headline font-bold text-lg text-white mb-2">
                  2. Direct Review or Dynamic Profile
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  Opens Google Review directly or launches your interactive profile with WhatsApp chat, table booking, and digital portfolio showcase.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-[11px] text-amber-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Review assistant in EN, GU, HI</span>
              </div>
            </OpenDesignCard>

            {/* Step 3 */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1e2230] border border-[#2d3345] flex items-center justify-center text-white font-headline font-bold text-lg mb-5">
                  3
                </div>
                <h3 className="font-headline font-bold text-lg text-white mb-2">
                  3. Capture Leads &amp; Boost SEO
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  Inquiries from built-in forms route straight to your merchant dashboard, while verified reviews elevate your Google Business ranking.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live leads &amp; Google Local 3-Pack lift</span>
              </div>
            </OpenDesignCard>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.5 HYPERFRAMES INTERACTIVE MOTION TIMELINE (POWERED BY HEYGEN ENGINE)    */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff7a00] font-bold">
            Interactive Product Motion
          </span>
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white mt-1 tracking-tight">
            The ZenTap Experience in Motion
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Continuous kinetic timeline powered by HyperFrames. Discover how 1 tap turns physical customer footfall into 5-star Google Maps authority.
          </p>
        </div>

        <HyperFramesPlayer onOrderClick={() => onNavigate("pricing")} />
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE 4 PRODUCTS LINEUP                                                 */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff7a00] font-bold">
              Product Ecosystem
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white mt-1 tracking-tight">
              Smart NFC Hardware Lineup
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl">
              Choose between pure direct Google review hardware, luxury metal with auto-replies, dynamic PVC cards, or corporate bulk fleets.
            </p>
          </div>

          <button
            onClick={() => onNavigate("pricing")}
            className="tactile-btn self-start md:self-auto py-2.5 px-5 rounded-xl bg-[#1e2230] text-white hover:bg-[#252b3d] border border-[#2d3345] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Compare All Features</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 products-grid-trigger">
          
          {/* Product 1: Simple QR/NFC */}
          <SpotlightCard 
            onClick={() => onNavigate("pricing", "card_500")}
            spotlightColor="rgba(255, 122, 0, 0.16)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-[#ff7a00]/60 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1e2230] text-[#ff7a00] text-[10px] font-bold uppercase tracking-wider">
                Direct Review Mode
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-[#ff7a00] transition-colors">
                Simple QR / NFC
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                Card or Counter Standee. Opens the Google review page directly without intermediate steps.
              </p>
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-extrabold text-2xl text-white">₹499</span>
                <span className="text-[10px] text-slate-300 block font-semibold">Card • ₹999 Standee</span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>Pure 1-tap/scan direct to Google review</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>Zero monthly subscription fees</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>NTAG216 chip + Level-Q QR code</span>
                </li>
              </ul>
            </div>

            <button className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#1e2230] hover:bg-[#ff7a00] hover:text-black text-white text-xs font-bold text-center border border-[#2d3345] transition-colors">
              Order Simple NFC
            </button>
          </SpotlightCard>

          {/* Product 2: Metal NFC/QR with Auto Replies */}
          <SpotlightCard 
            onClick={() => onNavigate("pricing", "standee_auto_2000")}
            spotlightColor="rgba(212, 175, 55, 0.28)"
            className="p-6 rounded-3xl bg-[#161a26] text-white border-2 border-[#D4AF37] shadow-xl hover:scale-[1.015] transition-transform duration-200 ease-out cursor-pointer flex flex-col justify-between relative overflow-hidden product-card-stagger"
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
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                Brushed luxury metal card or acrylic standee with review assistant + 24/7 automated Google review replies.
              </p>
              <div className="mt-4 pt-3 border-t border-white/20">
                <span className="font-headline font-extrabold text-2xl text-white">₹1,999</span>
                <span className="text-[10px] text-slate-300 block font-semibold">+ Auto Reply Engine</span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-100 font-medium">
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

            <button className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F7E7A9] via-[#D4AF37] to-[#9A7B1C] text-black text-xs font-bold text-center shadow-md">
              Order Metal Review
            </button>
          </SpotlightCard>

          {/* Product 3: PVC NFC Card */}
          <SpotlightCard 
            onClick={() => onNavigate("pricing", "standee_1500")}
            spotlightColor="rgba(14, 165, 233, 0.2)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-sky-500/60 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-950/60 text-sky-400 border border-sky-800/50 text-[10px] font-bold uppercase tracking-wider">
                Dynamic Profile
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-sky-400 transition-colors">
                PVC NFC Card
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                Full-color custom printed PVC card with Dynamic Profile: WhatsApp, Booking, Portfolio &amp; Lead Capture.
              </p>
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-extrabold text-2xl text-white">₹699</span>
                <span className="text-[10px] text-slate-300 block font-semibold">Custom Printed Card</span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Dynamic Profile with WhatsApp &amp; Booking</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Built-in lead capture enquiry form</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>High-durability waterproof PVC print</span>
                </li>
              </ul>
            </div>

            <button className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#1e2230] text-white hover:bg-sky-500 hover:text-black transition-colors text-xs font-bold text-center border border-[#2d3345]">
              Order PVC Card
            </button>
          </SpotlightCard>

          {/* Product 4: Corporate Bulk Cards */}
          <SpotlightCard 
            onClick={() => onNavigate("pricing", "franchise_custom")}
            spotlightColor="rgba(245, 158, 11, 0.2)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-amber-500/60 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/50 text-[10px] font-bold uppercase tracking-wider">
                Enterprise Teams
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-amber-400 transition-colors">
                Corporate Bulk Cards
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                Centralized dashboard management to issue, update, and reassign employee cards without physical reprints.
              </p>
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-extrabold text-2xl text-amber-400">Custom Quote</span>
                <span className="text-[10px] text-slate-300 block font-semibold">From ₹499/Card</span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Centralized team &amp; employee portal</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Zero reprint cost on role or contact updates</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Multi-location PAN-India logistics</span>
                </li>
              </ul>
            </div>

            <button className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center shadow-md">
              Get Corporate Quote
            </button>
          </SpotlightCard>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.5 REAL PHYSICAL COUNTER STANDEE GALLERY (AUTHENTIC HARDWARE SHOWCASE)   */}
      {/* ========================================================================= */}
      <PhysicalStandeeGallery
        onOrderClick={() => onNavigate("pricing")}
        onCustomizeClick={() => setIsCustomizerOpen(true)}
      />

      {/* ========================================================================= */}
      {/* 4. DYNAMIC PROFILE & LEAD CAPTURE HIGHLIGHT                               */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-[#0a0c10] border-y border-[#232734] w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff7a00] font-bold">
              Interaction &amp; Lead Generation
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              More than reviews: Your Complete Digital Customer Front Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              When guests tap your standee or card, they can not only write 5-star Google reviews, but also engage directly with your brand through an app-free digital hub:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#141720] border border-[#232734] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">1-Tap WhatsApp Direct Chat</h4>
                  <p className="text-[11px] text-slate-200">Connects guests with your staff or owner directly with a prefilled message.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141720] border border-[#232734] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Table &amp; Appointment Booking</h4>
                  <p className="text-[11px] text-slate-200">Direct link to your Calendly, table reservation system, or clinic booking.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141720] border border-[#232734] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#F7E7A9] flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Digital Menu &amp; Portfolio Showcase</h4>
                  <p className="text-[11px] text-slate-200">Allows diners and clients to view your services, photo galleries &amp; PDF menus.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141720] border border-[#232734] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Built-in Lead Capture Form</h4>
                  <p className="text-[11px] text-slate-200">Inquiries route straight to your merchant dashboard with real-time alerts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Card Preview Teaser */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 rounded-3xl bg-[#141720] border border-[#232734] shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#ff7a00]" />
              <span>Interactive Hardware Design Studio</span>
            </span>

            <p className="text-xs text-slate-200 text-center max-w-sm mb-6 leading-relaxed">
              Preview your logo engraved on Matte Obsidian Black, Brushed Silver Metal, Champagne Gold, or Emerald finish.
            </p>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="tactile-btn py-3 px-6 rounded-2xl bg-[#ff7a00] text-black hover:bg-[#e56d00] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
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
        <div className="rounded-3xl bg-gradient-to-br from-[#141720] via-[#1a1f2c] to-[#141720] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#232734] shadow-xl">
          <div className="max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff7a00] font-bold">
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
            <OpenDesignButton
              variant="accent"
              size="lg"
              onClick={() => onNavigate("pricing")}
            >
              Order Standee or Card (From ₹499)
            </OpenDesignButton>
            <OpenDesignButton
              variant="ghost"
              size="lg"
              className="text-white border border-[#232734] hover:bg-[#1e2230]"
              onClick={() => onOpenAuth("signup")}
            >
              Merchant Sign In / Register
            </OpenDesignButton>
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
