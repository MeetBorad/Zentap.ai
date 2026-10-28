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

export default function Page() {
  const { user, isAdmin, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"signin" | "signup">("signin");
  const [tapReviewModalOpen, setTapReviewModalOpen] = useState(false);
  const [upcomingDrawerOpen, setUpcomingDrawerOpen] = useState(false);
  const [latestReview, setLatestReview] = useState<ReviewItem | null>(null);

  const hasInitializedAuth = useRef(false);

  // Auto-route to user's dedicated dashboard on initial load
  useEffect(() => {
    if (!loading && (user || isAdmin) && !hasInitializedAuth.current) {
      hasInitializedAuth.current = true;
      if (isAdmin) {
        setCurrentView("admin");
      } else {
        setCurrentView("portal");
      }
    }
  }, [user, isAdmin, loading]);

  // Security Guard: Prevent non-admins from accessing or viewing the admin console
  useEffect(() => {
    if (!loading && currentView === "admin" && !isAdmin) {
      setCurrentView(user ? "portal" : "home");
    }
  }, [currentView, isAdmin, user, loading]);

  const handleOpenAuth = (tab: "signin" | "signup" | "admin") => {
    if (tab === "admin") {
      setAdminAuthModalOpen(true);
    } else {
      setAuthInitialTab(tab);
      setAuthModalOpen(true);
    }
  };

  const handleNavigate = (view: ActiveView) => {
    if (view === "admin" && !isAdmin) {
      handleOpenAuth("admin");
      return;
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
      {/* Fixed Adaptive Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Container */}
      <main className="flex-1 pt-16 pb-20 md:pb-8 flex flex-col">
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
            onTriggerTapSimulator={() => setTapReviewModalOpen(true)}
            onOpenAuthModal={(tab) => handleOpenAuth(tab)}
          />
        )}

        {/* Superadmin Console (Protected Admin Fleet Dashboard) */}
        {currentView === "admin" && (
          <AdminConsoleView onOpenAuthModal={(tab) => handleOpenAuth(tab)} />
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
              onClick={() => handleNavigate("sample-dashboard")}
              className={`flex flex-col items-center justify-center min-w-[50px] text-[10px] font-semibold transition-colors cursor-pointer ${
                currentView === "sample-dashboard" ? "text-secondary-container" : "text-on-surface-variant"
              }`}
            >
              <Sparkles className="w-4 h-4 mb-0.5 text-amber-400" />
              <span>Sample</span>
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

      {/* Global Footer (Adapts based on current view & role) */}
      <Footer
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

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
