"use client";

import React, { useRef, useState } from "react";
import TapAnimationLoop from "@/components/TapAnimationLoop";
import Image from "next/image";
import { 
  ArrowRight, 
  Radio, 
  TrendingUp, 
  RefreshCw,
  MessageCircle,
  Calendar,
  Briefcase,
  Send,
  Check,
  Sparkles,
  Star,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  Store,
  Utensils,
  Stethoscope,
  Dumbbell,
  Building2
} from "lucide-react";
import PhysicalStandeeGallery from "../PhysicalStandeeGallery";
import { ActiveView } from "../Header";
import { trackWhatsAppClick } from "@/lib/analytics";
import { SpotlightCard, AuroraBackground } from "@/components/react-bits";
import { OpenDesignCard } from "@/components/open-design";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

interface HomeViewProps {
  onNavigate: (view: ActiveView, plan?: any) => void;
  onOpenAuth?: (initialTab: "signin" | "signup" | "admin") => void;
}

const HERO_STANDEES = [
  {
    name: "Champagne Gold Standee",
    src: "/standees/Gold.webp",
    desc: "Luxury brushed finish for cafes, salons & hotels",
  },
  {
    name: "Brushed Steel Standee",
    src: "/standees/Steel.webp",
    desc: "Industrial satin finish for high-traffic billing counters",
  },
  {
    name: "Clear Acrylic & Beechwood",
    src: "/standees/Wood Trans.webp",
    desc: "Organic minimal beechwood base for warm interiors",
  },
  {
    name: "Rose Gold Standee",
    src: "/standees/Pink.webp",
    desc: "Designer radiant finish for spas & beauty bars",
  },
  {
    name: "Counter Tap Setup",
    src: "/standees/1.webp",
    desc: "Compact billing desk placement with companion card",
  },
];

