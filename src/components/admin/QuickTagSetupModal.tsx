// src/components/admin/QuickTagSetupModal.tsx
"use client";

import React, { useState } from "react";
import { 
  QrCode, 
  X, 
  Plus, 
  Check, 
  Building2, 
  Radio, 
  ExternalLink,
  Phone,
  Instagram,
  Sparkles
} from "lucide-react";
import { 
  TagRecord, 
  BusinessRecord, 
  TagForm, 
  TagType, 
  TagDestination,
  createSingleTag,
  assignTag,
  getAllTags,
  addBusinessRecord,
  getAllBusinesses
} from "@/lib/businessStore";

interface QuickTagSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: BusinessRecord[];
  onTagsUpdated: (tags: TagRecord[]) => void;
  onBusinessesUpdated: (businesses: BusinessRecord[]) => void;
  showToast: (msg: string) => void;
  initialCode?: string;
}

export default function QuickTagSetupModal({
  isOpen,
  onClose,
  businesses,
  onTagsUpdated,
  onBusinessesUpdated,
  showToast,
  initialCode = "",
}: QuickTagSetupModalProps) {
  const [code, setCode] = useState(initialCode);
  const [form, setForm] = useState<TagForm>("standee");
  const [chipWritten, setChipWritten] = useState(true);

  // Business Selection
  const [selectedBizId, setSelectedBizId] = useState<string>("");
  const [createNewBizInline, setCreateNewBizInline] = useState(false);
  const [inlineBizName, setInlineBizName] = useState("");
  const [inlineReviewUrl, setInlineReviewUrl] = useState("");

  // Purpose & Destination
  const [type, setType] = useState<TagType>("review");
  const [destination, setDestination] = useState<TagDestination>("zentap_page");
  const [label, setLabel] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.toLowerCase().trim();
    if (!cleanCode) {
      showToast("Please enter a hardware code (e.g. zt-0042).");
      return;
    }

    let finalBizId = selectedBizId;

    // Inline business creation if toggled
    if (createNewBizInline && inlineBizName.trim()) {
      const newBiz = addBusinessRecord({
        name: inlineBizName.trim(),
        owner_name: inlineBizName.trim() + " Owner",
        owner_user_id: `owner-${Date.now()}`,
        email: `${cleanCode}@client.zentap.in`,
        phone: "919800000000",
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        pincode: "380001",
        gbp_link: "",
        slug: cleanCode,
        active: true,
        review_url: inlineReviewUrl.trim() || null,
        plan: form === "card" ? "card_500" : "standee_1500",
        payment_status: "paid",
        redirect_mode: destination === "direct" ? "direct_review" : "interactive_profile",
      });
      finalBizId = newBiz.id;
      onBusinessesUpdated(getAllBusinesses());
    }

    const updatedTags = createSingleTag({
      code: cleanCode,
      form,
      chip_written: chipWritten,
      business_id: finalBizId || null,
      type: finalBizId ? type : null,
      destination,
      label: label.trim() || undefined,
      whatsapp_number: whatsappNumber.trim() || undefined,
      whatsapp_message: whatsappMessage.trim() || undefined,
      instagram_handle: instagramHandle.trim() || undefined,
    });

    onTagsUpdated(updatedTags);
    showToast(`✓ Quick Setup Complete: Tag "${cleanCode.toUpperCase()}" is live!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff7a00] text-black flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-zinc-900">
                1-Step Quick Tag Setup
              </h3>
              <p className="text-[11px] text-zinc-500">
                Scan or enter a tag code, assign business, and set destination in one step.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Step 1: Code & Hardware Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Hardware Tag Code *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. zt-0042"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm text-zinc-900 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Hardware Form
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm("standee")}
                  className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    form === "standee" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500"
                  }`}
                >
                  Standee
                </button>
                <button
                  type="button"
                  onClick={() => setForm("card")}
                  className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    form === "card" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500"
                  }`}
                >
                  Card
                </button>
              </div>
            </div>
          </div>

          {/* Chip Written Verification */}
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={chipWritten}
              onChange={(e) => setChipWritten(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-semibold text-emerald-900">
              NFC chip written &amp; physically verified on hardware
            </span>
          </label>

          {/* Step 2: Business Assignment */}
          <div className="space-y-2 pt-1 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700">
                Assign to Business
              </label>
              <button
                type="button"
                onClick={() => setCreateNewBizInline(!createNewBizInline)}
                className="text-[11px] font-bold text-[#e56d00] hover:underline cursor-pointer"
              >
                {createNewBizInline ? "Select Existing Business" : "+ Create New Inline"}
              </button>
            </div>

            {createNewBizInline ? (
              <div className="space-y-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-200 animate-in slide-in-from-top-2">
                <input
                  type="text"
                  required
                  placeholder="New Business Name (e.g. Havmor Ice Cream)"
                  value={inlineBizName}
                  onChange={(e) => setInlineBizName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
                <input
                  type="url"
                  placeholder="Google Review Link (optional)"
                  value={inlineReviewUrl}
                  onChange={(e) => setInlineReviewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
              </div>
            ) : (
              <select
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="">-- Leave Unassigned (Free Inventory) --</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city || "Ahmedabad"})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 3: Destination & Parameters */}
          <div className="space-y-3 pt-1 border-t border-zinc-100">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Card Purpose
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TagType)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 bg-white"
                >
                  <option value="review">Google Review</option>
                  <option value="whatsapp">WhatsApp Direct Chat</option>
                  <option value="instagram">Instagram Profile</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Destination Mode
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as TagDestination)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 bg-white"
                >
                  <option value="zentap_page">ZenTap Interactive Page</option>
                  <option value="direct">Direct Redirection (302)</option>
                </select>
              </div>
            </div>

            {/* Employee Label */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Employee Label / Note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Reception Desk, Meet (Founder), Sales Rep #2"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-md transition-transform active:scale-[0.978]"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Save &amp; Activate Tag</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
