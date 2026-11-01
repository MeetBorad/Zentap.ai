"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Edit2,
  Check,
  X,
  AlertTriangle,
  QrCode,
  Radio,
  Sparkles,
  Search,
  Building2,
  Phone,
  Link as LinkIcon,
  CheckCircle2,
  Copy,
  ChevronDown,
  Palette,
  Plus
} from "lucide-react";
import { BusinessRecord, TagRecord, TagDestination, getBusinessIdCode, assignTag } from "@/lib/businessStore";

interface LinksAndQrSettingsTabProps {
  businesses: BusinessRecord[];
  tags: TagRecord[];
  onUpdateBusiness: (id: string, updates: Partial<BusinessRecord>) => void;
  onUpdateTagDestination: (tag: TagRecord, dest: TagDestination) => void;
  onOpenPageEditor: (bizId: string) => void;
  onOpenTagSetup: (biz: BusinessRecord) => void;
  onShowToast: (msg: string) => void;
  onTagsUpdated?: (tags: TagRecord[]) => void;
}

export default function LinksAndQrSettingsTab({
  businesses,
  tags,
  onUpdateBusiness,
  onUpdateTagDestination,
  onOpenPageEditor,
  onOpenTagSetup,
  onShowToast,
  onTagsUpdated,
}: LinksAndQrSettingsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBizId, setEditingBizId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  const [editingSlugId, setEditingSlugId] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState("");

  // Manual Entry Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualBizId, setManualBizId] = useState("");
  const [manualGoogleUrl, setManualGoogleUrl] = useState("");
  const [manualSlug, setManualSlug] = useState("");
  const [manualDestination, setManualDestination] = useState<"direct_review" | "interactive_profile" | "not_assigned">("direct_review");
  const [manualTagCode, setManualTagCode] = useState("");

  // Filter businesses
  const filtered = businesses.filter((b) => {
    if (b.is_deleted) return false;
    const q = searchQuery.toLowerCase().trim();
    const bizIdCode = (b.business_id_code || getBusinessIdCode(b)).toLowerCase();
    return (
      !q ||
      bizIdCode.includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b.phone || "").toLowerCase().includes(q) ||
      (b.city || "").toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q)
    );
  });

  // Helper to find tags assigned to a business
  const getTagsForBusiness = (bizId: string) => {
    return tags.filter((t) => t.business_id === bizId);
  };

  const handleStartEditReviewUrl = (biz: BusinessRecord) => {
    setEditingBizId(biz.id);
    setEditingUrl(biz.review_url || "");
  };

  const handleSaveReviewUrl = (biz: BusinessRecord) => {
    const trimmed = editingUrl.trim();
    onUpdateBusiness(biz.id, { review_url: trimmed || null, google_review_link: trimmed || null });
    setEditingBizId(null);
    onShowToast(`✓ Google Review link updated for "${biz.name}"`);
  };

  const handleStartEditSlug = (biz: BusinessRecord) => {
    setEditingSlugId(biz.id);
    setEditingSlug(biz.slug);
  };

  const handleSaveSlug = (biz: BusinessRecord) => {
    const cleanSlug = editingSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!cleanSlug) {
      onShowToast("Slug cannot be empty");
      return;
    }
    onUpdateBusiness(biz.id, { slug: cleanSlug });
    setEditingSlugId(null);
    onShowToast(`✓ Review page slug updated to /r/${cleanSlug}`);
  };

  const handleToggleActive = (biz: BusinessRecord) => {
    const nextState = !biz.active;
    onUpdateBusiness(biz.id, { active: nextState });
    onShowToast(`✓ Activation status changed to ${nextState ? "ACTIVE" : "NOT ACTIVE"} for "${biz.name}"`);
  };

  const handleDestinationChange = (biz: BusinessRecord, dest: "interactive_profile" | "direct_review" | "not_assigned") => {
    if (dest === "not_assigned") {
      onUpdateBusiness(biz.id, { redirect_mode: undefined });
      const bizTags = getTagsForBusiness(biz.id);
      bizTags.forEach((t) => {
        onUpdateTagDestination(t, "zentap_page");
      });
      onShowToast(`✓ Destination set to "Not Assigned" for "${biz.name}"`);
      return;
    }

    onUpdateBusiness(biz.id, { redirect_mode: dest });
    
    // Also sync destination on any assigned tags
    const bizTags = getTagsForBusiness(biz.id);
    const tagDest: TagDestination = dest === "interactive_profile" ? "zentap_page" : "direct";
    bizTags.forEach((t) => {
      onUpdateTagDestination(t, tagDest);
    });

    onShowToast(`✓ QR/NFC destination set to ${dest === "interactive_profile" ? "ZenTap Google Review" : "Direct Google Review"}`);
  };

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onShowToast(`✓ Copied ${label} to clipboard!`);
    }
  };

  const handleSaveManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBizId) {
      onShowToast("Please select a business");
      return;
    }

    const updates: Partial<BusinessRecord> = {};
    if (manualGoogleUrl.trim()) {
      updates.review_url = manualGoogleUrl.trim();
      updates.google_review_link = manualGoogleUrl.trim();
    }
    if (manualSlug.trim()) {
      updates.slug = manualSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (manualDestination !== "not_assigned") {
      updates.redirect_mode = manualDestination;
    }

    onUpdateBusiness(manualBizId, updates);

    // If tag code selected, assign it
    if (manualTagCode) {
      const tagToAssign = tags.find((t) => t.code.toLowerCase() === manualTagCode.toLowerCase());
      if (tagToAssign) {
        const dest: TagDestination = manualDestination === "direct_review" ? "direct" : "zentap_page";
        const updatedTags = assignTag(tagToAssign.id, manualBizId, "review", { label: "Google Review Standee" });
        if (onTagsUpdated) onTagsUpdated(updatedTags);
      }
    }

    setManualModalOpen(false);
    setManualBizId("");
    setManualGoogleUrl("");
    setManualSlug("");
    setManualTagCode("");
    onShowToast("✓ Google Links & QR entry updated successfully!");
  };

  const unassignedTags = tags.filter((t) => !t.business_id);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-headline font-bold text-zinc-900">
            Google Links &amp; QR Setting
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Any assigned business in the batch automatically populates here. Manage Google review destinations, activation, and custom slugs.
          </p>
        </div>

        <button
          onClick={() => setManualModalOpen(true)}
          className="tactile-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-xs self-start sm:self-auto transition-transform active:scale-[0.978]"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>+ Add Manual Entry</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search Business ID, business name, contact, slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-xs"
        />
      </div>

      {/* Links & QR Master Table */}
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-600 uppercase text-[10px] font-mono tracking-wider font-semibold">
                <th className="py-3.5 px-4">Business ID</th>
                <th className="py-3.5 px-4 sm:px-6">Business Name</th>
                <th className="py-3.5 px-4">Contact Number</th>
                <th className="py-3.5 px-4">Link from Batch</th>
                <th className="py-3.5 px-4">Review Page Slug</th>
                <th className="py-3.5 px-4">Status of Activation</th>
                <th className="py-3.5 px-4">Total Scans/Taps</th>
                <th className="py-3.5 px-4">Google Review Page Link</th>
                <th className="py-3.5 px-4">Destination of QR/NFC</th>
                <th className="py-3.5 px-4 text-right">Page Editor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500">
                    No businesses match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((biz) => {
                  const bizTags = getTagsForBusiness(biz.id);
                  const primaryTag = bizTags[0];
                  const totalScans = bizTags.reduce((acc, t) => acc + (t.scan_count || 0), 0);
                  const isDirectMode = biz.redirect_mode === "direct_review";
                  const isZentapMode = biz.redirect_mode === "interactive_profile";
                  const isNotAssigned = !biz.redirect_mode;
                  const hasMissingGoogle = !biz.review_url || !biz.review_url.trim();
                  const bizIdCode = biz.business_id_code || getBusinessIdCode(biz);

                  return (
                    <tr key={biz.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* 1. Business ID */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-2xs">
                          {bizIdCode}
                        </span>
                      </td>

                      {/* 2. Business Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-zinc-900">
                            {biz.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {biz.city && (
                              <span className="text-[10px] font-medium text-zinc-500">
                                {biz.city}
                              </span>
                            )}
                            {biz.owner_name && (
                              <span className="text-[10px] text-zinc-400">
                                • {biz.owner_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Contact Number */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col text-xs text-zinc-700">
                          {biz.phone ? (
                            <a
                              href={`tel:${biz.phone}`}
                              className="font-medium hover:text-emerald-600 transition-colors"
                            >
                              {biz.phone}
                            </a>
                          ) : (
                            <span className="text-zinc-400 italic">No contact</span>
                          )}
                          {biz.whatsapp_number && biz.whatsapp_number !== biz.phone && (
                            <span className="text-[10px] text-emerald-600 font-mono mt-0.5">
                              WA: {biz.whatsapp_number}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Link from Batch */}
                      <td className="py-4 px-4">
                        {primaryTag ? (
                          <div className="flex flex-col gap-1">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-200">
                                {primaryTag.code}
                              </span>
                              <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                                ({primaryTag.form})
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[130px]">
                                /t/{primaryTag.code}
                              </span>
                              <button
                                onClick={() => handleCopy(`${typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com"}/t/${primaryTag.code}`, "Tag Link")}
                                className="p-1 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                                title="Copy Tag Link"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            {bizTags.length > 1 && (
                              <span className="text-[10px] text-indigo-600 font-medium">
                                +{bizTags.length - 1} more tag(s)
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenTagSetup(biz)}
                            className="tactile-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold cursor-pointer transition-all active:scale-[0.978] whitespace-nowrap shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>+ Setup Tag Link</span>
                          </button>
                        )}
                      </td>

                      {/* 5. Review Page Slug / Sample Review Page */}
                      <td className="py-4 px-4">
                        {editingSlugId === biz.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-400 font-mono">/r/</span>
                            <input
                              type="text"
                              value={editingSlug}
                              onChange={(e) => setEditingSlug(e.target.value)}
                              className="px-2 py-1 rounded border border-emerald-500 text-xs font-mono w-28 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSlug(biz)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                              title="Save Slug"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingSlugId(null)}
                              className="p-1 rounded bg-zinc-200 text-zinc-600 hover:bg-zinc-300 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`/r/${biz.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-xs font-bold text-zinc-900 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                                title="Open auto-created sample review page"
                              >
                                <span>/r/{biz.slug}</span>
                                <ExternalLink className="w-3 h-3 text-zinc-400" />
                              </a>
                              <button
                                onClick={() => handleStartEditSlug(biz)}
                                className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                                title="Edit Slug"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[10px] text-zinc-400">
                              Auto-generated review page
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 6. Status of Activation */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(biz)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-all active:scale-[0.978] ${
                              biz.active
                                ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200"
                            }`}
                          >
                            {biz.active ? "● ACTIVE" : "○ NOT ACTIVE"}
                          </button>
                        </div>
                      </td>

                      {/* 7. Total Scans / Taps */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-900">
                          {totalScans.toLocaleString()}
                        </span>
                      </td>

                      {/* 8. Business's Google Review Page Link */}
                      <td className="py-4 px-4">
                        {editingBizId === biz.id ? (
                          <div className="flex flex-col gap-1.5 w-60">
                            <input
                              type="url"
                              value={editingUrl}
                              onChange={(e) => setEditingUrl(e.target.value)}
                              placeholder="https://g.page/r/.../review"
                              className="w-full px-2 py-1 rounded border border-emerald-500 text-xs font-mono focus:outline-none"
                              autoFocus
                            />
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => handleSaveReviewUrl(biz)}
                                className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                              >
                                Save Link
                              </button>
                              <button
                                onClick={() => setEditingBizId(null)}
                                className="px-2 py-1 rounded bg-zinc-200 text-zinc-700 text-[11px] hover:bg-zinc-300 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : hasMissingGoogle ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 border border-red-500/20 font-bold text-[11px] whitespace-nowrap">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                              <span>Google review link missing</span>
                            </span>
                            <button
                              onClick={() => handleStartEditReviewUrl(biz)}
                              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline text-left cursor-pointer"
                            >
                              + Add Google Link
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 max-w-[200px]">
                            <div className="flex items-center gap-1">
                              <a
                                href={biz.review_url!}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-[11px] text-zinc-700 hover:text-emerald-600 truncate underline flex-1"
                                title={biz.review_url!}
                              >
                                {biz.review_url}
                              </a>
                              <button
                                onClick={() => handleStartEditReviewUrl(biz)}
                                className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer flex-shrink-0"
                                title="Edit Google Link"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              ✓ Verified Destination
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 9. Destination of QR/NFC with Colored Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={biz.redirect_mode || "not_assigned"}
                          onChange={(e) =>
                            handleDestinationChange(
                              biz,
                              e.target.value as "interactive_profile" | "direct_review" | "not_assigned"
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer shadow-2xs transition-colors ${
                            isDirectMode
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : isZentapMode
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "bg-rose-50 text-rose-700 border-rose-300"
                          }`}
                        >
                          <option value="direct_review" className="bg-white text-emerald-800 font-semibold">
                            🟢 Direct Google Review
                          </option>
                          <option value="interactive_profile" className="bg-white text-amber-800 font-semibold">
                            🟠 ZenTap Google Review
                          </option>
                          <option value="not_assigned" className="bg-white text-rose-700 font-semibold">
                            🔴 Not Assigned
                          </option>
                        </select>
                      </td>

                      {/* 10. Page Editor */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenPageEditor(biz.id)}
                          className="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-transform active:scale-[0.978] shadow-2xs"
                          title="Open Page Editor & Live Preview for this business"
                        >
                          <Palette className="w-3.5 h-3.5 text-amber-400" />
                          <span>Page Editor</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD MANUAL GOOGLE ENTRY */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-zinc-900">
                    Add Google Link &amp; QR Setting
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Configure Google review links, QR destination mode, and tag assignments manually
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualEntry} className="space-y-3.5">
              {/* Select Business */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Select Registered Business *
                </label>
                <select
                  required
                  value={manualBizId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setManualBizId(id);
                    const selected = businesses.find((b) => b.id === id);
                    if (selected) {
                      setManualGoogleUrl(selected.review_url || "");
                      setManualSlug(selected.slug || "");
                      setManualDestination(selected.redirect_mode || "direct_review");
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Registered Business --</option>
                  {businesses
                    .filter((b) => !b.is_deleted)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        [{b.business_id_code || getBusinessIdCode(b)}] {b.name} ({b.city || "Ahmedabad"})
                      </option>
                    ))}
                </select>
              </div>

              {/* Google Review URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Google Review Link URL
                </label>
                <input
                  type="url"
                  placeholder="https://g.page/r/.../review or https://maps.app.goo.gl/..."
                  value={manualGoogleUrl}
                  onChange={(e) => setManualGoogleUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Review Slug */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Review Page Slug (/r/...)
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 rounded-l-xl bg-zinc-100 border border-r-0 border-zinc-300 text-xs font-mono text-zinc-500">
                    /r/
                  </span>
                  <input
                    type="text"
                    placeholder="my-business-review"
                    value={manualSlug}
                    onChange={(e) => setManualSlug(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-r-xl bg-zinc-50 border border-zinc-300 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Destination of QR/NFC *
                </label>
                <select
                  value={manualDestination}
                  onChange={(e) => setManualDestination(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="direct_review">🟢 Direct Google Review (Bypass)</option>
                  <option value="interactive_profile">🟠 ZenTap Google Review (AI Assistant)</option>
                  <option value="not_assigned">🔴 Not Assigned</option>
                </select>
              </div>

              {/* Optional: Link from Batch */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Link Physical Standee / Card Code (Optional)
                </label>
                <select
                  value={manualTagCode}
                  onChange={(e) => setManualTagCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- No hardware tag linked yet --</option>
                  {unassignedTags.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.code} ({t.form.toUpperCase()}) - /t/{t.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Save Google Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
