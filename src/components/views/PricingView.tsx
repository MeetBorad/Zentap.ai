"use client";

import React, { useState } from "react";
import { Check, Star, ArrowRight, ShieldCheck, HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import { ActiveView } from "../Header";

interface PricingViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
}

export default function PricingView({ onNavigate, onOpenAuth }: PricingViewProps) {
  const [dailyCustomers, setDailyCustomers] = useState(150);
  const [selectedPlan, setSelectedPlan] = useState<string>("duo");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ROI estimation calculations
  // Average tap rate is ~12-18% of traffic, conversion is ~85-90%
  const monthlyTaps = Math.round(dailyCustomers * 30 * 0.15);
  const monthlyReviews = Math.round(monthlyTaps * 0.88);
  const estimatedRevenueLiftPct = Math.min(18, Math.round(monthlyReviews / 15 + 4));

  const faqs = [
    {
      q: "Does customer phone require an app to tap?",
      a: "No app, download, or Bluetooth pairing is required. Both Apple iOS (iPhone XS and newer) and Android automatically detect the NTAG216 chip instantly when held within 4cm of the standee.",
    },
    {
      q: "How does the AI Sentiment Interceptor protect my Google rating?",
      a: "When a guest selects 4 or 5 stars on their phone, they are immediately routed to your live Google Maps review prompt. If they select 1, 2, or 3 stars, they are greeted by an apology and private resolution ticket that alerts the restaurant manager via SMS before they ever leave.",
    },
    {
      q: "Can I change the standee URL destination after receiving it?",
      a: "Yes! Your standees connect dynamically through the ZenTap Cloud. You can update your redirect target (Google, Yelp, TripAdvisor, or Guest WiFi) in 1 click from your merchant dashboard without touching the physical hardware.",
    },
    {
      q: "Is there any recurring monthly subscription required?",
      a: "Hardware ownership includes lifetime basic routing and cloud redirection. Premium AI sentiment routing and multi-location analytics include a 14-day free trial and remain an optional ₹2,999/mo (or $29/mo) plan thereafter with zero contracts.",
    },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Transparent Investment
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface mt-1 tracking-tight">
          Choose Your Review Growth Pack
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          Zero monthly fees for basic routing. Own your hardware outright and dominate local Google search rankings.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
        
        {/* Tier 1: Starter */}
        <div 
          onClick={() => setSelectedPlan("starter")}
          className={`p-8 rounded-3xl bg-surface-container shadow-sm border transition-all flex flex-col justify-between cursor-pointer ${
            selectedPlan === "starter" ? "ring-2 ring-secondary-container bg-surface-container-low" : "border-surface-variant/40"
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Starter Standee</h3>
                <span className="text-xs text-on-surface-variant">Ideal for solo stores &amp; cafes</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-extrabold text-2xl text-on-surface">$49</span>
                <span className="text-[10px] block text-on-surface-variant uppercase font-semibold">One-time</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 text-xs text-on-surface font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>1x Matte Acrylic NFC Standee</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Laser-Engraved Dynamic QR Code</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Lifetime Cloud Dashboard Access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Smart Destination URL Routing</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <span className="w-4 text-center">—</span>
                <span>AI Sentiment Interceptor (Add-on)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onOpenAuth("signup")}
            className="w-full py-3 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-dim text-on-surface text-xs font-bold transition-colors cursor-pointer"
          >
            Select Starter Pack
          </button>
        </div>

        {/* Tier 2: Business Duo (Best Value) */}
        <div 
          onClick={() => setSelectedPlan("duo")}
          className={`relative p-8 rounded-3xl bg-primary text-on-primary shadow-2xl border transition-all flex flex-col justify-between cursor-pointer scale-105 z-10 ${
            selectedPlan === "duo" ? "ring-2 ring-secondary-container" : "border-white/10"
          }`}
        >
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-secondary-container text-white text-[11px] font-bold shadow-md">
            Best Value • Recommended
          </div>

          <div>
            <div className="flex justify-between items-start mb-6 pt-2">
              <div>
                <h3 className="font-headline font-bold text-xl text-white">Business Duo</h3>
                <span className="text-xs text-zinc-300">Front counter + bar checkout</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-extrabold text-2xl text-white">$89</span>
                <span className="text-[10px] block text-zinc-400 uppercase font-semibold">One-time</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 text-xs text-white font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>2x Smart Standees (Front &amp; Bar)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Full AI Sentiment Interceptor Shield</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Multi-Location Telemetry &amp; Peak Hour Charts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>1-Click AI Review Reply Generator</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Priority Express Shipping Included</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onOpenAuth("signup")}
            className="w-full py-3.5 px-4 rounded-xl bg-secondary-container hover:bg-secondary-container/90 text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            Claim Business Duo
          </button>
        </div>

        {/* Tier 3: Enterprise */}
        <div 
          onClick={() => setSelectedPlan("enterprise")}
          className={`p-8 rounded-3xl bg-surface-container shadow-sm border transition-all flex flex-col justify-between cursor-pointer ${
            selectedPlan === "enterprise" ? "ring-2 ring-secondary-container bg-surface-container-low" : "border-surface-variant/40"
          }`}
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Enterprise Fleet</h3>
                <span className="text-xs text-on-surface-variant">Franchises &amp; multi-unit venues</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-extrabold text-2xl text-on-surface">Custom</span>
                <span className="text-[10px] block text-on-surface-variant uppercase font-semibold">Volume tier</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 text-xs text-on-surface font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>5+ Custom Pantone Acrylic Standees</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Direct POS Integration &amp; Webhook API</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Centralized Superadmin Fleet Console</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Dedicated Enterprise Account Specialist</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Custom Metallic Inlay &amp; Heavy Base</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onOpenAuth("signup")}
            className="w-full py-3 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-dim text-on-surface text-xs font-bold transition-colors cursor-pointer"
          >
            Contact Fleet Sales
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
      <div className="max-w-3xl mx-auto w-full mb-12">
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
    </div>
  );
}
