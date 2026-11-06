"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BusinessRecord } from "@/lib/businessStore";
import {
  generateReviewDraft,
  generateReviewSuggestions,
  REVIEW_RATING_METAS,
  DEFAULT_REVIEW_TAGS
} from "@/services/reviewService";
import {
  Sparkles,
  Star,
  Check,
  Copy,
  Edit3,
  Clock,
  ShieldCheck,
  MessageCircle,
  Phone,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  ShoppingBag,
  Tag,
  RefreshCw
} from "lucide-react";

interface ZenTapReviewAssistantProps {
  business: BusinessRecord;
  pageConfig?: any;
  tagCode?: string;
  googleReviewUrl?: string;
  allowBusinessPageAccess?: boolean;
  source?: "qr" | "nfc";
  isPreview?: boolean;
}

export default function ZenTapReviewAssistant({
  business,
  pageConfig,
  tagCode,
  googleReviewUrl,
  allowBusinessPageAccess = true,
  source = "qr",
  isPreview = false,
}: ZenTapReviewAssistantProps) {
  const [currentRating, setCurrentRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customExperience, setCustomExperience] = useState<string>("");
  const [variationSeed, setVariationSeed] = useState<number>(0);
  const [isRotating, setIsRotating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
  const [reviewDraft, setReviewDraft] = useState<string>("");
  const [copiedText, setCopiedText] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [activeAiEngine, setActiveAiEngine] = useState<{
    provider: string;
    label: string;
    model: string;
    source: string;
  }>({
    provider: "gemini",
    label: "Google Gemini",
    model: "gemini-3.5-flash-lite",
    source: "cloud_llm",
  });

  const businessName = pageConfig?.title || business.name || "ZenTap Digital Solutions";
  const city = business.city || "Ahmedabad";
  const cleanPhone = (pageConfig?.phone || business.phone || "+919274560880").replace(/\s+/g, "");
  const cleanWa = (pageConfig?.whatsapp || business.whatsapp || "919274560880").replace(/\D/g, "");
  const logoUrl = pageConfig?.logo_url || business.logo_url || "/logo.png";
  const locationImg = pageConfig?.location_image || business.location_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBn_TEaXs-VF4rFe0stnQgCYg0MynH2oOZeU9dQHGHuoFh5E1v447bVapRPDHEz1ipdX4vPRxNVokhF77GwXNQOBUmj2bF9oe3C9v4c8fmxU_3FFVdsBS5kiipfsNb3M4Va0GalihDkxwsGJYQ1UAhu0dnfybRD-0AXXNrCoLX5185-7q2BnTbJiEPNztNk2SqgMiYh9fYG9ajLfLogd4E4g_d8_f6s0AfohHb_Em7G";

  // Active theme styling mapped from pageConfig
  const activeTheme = pageConfig?.theme || "obsidian";
  const themeClasses = useMemo(() => {
    switch (activeTheme) {
      case "slate":
        return {
          wrapper: "bg-[#0f172a] text-slate-100",
          card: "bg-[#1e293b]/95 border-sky-500/20",
          inner: "bg-[#334155]",
          innerBorder: "border-sky-500/10",
          accentLine: "via-sky-400",
          accentText: "text-sky-400",
          glow1: "bg-sky-500/10",
          glow2: "bg-indigo-500/10",
          chipActive: "bg-sky-500/20 text-white border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]",
          chipInactive: "bg-[#334155] text-slate-300 hover:text-white border-white/5",
          btnGradient: "from-sky-500 via-sky-400 to-sky-500 text-slate-950",
          footerBg: "bg-[#0a0f1d]",
        };
      case "emerald":
        return {
          wrapper: "bg-[#062016] text-emerald-100",
          card: "bg-[#0d3326]/95 border-emerald-500/20",
          inner: "bg-[#134e3a]",
          innerBorder: "border-emerald-500/10",
          accentLine: "via-emerald-400",
          accentText: "text-emerald-400",
          glow1: "bg-emerald-500/10",
          glow2: "bg-teal-500/10",
          chipActive: "bg-emerald-500/20 text-white border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
          chipInactive: "bg-[#134e3a] text-slate-300 hover:text-white border-white/5",
          btnGradient: "from-emerald-500 via-emerald-400 to-emerald-500 text-slate-950",
          footerBg: "bg-[#03140e]",
        };
      case "sunset":
        return {
          wrapper: "bg-[#1c0d06] text-orange-100",
          card: "bg-[#2e170c]/95 border-orange-500/20",
          inner: "bg-[#452210]",
          innerBorder: "border-orange-500/10",
          accentLine: "via-orange-400",
          accentText: "text-orange-400",
          glow1: "bg-orange-500/10",
          glow2: "bg-amber-500/10",
          chipActive: "bg-orange-500/20 text-white border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.25)]",
          chipInactive: "bg-[#452210] text-slate-300 hover:text-white border-white/5",
          btnGradient: "from-orange-500 via-amber-400 to-orange-500 text-slate-950",
          footerBg: "bg-[#120703]",
        };
      case "clean_light":
        return {
          wrapper: "bg-[#f8fafc] text-slate-900",
          card: "bg-white border-slate-200 shadow-xl",
          inner: "bg-slate-100",
          innerBorder: "border-slate-200",
          accentLine: "via-amber-500",
          accentText: "text-amber-600",
          glow1: "bg-amber-500/5",
          glow2: "bg-blue-500/5",
          chipActive: "bg-amber-500/20 text-slate-900 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
          chipInactive: "bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200",
          btnGradient: "from-amber-500 via-amber-400 to-amber-500 text-slate-950",
          footerBg: "bg-slate-100",
        };
      case "obsidian":
      default:
        return {
          wrapper: "bg-[#0B0F17] text-slate-100",
          card: "bg-[#121824]/90 border-white/8",
          inner: "bg-[#181c24]",
          innerBorder: "border-white/5",
          accentLine: "via-amber-500",
          accentText: "text-amber-400",
          glow1: "bg-amber-500/10",
          glow2: "bg-cyan-500/10",
          chipActive: "bg-amber-500/20 text-white border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
          chipInactive: "bg-[#1B2232] text-slate-400 hover:text-white border-white/5",
          btnGradient: "from-amber-500 via-amber-400 to-amber-500 text-slate-950",
          footerBg: "bg-[#0a0e16]",
        };
    }
  }, [activeTheme]);

  // Google review link (guarantees sample showcase redirect for zentap)
  const finalGoogleLink = useMemo(() => {
    const isZenTapSample =
      (business.slug || "").toLowerCase() === "zentap" ||
      (tagCode || "").toLowerCase() === "zentap" ||
      business.id === "sample-demo-biz-01";

    if (isZenTapSample) {
      return "https://g.page/r/CdJX2OGu1yhoEAI/review";
    }

    let link = (googleReviewUrl || pageConfig?.google_link || business.google_review_link || business.review_url || "").trim();
    if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
      link = `https://${link}`;
    }
    return link || "https://g.page/r/CdJX2OGu1yhoEAI/review";
  }, [googleReviewUrl, pageConfig?.google_link, business.google_review_link, business.review_url, business.slug, business.id, tagCode]);

  // Read categories & tags directly from editor config to strictly match what was saved in the editor
  const allTags = useMemo(() => {
    const customCats = Array.isArray(pageConfig?.categories)
      ? pageConfig.categories
      : typeof pageConfig?.categories === "string"
        ? pageConfig.categories.split(/[•|,]/).map((s: string) => s.trim()).filter(Boolean)
        : [];

    const customTags = Array.isArray(pageConfig?.tags)
      ? pageConfig.tags
      : typeof pageConfig?.tags === "string"
        ? pageConfig.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    const singleCat = typeof pageConfig?.category === "string"
      ? pageConfig.category.split(/[•|,]/).map((s: string) => s.trim()).filter(Boolean)
      : [];

    const bizCat = typeof business?.category === "string"
      ? business.category.split(/[•|,]/).map((s: string) => s.trim()).filter(Boolean)
      : [];

    const bizChips = Array.isArray((business as any)?.custom_chips)
      ? (business as any).custom_chips
      : [];

    // Also extract categories from subtitle if entered as "City • Category" or "Category, Category"
    const subtitleCategories = pageConfig?.subtitle
      ? String(pageConfig.subtitle)
        .split(/[•|,]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s && !s.toLowerCase().includes("welcome") && !s.toLowerCase().includes("official digital hub"))
      : [];

    const userDefined = Array.from(new Set([...customCats, ...customTags, ...singleCat, ...subtitleCategories, ...bizCat, ...bizChips])).filter(Boolean);

    // If the user has custom categories or tags entered in Editor, show EXACTLY those!
    if (userDefined.length > 0) {
      return userDefined;
    }

    return Array.from(DEFAULT_REVIEW_TAGS);
  }, [pageConfig?.tags, pageConfig?.categories, pageConfig?.category, pageConfig?.subtitle, business?.category, (business as any)?.custom_chips]);

  // Auto-select first 1-2 tags from allTags when they load or change
  useEffect(() => {
    if (allTags.length > 0) {
      setSelectedTags((prev) => {
        const hasOverlap = Array.from(prev).some((t) => allTags.includes(t));
        if (!hasOverlap || prev.size === 0) {
          return new Set(allTags.slice(0, Math.min(2, allTags.length)));
        }
        return prev;
      });
    }
  }, [allTags]);

  // Generate dynamic 2-3 unique suggestions whenever inputs change
  useEffect(() => {
    const list = generateReviewSuggestions({
      businessName,
      city,
      rating: currentRating,
      selectedTags: Array.from(selectedTags),
      customNotes: customExperience,
      seed: variationSeed,
    });
    setSuggestions(list);

    // Sync draft with currently selected option index
    const safeIdx = Math.min(selectedSuggestionIndex, Math.max(0, list.length - 1));
    setReviewDraft(list[safeIdx] || list[0] || "");
  }, [currentRating, selectedTags, customExperience, variationSeed, businessName, city, selectedSuggestionIndex]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleCopy = () => {
    if (!reviewDraft) return;
    navigator.clipboard.writeText(reviewDraft).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  // Recreate 2-3 other unique reviews & stream from review writer API
  const handleRecreateReviews = async () => {
    setIsRotating(true);
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);

    try {
      const resp = await fetch("/api/review/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          category: pageConfig?.category || business.category || "local business",
          stars: currentRating,
          highlights: Array.from(selectedTags),
          note: customExperience,
          variation: nextSeed,
        }),
      });

      if (resp.ok && resp.body) {
        const providerHeader = resp.headers.get("X-Review-Provider") || "gemini";
        const labelHeader = resp.headers.get("X-Review-Label") || "Google Gemini";
        const modelHeader = resp.headers.get("X-Review-Model") || "gemini-3.5-flash-lite";
        const sourceHeader = resp.headers.get("X-Review-Source") || "cloud_llm";

        setActiveAiEngine({
          provider: providerHeader,
          label: labelHeader,
          model: modelHeader,
          source: sourceHeader,
        });

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let streamedText = "";
        let isFirstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (isFirstChunk) {
            streamedText = chunk;
            isFirstChunk = false;
          } else {
            streamedText += chunk;
          }
          setReviewDraft(streamedText);
        }
      }
    } catch {
      // Local synthesizer will have already populated the draft smoothly
    } finally {
      setTimeout(() => setIsRotating(false), 450);
    }
  };

  const handlePostReview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!reviewDraft) return;

    // 1. Copy draft from the box to clipboard
    navigator.clipboard.writeText(reviewDraft);
    setCopiedText(true);
    setRedirecting(true);

    // 2. Track click telemetry asynchronously
    if (!isPreview) {
      try {
        fetch("/api/hub/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_id: business.id,
            button_type: "google_review_post",
            source,
            rating: currentRating,
          }),
        }).catch(() => { });
      } catch { }
    }

    // 3. Open the destination link to paste
    setTimeout(() => {
      window.open(finalGoogleLink, "_blank", "noopener,noreferrer");
      setRedirecting(false);
    }, 600);
  };

  const ratingMeta = REVIEW_RATING_METAS[currentRating] || REVIEW_RATING_METAS[5];

  // Back URL to Business Page
  const targetProfileSlug = (tagCode || business.slug || "zentap").toLowerCase();
  const backToProfileUrl = `/r/${targetProfileSlug}${isPreview ? "?preview=1" : ""}${tagCode && tagCode.toLowerCase() !== targetProfileSlug ? `${isPreview ? "&" : "?"}via=${tagCode}` : ""}`;

  return (
    <div className={`${themeClasses.wrapper} font-sans min-h-screen selection:bg-amber-500 selection:text-black transition-colors duration-300`}>
      <main className="w-full min-h-screen pt-4 pb-12">
        <div className="flex flex-col w-full relative">
          {/* Subtle Ambient Glow Orbs */}
          <div className="relative w-full max-w-[480px] mx-auto px-4 pb-8 flex flex-col gap-5">
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 ${themeClasses.glow1} rounded-full blur-[90px] pointer-events-none -z-10 animate-pulse`} />
            <div className={`absolute top-96 -left-12 w-48 h-48 ${themeClasses.glow2} rounded-full blur-[80px] pointer-events-none -z-10`} />

            {/* Navigation Breadcrumb / Smart Review Assistant Header */}
            <div className="pt-2 flex items-center justify-between">
              {allowBusinessPageAccess ? (
                <a
                  href={backToProfileUrl}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${themeClasses.accentText} hover:opacity-80 transition-opacity group cursor-pointer`}
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span>Back to Business Profile</span>
                </a>
              ) : (
                <div />
              )}
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${themeClasses.inner} px-3 py-1 rounded-full border ${themeClasses.innerBorder} shadow-xs`}>
                <Sparkles className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                <span>Smart Review Assistant</span>
              </span>
            </div>

            {/* Page Context Header */}
            <div className="flex flex-col gap-1">
              <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${themeClasses.accentText} uppercase tracking-wider`}>
                Verified Client Feedback
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Rate Your Experience
              </h1>
              <p className="text-xs opacity-75 leading-relaxed">
                Your feedback empowers others to discover {businessName} and helps our team maintain 5-star quality.
              </p>
            </div>

            {/* Review Rating Builder Card (Glassmorphic) */}
            <div className={`rounded-2xl ${themeClasses.card} shadow-2xl backdrop-blur-xl p-5 flex flex-col gap-5 relative overflow-hidden border`}>
              {/* Glow Accent Line at top */}
              <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent ${themeClasses.accentLine} to-transparent opacity-75`} />

              {/* Star Rating Section */}
              <div className={`flex flex-col items-center justify-center gap-2 py-3 ${themeClasses.inner} rounded-xl border ${themeClasses.innerBorder}`}>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">
                  Tap a star to score
                </span>
                <div aria-label="Rating" className="flex items-center justify-center gap-2.5" role="radiogroup">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= currentRating;
                    return (
                      <button
                        key={starVal}
                        aria-label={`${starVal} stars`}
                        onClick={() => setCurrentRating(starVal)}
                        className="transition-all duration-200 transform hover:scale-115 active:scale-95 focus:outline-none p-1 cursor-pointer"
                        type="button"
                      >
                        <Star
                          className={`w-9 h-9 transition-all ${isFilled
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]"
                              : "text-zinc-600 hover:text-zinc-500"
                            }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-base font-semibold flex items-center gap-1.5 transition-all">
                  <span>{ratingMeta.label}</span>
                  <span className={`${themeClasses.accentText} font-bold`}>{ratingMeta.desc}</span>
                </div>
              </div>

              {/* Private Resolution Notice for 1-2 stars (Google Anti-Gating Policy Compliant) */}
              {currentRating <= 2 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">We want to make this right!</p>
                    <p className="text-[11px] opacity-75 leading-normal">
                      Would you prefer sharing private feedback with our management team first so we can resolve your concern immediately?
                    </p>
                    <a
                      href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${businessName} Management, I had an unsatisfactory visit regarding my recent experience.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 mt-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat directly on WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* What Stood Out / Categories & Aspects */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold flex items-center gap-1.5">
                    <Tag className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                    <span>What stood out?</span>
                    <span className="opacity-60 font-normal text-[11px]">(Tap 1 or more)</span>
                  </label>
                  <span className={`text-[10px] font-bold ${themeClasses.accentText} bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/20`}>
                    {selectedTags.size} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allTags.map((tag) => {
                    const isSelected = selectedTags.has(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        type="button"
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 cursor-pointer active:scale-95 ${isSelected
                            ? themeClasses.chipActive
                            : themeClasses.chipInactive
                          }`}
                      >
                        {isSelected && <Check className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Experience Custom Text Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold flex items-center gap-1.5">
                    <ShoppingBag className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                    <span>Write about your experience in short</span>
                    <span className="text-[10px] font-normal opacity-60">(Optional)</span>
                  </label>
                  {customExperience && (
                    <button
                      type="button"
                      onClick={() => setCustomExperience("")}
                      className={`text-[10px] font-semibold ${themeClasses.accentText} hover:opacity-80 transition-colors cursor-pointer`}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customExperience}
                    onChange={(e) => setCustomExperience(e.target.value)}
                    placeholder="e.g., bought purse nice, bought 2 pairs of clothes, unique design nice staff"
                    className={`w-full ${themeClasses.inner} rounded-xl px-3.5 py-2.5 text-base sm:text-xs placeholder:opacity-40 border ${themeClasses.innerBorder} focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner`}
                  />
                </div>
                <p className="text-[10.5px] opacity-60 leading-tight">
                  Type what you bought, ordered, or experienced — review suggestions will instantly adapt!
                </p>
              </div>

              {/* 2-3 Unique Humanized Review Suggestions displayed HORIZONTALLY */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                    <span>Review Suggestions</span>
                    <span className="opacity-60 font-normal text-[11px]">(Swipe &amp; tap to choose)</span>
                  </span>
                  <span className={`text-[10.5px] ${themeClasses.accentText} font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activeAiEngine.label}</span>
                  </span>
                </div>

                {/* Horizontal Scrolling Review Cards */}
                <div className="flex flex-row gap-2.5 overflow-x-auto pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory">
                  {suggestions.map((sug, idx) => {
                    const isSelected = selectedSuggestionIndex === idx;
                    const labels = [
                      "Experience Focus",
                      "Hospitality Focus",
                      "Recommendation Focus",
                      "Quality Focus",
                    ];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedSuggestionIndex(idx);
                          setReviewDraft(sug);
                        }}
                        className={`min-w-[250px] max-w-[280px] flex-1 shrink-0 snap-start p-3.5 rounded-xl text-left text-xs transition-all duration-200 border cursor-pointer relative flex flex-col justify-between active:scale-[0.978] ${isSelected
                            ? `${themeClasses.chipActive} ring-1 ring-amber-500/50 shadow-md`
                            : `${themeClasses.inner} border-white/5 opacity-80 hover:opacity-100 hover:border-white/15`
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.accentText} flex items-center gap-1`}>
                              <span>Option {idx + 1}</span>
                              <span className="opacity-60 font-normal">• {labels[idx] || "Variation"}</span>
                            </span>
                            <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full transition-all ${isSelected ? "bg-amber-500 text-slate-950 font-bold" : "bg-white/10 opacity-75"
                              }`}>
                              {isSelected ? "Active" : "Tap to use"}
                            </span>
                          </div>
                          <p className="line-clamp-4 leading-relaxed text-[11.5px]">
                            {sug}
                          </p>
                        </div>
                        <div className="pt-2.5 flex items-center justify-between text-[10px] opacity-50 border-t border-white/5 mt-2">
                          <span>{isSelected ? "Shown in box below" : "Tap to load into box"}</span>
                          {isSelected && <Check className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Review Shown in the Box (Editable) */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Edit3 className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                    <span>Selected Review Draft</span>
                  </span>
                  <button
                    onClick={handleCopy}
                    type="button"
                    className={`text-[11px] font-semibold ${themeClasses.accentText} hover:opacity-80 flex items-center gap-1 transition-colors cursor-pointer`}
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy text</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <textarea
                    value={reviewDraft}
                    onChange={(e) => setReviewDraft(e.target.value)}
                    rows={4}
                    placeholder="Select an option above or type your customized review here..."
                    className={`w-full ${themeClasses.inner} rounded-xl p-3 text-base sm:text-xs leading-relaxed border ${themeClasses.innerBorder} focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-colors resize-none`}
                  />
                  <div className="absolute bottom-2.5 right-3 flex items-center gap-1 opacity-40 text-[10px] pointer-events-none">
                    <Edit3 className="w-3 h-3" />
                    <span>Editable</span>
                  </div>
                </div>

                {/* Active AI Model Badge Indicator */}
                <div className="flex items-center justify-between px-1 text-[11px] pt-1">
                  <span className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>
                      Generated with <strong className="font-semibold text-amber-300">{activeAiEngine.label}</strong>{" "}
                      <span className="text-[10px] text-amber-400/80 font-mono">({activeAiEngine.model})</span>
                    </span>
                  </span>
                  <span className="text-[10px] text-zinc-400">Editable draft</span>
                </div>
              </div>

              {/* Two Buttons Below the Review Box */}
              <div className="flex flex-col gap-2.5 pt-1">
                {/* Button 1: To change the reviews (recreates 2-3 other unique reviews) */}
                <button
                  onClick={handleRecreateReviews}
                  type="button"
                  className={`tactile-btn w-full h-11 rounded-xl ${themeClasses.inner} border ${themeClasses.innerBorder} font-semibold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.978] transition-all cursor-pointer shadow-xs`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${themeClasses.accentText} ${isRotating ? "animate-spin" : ""}`} />
                  <span>Change Reviews (Generate New Ideas)</span>
                </button>

                {/* Button 2: Post the review on Google (copies text from box and opens destination to paste) */}
                <button
                  onClick={handlePostReview}
                  type="button"
                  className={`tactile-btn w-full h-12 rounded-xl bg-gradient-to-r ${themeClasses.btnGradient} font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_24px_-2px_rgba(245,158,11,0.35)] hover:shadow-[0_0_32px_rgba(245,158,11,0.5)] active:scale-[0.978] transition-all cursor-pointer`}
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>
                    {redirecting ? "Copied! Opening Google Reviews..." : "Post the Review on Google Page"}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950/70" />
                </button>
              </div>

              {/* Quick Feedback Perks / Micro Trust Indicators */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className={`${themeClasses.card} rounded-xl p-3 flex items-start gap-2.5 border`}>
                  <div className={`w-7 h-7 rounded-lg ${themeClasses.inner} flex items-center justify-center ${themeClasses.accentText} shrink-0`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">15 Seconds</span>
                    <span className="text-[10px] opacity-60 truncate">Quick tap workflow</span>
                  </div>
                </div>
                <div className={`${themeClasses.card} rounded-xl p-3 flex items-start gap-2.5 border`}>
                  <div className={`w-7 h-7 rounded-lg ${themeClasses.inner} flex items-center justify-center text-emerald-400 shrink-0`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold">100% Genuine</span>
                    <span className="text-[10px] opacity-60 truncate">Direct Google Maps link</span>
                  </div>
                </div>
              </div>

              {/* Business Context Banner with Photo & WhatsApp Assistance */}
              <div className={`rounded-xl ${themeClasses.inner} overflow-hidden flex flex-col border ${themeClasses.innerBorder} mt-1`}>
                <div
                  className="relative h-28 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${locationImg}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={logoUrl}
                        alt={businessName}
                        className="h-8 w-8 object-contain rounded-lg bg-black/40 p-0.5 border border-white/10"
                      />
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">
                        {businessName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3.5 flex flex-col gap-2">
                  <p className="text-[11px] opacity-75 leading-normal">
                    Need assistance or prefer private feedback instead of a public review? Chat with our support team directly.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${businessName} Team, I have feedback regarding my recent visit.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-lg bg-[#1B2232] hover:bg-[#262a33] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp Support</span>
                    </a>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="py-2 px-3 rounded-lg bg-[#1B2232] hover:bg-[#262a33] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                    >
                      <Phone className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                      <span>Call Us</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full ${themeClasses.footerBg} border-t border-white/5 py-6 transition-colors`}>
        <div className="max-w-[480px] mx-auto px-4 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs opacity-75">
            <ShieldCheck className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
            <span>Powered by ZenTap Digital Systems</span>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-60">
            <a href="/" className="hover:underline transition-colors">Business Portal</a>
            <span>•</span>
            <a href="/" className="hover:underline transition-colors">Privacy &amp; Terms</a>
          </div>
          <span className="text-[10px] opacity-40">© 2025 ZenTap Solutions. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
