"use client";

import React, { useState, useRef } from "react";
import { 
  ArrowRight, 
  Radio, 
  Zap, 
  ShieldCheck, 
  ShieldAlert,
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
              
              {/* Stitch Verified Counter Pill Badge */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#1e2230] border border-[#2d3345] mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#ff7a00]" />
                <CheckCircle2 className="w-4 h-4 text-[#ff7a00]" />
                <span className="text-xs font-semibold text-white tracking-tight">
                  Tested Across <span className="font-bold text-[#ff7a00]">15+</span> Local Businesses in Ahmedabad • 500+ Customer Reviews
                </span>
              </div>

              {/* Stitch Hero Headline */}
              <h1 className="font-headline font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-snug sm:leading-[1.14] mb-5 text-balance">
                Turn Every Customer Tap into{" "}
                <span className="text-[#ff7a00] font-black underline decoration-[#ff7a00]/40 decoration-wavy inline-block">
                  5-Star Google Reviews
                </span>{" "}
                instantly
              </h1>

              {/* Stitch Subtitle */}
              <p className="text-base sm:text-lg text-slate-200 mb-6 leading-relaxed max-w-2xl font-sans">
                Smart NFC &amp; Dynamic QR standees to collect genuine 5-star Google reviews seamlessly without awkward asking or paperwork.
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
                <a
                  href="https://wa.me/919274560880?text=Hi,%20I%20want%20to%20order%20a%20ZenTap%20standee"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackWhatsAppClick("hero_order_whatsapp")}
                  className="tactile-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-sm shadow-lg shadow-emerald-950/20 transition-transform active:scale-[0.978] cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black text-black" />
                  <span>Order on WhatsApp</span>
                </a>

                <OpenDesignButton
                  variant="subtle"
                  size="lg"
                  icon={<Radio className="w-3.5 h-3.5 text-emerald-400" />}
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
                  <p className="text-xs font-mono text-slate-300 mt-0.5">Average Tap Velocity</p>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-2xl text-white">
                    <CountUp to={100} suffix="%" />
                  </p>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">Zero App Install Required</p>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-2xl text-white">NTAG216</p>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">Certified 888-Byte NFC Chip</p>
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
      {/* 2. STITCH RAPID GROWTH & 5-STAR VELOCITY ENGINE                           */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#0a0c10] border-y border-[#232734] w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight text-balance">
                Zero Friction. Pure 5-Star Velocity.
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed max-w-2xl text-pretty">
                Designed for zero friction. Guests tap with their smartphone and connect with your business in under 1 second.
              </p>
            </div>
            <button
              onClick={() => onNavigate("how-it-works")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff7a00] hover:underline cursor-pointer self-start md:self-auto"
            >
              <span>Explore full mechanism</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 steps-grid-trigger">
            
            {/* Stitch Card 1: Instant Tap-to-Review */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff7a00]/15 border border-[#ff7a00]/30 flex items-center justify-center text-[#ff7a00] flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-[#ff7a00]" />
                  </div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    Instant Tap-to-Review
                  </h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal text-pretty">
                  Works seamlessly with modern iOS and Android devices without installing apps, entering passwords, or pairing Bluetooth.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-xs text-[#ff7a00] font-semibold">
                <Radio className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>Instant 0.6s NFC detection</span>
              </div>
            </OpenDesignCard>

            {/* Stitch Card 2: Smart AI Review Assistant */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    Smart AI Review Assistant
                  </h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal text-pretty">
                  Suggests personalized, keyword-rich drafts based on customer highlights in 1 tap, removing typing fatigue so real reviews get posted faster.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero Typing Friction</span>
              </div>
            </OpenDesignCard>

            {/* Stitch Card 3: Dynamic Link Updates */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <RefreshCw className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    Dynamic Link Updates
                  </h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal text-pretty">
                  Repoint your standee destination instantly to Google Maps, WhatsApp, Instagram, or Guest WiFi without ever replacing hardware.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Cloud Re-Routing</span>
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
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight text-balance">
            The ZenTap Experience in Motion
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed text-pretty">
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
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight text-balance">
              Four Core QR &amp; NFC Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl text-pretty">
              From direct Google review standees to AI review assistants, dynamic smart business cards, and bespoke enterprise solutions.
            </p>
          </div>

          <button
            onClick={() => onNavigate("pricing")}
            className="tactile-btn self-start md:self-auto py-2.5 px-5 rounded-xl bg-[#1e2230] text-white hover:bg-[#252b3d] border border-[#2d3345] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Compare All Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 products-grid-trigger">
          
          {/* Product 1: Business Review Standee */}
          <SpotlightCard 
            spotlightColor="rgba(255, 122, 0, 0.16)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-[#ff7a00]/60 shadow-sm transition-all hover:shadow-md flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1e2230] text-[#ff7a00] text-[11px] font-bold uppercase tracking-wider">
                Direct Review Mode
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-[#ff7a00] transition-colors">
                Business Review Standee
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed text-pretty">
                Direct Google Review redirection. Tap or scan immediately opens your Google review write page with zero intermediate steps.
              </p>
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-extrabold text-2xl text-white">₹999</span>
                <span className="text-xs text-slate-300 block font-semibold">Standee • ₹499 Card</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>Opens Google Review page directly to post reviews</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>High-speed NTAG216 chip + Level-Q QR code</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>Zero monthly subscription fees</span>
                </li>
              </ul>
            </div>

            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20am%20interested%20in%20your%20QR%2FNFC%20Business%20Review%20Standee%20with%20direct%20Google%20Review%20integration.%20Please%20share%20the%20details."
              target="_blank"
              rel="noreferrer"
              className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order on WhatsApp</span>
            </a>
          </SpotlightCard>

          {/* Product 2: ZenTap Smart Review Standee */}
          <SpotlightCard 
            spotlightColor="rgba(212, 175, 55, 0.28)"
            className="p-6 rounded-3xl bg-[#161a26] text-white border-2 border-[#D4AF37] shadow-xl hover:scale-[1.015] transition-transform duration-200 ease-out flex flex-col justify-between relative overflow-hidden product-card-stagger"
          >
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-black text-[11px] font-black uppercase tracking-wider">
              Popular • AI Flow
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#F7E7A9] text-[11px] font-bold uppercase tracking-wider">
                Review Assistant
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3">
                ZenTap Smart Review Standee
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed text-pretty">
                Advanced review standee with customized Review Assistant page, 1-tap AI drafts, and direct customer feedback inbox.
              </p>
              <div className="mt-4 pt-3 border-t border-white/20">
                <span className="font-headline font-extrabold text-2xl text-white">₹1,499</span>
                <span className="text-xs text-slate-300 block font-semibold">Standee + Smart Assistant</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>Customized Review Assistant page (/r/[slug])</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>AI review drafts &amp; preset aspect tags</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>Direct Google Maps review access + private feedback desk</span>
                </li>
              </ul>
            </div>

            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20am%20interested%20in%20the%20ZenTap%20Smart%20Review%20Standee%20with%20the%20ZenTap%20Review%20Assistant.%20Please%20share%20the%20details."
              target="_blank"
              rel="noreferrer"
              className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order on WhatsApp</span>
            </a>
          </SpotlightCard>

          {/* Product 3: ZenTap Smart Business Card */}
          <SpotlightCard 
            spotlightColor="rgba(14, 165, 233, 0.2)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-sky-500/60 shadow-sm transition-all hover:shadow-md flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-950/60 text-sky-400 border border-sky-800/50 text-[11px] font-bold uppercase tracking-wider">
                Digital Profile Hub
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-sky-400 transition-colors">
                ZenTap Smart Business Card
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed text-pretty">
                NFC &amp; QR digital business card. Tap or scan to instantly share contact vCard, Instagram, Facebook, website, and WhatsApp.
              </p>
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-extrabold text-2xl text-white">₹699</span>
                <span className="text-xs text-slate-300 block font-semibold">PVC • ₹1,499 Metal</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>1-Tap contact save straight into customer phone</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Socials hub: Instagram, Facebook, LinkedIn, YouTube</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Dynamic link updating with zero reprinting costs</span>
                </li>
              </ul>
            </div>

            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20am%20interested%20in%20the%20ZenTap%20Smart%20Business%20Card%20with%20QR%2FNFC%20functionality.%20Please%20share%20the%20details."
              target="_blank"
              rel="noreferrer"
              className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order on WhatsApp</span>
            </a>
          </SpotlightCard>

          {/* Product 4: ZenTap Custom Solutions */}
          <SpotlightCard 
            spotlightColor="rgba(245, 158, 11, 0.2)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-amber-500/60 shadow-sm transition-all hover:shadow-md flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/50 text-[11px] font-bold uppercase tracking-wider">
                Custom Solutions
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-amber-400 transition-colors">
                ZenTap Custom Solutions
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed text-pretty">
                Tailored QR &amp; NFC solutions for multi-location businesses, custom branded acrylics, menu cards, event displays, and loyalty cards.
              </p>
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-extrabold text-2xl text-amber-400">Custom Quote</span>
                <span className="text-xs text-slate-300 block font-semibold">Bulk Volume Pricing</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Custom branded acrylic &amp; metal standees with your logo</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Multi-branch management &amp; central analytics</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Pan-India express logistics &amp; founder onboarding</span>
                </li>
              </ul>
            </div>

            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20discuss%20a%20customized%20QR%2FNFC%20solution%20for%20my%20business."
              target="_blank"
              rel="noreferrer"
              className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Discuss on WhatsApp</span>
            </a>
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
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-white tracking-tight text-balance">
              More than reviews: Your Complete Digital Customer Front Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal text-pretty">
              When guests tap your standee or card, they write 5-star Google reviews and connect directly with your business through an app-free digital hub:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#141720] border border-[#232734] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">1-Tap WhatsApp Direct Chat</h3>
                  <p className="text-xs text-slate-200">Connects guests with your staff or owner directly with a prefilled message.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141720] border border-[#232734] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Table &amp; Appointment Booking</h3>
                  <p className="text-xs text-slate-200">Direct link to your Calendly, table reservation system, or clinic booking.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141720] border border-[#232734] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#F7E7A9] flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Digital Menu &amp; Portfolio Showcase</h3>
                  <p className="text-xs text-slate-200">Allows diners and clients to view your services, photo galleries &amp; PDF menus.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#141720] border border-[#232734] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Built-in Lead Capture Form</h3>
                  <p className="text-xs text-slate-200">Inquiries route straight to your email &amp; WhatsApp with instant alerts.</p>
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
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white tracking-tight text-balance">
              Equip your front desk with smart review standees today.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed text-pretty">
              Custom laser-engraved with your business name and logo, pre-configured with your Google Maps link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <a
              href="https://wa.me/919274560880?text=Hi,%20I%20want%20to%20order%20a%20ZenTap%20standee"
              target="_blank"
              rel="noreferrer"
              className="tactile-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs shadow-md transition-transform active:scale-[0.978] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order on WhatsApp</span>
            </a>
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
