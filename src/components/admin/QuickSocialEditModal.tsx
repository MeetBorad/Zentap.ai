// src/components/admin/QuickSocialEditModal.tsx
"use client";

import React, { useState } from "react";
import { 
  Phone, 
  Instagram, 
  X, 
  Check, 
  Save, 
  ExternalLink 
} from "lucide-react";
import { 
  BusinessRecord, 
  adminUpdateBusinessRecord 
} from "@/lib/businessStore";
import { adminUpdateDbBusiness } from "@/lib/supabase/service";

interface QuickSocialEditModalProps {
  business: BusinessRecord | null;
  onClose: () => void;
  onBusinessUpdated: (updatedBiz: BusinessRecord) => void;
  showToast: (msg: string) => void;
}

export default function QuickSocialEditModal({
  business,
  onClose,
  onBusinessUpdated,
  showToast,
}: QuickSocialEditModalProps) {
  if (!business) return null;

  const [whatsapp, setWhatsapp] = useState(business.whatsapp_number || "");
  const [whatsappMsg, setWhatsappMsg] = useState(business.whatsapp_message || "");
  const [instagram, setInstagram] = useState(business.instagram_url || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        whatsapp_number: whatsapp.trim() || undefined,
        whatsapp_message: whatsappMsg.trim() || undefined,
        instagram_url: instagram.trim() || undefined,
      };

      const updatedList = adminUpdateBusinessRecord(business.id, updates);
      adminUpdateDbBusiness(business.id, {
        whatsapp_number: whatsapp.trim() || null,
        whatsapp_message: whatsappMsg.trim() || null,
        instagram_url: instagram.trim() || null,
      }).catch((err) =>
        console.warn("Db update error:", err)
      );

      const updated = updatedList.find((b) => b.id === business.id) || {
        ...business,
        ...updates,
      };

      onBusinessUpdated(updated as BusinessRecord);
      showToast(`✓ Social channels updated for "${business.name}"!`);
      onClose();
    } catch (err) {
      console.warn("QuickSocialEditModal error:", err);
      showToast("Failed to update channels.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Quick Social &amp; Contact Links
            </h3>
            <p className="text-[11px] text-zinc-500">
              Update {business.name}'s review page WhatsApp and Instagram buttons.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* WhatsApp */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Contact Button</span>
            </div>
            <input
              type="tel"
              placeholder="919274560880"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <input
              type="text"
              placeholder="Prefilled message when customer taps"
              value={whatsappMsg}
              onChange={(e) => setWhatsappMsg(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>Instagram Profile Button</span>
            </div>
            <input
              type="text"
              placeholder="Instagram handle or URL (e.g. zentapdigitalsolutions)"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-white" />
              <span>{saving ? "Saving..." : "Save Channels"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
