"use client";

import React from "react";
import { ActiveView } from "./Header";
import { ArrowUp, Radio, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { trackPhoneClick, trackEmailClick, trackWhatsAppClick } from "@/lib/analytics";

interface FooterProps {
  currentView?: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
}

export default function Footer({ currentView, onNavigate, onOpenAuth }: FooterProps) {
  const { user, isAdmin, signOut } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Minimal footer on private dashboards
  if (currentView === "portal" || currentView === "admin") {
    return (
      <footer className="w-full bg-[#0e1015] border-t border-[#232734] py-4 text-[11px] font-mono text-zinc-300 text-center">
        © 2026 ZenTap · Workspace Session Active
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#0a0c10] border-t border-[#232734] mt-20 pt-12 pb-16 text-xs text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hardware & Policy Disclosure Bar */}
        <div className="mb-10 p-5 rounded-2xl bg-[#141720] border border-[#232734] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <Radio className="w-4 h-4 text-[#ff7a00] flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs text-white leading-relaxed">
              <strong className="text-[#ff7a00]">Google Anti-Gating Compliant:</strong> ZenTap preserves public Google review access across all ratings, offering an expedited private resolution channel for sub-4 star experiences.
            </p>
          </div>

          <button
            onClick={() => onNavigate("pricing")}
            className="px-4 py-2 rounded-lg bg-[#ff7a00] text-black text-xs font-bold hover:bg-[#e56d00] transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto shadow-sm"
          >
            Explore Hardware &amp; Pricing
          </button>
        </div>

        {/* Dense Technical Colophon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#232734]">
          
          {/* Col 1: Hardware Specs & Identity */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="ZenTap" 
                className="h-8 w-auto max-w-[140px] object-contain"
              />
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              Precision-crafted NFC &amp; Dynamic QR acrylic standees. Engineered for physical hospitality, clinical, and retail environments.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>NTAG216 · 13.56 MHz · ISO 14443A</span>
            </div>

            {/* Direct Contact Touchpoints */}
            <div className="mt-2 pt-3 border-t border-[#232734] flex flex-col gap-2 text-xs">
              <a
                href="tel:+919274560880"
                onClick={() => trackPhoneClick("+919274560880", "footer")}
                className="flex items-center gap-2 text-white hover:text-[#ff7a00] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                <span>+91 92745 60880</span>
              </a>

              <a
                href="mailto:contact@zentapdigitalsolutions.com"
                onClick={() => trackEmailClick("contact@zentapdigitalsolutions.com", "footer")}
                className="flex items-center gap-2 text-white hover:text-[#ff7a00] transition-colors break-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0" />
                <span>contact@zentapdigitalsolutions.com</span>
              </a>

              <a
                href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20inquire%20about%20NFC%20Google%20Review%20Standees"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer")}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>WhatsApp Instant Support</span>
              </a>

              <div className="flex items-start gap-2 text-slate-300 text-[11px] pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#ff7a00] flex-shrink-0 mt-0.5" />
                <span>Sindhu Bhavan Marg, Bodakdev, Ahmedabad, Gujarat 380054</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation in exact sequence */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold mb-3">
              Explore ZenTap
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("how-it-works")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("pricing")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Products &amp; Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("faq")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQ &amp; Google Policies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Solutions & Hardware */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold mb-3">
              Solutions &amp; Pricing
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate("client-proofs")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Client Proofs &amp; Testimonials
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("pricing")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pricing &amp; Franchise Plans (From ₹500)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("faq")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQ &amp; Google Policies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Access & Orders */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold mb-3">
              {isAdmin ? "Fleet Operations" : "Instant Orders"}
            </h4>
            <ul className="space-y-2 text-xs">
              {isAdmin ? (
                <>
                  <li>
                    <button
                      onClick={() => onNavigate("admin")}
                      className="hover:text-white transition-colors cursor-pointer font-bold text-[#ff7a00]"
                    >
                      Fleet Admin Console
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={async () => {
                        await signOut();
                        onNavigate("home");
                      }}
                      className="hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <a
                    href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20know%20more%20about%20your%20QR%20and%20NFC%20digital%20solutions."
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#25D366] hover:underline font-semibold flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Order on WhatsApp</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Colophon Base */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <p>© 2026 ZenTap Digital Solutions · Precision Crafted NFC Hardware</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <span>Top of page</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
