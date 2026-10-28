"use client";

import React from "react";
import { 
  Star, 
  CheckCircle2, 
  MapPin, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from "lucide-react";

interface ClientProofsViewProps {
  onNavigateToPricing: () => void;
}

export default function ClientProofsView({ onNavigateToPricing }: ClientProofsViewProps) {
  const testimonials = [
    {
      name: "Hareshbhai Soni",
      role: "Managing Director",
      business: "Virat Gold Palace, Nikol Ahmedabad",
      rating: 5,
      avatar: "HS",
      content:
        "The best tech investment we made for our showroom. In retail jewellery, trust is everything. Customers tap the gold standee right while billing, and in 15 seconds their review is live on Google with Gujarati or English text. Our Google search rank jumped straight to #1 in Nikol!",
      verifiedBadge: "Verified Standee Deployed (Obsidian Edition)",
    },
    {
      name: "Rhea Deshmukh",
      role: "Owner & Head Chef",
      business: "The Urban Bistro & Lounge, SG Highway",
      rating: 5,
      avatar: "RD",
      content:
        "We used to struggle getting our diners to leave reviews after their meal. With ZenTap standees on our tables, guests love the experience because they don't have to type anything—the AI drafts it for them. We went from 180 reviews to nearly 1,000 reviews in 4 months!",
      verifiedBadge: "Verified Standee Deployed (Brushed Brass)",
    },
    {
      name: "Dr. Sandeep Rao",
      role: "Chief Dental Surgeon",
      business: "Dr. Rao Multispeciality Dental Care",
      rating: 5,
      avatar: "SR",
      content:
        "The compliance and rating rules are what made me choose ZenTap. When patients have a great visit, they post on Google immediately. And if anyone experienced minor pain or billing delay, the private feedback feature lets them alert me directly instead of posting angry rants on Google.",
      verifiedBadge: "Verified Healthcare Standee",
    },
    {
      name: "Karan Mehta",
      role: "Co-Founder",
      business: "Iron Works Fitness Arena, Bodakdev",
      rating: 5,
      avatar: "KM",
      content:
        "Members tap the smart card at the reception turnstile on their way out. The sheer volume of reviews boosted our Google Maps views by 34%, bringing in dozens of walk-in gym membership inquiries every week.",
      verifiedBadge: "Verified TapCard Active",
    },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Social Proof &amp; Verification
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface mt-2 tracking-tight">
          Trusted by 150+ Ambitious Business Owners
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          From bustling cafes and high-ticket luxury jewellery showrooms to busy clinics—read authentic feedback from business owners using ZenTap every single day.
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
          onClick={onNavigateToPricing}
          className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          Order Your Standee
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between hover:border-secondary/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-headline font-bold text-base border border-secondary/30">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-on-surface">
                      {t.name}
                    </h4>
                    <span className="text-xs text-on-surface-variant">
                      {t.role} • <strong className="text-on-surface">{t.business}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex text-amber-500 text-xs">
                  {"★".repeat(t.rating)}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed mb-6 bg-surface p-4 rounded-2xl border border-surface-variant/30">
                &quot;{t.content}&quot;
              </p>
            </div>

            <div className="pt-3 border-t border-surface-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{t.verifiedBadge}</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Google Verified</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-surface-container text-center max-w-3xl mx-auto">
        <h3 className="font-headline font-bold text-2xl text-on-surface">
          Join Over 150+ Leading Local Businesses
        </h3>
        <p className="text-xs text-on-surface-variant mt-2 max-w-lg mx-auto">
          Start collecting authentic 5-star Google reviews today with zero tech setup required.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onNavigateToPricing}
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>View Pricing &amp; Standee Options</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
