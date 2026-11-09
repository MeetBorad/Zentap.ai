"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BusinessRecord } from "@/lib/businessStore";
import {
  generateReviewSuggestions,
  REVIEW_RATING_METAS,
  DEFAULT_REVIEW_TAGS,
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
  Tag,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Globe,
} from "lucide-react";
import OwnerAccessModal from "@/components/modals/OwnerAccessModal";
import ExperienceNoteBox, { ExperienceNoteChangePayload } from "@/components/customer/ExperienceNoteBox";

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
  // Start with unforced rating (allow visitor to click any star freely)
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customExperience, setCustomExperience] = useState<string>("");
  const [currentLang, setCurrentLang] = useState<string>("en-IN"); // Default English
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
  const [reviewLength, setReviewLength] = useState<"short" | "medium" | "detailed">("short"); // Default short (1-3 sentences)
  const [reviewDraft, setReviewDraft] = useState<string>("");
  const [copiedText, setCopiedText] = useState(false);
  const [postNotice, setPostNotice] = useState<string | null>(null);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);

  const [liveBusiness, setLiveBusiness] = useState<BusinessRecord>(business);

  useEffect(() => {
    setLiveBusiness(business);
  }, [business]);

  // Real-time synchronization: listen to client or page editor updates from Owner Panel
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e?.detail) {
        const u = e.detail;
        setLiveBusiness((prev) => ({
          ...prev,
          name: u.name || prev.name,
          city: u.city || prev.city,
          category: u.category || prev.category,
          phone: u.phone || prev.phone,
          whatsapp: u.whatsapp_number || prev.whatsapp,
          whatsapp_number: u.whatsapp_number || prev.whatsapp_number,
          google_review_link: u.google_review_link || prev.google_review_link,
          review_url: u.google_review_link || prev.review_url,
          instagram: u.instagram_url || prev.instagram,
          facebook: u.facebook_url || prev.facebook,
          website: u.website || prev.website,
          address: u.address || prev.address,
        }));
      }
    };

    window.addEventListener("zentap_client_updated", handleUpdate);
    window.addEventListener("zentap_page_editor_updated", handleUpdate);
    return () => {
      window.removeEventListener("zentap_client_updated", handleUpdate);
      window.removeEventListener("zentap_page_editor_updated", handleUpdate);
    };
  }, []);

  // Consistent business details from database/client record
  const businessName = liveBusiness.name || pageConfig?.title || "ZenTap Digital Solutions";
  const city = liveBusiness.city || "Ahmedabad";
  const cleanPhone = (liveBusiness.phone || pageConfig?.phone || "+919274560880").replace(/\s+/g, "");
  const cleanWa = (liveBusiness.whatsapp || liveBusiness.whatsapp_number || pageConfig?.whatsapp || "919274560880").replace(/\D/g, "");
  const logoUrl = pageConfig?.logo_url || liveBusiness.logo_url || "/logo.png";
  const locationImg = pageConfig?.location_image || liveBusiness.location_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBn_TEaXs-VF4rFe0stnQgCYg0MynH2oOZeU9dQHGHuoFh5E1v447bVapRPDHEz1ipdX4vPRxNVokhF77GwXNQOBUmj2bF9oe3C9v4c8fmxU_3FFVdsBS5kiipfsNb3M4Va0GalihDkxwsGJYQ1UAhu0dnfybRD-0AXXNrCoLX5185-7q2BnTbJiEPNztNk2SqgMiYh9fYG9ajLfLogd4E4g_d8_f6s0AfohHb_Em7G";

  // Sanitize tagCode and slug to avoid stray character bugs (e.g. '|' or '%7C')
  const cleanTagCode = (tagCode || "").replace(/[|%#?&\s/]+$/g, "").trim();
  const cleanBusinessSlug = (liveBusiness.slug || "").replace(/[|%#?&\s/]+$/g, "").trim();

  // Active theme styling mapped from pageConfig
  const activeTheme = pageConfig?.theme || "obsidian";

  const themeClasses = useMemo(() => {
    switch (activeTheme) {
      case "emerald_luxury":
        return {
          wrapper: "bg-[#06140f] text-emerald-100",
          card: "bg-[#0c221a]/95 border-emerald-500/25",
          inner: "bg-[#133226]",
          innerBorder: "border-emerald-500/15",
          accentLine: "via-emerald-400",
          accentText: "text-emerald-400",
          glow1: "bg-emerald-500/15",
          glow2: "bg-teal-500/10",
          chipActive: "bg-emerald-500/20 text-white border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
          chipInactive: "bg-[#133226] text-slate-300 hover:text-white border-white/5",
          btnGradient: "from-emerald-500 via-teal-400 to-emerald-600 text-slate-950",
          footerBg: "bg-[#040e0b]",
        };
      case "midnight_sapphire":
        return {
          wrapper: "bg-[#050b17] text-blue-100",
          card: "bg-[#0a152d]/95 border-blue-500/25",
          inner: "bg-[#102044]",
          innerBorder: "border-blue-500/15",
          accentLine: "via-blue-400",
          accentText: "text-blue-400",
          glow1: "bg-blue-500/15",
          glow2: "bg-indigo-500/10",
          chipActive: "bg-blue-500/20 text-white border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]",
          chipInactive: "bg-[#102044] text-slate-300 hover:text-white border-white/5",
          btnGradient: "from-blue-500 via-sky-400 to-blue-600 text-slate-950",
          footerBg: "bg-[#03070f]",
        };
      case "modern_slate":
        return {
          wrapper: "bg-[#f8fafc] text-slate-900",
          card: "bg-white/95 border-slate-300 shadow-xl text-slate-900",
          inner: "bg-slate-100 text-slate-900",
          innerBorder: "border-slate-200",
          accentLine: "via-amber-500",
          accentText: "text-amber-600",
          glow1: "bg-amber-500/5",
          glow2: "bg-slate-400/10",
          chipActive: "bg-amber-500/20 text-amber-900 border-amber-500/50 font-bold shadow-sm",
          chipInactive: "bg-slate-200 text-slate-700 hover:text-slate-950 border-slate-300",
          btnGradient: "from-amber-500 via-amber-400 to-amber-500 text-slate-950",
          footerBg: "bg-slate-100",
        };
      case "royal_indigo":
        return {
          wrapper: "bg-[#0c0f24] text-indigo-100",
          card: "bg-[#151b3b]/95 border-indigo-500/20",
          inner: "bg-[#1f2756]",
          innerBorder: "border-indigo-500/10",
          accentLine: "via-indigo-400",
          accentText: "text-indigo-400",
          glow1: "bg-indigo-500/10",
          glow2: "bg-purple-500/10",
          chipActive: "bg-indigo-500/20 text-white border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.25)]",
          chipInactive: "bg-[#1f2756] text-slate-300 hover:text-white border-white/5",
          btnGradient: "from-indigo-500 via-purple-500 to-indigo-600 text-white",
          footerBg: "bg-[#080a18]",
        };
      case "rose_gold":
        return {
          wrapper: "bg-[#1a0b16] text-pink-100",
          card: "bg-[#2a1223]/95 border-pink-500/20",
          inner: "bg-[#401a35]",
          innerBorder: "border-pink-500/10",
          accentLine: "via-rose-400",
          accentText: "text-rose-400",
          glow1: "bg-rose-500/10",
          glow2: "bg-pink-500/10",
          chipActive: "bg-rose-500/20 text-white border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
          chipInactive: "bg-[#401a35] text-slate-300 hover:text-white border-white/5",
          btnGradient: "from-rose-500 via-pink-500 to-rose-600 text-white",
          footerBg: "bg-[#11050e]",
        };
      case "champagne_gold":
        return {
          wrapper: "bg-[#12100b] text-yellow-100",
          card: "bg-[#1f1c14]/95 border-amber-400/25",
          inner: "bg-[#2f2a1e]",
          innerBorder: "border-amber-400/15",
          accentLine: "via-amber-400",
          accentText: "text-amber-400",
          glow1: "bg-amber-400/15",
          glow2: "bg-yellow-500/10",
          chipActive: "bg-amber-400/20 text-white border-amber-400/50 shadow-[0_0_12px_rgba(234,179,8,0.25)]",
          chipInactive: "bg-[#2f2a1e] text-slate-300 hover:text-white border-white/5",
          btnGradient: "from-amber-500 via-yellow-400 to-amber-600 text-slate-950",
          footerBg: "bg-[#0b0a06]",
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
      (liveBusiness.slug || "").toLowerCase() === "zentap" ||
      cleanTagCode.toLowerCase() === "zentap" ||
      liveBusiness.id === "sample-demo-biz-01";

    if (isZenTapSample) {
      return "https://g.page/r/CdJX2OGu1yhoEAI/review";
    }

    let link = (googleReviewUrl || pageConfig?.google_link || liveBusiness.google_review_link || liveBusiness.review_url || "").trim();
    if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
      link = `https://${link}`;
    }
    return link || "https://g.page/r/CdJX2OGu1yhoEAI/review";
  }, [googleReviewUrl, pageConfig?.google_link, liveBusiness.google_review_link, liveBusiness.review_url, liveBusiness.slug, liveBusiness.id, cleanTagCode]);

  // Read categories & tags directly from editor config
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

    const bizCat = typeof liveBusiness?.category === "string"
      ? liveBusiness.category.split(/[•|,]/).map((s: string) => s.trim()).filter(Boolean)
      : [];

    const bizChips = Array.isArray((liveBusiness as any)?.custom_chips)
      ? (liveBusiness as any).custom_chips
      : [];

    const subtitleCategories = pageConfig?.subtitle
      ? String(pageConfig.subtitle)
        .split(/[•|,]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s && !s.toLowerCase().includes("welcome") && !s.toLowerCase().includes("official digital hub"))
      : [];

    const userDefined = Array.from(new Set([...customCats, ...customTags, ...singleCat, ...subtitleCategories, ...bizCat, ...bizChips])).filter(Boolean);

    if (userDefined.length > 0) {
      return userDefined;
    }

    return Array.from(DEFAULT_REVIEW_TAGS);
  }, [pageConfig?.tags, pageConfig?.categories, pageConfig?.category, pageConfig?.subtitle, liveBusiness?.category, (liveBusiness as any)?.custom_chips]);

  // Has user provided a chip or written notes?
  const hasUserInput = selectedTags.size > 0 || customExperience.trim().length > 0;
  const shouldShowReviews = hasUserInput || hasGenerated;

  // Request 3 distinct suggestions from /api/suggest
  const fetchAiSuggestions = useCallback(
    async (override?: {
      stars?: number;
      chips?: string[];
      note?: string;
      lang?: string;
      len?: "short" | "medium" | "detailed";
    }) => {
      const effStars = override?.stars !== undefined ? override.stars : (currentRating > 0 ? currentRating : 5);
      const effChips = override?.chips !== undefined ? override.chips : Array.from(selectedTags);
      const effNote = override?.note !== undefined ? override.note : customExperience;
      const effLang = override?.lang !== undefined ? override.lang : currentLang;
      const effLen = override?.len !== undefined ? override.len : reviewLength;

      if (effChips.length === 0 && !effNote.trim()) {
        setSuggestions([]);
        setReviewDraft("");
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: cleanBusinessSlug || cleanTagCode || "zentap",
            stars: effStars,
            selectedChips: effChips,
            noteText: effNote,
            language: effLang,
            length: effLen,
          }),
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data.drafts) && data.drafts.length > 0) {
          setSuggestions(data.drafts);
          setHasGenerated(true);
          const safeIdx = Math.min(selectedSuggestionIndex, data.drafts.length - 1);
          setReviewDraft(data.drafts[safeIdx] || data.drafts[0]);
        } else {
          // Fallback to local synthesizer
          const localList = generateReviewSuggestions({
            businessName,
            city,
            rating: effStars,
            length: effLen,
            selectedTags: effChips,
            customNotes: effNote,
          });
          setSuggestions(localList);
          setHasGenerated(true);
          setReviewDraft(localList[0] || "");
        }
      } catch {
        const localList = generateReviewSuggestions({
          businessName,
          city,
          rating: effStars,
          length: effLen,
          selectedTags: effChips,
          customNotes: effNote,
        });
        setSuggestions(localList);
        setHasGenerated(true);
        setReviewDraft(localList[0] || "");
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [cleanBusinessSlug, cleanTagCode, currentRating, selectedTags, customExperience, currentLang, reviewLength, selectedSuggestionIndex, businessName, city]
  );

  // Trigger when chip is clicked
  const toggleTag = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setSelectedTags(next);

    if (next.size > 0 || customExperience.trim().length > 0) {
      fetchAiSuggestions({ chips: Array.from(next) });
    } else {
      setSuggestions([]);
      setReviewDraft("");
    }
  };

  // Trigger when note changes from typing, speech, or translation
  const handleNoteChange = (payload: ExperienceNoteChangePayload) => {
    setCustomExperience(payload.text);
    setCurrentLang(payload.lang);
    if (selectedTags.size > 0 || payload.text.trim().length > 0) {
      fetchAiSuggestions({ note: payload.text, lang: payload.lang });
    } else {
      setSuggestions([]);
      setReviewDraft("");
    }
  };

  // Trigger when rating star changes
  const handleRatingSelect = (starVal: number) => {
    setCurrentRating(starVal);
    if (selectedTags.size > 0 || customExperience.trim().length > 0) {
      fetchAiSuggestions({ stars: starVal });
    }
  };

  // Trigger when length button is clicked
  const handleLengthChange = (newLen: "short" | "medium" | "detailed") => {
    setReviewLength(newLen);
    if (selectedTags.size > 0 || customExperience.trim().length > 0) {
      fetchAiSuggestions({ len: newLen });
    }
  };

  // Trigger when language button is clicked (English default, Hindi Hinglish, Gujarati Gujlish)
  const handleLanguageSelect = (newLang: string) => {
    setCurrentLang(newLang);
    if (selectedTags.size > 0 || customExperience.trim().length > 0) {
      fetchAiSuggestions({ lang: newLang });
    }
  };

  // Regenerate button
  const handleRegenerate = async () => {
    setIsRotating(true);
    await fetchAiSuggestions({});
    setTimeout(() => setIsRotating(false), 450);
  };

  // Copy helper
  const handleCopy = () => {
    if (!reviewDraft) return;
    navigator.clipboard.writeText(reviewDraft);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Part F: Post Button
  const handlePostReview = (e: React.MouseEvent) => {
    e.preventDefault();
    let textToPost = reviewDraft.trim();
    if (!textToPost) {
      textToPost = `Had a wonderful experience with ${businessName} in ${city}! Excellent service and highly recommended.`;
      setReviewDraft(textToPost);
    }

    // 1. Copy draft to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToPost).catch(() => {});
    }

    // 2. Show clear "Copied. Paste it on the next screen" message
    setPostNotice("Copied. Paste it on the next screen");

    // 3. Track click telemetry asynchronously
    if (!isPreview) {
      try {
        fetch("/api/hub/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_id: liveBusiness.id,
            button_type: "google_review_post",
            source,
            rating: currentRating || 5,
          }),
        }).catch(() => {});
      } catch {}
    }

    // 4. Open destination in new tab (never auto-post)
    setTimeout(() => {
      window.open(finalGoogleLink, "_blank", "noopener,noreferrer");
      setTimeout(() => setPostNotice(null), 5000);
    }, 450);
  };

  const ratingMeta = REVIEW_RATING_METAS[currentRating > 0 ? currentRating : 5] || REVIEW_RATING_METAS[5];

  // Typography
  const fontFamilies: Record<string, string> = {
    Outfit: "'Outfit', sans-serif",
    Inter: "'Inter', sans-serif",
    "Plus Jakarta Sans": "'Plus Jakarta Sans', sans-serif",
    Poppins: "'Poppins', sans-serif",
    "Playfair Display": "'Playfair Display', Georgia, serif",
    "Space Grotesk": "'Space Grotesk', sans-serif",
  };
  const activeFontFamily = fontFamilies[pageConfig?.font || "Outfit"] || "'Outfit', sans-serif";

  // Back URL to Business Profile (guaranteed clean, no trailing pipes or encoded characters)
  const targetProfileSlug = (cleanTagCode || cleanBusinessSlug || "zentap").toLowerCase();
  const backToProfileUrl = `/r/${targetProfileSlug}${isPreview ? "?preview=1" : ""}${cleanTagCode && cleanTagCode.toLowerCase() !== targetProfileSlug ? `${isPreview ? "&" : "?"}via=${cleanTagCode}` : ""}`;

  return (
    <div
      className={`${themeClasses.wrapper} min-h-screen selection:bg-amber-500 selection:text-black transition-colors duration-300`}
      style={{ fontFamily: activeFontFamily }}
    >
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

            {/* Part G: Page Context Header (no 5-star push, clean and genuine) */}
            <div className="flex flex-col gap-1">
              <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${themeClasses.accentText} uppercase tracking-wider`}>
                Verified Client Touchpoint
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Share your experience on Google
              </h1>
              <p className="text-xs opacity-75 leading-relaxed">
                Your feedback empowers others to discover {businessName} and helps local customers make informed decisions.
              </p>
            </div>

            {/* Review Rating Builder Card (Glassmorphic) */}
            <div className={`rounded-2xl ${themeClasses.card} shadow-2xl backdrop-blur-xl p-5 flex flex-col gap-5 relative overflow-hidden border`}>
              {/* Glow Accent Line at top */}
              <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent ${themeClasses.accentLine} to-transparent opacity-75`} />

              {/* Star Rating Section: unforced, visitor can tap any rating */}
              <div className={`flex flex-col items-center justify-center gap-2 py-3 ${themeClasses.inner} rounded-xl border ${themeClasses.innerBorder}`}>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">
                  Tap a star to score
                </span>
                <div aria-label="Rating" className="flex items-center justify-center gap-2.5" role="radiogroup">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = currentRating > 0 && starVal <= currentRating;
                    return (
                      <button
                        key={starVal}
                        aria-label={`${starVal} stars`}
                        onClick={() => handleRatingSelect(starVal)}
                        className="transition-all duration-200 transform hover:scale-115 active:scale-95 focus:outline-none p-1 cursor-pointer"
                        type="button"
                      >
                        <Star
                          className={`w-9 h-9 transition-all ${
                            isFilled
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]"
                              : "text-zinc-600 hover:text-zinc-500"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-base font-semibold flex items-center gap-1.5 transition-all">
                  {currentRating > 0 ? (
                    <>
                      <span>{ratingMeta.label}</span>
                      <span className={`${themeClasses.accentText} font-bold`}>{ratingMeta.desc}</span>
                    </>
                  ) : (
                    <span className="text-xs opacity-50 font-normal">Choose a star rating above</span>
                  )}
                </div>
              </div>

              {/* Private Resolution Notice for 1-2 stars (Anti-Gating Compliant: public Google link is NEVER blocked) */}
              {currentRating > 0 && currentRating <= 2 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">We want to make this right!</p>
                    <p className="text-[11px] opacity-75 leading-normal">
                      Would you like to share private feedback with our management team on WhatsApp to resolve your concern immediately? (You may also proceed directly to Google review below.)
                    </p>
                    <a
                      href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${businessName} Management, I had feedback regarding my recent visit.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 mt-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat directly on WhatsApp (Private)</span>
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
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 cursor-pointer active:scale-95 ${
                          isSelected
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

              {/* Part C: Dedicated ExperienceNoteBox with Voice & Translation */}
              <ExperienceNoteBox
                initialText={customExperience}
                onNoteChange={handleNoteChange}
                accentTextClass={themeClasses.accentText}
                innerBgClass={themeClasses.inner}
                innerBorderClass={themeClasses.innerBorder}
                selectedLang={currentLang}
                onLanguageChange={handleLanguageSelect}
              />

              {/* Part E: 3 Unique Review Suggestions displayed HORIZONTALLY */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                    <span>Review Suggestions</span>
                    {shouldShowReviews && suggestions.length > 0 && (
                      <span className="opacity-60 font-normal text-[11px]">(Swipe &amp; tap to choose)</span>
                    )}
                  </span>
                  {hasUserInput && (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      disabled={isLoadingSuggestions}
                      className={`text-[10.5px] ${themeClasses.accentText} hover:opacity-80 flex items-center gap-1 font-semibold transition-opacity cursor-pointer`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isRotating || isLoadingSuggestions ? "animate-spin" : ""}`} />
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>

                {isLoadingSuggestions ? (
                  /* Loading State */
                  <div className={`p-4 rounded-xl ${themeClasses.inner} border ${themeClasses.innerBorder} flex items-center gap-3 py-4`}>
                    <RefreshCw className={`w-4 h-4 animate-spin ${themeClasses.accentText} shrink-0`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Crafting genuine review drafts...</span>
                      <span className="text-[10.5px] opacity-60">Synthesizing your highlights into 3 unique options</span>
                    </div>
                  </div>
                ) : shouldShowReviews && suggestions.length > 0 ? (
                  /* Horizontal Scrolling Review Cards */
                  <div className="flex flex-row gap-2.5 overflow-x-auto pb-2 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory">
                    {suggestions.map((sug, idx) => {
                      const isSelected = selectedSuggestionIndex === idx;
                      const labels = [
                        "Experience Focus",
                        "Hospitality Focus",
                        "Recommendation Focus",
                      ];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedSuggestionIndex(idx);
                            setReviewDraft(sug);
                          }}
                          className={`min-w-[240px] max-w-[270px] flex-1 shrink-0 snap-start p-3 rounded-xl text-left text-xs transition-all duration-200 border cursor-pointer relative flex flex-col justify-between active:scale-[0.978] ${
                            isSelected
                              ? `${themeClasses.chipActive} ring-1 ring-amber-500/50 shadow-md`
                              : `${themeClasses.inner} border-white/5 opacity-80 hover:opacity-100 hover:border-white/15`
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${themeClasses.accentText} flex items-center gap-1`}>
                                <span>Option {idx + 1}</span>
                                <span className="opacity-60 font-normal">• {labels[idx] || "Draft"}</span>
                              </span>
                              <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                                isSelected ? "bg-amber-500 text-slate-950 font-bold" : "bg-white/10 opacity-75"
                              }`}>
                                {isSelected ? "Active" : "Use"}
                              </span>
                            </div>
                            <p className="line-clamp-3 leading-relaxed text-[11px]">
                              {sug}
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-between text-[10px] opacity-50 border-t border-white/5 mt-2">
                            <span>{isSelected ? "Loaded in draft box" : "Tap to select"}</span>
                            {isSelected && <Check className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Waiting state card: Pick a highlight or write a few words first */
                  <div className={`p-3.5 rounded-xl ${themeClasses.inner} border ${themeClasses.innerBorder} flex items-center gap-3 py-3`}>
                    <div className={`w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center ${themeClasses.accentText} shrink-0`}>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold">Pick a highlight or write a few words first</span>
                      <span className="text-[11px] opacity-65 leading-snug">
                        Tap highlights above or type/speak your note. Review suggestions will generate automatically.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 5: Language selector (English, Hindi, Gujarati) */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center px-0.5">
                  <span className="text-[11px] font-semibold opacity-85 flex items-center gap-1.5">
                    <Globe className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                    <span>Review Language</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "en-IN", label: "English" },
                    { id: "hi-IN", label: "Hindi" },
                    { id: "gu-IN", label: "Gujarati" },
                  ].map((l) => {
                    const isSelected = currentLang === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleLanguageSelect(l.id)}
                        className={`tactile-btn py-2.5 px-2 rounded-xl text-center border cursor-pointer transition-all duration-150 active:scale-[0.978] ${
                          isSelected
                            ? `${themeClasses.chipActive} ring-1 ring-amber-500/50 shadow-xs font-bold`
                            : `${themeClasses.inner} border-white/5 opacity-70 hover:opacity-100 hover:border-white/15`
                        }`}
                      >
                        <div className="text-xs font-semibold leading-tight">{l.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 6: Selected Review Shown in the Box (Editable) */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Edit3 className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                    <span>Selected Review Draft</span>
                  </span>
                  {reviewDraft && (
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
                  )}
                </div>
                <div className="relative">
                  <textarea
                    value={reviewDraft}
                    onChange={(e) => setReviewDraft(e.target.value)}
                    rows={4}
                    placeholder={
                      shouldShowReviews
                        ? "Select an option above or type your customized review here..."
                        : "Your review draft will appear here once you pick what stood out above or write a note..."
                    }
                    className={`w-full ${themeClasses.inner} rounded-xl p-3 text-base sm:text-xs leading-relaxed border ${themeClasses.innerBorder} focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-colors resize-none`}
                  />
                  <div className="absolute bottom-2.5 right-3 flex items-center gap-1 opacity-40 text-[10px] pointer-events-none">
                    <Edit3 className="w-3 h-3" />
                    <span>Editable</span>
                  </div>
                </div>

                {/* Review Length Customizer (Short (1–3 sentences - Default) / Medium / Detailed) */}
                <div className="flex flex-col gap-1.5 pt-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-semibold opacity-85 flex items-center gap-1.5">
                      <Sliders className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
                      <span>Review Length</span>
                    </span>
                    <span className="text-[10px] opacity-60">
                      {reviewLength === "short"
                        ? "1–3 sentences • Quick (Default)"
                        : reviewLength === "detailed"
                        ? "Detailed • 5+ sentences"
                        : "3–4 sentences • Balanced"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "short", label: "Short", desc: "1–3 sentences" },
                      { id: "medium", label: "Medium", desc: "3–4 sentences" },
                      { id: "detailed", label: "Detailed", desc: "5+ sentences" },
                    ].map((opt) => {
                      const isSelected = reviewLength === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleLengthChange(opt.id as "short" | "medium" | "detailed")}
                          className={`tactile-btn py-2 px-2.5 rounded-xl text-center border cursor-pointer transition-all duration-150 active:scale-[0.978] ${
                            isSelected
                              ? `${themeClasses.chipActive} ring-1 ring-amber-500/50 shadow-xs font-bold`
                              : `${themeClasses.inner} border-white/5 opacity-70 hover:opacity-100 hover:border-white/15`
                          }`}
                        >
                          <div className="text-xs font-semibold leading-tight">{opt.label}</div>
                          <div className="text-[9.5px] opacity-60 mt-0.5">{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Part F: Post Status Toast Banner */}
              {postNotice && (
                <div
                  role="status"
                  aria-live="polite"
                  className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{postNotice}</span>
                </div>
              )}

              {/* Post the review on Google Button (Copies text from box and opens destination) */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handlePostReview}
                  type="button"
                  className={`tactile-btn w-full h-12 rounded-xl bg-gradient-to-r ${themeClasses.btnGradient} font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_24px_-2px_rgba(245,158,11,0.35)] hover:shadow-[0_0_32px_rgba(245,158,11,0.5)] active:scale-[0.978] transition-all cursor-pointer`}
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Post the Review on Google Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950/70" />
                </button>
              </div>

              {/* Micro Trust Indicators (Removed '100% Genuine' claim per Part G) */}
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
                    <span className="text-xs font-semibold">Direct Review</span>
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
                    Need assistance or prefer private feedback instead of a public review? Chat with our team directly.
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

      {/* Dynamic Footer with Current Year (Part G) */}
      <footer className={`w-full ${themeClasses.footerBg} border-t border-white/5 py-6 transition-colors`}>
        <div className="max-w-[480px] mx-auto px-4 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs opacity-75">
            <ShieldCheck className={`w-3.5 h-3.5 ${themeClasses.accentText}`} />
            <span>Powered by ZenTap Digital Systems</span>
          </div>
          <div className="flex flex-col items-center gap-1 pt-1">
            <button
              type="button"
              onClick={() => setOwnerModalOpen(true)}
              className={`text-xs font-semibold ${themeClasses.accentText} hover:underline transition-all cursor-pointer`}
            >
              Business owner? Manage this card
            </button>
            <div className="flex items-center gap-3 text-[11px] opacity-60">
              <button
                type="button"
                onClick={() => setOwnerModalOpen(true)}
                className="hover:underline transition-colors cursor-pointer"
              >
                Log In to Business Portal
              </button>
              <span>•</span>
              <a href="/privacy" className="hover:underline transition-colors">Privacy &amp; Terms</a>
            </div>
          </div>
          <span className="text-[10px] opacity-40">
            © {new Date().getFullYear()} ZenTap Solutions. All rights reserved.
          </span>
        </div>
      </footer>

      {/* Business Owner Access Modal */}
      {ownerModalOpen && (
        <OwnerAccessModal
          isOpen={ownerModalOpen}
          onClose={() => setOwnerModalOpen(false)}
          tagCode={cleanTagCode || cleanBusinessSlug || "st3"}
          businessSlug={cleanBusinessSlug || cleanTagCode || "st3"}
          clientBusinessId={liveBusiness.id}
          initialBusinessName={businessName}
          onDetailsUpdated={(updated) => {
            if (updated) {
              setLiveBusiness((prev) => ({ ...prev, ...updated }));
            }
            if (typeof window !== "undefined") {
              setTimeout(() => {
                window.location.reload();
              }, 1200);
            }
          }}
        />
      )}
    </div>
  );
}
