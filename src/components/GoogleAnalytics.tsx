"use client";

import React, { useEffect, useState, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID, trackPageView } from "@/lib/analytics";
import { ShieldCheck, Cookie, Check, X } from "lucide-react";

function RouteTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  const [consentStatus, setConsentStatus] = useState<"granted" | "denied" | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("zentap_cookie_consent");
    if (stored === "granted" || stored === "denied") {
      setConsentStatus(stored);
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: stored,
        });
      }
    } else {
      // Delay display slightly so it doesn't block the critical LCP render
      const timer = setTimeout(() => setBannerVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (decision: "granted" | "denied") => {
    setConsentStatus(decision);
    setBannerVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("zentap_cookie_consent", decision);
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: decision,
        });
      }
    }
  };

  // If no ID is configured, do not render
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Suspense fallback={null}>
        <RouteTracking />
      </Suspense>

      {/* Modern Accessible Cookie Consent Banner */}
      {bannerVisible && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-4 sm:p-5 rounded-2xl bg-[#141720]/95 backdrop-blur-md border border-[#232734] shadow-2xl text-white transition-all duration-300 animate-in slide-in-from-bottom-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] flex items-center justify-center flex-shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-bold text-xs text-white tracking-tight flex items-center gap-1.5">
                <span>Privacy &amp; Analytics Consent</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium border border-emerald-500/40">GA4</span>
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                We use privacy-friendly analytics to optimize standee review conversion telemetry. No third-party ad tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-3.5 pt-3 border-t border-[#232734]">
            <button
              type="button"
              onClick={() => handleConsent("denied")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => handleConsent("granted")}
              className="px-4 py-1.5 rounded-lg bg-[#ff7a00] text-black text-xs font-bold hover:bg-[#e56d00] transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-black" />
              <span>Accept Analytics</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
