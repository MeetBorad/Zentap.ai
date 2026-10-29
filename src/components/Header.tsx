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
  ShieldAlert
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
    { id: "portal", label: "Merchant Dashboard" },
    { id: "how-it-works", label: "How It Works" },
    { id: "features", label: "Features" },
    { id: "benefits", label: "Benefits" },
    { id: "results", label: "Results" },
    { id: "sample-dashboard", label: "Sample Showcase" },
    { id: "client-proofs", label: "Client Proofs" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E2DFD8]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Brand + Return to Main Site Action */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1C1B1A] text-white flex items-center justify-center font-headline font-bold text-sm shadow-sm">
                Z
              </div>
              <span className="font-headline font-bold text-base text-[#1C1B1A] tracking-tight">
                Zen<span className="text-[#D94826]">Tap</span>.ai
              </span>
            </div>

            <div className="h-5 w-px bg-[#E2DFD8] hidden sm:block" />

            {/* Return to Main Site Button */}
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F0EB] hover:bg-[#E2DFD8] text-[#1C1B1A] text-xs font-semibold transition-colors cursor-pointer"
              title="Browse ZenTap.ai public marketing website"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Main Site</span>
            </button>
          </div>

          {/* Center: Workspace Identity Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#E2DFD8] text-xs font-mono">
            {currentView === "admin" ? (
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ZenTap.in Admin Dashboard</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#1C1B1A] font-semibold">
                <Store className="w-4 h-4 text-[#D94826]" />
                <span>My Live Business Analytics</span>
              </span>
            )}
          </div>

          {/* Right: User identity & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-[#615E5B] block leading-tight">
                {currentView === "admin" ? "Root Superadmin" : "Merchant Account"}
              </span>
              <span className="text-xs font-semibold text-[#1C1B1A] truncate max-w-[160px] block">
                {user?.email || (currentView === "admin" ? "admin@zentapdigitalsolutions.com" : "Merchant")}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer border border-rose-200"
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E2DFD8]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-3 cursor-pointer select-none group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-[#1C1B1A] text-white flex items-center justify-center font-headline font-bold text-base shadow-sm">
            Z
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-lg text-[#1C1B1A] tracking-tight leading-none">
              Zen<span className="text-[#D94826]">Tap</span>.ai
            </span>
            <span className="text-[10px] tracking-wider font-mono font-medium text-[#615E5B] uppercase mt-0.5">
              NFC · Dynamic QR
            </span>
          </div>
        </div>

        {/* Public Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#F2F0EB] p-1 rounded-full border border-[#E2DFD8] overflow-x-auto max-w-[700px] xl:max-w-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                currentView === item.id
                  ? "bg-[#1C1B1A] text-white shadow-sm font-semibold"
                  : "text-[#615E5B] hover:text-[#1C1B1A] hover:bg-white/80"
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
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C1B1A] text-white text-xs font-semibold hover:bg-[#2C2B2A] transition-all cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Console</span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium transition-colors cursor-pointer border border-rose-200"
                title="Sign out of Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          )}

          {/* CASE B: LOGGED IN AS REGULAR MERCHANT */}
          {!isAdmin && user && (
            <>
              <button
                onClick={() => handleNavClick("portal")}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C1B1A] text-white text-xs font-semibold hover:bg-[#2C2B2A] transition-all cursor-pointer shadow-sm"
              >
                <Store className="w-3.5 h-3.5 text-[#D94826]" />
                <span>My Dashboard</span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium transition-colors cursor-pointer border border-rose-200"
                title="Sign out of Merchant Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          )}

          {/* CASE C: NOT LOGGED IN (GUEST) */}
          {!isAdmin && !user && (
            <>
              <button
                onClick={() => onOpenAuth("signin")}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F2F0EB] text-[#1C1B1A] border border-[#E2DFD8] text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => onOpenAuth("signup")}
                className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#1C1B1A] hover:bg-[#2C2B2A] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <span>Register Business</span>
              </button>

              {/* Discreet Superadmin Access Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-1.5 rounded-full bg-[#F2F0EB] hover:bg-[#E2DFD8] text-[#615E5B] transition-colors cursor-pointer"
                  title="Administrative Access"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E2DFD8] shadow-xl py-2 z-50 text-xs animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-1.5 border-b border-[#E2DFD8] text-[10px] font-mono text-[#615E5B]">
                      Platform Operations
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAuth("admin");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#F2F0EB] text-[#1C1B1A] flex items-center justify-between font-medium cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Superadmin Portal</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#615E5B]" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#F2F0EB] hover:bg-[#E2DFD8] text-[#1C1B1A] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2DFD8] bg-[#FAF9F6] px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  currentView === item.id
                    ? "bg-[#1C1B1A] text-white font-semibold"
                    : "text-[#615E5B] hover:bg-[#F2F0EB] hover:text-[#1C1B1A]"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Auth Actions */}
            <div className="border-t border-[#E2DFD8] mt-3 pt-3 flex flex-col gap-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => handleNavClick("admin")}
                    className="w-full text-center py-2.5 rounded-lg bg-[#1C1B1A] text-white font-bold text-xs"
                  >
                    Open Admin Console
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-center py-2 rounded-lg bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : user ? (
                <>
                  <button
                    onClick={() => handleNavClick("portal")}
                    className="w-full text-center py-2.5 rounded-lg bg-[#1C1B1A] text-white font-bold text-xs"
                  >
                    Open Merchant Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-center py-2 rounded-lg bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth("signin");
                    }}
                    className="py-2.5 rounded-lg bg-white border border-[#E2DFD8] font-semibold text-xs text-[#1C1B1A]"
                  >
                    Merchant Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth("signup");
                    }}
                    className="py-2.5 rounded-lg bg-[#1C1B1A] text-white font-semibold text-xs"
                  >
                    Register Business
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
