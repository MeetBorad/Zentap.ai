"use client";

import React, { useState, useEffect } from "react";
import { 
  Star, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Store,
  ChevronRight,
  MessageSquare,
  Users
} from "lucide-react";
import Standee3DPreview from "../Standee3DPreview";
import SentimentSimulator from "../SentimentSimulator";
import { ActiveView } from "../Header";

interface HomeViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
  onTriggerTapReviewModal: () => void;
}

export default function HomeView({
  onNavigate,
  onOpenAuth,
  onTriggerTapReviewModal,
}: HomeViewProps) {
  const [reviewCount, setReviewCount] = useState(45382);

  // Periodic subtle count-up to simulate live review arrivals
  useEffect(() => {
    const timer = setInterval(() => {
      setReviewCount((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const logos = [
    "Cafe Milano",
    "The Urban Bistro",
    "Aditi's Bake Studio",
    "Iron Works Fitness",
    "Nirvana Salon & Spa",
    "Dr. Rao Dental Care",
    "The Loft Cowork",
    "Masala Junction",
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Live Review Counter Pill */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-surface-container-high mb-6 shadow-sm border border-surface-variant/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="w-4 h-4 text-secondary-container" />
              <span className="text-xs text-on-surface font-semibold tracking-tight">
                Over <span className="font-mono text-secondary-container font-bold">{reviewCount.toLocaleString()}</span>+ Verified Reviews Generated
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight leading-[1.15] mb-5">
              Turn Every Customer Tap into{" "}
              <span className="text-secondary-container underline decoration-secondary/30 decoration-wavy">
                5-Star Google Reviews
              </span>{" "}
              instantly
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-on-surface-variant mb-8 leading-relaxed max-w-2xl">
              Smart NFC &amp; Dynamic QR standees engineered for restaurants, salons, and retail stores. Boost your local Google ranking by 300% without awkward asking or paper feedback cards.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 mb-10">
              <button
                onClick={() => onOpenAuth("signup")}
                className="py-3.5 px-6 rounded-2xl bg-secondary-container text-on-secondary-container font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Get Started • 14-Day Free Pilot</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate("portal")}
                className="py-3.5 px-6 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm flex items-center justify-center gap-2 border border-surface-variant/50 transition-colors cursor-pointer"
              >
                <Store className="w-4 h-4 text-secondary-container" />
                <span>Explore Client Portal</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-surface-variant/30 text-xs text-on-surface-variant">
              <div>
                <p className="font-headline font-bold text-lg text-on-surface">3.8x</p>
                <p className="text-[11px]">More Google Reviews</p>
              </div>
              <div>
                <p className="font-headline font-bold text-lg text-on-surface">0.6s</p>
                <p className="text-[11px]">Tap to Review Speed</p>
              </div>
              <div>
                <p className="font-headline font-bold text-lg text-on-surface">100%</p>
                <p className="text-[11px]">Zero App Download</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Standee Preview */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <Standee3DPreview onTapSuccess={onTriggerTapReviewModal} />
          </div>
        </div>
      </section>

      {/* Verified Clients Logo Banner */}
      <section className="w-full bg-surface-container-low py-6 border-y border-surface-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-4">
            Trusted by 620+ local venues across the country
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-75">
            {logos.map((logo) => (
              <span
                key={logo}
                className="font-headline font-semibold text-xs sm:text-sm text-on-surface tracking-tight"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Key Feature Trio */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-secondary">
              Engineered for Rapid Growth
            </span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
              Zero Friction. Pure 5-Star Velocity.
            </h2>
          </div>
          <button
            onClick={() => onNavigate("features")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-container hover:underline self-start sm:self-auto cursor-pointer"
          >
            <span>View all ecosystem features</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                Instant Tap-to-Review
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Works seamlessly with iOS and Android. No Bluetooth pairing, no WiFi passwords, and zero app installs required.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-variant/20 flex items-center justify-between text-xs font-semibold text-secondary">
              <span>99.8% Read Reliability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                AI Sentiment Guard
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Automatically routes happy diners (4-5 stars) to Google Maps, while capturing frustrated guests (1-3 stars) privately for management resolution.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-variant/20 flex items-center justify-between text-xs font-semibold text-secondary">
              <span>Shields Public Rating</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm border border-surface-variant/40 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-secondary flex items-center justify-center mb-4">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                Dynamic Link Updates
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Repoint your physical standee's destination URL anytime from your phone: switch between Google Reviews, Yelp, TripAdvisor, or your Guest WiFi page in 1 click.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-variant/20 flex items-center justify-between text-xs font-semibold text-secondary">
              <span>Cloud Telemetry Sync</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sentiment Simulator Teaser */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
        <SentimentSimulator />
      </section>

      {/* Bottom Start Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-primary text-on-primary p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-xl">
            <span className="text-xs font-mono font-bold tracking-wider text-secondary-fixed uppercase">
              Limited Hardware Production Batch
            </span>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white mt-1">
              Ready to turn 200 daily visitors into 50 weekly Google reviews?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2">
              Order your custom laser-engraved standee today. Free express shipping &amp; 14-day risk-free trial included.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuth("signup")}
              className="py-3 px-6 rounded-2xl bg-secondary-container hover:bg-secondary-container/90 text-white font-bold text-xs shadow-lg transition-all cursor-pointer text-center"
            >
              Order Standee Now
            </button>
            <button
              onClick={() => onNavigate("pricing")}
              className="py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer text-center"
            >
              Compare Packages
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
