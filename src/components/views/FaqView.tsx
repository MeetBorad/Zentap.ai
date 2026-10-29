"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles, TrendingUp, ArrowRight } from "lucide-react";

interface FaqViewProps {
  onNavigateToPricing: () => void;
  onOpenUpcomingDrawer?: () => void;
}

export default function FaqView({ onNavigateToPricing, onOpenUpcomingDrawer }: FaqViewProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does the customer need to download any app or enable Bluetooth?",
      a: "No! No app, download, login, or Bluetooth pairing is required. Both Apple iOS (iPhone XS and newer) and all modern Android devices detect the NTAG216 chip instantly when held within 4cm of the standee or smart card. A browser prompt pops up natively in under 400 milliseconds.",
    },
    {
      q: "How does ZenTap boost our Google Business Profile reach and SEO?",
      a: "Google's local search algorithms heavily prioritize review velocity (how frequently new reviews appear), verified local customer check-in signals, and relevant keywords in review text. ZenTap prompts guests right after a positive transaction and generates keyword-rich drafts, signaling immense local popularity to Google Search and Maps algorithms, boosting your impressions, direction requests, and phone calls.",
    },
    {
      q: "How does the rating flow comply with Google review policies?",
      a: "ZenTap is 100% compliant with Google's strict anti-gating policies. Every customer selecting 1 to 5 stars has full access to the 'Post Google Review' button. The AI draft is merely a helpful suggestion, and the customer submits the review themselves on their own Google account. For 1-2 stars, ZenTap additionally provides an extra option to send private confidential feedback directly to store management so the owner can resolve issues immediately.",
    },
    {
      q: "What is the difference between the ₹500 Smart Card and the Standees?",
      a: "The ₹500 Smart Card is a credit-card-sized NFC card with a laser-printed dynamic QR code. It has zero monthly subscription and is ideal for mobile staff, delivery, or solo desks. The ₹1,500 and ₹2,000 Standees are heavy-duty, luxury acrylic or brushed brass counter displays custom-branded with your logo and colors, and include the full AI review assistant suite (+ ₹1,000/month subscription starting next month).",
    },
    {
      q: "Do you support franchises and multi-location businesses?",
      a: "Yes! Our Plan 4 Franchise Custom Plan is designed specifically for multi-branch chains, retail franchises, and hospitality groups. We generate unique QR codes and separate Google review destinations per counter or branch, while providing the owner with a centralized multi-outlet analytics dashboard. You can configure standee quantities and build a customized quotation directly from the pricing tab or your merchant portal.",
    },
    {
      q: "Can I update my Google review link after receiving the physical standee?",
      a: "Yes! Your physical hardware encodes a dynamic cloud URL (e.g. https://zentap.ai/r/your-business). You can update your Google Review Link, business address, phone number, or target destination anytime in 1 click from your merchant dashboard without ever replacing the physical hardware.",
    },
    {
      q: "How fast is delivery and how does payment work?",
      a: "Hardware is custom laser-engraved and dispatched across India via BlueDart / Delhivery Express (+ ₹99 extra courier charges). Delivery takes 3 to 5 business days. Once payment is confirmed, your live review assistant page and QR code activate immediately in your merchant portal.",
    },
  ];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold tracking-wider uppercase text-secondary">
          Clear Answers
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-on-surface mt-2 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
          Everything you need to know about ZenTap NFC hardware, Google policy compliance, and cloud setup.
        </p>
      </div>

      {/* SEO Banner */}
      <div className="mb-10 p-5 rounded-2xl bg-surface-container-low border border-secondary/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-on-surface">
              Helps Boost Your Google Profile Reach, Views &amp; Overall SEO
            </h4>
            <p className="text-[11px] text-on-surface-variant">
              Every customer tap reinforces your venue&apos;s local authority on Google Maps and Google Search.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToPricing}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          View Plans
        </button>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3 mb-14">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-surface-container border border-surface-variant/40 overflow-hidden transition-all shadow-sm"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-4 sm:p-5 text-left flex justify-between items-center text-xs sm:text-sm font-semibold text-on-surface cursor-pointer gap-4"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-on-surface-variant transition-transform flex-shrink-0 ${
                  openIdx === idx ? "rotate-180 text-secondary" : ""
                }`}
              />
            </button>
            {openIdx === idx && (
              <div className="px-4 sm:px-5 pb-5 text-xs text-on-surface-variant leading-relaxed border-t border-surface-variant/20 pt-3 animate-in fade-in duration-150">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Section After FAQ: Upcoming Projects & Digital Services Trigger */}
      <div className="p-8 rounded-3xl bg-surface-container-low border border-surface-variant/40 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs mb-3">
          <Sparkles className="w-4 h-4" />
          <span>ZenTap Innovation Labs</span>
        </div>

        <h3 className="font-headline font-bold text-xl sm:text-2xl text-on-surface">
          Explore Our Upcoming Projects &amp; Digital Services
        </h3>
        <p className="text-xs text-on-surface-variant mt-2 max-w-lg mx-auto leading-relaxed">
          Website building with custom domain, customized CRM systems for cafes &amp; restaurants, hotel management systems (HMS), booking-related apps, and overall helping your business grow with modern technology.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
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
