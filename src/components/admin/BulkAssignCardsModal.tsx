// src/components/admin/BulkAssignCardsModal.tsx
"use client";

import React, { useState } from "react";
import { 
  Layers, 
  X, 
  Check, 
  Building2, 
  Tag, 
  Phone, 
  Instagram,
  UserCheck
} from "lucide-react";
import { 
  TagRecord, 
  BusinessRecord, 
  TagType, 
  batchAssignTags, 
  getAllTags 
} from "@/lib/businessStore";

interface BulkAssignCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: BusinessRecord[];
  tags: TagRecord[];
  onTagsUpdated: (tags: TagRecord[]) => void;
  showToast: (msg: string) => void;
}

export default function BulkAssignCardsModal({
  isOpen,
  onClose,
  businesses,
  tags,
  onTagsUpdated,
  showToast,
}: BulkAssignCardsModalProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>(businesses[0]?.id || "");
  const [count, setCount] = useState<number>(5);
  const [type, setType] = useState<TagType>("whatsapp");
  const [labelPrefix, setLabelPrefix] = useState<string>("Staff Member");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [whatsappMessage, setWhatsappMessage] = useState<string>("Hi, I tapped your employee ZenTap card!");
  const [instagramHandle, setInstagramHandle] = useState<string>("");

  if (!isOpen) return null;

  // Free cards available
  const freeCards = tags.filter((t) => !t.business_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId) {
      showToast("Please select a target business.");
      return;
    }

    if (freeCards.length === 0) {
      showToast("No free cards available in inventory. Generate a batch first.");
      return;
    }

    const cardsToAssign = freeCards.slice(0, Math.min(count, freeCards.length));
    const ids = cardsToAssign.map((c) => c.id);

    const updated = batchAssignTags(ids, selectedBizId, type, {
      labelPrefix: labelPrefix.trim() || undefined,
      whatsapp_number: whatsappNumber.trim() || undefined,
      whatsapp_message: whatsappMessage.trim() || undefined,
      instagram_handle: instagramHandle.trim() || undefined,
    });

    onTagsUpdated(updated);
    const biz = businesses.find((b) => b.id === selectedBizId);
    showToast(`✓ Successfully assigned ${ids.length} card(s) to "${biz?.name || "Business"}"!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-zinc-900">
                Bulk Card Assignment
              </h3>
              <p className="text-[11px] text-zinc-500">
                Assign multiple employee cards to a company in one click.
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Target Business */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Select Client / Company *
            </label>
            <select
              value={selectedBizId}
              onChange={(e) => setSelectedBizId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city || "Ahmedabad"})
                </option>
              ))}
            </select>
          </div>

          {/* Number of Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Cards to Assign ({freeCards.length} Free)
              </label>
              <input
                type="number"
                min={1}
                max={freeCards.length || 1}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Card Purpose
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TagType)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 bg-white"
              >
                <option value="whatsapp">WhatsApp Direct</option>
                <option value="instagram">Instagram Direct</option>
                <option value="review">Google Review</option>
              </select>
            </div>
          </div>

          {/* Label Prefix */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Label Prefix (Auto-numbered)
            </label>
            <input
              type="text"
              placeholder="e.g. Sales Executive, Staff Member, Branch"
              value={labelPrefix}
              onChange={(e) => setLabelPrefix(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              Creates cards labeled: "{labelPrefix} #1", "{labelPrefix} #2", etc.
            </p>
          </div>

          {/* Optional Direct Contact Details */}
          {type === "whatsapp" && (
            <div className="space-y-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
              <input
                type="tel"
                placeholder="Company Default WhatsApp (e.g. 919825000000)"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 bg-white"
              />
              <input
                type="text"
                placeholder="Prefilled message"
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white"
              />
            </div>
          )}

          {type === "instagram" && (
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
              <input
                type="text"
                placeholder="Company Instagram Handle (e.g. zentapdigitalsolutions)"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white"
              />
            </div>
          )}

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
              disabled={freeCards.length === 0}
              className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Assign {count} Cards</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
