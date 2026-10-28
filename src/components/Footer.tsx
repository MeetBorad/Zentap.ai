"use client";

import React from "react";
import { ActiveView } from "./Header";
import { ShieldCheck, Heart, Zap, ArrowUp } from "lucide-react";

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
}

export default function Footer({ onNavigate, onOpenAuth }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-variant/40 mt-16 pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-surface-variant/30">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-base shadow-sm">
                Z
              </div>
              <span className="font-headline font-bold text-lg text-on-surface">
                Zen<span className="text-secondary-container">Tap</span>.ai
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Smart NFC &amp; Dynamic QR Google Review Standees. Turn everyday guest footfall into high-velocity 5-star Google ratings.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>NFC Hardware Telemetry Online</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
              Platform Views
            </h4>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="hover:text-on-surface transition-colors cursor-pointer"
                >
                  Home &amp; Standee Simulator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("features")}
                  className="hover:text-on-surface transition-colors cursor-pointer"
                >
                  NTAG216 Specs &amp; AI Routing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("pricing")}
                  className="hover:text-on-surface transition-colors cursor-pointer"
                >
                  Growth Packs &amp; ROI Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("portal")}
                  className="hover:text-on-surface transition-colors cursor-pointer"
                >
                  Merchant Telemetry Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("admin")}
                  className="hover:text-on-surface transition-colors cursor-pointer"
                >
                  Root Superadmin Console
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hardware Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
              Access Portals
            </h4>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li>
                <button
                  onClick={() => onOpenAuth("signin")}
                  className="hover:text-on-surface transition-colors cursor-pointer"
                >
                  Merchant Client Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-on-surface transition-colors cursor-pointer"
                >
                  Register 14-Day Free Trial
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth("admin")}
                  className="hover:text-on-surface transition-colors cursor-pointer"
                >
                  Fleet Superadmin Login (2FA)
                </button>
              </li>
              <li>
                <span className="text-[11px] text-zinc-400">
                  Firmware Engine v3.2.1
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
              Security &amp; Hardware
            </h4>
            <div className="space-y-2.5 text-xs text-on-surface-variant">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit Hardware Encryption</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Zero Battery Degradation</span>
              </p>
              <p className="text-[11px] text-zinc-500 mt-2">
                Need customized enterprise standees for 50+ locations?
              </p>
              <a
                href="mailto:fleet@zentap.ai"
                className="text-xs font-semibold text-secondary-container hover:underline block"
              >
                fleet@zentap.ai
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>© 2026 ZenTap.ai. All rights reserved. Built with Google Stitch design system.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
