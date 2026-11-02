"use client";

import React, { useState, useEffect, useRef } from "react";
import Header, { ActiveView, LanguageCode } from "@/components/Header";
import Footer from "@/components/Footer";
import HomeView from "@/components/views/HomeView";
import HowItWorksView from "@/components/views/HowItWorksView";
import FeaturesView from "@/components/views/FeaturesView";
import BenefitsView from "@/components/views/BenefitsView";
import ResultsView from "@/components/views/ResultsView";
import SampleDashboardView from "@/components/views/SampleDashboardView";
import ClientProofsView from "@/components/views/ClientProofsView";
import PricingView from "@/components/views/PricingView";
import FaqView from "@/components/views/FaqView";
import ClientPortalView from "@/components/views/ClientPortalView";
import AdminConsoleView from "@/components/views/AdminConsoleView";
import AuthModal from "@/components/modals/AuthModal";
import AdminAuthModal from "@/components/modals/AdminAuthModal";
import TapReviewModal from "@/components/modals/TapReviewModal";
import { ReviewItem } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle } from "lucide-react";
import { trackPageView, trackCtaClick, trackWhatsAppClick } from "@/lib/analytics";

const VIEW_METADATA: Record<ActiveView, { title: string; path: string }> = {
  home: { title: "ZenTap: Google Review Stand for Shops in Ahmedabad | Tap to Review", path: "/" },
  pricing: { title: "Products & Pricing | ZenTap Google Review Stands", path: "/#products" },
  "how-it-works": { title: "How It Works | ZenTap Instant Tap Reviews", path: "/#how-it-works" },
  features: { title: "Features | ZenTap Google Review Stand", path: "/#products" },
  benefits: { title: "Why It Matters | ZenTap", path: "/#why-it-matters" },
  results: { title: "Client Results | ZenTap", path: "/" },
  "sample-dashboard": { title: "Sample Showcase | ZenTap", path: "/" },
  "client-proofs": { title: "How it looks on your counter | ZenTap", path: "/#photos" },
  faq: { title: "FAQ | ZenTap Google Review Stands", path: "/#faq" },
  portal: { title: "Merchant Dashboard | ZenTap", path: "/?view=portal" },
  admin: { title: "Fleet Superadmin Console | ZenTap", path: "/?view=admin" },
};

