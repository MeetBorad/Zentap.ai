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
  QrCode
} from "lucide-react";

interface OwnerAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagCode: string; // standee/card code (e.g. zt-0042 or business slug)
  businessSlug?: string;
  initialBusinessName?: string;
  onDetailsUpdated?: (updated: { name?: string; review_url?: string; whatsapp_number?: string; instagram_url?: string }) => void;
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
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
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
  const [editReviewUrl, setEditReviewUrl] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editWhatsappMsg, setEditWhatsappMsg] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset Confirmation State
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLevel, setResetLevel] = useState<"off" | "needs_approval" | "direct">("off");
  const [resetting, setResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  // Check existing session from sessionStorage on mount / open
  useEffect(() => {
    if (isOpen && tagCode) {
      const storageKey = `zentap_owner_session_${tagCode.toLowerCase().trim()}`;
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
              setEditName(parsed.business.name || "");
              setEditReviewUrl(parsed.business.review_url || "");
              setEditWhatsapp(parsed.business.whatsapp_number || "");
              setEditWhatsappMsg(parsed.business.whatsapp_message || "");
              setEditInstagram(parsed.business.instagram_url || "");
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
  }, [isOpen, tagCode]);

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

  // Submit PIN for verification
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg("Please enter your card PIN");
      return;
    }

    setVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/card/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: tagCode || businessSlug,
          pin: pin.trim(),
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Uniform generic error
        setErrorMsg(data.error || "PIN is incorrect");
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
        setEditName(data.business.name || "");
        setEditReviewUrl(data.business.review_url || "");
        setEditWhatsapp(data.business.whatsapp_number || "");
        setEditWhatsappMsg(data.business.whatsapp_message || "");
        setEditInstagram(data.business.instagram_url || "");
      }

      // Cache session for 15 mins
      try {
        const storageKey = `zentap_owner_session_${tagCode.toLowerCase().trim()}`;
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
      console.warn("handleVerifyPin error:", err);
      setErrorMsg("PIN is incorrect");
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
          code: tagCode || businessSlug,
          updates: {
            name: editName.trim(),
            review_url: editReviewUrl.trim(),
            whatsapp_number: editWhatsapp.trim(),
            whatsapp_message: editWhatsappMsg.trim(),
            instagram_handle: editInstagram.trim(),
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
          review_url: editReviewUrl.trim(),
          whatsapp_number: editWhatsapp.trim(),
          instagram_url: editInstagram.trim(),
        });
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.warn("handleSaveDetails error:", err);
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Execute card reset
  const handleConfirmReset = async () => {
    if (!sessionToken) return;

    setResetting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/card/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          code: tagCode || businessSlug,
          resetLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to reset card");
        return;
      }

      setResetDialogOpen(false);
      const levelLabel =
        resetLevel === "off"
          ? "Card turned OFF (scans show Page Unavailable)"
          : resetLevel === "direct"
          ? "Card switched to Direct Google Review"
          : "Reset request submitted to Super Admin for approval (Card turned OFF)";

      setResetSuccessMsg(`✓ ${levelLabel}`);
    } catch (err) {
      console.warn("handleConfirmReset error:", err);
      setErrorMsg("Reset action failed. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  const handleLockAndExit = () => {
    try {
      const storageKey = `zentap_owner_session_${tagCode.toLowerCase().trim()}`;
      sessionStorage.removeItem(storageKey);
    } catch {}
    setSessionToken(null);
    setSessionExpiresAt(null);
    setPin("");
    setPassword("");
    setErrorMsg("");
    setResetSuccessMsg("");
    onClose();
  };

  if (!isOpen) return null;

  const isMapsLink = editReviewUrl.includes("maps.app.goo.gl");

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#141720] text-white border border-[#2a3042] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {sessionToken ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-headline font-bold text-base sm:text-lg text-white">
                {sessionToken ? "Card Owner Panel" : "Business Owner Access"}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Item: {tagCode ? tagCode.toUpperCase() : businessSlug || "ZenTap Standee"}
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
        {/* VIEW 1: PIN AUTHENTICATION                                                */}
        {/* ========================================================================= */}
        {!sessionToken ? (
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1">
              <p className="font-semibold text-white">Owner Security Check</p>
              <p className="text-[11px] text-gray-400">
                Enter the secret card PIN to manage this physical standee or card. Unlocks a private 15-minute session.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Card PIN *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  autoFocus
                  maxLength={12}
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white font-mono tracking-widest placeholder:tracking-normal placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5">
                <span>5 wrong attempts locks card for 30 minutes.</span>
                <a
                  href={`https://wa.me/919274560880?text=${encodeURIComponent(
                    `Hi ZenTap Super Admin, I forgot the PIN for card: ${tagCode || businessSlug || ""}, Business: ${initialBusinessName || bizData?.name || ""}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-0.5 font-bold"
                >
                  <span>Forgot PIN?</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Optional Second Secret: Business Password */}
            <div>
              <button
                type="button"
                onClick={() => setShowPasswordField(!showPasswordField)}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{showPasswordField ? "− Hide business password" : "+ Add business password (if configured)"}</span>
              </button>

              {showPasswordField && (
                <div className="mt-2 animate-in slide-in-from-top-2">
                  <input
                    type="password"
                    placeholder="Enter business password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
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
                className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold cursor-pointer shadow-lg transition-transform active:scale-[0.978] disabled:opacity-50"
              >
                {verifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-black" />
                    <span>Unlock Card Panel</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: 15-MINUTE SCOPED OWNER PANEL                                      */
          /* ========================================================================= */
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Live Telemetry Card */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-black/30 border border-white/10 text-center">
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-mono">Total Scans</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {scanStats.totalScans}
                </span>
              </div>
              <div className="border-x border-white/10">
                <span className="block text-[10px] text-gray-400 uppercase font-mono">NFC Taps</span>
                <span className="font-mono text-base font-bold text-sky-400">
                  {scanStats.nfcScans}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-mono">QR Scans</span>
                <span className="font-mono text-base font-bold text-purple-400">
                  {scanStats.qrScans}
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
                <span>✓ Card details updated! Live across all physical scans instantly.</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {/* Form: Update Details */}
            <form onSubmit={handleSaveDetails} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Card Configuration
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Scoped to: {cardData?.code || tagCode}
                </span>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                  />
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
                  placeholder="https://g.page/r/.../review"
                  value={editReviewUrl}
                  onChange={(e) => setEditReviewUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                />
                {isMapsLink && (
                  <p className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>Warning: maps.app.goo.gl opens profile, not direct review prompt.</span>
                  </p>
                )}
              </div>

              {/* WhatsApp Number & Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <Instagram className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                    <input
                      type="text"
                      placeholder="@yourhandle"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Default WhatsApp Chat Message
                </label>
                <input
                  type="text"
                  placeholder="Hello, I tapped your ZenTap standee!"
                  value={editWhatsappMsg}
                  onChange={(e) => setEditWhatsappMsg(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Save Updates Button */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResetDialogOpen(true)}
                  className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 cursor-pointer transition-colors"
                >
                  Reset Card
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleLockAndExit}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 cursor-pointer"
                  >
                    Lock &amp; Exit
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="tactile-btn px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold cursor-pointer shadow-md transition-transform active:scale-[0.978] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Updates"}
                  </button>
                </div>
              </div>
            </form>

            {/* ========================================================================= */}
            {/* SUB-MODAL: RESET CARD CONFIRMATION DIALOG                                */}
            {/* ========================================================================= */}
            {resetDialogOpen && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-3 animate-in zoom-in-95">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Confirm Card Reset Action</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Select the reset level for this physical standee or card:
                </p>

                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2 p-2 rounded-xl bg-black/30 border border-white/10 cursor-pointer">
                    <input
                      type="radio"
                      name="resetLevel"
                      checked={resetLevel === "off"}
                      onChange={() => setResetLevel("off")}
                      className="mt-0.5 text-red-500 focus:ring-red-400"
                    />
                    <div>
                      <span className="block font-bold text-white">Turn Off (Page Unavailable)</span>
                      <span className="text-[10px] text-gray-400">Deactivates the card immediately. Taps display neutral "Page Unavailable".</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-xl bg-black/30 border border-white/10 cursor-pointer">
                    <input
                      type="radio"
                      name="resetLevel"
                      checked={resetLevel === "direct"}
                      onChange={() => setResetLevel("direct")}
                      className="mt-0.5 text-blue-500 focus:ring-blue-400"
                    />
                    <div>
                      <span className="block font-bold text-white">Direct Google Review</span>
                      <span className="text-[10px] text-gray-400">Bypasses ZenTap page and redirects scans straight to your Google review link.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-xl bg-black/30 border border-white/10 cursor-pointer">
                    <input
                      type="radio"
                      name="resetLevel"
                      checked={resetLevel === "needs_approval"}
                      onChange={() => setResetLevel("needs_approval")}
                      className="mt-0.5 text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <span className="block font-bold text-white">Needs Approval</span>
                      <span className="text-[10px] text-gray-400">Marks this card pending verification by admin support.</span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-red-500/20">
                  <button
                    type="button"
                    onClick={() => setResetDialogOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-semibold text-gray-300 hover:bg-white/15 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    disabled={resetting}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {resetting
                      ? "Processing..."
                      : resetLevel === "needs_approval"
                      ? "Submit Reset Request"
                      : "Confirm Reset"}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
