/* Hallmark · macrostructure: Minimal Specimen · genre: modern-minimal · theme: tactile-obsidian */
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { 
  getBusinessBySlug, 
  logScan, 
  logEvent, 
  logFeedback, 
  SAMPLE_DEMO_BUSINESS, 
  BusinessRecord 
} from "@/lib/businessStore";
import { 
  fetchPublicBusinessBySlug, 
  recordDbScan, 
  recordDbFeedback 
} from "@/lib/supabase/service";
import { 
  Sparkles, 
  Radio, 
  Check, 
  RefreshCw, 
  MapPin, 
  MessageCircle, 
  Phone, 
  Share2, 
  AlertTriangle, 
  ShieldCheck, 
  Send,
  ExternalLink,
  Info
} from "lucide-react";

export default function CustomizedReviewAssistantPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "sample";
  const source = (searchParams?.get("s") as "qr" | "nfc") || "nfc";
  const isPreview = searchParams?.get("preview") === "1";
  const isPendingAlert = searchParams?.get("pending") === "1";

  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRating, setCurrentRating] = useState<number>(5);
  const [currentLang, setCurrentLang] = useState<"en" | "gu" | "hi">("en");
  const [currentStyle, setCurrentStyle] = useState<"balanced" | "detailed" | "concise">("balanced");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [reviewDraft, setReviewDraft] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Private feedback states (Available as additional option for 1-2 stars)
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [fbName, setFbName] = useState("");
  const [fbPhone, setFbPhone] = useState("");
  const [fbText, setFbText] = useState("");
  const [fbSubmitted, setFbSubmitted] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      // 1. Check local/demo store first for instant render
      let biz = getBusinessBySlug(slug) || (slug === "sample" ? SAMPLE_DEMO_BUSINESS : null);

      // 2. Query Supabase public view if not in demo mode
      if (!biz || slug !== "sample") {
        const dbBiz = await fetchPublicBusinessBySlug(slug);
        if (dbBiz) {
          biz = {
            id: dbBiz.id,
            owner_user_id: "",
            name: dbBiz.name,
            email: "",
            phone: "",
            city: dbBiz.city || "",
            state: "",
            country: "India",
            pincode: "",
            gbp_link: "",
            slug: dbBiz.slug,
            plan: "standee_1500",
            payment_status: "paid",
            review_url: dbBiz.review_url,
            active: dbBiz.active,
            address: dbBiz.address || "",
            category: dbBiz.category || "",
            created_at: new Date().toISOString(),
          };
        }
      }

      setBusiness(biz);
      setLoading(false);

      if (biz && biz.active && !isPreview) {
        logScan(slug, source, isPreview);
        const visitorHash = typeof window !== "undefined" 
          ? btoa((navigator.userAgent.slice(0, 30) || "user") + (window.screen?.width || 360)).slice(0, 16)
          : "visitor";
        recordDbScan(biz.id, source, visitorHash, isPreview);
      }

      if (biz) {
        // Default chips
        if (biz.category?.toLowerCase().includes("jewel") || biz.category?.toLowerCase().includes("gold")) {
          setSelectedChips(["22K Hallmark Gold", "Bridal Collection", "Fair Making Charges"]);
        } else if (biz.category?.toLowerCase().includes("cafe") || biz.category?.toLowerCase().includes("restaurant")) {
          setSelectedChips(["Delicious Food", "Great Ambience", "Friendly Staff"]);
        } else {
          setSelectedChips(["Top Quality Service", "Polite & Helpful Staff", "Fair & Transparent Pricing"]);
        }
      }
    }

    loadBusiness();
  }, [slug, source, isPreview]);

  // Update draft when rating or language or chips change
  useEffect(() => {
    if (business && currentRating >= 3) {
      generateDraftText();
    }
  }, [currentRating, currentLang, currentStyle, selectedChips, business]);

  const positiveChips = [
    { id: "quality", label: "Top Quality & Authenticity", icon: "💎" },
    { id: "staff", label: "Polite & Courteous Staff", icon: "🤝" },
    { id: "pricing", label: "Fair & Transparent Pricing", icon: "⚖️" },
    { id: "ambience", label: "Superb Ambience & Cleanliness", icon: "✨" },
    { id: "service", label: "Fast & Attentive Service", icon: "⚡" },
    { id: "recommend", label: "Highly Recommended Experience", icon: "🏆" },
  ];

  const improvementChips = [
    { id: "speed", label: "Wait Time & Speed", icon: "⏱️" },
    { id: "staff", label: "Staff Attentiveness", icon: "🤝" },
    { id: "pricing", label: "Pricing & Billing", icon: "💳" },
    { id: "cleanliness", label: "Ambience & Cleanliness", icon: "🧹" },
    { id: "service", label: "Service Quality", icon: "🛠️" },
    { id: "communication", label: "Order & Communication", icon: "📢" },
  ];

  const ratingLabels = {
    en: {
      5: "Excellent! Loved it! ⭐⭐⭐⭐⭐",
      4: "Very Good Experience! ⭐⭐⭐⭐",
      3: "Average – Can be improved ⭐⭐⭐",
      2: "Disappointed with service ⭐⭐",
      1: "Very Poor Experience ⭐",
    },
    gu: {
      5: "અદ્ભુત અનુભવ! ખૂબ જ ગમ્યું! ⭐⭐⭐⭐⭐",
      4: "ખૂબ જ સારો અનુભવ! ⭐⭐⭐⭐",
      3: "સામાન્ય અનુભવ ⭐⭐⭐",
      2: "સેવાથી અસંતુષ્ટ ⭐⭐",
      1: "ખૂબ જ ખરાબ અનુભવ ⭐",
    },
    hi: {
      5: "उत्कृष्ट अनुभव! बहुत पसंद आया! ⭐⭐⭐⭐⭐",
      4: "बहुत अच्छा अनुभव! ⭐⭐⭐⭐",
      3: "सामान्य अनुभव ⭐⭐⭐",
      2: "सेवा से असंतुष्ट ⭐⭐",
      1: "बहुत खराब अनुभव ⭐",
    },
  };

  const handleToggleChip = (label: string) => {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleRatingSelect = (rating: number) => {
    setCurrentRating(rating);
    logEvent(slug, "rating", rating);
    // If switching between low and high rating, reset appropriate chips
    if (rating <= 2) {
      setSelectedChips(["Wait Time & Speed"]);
    } else {
      setSelectedChips(["Top Quality & Authenticity", "Polite & Courteous Staff"]);
    }
  };

  const generateDraftText = () => {
    const bizName = business?.name || "this business";
    const loc = business?.city ? ` in ${business.city}` : "";
    const highlights = selectedChips.length > 0 ? selectedChips.join(", ") : "their exceptional hospitality";

    let text = "";

    if (currentLang === "gu") {
      text = `${bizName}${loc} ખાતે ખરીદી/મુલાકાતનો અનુભવ ઘણો સુંદર રહ્યો. ${highlights} ની ગુણવત્તા અને ડિઝાઇન્સ અદ્ભુત છે. સ્ટાફનો વ્યવહાર ખૂબ જ નમ્ર અને પારદર્શક છે. ભલામણ કરું છું! ⭐⭐⭐⭐⭐`;
    } else if (currentLang === "hi") {
      text = `${bizName}${loc} में हमारा अनुभव बेहद शानदार रहा। विशेष रूप से ${highlights} ने दिल जीत लिया। यहां की सेवा और कर्मचारियों का विनम्र व्यवहार सराहनीय है।`;
    } else {
      if (currentStyle === "concise") {
        text = `Outstanding experience at ${bizName}! Exceptional ${highlights}. Fair pricing and very polite staff. Highly recommended! ⭐⭐⭐⭐⭐`;
      } else if (currentStyle === "detailed") {
        text = `Visited ${bizName}${loc}. Truly impressed with their ${highlights}. The craftsmanship, transparency, and courteous staff made our visit very pleasant. Best in the area!`;
      } else {
        text = `Wonderful shopping and customer service experience at ${bizName}. Their quality in ${highlights} is outstanding. Highly trusted brand!`;
      }
    }

    setReviewDraft(text);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // High rating (3-5 stars): Copy draft and redirect to Google Reviews
  const handlePostGoogleReview = () => {
    if (!business || !business.review_url) return;

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(reviewDraft);
        showToast("✓ Review copied! Redirecting to Google...");
      }
    } catch (e) {
      console.warn("Clipboard copy error:", e);
    }

    setTimeout(() => {
      window.location.href = `/r/${slug}/go`;
    }, 800);
  };

  // Low rating (1-2 stars): Post button (NO REDIRECT), saves feedback and shows thank you message
  const handlePostLowRatingFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const feedbackDetails = fbText.trim() 
      ? `${selectedChips.length > 0 ? `[Tags: ${selectedChips.join(", ")}] ` : ""}${fbText.trim()}`
      : (selectedChips.length > 0 ? `Issues reported: ${selectedChips.join(", ")}` : "Disappointed with service");

    if (business) {
      recordDbFeedback(business.id, currentRating, feedbackDetails, fbName, fbPhone);
    }
    logFeedback(slug, currentRating, feedbackDetails, fbName, fbPhone);
    setFbSubmitted(true);
    showToast("✓ Thank you for your time for review message!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Unavailable State (Lapsed or Inactive subscription)
  if (!business || !business.active) {
    return (
      <div className="min-h-screen bg-[#0D0D12] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="font-headline font-bold text-xl text-white mb-2">
          Review Assistant Temporarily Unavailable
        </h1>
        <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">
          This business review assistant page is temporarily paused. Please check back shortly or visit the store counter for assistance.
        </p>
        <span className="text-[10px] text-gray-600 font-mono">
          Powered by ZenTap.ai Smart Review Network
        </span>
      </div>
    );
  }

  const linkReady = !!business.review_url;

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white flex flex-col items-center justify-start pb-16 selection:bg-[#D4AF37] selection:text-black font-sans">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-[#58111A]/40 via-[#D4AF37]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container max-w-480px */}
      <div className="relative z-10 w-full max-w-[480px] px-4 pt-4 sm:pt-6">
        
        {/* Preview badge if in preview mode */}
        {isPreview && (
          <div className="mb-3 px-3 py-1 rounded-full bg-secondary text-on-secondary font-bold text-[10px] uppercase text-center">
            Admin Preview Mode • Scan Telemetry Not Recorded
          </div>
        )}

        {/* Integration in process banner if review_url is null */}
        {!linkReady && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 shadow-sm">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Google Review Assistant Integration In Process</span>
              <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                Your page is live, and the Google review button will activate once configuration is complete by the ZenTap onboarding team.
              </p>
            </div>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[11px] font-semibold text-[#F7E7A9]">
            <Radio className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            <span>NFC Live Tap Experience</span>
          </div>

          {/* Language Switcher */}
          <div className="flex bg-white/5 border border-[#D4AF37]/25 rounded-full p-1 gap-1">
            <button
              onClick={() => setCurrentLang("en")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentLang === "en" ? "bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-black shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setCurrentLang("gu")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentLang === "gu" ? "bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-black shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              ગુજ
            </button>
            <button
              onClick={() => setCurrentLang("hi")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentLang === "hi" ? "bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-black shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Brand Hero */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#3A0C13] via-[#58111A] to-[#1C0508] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.35)]">
            <Sparkles className="w-9 h-9 text-[#F7E7A9]" />
          </div>

          <h1 className="font-serif tracking-wider font-extrabold text-2xl sm:text-3xl bg-gradient-to-r from-white via-[#F7E7A9] to-white bg-clip-text text-transparent uppercase">
            {business.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#F7E7A9]/90 font-medium mt-1">
            {business.category || "Premium Hospitality & Service Excellence"}
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300 mt-2">
            <MapPin className="w-3 h-3 text-[#D4AF37]" />
            <span>{[business.city, business.state, business.country].filter(Boolean).join(", ") || "Ahmedabad, India"}</span>
          </div>
        </div>

        {/* Central Card */}
        <div className="bg-[#16161E]/95 border border-[#D4AF37]/25 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl mb-5">
          
          {/* Step 1: Star Rating */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <span className="text-sm font-bold text-white tracking-wide">
              Rate Your Experience
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 py-3">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isActive = starVal <= currentRating;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => handleRatingSelect(starVal)}
                  className={`text-4xl sm:text-5xl transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? "text-[#FFB800] scale-110 drop-shadow-[0_0_14px_rgba(255,184,0,0.6)]"
                      : "text-zinc-600 grayscale opacity-40 hover:opacity-75"
                  }`}
                  aria-label={`Rate ${starVal} Stars`}
                >
                  ★
                </button>
              );
            })}
          </div>

          <div className="text-center text-xs sm:text-sm font-semibold text-[#F7E7A9] min-h-[22px] mb-4">
            {ratingLabels[currentLang][currentRating as keyof typeof ratingLabels["en"]]}
          </div>

          {/* ========================================================= */}
          {/* FLOW A: FOR 1-2 STARS (Help Us Make It Right / Only Post)  */}
          {/* ========================================================= */}
          {currentRating <= 2 ? (
            <div className="pt-2 border-t border-white/10 animate-in fade-in duration-200">
              {fbSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline font-bold text-base text-white">
                    Thank you for your time for review message!
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed max-w-xs mx-auto">
                    We sincerely appreciate your honesty. Your note has been delivered privately to {business.name}&apos;s management team so we can address this immediately.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFbSubmitted(false);
                      setFbText("");
                    }}
                    className="mt-2 text-xs text-[#F7E7A9] underline hover:text-white cursor-pointer"
                  >
                    Submit another response
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePostLowRatingFeedback} className="space-y-4">
                  {/* Step 2: What could we have done better? */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-6 h-6 rounded-full bg-red-500 text-white font-extrabold text-xs flex items-center justify-center">
                        2
                      </span>
                      <span className="text-sm font-bold text-white tracking-wide">
                        What could we have done better?
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {improvementChips.map((chip) => {
                        const isSel = selectedChips.includes(chip.label);
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => handleToggleChip(chip.label)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                              isSel
                                ? "bg-red-500/20 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            <span className="text-sm flex-shrink-0">{chip.icon}</span>
                            <span className="truncate">{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Private Feedback Inputs */}
                  <div className="space-y-2.5 p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-300 mb-1">
                      <ShieldCheck className="w-4 h-4 text-red-400" />
                      <span>Confidential Direct-to-Owner Feedback</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={fbName}
                        onChange={(e) => setFbName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
                      />
                      <input
                        type="tel"
                        placeholder="Mobile (Optional)"
                        value={fbPhone}
                        onChange={(e) => setFbPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
                      />
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Please share what happened so management can make it right..."
                      value={fbText}
                      onChange={(e) => setFbText(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400 resize-none font-sans"
                    />
                  </div>

                  {/* ONLY "Post" Button - No Redirect */}
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-headline font-extrabold text-base tracking-wide shadow-[0_8px_25px_rgba(220,38,38,0.35)] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {currentLang === "gu" ? "પોસ્ટ કરો" : currentLang === "hi" ? "पोस्ट करें" : "Post"}
                    </span>
                  </button>

                  <p className="text-[11px] text-center text-gray-400">
                    Your feedback is kept private between you and store management.
                  </p>
                </form>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* FLOW B: FOR 3-5 STARS (AI Draft + Post Google Review)      */
            /* ========================================================= */
            <div className="pt-2 border-t border-white/10 animate-in fade-in duration-200 space-y-4">
              {/* Step 2: What stood out */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-sm font-bold text-white tracking-wide">
                    What did you like most?
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  {positiveChips.map((chip) => {
                    const isSel = selectedChips.includes(chip.label);
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => handleToggleChip(chip.label)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                          isSel
                            ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-sm flex-shrink-0">{chip.icon}</span>
                        <span className="truncate">{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: AI-Crafted Review Draft */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-[#D4AF37]/35 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#F7E7A9] to-[#D4AF37] text-black font-bold text-[10px] tracking-wider uppercase">
                    <Sparkles className="w-3 h-3 text-black" />
                    <span>AI-Crafted Review Draft</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      generateDraftText();
                      showToast("✨ Fresh review draft generated!");
                    }}
                    className="text-[11px] text-[#F7E7A9] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <textarea
                  value={reviewDraft}
                  onChange={(e) => setReviewDraft(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent text-white text-xs sm:text-sm leading-relaxed border-none focus:outline-none resize-none font-sans"
                />

                {/* Style Pills */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 mt-2">
                  <span className="text-[10px] text-gray-400 font-semibold mr-1">Style:</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStyle("balanced")}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                      currentStyle === "balanced"
                        ? "bg-[#D4AF37]/25 border-[#D4AF37] text-[#F7E7A9]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStyle("detailed")}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                      currentStyle === "detailed"
                        ? "bg-[#D4AF37]/25 border-[#D4AF37] text-[#F7E7A9]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    Detailed
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStyle("concise")}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                      currentStyle === "concise"
                        ? "bg-[#D4AF37]/25 border-[#D4AF37] text-[#F7E7A9]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    Short &amp; Punchy
                  </button>
                </div>
              </div>

              {/* POST GOOGLE REVIEW BUTTON (Copies to clipboard and opens Google Review link) */}
              {linkReady ? (
                <button
                  type="button"
                  onClick={handlePostGoogleReview}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F7E7A9] via-[#D4AF37] to-[#9A7B1C] text-[#120A03] font-headline font-extrabold text-base tracking-wide shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                >
                  {/* Google G SVG */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {currentLang === "gu" ? "ગૂગલ રિવ્યુ પોસ્ટ કરો" : currentLang === "hi" ? "गूगल रिव्यू पोस्ट करें" : "Post Google Review"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 px-6 rounded-2xl bg-zinc-800 text-zinc-400 font-headline font-bold text-sm tracking-wide cursor-not-allowed flex items-center justify-center gap-2 border border-zinc-700"
                >
                  <span>Google review link is being configured</span>
                </button>
              )}

              <p className="text-[11px] text-center text-gray-400 flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI review draft copies automatically. Post directly on Google Reviews.</span>
              </p>
            </div>
          )}

          <p className="text-[11px] text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Suggestion copies to clipboard. You can edit and post directly on Google.</span>
          </p>

        </div>

        {/* Quick Venue Actions */}
        <div className="grid grid-cols-4 gap-2 py-3 px-2 border-t border-white/10 mb-6">
          {business.phone && (
            <a
              href={`https://wa.me/${business.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello! Visiting " + business.name)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#F7E7A9] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">WhatsApp</span>
            </a>
          )}

          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#F7E7A9] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sky-400">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Call Store</span>
            </a>
          )}

          {business.gbp_link ? (
            <a
              href={business.gbp_link}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#F7E7A9] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Directions</span>
            </a>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Directions</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: business.name,
                  text: `Review ${business.name} on ZenTap!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast("✓ Link copied to clipboard!");
              }
            }}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#F7E7A9] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Share</span>
          </button>
        </div>

        {/* Powered by ZenTap Footer */}
        <div className="text-center pt-4 border-t border-white/10 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Powered by</span>
            <span className="font-headline font-bold text-white tracking-tight">
              Zen<span className="text-[#D4AF37]">Tap</span>.ai
            </span>
          </div>
          <span className="text-[10px] text-gray-500">
            Smart Review Ecosystem &amp; Google Search SEO Booster
          </span>
        </div>

      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-emerald-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
