"use client";

import React from "react";
import { 
  TrendingUp, 
  Star, 
  MapPin, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Award,
  ArrowRight
} from "lucide-react";

interface ResultsViewProps {
  onNavigateToSample: () => void;
  onNavigateToPricing: () => void;
}

export default function ResultsView({ onNavigateToSample, onNavigateToPricing }: ResultsViewProps) {
  const stats = [
    { value: "+410%", label: "Review Volume Increase", detail: "Average review surge across 150+ onboarded venues within 60 days." },
    { value: "4.9 ★", label: "Average Google Rating", detail: "Protected by ZenTap's Google policy-compliant AI review assistant." },
    { value: "+34%", label: "Google Maps Footfall Lift", detail: "Measurable increase in Google directions, calls, and walk-in visitors." },
    { value: "88%", label: "Tap Conversion Rate", detail: "88 out of 100 tapping guests successfully publish a Google review." },
  ];

  const caseStudies = [
    {
      business: "Virat Gold Palace",
      category: "Certified 22K Hallmark Gold & Diamond Jewellery",
      location: "Nikol Gam Road, Ahmedabad",
      before: "42 Reviews (3.9 ★)",
      after: "382 Reviews (4.9 ★)",
      lift: "+810% Review Growth",
      quote:
        "Before ZenTap, asking customers at the billing counter was awkward and rarely worked. With the custom acrylic standee, customers tap their phone and get Gujarati review drafts instantly. We are now ranked #1 on Google Maps in our entire area!",
      metrics: ["1,428 Monthly Guest Taps", "Ranked #1 in Jewellery Nikol", "Zero Public Escalations"],
    },
    {
      business: "The Urban Bistro & Lounge",
      category: "Artisanal Cafe & European Brunch",
      location: "Sindhu Bhavan Road, Ahmedabad",
      before: "180 Reviews (4.1 ★)",
      after: "964 Reviews (4.8 ★)",
      lift: "+435% Review Lift",
      quote:
        "The AI assistant is magic. Guests love seeing drafts highlighting our sourdough toasts and craft coffee. It boosted our Google profile reach tremendously and brought in waves of new weekend brunch walk-ins.",
      metrics: ["964 Verified Guest Reviews", "+45% Weekend Dine-in Lift", "18s Average Tap Time"],
    },
    {
      business: "Dr. Rao Dental Care & Implant Center",
      category: "Multispeciality Dental Clinic",
      location: "Navrangpura, Ahmedabad",
      before: "28 Reviews (4.3 ★)",
      after: "419 Reviews (4.9 ★)",
      lift: "+1,396% Growth",
      quote:
        "In healthcare, patient trust is everything. Patients tap their phone as they complete their appointment. The confidential feedback feature gives us immediate feedback if anyone had discomfort, keeping our public Google score pristine.",
      metrics: ["419 High-Trust Patient Reviews", "Top 3 Dental Clinic in Ahmedabad", "100% Google Compliant"],
    },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Documented Performance
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface mt-2 tracking-tight">
          Real Local Businesses. Verified Google Results.
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          See how local retail showrooms, cafes, and healthcare practices dominate their local Google Search rankings with ZenTap.
        </p>
      </div>

      {/* SEO Boost Callout */}
      <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-secondary/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg sm:text-xl text-on-surface">
              Helps Boost Your Google Profile Reach, Views &amp; Overall Local SEO
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Google algorithms continuously crawl review sentiment, frequency, and verified check-in signals. ZenTap gives your profile the algorithmic momentum needed to stay at the top.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToSample}
          className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          See Live Telemetry Demo
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
        {stats.map((st, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="font-headline font-black text-3xl sm:text-4xl text-secondary block">
                {st.value}
              </span>
              <span className="font-headline font-bold text-xs sm:text-sm text-on-surface block mt-1">
                {st.label}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-3 leading-relaxed border-t border-surface-variant/20 pt-2">
              {st.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Case Studies Grid */}
      <div className="space-y-8 mb-16">
        <div className="text-center mb-8">
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            Featured Merchant Case Studies
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Real before &amp; after transformations across retail, dining, and healthcare.
          </p>
        </div>

        {caseStudies.map((cs, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-surface-variant/40 shadow-sm flex flex-col lg:flex-row items-start justify-between gap-8 hover:border-secondary/40 transition-all"
          >
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                  {cs.lift}
                </span>
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-secondary" />
                  <span>{cs.location}</span>
                </span>
              </div>

              <h3 className="font-headline font-bold text-xl text-on-surface">
                {cs.business}
              </h3>
              <span className="text-xs text-on-surface-variant block mb-4 font-medium">
                {cs.category}
              </span>

              <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed mb-6 bg-surface p-4 rounded-2xl border border-surface-variant/30">
                &quot;{cs.quote}&quot;
              </p>

              <div className="flex flex-wrap gap-2">
                {cs.metrics.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-on-surface border border-surface-variant/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Before vs After Visual Box */}
            <div className="w-full lg:w-72 p-6 rounded-2xl bg-surface border border-surface-variant/40 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-3">
                Rating Evolution
              </span>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant/30">
                  <span className="text-[10px] text-zinc-500 font-medium block">Before ZenTap:</span>
                  <span className="font-headline font-bold text-sm text-zinc-400 line-through">
                    {cs.before}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-secondary-container/20 border border-secondary-container text-secondary">
                  <span className="text-[10px] font-bold uppercase block text-secondary">With ZenTap AI:</span>
                  <span className="font-headline font-black text-lg text-secondary">
                    {cs.after}
                  </span>
                </div>
              </div>

              <div className="flex text-amber-500 text-xs mt-4">
                {"★".repeat(5)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-surface-container text-center max-w-3xl mx-auto">
        <h3 className="font-headline font-bold text-2xl text-on-surface">
          Want Similar Growth for Your Venue?
        </h3>
        <p className="text-xs text-on-surface-variant mt-2 max-w-lg mx-auto">
          Explore the exact standee hardware packs and select the option that fits your store.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onNavigateToPricing}
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>View Standee Plans (from ₹500)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
