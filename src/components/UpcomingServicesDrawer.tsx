"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Globe, 
  UtensilsCrossed, 
  Hotel, 
  CalendarCheck, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Send,
  Zap,
  Layers
} from "lucide-react";

interface UpcomingServicesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function UpcomingServicesDrawer({ isOpen, onClose, onOpen }: UpcomingServicesDrawerProps) {
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [selectedService, setSelectedService] = useState("Website Building with Custom Domain");
  const [submitted, setSubmitted] = useState(false);

  const upcomingServices = [
    {
      id: "website",
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      badge: "In High Demand",
      title: "Website Building with Custom Domain",
      description:
        "Stunning, high-converting mobile-first websites engineered with your custom .com or .in domain, ultra-fast hosting, SSL security, and integrated Google SEO optimization.",
      features: ["Custom Domain & Free SSL", "Google SEO Indexed in 48h", "WhatsApp One-Click Leads", "Zero Monthly Hosting Fees"],
    },
    {
      id: "crm",
      icon: <UtensilsCrossed className="w-5 h-5 text-amber-400" />,
      badge: "Hospitality Specialized",
      title: "Customized CRM System for Cafe / Restaurant",
      description:
        "Full-cycle customer retention engine designed specifically for food & beverage businesses to drive repeat dine-ins and automate guest loyalty.",
      features: ["Digital Table QR Ordering", "Automated Birthday & Anniversary Offers", "Guest Repeat Visit Tracker", "Billing & POS Integration"],
    },
    {
      id: "hms",
      icon: <Hotel className="w-5 h-5 text-emerald-400" />,
      badge: "Cloud-Native",
      title: "Hotel Management System (HMS)",
      description:
        "End-to-end cloud property management for boutique hotels, resorts, and guest houses. Manage reservations, room inventory, and guest communication from one unified tablet.",
      features: ["Contactless Mobile Check-In", "Real-Time Room Inventory Grid", "Automated Folio & GST Billing", "Housekeeping Status Dispatch"],
    },
    {
      id: "booking",
      icon: <CalendarCheck className="w-5 h-5 text-purple-400" />,
      badge: "Automated Calendar",
      title: "Booking & Appointment Apps Building",
      description:
        "Tailored web & mobile booking applications for salons, healthcare clinics, fitness clubs, and professional consultants with zero double-booking.",
      features: ["Slot Booking & Calendar Sync", "Instant WhatsApp SMS Confirmations", "Advance UPI Deposit Collection", "Staff Schedule Allocator"],
    },
    {
      id: "growth",
      icon: <TrendingUp className="w-5 h-5 text-rose-400" />,
      badge: "Holistic Transformation",
      title: "Overall Help Your Business Grow With Technology",
      description:
        "We partner with ambitious local and regional business owners to replace slow manual paperwork with fast, automated digital technology workflows.",
      features: ["Custom Software Architecture", "Google Maps & Search Ranking Boost", "Automated Customer Pipelines", "Dedicated Tech Pair Programming"],
    },
  ];

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setInquiryName("");
      setInquiryPhone("");
      onClose();
    }, 3000);
  };

  return (
    <>
      {/* Floating Side Icon / Pill on the right edge (always accessible) */}
      <button
        onClick={onOpen}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-l from-secondary to-primary text-on-primary py-3 px-3.5 rounded-l-2xl shadow-2xl flex items-center gap-2 border-y border-l border-white/20 hover:px-4.5 transition-all group cursor-pointer"
        title="Explore Upcoming Projects & Technology Services"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-secondary-container animate-spin duration-3000" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="[writing-mode:vertical-rl] text-xs font-bold tracking-wider uppercase rotate-180 py-1 font-headline">
          Upcoming Tech Services
        </span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-surface-container-lowest h-full overflow-y-auto border-l border-surface-variant/40 shadow-2xl p-6 sm:p-8 animate-in slide-in-from-right duration-300 flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-surface-variant/40 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">
                      ZenTap Innovation Labs
                    </span>
                    <h2 className="font-headline font-bold text-xl text-on-surface">
                      Upcoming Projects &amp; Services
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                Beyond physical NFC review standees, ZenTap is building a full-suite digital technology powerhouse to help your business modernize, automate workflows, and dominate your local market.
              </p>

              {/* Service Cards */}
              <div className="space-y-4 mb-8">
                {upcomingServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-surface-variant/40 hover:border-secondary/40 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shadow-sm">
                          {srv.icon}
                        </div>
                        <h3 className="font-headline font-bold text-sm text-on-surface">
                          {srv.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary-container border border-secondary-container/30">
                        {srv.badge}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-surface-variant/20">
                      {srv.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-on-surface">
                          <CheckCircle2 className="w-3 h-3 text-secondary flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Early Access Form */}
            <div className="p-5 rounded-2xl bg-surface-container border border-secondary/30 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-secondary" />
                <h4 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">
                  Request Priority Early Access
                </h4>
              </div>

              {submitted ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-700 font-semibold">
                  ✓ Thank you! Our tech architect will contact you within 24 hours.
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Your Name / Business"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/60 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp Mobile"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/60 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/60 text-xs text-on-surface focus:outline-none focus:border-secondary"
                  >
                    {upcomingServices.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Inquire for Early Onboarding</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
