/* Hallmark · macrostructure: Workbench + Bento Grid · genre: modern-minimal · theme: tactile-obsidian */
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Header, { ActiveView } from "@/components/Header";
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
import UpcomingServicesDrawer from "@/components/UpcomingServicesDrawer";
import { ReviewItem } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { 
  Store, 
  Sparkles, 
  Radio, 
  DollarSign, 
  User 
} from "lucide-react";
import { trackPageView, trackCtaClick } from "@/lib/analytics";

const VIEW_METADATA: Record<ActiveView, { title: string; path: string }> = {
  home: { title: "ZenTap | Smart NFC & QR Google Review Standees", path: "/" },
  pricing: { title: "Products & Pricing | ZenTap NFC Standees", path: "/?view=pricing" },
  "how-it-works": { title: "How It Works | ZenTap Instant Tap Reviews", path: "/?view=how-it-works" },
  features: { title: "Features & Hardware Specs | ZenTap NTAG216", path: "/?view=features" },
  benefits: { title: "Business Benefits & ROI | ZenTap", path: "/?view=benefits" },
  results: { title: "Verified Client Results | ZenTap", path: "/?view=results" },
  "sample-dashboard": { title: "Sample Showcase Dashboard | ZenTap", path: "/?view=sample-dashboard" },
  "client-proofs": { title: "Testimonials & Case Studies | ZenTap", path: "/?view=client-proofs" },
  faq: { title: "FAQ & Google Anti-Gating Policy | ZenTap", path: "/?view=faq" },
  portal: { title: "Merchant Dashboard | ZenTap", path: "/?view=portal" },
  admin: { title: "Fleet Superadmin Console | ZenTap", path: "/?view=admin" },
};

export default function Page() {
  const { user, isAdmin, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      if (v === "admin") {
        return "admin";
      }
      if (v === "pricing" || v === "how-it-works" || v === "features") {
        return v as ActiveView;
      }
    }
    return "home";
  });
  const [portalInitialPlan, setPortalInitialPlan] = useState<"card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom" | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"signin" | "signup">("signin");
  const [tapReviewModalOpen, setTapReviewModalOpen] = useState(false);
  const [upcomingDrawerOpen, setUpcomingDrawerOpen] = useState(false);
  const [latestReview, setLatestReview] = useState<ReviewItem | null>(null);

  const hasInitializedAuth = useRef(false);

  // Check URL query parameters on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      if (v === "admin") {
        setCurrentView("admin");
        hasInitializedAuth.current = true;
      } else if (v === "pricing" || v === "how-it-works" || v === "features") {
        setCurrentView(v as ActiveView);
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
        // If unauthenticated merchant tries to open portal, open signin modal
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

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      {/* Fixed Adaptive Header (shown on public views) */}
      {!isDashboardView && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* Main View Container */}
      <main className={`flex-1 flex flex-col ${!isDashboardView ? "pt-16 pb-20 md:pb-8" : "min-h-screen"}`}>
        {currentView === "home" && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onTriggerTapReviewModal={() => setTapReviewModalOpen(true)}
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
            onOpenUpcomingDrawer={() => setUpcomingDrawerOpen(true)}
          />
        )}

        {currentView === "faq" && (
          <FaqView
            onNavigateToPricing={() => handleNavigate("pricing")}
            onOpenUpcomingDrawer={() => setUpcomingDrawerOpen(true)}
          />
        )}

        {/* Private Merchant Portal (Client Business Profile Dashboard) */}
        {currentView === "portal" && (
          <ClientPortalView
            initialPlan={portalInitialPlan}
            onTriggerTapSimulator={() => setTapReviewModalOpen(true)}
            onOpenAuthModal={(tab) => handleOpenAuth(tab)}
            onNavigate={handleNavigate}
            onOpenUpcomingDrawer={() => setUpcomingDrawerOpen(true)}
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

      {/* Floating Side Icon Drawer for Upcoming Tech Projects & Services */}
      <UpcomingServicesDrawer
        isOpen={upcomingDrawerOpen}
        onClose={() => setUpcomingDrawerOpen(false)}
        onOpen={() => setUpcomingDrawerOpen(true)}
      />

      {/* Fixed Mobile Bottom Navigation Bar (Hidden when inside private dashboards) */}
      {!isDashboardView && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-variant/40 shadow-lg lg:hidden">
          <div className="h-16 px-2 flex items-center justify-around">
            <button
              onClick={() => handleNavigate("home")}
              className={`flex flex-col items-center justify-center min-w-[50px] text-[10px] font-semibold transition-colors cursor-pointer ${
                currentView === "home" ? "text-secondary-container" : "text-on-surface-variant"
              }`}
            >
              <Store className="w-4 h-4 mb-0.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavigate("how-it-works")}
              className={`flex flex-col items-center justify-center min-w-[50px] text-[10px] font-semibold transition-colors cursor-pointer ${
                currentView === "how-it-works" ? "text-secondary-container" : "text-on-surface-variant"
              }`}
            >
              <Radio className="w-4 h-4 mb-0.5" />
              <span>Process</span>
            </button>

            <button
              onClick={() => handleNavigate("pricing")}
              className={`flex flex-col items-center justify-center min-w-[50px] text-[10px] font-semibold transition-colors cursor-pointer ${
                currentView === "pricing" ? "text-secondary-container" : "text-on-surface-variant"
              }`}
            >
              <DollarSign className="w-4 h-4 mb-0.5" />
              <span>Pricing</span>
            </button>

            <button
              onClick={() => {
                if (user) {
                  handleNavigate(isAdmin ? "admin" : "portal");
                } else {
                  handleOpenAuth("signin");
                }
              }}
              className="flex flex-col items-center justify-center min-w-[50px] text-[10px] font-semibold text-on-surface-variant transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 mb-0.5" />
              <span>{user ? (isAdmin ? "Admin" : "Portal") : "Account"}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Global Footer (shown on public views) */}
      {!isDashboardView && (
        <Footer
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* Dedicated Client Merchant Auth Modal (Sign In & Register Business) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
        onSuccessNavigate={(view) => {
          setAuthModalOpen(false);
          setCurrentView(view);
        }}
      />

      {/* Dedicated Superadmin Security Modal (Restricted to Root Admin) */}
      <AdminAuthModal
        isOpen={adminAuthModalOpen}
        onClose={() => setAdminAuthModalOpen(false)}
        onSuccessNavigate={(view) => {
          setAdminAuthModalOpen(false);
          setCurrentView(view);
        }}
      />

      {/* Interactive Standee Tap Review Simulation Modal */}
      <TapReviewModal
        isOpen={tapReviewModalOpen}
        onClose={() => setTapReviewModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
