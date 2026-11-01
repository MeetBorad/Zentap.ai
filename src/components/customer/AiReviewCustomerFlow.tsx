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
import OwnerAccessModal from "@/components/modals/OwnerAccessModal";

interface AiReviewCustomerFlowProps {
  business: BusinessRecord;
  config: ReviewConfigRecord;
  tagCode: string;
  isPreview?: boolean;
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
}: AiReviewCustomerFlowProps) {
  // Step 1: Star Rating (NO default rating - empty until tapped)
  const [stars, setStars] = useState<number | null>(null);

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

  const showIcons = config.show_icons || {
    instagram: true,
    whatsapp: true,
    facebook: true,
    website: true,
  };

  const hasAnySocial =
    (showIcons.instagram && business.instagram_url) ||
    (showIcons.whatsapp && business.whatsapp_number) ||
    (showIcons.facebook && config.facebook_url) ||
    (showIcons.website && config.website_url);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-zinc-900 font-sans flex flex-col justify-between selection:bg-amber-100">
      
      {/* Top Banner if preview mode */}
      {isPreview && (
        <div className="bg-amber-500 text-black px-4 py-2 text-center text-xs font-bold font-mono tracking-wider sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ADMIN LIVE PREVIEW • AI REVIEW ASSISTANT ACTIVE</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto px-4 py-8 sm:py-12 space-y-6">
        
        {/* Header: Business Logo / Monogram & Name */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md border border-zinc-200">
            {business.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-2xl text-zinc-900 tracking-tight">
              {business.name}
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              How was your experience today? Tap to write your review.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP A: 5 EMPTY STARS (NO DEFAULT RATING)                                 */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs text-center space-y-3">
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
                        : "text-zinc-300 hover:text-amber-300 fill-zinc-50"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="text-xs font-bold text-zinc-600 block">
            {stars === null
              ? "Select your rating"
              : stars === 5
              ? "Loved it! (5 Stars)"
              : stars === 4
              ? "Great experience! (4 Stars)"
              : stars === 3
              ? "Standard experience (3 Stars)"
              : "Room for improvement"}
          </span>
        </div>

        {/* ========================================================================= */}
        {/* STEP B & C: CHIPS & LENGTH SELECTOR (Appears once rating is tapped)        */}
        {/* ========================================================================= */}
        {stars !== null && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-3 duration-300">
            
            {/* Product Chips (if configured) */}
            {productChips.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-700 block">
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
              <span className="text-xs font-bold text-zinc-700 block">
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
              <span className="text-xs font-bold text-zinc-700 block">
                Review Length
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-2xl border border-zinc-200/80">
                <button
                  type="button"
                  onClick={() => setLength("short")}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    length === "short"
                      ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Short (1-2)
                </button>
                <button
                  type="button"
                  onClick={() => setLength("medium")}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    length === "medium"
                      ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Medium (3-4)
                </button>
                <button
                  type="button"
                  onClick={() => setLength("long")}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    length === "long"
                      ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : "text-zinc-600 hover:text-zinc-900"
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
                className="tactile-btn w-full py-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-black hover:from-black hover:to-zinc-900 text-white font-bold text-sm shadow-md transition-all active:scale-[0.978] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Crafting 3 personalized drafts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
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
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {/* Carousel Header with Arrows & Page Indicator (1/3) */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900">
                  Suggestion {selectedDraftIndex + 1} of {drafts.length}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-[10px] font-mono font-bold">
                  {selectedDraftIndex + 1}/{drafts.length}
                </span>
              </div>

              {/* Prev / Next Carousel Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDraftIndex((prev) => (prev > 0 ? prev - 1 : drafts.length - 1))}
                  className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  title="Previous suggestion"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDraftIndex((prev) => (prev < drafts.length - 1 ? prev + 1 : 0))}
                  className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  title="Next suggestion"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleGenerateReviews}
                  disabled={loading}
                  className="ml-2 text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200"
                  title="Generate another set"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>Generate another set</span>
                </button>
              </div>
            </div>

            {/* Current Active Suggestion Card */}
            {drafts[selectedDraftIndex] && (
              <div className="p-4 rounded-2xl bg-white border-2 border-[#ff7a00] ring-4 ring-[#ff7a00]/10 shadow-lg relative transition-all">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff7a00]" />
                    <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider font-mono">
                      Draft {selectedDraftIndex + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">
                      Your draft, edit freely
                    </span>

                    {/* Mic Voice Dictation Button */}
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isListening
                            ? "bg-red-500 text-white border-red-600 animate-pulse"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
                        }`}
                        title={isListening ? "Listening... Tap to stop" : "Tap to speak your review"}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-zinc-600" />}
                        <span className="text-[10px] hidden sm:inline">{isListening ? "Listening" : "Dictate"}</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={drafts[selectedDraftIndex].text}
                  onChange={(e) => handleUpdateDraftText(selectedDraftIndex, e.target.value)}
                  className="w-full text-xs text-zinc-900 leading-relaxed font-sans bg-transparent border-0 focus:outline-none resize-none"
                  placeholder="Review text..."
                />
              </div>
            )}

            {/* Small Helper Note */}
            <p className="text-[11px] text-zinc-500 italic text-center">
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
                <p className="text-[11px] text-center text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
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
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
                >
                  Tell the owner privately (discreet feedback)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP J: SOCIAL ICON ROW & ADDRESS                                         */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-zinc-200/80 text-center space-y-4">
          {hasAnySocial && (
            <div className="flex items-center justify-center gap-3">
              {showIcons.instagram && business.instagram_url && (
                <a
                  href={
                    business.instagram_url.startsWith("http")
                      ? business.instagram_url
                      : `https://instagram.com/${business.instagram_url.replace("@", "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-pink-600 flex items-center justify-center shadow-2xs transition-transform active:scale-95"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {showIcons.whatsapp && business.whatsapp_number && (
                <a
                  href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-emerald-600 flex items-center justify-center shadow-2xs transition-transform active:scale-95"
                  title="WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}

              {showIcons.facebook && config.facebook_url && (
                <a
                  href={config.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-blue-600 flex items-center justify-center shadow-2xs transition-transform active:scale-95"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}

              {showIcons.website && config.website_url && (
                <a
                  href={config.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 flex items-center justify-center shadow-2xs transition-transform active:scale-95"
                  title="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* Physical Address */}
          {config.address && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span>{config.address}</span>
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
