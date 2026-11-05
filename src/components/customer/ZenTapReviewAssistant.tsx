"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BusinessRecord } from "@/lib/businessStore";
import { 
  generateReviewDraft, 
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
  AlertTriangle
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
  const [currentLength, setCurrentLength] = useState<"short" | "medium" | "detailed">("medium");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set(["Cleanliness", "Excellent Quality", "Fast Service"])
  );
  const [reviewDraft, setReviewDraft] = useState<string>("");
  const [copiedText, setCopiedText] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const businessName = pageConfig?.title || business.name || "ZenTap Digital Solutions";
  const city = business.city || "Ahmedabad";
  const cleanPhone = (pageConfig?.phone || business.phone || "+919274560880").replace(/\s+/g, "");
  const cleanWa = (pageConfig?.whatsapp || business.whatsapp || "919274560880").replace(/\D/g, "");
  const logoUrl = pageConfig?.logo_url || business.logo_url || "/logo.png";
  const locationImg = pageConfig?.location_image || business.location_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBn_TEaXs-VF4rFe0stnQgCYg0MynH2oOZeU9dQHGHuoFh5E1v447bVapRPDHEz1ipdX4vPRxNVokhF77GwXNQOBUmj2bF9oe3C9v4c8fmxU_3FFVdsBS5kiipfsNb3M4Va0GalihDkxwsGJYQ1UAhu0dnfybRD-0AXXNrCoLX5185-7q2BnTbJiEPNztNk2SqgMiYh9fYG9ajLfLogd4E4g_d8_f6s0AfohHb_Em7G";

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

  // Combine default tags with custom tags from config if present
  const allTags = useMemo(() => {
    const customList = Array.isArray(pageConfig?.tags) 
      ? pageConfig.tags 
      : typeof pageConfig?.tags === "string" 
      ? pageConfig.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
    const combined = Array.from(new Set([...customList, ...DEFAULT_REVIEW_TAGS]));
    return combined;
  }, [pageConfig?.tags]);

  // Generate dynamic draft using isolated reviewService
  useEffect(() => {
    const text = generateReviewDraft({
      businessName,
      city,
      rating: currentRating,
      length: currentLength,
      selectedTags: Array.from(selectedTags),
    });
    setReviewDraft(text);
  }, [currentRating, currentLength, selectedTags, businessName, city]);

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

  const handlePostReview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!reviewDraft) return;

    // 1. Copy draft to clipboard
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
        }).catch(() => {});
      } catch {}
    }

    // 3. Redirect to the Link of Tag ID / Google Review Link
    setTimeout(() => {
      window.open(finalGoogleLink, "_blank", "noopener,noreferrer");
      setRedirecting(false);
    }, 700);
  };

  const ratingMeta = REVIEW_RATING_METAS[currentRating] || REVIEW_RATING_METAS[5];

  // Back URL to Business Page
  const backToProfileUrl = `/r/${business.slug}${isPreview ? "?preview=1" : ""}${tagCode ? `${isPreview ? "&" : "?"}via=${tagCode}` : ""}`;

  return (
    <div className="bg-[#0B0F17] font-sans text-slate-100 min-h-screen selection:bg-amber-500 selection:text-black">
      <main className="w-full min-h-screen pt-4 pb-12">
        <div className="flex flex-col w-full relative">
          {/* Subtle Ambient Glow Orbs */}
          <div className="relative w-full max-w-[480px] mx-auto px-4 pb-8 flex flex-col gap-5">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none -z-10 animate-pulse" />
            <div className="absolute top-96 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

            {/* Navigation Breadcrumb / Smart Review Assistant Header */}
            <div className="pt-2 flex items-center justify-between">
              {allowBusinessPageAccess ? (
                <a
                  href={backToProfileUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span>Back to Business Profile</span>
                </a>
              ) : (
                <div />
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-[#1B2232]/90 px-3 py-1 rounded-full border border-white/5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Smart Review Assistant</span>
              </span>
            </div>

            {/* Page Context Header */}
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Verified Client Feedback
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Rate Your Experience
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your feedback empowers others to discover {businessName} and helps our team maintain 5-star quality.
              </p>
            </div>

            {/* Review Rating Builder Card (Glassmorphic) */}
            <div className="rounded-2xl bg-[#121824]/90 shadow-2xl backdrop-blur-xl p-5 flex flex-col gap-5 relative overflow-hidden border border-white/8">
              {/* Glow Accent Line at top */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-75" />

              {/* Star Rating Section */}
              <div className="flex flex-col items-center justify-center gap-2 py-3 bg-[#181c24] rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                          className={`w-9 h-9 transition-all ${
                            isFilled
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]"
                              : "text-[#31353e] hover:text-slate-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-base font-semibold text-white flex items-center gap-1.5 transition-all">
                  <span>{ratingMeta.label}</span>
                  <span className="text-amber-400 font-bold">{ratingMeta.desc}</span>
                </div>
              </div>

              {/* Private Resolution Notice for 1-2 stars (Google Anti-Gating Policy Compliant) */}
              {currentRating <= 2 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-white">We want to make this right!</p>
                    <p className="text-[11px] text-slate-400 leading-normal">
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

              {/* Experience Tags */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white">
                    What stood out? <span className="text-slate-400 font-normal">(Tap 1 or more)</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/20">
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
                            ? "bg-amber-500/20 text-white border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                            : "bg-[#1B2232] text-slate-400 hover:text-white border border-white/5 hover:bg-[#262a33]"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Length Segmented Switch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white">Review Length</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#0a0e16] rounded-xl border border-white/5">
                  {(["short", "medium", "detailed"] as const).map((len) => {
                    const isActive = currentLength === len;
                    const label = len === "short" ? "Short (1–2)" : len === "medium" ? "Medium (3–4)" : "Detailed (5+)";
                    return (
                      <button
                        key={len}
                        onClick={() => setCurrentLength(len)}
                        type="button"
                        className={`py-1.5 px-1 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                          isActive
                            ? "bg-[#353942] text-white shadow-xs font-semibold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Review Preview Box */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Generated Review Draft
                  </span>
                  <button
                    onClick={handleCopy}
                    type="button"
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
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
                    className="w-full bg-[#1B2232] rounded-xl p-3 text-xs text-slate-100 leading-relaxed border border-white/5 focus:outline-none focus:bg-[#222836] focus:border-amber-500/40 transition-colors resize-none"
                  />
                  <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-slate-500 text-[10px] pointer-events-none">
                    <Edit3 className="w-3 h-3" />
                    <span>Editable</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                {/* Primary CTA: Post the Review on Google Page */}
                <button
                  onClick={handlePostReview}
                  type="button"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_24px_-2px_rgba(245,158,11,0.35)] hover:shadow-[0_0_32px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>
                    {redirecting ? "Copied! Opening Google Maps..." : "Post the Review on Google Page"}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950/70" />
                </button>
              </div>

              {/* Quick Feedback Perks / Micro Trust Indicators */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#121824] rounded-xl p-3 flex items-start gap-2.5 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#1B2232] flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white">15 Seconds</span>
                    <span className="text-[10px] text-slate-400 truncate">Quick tap workflow</span>
                  </div>
                </div>
                <div className="bg-[#121824] rounded-xl p-3 flex items-start gap-2.5 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#1B2232] flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white">100% Genuine</span>
                    <span className="text-[10px] text-slate-400 truncate">Direct Google Maps link</span>
                  </div>
                </div>
              </div>

              {/* Business Context Banner with Photo & WhatsApp Assistance */}
              <div className="rounded-xl bg-[#0e131d] overflow-hidden flex flex-col border border-white/5 mt-1">
                <div 
                  className="relative h-28 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${locationImg}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-[#0e131d]/60 to-transparent" />
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
                  <p className="text-[11px] text-slate-400 leading-normal">
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
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
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
      <footer className="w-full bg-[#0a0e16] border-t border-white/5 py-6">
        <div className="max-w-[480px] mx-auto px-4 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Powered by ZenTap Digital Systems</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <a href="/" className="hover:text-amber-400 transition-colors">Business Portal</a>
            <span>•</span>
            <a href="/" className="hover:text-amber-400 transition-colors">Privacy &amp; Terms</a>
          </div>
          <span className="text-[10px] text-slate-600">© 2025 ZenTap Solutions. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
