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
  Globe
} from "lucide-react";
import StandeeVisual from "@/components/StandeeVisuals";

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
        "High-permeability NTAG216 NFC chip (zero batteries or charging)",
        "Precision laser-etched dynamic QR for camera scanning",
        "Encodes unique secure URL: https://zentap.ai/r/{slug}",
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
        "Native NFC hardware handshake on iOS (iPhone XS+) & Android",
        "Instant browser prompt opens in under 400 milliseconds",
        "Zero Bluetooth pairing, zero typing, zero searching on Google",
      ],
      icon: <Smartphone className="w-6 h-6 text-sky-500" />,
    },
    {
      step: "03",
      badge: "Customized AI Assistant",
      title: "AI Review Assistant Drafts Glowing Review",
      description:
        "The customer selects their star rating and taps what they liked (quality, polite staff, ambience). Our contextual AI crafts a personalized, highly relevant review in English, Gujarati, or Hindi.",
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
        "When the customer taps 'Post Google Review', the AI suggestion is copied to their clipboard and they are seamlessly redirected to your live Google Business Profile review dialog to submit in seconds.",
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
          Frictionless 4-Step Process
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface mt-2 tracking-tight">
          How ZenTap Turns Counter Visits Into 5-Star Reviews
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          From the physical NFC tap to live publication on Google Maps, our automated workflow turns 88% of happy customers into enthusiastic online advocates in under 15 seconds.
        </p>
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
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 mb-2 animate-bounce">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold text-on-surface">Hold Phone Close</span>
                  <span className="text-[10px] text-on-surface-variant">Instant NFC Link Detection</span>
                </div>
              )}
              {idx === 2 && (
                <div className="py-4 text-left w-full space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-secondary font-bold">
                    <span>✨ AI Review Generator</span>
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

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onNavigateToSample}
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>Explore Sample Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAuth("signup")}
            className="px-6 py-3 rounded-2xl bg-secondary-container text-on-secondary-container font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
          >
            Sign Up Business
          </button>
        </div>
      </div>

    </div>
  );
}
