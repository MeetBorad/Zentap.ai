// src/components/customer/ZenTapHubPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Star, 
  Phone, 
  MapPin, 
  Navigation,
  Globe, 
  Mail, 
  Clock, 
  ChevronDown, 
  Sparkles,
  Copy,
  Check,
  X,
  Info,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Instagram,
  Facebook
} from "lucide-react";
import { BusinessRecord } from "@/lib/businessStore";
import { 
  PageDesignRecord, 
  PageButtonRecord, 
  PageSectionRecord, 
  PagePhotoRecord,
  getPageDesign,
  getPageButtons,
  getPageSections,
  getPagePhotos
} from "@/lib/hubDesignStore";
import { getAllPageEditorConfigs } from "@/lib/adminPlatformStore";
import OwnerAccessModal from "@/components/modals/OwnerAccessModal";

interface ZenTapHubPageProps {
  business: BusinessRecord;
  design: PageDesignRecord;
  buttons: PageButtonRecord[];
  sections: PageSectionRecord[];
  photos: PagePhotoRecord[];
  source?: "qr" | "nfc" | "web";
  isPreview?: boolean;
  pageConfig?: any;
  via?: string;
}

const DEFAULT_TAGS = [
  "Cleanliness",
  "Nice Staff",
  "Good Behaviour",
  "Excellent Quality",
  "Fair Pricing",
  "Fast Service",
  "Good Ambience",
  "Value for Money",
  "Hygiene",
  "Professional Team",
  "On-time Delivery",
  "Easy Parking",
];

const DEFAULT_FAQS = [
  {
    question: "Do you offer parking?",
    answer: "Yes, dedicated on-site parking is available for visitors, with seamless accessibility directly in front of our premises.",
  },
  {
    question: "What payment modes are accepted?",
    answer: "We support all major payment types including UPI (Google Pay, PhonePe, Paytm), Visa/Mastercard/RuPay credit & debit cards, net banking, and cash.",
  },
];

