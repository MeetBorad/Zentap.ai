"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  Radio, 
  QrCode, 
  Layers, 
  Sliders, 
  Eye, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Palette,
  Type,
  Image as ImageIcon
} from "lucide-react";
import { CustomCardDesign } from "@/lib/businessStore";

interface CardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDesign?: CustomCardDesign;
  businessName?: string;
  onSaveDesign?: (design: CustomCardDesign) => void;
  onProceedOrder?: (design: CustomCardDesign) => void;
}

export default function CardCustomizerModal({
  isOpen,
  onClose,
  initialDesign,
  businessName = "YOUR BUSINESS",
  onSaveDesign,
  onProceedOrder,
}: CardCustomizerModalProps) {
  const [format, setFormat] = useState<"standee" | "card">(initialDesign?.format || "standee");
  const [material, setMaterial] = useState<
    "metal_obsidian" | "brushed_silver" | "brushed_gold" | "acrylic_minimal" | "executive_emerald"
  >(initialDesign?.material || "metal_obsidian");
  const [customName, setCustomName] = useState<string>(initialDesign?.business_name || businessName);
  const [tagline, setTagline] = useState<string>(
    initialDesign?.tagline || "Tap with phone or scan QR to review"
  );
  const [accentColor, setAccentColor] = useState<string>(initialDesign?.accent_color || "#D94826");
  const [logoPreview, setLogoPreview] = useState<string | null>(initialDesign?.logo_preview || null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [showRealPhoto, setShowRealPhoto] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MATERIAL_PHOTOS: Record<string, string> = {
    brushed_gold: "/standees/Gold.webp",
    brushed_silver: "/standees/Steel.webp",
    acrylic_minimal: "/standees/Wood Trans.webp",
    executive_emerald: "/standees/Pink.webp",
    metal_obsidian: "/standees/3.webp",
  };

  useEffect(() => {
    if (initialDesign) {
      if (initialDesign.format) setFormat(initialDesign.format);
      if (initialDesign.material) setMaterial(initialDesign.material);
      if (initialDesign.business_name) setCustomName(initialDesign.business_name);
      if (initialDesign.tagline) setTagline(initialDesign.tagline);
      if (initialDesign.accent_color) setAccentColor(initialDesign.accent_color);
      if (initialDesign.logo_preview) setLogoPreview(initialDesign.logo_preview);
    }
  }, [initialDesign]);

  // Generate demo QR code for preview
  useEffect(() => {
    const generatePreviewQr = async () => {
      try {
        const url = await QRCode.toDataURL("https://www.zentapdigitalsolutions.com/r/demo", {
          margin: 1,
          width: 200,
          color: {
            dark: material === "acrylic_minimal" ? "#1C1B1A" : "#FFFFFF",
            light: material === "acrylic_minimal" ? "#F2F0EB" : "#00000000",
          },
        });
        setQrUrl(url);
      } catch (e) {
        console.warn("QR preview generate error", e);
      }
    };
    generatePreviewQr();
  }, [material]);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Logo file should be under 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentDesignObj: CustomCardDesign = {
    format,
    material,
    business_name: customName,
    tagline,
    accent_color: accentColor,
    logo_preview: logoPreview || undefined,
  };

  const handleSave = () => {
    if (onSaveDesign) {
      onSaveDesign(currentDesignObj);
    }
    onClose();
  };

  const handleOrder = () => {
    if (onProceedOrder) {
      onProceedOrder(currentDesignObj);
    }
    onClose();
  };

  // Material style helper classes
  const getMaterialClasses = () => {
    switch (material) {
      case "brushed_silver":
        return "bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 text-slate-900 border-slate-400/80 shadow-[0_20px_50px_rgba(148,163,184,0.3)]";
      case "brushed_gold":
        return "bg-gradient-to-tr from-[#8C6D2B] via-[#E6C673] to-[#A37B30] text-amber-950 border-[#D4AF37] shadow-[0_20px_50px_rgba(212,175,55,0.35)]";
      case "acrylic_minimal":
        return "bg-[#FAF9F6] text-[#1C1B1A] border-[#E2DFD8] shadow-[0_20px_50px_rgba(0,0,0,0.08)]";
      case "executive_emerald":
        return "bg-gradient-to-tr from-[#062419] via-[#0E4935] to-[#041710] text-emerald-50 border-emerald-500/40 shadow-[0_20px_50px_rgba(16,185,129,0.25)]";
      case "metal_obsidian":
      default:
        return "bg-gradient-to-tr from-[#121214] via-[#1C1B1E] to-[#0A0A0C] text-white border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)]";
    }
  };

  const isLight = material === "acrylic_minimal" || material === "brushed_silver";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#141720] text-white rounded-3xl border border-[#232734] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#232734] flex items-center justify-between flex-shrink-0 bg-[#0e1015]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff7a00] text-black flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-white">
                Hardware Design Studio
              </h2>
              <p className="text-[11px] text-slate-300">
                Customize your physical NFC Standee or Metal/PVC Card in real-time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Controls, Right Real-Time Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Format Selector: Standee vs Card */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Hardware Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat("standee")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    format === "standee"
                      ? "border-[#ff7a00] bg-[#ff7a00]/10 text-[#ff7a00] font-bold shadow-sm"
                      : "border-[#232734] bg-[#0e1015] hover:border-[#ff7a00]/50 text-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Counter Standee</span>
                    <span className="text-[10px] text-slate-300">For Desk / Dining Tables</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("card")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    format === "card"
                      ? "border-[#ff7a00] bg-[#ff7a00]/10 text-[#ff7a00] font-bold shadow-sm"
                      : "border-[#232734] bg-[#0e1015] hover:border-[#ff7a00]/50 text-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Smart Tap Card</span>
                    <span className="text-[10px] text-slate-300">Metal / PVC Pocket Card</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Material & Finish */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Material Finish
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "metal_obsidian", name: "Matte Obsidian", color: "bg-neutral-900", border: "border-zinc-700" },
                  { id: "brushed_silver", name: "Brushed Steel", color: "bg-slate-300", border: "border-slate-400" },
                  { id: "brushed_gold", name: "Brushed Gold", color: "bg-[#D4AF37]", border: "border-amber-500" },
                  { id: "acrylic_minimal", name: "Pure Minimal White", color: "bg-[#FAF9F6]", border: "border-zinc-300" },
                  { id: "executive_emerald", name: "Emerald Green", color: "bg-emerald-900", border: "border-emerald-500" },
                ].map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setMaterial(mat.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      material === mat.id
                        ? "border-[#ff7a00] ring-1 ring-[#ff7a00] bg-white/10 font-bold"
                        : "border-[#232734] bg-[#0e1015] hover:border-zinc-400"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${mat.color} ${mat.border} border shadow-inner flex-shrink-0`} />
                    <span className="text-[11px] truncate text-white">
                      {mat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Logo Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Business Logo / Symbol
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-4 rounded-xl border border-dashed border-[#232734] hover:border-[#ff7a00] text-xs font-semibold text-white transition-colors flex items-center gap-2 cursor-pointer bg-[#0e1015]"
                >
                  <Upload className="w-3.5 h-3.5 text-[#ff7a00]" />
                  <span>{logoPreview ? "Change Logo" : "Upload Business Logo"}</span>
                </button>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview(null)}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-300 mt-1">
                PNG, SVG, or JPG with transparent or clean background recommended
              </p>
            </div>

            {/* Business Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Business Name (Laser-Etched / Printed)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter Business Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#232734] bg-[#0e1015] text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
              />
            </div>

            {/* Custom Tagline */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Custom Tagline / Call to Action
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Tap with phone or scan QR to review"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#232734] bg-[#0e1015] text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]"
              />
            </div>

            {/* Accent Color Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Accent Highlight Color
              </label>
              <div className="flex items-center gap-2">
                {[
                  { hex: "#D94826", label: "ZenTap Orange" },
                  { hex: "#D4AF37", label: "Imperial Gold" },
                  { hex: "#10B981", label: "Emerald" },
                  { hex: "#3B82F6", label: "Cobalt Blue" },
                  { hex: "#8B5CF6", label: "Violet" },
                  { hex: "#EC4899", label: "Rose" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAccentColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                      accentColor === c.hex ? "scale-125 ring-2 ring-offset-2 ring-black dark:ring-white" : "opacity-80 hover:opacity-100"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Live Interactive Specimen Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0e1015] border border-[#232734]">
            
            {/* View Mode Switcher */}
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>Live Specimen Preview</span>
              </span>

              {format === "standee" && (
                <div className="flex items-center gap-1 bg-[#141720] p-1 rounded-full border border-[#232734]">
                  <button
                    type="button"
                    onClick={() => setShowRealPhoto(true)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                      showRealPhoto ? "bg-[#ff7a00] text-black font-bold" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Real Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRealPhoto(false)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                      !showRealPhoto ? "bg-[#ff7a00] text-black font-bold" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Diagram
                  </button>
                </div>
              )}
            </div>

            {/* STAND DISPLAY */}
            {format === "standee" ? (
              showRealPhoto ? (
                /* Authentic Real Photo Showcase */
                <div className="relative w-full max-w-[280px] sm:max-w-[300px] aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-b from-[#141720] to-[#0a0c10] border-2 border-[#232734] shadow-2xl flex flex-col items-center justify-between p-3.5 select-none group">
                  <img
                    src={MATERIAL_PHOTOS[material] || "/standees/Gold.png"}
                    alt="Authentic ZenTap Standee"
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                  
                  {/* Top Business Name / Logo Badge */}
                  <div className="relative z-10 w-full flex items-center justify-between px-2 pt-1">
                    <span className="font-headline font-black text-[11px] text-white bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 truncate max-w-[170px] drop-shadow">
                      {customName.toUpperCase()}
                    </span>
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-black/70 border border-white/20 p-0.5 shadow" />
                    )}
                  </div>

                  {/* Center Tap Hotspot Animation */}
                  <div className="relative z-10 my-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#ff7a00]/30 border-2 border-[#ff7a00] flex items-center justify-center animate-pulse backdrop-blur-xs">
                      <Radio className="w-6 h-6 text-[#ff7a00]" />
                    </div>
                  </div>

                  {/* Bottom Chip Bar */}
                  <div className="relative z-10 w-full bg-black/80 backdrop-blur-md rounded-xl py-1.5 px-3 flex items-center justify-between text-[9px] font-mono border border-white/10">
                    <span className="text-[#ff7a00] font-bold">NTAG216 NFC</span>
                    <span className="text-zinc-300">Level-Q Laser QR</span>
                  </div>
                </div>
              ) : (
                <div className={`relative w-full max-w-[280px] sm:max-w-[300px] aspect-[1/1.6] rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col items-center justify-between text-center ${getMaterialClasses()}`}>
                  
                  {/* Standee Header */}
                  <div className="w-full flex flex-col items-center">
                    {/* Logo or Emblem */}
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-2 overflow-hidden border"
                      style={{ borderColor: accentColor }}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Custom business logo preview on ZenTap standee" width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="w-7 h-7" style={{ color: accentColor }} />
                      )}
                    </div>

                    <span 
                      className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1"
                      style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    >
                      Review Us On Google
                    </span>

                    <h3 className="font-headline font-black text-base sm:text-lg leading-tight truncate max-w-full">
                      {customName.toUpperCase()}
                    </h3>

                    <div className="flex items-center gap-1 text-amber-400 text-xs my-1">
                      {"★".repeat(5)}
                    </div>
                  </div>

                  {/* NFC Target Zone */}
                  <div className="my-auto p-4 rounded-2xl bg-black/20 dark:bg-white/10 border border-white/20 flex flex-col items-center justify-center w-full max-w-[190px]">
                    <div 
                      className="w-11 h-11 rounded-full flex items-center justify-center mb-1.5 animate-pulse"
                      style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                    >
                      <Radio className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wide uppercase">
                      Tap Phone Here
                    </span>
                    <span className="text-[8px] opacity-70">
                      Instant NFC Connection
                    </span>
                  </div>

                  {/* Bottom QR Code & Tagline */}
                  <div className="w-full flex flex-col items-center pt-2 border-t border-current/20">
                    <div className="w-20 h-20 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center mb-2">
                      {qrUrl ? (
                        <img src={qrUrl} alt="Laser encoded Level Q QR code" width={160} height={160} className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="w-16 h-16 text-black" />
                      )}
                    </div>
                    <p className="text-[10px] font-medium leading-snug opacity-80 px-2">
                      {tagline}
                    </p>
                  </div>
                </div>
              )
            ) : (
              /* CARD DISPLAY */
              <div className={`relative w-full max-w-[340px] aspect-[1.586/1] rounded-2xl p-5 border-2 transition-all duration-300 flex flex-col justify-between ${getMaterialClasses()}`}>
                
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border shadow-sm"
                      style={{ borderColor: accentColor }}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Card design custom business logo" width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <Radio className="w-5 h-5" style={{ color: accentColor }} />
                      )}
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-70 block">
                        Smart Tap Card
                      </span>
                      <span className="text-xs font-bold tracking-tight">
                        ZenTap Connect
                      </span>
                    </div>
                  </div>

                  <span 
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-current/30"
                    style={{ color: accentColor }}
                  >
                    NTAG216
                  </span>
                </div>

                {/* Card Center */}
                <div className="my-auto py-1">
                  <span 
                    className="text-[9px] font-semibold uppercase tracking-widest block"
                    style={{ color: accentColor }}
                  >
                    Verified Partner
                  </span>
                  <h3 className="font-headline font-black text-lg sm:text-xl tracking-tight truncate drop-shadow">
                    {customName.toUpperCase()}
                  </h3>
                  <p className="text-[10px] opacity-75 truncate max-w-full">
                    {tagline}
                  </p>
                </div>

                {/* Card Bottom */}
                <div className="flex items-end justify-between pt-2 border-t border-current/20">
                  <div className="flex items-center gap-1.5 text-[9px] font-medium opacity-80">
                    <Radio className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>Hold near phone or scan QR</span>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-white p-1 shadow flex items-center justify-center">
                    {qrUrl ? (
                      <img src={qrUrl} alt="Laser encoded Level Q QR code" width={160} height={160} className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-8 h-8 text-black" />
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Laser-engraved acrylic &amp; NTAG216 certified chip</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#232734] bg-[#0e1015] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <p className="text-xs text-slate-300">
            Your customized hardware specs will be attached to your account &amp; order.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#232734] hover:bg-[#1e2230] text-xs font-semibold text-white transition-colors cursor-pointer text-center"
            >
              Save Design to Profile
            </button>

            <button
              type="button"
              onClick={handleOrder}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#ff7a00] text-black hover:bg-[#e56d00] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order with this Design</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
