"use client";

import React, { useState } from "react";
import { 
  Wifi, 
  User, 
  ArrowRight, 
  Store, 
  ShieldCheck, 
  Menu, 
  X,
  Layers,
  ChevronDown,
  LogOut,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export type ActiveView = "home" | "features" | "pricing" | "portal" | "admin";

interface HeaderProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenAuth: (initialTab: "signin" | "signup" | "admin") => void;
}

export default function Header({ currentView, onNavigate, onOpenAuth }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveView; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "portal", label: "Client Portal" },
    { id: "admin", label: "Admin Console" },
  ];

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-variant/40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
            Z
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline font-bold text-lg text-on-surface tracking-tight leading-tight">
              Zen<span className="text-secondary-container">Tap</span>.ai
            </span>
            <span className="text-[10px] tracking-wider font-semibold text-on-surface-variant uppercase">
              Smart Review Ecosystem
            </span>
          </div>
        </div>

        {/* Desktop Nav Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-surface-variant/40 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentView === item.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Header Action Items */}
        <div className="flex items-center gap-3">
          {/* Live Supabase Project badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Supabase: Zentaps Project</span>
          </div>

          {/* Live NFC Status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-surface-variant/40 text-xs text-on-surface-variant font-medium">
            <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
            <span>NFC Active</span>
          </div>

          {/* Auth Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              {user ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.email ? user.email[0].toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>Portals</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant/50 p-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-surface-variant/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                          Authenticated Session
                        </span>
                      </div>
                      <p className="text-xs text-on-surface font-semibold truncate mt-0.5">
                        {user.email}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-mono">
                        UID: {user.id.slice(0, 8)}...
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleNavClick("portal");
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">Merchant Portal</p>
                        <p className="text-[11px] text-on-surface-variant">Live telemetry &amp; standees</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleNavClick("admin");
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">Superadmin Fleet</p>
                        <p className="text-[11px] text-on-surface-variant">Global provisioning</p>
                      </div>
                    </button>

                    <div className="pt-1 mt-1 border-t border-surface-variant/30">
                      <button
                        onClick={async () => {
                          setDropdownOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>Sign Out</span>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 border-b border-surface-variant/30">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                        Access Portals
                      </p>
                      <p className="text-xs text-on-surface font-semibold">
                        ZenTap.ai Ecosystem
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAuth("signin");
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">Client Sign In</p>
                        <p className="text-[11px] text-on-surface-variant">Merchant telemetry &amp; reviews</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAuth("admin");
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">Superadmin Login</p>
                        <p className="text-[11px] text-on-surface-variant">Root fleet provisioning</p>
                      </div>
                    </button>

                    <div className="pt-1 mt-1 border-t border-surface-variant/30">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenAuth("signup");
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-secondary-container/10 hover:bg-secondary-container/20 text-secondary-container font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>Register 14-Day Free Trial</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-variant/40 bg-surface/95 backdrop-blur-2xl p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                currentView === item.id
                  ? "bg-primary text-on-primary"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-surface-variant/30 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth("signin");
              }}
              className="flex-1 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
            >
              Merchant Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth("signup");
              }}
              className="flex-1 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-semibold"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
