// src/components/customer/AiReviewCustomerFlow.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Star, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Instagram, 
  Facebook, 
  Phone, 
  Globe, 
  MapPin, 
  MessageSquare, 
  MessageCircle, 
  Lock, 
  AlertCircle,
  X,
  Share2,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff
} from "lucide-react";
import { BusinessRecord } from "@/lib/businessStore";
import { 
  ReviewConfigRecord, 
  ReviewOptionRecord, 
  ReviewLength,
  getAllReviewOptions 
} from "@/lib/reviewAssistantStore";
import {
  PageDesignRecord,
  PageButtonRecord,
  getPageDesign,
  getPageButtons,
} from "@/lib/hubDesignStore";
import OwnerAccessModal from "@/components/modals/OwnerAccessModal";

interface AiReviewCustomerFlowProps {
  business: BusinessRecord;
  config: ReviewConfigRecord;
  tagCode: string;
  isPreview?: boolean;
  design?: PageDesignRecord;
  buttons?: PageButtonRecord[];
  initialStars?: number | null;
}

interface DraftOption {
  id: string;
  text: string;
}

export default function AiReviewCustomerFlow({
  business,
  config,
  tagCode,
  isPreview = false,
  design,
  buttons,
  initialStars,
}: AiReviewCustomerFlowProps) {
  // Step 1: Star Rating (Default rating or empty until tapped)
  const [stars, setStars] = useState<number | null>(initialStars !== undefined ? initialStars : null);

  // Step 2: Chips
  const [availableOptions, setAvailableOptions] = useState<ReviewOptionRecord[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  // Step 3: Length
  const [length, setLength] = useState<ReviewLength>(config.default_length || "medium");

  // Step 4: Generation State
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [drafts, setDrafts] = useState<DraftOption[]>([]);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number>(0);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Private feedback modal (for 1-3 stars secondary link)
  const [privateFeedbackOpen, setPrivateFeedbackOpen] = useState(false);
  const [fbText, setFbText] = useState("");
  const [fbName, setFbName] = useState("");
  const [fbPhone, setFbPhone] = useState("");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);

  // Owner access modal
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);

  // Voice Input SpeechRecognition state
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported || typeof window === "undefined") return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = config.language === "gujarati_roman" ? "gu-IN" : config.language === "hindi_roman" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handleUpdateDraftText(selectedDraftIndex, transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Load active review options for this business
  useEffect(() => {
    if (business.id) {
      const all = getAllReviewOptions(business.id);
      setAvailableOptions(all.filter((o) => o.active));
    }
  }, [business.id]);

  const productChips = availableOptions.filter((o) => o.kind === "product");
  const aspectChips = availableOptions.filter((o) => o.kind === "aspect");

  const toggleOption = (id: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Generate Review Drafts
  const handleGenerateReviews = async () => {
    if (!stars) return;
    if (selectedOptionIds.length === 0) {
      setErrorMsg("Please tap at least one aspect you experienced.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setCopiedSuccess(false);

    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          stars,
          option_ids: selectedOptionIds,
          length,
          tag_id: tagCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Generation is taking longer than usual. Please retry.");
        return;
      }

      if (Array.isArray(data.options) && data.options.length > 0) {
        setDrafts(data.options);
        setSelectedDraftIndex(0);
      }
    } catch (err) {
      console.warn("handleGenerateReviews error:", err);
      setErrorMsg("Unable to reach assistant. Please check connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDraftText = (index: number, newText: string) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, text: newText } : d))
    );
  };

  const googleReviewUrl =
    config.google_review_link ||
    ("google_review_link" in business ? (business as any).google_review_link : null) ||
    business.review_url ||
    "";

  // Primary Action: Copy & Post on Google
  const handleCopyAndPost = async () => {
    const selected = drafts[selectedDraftIndex];
    if (!selected?.text) return;

    // 1. MUST run clipboard write directly inside the user tap event
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(selected.text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = selected.text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedSuccess(true);
    } catch (clipErr) {
      console.warn("Clipboard copy note:", clipErr);
    }

    // 2. Fire telemetry events (non-blocking)
    fetch("/api/review/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_id: business.id,
        event: "copied",
        generation_id: selected.id,
      }),
    }).catch(() => {});

    // 3. Open Google Review destination
    if (googleReviewUrl) {
      fetch("/api/review/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          event: "opened_google",
          generation_id: selected.id,
        }),
      }).catch(() => {});

      setTimeout(() => {
        window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
      }, 350);
    }
  };

  // Submit Private Feedback handler
  const handleSendPrivateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbText.trim()) return;

    setFbSubmitting(true);
    try {
      const res = await fetch("/api/review/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          stars: stars || 3,
          feedback_text: fbText.trim(),
          customer_name: fbName.trim() || undefined,
          customer_phone: fbPhone.trim().replace(/\D/g, "") || undefined,
          tag_code: tagCode,
        }),
      });

      if (res.ok) {
        setFbSuccess(true);
      }
    } catch (err) {
      console.warn("Feedback error:", err);
    } finally {
      setFbSubmitting(false);
    }
  };

  const hubDesign = design || getPageDesign(business.id);
  const hubButtons = buttons && buttons.length > 0 ? buttons : getPageButtons(business.id);

  const isDark = hubDesign.dark_mode !== "light";
  const primaryColor = hubDesign.primary_color || "#ff7a00";
  const accentColor = hubDesign.accent_color || "#ff7a00";
  const bgColor = hubDesign.bg_color || "#0e1015";
  const cardStyle = hubDesign.card_style || "glass";

  const cardClass = 
    cardStyle === "flat"
      ? isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200 shadow-xs"
      : cardStyle === "elevated"
      ? isDark ? "bg-zinc-900/90 shadow-xl border border-zinc-800/80" : "bg-white shadow-xl border border-zinc-100"
      : cardStyle === "bordered"
      ? isDark ? "bg-transparent border-2 border-zinc-800" : "bg-white border-2 border-zinc-200"
      : isDark 
      ? "bg-zinc-900/70 backdrop-blur-md border border-white/10 shadow-lg text-white" 
      : "bg-white/80 backdrop-blur-md border border-black/5 shadow-lg text-zinc-900";

  const callBtn = hubButtons.find((b) => b.type === "call") || (business.phone ? { type: "call", url_or_value: business.phone, label: "Call" } : null);
  const directionsBtn = hubButtons.find((b) => b.type === "directions" || b.type === "maps") || { type: "directions", url_or_value: business.google_review_link || business.address || "", label: "Directions" };
  const waBtn = hubButtons.find((b) => b.type === "whatsapp") || (business.whatsapp_number ? { type: "whatsapp", url_or_value: business.whatsapp_number, label: "WhatsApp" } : null);
  const igBtn = hubButtons.find((b) => b.type === "instagram") || (business.instagram ? { type: "instagram", url_or_value: business.instagram, label: "Instagram" } : null);
  const fbBtn = hubButtons.find((b) => b.type === "facebook") || (config.facebook_url ? { type: "facebook", url_or_value: config.facebook_url, label: "Facebook" } : null);

  return (
    <div 
      className={`min-h-screen ${isDark ? "text-white" : "text-zinc-900"} font-sans transition-colors relative flex flex-col justify-between selection:bg-amber-500 selection:text-black`}
      style={{
        backgroundColor: bgColor,
        backgroundImage: hubDesign.wallpaper_url ? `url(${hubDesign.wallpaper_url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {hubDesign.wallpaper_url && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none" />
      )}
      
      {/* Top Banner if preview mode */}
      {isPreview && (
        <div className="bg-amber-500 text-black px-4 py-2 text-center text-xs font-bold font-mono tracking-wider sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ADMIN LIVE PREVIEW • SMART REVIEW ASSISTANT ACTIVE</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto relative z-10 pb-8 space-y-4">
        
        {/* Top Cover Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-zinc-800 to-zinc-900 overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
          {hubDesign.cover_url ? (
            <img 
              src={hubDesign.cover_url} 
              alt={`${business.name} cover`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#ff7a00]/30 via-zinc-900 to-black flex items-center justify-center">
              <span className="text-zinc-200 font-bold uppercase tracking-widest text-xs drop-shadow">
                {business.name}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* Round Logo + Business Title & Category */}
        <div className="px-5 -mt-14 relative z-10 flex flex-col items-center text-center">
          <div 
            className="w-24 h-24 rounded-full p-1 bg-white/10 backdrop-blur-md shadow-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: isDark ? "#141720" : "#ffffff" }}
          >
            {hubDesign.logo_url || (business as any).logo_url ? (
              <img 
                src={hubDesign.logo_url || (business as any).logo_url} 
                alt={business.name} 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div 
                className="w-full h-full rounded-full flex items-center justify-center text-2xl font-black text-black"
                style={{ backgroundColor: primaryColor }}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="mt-3 text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5 justify-center">
            <span>{business.name}</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          </h1>

          <p className={`mt-1 text-xs max-w-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
            {hubDesign.tagline || (business as any).category || "Customer Satisfaction Hub"}
          </p>
        </div>

        {/* Call + Directions Row */}
        <div className="px-5 grid grid-cols-2 gap-2.5">
          {callBtn && (
            <a
              href={`tel:${callBtn.url_or_value.replace(/[^0-9+]/g, "")}`}
              className={`tactile-btn py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border transition-all active:scale-[0.978] cursor-pointer ${
                isDark 
                  ? "bg-zinc-900/80 hover:bg-zinc-800 text-white border-zinc-700" 
                  : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-xs"
              }`}
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call</span>
            </a>
          )}

          {directionsBtn && (
            <a
              href={
                directionsBtn.url_or_value.startsWith("http")
                  ? directionsBtn.url_or_value
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionsBtn.url_or_value)}`
              }
              target="_blank"
              rel="noreferrer"
              className={`tactile-btn py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border transition-all active:scale-[0.978] cursor-pointer ${
                isDark 
                  ? "bg-zinc-900/80 hover:bg-zinc-800 text-white border-zinc-700" 
                  : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-xs"
              }`}
            >
              <MapPin className="w-4 h-4 text-red-400" />
              <span>Directions</span>
            </a>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP A: 5 EMPTY STARS (NO DEFAULT RATING)                                 */}
        {/* ========================================================================= */}
        <div className="px-5">
          <div className={`p-5 rounded-3xl ${cardClass} text-center space-y-3 shadow-md`}>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starIndex) => {
                const isFilled = stars !== null && starIndex <= stars;
                return (
                  <button
                    key={starIndex}
                    type="button"
                    onClick={() => {
                      setStars(starIndex);
                      // Clear past drafts on star change so they adapt to sentiment
                      if (drafts.length > 0) setDrafts([]);
                    }}
                    className="p-1 cursor-pointer transition-transform active:scale-90 hover:scale-110"
                    title={`Rate ${starIndex} out of 5 stars`}
                  >
                    <Star
                      className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 filter drop-shadow-xs"
                          : isDark ? "text-zinc-600 hover:text-amber-300 fill-zinc-800/40" : "text-zinc-300 hover:text-amber-300 fill-zinc-50"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <span className={`text-xs font-bold block ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
              {stars === null
                ? "Loved it? Tap a star to review!"
                : stars === 5
                ? "Loved it! (5 Stars)"
                : stars === 4
                ? "Great experience! (4 Stars)"
                : stars === 3
                ? "Standard experience (3 Stars)"
                : "Room for improvement"}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP B & C: CHIPS & LENGTH SELECTOR (Appears once rating is tapped)        */}
        {/* ========================================================================= */}
        {stars !== null && (
          <div className="px-5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
            
            {/* Product Chips (if configured) */}
            {productChips.length > 0 && (
              <div className="space-y-2">
                <span className={`text-xs font-bold block ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  What did you order / receive?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {productChips.map((chip) => {
                    const isSelected = selectedOptionIds.includes(chip.id);
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => toggleOption(chip.id)}
                        className={`tactile-btn px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                            : isDark 
                            ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700" 
                            : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200"
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aspect Chips */}
            <div className="space-y-2">
              <span className={`text-xs font-bold block ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                What stood out? (Tap 1 or more) *
              </span>
              <div className="flex flex-wrap gap-1.5">
                {aspectChips.map((chip) => {
                  const isSelected = selectedOptionIds.includes(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleOption(chip.id)}
                      className={`tactile-btn px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                        isSelected
                          ? "bg-[#ff7a00] text-black border-amber-600 font-bold shadow-2xs"
                          : isDark 
                          ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700" 
                          : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length Selector */}
            <div className="space-y-1.5">
              <span className={`text-xs font-bold block ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                Review Length
              </span>
              <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-2xl border ${isDark ? "bg-zinc-800/80 border-zinc-700" : "bg-zinc-100 border-zinc-200/80"}`}>
                <button
                  type="button"
                  onClick={() => setLength("short")}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    length === "short"
                      ? isDark ? "bg-zinc-900 text-white shadow-2xs font-extrabold" : "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Short (1-2)
                </button>
                <button
                  type="button"
                  onClick={() => setLength("medium")}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    length === "medium"
                      ? isDark ? "bg-zinc-900 text-white shadow-2xs font-extrabold" : "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Medium (3-4)
                </button>
                <button
                  type="button"
                  onClick={() => setLength("long")}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    length === "long"
                      ? isDark ? "bg-zinc-900 text-white shadow-2xs font-extrabold" : "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Detailed (5+)
                </button>
              </div>
            </div>

            {/* Write My Review CTA Button */}
            {drafts.length === 0 && (
              <button
                type="button"
                onClick={handleGenerateReviews}
                disabled={loading || selectedOptionIds.length === 0}
                className="tactile-btn w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-[#ff7a00] hover:from-amber-600 hover:to-[#ea6c00] text-black font-extrabold text-sm shadow-md transition-all active:scale-[0.978] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Crafting 3 personalized drafts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Write my review</span>
                  </>
                )}
              </button>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <span>{errorMsg}</span>
                  {googleReviewUrl && (
                    <div className="pt-1">
                      <a
                        href={googleReviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-900 font-bold underline inline-flex items-center gap-1"
                      >
                        <span>Or open Google review directly</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP E & F: 2-3 DRAFT CARDS (SWIPEABLE CAROUSEL & EDITABLE)               */}
        {/* ========================================================================= */}
        {drafts.length > 0 && (
          <div className="px-5 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {/* Carousel Header with Arrows & Page Indicator (1/3) */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Suggestion {selectedDraftIndex + 1} of {drafts.length}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-800"}`}>
                  {selectedDraftIndex + 1}/{drafts.length}
                </span>
              </div>

              {/* Prev / Next Carousel Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDraftIndex((prev) => (prev > 0 ? prev - 1 : drafts.length - 1))}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"}`}
                  title="Previous suggestion"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDraftIndex((prev) => (prev < drafts.length - 1 ? prev + 1 : 0))}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"}`}
                  title="Next suggestion"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleGenerateReviews}
                  disabled={loading}
                  className="ml-2 text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20"
                  title="Generate another set"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>New drafts</span>
                </button>
              </div>
            </div>

            {/* Current Active Suggestion Card */}
            {drafts[selectedDraftIndex] && (
              <div className={`p-4 rounded-2xl border-2 border-[#ff7a00] ring-4 ring-[#ff7a00]/10 shadow-lg relative transition-all ${isDark ? "bg-zinc-900/90 text-white" : "bg-white text-zinc-900"}`}>
                <div className={`flex items-center justify-between pb-2 mb-2 border-b ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff7a00]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-[#ff7a00]">
                      Draft {selectedDraftIndex + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      Edit freely
                    </span>

                    {/* Mic Voice Dictation Button */}
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isListening
                            ? "bg-red-500 text-white border-red-600 animate-pulse"
                            : isDark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
                        }`}
                        title={isListening ? "Listening... Tap to stop" : "Tap to speak your review"}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-zinc-400" />}
                        <span className="text-[10px] hidden sm:inline">{isListening ? "Listening" : "Dictate"}</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={drafts[selectedDraftIndex].text}
                  onChange={(e) => handleUpdateDraftText(selectedDraftIndex, e.target.value)}
                  className={`w-full text-xs leading-relaxed font-sans bg-transparent border-0 focus:outline-none resize-none ${isDark ? "text-white placeholder:text-zinc-600" : "text-zinc-900 placeholder:text-zinc-400"}`}
                  placeholder="Review text..."
                />
              </div>
            )}

            {/* Small Helper Note */}
            <p className={`text-[11px] italic text-center ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Suggestions are a starting point. Edit to match your experience.
            </p>

            {/* Primary Action Button: Submit Review (Copy & Post on Google) */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={handleCopyAndPost}
                className="tactile-btn w-full py-4 rounded-2xl bg-[#ff7a00] hover:bg-[#e56d00] text-black font-black text-sm shadow-md transition-all active:scale-[0.978] flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span>Copied! Opening Google Review...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-black" />
                    <span>Submit review</span>
                    <ExternalLink className="w-3.5 h-3.5 text-black" />
                  </>
                )}
              </button>

              {!googleReviewUrl && (
                <p className="text-[11px] text-center text-amber-400 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                  Review link is being set up. You can still copy the text!
                </p>
              )}
            </div>

            {/* Step H: Optional secondary link for 1-3 stars */}
            {stars !== null && stars <= 3 && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setPrivateFeedbackOpen(true)}
                  className={`text-xs font-bold underline cursor-pointer ${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  Tell the owner privately (discreet feedback)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP J: UNIFIED TOUCHPOINT BUTTONS (WhatsApp, Instagram, Facebook, Call, Directions) */}
        {/* ========================================================================= */}
        <div className="px-5 mt-4">
          <div className={`p-3 rounded-2xl ${cardClass} flex items-center justify-around gap-2`}>
            {waBtn && (
              <a
                href={`https://wa.me/${waBtn.url_or_value.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                }`}
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </a>
            )}

            {igBtn && (
              <a
                href={
                  igBtn.url_or_value.startsWith("http")
                    ? igBtn.url_or_value
                    : `https://instagram.com/${igBtn.url_or_value.replace("@", "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                }`}
                title="Instagram"
              >
                <Instagram className="w-5 h-5 text-pink-400" />
              </a>
            )}

            {fbBtn && (
              <a
                href={fbBtn.url_or_value}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                }`}
                title="Facebook"
              >
                <Facebook className="w-5 h-5 text-blue-400" />
              </a>
            )}

            {callBtn && (
              <a
                href={`tel:${callBtn.url_or_value.replace(/[^0-9+]/g, "")}`}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                }`}
                title="Call"
              >
                <Phone className="w-5 h-5 text-emerald-400" />
              </a>
            )}

            {directionsBtn && (
              <a
                href={
                  directionsBtn.url_or_value.startsWith("http")
                    ? directionsBtn.url_or_value
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionsBtn.url_or_value)}`
                }
                target="_blank"
                rel="noreferrer"
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                }`}
                title="Directions"
              >
                <MapPin className="w-4 h-4 text-red-400" />
              </a>
            )}
          </div>

          {/* Physical Address if available */}
          {(config.address || hubDesign.address) && (
            <div className={`mt-3 flex items-center justify-center gap-1.5 text-xs font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span>{config.address || hubDesign.address}</span>
            </div>
          )}
        </div>

      </main>

      {/* ========================================================================= */}
      {/* FOOTER: OWNER ACCESS MODAL TRIGGER                                        */}
      {/* ========================================================================= */}
      <footer className="w-full text-center py-6 text-xs text-zinc-400 border-t border-zinc-100">
        <button
          onClick={() => setOwnerModalOpen(true)}
          className="text-zinc-400 hover:text-zinc-600 font-semibold cursor-pointer transition-colors"
        >
          Business owner? Manage this card
        </button>
      </footer>

      {/* Owner Access Modal */}
      <OwnerAccessModal
        isOpen={ownerModalOpen}
        onClose={() => setOwnerModalOpen(false)}
        tagCode={tagCode || business.slug}
        businessSlug={business.slug}
        initialBusinessName={business.name}
      />

      {/* ========================================================================= */}
      {/* MODAL: PRIVATE FEEDBACK (1-3 STARS)                                       */}
      {/* ========================================================================= */}
      {privateFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-headline font-bold text-base text-zinc-900">
                  Tell Management Privately
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Your remarks go directly to the owner so they can improve.
                </p>
              </div>
              <button
                onClick={() => setPrivateFeedbackOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {fbSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-zinc-900">Feedback Received</h4>
                <p className="text-xs text-zinc-500">
                  Thank you for helping us improve our services.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFbSuccess(false);
                    setPrivateFeedbackOpen(false);
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendPrivateFeedback} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    What can we do better? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what went wrong so we can resolve it..."
                    value={fbText}
                    onChange={(e) => setFbText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={fbName}
                      onChange={(e) => setFbName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={fbPhone}
                      onChange={(e) => setFbPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setPrivateFeedbackOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fbSubmitting}
                    className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {fbSubmitting ? "Submitting..." : "Send to Owner"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
