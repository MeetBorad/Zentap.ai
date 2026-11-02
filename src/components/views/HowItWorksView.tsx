"use client";

import React from "react";
import { 
  Radio, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  QrCode, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Globe,
  Play
} from "lucide-react";
import StandeeVisual from "@/components/StandeeVisuals";
import SmartStandeeAnimation from "@/components/SmartStandeeAnimation";
import { OpenDesignButton, OpenDesignCard } from "@/components/open-design";

interface HowItWorksViewProps {
  onOpenAuth: (tab: "signin" | "signup" | "admin") => void;
  onNavigateToSample: () => void;
}

export default function HowItWorksView({ onOpenAuth, onNavigateToSample }: HowItWorksViewProps) {
  const steps = [
    {
      step: "01",
      badge: "Instant Hardware Touchpoint",
      title: "Place Standee or Card at Checkout Counter",
      description:
        "Place your custom laser-engraved NFC & dynamic QR standee at your front billing desk, cafe counter, or dining table. Built with durable acrylic or heavy brushed brass, matched to your brand identity.",
      points: [
        "Smart NFC tap chip (zero batteries, works forever)",
        "Precision laser-etched dynamic QR for camera scanning",
        "Encodes unique secure URL: https://www.zentapdigitalsolutions.com/r/{slug}",
      ],
      icon: <Radio className="w-6 h-6 text-secondary" />,
    },
    {
      step: "02",
      badge: "Zero App Download",
      title: "Customer Taps Phone or Scans Camera",
      description:
        "Customers simply tap their phone within 4cm of the standee or scan the QR with their camera. Compatible with 100% of modern iPhones and Android smartphones without any app install.",
      points: [
        "Works with all modern iPhone and Android phones",
        "Instant browser prompt opens in under 1 second",
        "Zero Bluetooth pairing, zero typing, zero searching on Google",
      ],
      icon: <Smartphone className="w-6 h-6 text-sky-500" />,
    },
    {
      step: "03",
      badge: "Customized Review Assistant",
      title: "Review Assistant Drafts Authentic Feedback",
      description:
        "The customer selects their star rating and taps what they liked (quality, polite staff, ambience). Our contextual review engine crafts a personalized, highly relevant review in English, Gujarati, or Hindi.",
      points: [
        "Tone selection: Balanced, Detailed, or Short & Punchy",
        "1-click draft regeneration if customer wants another suggestion",
        "Keyword-rich phrasing designed to trigger Google ranking algorithms",
      ],
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "04",
      badge: "Google Policy Compliant",
      title: "1-Click Post & Direct Google Review Redirection",
      description:
        "When the customer taps 'Post Google Review', the suggested review is copied to their clipboard and they are seamlessly redirected to your live Google Business Profile review dialog to submit in seconds.",
      points: [
        "All ratings (1 to 5) can post to Google in full compliance with Google policies",
        "For 1-2 stars, an additional private feedback form is provided directly to management",
        "Customer submits review on their own Google account for 100% authentic social proof",
      ],
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Complete Ecosystem &amp; How It Works
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface mt-2 tracking-tight">
          Advanced Hardware &amp; AI Routing Capabilities
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          Every standee is packed with smart contactless NFC chips, weatherproof matte acrylic, and real-time cloud management that helps happy customers leave Google reviews in seconds.
        </p>
      </div>

      {/* Stitch 4-Pillar Hardware & AI Capability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary mb-4">
              <Radio className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
              Smart Contactless Tap Chip
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Embedded with top-tier NFC technology allowing instantaneous reading speeds even through protective phone cases. Fully encrypted write-protection prevents tampering.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-surface-variant/30 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>Instant Tap & Scan</span>
            <span className="text-emerald-400 font-bold">100% Battery-Free</span>
          </div>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 mb-4">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
              Google Review Assistant
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Our smart landing page dynamically assesses customer mood. Every customer can easily open your Google review page to share their genuine feedback.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-surface-variant/30 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>Protection: FTC / Google Compliant</span>
            <span className="text-amber-400 font-bold">Open & Direct</span>
          </div>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 flex items-center justify-center text-sky-400 mb-4">
              <TrendingUp className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
              Live Tap Telemetry &amp; Analytics
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Monitor peak review hours, conversion rates per table or cashier station, and track employee performance bonuses linked directly to customer engagement.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-surface-variant/30 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>Engine: Real-Time Webhooks</span>
            <span className="text-sky-400 font-bold">Live Conversion Tracking</span>
          </div>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-low border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
              Custom Pantone Branding
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Match your exact interior aesthetic. Choose between obsidian matte black, brushed gold metallic, minimalist white, or custom corporate brand colors.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-surface-variant/30 flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>Finishes: 4 Studio Materials</span>
            <span className="text-emerald-400 font-bold">Laser Engraved</span>
          </div>
        </div>
      </div>

      {/* Interactive Standee 9:16 Video Stage Showcase */}
      <div className="mb-20 p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-b from-surface-container via-surface-container-low to-surface border border-secondary/20 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Context, Features & Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Interactive Hardware Simulation</span>
            </div>

            <h2 className="font-headline font-black text-2xl sm:text-4xl text-on-surface leading-tight tracking-tight">
              See the ZenTap Smart Standee in Action
            </h2>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Watch how our acrylic and brushed metal hardware bridges physical foot traffic directly into 5-star Google reviews. Customers simply tap their NFC-capable smartphone or scan the laser-cut dynamic QR code.
            </p>

            {/* Micro Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-surface-variant/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Dual NFC + QR Standee</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Zero battery, zero cables. Works seamlessly on iOS &amp; Android.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-surface-variant/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">AI Review Engine</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Generates authentic, keyword-dense reviews in under 5 seconds.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-surface-variant/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Google Policy Safe</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Direct Google Maps integration with transparent posting.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-high/60 border border-surface-variant/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-500 flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Multilingual Drafts</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Instant review suggestions in English, Gujarati, and Hindi.</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <OpenDesignButton
                variant="primary"
                size="md"
                onClick={onNavigateToSample}
                className="shadow-sm"
              >
                <span>View Sample Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </OpenDesignButton>

              <a
                href="https://wa.me/919274560880?text=Hi,%20I%20want%20to%20order%20a%20ZenTap%20standee"
                target="_blank"
                rel="noreferrer"
                className="tactile-btn-subtle px-5 py-3 rounded-xl bg-surface-container hover:bg-surface-dim text-on-surface text-xs font-bold transition-all border border-surface-variant/40 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Order Custom Standee</span>
              </a>
            </div>
          </div>

          {/* Right Column: 9:16 Interactive Video Container */}
          <div className="lg:col-span-5 flex justify-center">
            <SmartStandeeAnimation />
          </div>

        </div>
      </div>

      {/* SEO Boost Value Proposition Banner */}
      <div className="mb-16 p-6 rounded-3xl bg-gradient-to-r from-secondary/15 via-primary/10 to-secondary/15 border border-secondary/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block">
              Core SEO Engine
            </span>
            <h3 className="font-headline font-bold text-lg sm:text-xl text-on-surface">
              Helps Boost Your Google Profile Reach, Views &amp; Overall SEO
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Google&apos;s local algorithm heavily rewards high-frequency verified reviews containing local keywords. ZenTap delivers a constant stream of fresh reviews, rocketing your venue to the top 3-pack on Google Search and Maps.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToSample}
          className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          View Live Sample Dashboard
        </button>
      </div>

      {/* 4 Steps Vertical Grid with Visual Connectors */}
      <div className="space-y-8 mb-16">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-surface-variant/40 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 hover:border-secondary/40 transition-all"
          >
            <div className="flex items-start gap-5 max-w-2xl">
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center shadow-md flex-shrink-0 border border-surface-variant/40 relative">
                {s.icon}
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-on-primary font-headline font-black text-[10px] flex items-center justify-center shadow">
                  {s.step}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
                  {s.badge}
                </span>
                <h3 className="font-headline font-bold text-lg sm:text-xl text-on-surface mt-0.5 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  {s.description}
                </p>

                <div className="space-y-1.5">
                  {s.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs text-on-surface">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Illustration Preview */}
            <div className="w-full lg:w-72 p-4 rounded-2xl bg-surface border border-surface-variant/30 flex flex-col items-center text-center">
              {idx === 0 && (
                <StandeeVisual type="standee_1500" businessName="CAFE MILANO" className="scale-75 -my-6" />
              )}
              {idx === 1 && (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 mb-2 transition-transform duration-500 hover:scale-105">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold text-on-surface">Hold Phone Close</span>
                  <span className="text-[10px] text-on-surface-variant">Instant NFC Link Detection</span>
                </div>
              )}
              {idx === 2 && (
                <div className="py-4 text-left w-full space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-secondary font-bold">
                    <span>✨ Smart Review Drafts</span>
                    <span>EN • GU • HI</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container text-[11px] text-on-surface italic leading-relaxed">
                    &quot;Exceptional hospitality, fast billing, and authentic quality. Best in Ahmedabad! ⭐⭐⭐⭐⭐&quot;
                  </div>
                </div>
              )}
              {idx === 3 && (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-2">
                    <Globe className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">302 Direct Redirect</span>
                  <span className="text-[10px] text-on-surface-variant">Live Google Review Submission</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-surface-container text-center max-w-3xl mx-auto">
        <h3 className="font-headline font-bold text-2xl text-on-surface">
          Ready to Automate Your Venue&apos;s Review Generation?
        </h3>
        <p className="text-xs text-on-surface-variant mt-2 max-w-lg mx-auto">
          Explore our interactive Sample Dashboard to see how your metrics, reviews, and NFC taps will look live.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={onNavigateToSample}
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>Explore Sample Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="https://wa.me/919274560880?text=Hi,%20I%20want%20to%20order%20a%20ZenTap%20standee"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-2xl bg-[#25D366] text-black font-extrabold text-xs hover:bg-[#20bd5a] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>Contact us on WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
}