export default function Page() {
  const { user, isAdmin, loading } = useAuth();
  const [lang, setLang] = useState<LanguageCode>("en");
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      if (v === "admin") {
        return "admin";
      }
      if (v === "portal") {
        return "portal";
      }
    }
    return "home";
  });
  const [portalInitialPlan, setPortalInitialPlan] = useState<"card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom" | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"signin" | "signup">("signin");
  const [tapReviewModalOpen, setTapReviewModalOpen] = useState(false);
  const [, setLatestReview] = useState<ReviewItem | null>(null);

  const hasInitializedAuth = useRef(false);

  // Check URL query parameters on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      if (v === "admin") {
        setCurrentView("admin");
        hasInitializedAuth.current = true;
      }
    }
  }, []);

  // Auto-route to admin console on initial load if admin is authenticated
  useEffect(() => {
    if (!loading && isAdmin && !hasInitializedAuth.current) {
      hasInitializedAuth.current = true;
      setCurrentView("admin");
    }
  }, [isAdmin, loading]);

  // Security Guard: Handle access to admin console and merchant portal
  useEffect(() => {
    if (!loading) {
      if (currentView === "admin" && !isAdmin) {
        setCurrentView("home");
      } else if (currentView === "portal" && !user) {
        setAuthInitialTab("signin");
        setAuthModalOpen(true);
      }
    }
  }, [currentView, isAdmin, user, loading]);

  // Sync Document Title, Browser History, and GA4 Page Views on View Change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const meta = VIEW_METADATA[currentView] || VIEW_METADATA.home;
      document.title = meta.title;
      const targetPath = meta.path;
      if (window.location.search || currentView !== "home") {
        window.history.replaceState({ view: currentView }, meta.title, targetPath);
      }
      trackPageView(targetPath, meta.title);
    }
  }, [currentView]);

  const handleOpenAuth = (tab: "signin" | "signup" | "admin") => {
    trackCtaClick(`open_auth_${tab}`, "auth_modal");
    if (tab === "admin") {
      setAdminAuthModalOpen(true);
    } else {
      setAuthInitialTab(tab);
      setAuthModalOpen(true);
    }
  };

  const handleNavigate = (view: ActiveView, plan?: "card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom") => {
    trackCtaClick(`nav_${view}`, view);
    if (view === "admin" && !isAdmin) {
      handleOpenAuth("admin");
      return;
    }
    if (plan) {
      setPortalInitialPlan(plan);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReviewSubmitted = (rev: ReviewItem) => {
    setLatestReview(rev);
  };

  const isDashboardView = currentView === "portal" || currentView === "admin";

  // WhatsApp link and button label for sticky mobile button
  const stickyBtnText = lang === "gu"
    ? "WhatsApp પર ફ્રી ડેમો લો"
    : lang === "hi"
    ? "WhatsApp पर फ्री डेमो लें"
    : "Get a Free Demo on WhatsApp";

  const waStickyUrl = lang === "gu"
    ? "https://wa.me/919274560880?text=નમસ્તે%20ZenTap%2C%20મને%20Google%20Review%20Standee%20નો%20WhatsApp%20પર%20ફ્રી%20ડેમો%20જોઈએ%20છે."
    : lang === "hi"
    ? "https://wa.me/919274560880?text=नमस्ते%20ZenTap%2C%20मुझे%20Google%20Review%20Stand%20का%20WhatsApp%20पर%20फ्री%20डेमो%20चाहिए।"
    : "https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20get%20a%20free%20demo%20of%20the%20Google%20Review%20Stand.";

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      {/* Fixed Adaptive Header */}
      {!isDashboardView && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
          currentLang={lang}
          onSelectLang={setLang}
        />
      )}

      {/* Main View Container */}
      <main className={`flex-1 flex flex-col ${!isDashboardView ? "pt-16 pb-20 md:pb-8" : "min-h-screen"}`}>
        {currentView === "home" && (
          <HomeView
            currentLang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === "how-it-works" && (
          <HowItWorksView
            onOpenAuth={handleOpenAuth}
            onNavigateToSample={() => handleNavigate("sample-dashboard")}
          />
        )}

        {currentView === "features" && (
          <FeaturesView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === "benefits" && (
          <BenefitsView
            onNavigateToPricing={() => handleNavigate("pricing")}
            onNavigateToSample={() => handleNavigate("sample-dashboard")}
          />
        )}

        {currentView === "results" && (
          <ResultsView
            onNavigateToSample={() => handleNavigate("sample-dashboard")}
            onNavigateToPricing={() => handleNavigate("pricing")}
          />
        )}

        {currentView === "sample-dashboard" && (
          <SampleDashboardView
            onNavigateToPricing={() => handleNavigate("pricing")}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === "client-proofs" && (
          <ClientProofsView
            onNavigateToPricing={() => handleNavigate("pricing")}
          />
        )}

        {currentView === "pricing" && (
          <PricingView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === "faq" && (
          <FaqView
            onNavigateToPricing={() => handleNavigate("pricing")}
          />
        )}

        {/* Private Merchant Portal (Client Business Profile Dashboard) */}
        {currentView === "portal" && (
          <ClientPortalView
            initialPlan={portalInitialPlan}
            onTriggerTapSimulator={() => setTapReviewModalOpen(true)}
            onOpenAuthModal={(tab) => handleOpenAuth(tab)}
            onNavigate={handleNavigate}
          />
        )}

        {/* Superadmin Console (Protected Admin Fleet Dashboard) */}
        {currentView === "admin" && (
          <AdminConsoleView 
            onOpenAuthModal={(tab) => handleOpenAuth(tab)} 
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Sticky Bottom WhatsApp Button on Mobile (Rule 6: Mobile First) */}
      {!isDashboardView && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-[#0e1015] via-[#0e1015]/95 to-transparent backdrop-blur-md lg:hidden flex justify-center">
          <a
            href={waStickyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("sticky_mobile_bottom")}
            className="tactile-btn w-full max-w-md py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/40 transition-transform active:scale-[0.978] cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-black text-black" />
            <span>{stickyBtnText}</span>
          </a>
        </div>
      )}

      {/* Global Footer (shown on public views) */}
      {!isDashboardView && (
        <Footer
          currentLang={lang}
        />
      )}

      {/* Dedicated Client Merchant Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
        onSuccessNavigate={(view) => {
          setAuthModalOpen(false);
          setCurrentView(view);
        }}
      />

      {/* Dedicated Superadmin Security Modal */}
      <AdminAuthModal
        isOpen={adminAuthModalOpen}
        onClose={() => setAdminAuthModalOpen(false)}
        onSuccessNavigate={(view) => {
          setAdminAuthModalOpen(false);
          setCurrentView(view);
        }}
      />

      {/* Standee Tap Review Simulation Modal */}
      <TapReviewModal
        isOpen={tapReviewModalOpen}
        onClose={() => setTapReviewModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
