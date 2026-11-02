// src/components/customer/ZenTapHubPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Star, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Youtube, 
  Globe, 
  Mail, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Tag, 
  Sparkles,
  Play,
  Copy,
  Check,
  RefreshCw,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { 
  ReviewOptionRecord, 
  ReviewLength,
  PRESET_ASPECTS,
} from "@/lib/reviewAssistantStore";
import { BusinessRecord } from "@/lib/businessStore";
import { 
  PageDesignRecord, 
  PageButtonRecord, 
  PageSectionRecord, 
  PagePhotoRecord,
  THEME_PRESET_CONFIGS,
  getPageDesign,
  getPageButtons,
  getPageSections,
  getPagePhotos
} from "@/lib/hubDesignStore";
import OwnerAccessModal from "@/components/modals/OwnerAccessModal";

interface ZenTapHubPageProps {
  business: BusinessRecord;
  design: PageDesignRecord;
  buttons: PageButtonRecord[];
  sections: PageSectionRecord[];
  photos: PagePhotoRecord[];
  source?: "qr" | "nfc" | "web";
  isPreview?: boolean;
}

export default function ZenTapHubPage({
  business,
  design: initialDesign,
  buttons: initialButtons,
  sections: initialSections,
  photos: initialPhotos,
  source = "web",
  isPreview = false,
}: ZenTapHubPageProps) {
  const [design, setDesign] = useState<PageDesignRecord>(initialDesign);
  const [buttons, setButtons] = useState<PageButtonRecord[]>(initialButtons);
  const [sections, setSections] = useState<PageSectionRecord[]>(initialSections);
  const [photos, setPhotos] = useState<PagePhotoRecord[]>(initialPhotos);

  // Client hydration to fetch latest saved design from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && business?.id) {
      try {
        const localDesign = getPageDesign(business.id);
        const localButtons = getPageButtons(business.id);
        const localSections = getPageSections(business.id);
        const localPhotos = getPagePhotos(business.id);
        if (localDesign) setDesign(localDesign);
        if (localButtons && localButtons.length > 0) setButtons(localButtons);
        if (localSections && localSections.length > 0) setSections(localSections);
        if (localPhotos) setPhotos(localPhotos);
      } catch (e) {
        console.warn("Hydrating hub design error:", e);
      }
    }
  }, [business?.id]);
  // Lightbox state for gallery photos
  const [activePhoto, setActivePhoto] = useState<PagePhotoRecord | null>(null);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Owner Access Modal
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);

  // Interactive Star Rating & AI Review Assistant State
  const [stars, setStars] = useState<number | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [reviewLength, setReviewLength] = useState<ReviewLength>("medium");
  const [loading, setLoading] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<{ id: string; text: string }[]>([]);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number>(0);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Private feedback modal for <= 3 stars
  const [privateFeedbackOpen, setPrivateFeedbackOpen] = useState(false);
  const [fbText, setFbText] = useState("");
  const [fbName, setFbName] = useState("");
  const [fbPhone, setFbPhone] = useState("");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);

  // Speech-to-text
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState("");

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
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setVoiceNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const toggleOption = (id: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerateReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          stars: stars || 5,
          length: reviewLength,
          selected_options: selectedOptionIds,
          language: "en",
          voice_notes: voiceNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.drafts && data.drafts.length > 0) {
        setDrafts(data.drafts);
        setSelectedDraftIndex(0);
      } else {
        const aspectText = selectedOptionIds.length > 0 ? selectedOptionIds.join(", ") : "exceptional service";
        setDrafts([
          { id: "d1", text: `Really impressed with ${business.name}! ${aspectText.charAt(0).toUpperCase() + aspectText.slice(1)} was standout. Highly recommend!` },
          { id: "d2", text: `Great experience at ${business.name}. Loved the ${aspectText} and overall high quality.` },
          { id: "d3", text: `5-star visit to ${business.name}. Very professional and ${aspectText}. Will definitely come back!` },
        ]);
        setSelectedDraftIndex(0);
      }
    } catch {
      setDrafts([
        { id: "d1", text: `Had a wonderful experience at ${business.name}! Exceptional quality and very friendly staff. Highly recommend!` },
        { id: "d2", text: `Top-tier service from ${business.name}. Truly satisfied with my visit!` },
      ]);
      setSelectedDraftIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAndPost = () => {
    if (drafts.length === 0) return;
    const selected = drafts[selectedDraftIndex];
    navigator.clipboard.writeText(selected.text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);

    fetch("/api/review/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_id: business.id,
        event: "copied",
        generation_id: selected.id,
      }),
    }).catch(() => {});

    const targetUrl = reviewBtn?.url_or_value || (business as any).google_review_link || business.review_url || "";
    if (targetUrl) {
      setTimeout(() => {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      }, 350);
    }
  };

  const handleSendPrivateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbText.trim()) return;
    setFbSubmitting(true);
    try {
      await fetch("/api/review/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          stars: stars || 3,
          feedback_text: fbText.trim(),
          customer_name: fbName.trim() || undefined,
          customer_phone: fbPhone.trim().replace(/\D/g, "") || undefined,
          tag_code: business.slug,
        }),
      });
      setFbSuccess(true);
    } catch {
    } finally {
      setFbSubmitting(false);
    }
  };

  // Theme settings
  const primaryColor = design.primary_color || "#ff7a00";
  const accentColor = design.accent_color || "#ff7a00";
  const bgColor = design.bg_color || "#0e1015";
  const isDark = design.dark_mode !== "light";
  const cardStyle = design.card_style || "glass";
  const buttonStyle = design.button_style || "rounded";

  // Card classes based on style
  const cardClass = 
    cardStyle === "flat"
      ? isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200 shadow-xs"
      : cardStyle === "elevated"
      ? isDark ? "bg-zinc-900/90 shadow-xl border border-zinc-800/80" : "bg-white shadow-xl border border-zinc-100"
      : cardStyle === "bordered"
      ? isDark ? "bg-transparent border-2 border-zinc-800" : "bg-white border-2 border-zinc-200"
      : isDark 
      ? "bg-zinc-900/60 backdrop-blur-md border border-white/10 shadow-lg" 
      : "bg-white/80 backdrop-blur-md border border-black/5 shadow-lg";

  const btnRoundClass = 
    buttonStyle === "pill" 
      ? "rounded-full" 
      : buttonStyle === "square" 
      ? "rounded-md" 
      : "rounded-2xl";

  const trackClick = (btnType: string) => {
    if (isPreview) return;
    try {
      fetch("/api/hub/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          button_type: btnType,
          source,
        }),
      }).catch(() => {});
    } catch {}
  };

  // Helper for visible buttons
  const visibleButtons = buttons.filter((b) => b.visible && b.url_or_value);
  const callBtn = visibleButtons.find((b) => b.type === "call");
  const directionsBtn = visibleButtons.find((b) => b.type === "directions" || b.type === "maps");
  const reviewBtn = visibleButtons.find((b) => b.type === "review");

  // Social buttons
  const socialButtons = visibleButtons.filter((b) =>
    ["whatsapp", "instagram", "facebook", "youtube", "website", "email"].includes(b.type)
  );

  // Other custom buttons
  const customButtons = visibleButtons.filter((b) =>
    ["menu", "booking", "custom"].includes(b.type)
  );

  // Format URLs
  const getCallHref = (val: string) => `tel:${val.replace(/[^0-9+]/g, "")}`;
  const getMapsHref = (val: string) => {
    if (val.startsWith("http")) return val;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}`;
  };
  const getReviewHref = () => `/r/${business.slug}/review?s=${source}`;

  const getSocialHref = (b: PageButtonRecord) => {
    const val = b.url_or_value.trim();
    if (b.type === "whatsapp") {
      const cleanNum = val.replace(/[^0-9]/g, "");
      return `/w/${business.slug}?s=${source}`;
    }
    if (b.type === "instagram") {
      return `/i/${business.slug}?s=${source}`;
    }
    if (b.type === "facebook") {
      return `/f/${business.slug}?s=${source}`;
    }
    if (b.type === "youtube") {
      return `/y/${business.slug}?s=${source}`;
    }
    if (b.type === "email") {
      return `mailto:${val}`;
    }
    return val.startsWith("http") ? val : `https://${val}`;
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageCircle className="w-5 h-5 text-emerald-400" />;
      case "instagram": return <Instagram className="w-5 h-5 text-pink-400" />;
      case "facebook": return <Facebook className="w-5 h-5 text-blue-400" />;
      case "youtube": return <Youtube className="w-5 h-5 text-red-500" />;
      case "website": return <Globe className="w-5 h-5 text-cyan-400" />;
      case "email": return <Mail className="w-5 h-5 text-amber-400" />;
      default: return <ExternalLink className="w-5 h-5 text-zinc-300" />;
    }
  };

  return (
    <div 
      className={`min-h-screen ${isDark ? "text-white" : "text-zinc-900"} transition-colors relative`}
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: design.wallpaper_url ? `url(${design.wallpaper_url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: design.font && design.font !== "Inter" ? `'${design.font}', sans-serif` : "'Outfit', sans-serif"
      }}
    >
      {design.wallpaper_url && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-none" />
      )}
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-12">

        {/* 1. COVER BANNER */}
        <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-zinc-800 to-zinc-900 overflow-hidden">
          {design.cover_url ? (
            <img 
              src={design.cover_url} 
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
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* 2. LOGO + HEADER INFO */}
        <div className="px-5 -mt-14 relative z-10 flex flex-col items-center text-center">
          {/* Round Logo */}
          <div 
            className="w-24 h-24 rounded-full p-1 bg-white/10 backdrop-blur-md shadow-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: isDark ? "#141720" : "#ffffff" }}
          >
            {design.logo_url || (business as any).logo_url || business.custom_design?.logo_url ? (
              <img 
                src={design.logo_url || (business as any).logo_url || business.custom_design?.logo_url || ""} 
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

          {/* Business Name */}
          <h1 className="mt-3 text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5 justify-center">
            <span>{business.name}</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          </h1>

          {/* Tagline */}
          {design.tagline && (
            <p className={`mt-1 text-xs max-w-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
              {design.tagline}
            </p>
          )}

          {/* Address Pill */}
          {design.address && (
            <a
              href={getMapsHref(design.maps_link || design.address)}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackClick("address_pill")}
              className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                isDark 
                  ? "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10" 
                  : "bg-black/5 border-black/10 text-zinc-700 hover:bg-black/10"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="truncate max-w-[240px]">{design.address}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          )}
        </div>

        {/* 3. CALL + DIRECTIONS ROW */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-2.5">
          {callBtn && (
            <a
              href={getCallHref(callBtn.url_or_value)}
              onClick={() => trackClick("call")}
              className={`tactile-btn py-3 px-4 flex items-center justify-center gap-2 font-bold text-xs border transition-all active:scale-[0.978] cursor-pointer ${btnRoundClass} ${
                isDark 
                  ? "bg-zinc-900/80 hover:bg-zinc-800 text-white border-zinc-700" 
                  : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-xs"
              }`}
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{callBtn.label || design.texts.call_btn}</span>
            </a>
          )}

          {directionsBtn && (
            <a
              href={getMapsHref(directionsBtn.url_or_value)}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackClick("directions")}
              className={`tactile-btn py-3 px-4 flex items-center justify-center gap-2 font-bold text-xs border transition-all active:scale-[0.978] cursor-pointer ${btnRoundClass} ${
                isDark 
                  ? "bg-zinc-900/80 hover:bg-zinc-800 text-white border-zinc-700" 
                  : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-xs"
              }`}
            >
              <MapPin className="w-4 h-4 text-red-400" />
              <span>{directionsBtn.label || design.texts.directions_btn}</span>
            </a>
          )}
        </div>

        {/* 4. INTERACTIVE 5-STAR REVIEW ASSISTANT */}
        <div className="px-5 mt-3 space-y-3">
          <div className={`p-5 ${cardClass} ${btnRoundClass} text-center space-y-3 shadow-md`}>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => {
                const isFilled = stars !== null && s <= stars;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStars(s);
                      if (drafts.length > 0) setDrafts([]);
                    }}
                    className="p-1 cursor-pointer transition-transform active:scale-90 hover:scale-110"
                    title={`Rate ${s} out of 5 stars`}
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

          {/* If stars not yet tapped, show prominent Hero Button that activates 5-star review */}
          {stars === null && (
            <button
              type="button"
              onClick={() => {
                setStars(5);
                trackClick("review");
              }}
              className={`tactile-btn w-full py-4 px-5 flex items-center justify-center gap-2.5 font-black text-sm tracking-wide shadow-lg transition-all active:scale-[0.978] cursor-pointer ${btnRoundClass}`}
              style={{
                backgroundColor: primaryColor,
                color: "#000000",
              }}
            >
              <Star className="w-5 h-5 fill-current text-black" />
              <span>{reviewBtn?.label || design.texts.write_review_btn || "Leave a 5-Star Review on Google"}</span>
              <Sparkles className="w-4 h-4 text-black animate-pulse" />
            </button>
          )}

          {/* When stars clicked, reveal chips, length selector, AI generator & drafts */}
          {stars !== null && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
              {/* Aspect Chips */}
              <div className="space-y-2">
                <span className={`text-xs font-bold block ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  What stood out? (Tap 1 or more) *
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ASPECTS.map((aspect) => {
                    const isSelected = selectedOptionIds.includes(aspect);
                    return (
                      <button
                        key={aspect}
                        type="button"
                        onClick={() => toggleOption(aspect)}
                        className={`tactile-btn px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-[#ff7a00] text-black border-amber-600 font-bold shadow-2xs"
                            : isDark
                            ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                            : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200"
                        }`}
                      >
                        {aspect}
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
                    onClick={() => setReviewLength("short")}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      reviewLength === "short"
                        ? isDark ? "bg-zinc-900 text-white shadow-2xs font-extrabold" : "bg-white text-zinc-900 shadow-2xs font-extrabold"
                        : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Short (1-2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewLength("medium")}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      reviewLength === "medium"
                        ? isDark ? "bg-zinc-900 text-white shadow-2xs font-extrabold" : "bg-white text-zinc-900 shadow-2xs font-extrabold"
                        : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Medium (3-4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewLength("long")}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      reviewLength === "long"
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
                      <span>Crafting personalized drafts...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Write my review</span>
                    </>
                  )}
                </button>
              )}

              {/* Drafts Suggestion Cards Carousel */}
              {drafts.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                        Suggestion {selectedDraftIndex + 1} of {drafts.length}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-800"}`}>
                        {selectedDraftIndex + 1}/{drafts.length}
                      </span>
                    </div>

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
                        onChange={(e) => {
                          const newText = e.target.value;
                          setDrafts((prev) => prev.map((d, i) => i === selectedDraftIndex ? { ...d, text: newText } : d));
                        }}
                        className={`w-full text-xs leading-relaxed font-sans bg-transparent border-0 focus:outline-none resize-none ${isDark ? "text-white placeholder:text-zinc-600" : "text-zinc-900 placeholder:text-zinc-400"}`}
                        placeholder="Review text..."
                      />
                    </div>
                  )}

                  <p className={`text-[11px] italic text-center ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Suggestions are a starting point. Edit to match your experience.
                  </p>

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
                  </div>

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
            </div>
          )}
        </div>

        {/* 5. ROUND SOCIAL & CONTACT ICONS ROW */}
        <div className="px-5 mt-4">
          <div className={`p-3 ${cardClass} ${btnRoundClass} flex items-center justify-around gap-2`}>
            {socialButtons.map((btn) => (
              <a
                key={btn.id}
                href={getSocialHref(btn)}
                target={btn.type === "email" ? undefined : "_blank"}
                rel="noreferrer"
                onClick={() => trackClick(btn.type)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                }`}
                title={btn.label}
              >
                {getSocialIcon(btn.type)}
              </a>
            ))}
            {callBtn && !socialButtons.some((b) => b.type === "call") && (
              <a
                href={getCallHref(callBtn.url_or_value)}
                onClick={() => trackClick("call")}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                }`}
                title="Call"
              >
                <Phone className="w-5 h-5 text-emerald-400" />
              </a>
            )}
            {directionsBtn && !socialButtons.some((b) => b.type === "directions" || b.type === "maps") && (
              <a
                href={getMapsHref(directionsBtn.url_or_value)}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackClick("directions")}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
                }`}
                title="Directions"
              >
                <MapPin className="w-5 h-5 text-red-400" />
              </a>
            )}
          </div>
        </div>

        {/* 6. CUSTOM BUTTONS (Menu, Booking, Custom Links) */}
        {customButtons.length > 0 && (
          <div className="px-5 mt-3 space-y-2">
            {customButtons.map((btn) => (
              <a
                key={btn.id}
                href={btn.url_or_value.startsWith("http") ? btn.url_or_value : `https://${btn.url_or_value}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackClick(btn.type)}
                className={`tactile-btn w-full py-3.5 px-4 flex items-center justify-between font-bold text-xs border transition-all active:scale-[0.978] cursor-pointer ${btnRoundClass} ${
                  isDark
                    ? "bg-zinc-900/90 hover:bg-zinc-800 text-white border-zinc-700/80 shadow-md"
                    : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span>{btn.label}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            ))}
          </div>
        )}

        {/* 7. DYNAMIC SECTIONS IN ORDER */}
        <div className="px-5 mt-5 space-y-4">
          {sections.filter((s) => s.visible).map((section) => {
            switch (section.type) {
              case "about":
                return (
                  <div key={section.id} className={`p-4 ${cardClass} ${btnRoundClass}`}>
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-2 text-balance" style={{ color: accentColor }}>
                      {design.texts.about_heading}
                    </h2>
                    <p className={`text-xs leading-relaxed text-pretty ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                      {section.content?.text || ""}
                    </p>
                  </div>
                );

              case "photos":
                if (photos.length === 0) return null;
                return (
                  <div key={section.id} className={`p-4 ${cardClass} ${btnRoundClass}`}>
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-balance" style={{ color: accentColor }}>
                      {design.texts.photos_heading}
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => setActivePhoto(photo)}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative bg-zinc-800"
                        >
                          <img
                            src={photo.image_url}
                            alt={photo.caption || "Gallery photo"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case "hours":
                return (
                  <div key={section.id} className={`p-4 ${cardClass} ${btnRoundClass}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-balance" style={{ color: accentColor }}>
                        {design.texts.hours_heading}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Open Now
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {Array.isArray(section.content?.schedule) && section.content.schedule.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                          <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>{item.days}</span>
                          <span className="font-semibold font-mono">{item.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case "offers":
                if (!Array.isArray(section.content?.offers) || section.content.offers.length === 0) return null;
                return (
                  <div key={section.id} className={`p-4 ${cardClass} ${btnRoundClass} space-y-3`}>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-balance" style={{ color: accentColor }}>
                      {design.texts.offers_heading}
                    </h2>
                    {section.content.offers.map((offer: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-xs text-amber-300">{offer.title}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-normal">{offer.description}</p>
                      </div>
                    ))}
                  </div>
                );

              case "faqs":
                if (!Array.isArray(section.content?.items) || section.content.items.length === 0) return null;
                return (
                  <div key={section.id} className={`p-4 ${cardClass} ${btnRoundClass} space-y-2`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>
                      {design.texts.faqs_heading}
                    </h3>
                    {section.content.items.map((faq: any, i: number) => {
                      const isOpen = openFaqIndex === i;
                      return (
                        <div key={i} className="border-b border-white/5 last:border-0 pb-2">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                            className="w-full text-left py-1.5 flex justify-between items-center gap-2 text-xs font-semibold cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-60 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />}
                          </button>
                          {isOpen && (
                            <p className={`pt-1 text-[11px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                              {faq.a}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );

              case "testimonials":
                if (!Array.isArray(section.content?.reviews) || section.content.reviews.length === 0) return null;
                return (
                  <div key={section.id} className={`p-4 ${cardClass} ${btnRoundClass} space-y-3`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                      {design.texts.testimonials_heading}
                    </h3>
                    <div className="space-y-2.5">
                      {section.content.reviews.map((rev: any, i: number) => (
                        <div key={i} className={`p-3 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"}`}>
                          <div className="flex items-center gap-1 mb-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-[11px] italic leading-normal mb-1">"{rev.text}"</p>
                          <span className="text-[10px] font-bold text-zinc-400 block">— {rev.author}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              case "video":
                if (!section.content?.video_url) return null;
                return (
                  <div key={section.id} className={`p-4 ${cardClass} ${btnRoundClass}`}>
                    <div className="aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      {section.content.video_url.includes("youtube") || section.content.video_url.includes("youtu.be") ? (
                        <iframe
                          src={section.content.video_url.replace("watch?v=", "embed/")}
                          title="Video"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video 
                          src={section.content.video_url} 
                          controls 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>

        {/* 8. FOOTER: POWERED BY & OWNER ACCESS */}
        <footer className="mt-8 px-5 text-center space-y-2">
          {design.show_powered_by && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-300 font-medium">
              <span>Powered by</span>
              <a 
                href="https://zentapdigitalsolutions.com" 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-zinc-200 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>ZenTap</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />
              </a>
            </div>
          )}

          {/* Owner Access Link */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setOwnerModalOpen(true)}
              className="text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Business owner? Manage this card
            </button>
          </div>
        </footer>

        {/* PHOTO LIGHTBOX MODAL */}
        {activePhoto && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setActivePhoto(null)}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-md w-full space-y-2" onClick={(e) => e.stopPropagation()}>
              <img 
                src={activePhoto.image_url} 
                alt={activePhoto.caption || "Gallery"} 
                className="w-full rounded-2xl max-h-[75vh] object-contain shadow-2xl"
              />
              {activePhoto.caption && (
                <p className="text-center text-xs text-zinc-300 font-medium">
                  {activePhoto.caption}
                </p>
              )}
            </div>
          </div>
        )}

        {/* PRIVATE FEEDBACK MODAL (1-3 STARS) */}
        {privateFeedbackOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`max-w-md w-full p-6 rounded-3xl ${isDark ? "bg-zinc-900 border border-zinc-800 text-white" : "bg-white text-zinc-900"} shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95`}>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Discreet Private Feedback</h3>
                    <p className="text-[10px] text-zinc-400">Sent directly to the business owner</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivateFeedbackOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-zinc-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {fbSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm">Thank You for Your Feedback!</h4>
                  <p className="text-xs text-zinc-400">
                    Your comments have been delivered to management privately.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPrivateFeedbackOpen(false);
                      setFbSuccess(false);
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-bold hover:bg-zinc-700 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendPrivateFeedback} className="space-y-3">
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what went wrong and how we can make it right..."
                    value={fbText}
                    onChange={(e) => setFbText(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs focus:outline-none resize-none ${
                      isDark ? "bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                    }`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={fbName}
                      onChange={(e) => setFbName(e.target.value)}
                      className={`p-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDark ? "bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                      }`}
                    />
                    <input
                      type="tel"
                      placeholder="Your phone (optional)"
                      value={fbPhone}
                      onChange={(e) => setFbPhone(e.target.value)}
                      className={`p-2.5 rounded-xl border text-xs focus:outline-none ${
                        isDark ? "bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                      }`}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPrivateFeedbackOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={fbSubmitting || !fbText.trim()}
                      className="tactile-btn px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      {fbSubmitting ? "Sending..." : "Send Privately"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* OWNER ACCESS MODAL */}
        {ownerModalOpen && (
          <OwnerAccessModal
            isOpen={ownerModalOpen}
            onClose={() => setOwnerModalOpen(false)}
            tagCode={business.slug}
            businessSlug={business.slug}
            initialBusinessName={business.name}
          />
        )}

      </div>
    </div>
  );
}