export default function HomeView({ onNavigate }: HomeViewProps) {
  const homeContainerRef = useRef<HTMLDivElement>(null);
  const [heroVisualMode, setHeroVisualMode] = useState<"demo" | "photo">("demo");
  const [selectedStandeeIdx, setSelectedStandeeIdx] = useState(0);

  // GSAP ScrollTrigger Animations for smooth section entries
  useGSAP(() => {
    // 1. Staggered reveal for 3-step How It Works cards
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

    // 2. Staggered reveal for 4 hardware product cards
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

  const getWaLink = (msg: string) => `https://wa.me/919274560880?text=${encodeURIComponent(msg)}`;

  return (
    <div ref={homeContainerRef} className="flex flex-col w-full animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (SIMPLE, CLEAR, CLASS 8 READING LEVEL)                    */}
      {/* ========================================================================= */}
      <AuroraBackground className="w-full">
        <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Value Proposition */}
            <div className="lg:col-span-7 flex flex-col">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#1e2230] border border-[#2d3345] mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#ff7a00]" />
                <CheckCircle2 className="w-4 h-4 text-[#ff7a00]" />
                <span className="text-xs font-semibold text-white tracking-tight">
                  For Local Cafes, Salons, Clinics &amp; Shops in Ahmedabad
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-headline font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-snug sm:leading-[1.14] mb-5 text-balance">
                Get more Google reviews.{" "}
                <span className="text-[#ff7a00] font-black underline decoration-[#ff7a00]/40 decoration-wavy inline-block">
                  Just one tap.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-200 mb-6 leading-relaxed max-w-2xl font-sans">
                Put the ZenTap stand on your counter. Your customer taps their phone. Your Google review page opens directly on their screen. No app required. No typing needed.
              </p>

              {/* Why It Works Benefit Callout */}
              <div className="mb-8 p-4 rounded-2xl bg-[#161a26] border border-[#2d3345] flex items-center gap-3.5 text-xs text-white">
                <div className="w-8 h-8 rounded-xl bg-[#1e2230] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#2d3345]">
                  <TrendingUp className="w-4 h-4 text-[#ff7a00]" />
                </div>
                <span className="text-slate-200 leading-normal">
                  <strong className="text-white font-bold">Ask at the right moment:</strong> Happy customers tap their phone right after paying the bill, helping you collect 5-star Google reviews effortlessly.
                </span>
              </div>

              {/* Action Buttons (Note: Only 1 "Order on WhatsApp" button exists, located in the top-right header) */}
              <div className="flex flex-wrap items-center gap-3.5 mb-10">
                <a
                  href="#how-it-works"
                  className="tactile-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ff7a00] hover:bg-[#e56d00] text-black font-extrabold text-sm shadow-lg shadow-orange-950/20 transition-transform active:scale-[0.978] cursor-pointer"
                >
                  <span>See How It Works</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </a>

                <a
                  href="#products"
                  className="tactile-btn-subtle inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1e2230] hover:bg-[#252b3d] text-white border border-[#2d3345] font-bold text-sm transition-colors cursor-pointer"
                >
                  <span>View Standee Models</span>
                </a>

                <a
                  href="/r/zt-0004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tactile-btn-subtle inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1e2230] to-[#1e2230] hover:bg-[#252b3d] text-white border border-amber-500/40 hover:border-amber-400 font-bold text-sm transition-all cursor-pointer group shadow-sm active:scale-[0.978]"
                  title="Experience our live interactive customer standee page"
                >
                  <Sparkles className="w-4 h-4 text-[#ff7a00] group-hover:scale-110 transition-transform" />
                  <span>Sample Business Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                </a>
              </div>

              {/* Simple Feature Highlights */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#232734] text-xs">
                <div>
                  <p className="font-headline font-extrabold text-2xl text-white">1 Tap</p>
                  <p className="text-xs text-slate-300 mt-0.5">Quick &amp; Instant</p>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-2xl text-white">100%</p>
                  <p className="text-xs text-slate-300 mt-0.5">No App Needed</p>
                </div>
                <div>
                  <p className="font-headline font-extrabold text-2xl text-white">Tap &amp; QR</p>
                  <p className="text-xs text-slate-300 mt-0.5">Works on Any Phone</p>
                </div>
              </div>

            </div>
            {/* Right: Looping Tap Demonstration & Authentic Standee Visual */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="relative rounded-3xl overflow-hidden border border-[#2d3345] bg-[#141720] shadow-2xl p-4 sm:p-6">
                
                {/* Visual Mode Selector Tabs */}
                <div className="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-[#232734]">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0e1015] border border-[#232734]">
                    <button
                      onClick={() => setHeroVisualMode("demo")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        heroVisualMode === "demo"
                          ? "bg-[#ff7a00] text-black shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live Tap Demo</span>
                    </button>
                    <button
                      onClick={() => setHeroVisualMode("photo")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        heroVisualMode === "photo"
                          ? "bg-[#ff7a00] text-black shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>Real Standee</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Instant Review</span>
                  </span>
                </div>

                {/* Visual Frame */}
                {heroVisualMode === "demo" ? (
                  <TapAnimationLoop className="w-full border border-[#232734]" />
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full h-[260px] sm:h-[280px] rounded-2xl overflow-hidden bg-[#0c0e14] border border-[#232734] flex items-center justify-center p-3">
                      <img
                        src={HERO_STANDEES[selectedStandeeIdx].src}
                        alt={HERO_STANDEES[selectedStandeeIdx].name}
                        className="w-full h-full object-contain drop-shadow-xl transition-all duration-300"
                      />
                    </div>

                    {/* Standee Model Selector Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {HERO_STANDEES.map((st, idx) => (
                        <button
                          key={st.name}
                          onClick={() => setSelectedStandeeIdx(idx)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedStandeeIdx === idx
                              ? "bg-white text-black shadow-sm"
                              : "bg-[#1e2230] text-zinc-400 hover:text-white border border-[#2d3345]"
                          }`}
                        >
                          {st.name.replace(" Standee", "")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caption Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {heroVisualMode === "demo"
                        ? "One Tap to Google Reviews"
                        : HERO_STANDEES[selectedStandeeIdx].name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {heroVisualMode === "demo"
                        ? "Phone taps standee → 5-star Google review opens"
                        : HERO_STANDEES[selectedStandeeIdx].desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>
            </div>
            </div>

          </div>
        </section>
      </AuroraBackground>

      {/* ========================================================================= */}
      {/* 2. HOW IT WORKS (3 SIMPLE STEPS)                                          */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-16 bg-[#0a0c10] border-y border-[#232734] w-full">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight text-balance">
              How It Works
            </h2>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed text-pretty">
              Three simple steps. No customer app, no login, and zero typing friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 steps-grid-trigger">
            
            {/* Step 1 */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff7a00]/15 border border-[#ff7a00]/30 flex items-center justify-center text-[#ff7a00] flex-shrink-0 font-bold">
                    1
                  </div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    Customer finishes and pays
                  </h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal text-pretty">
                  After a great meal, haircut, treatment, or shopping visit, your customer completes payment at your counter.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-xs text-[#ff7a00] font-semibold">
                <Check className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>Right at the billing counter</span>
              </div>
            </OpenDesignCard>

            {/* Step 2 */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 font-bold">
                    2
                  </div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    They tap or scan the stand
                  </h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal text-pretty">
                  They simply tap their smartphone on the standee, or scan the clear QR code with their phone camera.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Works on any iPhone &amp; Android</span>
              </div>
            </OpenDesignCard>

            {/* Step 3 */}
            <OpenDesignCard variant="paper" className="flex flex-col justify-between step-card-stagger">
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 font-bold">
                    3
                  </div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    Google review page opens
                  </h3>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal text-pretty">
                  Your official Google review screen opens directly on their phone. They tap 5 stars and post their review in seconds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#232734] flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct Google Maps review</span>
              </div>
            </OpenDesignCard>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE 4 PRODUCTS LINEUP (NO PRICES - CONTACT US ON WHATSAPP)            */}
      {/* ========================================================================= */}
      <section id="products" className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight text-balance">
            Our Products
          </h2>
          <p className="text-sm text-slate-200 mt-2 text-pretty">
            High-quality counter review stands and smart business cards for local stores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 products-grid-trigger">
          
          {/* Product 1: Business Review Standee */}
          <SpotlightCard 
            spotlightColor="rgba(255, 122, 0, 0.16)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-[#ff7a00]/60 shadow-sm transition-all hover:shadow-md flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1e2230] text-[#ff7a00] text-[11px] font-bold uppercase tracking-wider">
                Direct Review
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-[#ff7a00] transition-colors">
                Review Stand
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed text-pretty">
                Tap or scan and your Google review page opens directly. One-time payment with zero monthly fees.
              </p>
              
              {/* No price displayed - replaced with Contact Us on WhatsApp */}
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-bold text-lg text-emerald-400 block">Contact us on WhatsApp</span>
                <span className="text-xs text-slate-300 block font-medium">For details &amp; pricing</span>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>Opens your Google review page in 1 tap</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>Contactless tap chip + high-clarity QR code</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                  <span>Zero monthly subscription fees</span>
                </li>
              </ul>
            </div>

            <a
              href={getWaLink("Hello ZenTap, I want to know more about the Review Stand.")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsAppClick("product_review_stand")}
              className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Contact us on WhatsApp</span>
            </a>
          </SpotlightCard>

          {/* Product 2: Smart Review Stand */}
          <SpotlightCard 
            spotlightColor="rgba(212, 175, 55, 0.28)"
            className="p-6 rounded-3xl bg-[#161a26] text-white border-2 border-[#D4AF37] shadow-xl hover:scale-[1.015] transition-transform duration-200 ease-out flex flex-col justify-between relative overflow-hidden product-card-stagger"
          >
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-black text-[11px] font-black uppercase tracking-wider">
              Smart Ideas
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#F7E7A9] text-[11px] font-bold uppercase tracking-wider">
                Review Assistant
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3">
                Smart Review Stand
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed text-pretty">
                Opens your own simple review page with ideas customers can pick from, like &quot;friendly staff&quot; or &quot;clean place&quot;.
              </p>

              {/* No price displayed - replaced with Contact Us on WhatsApp */}
              <div className="mt-4 pt-3 border-t border-white/20">
                <span className="font-headline font-bold text-lg text-emerald-400 block">Contact us on WhatsApp</span>
                <span className="text-xs text-slate-300 block font-medium">Customized for your business</span>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>Custom review page with your business name</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>Compliment ideas so customers post easily</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span>Customers post their final words directly on Google</span>
                </li>
              </ul>
            </div>

            <a
              href={getWaLink("Hello ZenTap, I want to know more about the Smart Review Stand.")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsAppClick("product_smart_stand")}
              className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Contact us on WhatsApp</span>
            </a>
          </SpotlightCard>

          {/* Product 3: Digital Visiting Card */}
          <SpotlightCard 
            spotlightColor="rgba(14, 165, 233, 0.2)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-sky-500/60 shadow-sm transition-all hover:shadow-md flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-950/60 text-sky-400 border border-sky-800/50 text-[11px] font-bold uppercase tracking-wider">
                Digital Profile
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-sky-400 transition-colors">
                Digital Visiting Card
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed text-pretty">
                Tap to save your phone number instantly and share your WhatsApp, Instagram, and website. Available in PVC and metal.
              </p>

              {/* No price displayed - replaced with Contact Us on WhatsApp */}
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-bold text-lg text-emerald-400 block">Contact us on WhatsApp</span>
                <span className="text-xs text-slate-300 block font-medium">PVC &amp; Metal Finishes</span>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>1-Tap contact save straight into customer phone</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Share Instagram, WhatsApp, website, and address</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span>Never run out of paper business cards again</span>
                </li>
              </ul>
            </div>

            <a
              href={getWaLink("Hello ZenTap, I want to know more about the Digital Visiting Card.")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsAppClick("product_visiting_card")}
              className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Contact us on WhatsApp</span>
            </a>
          </SpotlightCard>

          {/* Product 4: Custom Orders */}
          <SpotlightCard 
            spotlightColor="rgba(245, 158, 11, 0.2)"
            className="p-6 rounded-3xl bg-[#161a26] border border-[#2d3345] hover:border-amber-500/60 shadow-sm transition-all hover:shadow-md flex flex-col justify-between product-card-stagger"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/50 text-[11px] font-bold uppercase tracking-wider">
                Multiple Branches
              </span>
              <h3 className="font-headline font-bold text-lg text-white mt-3 group-hover:text-amber-400 transition-colors">
                Custom Orders
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed text-pretty">
                Many branches, multiple checkout counters, or want your custom brand logo on it? Message us for pricing.
              </p>

              {/* No price displayed - replaced with Contact Us on WhatsApp */}
              <div className="mt-4 pt-3 border-t border-[#232734]">
                <span className="font-headline font-bold text-lg text-emerald-400 block">Contact us on WhatsApp</span>
                <span className="text-xs text-slate-300 block font-medium">Bulk orders &amp; custom designs</span>
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-100 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Custom branded stands with your shop logo</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Support for multiple branches and counters</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Direct delivery across Ahmedabad &amp; India</span>
                </li>
              </ul>
            </div>

            <a
              href={getWaLink("Hello ZenTap, I want to discuss a Custom Bulk Order for my business.")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsAppClick("product_custom_bulk")}
              className="tactile-btn mt-6 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Contact us on WhatsApp</span>
            </a>
          </SpotlightCard>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.5 REAL PHYSICAL COUNTER STANDEE GALLERY (NO TECHNICAL JARGON)           */}
      {/* ========================================================================= */}
      <PhysicalStandeeGallery />

      {/* ========================================================================= */}
      {/* 4. WHO IT'S FOR                                                           */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-[#0a0c10] border-y border-[#232734] w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-white tracking-tight text-balance">
              Who It&apos;s For
            </h2>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed">
              Designed for local businesses in Ahmedabad with a billing desk or customer counter.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-xs">Salons &amp; Spas</h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-xs">Restaurants &amp; Cafes</h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-xs">Clinics &amp; Doctors</h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-xs">Gyms &amp; Fitness</h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-xs">Hotels &amp; Stays</h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-2">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-xs">Retail &amp; Jewellery</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MORE THAN REVIEWS (SIMPLE 4 POINTS)                                    */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 max-w-7xl mx-auto w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-12 space-y-4">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-white tracking-tight text-balance">
                One Tap Can Also Do More
              </h2>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed font-normal text-pretty">
                Beyond Google reviews, the same tap can connect customers directly with your business:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">WhatsApp chat with you</h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">Customers tap to start a direct WhatsApp chat with your staff or manager.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Booking link</h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">Direct link for appointment booking, table reservation, or consultation.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#F7E7A9] flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Digital menu &amp; photos</h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">Allows diners and clients to view your digital menu and service photos.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Customer enquiry form</h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">A quick form for customer feedback and contact details.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION BANNER (NO EXTRA "ORDER ON WHATSAPP" BUTTON)            */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[#141720] via-[#1a1f2c] to-[#141720] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#232734] shadow-xl">
          <div className="max-w-xl">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white tracking-tight text-balance">
              Equip your billing desk with a smart review stand today.
            </h2>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed text-pretty">
              Printed with your business name and pre-configured with your Google Maps link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <a
              href={getWaLink("Hello ZenTap, I would like to get more information about your review stands.")}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsAppClick("bottom_cta_contact")}
              className="tactile-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-sm shadow-md transition-transform active:scale-[0.978] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Contact us on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
