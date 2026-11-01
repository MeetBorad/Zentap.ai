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
  Play
} from "lucide-react";
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
      className={`min-h-screen ${isDark ? "text-white" : "text-zinc-900"} transition-colors`}
      style={{ 
        backgroundColor: bgColor,
        fontFamily: design.font && design.font !== "Inter" ? `'${design.font}', sans-serif` : "'Outfit', sans-serif"
      }}
    >
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

        {/* 4. PRIMARY WRITE A REVIEW HERO BUTTON */}
        <div className="px-5 mt-3">
          <Link
            href={getReviewHref()}
            onClick={() => trackClick("review")}
            className={`tactile-btn w-full py-4 px-5 flex items-center justify-center gap-2.5 font-black text-sm tracking-wide shadow-lg transition-all active:scale-[0.978] cursor-pointer ${btnRoundClass}`}
            style={{
              backgroundColor: primaryColor,
              color: "#000000",
            }}
          >
            <Star className="w-5 h-5 fill-current text-black" />
            <span>{reviewBtn?.label || design.texts.write_review_btn}</span>
            <Sparkles className="w-4 h-4 text-black animate-pulse" />
          </Link>
        </div>

        {/* 5. ROUND SOCIAL ICONS ROW */}
        {socialButtons.length > 0 && (
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
            </div>
          </div>
        )}

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
                href="https://zentap.in" 
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
