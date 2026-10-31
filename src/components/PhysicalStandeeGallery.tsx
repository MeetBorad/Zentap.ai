"use client";

import React, { useState } from "react";
import { 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  QrCode, 
  Check, 
  Maximize2, 
  ArrowRight,
  Eye,
  Sliders
} from "lucide-react";
import { OpenDesignButton } from "./open-design";

export interface StandeePhotoItem {
  id: string;
  name: string;
  category: "finish" | "angle";
  tag: string;
  src: string;
  description: string;
  spec: string;
}

export const STANDEE_PHOTOS: StandeePhotoItem[] = [
  {
    id: "finish-gold",
    name: "Champagne Gold Mirror",
    category: "finish",
    tag: "Luxury Finish",
    src: "/standees/Gold.png",
    description: "Brushed champagne gold faceplate with high-reflectivity mirror accents. Popular for premium restaurants, luxury salons, and boutique hotels.",
    spec: "Brushed Gold Acrylic · NTAG216 · Level Q QR",
  },
  {
    id: "finish-steel",
    name: "Brushed Stainless Steel",
    category: "finish",
    tag: "Modern Metallic",
    src: "/standees/Steel.png",
    description: "Industrial satin brushed steel finish with anti-fingerprint coating. Engineered for high-traffic billing counters, clinics, and modern cafes.",
    spec: "Brushed Steel Plate · ISO 14443A · 888 Bytes",
  },
  {
    id: "finish-wood",
    name: "Wood Base & Transparent Acrylic",
    category: "finish",
    tag: "Minimal & Organic",
    src: "/standees/Wood Trans.png",
    description: "Laser-cut crystal-clear 5mm acrylic plate slotted into a hand-finished solid beechwood base. Blends seamlessly with warm, artisanal interiors.",
    spec: "Natural Wood Base · 5mm Pure Acrylic · 13.56 MHz",
  },
  {
    id: "finish-pink",
    name: "Rose Gold / Blush Metallic",
    category: "finish",
    tag: "Designer Series",
    src: "/standees/Pink.png",
    description: "Soft rose gold sheen with radiant edge glow. Highly favored by aesthetics clinics, spas, beauty bars, and designer studios.",
    spec: "Rose Gold Metallic · NFC Handshake < 0.6s",
  },
  {
    id: "angle-1",
    name: "Perspective Counter Setup",
    category: "angle",
    tag: "Studio Angle 01",
    src: "/standees/1.png",
    description: "Side-by-side showcase of the standee and companion smart review card positioned on a hospitality billing counter.",
    spec: "Front Desk Staging · Zero Batteries Required",
  },
  {
    id: "angle-2",
    name: "NFC Tap Target Close-Up",
    category: "angle",
    tag: "Studio Angle 02",
    src: "/standees/2.png",
    description: "Detailed view of the illuminated NFC radar wave icon, Google 5-star review styling, and business branding header.",
    spec: "Dual-Frequency Sensing · Smartphone Tap Target",
  },
  {
    id: "angle-3",
    name: "Frontal Presentation",
    category: "angle",
    tag: "Studio Angle 03",
    src: "/standees/3.png",
    description: "Full frontal portrait showing balanced visual hierarchy: business logo, clear call-to-action, NFC chip zone, and dynamic QR code.",
    spec: "Level-Q Error Correction · Anti-Gating Architecture",
  },
  {
    id: "angle-4",
    name: "Acrylic Depth & Bevels",
    category: "angle",
    tag: "Studio Angle 04",
    src: "/standees/4.png",
    description: "Highlighting the polished diamond-beveled edges and optical clarity of the high-grade cast acrylic block.",
    spec: "Diamond-Cut Edges · Scratch-Resistant Finish",
  },
  {
    id: "angle-5",
    name: "Cafe & Dining Table Setting",
    category: "angle",
    tag: "Studio Angle 05",
    src: "/standees/5.png",
    description: "Natural ambient placement on dining tables, showing the compact desk footprint that never obstructs table service.",
    spec: "Compact Stance · Weighted Anti-Tip Architecture",
  },
  {
    id: "angle-6",
    name: "Dynamic Laser QR Code Detail",
    category: "angle",
    tag: "Studio Angle 06",
    src: "/standees/6.png",
    description: "Micro-detail of the high-contrast laser-etched QR code, engineered to scan instantly even in low-light ambient dining rooms.",
    spec: "Instant Camera Handshake · Low-Light Scannable",
  },
];

interface PhysicalStandeeGalleryProps {
  onOrderClick: () => void;
  onCustomizeClick: () => void;
}

