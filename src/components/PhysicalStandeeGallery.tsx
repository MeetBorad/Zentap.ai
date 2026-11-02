"use client";

import React, { useState } from "react";
import { 
  Radio, 
  Check, 
  Maximize2, 
  MessageCircle,
  Eye
} from "lucide-react";
import { trackWhatsAppClick } from "@/lib/analytics";

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
    src: "/standees/Gold.webp",
    description: "Brushed champagne gold faceplate with reflective mirror accents. Popular for premium restaurants, luxury salons, and boutique hotels.",
    spec: "Brushed Gold Acrylic · High-Clarity QR Code",
  },
  {
    id: "finish-steel",
    name: "Brushed Stainless Steel",
    category: "finish",
    tag: "Modern Metallic",
    src: "/standees/Steel.webp",
    description: "Industrial satin brushed steel finish with anti-fingerprint coating. Designed for high-traffic billing counters, clinics, and cafes.",
    spec: "Brushed Steel Plate · Scratch-Resistant Finish",
  },
  {
    id: "finish-wood",
    name: "Wood Base & Transparent Acrylic",
    category: "finish",
    tag: "Minimal & Organic",
    src: "/standees/Wood Trans.webp",
    description: "Crystal-clear acrylic plate slotted into a solid beechwood base. Blends seamlessly with warm, artisanal interiors.",
    spec: "Natural Wood Base · 5mm Pure Acrylic",
  },
  {
    id: "finish-pink",
    name: "Rose Gold / Blush Metallic",
    category: "finish",
    tag: "Designer Series",
    src: "/standees/Pink.webp",
    description: "Soft rose gold sheen with radiant edge finish. Favored by aesthetics clinics, spas, beauty bars, and designer studios.",
    spec: "Rose Gold Metallic · Smooth Acrylic Finish",
  },
  {
    id: "angle-1",
    name: "Perspective Counter Setup",
    category: "angle",
    tag: "Studio View 01",
    src: "/standees/1.webp",
    description: "Showcase of the standee and companion smart review card positioned on a hospitality billing counter.",
    spec: "Front Desk Setup · Zero Batteries Required",
  },
  {
    id: "angle-2",
    name: "Tap & Scan Target Close-Up",
    category: "angle",
    tag: "Studio View 02",
    src: "/standees/2.webp",
    description: "Detailed view of the smartphone tap zone, Google review styling, and business branding header.",
    spec: "Instant Tap & QR Code Target",
  },
  {
    id: "angle-3",
    name: "Frontal Presentation",
    category: "angle",
    tag: "Studio View 03",
    src: "/standees/3.webp",
    description: "Full frontal view showing balanced layout: your business logo, clear call-to-action, and high-clarity QR code.",
    spec: "High-Contrast QR Code · Direct Google Link",
  },
  {
    id: "angle-4",
    name: "Acrylic Depth & Bevels",
    category: "angle",
    tag: "Studio View 04",
    src: "/standees/4.webp",
    description: "Highlighting the polished beveled edges and optical clarity of the high-grade cast acrylic block.",
    spec: "Smooth Cut Edges · Durable Acrylic",
  },
  {
    id: "angle-5",
    name: "Cafe & Dining Table Setting",
    category: "angle",
    tag: "Studio View 05",
    src: "/standees/5.webp",
    description: "Placement on dining tables, showing the compact desk footprint that never takes up too much table space.",
    spec: "Compact Stance · Sturdy Weighted Base",
  },
  {
    id: "angle-6",
    name: "High-Clarity QR Code Detail",
    category: "angle",
    tag: "Studio View 06",
    src: "/standees/6.webp",
    description: "Detail of the clean laser-etched QR code, engineered to scan easily even in soft ambient room lighting.",
    spec: "Quick Camera Scan · Scannable in Low Light",
  },
];

export default function PhysicalStandeeGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<StandeePhotoItem>(STANDEE_PHOTOS[0]);
  const [activeTab, setActiveTab] = useState<"all" | "finishes" | "angles">("all");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredPhotos = STANDEE_PHOTOS.filter((p) => {
    if (activeTab === "finishes") return p.category === "finish";
    if (activeTab === "angles") return p.category === "angle";
    return true;
  });

  return (
    <section id="photos" className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2230] border border-[#2d3345] text-[11px] font-mono text-[#ff7a00] font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#ff7a00]" />
            <span>REAL HARDWARE PHOTOS</span>
          </div>
          <h2 className="font-headline font-extrabold text-2xl sm:text-4xl text-white tracking-tight text-balance">
            How It Looks on Your Counter
          </h2>
          <p className="text-sm text-slate-200 mt-2 max-w-2xl leading-relaxed">
            Real photos of our counter review stands. Premium acrylic and natural wood finishes designed to fit beautifully on any counter.
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
            Finishes
          </button>
          <button
            onClick={() => setActiveTab("angles")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "angles"
                ? "bg-[#ff7a00] text-black font-bold shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Counter Views
          </button>
        </div>
      </div>

      {/* Main Interactive Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#141720] border border-[#232734] rounded-3xl p-6 sm:p-10 shadow-2xl">
        
        {/* Left: Big Hero Photography Viewer */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1e2b] to-[#0e1015] border border-[#2d3345] shadow-2xl group flex items-center justify-center p-3 sm:p-5">
            <div className="absolute inset-0 bg-radial from-[#ff7a00]/10 via-transparent to-transparent pointer-events-none" />

            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.name}
              className="w-full h-full object-contain rounded-xl drop-shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
            />

            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-colors border border-white/20 shadow-lg cursor-pointer"
              title="View full resolution"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Hardware Details */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#1e2230] text-[#ff7a00] text-xs font-bold border border-[#2d3345]">
              {selectedPhoto.tag}
            </span>

            <h3 className="font-headline font-bold text-2xl text-white mt-3">
              {selectedPhoto.name}
            </h3>

            <p className="text-sm text-slate-200 mt-3 leading-relaxed">
              {selectedPhoto.description}
            </p>

            <div className="mt-5 pt-4 border-t border-[#232734] flex items-center gap-3">
              <Radio className="w-5 h-5 text-[#ff7a00] flex-shrink-0" />
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Material Details
                </span>
                <span className="text-xs font-semibold text-white font-mono">
                  {selectedPhoto.spec}
                </span>
              </div>
            </div>

            {/* Hardware Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
              <div className="flex items-start gap-2 py-1">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-100 text-xs font-medium">Zero batteries or charging required</span>
              </div>
              <div className="flex items-start gap-2 py-1">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-100 text-xs font-medium">Works on any smartphone (tap or scan)</span>
              </div>
              <div className="flex items-start gap-2 py-1">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-100 text-xs font-medium">Custom printed with your business name</span>
              </div>
              <div className="flex items-start gap-2 py-1">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-100 text-xs font-medium">Change your Google link anytime</span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-[#232734] flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/919274560880?text=Hello%20ZenTap%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(selectedPhoto.name)}%20standee.`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsAppClick("gallery_contact_whatsapp")}
              className="tactile-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs shadow-md transition-transform active:scale-[0.978] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Contact us on WhatsApp</span>
            </a>
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
              <p className={`text-[11px] font-bold truncate leading-tight ${isSelected ? "text-black" : "text-white"}`}>
                {photo.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.name}
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center">
              <p className="text-white font-bold text-lg">{selectedPhoto.name}</p>
              <p className="text-slate-400 text-xs mt-1">{selectedPhoto.description}</p>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="mt-4 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
