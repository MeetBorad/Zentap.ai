// components/modals/OwnerAccessModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Clock, 
  RotateCcw,
  Sliders,
  ChevronDown,
  Building2,
  Phone,
  Instagram,
  QrCode,
  MapPin,
  Globe,
  Facebook,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Save
} from "lucide-react";

interface OwnerAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagCode: string; // standee/card code (e.g. zt-0004, st3, or business slug)
  businessSlug?: string;
  initialBusinessName?: string;
  onDetailsUpdated?: (updated: any) => void;
}

export default function OwnerAccessModal({
  isOpen,
  onClose,
  tagCode,
  businessSlug,
  initialBusinessName,
  onDetailsUpdated,
}: OwnerAccessModalProps) {
  // Authentication State
  const defaultCode = (tagCode || businessSlug || "ZT-0004").toUpperCase();
  const [loginId, setLoginId] = useState(defaultCode);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Authenticated Session State (15-Minute Expiry)
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15 * 60);

  // Owner Panel Editable Fields
  const [cardData, setCardData] = useState<any>(null);
  const [bizData, setBizData] = useState<any>(null);
  const [scanStats, setScanStats] = useState<{ totalScans: number; nfcScans: number; qrScans: number; reviewClicks: number }>({
    totalScans: 0,
    nfcScans: 0,
    qrScans: 0,
    reviewClicks: 0,
  });

  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editWhatsappMsg, setEditWhatsappMsg] = useState("");
  const [editReviewUrl, setEditReviewUrl] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync default code whenever tagCode changes
  useEffect(() => {
    if (tagCode || businessSlug) {
      setLoginId((tagCode || businessSlug || "ZT-0004").toUpperCase());
    }
  }, [tagCode, businessSlug]);

  // Check existing session from sessionStorage on mount / open
  useEffect(() => {
    if (isOpen) {
      const codeKey = (tagCode || businessSlug || "zt-0004").toLowerCase().trim();
      const storageKey = `zentap_owner_session_${codeKey}`;
      try {
        const cached = sessionStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
            setSessionToken(parsed.token);
            setSessionExpiresAt(parsed.expiresAt);
            setRemainingSeconds(Math.max(0, Math.floor((parsed.expiresAt - Date.now()) / 1000)));
            if (parsed.tag) setCardData(parsed.tag);
            if (parsed.business) {
              setBizData(parsed.business);
              populateFields(parsed.business);
            }
            if (parsed.stats) setScanStats(parsed.stats);
          } else {
            sessionStorage.removeItem(storageKey);
          }
        }
      } catch (err) {
        console.warn("Session parse notice:", err);
      }
    }
  }, [isOpen, tagCode, businessSlug]);

  const populateFields = (b: any) => {
    setEditName(b.name || initialBusinessName || "");
    setEditCity(b.city || "Ahmedabad");
    setEditOwnerName(b.owner_name || "");
    setEditPhone(b.phone || "");
    setEditWhatsapp(b.whatsapp_number || b.whatsapp || "");
    setEditWhatsappMsg(b.whatsapp_message || "Hello, I am reaching out regarding your business services.");
    setEditReviewUrl(b.google_review_link || b.review_url || "");
    setEditInstagram(b.instagram_url || b.instagram || "");
    setEditFacebook(b.facebook_url || b.facebook_link || "");
    setEditWebsite(b.website_url || b.website || "");
    setEditCategory(b.category || "");
    setEditAddress(b.address || "");
  };

  // 15-Minute Countdown Timer
  useEffect(() => {
    if (!sessionExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((sessionExpiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleLockAndExit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Submit Login credentials for verification
  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setErrorMsg("Please enter both Login ID and Password");
      return;
    }

    setVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/card/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: loginId.trim(),
          password: password.trim(),
          pin: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Login ID or Password is incorrect");
        return;
      }

      // Success: Save 15-min session
      setSessionToken(data.token);
      setSessionExpiresAt(data.expiresAt);
      setRemainingSeconds(Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000)));
      setCardData(data.tag);
      setBizData(data.business);
      if (data.stats) setScanStats(data.stats);

      if (data.business) {
        populateFields(data.business);
      }

      // Cache session for 15 mins
      try {
        const codeKey = (tagCode || businessSlug || loginId).toLowerCase().trim();
        const storageKey = `zentap_owner_session_${codeKey}`;
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            token: data.token,
            expiresAt: data.expiresAt,
            tag: data.tag,
            business: data.business,
            stats: data.stats,
          })
        );
      } catch (err) {
        console.warn("sessionStorage save error:", err);
      }
    } catch (err) {
      console.warn("handleVerifyLogin error:", err);
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Save updated details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;

    setSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/card/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          code: loginId || tagCode || businessSlug,
          updates: {
            name: editName.trim(),
            city: editCity.trim(),
            owner_name: editOwnerName.trim(),
            phone: editPhone.trim(),
            whatsapp_number: editWhatsapp.trim(),
            whatsapp_message: editWhatsappMsg.trim(),
            google_review_link: editReviewUrl.trim(),
            review_url: editReviewUrl.trim(),
            instagram_handle: editInstagram.trim(),
            facebook_link: editFacebook.trim(),
            website: editWebsite.trim(),
            category: editCategory.trim(),
            address: editAddress.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to update details");
        return;
      }

      setSaveSuccess(true);
      if (onDetailsUpdated) {
        onDetailsUpdated({
          name: editName.trim(),
          city: editCity.trim(),
          phone: editPhone.trim(),
          whatsapp_number: editWhatsapp.trim(),
          google_review_link: editReviewUrl.trim(),
          review_url: editReviewUrl.trim(),
          instagram_url: editInstagram.trim(),
          facebook_link: editFacebook.trim(),
          website: editWebsite.trim(),
          address: editAddress.trim(),
          category: editCategory.trim(),
        });
      }

      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.warn("handleSaveDetails error:", err);
      setErrorMsg("Failed to update details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockAndExit = () => {
    const codeKey = (tagCode || businessSlug || loginId).toLowerCase().trim();
    const storageKey = `zentap_owner_session_${codeKey}`;
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
    setSessionToken(null);
    setSessionExpiresAt(null);
    setPassword("");
    setErrorMsg("");
    setSaveSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#121622] text-white border border-white/10 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {sessionToken ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {sessionToken ? "Business Owner Panel" : "Business Owner Access"}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Item: {loginId || defaultCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sessionToken && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                <Clock className="w-3 h-3" />
                <span>{formatTimer(remainingSeconds)}</span>
              </span>
            )}
            <button
              onClick={handleLockAndExit}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: LOGIN AUTHENTICATION (LOGIN ID + PASSWORD)                         */}
        {/* ========================================================================= */}
        {!sessionToken ? (
          <form onSubmit={handleVerifyLogin} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1">
              <p className="font-semibold text-white">Owner Security Check</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Enter your unique Login ID and password to manage this physical standee or card. Unlocks a private 15-minute management session.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login ID Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Login ID *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ZT-0004"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">
                Pre-filled with your physical card / standee code.
              </span>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  placeholder="Enter your owner password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white tracking-wider focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5">
                <span>5 wrong attempts locks card for 30 minutes.</span>
                <a
                  href={`https://wa.me/919274560880?text=${encodeURIComponent(
                    `Hi ZenTap Super Admin, I need the password for my Business: ${initialBusinessName || ""}, ID: ${loginId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-0.5 font-bold"
                >
                  <span>Forgot Password?</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifying}
                className="tactile-btn flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff7a00] hover:brightness-110 text-black text-xs font-bold cursor-pointer shadow-lg transition-transform active:scale-[0.978] disabled:opacity-50"
              >
                {verifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-black" />
                    <span>Log In &amp; Manage Business</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: 15-MINUTE SCOPED OWNER MANAGEMENT PANEL                           */
          /* ========================================================================= */
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Live Telemetry Card */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
              <div>
                <span className="block text-[9.5px] text-gray-400 uppercase font-mono">Total Scans</span>
                <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                  {scanStats.totalScans}
                </span>
              </div>
              <div className="border-l border-white/10">
                <span className="block text-[9.5px] text-gray-400 uppercase font-mono">NFC Taps</span>
                <span className="font-mono text-sm sm:text-base font-bold text-sky-400">
                  {scanStats.nfcScans}
                </span>
              </div>
              <div className="border-l border-white/10">
                <span className="block text-[9.5px] text-gray-400 uppercase font-mono">QR Scans</span>
                <span className="font-mono text-sm sm:text-base font-bold text-purple-400">
                  {scanStats.qrScans}
                </span>
              </div>
              <div className="border-l border-white/10">
                <span className="block text-[9.5px] text-gray-400 uppercase font-mono">Reviews</span>
                <span className="font-mono text-sm sm:text-base font-bold text-emerald-400">
                  {scanStats.reviewClicks}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>✓ Business details saved successfully! Your live page is updated.</span>
              </div>
            )}

            {/* Form: Update Details */}
            <form onSubmit={handleSaveDetails} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Edit Business Details
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Changes go live immediately
                </span>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Business Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Zentap Digital Solutions"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* City & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    City / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="e.g. Ahmedabad"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Category / Subtitle
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="e.g. Service • Digital Agency"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Owner Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    placeholder="e.g. Meet Borad"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 92745 60880"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Google Review Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-300">
                    Google Review Link
                  </label>
                  {editReviewUrl && (
                    <a
                      href={editReviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Test link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://search.google.com/local/writereview?placeid=... or g.page/r/..."
                  value={editReviewUrl}
                  onChange={(e) => setEditReviewUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* WhatsApp Number & Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="text"
                      placeholder="919274560880"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Instagram Link / Handle
                  </label>
                  <div className="relative">
                    <Instagram className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Facebook & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Facebook Page URL
                  </label>
                  <div className="relative">
                    <Facebook className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={editFacebook}
                      onChange={(e) => setEditFacebook(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Website / Portfolio URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Full Address / Directions */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Full Address / Directions Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor, Sindhu Bhavan Road, Bodakdev, Ahmedabad"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Save Updates Button */}
              <div className="pt-3 flex items-center justify-between border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLockAndExit}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 cursor-pointer"
                >
                  Sign Out
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="tactile-btn flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff7a00] hover:brightness-110 text-black text-xs font-bold cursor-pointer shadow-lg transition-transform active:scale-[0.978] disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-black" />
                  <span>{saving ? "Saving Changes..." : "Save & Update Live Page"}</span>
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
