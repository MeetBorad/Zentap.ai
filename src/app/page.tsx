"use client";

import React, { useState } from "react";
import Header, { ActiveView } from "@/components/Header";
import Footer from "@/components/Footer";
import HomeView from "@/components/views/HomeView";
import FeaturesView from "@/components/views/FeaturesView";
import PricingView from "@/components/views/PricingView";
import ClientPortalView from "@/components/views/ClientPortalView";
import AdminConsoleView from "@/components/views/AdminConsoleView";
import AuthModal from "@/components/modals/AuthModal";
import TapReviewModal from "@/components/modals/TapReviewModal";
import { ReviewItem } from "@/data/mockData";
import { 
  Store, 
  Sparkles, 
  Zap, 
  DollarSign, 
  ShieldCheck, 
  Radio, 
  User 
} from "lucide-react";

export default function Page() {
  const [currentView, setCurrentView] = useState<ActiveView>("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"signin" | "signup" | "admin">("signin");
  const [tapReviewModalOpen, setTapReviewModalOpen] = useState(false);
  const [latestReview, setLatestReview] = useState<ReviewItem | null>(null);

  const handleOpenAuth = (tab: "signin" | "signup" | "admin") => {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: ActiveView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReviewSubmitted = (rev: ReviewItem) => {
    setLatestReview(rev);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      {/* Fixed Header */}
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

        {currentView === "features" && (
          <FeaturesView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === "pricing" && (
          <PricingView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === "portal" && (
          <ClientPortalView
            onTriggerTapSimulator={() => setTapReviewModalOpen(true)}
          />
        )}

        {currentView === "admin" && (
          <AdminConsoleView />
        )}
      </main>

      {/* Fixed Mobile Bottom Navigation Bar (as per Stitch specs) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-variant/40 shadow-lg md:hidden">
        <div className="h-16 px-4 flex items-center justify-around">
          <button
            onClick={() => handleNavigate("home")}
            className={`flex flex-col items-center justify-center min-w-[56px] text-[10px] font-semibold transition-colors cursor-pointer ${
              currentView === "home" ? "text-secondary-container" : "text-on-surface-variant"
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavigate("features")}
            className={`flex flex-col items-center justify-center min-w-[56px] text-[10px] font-semibold transition-colors cursor-pointer ${
              currentView === "features" ? "text-secondary-container" : "text-on-surface-variant"
            }`}
          >
            <Zap className="w-5 h-5 mb-0.5" />
            <span>Features</span>
          </button>

          <button
            onClick={() => handleNavigate("pricing")}
            className={`flex flex-col items-center justify-center min-w-[56px] text-[10px] font-semibold transition-colors cursor-pointer ${
              currentView === "pricing" ? "text-secondary-container" : "text-on-surface-variant"
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span>Pricing</span>
          </button>

          <button
            onClick={() => handleNavigate("portal")}
            className={`flex flex-col items-center justify-center min-w-[56px] text-[10px] font-semibold transition-colors cursor-pointer ${
              currentView === "portal" ? "text-secondary-container" : "text-on-surface-variant"
            }`}
          >
            <Radio className="w-5 h-5 mb-0.5" />
            <span>Portal</span>
          </button>

          <button
            onClick={() => handleOpenAuth("signin")}
            className="flex flex-col items-center justify-center min-w-[56px] text-[10px] font-semibold text-on-surface-variant transition-colors cursor-pointer"
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Sign In</span>
          </button>
        </div>
      </nav>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Auth Modal (Sign in / Sign up / Superadmin) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
        onSuccessNavigate={(view) => {
          setAuthModalOpen(false);
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
