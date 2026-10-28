"use client";

import React from "react";
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Users, 
  Search, 
  Award, 
  CheckCircle2, 
  Globe, 
  Clock, 
  Smartphone,
  ArrowRight
} from "lucide-react";

interface BenefitsViewProps {
  onNavigateToPricing: () => void;
  onNavigateToSample: () => void;
}

export default function BenefitsView({ onNavigateToPricing, onNavigateToSample }: BenefitsViewProps) {
  const benefits = [
    {
      icon: <Search className="w-6 h-6 text-sky-500" />,
      badge: "Local SEO Surge",
      title: "Dominating Google Maps & Local 3-Pack Rankings",
      description:
        "Review recency, volume, and keyword density represent over 43% of Google's local pack algorithm. ZenTap consistently feeds fresh 5-star reviews to your profile, pushing your listing above competitors in local search results.",
      impact: "+300% to +500% more monthly Google Maps discovery views",
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      badge: "Frictionless Speed",
      title: "5X Faster Review Collection (Under 15 Seconds)",
      description:
        "Asking customers to 'search us on Google' loses 92% of reviews. With ZenTap, a single phone tap immediately opens the AI Review Assistant with pre-crafted suggestions, converting 88% of willing guests on the spot.",
      impact: "Average review submission drops from 4 minutes to 15 seconds",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      badge: "Google Policy Compliant",
      title: "Rating Shield & Private Feedback Channel",
      description:
        "Every rating (1 to 5) has access to post on Google. For 1-2 star ratings, ZenTap additionally offers an immediate confidential channel to store management, defusing unhappy guests before public escalation.",
      impact: "Intercepts ~94% of unhappy guest complaints for private resolution",
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      badge: "Multilingual Reach",
      title: "Native English, Gujarati & Hindi AI Support",
      description:
        "Cater to every demographic in India. Customers can toggle between English, Gujarati, and Hindi with 1 tap, generating articulate and culturally resonant feedback.",
      impact: "Caters to regional customer bases across Gujarat and pan-India",
    },
    {
      icon: <Zap className="w-6 h-6 text-rose-500" />,
      badge: "Zero Maintenance",
      title: "Zero Batteries, Zero Charging & 10-Year Durability",
      description:
        "Powered by passive near-field radio induction (NFC NTAG216). Requires no power cables, charging, or WiFi configuration. Simply place it on your counter and it works 24/7 forever.",
      impact: "100% passive hardware with lifetime durability",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-secondary" />,
      badge: "Revenue Multiplier",
      title: "Higher Star Ratings Directly Drive Footfalls",
      description:
        "Harvard Business School research shows that every 1-star improvement on Google/Yelp lifts revenue by 5% to 9%. Higher review counts create psychological social proof that turns casual passersby into paying customers.",
      impact: "Proven direct correlation with walk-in revenue expansion",
    },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Business Transformation
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface mt-2 tracking-tight">
          Why Modern Business Owners Choose ZenTap
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          More than an acrylic standee—ZenTap is an automated customer reputation engine engineered to rank your business #1 in your city.
        </p>
      </div>

      {/* SEO Boost Headline Banner */}
      <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-surface-container-low border border-secondary/30 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Core Service Pitch</span>
            </div>
            <h2 className="font-headline font-bold text-xl sm:text-2xl text-on-surface">
              Helps Boost Your Google Profile Reach, Views &amp; Optimizes Overall SEO
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
              When Google detects real human customers tapping NFC devices and posting detailed reviews with location keywords, your business authority skyrockets, outranking older competitors who rely on sporadic manual reviews.
            </p>
          </div>

          <button
            onClick={onNavigateToPricing}
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
          >
            Explore Standee Plans
          </button>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {benefits.map((b, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm hover:border-secondary/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-sm border border-surface-variant/30">
                  {b.icon}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary-container border border-secondary-container/30">
                  {b.badge}
                </span>
              </div>

              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                {b.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                {b.description}
              </p>
            </div>

            <div className="pt-4 border-t border-surface-variant/30 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{b.impact}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-surface-container text-center max-w-3xl mx-auto">
        <h3 className="font-headline font-bold text-2xl text-on-surface">
          Experience the Difference with Our Live Demo
        </h3>
        <p className="text-xs text-on-surface-variant mt-2 max-w-lg mx-auto">
          See the actual metrics, taps, and ratings generated for active merchants on the Sample Dashboard.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onNavigateToSample}
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>Open Sample Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
