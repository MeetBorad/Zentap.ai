"use client";

import React, { useState } from "react";
import { 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  ArrowLeft, 
  MessageCircle, 
  Globe,
  Lock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export type ActiveView = 
  | "home" 
  | "how-it-works" 
  | "features" 
  | "benefits" 
  | "results" 
  | "sample-dashboard" 
  | "client-proofs" 
  | "pricing" 
  | "faq"
  | "portal"
  | "admin";

export type LanguageCode = "en" | "hi" | "gu";

interface HeaderProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenAuth?: (initialTab: "signin" | "signup" | "admin") => void;
  currentLang?: LanguageCode;
  onSelectLang?: (lang: LanguageCode) => void;
}

export default function Header({ 
  currentView, 
  onNavigate, 
  currentLang = "en", 
  onSelectLang = () => {} 
}: HeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboardView = currentView === "portal" || currentView === "admin";

  const handleNavClick = (view: ActiveView, anchorId?: string) => {
    setMobileMenuOpen(false);
    if (view === "home" && anchorId) {
      if (currentView !== "home") {
        onNavigate("home");
        setTimeout(() => {
          const el = document.getElementById(anchorId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    onNavigate("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // WhatsApp prefilled link
  const waUrl = currentLang === "gu"
    ? "https://wa.me/919274560880?text=નમસ્તે%20ZenTap%2C%20મને%20Google%20Review%20Standee%20વિશે%20વધુ%20માહિતી%20જોઈએ%20છે."
    : currentLang === "hi"
    ? "https://wa.me/919274560880?text=नमस्ते%20ZenTap%2C%20मुझे%20Google%20Review%20Standee%20के%20बारे%20में%20जानकारी%20चाहिए।"
    : "https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20get%20a%20free%20demo%20of%20the%20Google%20Review%20Stand.";

  const demoBtnText = currentLang === "gu"
    ? "ફ્રી ડેમો મેળવો"
    : currentLang === "hi"
    ? "फ्री डेमो लें"
    : "Free Demo";

  // -------------------------------------------------------------
  // 1. DASHBOARD / ADMIN DEDICATED HEADER
  // -------------------------------------------------------------
  if (isDashboardView) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e1015]/95 backdrop-blur-md border-b border-[#232734]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Brand + Return to Main Site Action */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => handleNavClick("home")}
              className="flex items-center cursor-pointer select-none group"
            >
              <img 
                src="/logo.png" 
                alt="ZenTap" 
                className="h-8 w-auto max-w-[130px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>

            <div className="h-5 w-px bg-[#232734] hidden sm:block" />

            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161924] hover:bg-[#232734] text-white text-xs font-semibold transition-colors cursor-pointer border border-[#232734]"
              title="Return to Main Website"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Main Site</span>
            </button>
          </div>

          {/* Center: Workspace Identity Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#141720] border border-[#232734] text-xs font-mono text-zinc-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ZenTap Superadmin Console</span>
            </span>
          </div>

          {/* Right: User identity & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-zinc-400 block leading-tight">
                Superadmin
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[160px] block">
                {user?.email || "admin@zentapdigitalsolutions.com"}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold transition-colors cursor-pointer border border-rose-800/40"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>
    );
  }

  // -------------------------------------------------------------
  // 2. PUBLIC MARKETING HEADER (No Admin Links, Simple Language Switcher)
  // -------------------------------------------------------------
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e1015]/95 backdrop-blur-md border-b border-[#232734]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-2 cursor-pointer select-none group flex-shrink-0"
          >
            <img 
              src="/logo.png" 
              alt="ZenTap" 
              className="h-8 sm:h-9 w-auto max-w-[130px] sm:max-w-[160px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>
        </div>

        {/* Public Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#141720] px-3 py-1.5 rounded-full border border-[#232734]">
          <button
            onClick={() => handleNavClick("home", "how-it-works")}
            className="tactile-btn-subtle px-3.5 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {currentLang === "gu" ? "કેવી રીતે કામ કરે છે" : currentLang === "hi" ? "कैसे काम करता है" : "How It Works"}
          </button>
          <button
            onClick={() => handleNavClick("home", "products")}
            className="tactile-btn-subtle px-3.5 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {currentLang === "gu" ? "પ્રોડક્ટ્સ અને ભાવ" : currentLang === "hi" ? "प्रोडक्ट्स और दाम" : "Products & Pricing"}
          </button>
          <button
            onClick={() => handleNavClick("home", "photos")}
            className="tactile-btn-subtle px-3.5 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {currentLang === "gu" ? "ફોટા" : currentLang === "hi" ? "फ़ोटो" : "Photos"}
          </button>
          <button
            onClick={() => handleNavClick("home", "faq")}
            className="tactile-btn-subtle px-3.5 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {currentLang === "gu" ? "સવાલો (FAQ)" : currentLang === "hi" ? "सवाल (FAQ)" : "FAQ"}
          </button>
        </nav>

        {/* Right Actions: Language Switcher + WhatsApp CTA */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Language Switcher: English | हिंदी | ગુજરાતી */}
          <div className="flex items-center gap-1 bg-[#141720] p-1 rounded-full border border-[#232734] text-xs">
            <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1.5 hidden sm:inline-block" />
            <button
              onClick={() => onSelectLang("en")}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                currentLang === "en"
                  ? "bg-[#ff7a00] text-black shadow-xs font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => onSelectLang("hi")}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                currentLang === "hi"
                  ? "bg-[#ff7a00] text-black shadow-xs font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onSelectLang("gu")}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                currentLang === "gu"
                  ? "bg-[#ff7a00] text-black shadow-xs font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              ગુજરાતી
            </button>
          </div>

          {/* Desktop WhatsApp Demo CTA */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tactile-btn hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-black text-black" />
            <span>{demoBtnText}</span>
          </a>

          {/* Admin Login Option on Top Right */}
          {isAdmin ? (
            <button
              onClick={() => handleNavClick("admin")}
              className="tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff7a00] hover:bg-[#e56d00] text-black text-xs font-bold cursor-pointer shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin Console</span>
              <span className="md:hidden">Admin</span>
            </button>
          ) : (
            <a
              href="/admin/login"
              title="Admin Portal Login"
              className="tactile-btn-subtle flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141720] hover:bg-[#1c212e] text-zinc-300 hover:text-white border border-[#232734] text-xs font-semibold cursor-pointer shadow-sm transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-[#ff7a00]" />
              <span className="hidden sm:inline">Admin Login</span>
              <span className="sm:hidden">Admin</span>
            </a>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#141720] hover:bg-[#232734] text-white transition-colors cursor-pointer border border-[#232734]"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#232734] bg-[#0e1015] px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleNavClick("home", "how-it-works")}
              className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-[#141720] hover:text-white"
            >
              {currentLang === "gu" ? "કેવી રીતે કામ કરે છે" : currentLang === "hi" ? "कैसे काम करता है" : "How It Works"}
            </button>
            <button
              onClick={() => handleNavClick("home", "products")}
              className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-[#141720] hover:text-white"
            >
              {currentLang === "gu" ? "પ્રોડક્ટ્સ અને ભાવ" : currentLang === "hi" ? "प्रोडक्ट्स और दाम" : "Products & Pricing"}
            </button>
            <button
              onClick={() => handleNavClick("home", "photos")}
              className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-[#141720] hover:text-white"
            >
              {currentLang === "gu" ? "કાઉન્ટર પર કેવું દેખાય છે (Photos)" : currentLang === "hi" ? "काउंटर पर कैसा दिखता है (Photos)" : "Photos"}
            </button>
            <button
              onClick={() => handleNavClick("home", "faq")}
              className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-[#141720] hover:text-white"
            >
              {currentLang === "gu" ? "સવાલો અને જવાબો (FAQ)" : currentLang === "hi" ? "सवाल और जवाब (FAQ)" : "FAQ"}
            </button>

            <div className="border-t border-[#232734] mt-2 pt-3 flex flex-col gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#25D366] text-black font-bold text-sm shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-black text-black" />
                <span>
                  {currentLang === "gu" 
                    ? "WhatsApp પર ફ્રી ડેમો લો" 
                    : currentLang === "hi" 
                    ? "WhatsApp पर फ्री डेमो लें" 
                    : "Get a Free Demo on WhatsApp"}
                </span>
              </a>

              {isAdmin ? (
                <button
                  onClick={() => handleNavClick("admin")}
                  className="w-full py-2.5 rounded-xl bg-[#ff7a00] text-black font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </button>
              ) : (
                <a
                  href="/admin/login"
                  className="w-full py-2.5 rounded-xl bg-[#141720] text-zinc-300 hover:text-white font-medium text-xs border border-[#232734] flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-[#ff7a00]" />
                  <span>Admin Login</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
