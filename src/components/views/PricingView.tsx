"use client";

import React, { useState } from "react";
import { 
  Check, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  Sparkles, 
  Radio, 
  TrendingUp, 
  Truck, 
  Layers, 
  ExternalLink,
  MessageSquare,
  MessageCircle,
  Building2,
  Palette,
  Sliders
} from "lucide-react";
import { ActiveView } from "../Header";
import StandeeVisual from "@/components/StandeeVisuals";
import CardCustomizerModal from "@/components/CardCustomizerModal";
import { CustomCardDesign } from "@/lib/businessStore";
import { trackCtaClick, trackWhatsAppClick } from "@/lib/analytics";
import { OpenDesignButton } from "@/components/open-design";

interface PricingViewProps {
  onNavigate: (view: ActiveView, plan?: "card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom") => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
  onOpenUpcomingDrawer?: () => void;
}

export default function PricingView({ onNavigate, onOpenAuth, onOpenUpcomingDrawer }: PricingViewProps) {
  const [dailyCustomers, setDailyCustomers] = useState(150);
  const [selectedPlan, setSelectedPlan] = useState<"card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom">("standee_1500");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customDesign, setCustomDesign] = useState<CustomCardDesign | null>(null);

  // ROI estimation calculations
  const monthlyTaps = Math.round(dailyCustomers * 30 * 0.15);
  const monthlyReviews = Math.round(monthlyTaps * 0.88);
  const estimatedRevenueLiftPct = Math.min(22, Math.round(monthlyReviews / 12 + 5));

  const faqs = [
    {
      q: "Does customer phone require an app to tap?",
      a: "No app, download, or Bluetooth pairing is required. Both Apple iOS (iPhone XS and newer) and Android automatically detect the NTAG216 chip instantly when held within 4cm of the standee or smart card.",
    },
    {
      q: "How does the Sentiment Protection Shield protect my Google rating?",
      a: "When a guest selects 3, 4, or 5 stars on their phone, they are greeted by a pre-crafted review draft and guided directly to post on your live Google Business Profile. If they select 1 or 2 stars, it displays a confidential private feedback form that delivers directly to store management with ZERO public Google redirect.",
    },
    {
      q: "How does ZenTap boost my Google reach and SEO?",
      a: "Google's local search algorithm heavily prioritizes review velocity, fresh keywords, and verified customer engagement. ZenTap generates high-volume, keyword-rich reviews from real customer visits, propelling your profile to the top 3-pack on Google Maps and Local Search.",
    },
    {
      q: "Can I change the standee URL destination after receiving it?",
      a: "Yes! Your standees connect dynamically through the ZenTap Cloud. You can update your redirect target and business profile in 1 click from your merchant dashboard without touching the physical hardware.",
    },
    {
      q: "What are the courier and subscription charges?",
      a: "Hardware is shipped pan-India via BlueDart / Delhivery Express (+ ₹99 extra courier charges). The Normal Smart Card has zero monthly fees. The customized standees include 30 days of free smart routing and auto-sync, followed by an affordable ₹1,000/month subscription starting the next month of purchase. For multi-branch franchises, bulk volume standee discounts (₹1,200/standee) and custom SaaS rates (from ₹800/branch/mo) apply.",
    },
    {
      q: "How does Plan 4 (Franchise & Multi-Location Custom Plan) work?",
      a: "Plan 4 is engineered for franchise chains, multi-counter restaurants, salons, and clinic networks. You can configure multiple standees, generate unique QR codes and separate Google review links for each branch counter, and monitor all branch locations from a centralized master reporting dashboard.",
    },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Transparent Investment
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface mt-1 tracking-tight">
          Choose Your Growth Pack
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          Zero monthly fees for basic routing. Own your hardware outright, collect hundreds of 5-star Google reviews, and dominate your local neighborhood.
        </p>
      </div>

      {/* SEO & Reach Value Proposition Banner */}
      <div className="mb-12 p-6 rounded-3xl bg-gradient-to-r from-secondary/15 via-primary/10 to-secondary/15 border border-secondary/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block">
              Algorithmic Local Dominance
            </span>
            <h3 className="font-headline font-bold text-lg sm:text-xl text-on-surface">
              Boosts Your Google Profile Reach, Views &amp; Overall Local SEO
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Real-time NFC customer taps signal high local footfall authority to Google algorithms, drastically expanding your visibility on Google Maps and Google Search.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="px-5 py-3 rounded-2xl bg-secondary text-on-secondary font-bold text-xs hover:bg-secondary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            <span>Customize Hardware &amp; Logo</span>
          </button>

          <a
            href="https://wa.me/919274560880?text=Hi,%20I%20want%20to%20order%20a%20ZenTap%20standee"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap shadow-sm flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-black text-black" />
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Hardware Design Customizer Callout */}
      <div className="mb-10 p-5 rounded-3xl bg-surface-container border border-surface-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">
              Want Custom Branding? Logo, Material &amp; 3D Live Specimen Preview
            </span>
            <p className="text-[11px] text-on-surface-variant">
              Upload your business logo and preview your card or standee in Matte Obsidian, Brushed Steel, Brushed Gold, or Emerald finish.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCustomizerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-dim text-on-surface text-xs font-bold transition-all border border-surface-variant/50 cursor-pointer flex items-center gap-2 whitespace-nowrap"
        >
          <Palette className="w-3.5 h-3.5 text-secondary" />
          <span>Launch 3D Design Studio</span>
        </button>
      </div>

      {/* Pricing Cards Grid (The 4 Official Product Categories) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-stretch">
        
        {/* PRODUCT 1: Business Review Standee (Direct Google Review) */}
        <div 
          onClick={() => setSelectedPlan("card_500")}
          className={`tactile-card p-6 sm:p-7 rounded-3xl bg-surface-container shadow-sm border flex flex-col justify-between cursor-pointer ${
            selectedPlan === "card_500" ? "ring-2 ring-secondary-container bg-surface-container-low shadow-md" : "border-surface-variant/40 hover:border-secondary/40"
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 font-bold text-[10px] uppercase border border-white/10">
                  Direct Review Mode
                </span>
                <h3 className="font-headline font-bold text-lg text-on-surface mt-2">Business Review Standee</h3>
                <span className="text-xs text-on-surface-variant">Direct Google Review redirection (No intermediate page)</span>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="font-headline font-extrabold text-2xl text-on-surface">₹999</span>
                <span className="text-[10px] block text-on-surface-variant font-semibold mt-0.5">Standee • ₹499 Card</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold mb-6">
              ✓ Pure Direct 1-Tap Google Review (Zero Monthly Fee)
            </div>

            <ul className="space-y-3 mb-8 text-xs text-on-surface font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Opens Google Review page directly to post reviews</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>High-Speed NTAG216 NFC (0.6s Tap Velocity)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Laser-Engraved Dynamic QR Code fallback</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Zero app install, zero Bluetooth pairing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Lifetime Cloud Link Hosting Included</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20am%20interested%20in%20your%20QR%2FNFC%20Business%20Review%20Standee%20with%20direct%20Google%20Review%20integration.%20Please%20share%20the%20details."
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackWhatsAppClick("pricing_business_review_standee");
              }}
              className="tactile-btn w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-extrabold cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.978]"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* PRODUCT 2: ZenTap Smart Review Standee (Review Assistant) */}
        <div 
          onClick={() => setSelectedPlan("standee_auto_2000")}
          className={`tactile-card relative p-6 sm:p-7 rounded-3xl bg-primary text-on-primary shadow-xl border-2 flex flex-col justify-between cursor-pointer ${
            selectedPlan === "standee_auto_2000" ? "ring-2 ring-secondary-container border-secondary-container" : "border-white/20 hover:border-[#D4AF37]/60"
          }`}
        >
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-secondary-container text-white text-[11px] font-bold shadow-md">
            Most Popular • AI Review Flow
          </div>

          <div>
            <div className="flex justify-between items-start mb-5 pt-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white font-bold text-[10px] uppercase">
                  Review Assistant
                </span>
                <h3 className="font-headline font-bold text-lg text-white mt-2">ZenTap Smart Review Standee</h3>
                <span className="text-xs text-zinc-300">Customized Review Assistant page with AI guidance</span>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="font-headline font-extrabold text-2xl text-white">₹1,499</span>
                <span className="text-[10px] block text-zinc-300 font-semibold mt-0.5">Standee + Assistant</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-[11px] font-bold mb-6">
              ✨ Guided Review Assistant + 1-2★ Private Shield
            </div>

            <ul className="space-y-3 mb-8 text-xs text-white font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Intelligent Review Assistant Page (/r/[slug])</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Negative Review Shield (1-2★ sent to private feedback)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Preset aspect tags &amp; AI review draft generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Supports English, Gujarati, Hindi &amp; Hinglish</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Premium Acrylic Counter Standee with NTAG216</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20am%20interested%20in%20the%20ZenTap%20Smart%20Review%20Standee%20with%20the%20ZenTap%20Review%20Assistant.%20Please%20share%20the%20details."
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackWhatsAppClick("pricing_smart_review_standee");
              }}
              className="tactile-btn w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-extrabold cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.978]"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* PRODUCT 3: ZenTap Smart Business Card */}
        <div 
          onClick={() => setSelectedPlan("standee_1500")}
          className={`tactile-card p-6 sm:p-7 rounded-3xl bg-surface-container shadow-sm border flex flex-col justify-between cursor-pointer ${
            selectedPlan === "standee_1500" ? "ring-2 ring-secondary-container bg-surface-container-low shadow-md" : "border-surface-variant/40 hover:border-secondary/40"
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 font-bold text-[10px] uppercase">
                  Digital Card
                </span>
                <h3 className="font-headline font-bold text-lg text-on-surface mt-2">ZenTap Smart Business Card</h3>
                <span className="text-xs text-on-surface-variant">NFC &amp; QR Digital Card with Socials &amp; Contact</span>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="font-headline font-extrabold text-2xl text-on-surface">₹699</span>
                <span className="text-[10px] block text-on-surface-variant font-semibold mt-0.5">PVC • ₹1,499 Metal</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-[11px] font-bold mb-6">
              ⚡ Instant Contact Save + Social Media Hub
            </div>

            <ul className="space-y-3 mb-8 text-xs text-on-surface font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>1-Tap contact vCard save straight into customer phone</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Socials hub: Instagram, Facebook, LinkedIn, YouTube</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Direct WhatsApp chat &amp; Website quick links</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Full-color custom printed PVC or luxury metal finish</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Update links remotely anytime without reprinting</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20am%20interested%20in%20the%20ZenTap%20Smart%20Business%20Card%20with%20QR%2FNFC%20functionality.%20Please%20share%20the%20details."
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackWhatsAppClick("pricing_smart_business_card");
              }}
              className="tactile-btn w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-extrabold cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.978]"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* PRODUCT 4: ZenTap Custom Solutions */}
        <div 
          onClick={() => setSelectedPlan("franchise_custom")}
          className={`tactile-card relative p-6 sm:p-7 rounded-3xl bg-surface-container shadow-sm border flex flex-col justify-between cursor-pointer ${
            selectedPlan === "franchise_custom" ? "ring-2 ring-amber-500 bg-amber-500/5 shadow-md" : "border-surface-variant/40 hover:border-amber-500/40"
          }`}
        >
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold shadow-md">
            Bespoke &amp; Enterprise
          </div>

          <div>
            <div className="flex justify-between items-start mb-5 pt-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10px] uppercase">
                  Custom &amp; Fleet
                </span>
                <h3 className="font-headline font-bold text-lg text-on-surface mt-2">ZenTap Custom Solutions</h3>
                <span className="text-xs text-on-surface-variant">Tailored QR/NFC standees, displays &amp; multi-branch</span>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="font-headline font-extrabold text-xl text-amber-600">Custom Quote</span>
                <span className="text-[10px] block text-on-surface-variant font-semibold mt-0.5">Bulk Discounts</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-bold mb-6">
              🏢 Multi-Branch Networks, Custom Branding &amp; Displays
            </div>

            <ul className="space-y-3 mb-8 text-xs text-on-surface font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Custom branded acrylic &amp; metal standees with your logo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Multi-branch setup with centralized fleet analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Bespoke NFC integrations, menu cards &amp; event displays</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Dedicated founder onboarding &amp; pan-India courier delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Volume discounts from 10 to 1,000+ units</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20discuss%20a%20customized%20QR%2FNFC%20solution%20for%20my%20business."
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                trackWhatsAppClick("pricing_custom_solution");
              }}
              className="tactile-btn w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-extrabold cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.978]"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Discuss on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      {/* Interactive ROI Calculator */}
      <div className="rounded-3xl bg-surface-container-lowest p-8 border border-surface-variant/40 shadow-sm mb-16">
        <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Growth Calculator</span>
        </div>
        <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">
          Calculate Your Monthly Review &amp; Revenue Velocity
        </h3>
        <p className="text-xs text-on-surface-variant mb-8 max-w-xl">
          Adjust your daily customer footfall to estimate how many 5-star Google reviews your venue will generate with ZenTap standees.
        </p>

        {/* Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-sm font-semibold text-on-surface mb-3">
            <span>Daily Customer Footfall:</span>
            <span className="font-mono text-secondary-container font-bold text-base">
              {dailyCustomers} guests / day
            </span>
          </div>
          <input
            type="range"
            min={30}
            max={600}
            step={10}
            value={dailyCustomers}
            onChange={(e) => setDailyCustomers(Number(e.target.value))}
            className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-secondary-container"
          />
          <div className="flex justify-between text-[11px] text-zinc-400 mt-2">
            <span>Small Boutique (30/day)</span>
            <span>Bustling Bistro (300/day)</span>
            <span>High-Traffic Venue (600/day)</span>
          </div>
        </div>

        {/* Calculation Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-surface-variant/30">
          <div className="p-4 rounded-2xl bg-surface-container-low text-center">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">
              Monthly Tap Interactions
            </span>
            <p className="font-headline font-bold text-2xl text-on-surface mt-1">
              ~{monthlyTaps}
            </p>
            <span className="text-[10px] text-slate-300">NFC &amp; QR scans</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary-fixed/50 text-center border border-secondary-container/20">
            <span className="text-[11px] font-semibold text-on-secondary-fixed-variant uppercase">
              New 5-Star Reviews
            </span>
            <p className="font-headline font-bold text-2xl text-secondary-container mt-1">
              +{monthlyReviews} / mo
            </p>
            <span className="text-[10px] text-on-secondary-fixed-variant font-medium">Direct to Google Business</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 text-center border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase">
              Est. Footfall Revenue Lift
            </span>
            <p className="font-headline font-bold text-2xl text-emerald-600 mt-1">
              +{estimatedRevenueLiftPct}%
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Harvard Business Review metric</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto w-full mb-14">
        <div className="text-center mb-8">
          <h3 className="font-headline font-bold text-2xl text-on-surface">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Everything you need to know about ZenTap NFC hardware and cloud setup.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-surface-container border border-surface-variant/40 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex justify-between items-center text-xs sm:text-sm font-semibold text-on-surface cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-on-surface-variant transition-transform ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-on-surface-variant leading-relaxed animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* NEW SECTION AFTER FAQ: Upcoming Projects & Services Tab Trigger */}
      <div className="p-8 rounded-3xl bg-surface-container-low border border-surface-variant/40 text-center max-w-4xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs mb-3">
          <Sparkles className="w-4 h-4" />
          <span>ZenTap Technology Roadmap</span>
        </div>

        <h3 className="font-headline font-bold text-2xl text-on-surface">
          Explore Our Upcoming Projects &amp; Digital Services
        </h3>
        <p className="text-xs text-on-surface-variant mt-2 max-w-xl mx-auto leading-relaxed">
          We are building high-performance Custom Websites, Cafe/Restaurant CRM Systems, Hotel Management Systems (HMS), and Appointment Booking Apps to scale your business with modern technology.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={onOpenUpcomingDrawer}
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-secondary-container" />
            <span>Open Upcoming Tech Services Panel</span>
          </button>
        </div>
      </div>

      {/* 3D Hardware Specimen Customizer Modal */}
      <CardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        initialDesign={customDesign || undefined}
        businessName="YOUR BUSINESS"
        onSaveDesign={(d) => {
          setCustomDesign(d);
        }}
        onProceedOrder={(d) => {
          setCustomDesign(d);
          onNavigate("portal", selectedPlan);
        }}
      />

    </div>
  );
}