export default function ZenTapHubPage({
  business,
  design: initialDesign,
  buttons: initialButtons,
  sections: initialSections,
  photos: initialPhotos,
  source = "web",
  isPreview = false,
  pageConfig: initialPageConfig,
  via,
}: ZenTapHubPageProps) {
  const [design, setDesign] = useState<PageDesignRecord>(initialDesign);
  const [localConfig, setLocalConfig] = useState<any>(initialPageConfig || {});

  // Client hydration to fetch latest saved config & design from stores
  useEffect(() => {
    if (typeof window !== "undefined" && business?.id) {
      try {
        const localDesign = getPageDesign(business.id);
        if (localDesign) setDesign(localDesign);

        const allEditorConfigs = getAllPageEditorConfigs();
        const cleanSlug = (business.slug || "").toLowerCase();
        const bizId = (business.id || "").toLowerCase();

        const matchingConfig = allEditorConfigs.find(
          (c) =>
            c.tag_id.toLowerCase() === cleanSlug ||
            c.business_id.toLowerCase() === bizId ||
            (cleanSlug === "zentap" && (c.tag_id.toLowerCase() === "zentap" || c.business_id.toLowerCase() === "sample-demo-biz-01" || c.tag_id.toLowerCase() === "st1"))
        );

        if (matchingConfig?.config_data) {
          const parsed = typeof matchingConfig.config_data === "string" 
            ? JSON.parse(matchingConfig.config_data) 
            : matchingConfig.config_data;
          setLocalConfig((prev: any) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.warn("Hydrating hub design error:", e);
      }
    }
  }, [business?.id, business?.slug]);

  // Merge attributes from page config, business record, or default showcase
  const cfg = localConfig || {};
  const isZenTapDemo = (business.slug || "").toLowerCase() === "zentap" || business.id === "sample-demo-biz-01";

  const businessName = cfg.title || business.name || "ZenTap Digital Solutions";
  const subtitle = cfg.subtitle || cfg.category || business.category || (isZenTapDemo ? "Ahmedabad • Welcome to our official digital hub" : "");
  const address = cfg.address || business.address || (isZenTapDemo ? "Ahmedabad, Gujarat, India" : "");

  const mapsUrl = cfg.maps_link || business.maps_link || business.gbp_link || business.google_review_link || business.review_url || (isZenTapDemo ? "https://g.page/r/CdJX2OGu1yhoEAI/review" : "");
  const googleReviewLink = (isZenTapDemo ? "https://g.page/r/CdJX2OGu1yhoEAI/review" : "") || cfg.google_link || business.google_review_link || business.review_url || mapsUrl || "https://g.page/r/CdJX2OGu1yhoEAI/review";

  const phone = cfg.phone || business.phone || (isZenTapDemo ? "+91 92745 60880" : "");
  const cleanPhone = phone ? phone.replace(/[^0-9+]/g, "") : "";

  const whatsapp = cfg.whatsapp || business.whatsapp || business.whatsapp_number || (isZenTapDemo ? "919274560880" : "");
  const cleanWhatsApp = whatsapp ? whatsapp.replace(/[^0-9]/g, "") : "";

  const instagramRaw = cfg.instagram || business.instagram || business.instagram_url || (isZenTapDemo ? "https://instagram.com" : "");
  let instagramUrl = instagramRaw;
  let instagramHandle = business.instagram_handle || (isZenTapDemo ? "@zentapdigital" : "");
  if (instagramRaw) {
    if (!instagramRaw.startsWith("http")) {
      instagramHandle = instagramRaw.startsWith("@") ? instagramRaw : `@${instagramRaw}`;
      instagramUrl = `https://instagram.com/${instagramRaw.replace(/^@/, "")}`;
    } else {
      const match = instagramRaw.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match && match[1]) {
        instagramHandle = `@${match[1]}`;
      } else if (!instagramHandle) {
        instagramHandle = "@instagram";
      }
    }
  }

  const facebookUrl = cfg.facebook || business.facebook || business.facebook_url || (isZenTapDemo ? "https://facebook.com" : "");

  const websiteRaw = cfg.website || business.website || business.website_url || business.portfolio_url || (isZenTapDemo ? "https://zentapdigitalsolutions.com" : "");
  const websiteUrl = websiteRaw ? (websiteRaw.startsWith("http") ? websiteRaw : `https://${websiteRaw}`) : "";
  const displayWebsite = websiteRaw ? websiteRaw.replace(/^https?:\/\//i, "").replace(/\/$/, "") : "";

  const email = cfg.email || business.email || (isZenTapDemo ? "contact@zentapdigitalsolutions.com" : "");

  const logoUrl = cfg.logo_url || design.logo_url || business.logo_url || (isZenTapDemo ? "https://lh3.googleusercontent.com/aida-public/AB6AXuC1v0R5J-iLk5f40ycfMMud4JnJoswjm15FbobEOnF982t6u0ffqZ5svfbrN6qmKCgW6F-ejOC4Wb7QfcaQxHkJ1zNt1_wwvtSXB_tS_LnuUT3Ix44J8qUCCdD5R0FV5uVKI6skyKM5QrdeTcFxjYpSEt1QvFc280v1TA_DIT0JIOkcNc80JTWv6k4ina32ylCuUkv281QHYkmRhBaS2AuAkImi5kyMIeFwMO0zhd8316MT0gk6t2Q50A" : "/logo.png");

  const aboutUsText = cfg.about_us || business.about_us || (isZenTapDemo ? "Welcome to ZenTap Digital Solutions! We take pride in delivering premier service, top craftsmanship, and genuine hospitality to every visitor." : "");

  const openingHoursRaw = cfg.opening_hours || business.opening_hours || (isZenTapDemo ? "Monday – Saturday: 10:00 AM – 09:00 PM\nSunday: 11:00 AM – 06:00 PM" : "");
  const openingHoursList = openingHoursRaw
    ? openingHoursRaw.split("\n").map((line: string) => line.trim()).filter(Boolean)
    : [];

  const rawFaqs = cfg.faqs || business.faqs;
  const faqsList: { question: string; answer: string }[] = 
    Array.isArray(rawFaqs) && rawFaqs.length > 0 
      ? rawFaqs 
      : isZenTapDemo 
      ? DEFAULT_FAQS 
      : [];

  const locationImage = cfg.location_image || business.location_image || (isZenTapDemo ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBntBRRtvFsUDBYuSpyCqOKOrww8i3Jra2cvrOlya4dusW8PVtI8vY7kNlQT6oWsIbi_RxEvnxmKef0KVtOB85lYnw8jONF_Iq3ZThxyxk6mZACXbKDiXpMZyAsooT3GYU_dpN4F5OQ6bwFzaHC988imjfe9wnu2h5NOQPefD_KjMN5mLgmOXi2e77FzabIrI3F4X9mEWZg-Dd5qiEghoie3wXTVnHyKlrg9B18etzc" : "");
  const locationTitle = cfg.location_title || business.location_title || (isZenTapDemo ? "Ahmedabad Central Hub" : address);

  const availableTags: string[] = 
    Array.isArray(cfg.tags) && cfg.tags.length > 0
      ? cfg.tags
      : Array.isArray(business.custom_chips) && business.custom_chips.length > 0
      ? business.custom_chips
      : DEFAULT_TAGS;

  // Modal & Interactive Review States
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(["Nice Staff", "Excellent Quality"]));
  const [selectedLength, setSelectedLength] = useState<"short" | "medium" | "detailed">("medium");
  const [generatedReview, setGeneratedReview] = useState<string>("");
  const [showReviewBox, setShowReviewBox] = useState<boolean>(false);
  const [copiedReview, setCopiedReview] = useState<boolean>(false);

  // Private feedback state for ratings <= 2
  const [privateFeedbackText, setPrivateFeedbackText] = useState("");
  const [privateFeedbackName, setPrivateFeedbackName] = useState("");
  const [privateFeedbackPhone, setPrivateFeedbackPhone] = useState("");
  const [privateFeedbackSubmitting, setPrivateFeedbackSubmitting] = useState(false);
  const [privateFeedbackSent, setPrivateFeedbackSent] = useState(false);

  const ratingDescriptions: Record<number, string> = {
    1: "Disappointing (1 Star)",
    2: "Could be better (2 Stars)",
    3: "Average (3 Stars)",
    4: "Great experience! (4 Stars)",
    5: "Loved it! (5 Stars)",
  };

  const generateReviewContent = (rating: number, tags: Set<string>, length: "short" | "medium" | "detailed") => {
    const tagsArr = Array.from(tags);
    const tagsSentence = tagsArr.length > 0 ? tagsArr.join(", ") : "superb hospitality";
    
    if (rating <= 2) {
      if (length === "short") {
        return `Visited ${businessName}. While the location was accessible, the overall experience needed improvement.`;
      } else if (length === "medium") {
        return `Had a visit to ${businessName}. A few areas around ${tagsSentence} could be significantly better. Sharing feedback for improvement.`;
      } else {
        return `My visit to ${businessName} fell below expectations today. Specifically regarding ${tagsSentence}, there is clear room for operational improvement. Hope the management addresses this proactively.`;
      }
    }

    if (length === "short") {
      return `Had an outstanding experience at ${businessName}! Loved the ${tagsSentence}. Highly recommended!`;
    } else if (length === "medium") {
      return `I am truly pleased with the exceptional service at ${businessName}${address ? ` in ${address.split(",")[0]}` : ""}. The ${tagsSentence} really stood out during my visit. Fast, transparent, and top-tier professionalism!`;
    } else {
      return `${businessName} exceeded my expectations on every level. From the very beginning, their ${tagsSentence} made an enormous impression. The staff is welcoming, the environment is pristine, and their digital solutions are unmatched. 5/5 stars without hesitation!`;
    }
  };

  // Keep generated review live
  useEffect(() => {
    const text = generateReviewContent(currentRating, selectedTags, selectedLength);
    setGeneratedReview(text);
  }, [currentRating, selectedTags, selectedLength, businessName, address]);

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

  const handleCopyReview = () => {
    if (!generatedReview) return;
    navigator.clipboard.writeText(generatedReview);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 2000);
  };

  const handleSubmitReview = () => {
    setShowReviewBox(true);
    if (generatedReview) {
      navigator.clipboard.writeText(generatedReview);
    }

    // Analytics click tracking
    if (!isPreview) {
      try {
        fetch("/api/hub/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_id: business.id,
            button_type: "google_review_submit",
            source,
          }),
        }).catch(() => {});
      } catch {}
    }

    // Redirect to Google Reviews URL
    if (googleReviewLink) {
      setTimeout(() => {
        window.open(googleReviewLink, "_blank", "noopener,noreferrer");
      }, 1000);
    }
  };

  const handleSendPrivateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateFeedbackText.trim()) return;
    setPrivateFeedbackSubmitting(true);
    try {
      await fetch("/api/review/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          stars: currentRating,
          feedback_text: privateFeedbackText.trim(),
          customer_name: privateFeedbackName.trim() || undefined,
          customer_phone: privateFeedbackPhone.trim().replace(/\D/g, "") || undefined,
          tag_code: business.slug,
        }),
      });
      setPrivateFeedbackSent(true);
    } catch {
      setPrivateFeedbackSent(true);
    } finally {
      setPrivateFeedbackSubmitting(false);
    }
  };

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

  // Has at least one social / contact channel
  const hasSocialChannels = !!(cleanWhatsApp || instagramUrl || phone || facebookUrl || websiteUrl || email);

  return (
    <div 
      className="bg-[#0B0F17] text-[#dfe2ee] min-h-screen selection:bg-[#f59e0b] selection:text-[#2a1700] relative overflow-x-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <main className="w-full min-h-screen pt-4 relative">
        <div className="flex flex-col w-full relative">
          
          {/* Ambient Living Mesh Backdrops */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-[#f59e0b]/10 rounded-full blur-[110px] animate-pulse" />
            <div className="absolute top-[480px] -left-20 w-[360px] h-[360px] bg-[#03b5d3]/10 rounded-full blur-[90px]" />
            <div className="absolute bottom-20 -right-20 w-[420px] h-[420px] bg-[#ffc174]/10 rounded-full blur-[100px]" />
          </div>

          {/* Mobile Hub Shell */}
          <div className="relative z-10 max-w-[480px] w-full mx-auto px-4 pb-8 flex flex-col gap-4">
            
            {/* 1. Profile & NFC Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-[#121824]/90 backdrop-blur-2xl shadow-2xl p-4 sm:p-5 flex flex-col gap-3.5 border border-white/5">
              {/* Glow Accent Rim */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-60" />
              
              {/* Identity Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Monogram / Logo */}
                  <div className="relative shrink-0 w-16 h-16 rounded-xl bg-[#121824] p-1 shadow-lg border border-[#ffc174]/20 flex items-center justify-center">
                    <img 
                      src={logoUrl} 
                      alt={businessName} 
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 text-[#0B0F17] font-black stroke-[3]" />
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h1 className="font-bold text-base sm:text-lg text-[#F8FAFC] leading-snug">
                      {businessName}
                    </h1>
                    {subtitle && (
                      <span className="text-xs text-[#94A3B8] line-clamp-1 mt-0.5">
                        {subtitle}
                      </span>
                    )}
                    {address && (
                      <a 
                        className="mt-1 inline-flex items-center gap-1 text-[#ffb95f] hover:text-[#ffc174] text-[11px] font-medium transition-colors"
                        href={mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                        rel="noopener noreferrer" 
                        target="_blank"
                        onClick={() => trackClick("address_pin")}
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{address}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Action Bar (Only shown if phone or mapsUrl is not blank!) */}
              {(cleanPhone || mapsUrl) && (
                <div className={`grid ${cleanPhone && mapsUrl ? "grid-cols-2" : "grid-cols-1"} gap-2 pt-1`}>
                  {cleanPhone && (
                    <a 
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1B2232] hover:bg-[#262a33] text-[#F8FAFC] text-xs font-semibold transition-all active:scale-[0.98] shadow-md border border-white/5 cursor-pointer"
                      href={`tel:${cleanPhone}`}
                      onClick={() => trackClick("call_quick")}
                    >
                      <Phone className="w-4 h-4 text-[#ffc174]" />
                      <span>Call Us</span>
                    </a>
                  )}
                  {mapsUrl && (
                    <a 
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1B2232] hover:bg-[#262a33] text-[#F8FAFC] text-xs font-semibold transition-all active:scale-[0.98] shadow-md border border-white/5 cursor-pointer"
                      href={mapsUrl}
                      rel="noopener noreferrer" 
                      target="_blank"
                      onClick={() => trackClick("directions_quick")}
                    >
                      <Navigation className="w-4 h-4 text-[#4cd7f6]" />
                      <span>Directions</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* 2. Google Review Main Trigger Banner */}
            <div 
              className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#121824] via-[#262a33] to-[#121824] p-4 shadow-xl transition-all duration-300 hover:shadow-[#f59e0b]/20 hover:scale-[1.01] active:scale-[0.99] border border-white/5" 
              onClick={() => {
                const reviewUrl = `/r/${business.slug}/review${isPreview ? "?preview=1" : ""}${via ? `${isPreview ? "&" : "?"}via=${via}` : ""}`;
                window.location.href = reviewUrl;
              }}
              role="button" 
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const reviewUrl = `/r/${business.slug}/review${isPreview ? "?preview=1" : ""}${via ? `${isPreview ? "&" : "?"}via=${via}` : ""}`;
                  window.location.href = reviewUrl;
                }
              }}
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#f59e0b]/15 rounded-full blur-2xl group-hover:bg-[#f59e0b]/25 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-[#ffc174] fill-[#ffc174]" />
                    <span className="text-base sm:text-lg text-[#F8FAFC] font-bold">
                      Loved your visit?
                    </span>
                  </div>
                  <span className="text-xs text-[#94A3B8]">
                    {cfg.cta_text || "Tap to write a rapid 5-Star Google Review"}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[#ffc174]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-[#ffc174] text-[#ffc174]" />
                    ))}
                    <span className="text-xs text-[#ffb95f] ml-1 font-semibold">5.0 Rating</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#f59e0b] text-[#2a1700] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                  <Star className="w-6 h-6 fill-black text-black" />
                </div>
              </div>
            </div>

            {/* 3. Connect & Social Channels Grid (Strictly hides any blank client button) */}
            {hasSocialChannels && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-bold">
                    Connect &amp; Social Channels
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* WhatsApp Contact */}
                  {cleanWhatsApp && (
                    <a 
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#121824] hover:bg-[#1B2232] text-[#F8FAFC] transition-all duration-200 shadow-md active:scale-95 border border-white/5"
                      href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(business.whatsapp_message || `Hi ${businessName}`)}`}
                      rel="noopener noreferrer" 
                      target="_blank"
                      onClick={() => trackClick("whatsapp")}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#262a33] group-hover:bg-[#10B981]/20 flex items-center justify-center text-[#10B981] transition-colors shrink-0">
                        <svg className="w-5 h-5 text-emerald-400 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#10B981] truncate transition-colors">
                          WhatsApp
                        </span>
                        <span className="text-[11px] text-[#94A3B8] truncate">Instant Chat</span>
                      </div>
                    </a>
                  )}

                  {/* Instagram */}
                  {instagramUrl && (
                    <a 
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#121824] hover:bg-[#1B2232] text-[#F8FAFC] transition-all duration-200 shadow-md active:scale-95 border border-white/5"
                      href={instagramUrl}
                      rel="noopener noreferrer" 
                      target="_blank"
                      onClick={() => trackClick("instagram")}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#ffc174] truncate transition-colors">
                          Instagram
                        </span>
                        <span className="text-[11px] text-[#94A3B8] truncate">
                          {instagramHandle || "@instagram"}
                        </span>
                      </div>
                    </a>
                  )}

                  {/* Direct Phone Call */}
                  {phone && (
                    <a 
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#121824] hover:bg-[#1B2232] text-[#F8FAFC] transition-all duration-200 shadow-md active:scale-95 border border-white/5"
                      href={`tel:${cleanPhone}`}
                      onClick={() => trackClick("call_office")}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#262a33] group-hover:bg-[#4cd7f6]/20 flex items-center justify-center text-[#4cd7f6] transition-colors shrink-0">
                        <Phone className="w-5 h-5 fill-current" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#4cd7f6] truncate transition-colors">
                          Call Office
                        </span>
                        <span className="text-[11px] text-[#94A3B8] truncate">{phone}</span>
                      </div>
                    </a>
                  )}

                  {/* Facebook */}
                  {facebookUrl && (
                    <a 
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#121824] hover:bg-[#1B2232] text-[#F8FAFC] transition-all duration-200 shadow-md active:scale-95 border border-white/5"
                      href={facebookUrl}
                      rel="noopener noreferrer" 
                      target="_blank"
                      onClick={() => trackClick("facebook")}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#262a33] group-hover:bg-[#acedff]/20 flex items-center justify-center text-[#acedff] transition-colors shrink-0">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#acedff] truncate transition-colors">
                          Facebook
                        </span>
                        <span className="text-[11px] text-[#94A3B8] truncate">Official Page</span>
                      </div>
                    </a>
                  )}

                  {/* Website */}
                  {websiteUrl && (
                    <a 
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#121824] hover:bg-[#1B2232] text-[#F8FAFC] transition-all duration-200 shadow-md active:scale-95 border border-white/5"
                      href={websiteUrl}
                      rel="noopener noreferrer" 
                      target="_blank"
                      onClick={() => trackClick("website")}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#262a33] group-hover:bg-[#ffc174]/20 flex items-center justify-center text-[#ffc174] transition-colors shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#ffc174] truncate transition-colors">
                          Website
                        </span>
                        <span className="text-[11px] text-[#94A3B8] truncate">{displayWebsite}</span>
                      </div>
                    </a>
                  )}

                  {/* Email */}
                  {email && (
                    <a 
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#121824] hover:bg-[#1B2232] text-[#F8FAFC] transition-all duration-200 shadow-md active:scale-95 border border-white/5"
                      href={`mailto:${email}`}
                      onClick={() => trackClick("email")}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#262a33] group-hover:bg-[#4cd7f6]/20 flex items-center justify-center text-[#4cd7f6] transition-colors shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#4cd7f6] truncate transition-colors">
                          Email
                        </span>
                        <span className="text-[11px] text-[#94A3B8] truncate">{email}</span>
                      </div>
                    </a>
                  )}

                </div>
              </div>
            )}

            {/* 4. About Us Section (Only shown if client provided text!) */}
            {aboutUsText && (
              <div className="rounded-2xl bg-[#121824] p-4 sm:p-5 flex flex-col gap-2 shadow-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#ffc174] shrink-0" />
                  <h2 className="text-sm font-bold text-[#F8FAFC]">About Us</h2>
                </div>
                <p className="text-xs sm:text-[13px] text-[#dfe2ee] leading-relaxed">
                  {aboutUsText}
                </p>
              </div>
            )}

            {/* 5. Operating Hours Matrix (Only shown if client provided hours!) */}
            {openingHoursList.length > 0 && (
              <div className="rounded-2xl bg-[#121824] p-4 sm:p-5 flex flex-col gap-2.5 shadow-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4cd7f6] shrink-0" />
                  <h2 className="text-sm font-bold text-[#F8FAFC]">Opening Hours</h2>
                </div>
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  {openingHoursList.map((line: string, idx: number) => {
                    const parts = line.split(":");
                    if (parts.length >= 2) {
                      const dayLabel = parts[0].trim();
                      const timeLabel = parts.slice(1).join(":").trim();
                      return (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#1B2232] border border-white/5">
                          <span className="text-[#F8FAFC] font-medium">{dayLabel}</span>
                          <span className="text-[#ffddb8] font-semibold">{timeLabel}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="py-1.5 px-3 rounded-xl bg-[#1B2232] text-[#ffddb8] font-medium border border-white/5">
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Frequently Asked Questions (Only shown if client provided FAQs!) */}
            {faqsList.length > 0 && (
              <div className="rounded-2xl bg-[#121824] p-4 sm:p-5 flex flex-col gap-2.5 shadow-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#c7c8ff] shrink-0" />
                  <h2 className="text-sm font-bold text-[#F8FAFC]">Frequently Asked Questions</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {faqsList.map((faq, idx) => (
                    <details key={idx} className="group rounded-xl bg-[#1B2232] p-3 cursor-pointer border border-white/5 transition-all">
                      <summary className="flex items-center justify-between list-none text-xs font-semibold text-[#F8FAFC] select-none">
                        <span>{faq.question}</span>
                        <ChevronDown className="w-4 h-4 text-[#94A3B8] group-open:rotate-180 transition-transform shrink-0" />
                      </summary>
                      <div className="mt-2 text-[#94A3B8] text-[11px] leading-relaxed pt-1 border-t border-white/5">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Studio Location View (Only shown if address/mapsUrl/locationImage exists!) */}
            {(address || mapsUrl || locationImage) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-bold">
                    Our Studio Location
                  </span>
                  {mapsUrl && (
                    <a 
                      className="text-[11px] text-[#ffc174] hover:underline font-semibold"
                      href={mapsUrl}
                      rel="noopener noreferrer" 
                      target="_blank"
                      onClick={() => trackClick("location_maps_link")}
                    >
                      Open in Google Maps
                    </a>
                  )}
                </div>
                <div 
                  className="w-full h-44 rounded-2xl shadow-lg relative overflow-hidden bg-[#121824] flex items-end p-3.5 border border-white/5"
                  style={{
                    backgroundImage: `url('${locationImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuBntBRRtvFsUDBYuSpyCqOKOrww8i3Jra2cvrOlya4dusW8PVtI8vY7kNlQT6oWsIbi_RxEvnxmKef0KVtOB85lYnw8jONF_Iq3ZThxyxk6mZACXbKDiXpMZyAsooT3GYU_dpN4F5OQ6bwFzaHC988imjfe9wnu2h5NOQPefD_KjMN5mLgmOXi2e77FzabIrI3F4X9mEWZg-Dd5qiEghoie3wXTVnHyKlrg9B18etzc"}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <MapPin className="w-5 h-5 text-[#ffc174] shrink-0" />
                      <span className="text-xs sm:text-sm text-[#F8FAFC] font-bold truncate">
                        {locationTitle || address || "Our Studio Hub"}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#1B2232]/90 backdrop-blur-md text-[#F8FAFC] text-[10px] font-bold shadow shrink-0 border border-white/10">
                      NFC Station
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 8. Business Portal Trigger */}
            <div className="rounded-2xl bg-[#1B2232] p-3.5 flex items-center justify-between shadow-md border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#262a33] flex items-center justify-center text-[#ffc174] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs text-[#F8FAFC] font-medium">Business owner? Manage this card</span>
              </div>
              <button 
                className="px-3.5 py-1.5 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#F8FAFC] text-xs font-semibold transition-colors cursor-pointer border border-white/5" 
                type="button"
                onClick={() => setOwnerModalOpen(true)}
              >
                Log In
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* 9. INTERACTIVE GOOGLE REVIEW MODAL */}
      {reviewModalOpen && (
        <div 
          aria-labelledby="modalHeading" 
          aria-modal="true" 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0B0F17]/80 backdrop-blur-md transition-opacity duration-300" 
          role="dialog"
        >
          {/* Backdrop click to close */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setReviewModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-[460px] max-h-[92vh] overflow-y-auto bg-[#121824] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-[#dfe2ee] border border-white/10 animate-in slide-in-from-bottom-6 duration-200">
            
            {/* Header & Close Button */}
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/20 flex items-center justify-center text-[#ffb95f]">
                  <Sparkles className="w-4 h-4 text-[#ffc174]" />
                </div>
                <span className="text-base font-bold text-[#F8FAFC]" id="modalHeading">
                  Write a Google Review
                </span>
              </div>
              <button 
                aria-label="Close dialog" 
                className="w-8 h-8 rounded-full bg-[#1B2232] hover:bg-[#262a33] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer" 
                type="button"
                onClick={() => setReviewModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 5-Star Interactive Rating Display Card */}
            <div className="rounded-2xl bg-[#1B2232] p-4 flex flex-col items-center justify-center gap-2 shadow-inner border border-white/5">
              <div aria-label="Star Rating" className="flex items-center justify-center gap-2" role="radiogroup">
                {[1, 2, 3, 4, 5].map((s) => {
                  const isFilled = s <= currentRating;
                  return (
                    <button
                      key={s}
                      aria-label={`${s} Star${s > 1 ? "s" : ""}`}
                      className="text-[#ffc174] hover:scale-110 active:scale-95 transition-transform cursor-pointer p-1 focus:outline-none"
                      type="button"
                      onClick={() => {
                        setCurrentRating(s);
                        setShowReviewBox(false);
                      }}
                    >
                      <Star 
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          isFilled 
                            ? "fill-[#ffc174] text-[#ffc174] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                            : "text-[#353942] fill-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-[#F8FAFC]">
                {ratingDescriptions[currentRating] || `${currentRating} Stars`}
              </span>
            </div>

            {/* Anti-Gating: If <= 2 Stars, offer private feedback option compliant with Google policies */}
            {currentRating <= 2 ? (
              <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-[#1B2232]/80 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-[#dfe2ee]">
                    <span className="font-bold text-amber-300 block mb-0.5">We strive for 5-star perfection!</span>
                    Please tell our management directly what happened so we can make it right immediately.
                  </div>
                </div>

                {privateFeedbackSent ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold">
                    ✓ Thank you! Your feedback has been sent directly to executive management.
                  </div>
                ) : (
                  <form onSubmit={handleSendPrivateFeedback} className="flex flex-col gap-2">
                    <textarea
                      rows={2}
                      placeholder="Share your experience privately with the owner..."
                      value={privateFeedbackText}
                      onChange={(e) => setPrivateFeedbackText(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#121824] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={privateFeedbackName}
                        onChange={(e) => setPrivateFeedbackName(e.target.value)}
                        className="p-2 rounded-xl bg-[#121824] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="Your phone (optional)"
                        value={privateFeedbackPhone}
                        onChange={(e) => setPrivateFeedbackPhone(e.target.value)}
                        className="p-2 rounded-xl bg-[#121824] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={privateFeedbackSubmitting || !privateFeedbackText.trim()}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black text-xs font-bold transition-colors cursor-pointer"
                    >
                      {privateFeedbackSubmitting ? "Sending..." : "Submit Private Resolution"}
                    </button>
                  </form>
                )}

                {/* Secondary Option: Still allow user to post directly to Google Reviews */}
                <div className="pt-1 text-center">
                  <a
                    href={googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-zinc-400 hover:text-white underline"
                  >
                    Or continue directly to Google Reviews
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* What stood out? Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#F8FAFC]">
                    What stood out? (Tap 1 or more) <span className="text-[#f59e0b]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTags.has(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 cursor-pointer border ${
                            isSelected
                              ? "bg-[#f59e0b]/20 text-[#ffb95f] font-bold border-[#f59e0b]/40 shadow-xs"
                              : "bg-[#1B2232] text-[#94A3B8] hover:text-[#F8FAFC] border-white/5"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Length Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#F8FAFC]">Review Length</label>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#1B2232] border border-white/5">
                    {(["short", "medium", "detailed"] as const).map((len) => {
                      const isLen = selectedLength === len;
                      const labels = { short: "Short (1–2)", medium: "Medium (3–4)", detailed: "Detailed (5+)" };
                      return (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setSelectedLength(len)}
                          className={`py-2 px-1.5 rounded-lg text-xs text-center transition-all cursor-pointer ${
                            isLen
                              ? "bg-[#262a33] text-[#F8FAFC] font-bold shadow"
                              : "text-[#94A3B8] hover:text-[#F8FAFC]"
                          }`}
                        >
                          {labels[len]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generated Review Suggestion Box */}
                {(showReviewBox || generatedReview) && (
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#1B2232]/80 border border-[#ffc174]/20 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[#ffc174] text-xs font-semibold">
                      <span>Generated Review Ready</span>
                      <button 
                        type="button" 
                        onClick={handleCopyReview}
                        className="inline-flex items-center gap-1 text-[#ffb95f] hover:text-[#ffc174] cursor-pointer"
                      >
                        {copiedReview ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-[#F8FAFC] italic leading-relaxed">
                      &ldquo;{generatedReview}&rdquo;
                    </p>
                  </div>
                )}

                {/* Write my review Golden Action CTA */}
                <button 
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#ffc174] to-[#f59e0b] text-[#2a1700] text-sm font-extrabold shadow-[0_0_24px_-2px_rgba(245,158,11,0.35)] hover:shadow-[0_0_32px_rgba(245,158,11,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer" 
                  type="button"
                  onClick={handleSubmitReview}
                >
                  <Sparkles className="w-5 h-5 fill-black text-black" />
                  <span>Write my review</span>
                </button>

                <div className="text-center">
                  <span className="text-[11px] text-[#94A3B8]">
                    You will be seamlessly redirected to Google Reviews
                  </span>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* 10. FOOTER */}
      <footer className="w-full bg-[#0a0e16] mt-8 border-t border-white/5">
        <div className="max-w-[480px] mx-auto px-4 py-6 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#ffc174]" />
            <span>Powered by ZenTap Digital Systems</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#d8c3ad]">
            <button 
              onClick={() => setOwnerModalOpen(true)} 
              className="hover:text-[#ffc174] transition-colors cursor-pointer"
            >
              Business Portal
            </button>
            <span className="text-white/20">•</span>
            <Link href="/privacy" className="hover:text-[#ffc174] transition-colors">
              Privacy &amp; Terms
            </Link>
          </div>
          <span className="text-[11px] text-[#94A3B8]/70">
            © 2025 ZenTap Solutions. All rights reserved.
          </span>
        </div>
      </footer>

      {/* 11. OWNER ACCESS MODAL */}
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
  );
}
