"use client";

import React, { useState } from "react";
import { 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  Store, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  LayoutDashboard,
  ShieldAlert,
  MessageCircle
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

interface HeaderProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
}

export default function Header({ currentView, onNavigate, onOpenAuth }: HeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboardView = currentView === "portal" || currentView === "admin";

  const navItems: { id: ActiveView; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "pricing", label: "Products & Pricing" },
    { id: "how-it-works", label: "How It Works" },
  ];

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    onNavigate("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

            {/* Return to Main Site Button */}
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161924] hover:bg-[#232734] text-white text-xs font-semibold transition-colors cursor-pointer border border-[#232734]"
              title="Browse ZenTap public marketing website"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Main Site</span>
            </button>
          </div>

          {/* Center: Workspace Identity Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#141720] border border-[#232734] text-xs font-mono text-zinc-300">
            {currentView === "admin" ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ZenTap Admin Dashboard</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Store className="w-4 h-4 text-[#ff7a00]" />
                <span>My Live Business Analytics</span>
              </span>
            )}
          </div>

          {/* Right: User identity & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-zinc-300 block leading-tight">
                {currentView === "admin" ? "Root Superadmin" : "Merchant Account"}
              </span>
              <span className="text-xs font-semibold text-white truncate max-w-[160px] block">
                {user?.email || (currentView === "admin" ? "admin@zentapdigitalsolutions.com" : "Merchant")}
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
  // 2. PUBLIC MARKETING HEADER (When browsing main site)
  // -------------------------------------------------------------
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e1015]/95 backdrop-blur-md border-b border-[#232734]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-3 cursor-pointer select-none group flex-shrink-0"
          >
            <img 
              src="/logo.png" 
              alt="ZenTap" 
              className="h-9 w-auto max-w-[140px] sm:max-w-[170px] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>
        </div>

        {/* Public Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#141720] p-1 rounded-full border border-[#232734] overflow-x-auto max-w-[700px] xl:max-w-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`tactile-btn-subtle px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                currentView === item.id
                  ? "bg-[#ff7a00] text-black shadow-md font-bold"
                  : "text-zinc-200 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Dynamic Actions Based on Auth State */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          
          {/* CASE A: LOGGED IN AS ADMIN */}
          {isAdmin && (
            <>
              <button
                onClick={() => handleNavClick("admin")}
                className="tactile-btn hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ff7a00] text-black text-xs font-bold hover:bg-[#e56d00] cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <span>Admin Console</span>
                <ArrowRight className="w-3 h-3 text-black/70" />
              </button>

              <button
                onClick={handleSignOut}
                className="tactile-btn-subtle flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-medium cursor-pointer border border-rose-800/40"
                title="Sign out of Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          )}

          {/* CASE B: LOGGED IN AS MERCHANT */}
          {user && !isAdmin && (
            <>
              <button
                onClick={() => handleNavClick("portal")}
                className="tactile-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ff7a00] text-black text-xs font-bold hover:bg-[#e56d00] cursor-pointer shadow-sm"
              >
                <Store className="w-3.5 h-3.5 text-black" />
                <span>My Dashboard</span>
                <ArrowRight className="w-3 h-3 text-black/70" />
              </button>

              <button
                onClick={handleSignOut}
                className="tactile-btn-subtle flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-medium cursor-pointer border border-rose-800/40"
                title="Sign out of Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          )}

          {/* CASE C: GUEST / PUBLIC */}
          {!user && !isAdmin && (
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20know%20more%20about%20your%20QR%20and%20NFC%20digital%20solutions."
                target="_blank"
                rel="noreferrer"
                className="tactile-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-black text-black" />
                <span>Order on WhatsApp</span>
              </a>

              <a
                href="/admin/login"
                title="Super Admin Portal Login"
                className="tactile-btn-subtle flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141720] hover:bg-[#1c212e] text-zinc-300 hover:text-white border border-[#232734] text-xs font-semibold cursor-pointer shadow-sm transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>Admin Login</span>
              </a>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#141720] hover:bg-[#232734] text-white transition-colors cursor-pointer border border-[#232734]"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#232734] bg-[#0e1015] px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-4 py-3 min-h-[44px] flex items-center rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                  currentView === item.id
                    ? "bg-[#ff7a00] text-black font-bold"
                    : "text-zinc-200 hover:bg-[#141720] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Auth Actions */}
            <div className="border-t border-[#232734] mt-3 pt-3 flex flex-col gap-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => handleNavClick("admin")}
                    className="w-full text-center py-2.5 rounded-lg bg-[#ff7a00] text-black font-bold text-xs"
                  >
                    Open Admin Console
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-center py-2 rounded-lg bg-rose-950/40 text-rose-300 font-semibold text-xs border border-rose-800/40"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <a
                    href="https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20would%20like%20to%20know%20more%20about%20your%20QR%20and%20NFC%20digital%20solutions."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#25D366] text-black font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-black text-black" />
                    <span>Order on WhatsApp</span>
                  </a>
                  <a
                    href="/admin/login"
                    className="w-full py-2 rounded-xl bg-[#141720] text-zinc-300 hover:text-white font-medium text-xs border border-[#232734] flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#ff7a00]" />
                    <span>Admin Login</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
