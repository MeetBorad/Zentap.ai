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
  ExternalLink 
} from "lucide-react";
import { ActiveView } from "../Header";
import StandeeVisual from "@/components/StandeeVisuals";

interface PricingViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
  onOpenUpcomingDrawer?: () => void;
}

export default function PricingView({ onNavigate, onOpenAuth, onOpenUpcomingDrawer }: PricingViewProps) {
  const [dailyCustomers, setDailyCustomers] = useState(150);
  const [selectedPlan, setSelectedPlan] = useState<string>("standee_1500");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      q: "How does the AI Sentiment Interceptor protect my Google rating?",
      a: "When a guest selects 3, 4, or 5 stars on their phone, they are greeted by an AI-crafted review draft and guided directly to post on your live Google Business Profile. If they select 1 or 2 stars, it displays a confidential private feedback form that delivers directly to store management with ZERO public Google redirect.",
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
      a: "Hardware is shipped pan-India via BlueDart / Delhivery Express (+ ₹99 extra courier charges). The Normal Smart Card has zero monthly fees. The customized standees include 30 days of free AI routing and auto-sync, followed by an affordable ₹1,000/month subscription starting the next month of purchase.",
    },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Transparent Hardware &amp; AI Plans
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface mt-1 tracking-tight">
          Choose Your Standee &amp; Card Growth Pack
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          Own your custom NFC hardware outright, collect hundreds of 5-star Google reviews, and safeguard your brand against negative ratings.
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

        <button
          onClick={() => onNavigate("portal")}
          className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          Buy Standee in Merchant Portal
        </button>
      </div>

      {/* Pricing Cards Grid (The 3 Exact Plans) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
        
        {/* Plan 1: Normal Smart Card with NFC and QR (Card, not standee) */}
        <div 
          onClick={() => setSelectedPlan("card_500")}
          className={`p-8 rounded-3xl bg-surface-container shadow-sm border transition-all flex flex-col justify-between cursor-pointer ${
            selectedPlan === "card_500" ? "ring-2 ring-secondary-container bg-surface-container-low shadow-md" : "border-surface-variant/40"
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 font-bold text-[10px] uppercase">
                  Card Format
                </span>
                <h3 className="font-headline font-bold text-xl text-on-surface mt-2">Normal Smart Card</h3>
                <span className="text-xs text-on-surface-variant">Pocket NFC tap card with QR code (Single Card, not standee)</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-extrabold text-3xl text-on-surface">₹500</span>
                <span className="text-[10px] block text-on-surface-variant font-semibold mt-0.5">+ Extra Courier</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold mb-6">
              ✓ Zero Monthly Subscription
            </div>

            <ul className="space-y-3 mb-8 text-xs text-on-surface font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>NFC Smart Card (Pocket / Wallet Format)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Laser-Engraved Dynamic QR Code</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Direct Google Review Redirect</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Lifetime Cloud Link Hosting</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <span className="w-4 text-center">—</span>
                <span>Standee Acrylic Body (Standalone Card)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate("portal")}
            className="w-full py-3 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-dim text-on-surface text-xs font-bold transition-colors cursor-pointer"
          >
            Order Smart Card (₹500)
          </button>
        </div>

        {/* Plan 2: Auto Google Review Standee with NFC and QR (Most Popular) */}
        <div 
          onClick={() => setSelectedPlan("standee_1500")}
          className={`relative p-8 rounded-3xl bg-primary text-on-primary shadow-2xl border transition-all flex flex-col justify-between cursor-pointer md:scale-105 z-10 ${
            selectedPlan === "standee_1500" ? "ring-2 ring-secondary-container" : "border-white/10"
          }`}
        >
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-secondary-container text-white text-[11px] font-bold shadow-md">
            Most Popular • Standee
          </div>

          <div>
            <div className="flex justify-between items-start mb-6 pt-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white font-bold text-[10px] uppercase">
                  Branded Acrylic
                </span>
                <h3 className="font-headline font-bold text-xl text-white mt-2">Auto Review Standee</h3>
                <span className="text-xs text-zinc-300">Customized designed standee as per business to match</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-extrabold text-3xl text-white">₹1,500</span>
                <span className="text-[10px] block text-zinc-300 font-semibold mt-0.5">+ Extra Courier</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-[11px] font-bold mb-6">
              ✨ ₹1,000/month subscription starting next month
            </div>

            <ul className="space-y-3 mb-8 text-xs text-white font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Heavyweight Acrylic Standee (Customized to Match Business)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Customized Google Review Assistant (EN, GU, HI)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Negative Review Shield (1-2★ kept private, 3-5★ to Google)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Full Scan &amp; Tap Analytics Ingestion Dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Express Courier Dispatch across India</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate("portal")}
            className="w-full py-3.5 px-4 rounded-xl bg-secondary-container hover:bg-secondary-container/90 text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            Order Customized Standee (₹1,500)
          </button>
        </div>

        {/* Plan 3: Auto Google Review Standee + Auto Reply */}
        <div 
          onClick={() => setSelectedPlan("standee_auto_2000")}
          className={`p-8 rounded-3xl bg-surface-container shadow-sm border transition-all flex flex-col justify-between cursor-pointer ${
            selectedPlan === "standee_auto_2000" ? "ring-2 ring-secondary-container bg-surface-container-low shadow-md" : "border-surface-variant/40"
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold text-[10px] uppercase">
                  All-In-One Enterprise
                </span>
                <h3 className="font-headline font-bold text-xl text-on-surface mt-2">Standee + Auto Reply</h3>
                <span className="text-xs text-on-surface-variant">Customized Standee + Automated AI Google Review Reply</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-extrabold text-3xl text-on-surface">₹2,000</span>
                <span className="text-[10px] block text-on-surface-variant font-semibold mt-0.5">+ Extra Courier</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold mb-6">
              ⚡ ₹1,000/month subscription starting next month
            </div>

            <ul className="space-y-3 mb-8 text-xs text-on-surface font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Everything in Auto Standee Pack Included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Auto Google Review Reply Engine (AI Powered)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Instant Smart Reply to Every Customer Review</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>VIP Priority Laser Engraving &amp; Shipping</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Dedicated Merchant Success Specialist</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate("portal")}
            className="w-full py-3 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-dim text-on-surface text-xs font-bold transition-colors cursor-pointer"
          >
            Order Standee + Auto Reply (₹2,000)
          </button>
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
            <span className="text-[10px] text-zinc-500">NFC &amp; QR scans</span>
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

    </div>
  );
}