export default function PhysicalStandeeGallery({
  onOrderClick,
  onCustomizeClick,
}: PhysicalStandeeGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<StandeePhotoItem>(STANDEE_PHOTOS[0]);
  const [activeTab, setActiveTab] = useState<"all" | "finishes" | "angles">("all");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredPhotos = STANDEE_PHOTOS.filter((p) => {
    if (activeTab === "finishes") return p.category === "finish";
    if (activeTab === "angles") return p.category === "angle";
    return true;
  });

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2230] border border-[#2d3345] text-[11px] font-mono text-[#ff7a00] font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#ff7a00] animate-pulse" />
            <span>AUTHENTIC PHYSICAL HARDWARE PHOTOGRAPHY</span>
          </div>
          <h2 className="font-headline font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            How ZenTap Look on Your Counter
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
            Real photos of our precision laser-crafted smart standees. Featuring embedded NTAG216 NFC chips, Level-Q dynamic QR codes, and 4 premium material finishes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#141720] border border-[#232734] self-start md:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-[#ff7a00] text-black font-bold shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            All 10 Photos
          </button>
          <button
            onClick={() => setActiveTab("finishes")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "finishes"
                ? "bg-[#ff7a00] text-black font-bold shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            4 Material Finishes
          </button>
          <button
            onClick={() => setActiveTab("angles")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "angles"
                ? "bg-[#ff7a00] text-black font-bold shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Counter Angles
          </button>
        </div>
      </div>

      {/* Main Interactive Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#141720] border border-[#232734] rounded-3xl p-6 sm:p-10 shadow-2xl">
        
        {/* Left: Big Hero Photography Viewer */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1e2b] to-[#0e1015] border border-[#2d3345] shadow-2xl group flex items-center justify-center p-3 sm:p-5">
            
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-radial from-[#ff7a00]/10 via-transparent to-transparent pointer-events-none" />

            {/* Main High-Res Image */}
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.name}
              className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.03]"
            />

            {/* Badges Over Image */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#ff7a00] font-bold uppercase tracking-wider">
                {selectedPhoto.tag}
              </span>
            </div>

            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/70 hover:bg-[#ff7a00] hover:text-black text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
              title="Click to expand high-resolution photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-300 mt-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#ff7a00]" />
            <span>Authentic unedited studio specimen · Click thumbnails below to inspect</span>
          </span>
        </div>

        {/* Right: Technical Spec & Material Details */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1e2230] border border-[#2d3345] text-[10px] font-mono text-[#ff7a00] font-semibold mb-2">
              <span>{selectedPhoto.category === "finish" ? "PREMIUM FINISH" : "STUDIO PERSPECTIVE"}</span>
            </div>

            <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-white">
              {selectedPhoto.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed">
              {selectedPhoto.description}
            </p>

            <div className="mt-5 p-4 rounded-xl bg-[#0e1015] border border-[#232734] flex items-center gap-3">
              <Radio className="w-5 h-5 text-[#ff7a00] flex-shrink-0" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Hardware Specification
                </span>
                <span className="text-xs font-semibold text-white font-mono">
                  {selectedPhoto.spec}
                </span>
              </div>
            </div>

            {/* Hardware Pillars */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-[#0e1015]/60 border border-[#232734] flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-100 text-[11px] font-medium">Zero batteries or charging required</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e1015]/60 border border-[#232734] flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-100 text-[11px] font-medium">Instant 0.6s smartphone handshake</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e1015]/60 border border-[#232734] flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-100 text-[11px] font-medium">Custom laser-engraved with your logo</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0e1015]/60 border border-[#232734] flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-100 text-[11px] font-medium">Dynamic cloud-editable Google link</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#232734] flex flex-wrap items-center gap-3">
            <OpenDesignButton
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={onOrderClick}
            >
              Order Standee (From ₹999)
            </OpenDesignButton>

            <OpenDesignButton
              variant="secondary"
              size="md"
              icon={<Sliders className="w-4 h-4 text-[#ff7a00]" />}
              iconPosition="left"
              onClick={onCustomizeClick}
            >
              Customize with Your Logo
            </OpenDesignButton>
          </div>

        </div>

      </div>

      {/* Horizontal Thumbnail Selector Strip */}
      <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {filteredPhotos.map((photo) => {
          const isSelected = selectedPhoto.id === photo.id;
          return (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className={`flex-shrink-0 w-24 sm:w-28 rounded-2xl p-1.5 transition-all cursor-pointer text-left ${
                isSelected
                  ? "bg-[#ff7a00] ring-2 ring-[#ff7a00] shadow-lg scale-105"
                  : "bg-[#141720] hover:bg-[#1e2230] border border-[#232734] opacity-75 hover:opacity-100"
              }`}
            >
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0e1015] mb-1.5 flex items-center justify-center p-1">
                <img
                  src={photo.src}
                  alt={photo.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className={`text-[10px] font-bold truncate leading-tight ${isSelected ? "text-black" : "text-white"}`}>
                {photo.name}
              </p>
              <span className={`text-[9px] font-mono block truncate ${isSelected ? "text-black/80" : "text-slate-300"}`}>
                {photo.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Photo Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.name}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="mt-4 flex items-center justify-between w-full text-white text-xs px-2">
              <div>
                <p className="font-bold text-sm">{selectedPhoto.name}</p>
                <p className="text-zinc-400 font-mono text-[11px]">{selectedPhoto.spec}</p>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 rounded-xl bg-[#ff7a00] text-black font-bold text-xs cursor-pointer hover:bg-[#e56d00] transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
