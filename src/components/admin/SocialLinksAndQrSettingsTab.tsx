"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
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
  Download,
  Plus,
  MessageCircle,
  Instagram,
  Facebook,
  Share2
} from "lucide-react";
import {
  BusinessRecord,
  TagRecord,
  TagType,
  getBusinessIdCode,
  assignTag,
  updateTagDetails,
  toggleTagActive
} from "@/lib/businessStore";

interface SocialLinksAndQrSettingsTabProps {
  businesses: BusinessRecord[];
  tags: TagRecord[];
  onUpdateBusiness: (id: string, updates: Partial<BusinessRecord>) => void;
  onUpdateTag: (tagId: string, updates: Partial<TagRecord>) => void;
  onShowToast: (msg: string) => void;
  onTagsUpdated?: (tags: TagRecord[]) => void;
}

export default function SocialLinksAndQrSettingsTab({
  businesses,
  tags,
  onUpdateBusiness,
  onUpdateTag,
  onShowToast,
  onTagsUpdated,
}: SocialLinksAndQrSettingsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "whatsapp" | "instagram" | "facebook">("all");

  // Modal: Add Manual Social Link
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBizId, setModalBizId] = useState("");
  const [modalPlatform, setModalPlatform] = useState<"whatsapp" | "instagram" | "facebook">("whatsapp");
  const [modalTagCode, setModalTagCode] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [modalMessage, setModalMessage] = useState("Hi, I tapped your ZenTap Smart Card!");

  // QR Modal
  const [qrModalTag, setQrModalTag] = useState<TagRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com";

  // Filter tags that are cards or social types, or unassigned tags
  const socialTags = tags.filter((t) => {
    // Show cards, social tags, or tags assigned to businesses
    const isSocialForm = t.form === "card" || t.type === "whatsapp" || t.type === "instagram";
    return isSocialForm;
  });

  // Filtered list
  const filtered = socialTags.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const biz = t.business_id ? businesses.find((b) => b.id === t.business_id) : null;
    const bizIdCode = biz ? (biz.business_id_code || getBusinessIdCode(biz)).toLowerCase() : "";
    const bizName = (biz?.name || t.business_name || "").toLowerCase();
    const tagCode = t.code.toLowerCase();
    const platform = (t.type || "whatsapp").toLowerCase();

    const matchesQuery =
      !q ||
      bizIdCode.includes(q) ||
      bizName.includes(q) ||
      tagCode.includes(q) ||
      platform.includes(q);

    if (!matchesQuery) return false;

    if (platformFilter !== "all") {
      const currentPlatform = t.type || "whatsapp";
      return currentPlatform === platformFilter;
    }

    return true;
  });

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onShowToast(`✓ Copied ${label} to clipboard!`);
    }
  };

  const handleDownloadQr = async (tag: TagRecord) => {
    try {
      const domain = typeof window !== "undefined" && localStorage.getItem("zentap_site_domain") ? localStorage.getItem("zentap_site_domain")! : "https://zentapdigitalsolutions.com";
      const targetUrl = `${domain}/t/${tag.code}?s=qr`;
      const url = await QRCode.toDataURL(targetUrl, {
        width: 600,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "Q",
      });

      const a = document.createElement("a");
      a.href = url;
      a.download = `zentap_social_qr_${tag.code}_${tag.type || "social"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowToast(`✓ Downloaded high-res QR for ${tag.code}!`);
    } catch {
      onShowToast("Failed to generate QR code");
    }
  };

  const handleShowQrModal = async (tag: TagRecord) => {
    try {
      const domain = typeof window !== "undefined" && localStorage.getItem("zentap_site_domain") ? localStorage.getItem("zentap_site_domain")! : "https://zentapdigitalsolutions.com";
      const targetUrl = `${domain}/t/${tag.code}?s=qr`;
      const url = await QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "Q",
      });
      setQrDataUrl(url);
      setQrModalTag(tag);
    } catch {
      onShowToast("Could not preview QR");
    }
  };

  const handlePlatformChange = (tag: TagRecord, newPlatform: "whatsapp" | "instagram" | "facebook") => {
    const updated = updateTagDetails(tag.id, {
      type: newPlatform as TagType,
      destination: "direct",
    });
    if (onTagsUpdated) onTagsUpdated(updated);
    onShowToast(`✓ Social platform updated to ${newPlatform.toUpperCase()} for ${tag.code}`);
  };

  const handleToggleTagStatus = (tag: TagRecord) => {
    const updated = toggleTagActive(tag.id);
    if (onTagsUpdated) onTagsUpdated(updated);
    onShowToast(`✓ Link status set to ${!tag.active ? "ACTIVE" : "INACTIVE"} for ${tag.code}`);
  };

  const handleSaveManualSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBizId) {
      onShowToast("Please select a business");
      return;
    }

    const biz = businesses.find((b) => b.id === modalBizId);
    if (!biz) return;

    // If tag selected, assign it
    if (modalTagCode) {
      const tagToAssign = tags.find((t) => t.code.toLowerCase() === modalTagCode.toLowerCase());
      if (tagToAssign) {
        const updated = assignTag(tagToAssign.id, modalBizId, modalPlatform as TagType, {
          label: `${biz.name} (${modalPlatform.toUpperCase()})`,
          whatsapp_number: modalPlatform === "whatsapp" ? modalValue.trim() : undefined,
          whatsapp_message: modalPlatform === "whatsapp" ? modalMessage.trim() : undefined,
          instagram_handle: modalPlatform === "instagram" ? modalValue.trim() : undefined,
        });
        if (onTagsUpdated) onTagsUpdated(updated);
      }
    }

    // Also update business contact profiles
    if (modalPlatform === "whatsapp" && modalValue.trim()) {
      onUpdateBusiness(modalBizId, { whatsapp_number: modalValue.trim() });
    } else if (modalPlatform === "instagram" && modalValue.trim()) {
      onUpdateBusiness(modalBizId, { instagram_url: modalValue.trim() });
    }

    setModalOpen(false);
    setModalBizId("");
    setModalTagCode("");
    setModalValue("");
    onShowToast(`✓ Social Link & QR configured for "${biz.name}"!`);
  };

  const unassignedCardTags = tags.filter((t) => !t.business_id && t.form === "card");

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-headline font-bold text-zinc-900">
            Social Links &amp; QR Setting
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage WhatsApp, Instagram, and Facebook NFC business cards and direct social QR links for all clients.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="tactile-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-xs self-start sm:self-auto transition-transform active:scale-[0.978]"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>+ Add Manual Social Link</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search Business ID, client name, code, platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-xs"
          />
        </div>

        {/* Platform Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              platformFilter === "all" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All ({socialTags.length})
          </button>
          <button
            onClick={() => setPlatformFilter("whatsapp")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              platformFilter === "whatsapp" ? "bg-emerald-600 text-white shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setPlatformFilter("instagram")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              platformFilter === "instagram" ? "bg-pink-600 text-white shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => setPlatformFilter("facebook")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              platformFilter === "facebook" ? "bg-blue-600 text-white shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Facebook
          </button>
        </div>
      </div>

      {/* Social Links & QR Table */}
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-600 uppercase text-[10px] font-mono tracking-wider font-semibold">
                <th className="py-3.5 px-4">Business ID</th>
                <th className="py-3.5 px-4 sm:px-6">Name</th>
                <th className="py-3.5 px-4">Social Platform</th>
                <th className="py-3.5 px-4 font-mono">Code</th>
                <th className="py-3.5 px-4">Link</th>
                <th className="py-3.5 px-4">Assigned Status</th>
                <th className="py-3.5 px-4">Status of Link</th>
                <th className="py-3.5 px-4">Scans / Taps</th>
                <th className="py-3.5 px-4">Download QR</th>
                <th className="py-3.5 px-4 text-right">Copy NFC Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500">
                    No social cards or links match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((tag) => {
                  const biz = tag.business_id ? businesses.find((b) => b.id === tag.business_id) : null;
                  const bizIdCode = biz ? (biz.business_id_code || getBusinessIdCode(biz)) : null;
                  const isAssigned = !!tag.business_id;
                  const platform = tag.type || "whatsapp";
                  const tagLink = `${originUrl}/t/${tag.code}`;
                  const nfcLink = `${originUrl}/t/${tag.code}?s=nfc`;

                  return (
                    <tr key={tag.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* 1. Business ID */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {bizIdCode ? (
                          <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-2xs">
                            {bizIdCode}
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* 2. Business / Client Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-zinc-900">
                            {biz?.name || tag.business_name || (
                              <span className="text-zinc-400 italic">-- Free in Inventory --</span>
                            )}
                          </span>
                          {biz?.owner_name && (
                            <span className="text-[10px] text-zinc-500">
                              Owner: {biz.owner_name}
                            </span>
                          )}
                          {tag.label && tag.label !== biz?.name && (
                            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              Label: {tag.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Social Platform (Dropdown: Whatsapp, Instagram, Facebook) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={platform}
                          onChange={(e) =>
                            handlePlatformChange(tag, e.target.value as "whatsapp" | "instagram" | "facebook")
                          }
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer shadow-2xs ${
                            platform === "whatsapp"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : platform === "instagram"
                              ? "bg-pink-50 text-pink-800 border-pink-300"
                              : "bg-blue-50 text-blue-800 border-blue-300"
                          }`}
                        >
                          <option value="whatsapp" className="bg-white text-emerald-800 font-bold">
                            WhatsApp
                          </option>
                          <option value="instagram" className="bg-white text-pink-800 font-bold">
                            Instagram
                          </option>
                          <option value="facebook" className="bg-white text-blue-800 font-bold">
                            Facebook
                          </option>
                        </select>
                      </td>

                      {/* 4. Code (zt-0003) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-zinc-100 text-zinc-900 border border-zinc-200">
                          {tag.code}
                        </span>
                      </td>

                      {/* 5. Link (zentap.in/t/zt-0003) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={tagLink}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs text-zinc-700 hover:text-emerald-600 truncate max-w-[140px] underline"
                            title={tagLink}
                          >
                            /t/{tag.code}
                          </a>
                          <button
                            onClick={() => handleCopy(tagLink, "Social Link")}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                            title="Copy Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* 6. Assigned Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isAssigned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Assigned</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            <span>Not Assigned</span>
                          </span>
                        )}
                      </td>

                      {/* 7. Status of the Link (Active / Inactive toggle) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleTagStatus(tag)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-all active:scale-[0.978] ${
                            tag.active
                              ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200"
                          }`}
                        >
                          {tag.active ? "● ACTIVE" : "○ INACTIVE"}
                        </button>
                      </td>

                      {/* 8. Scans / Taps */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-900">
                          {(tag.scan_count || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* 9. Download QR */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleShowQrModal(tag)}
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer shadow-2xs"
                            title="Preview QR Code"
                          >
                            <QrCode className="w-4 h-4 text-zinc-800" />
                          </button>
                          <button
                            onClick={() => handleDownloadQr(tag)}
                            className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-bold cursor-pointer shadow-2xs"
                            title="Download Vector QR PNG"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>QR</span>
                          </button>
                        </div>
                      </td>

                      {/* 10. Copy NFC Link */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleCopy(nfcLink, `NFC Link (${tag.code})`)}
                          className="tactile-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-transform active:scale-[0.978] shadow-2xs"
                          title="Copy NFC writing URL for NFC Tools"
                        >
                          <Radio className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copy NFC Link</span>
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

      {/* MODAL: ADD MANUAL SOCIAL LINK */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-zinc-900">
                    Add Social Link &amp; QR Setting
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Connect client to a WhatsApp, Instagram, or Facebook NFC smart card
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualSocial} className="space-y-3.5">
              {/* Select Business */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Select Registered Business *
                </label>
                <select
                  required
                  value={modalBizId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setModalBizId(id);
                    const b = businesses.find((x) => x.id === id);
                    if (b) {
                      if (modalPlatform === "whatsapp") setModalValue(b.whatsapp_number || b.phone || "");
                      if (modalPlatform === "instagram") setModalValue(b.instagram_url || "");
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Registered Business --</option>
                  {businesses
                    .filter((b) => !b.is_deleted)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        [{b.business_id_code || getBusinessIdCode(b)}] {b.name} ({b.phone || "No phone"})
                      </option>
                    ))}
                </select>
              </div>

              {/* Social Platform */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Social Platform *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalPlatform("whatsapp");
                      const b = businesses.find((x) => x.id === modalBizId);
                      if (b) setModalValue(b.whatsapp_number || b.phone || "");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalPlatform === "whatsapp"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalPlatform("instagram");
                      const b = businesses.find((x) => x.id === modalBizId);
                      if (b) setModalValue(b.instagram_url || "");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalPlatform === "instagram"
                        ? "bg-pink-600 text-white border-pink-600 shadow-xs"
                        : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                    }`}
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalPlatform("facebook")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      modalPlatform === "facebook"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                    }`}
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Number or Profile URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  {modalPlatform === "whatsapp"
                    ? "WhatsApp Number (with country code)"
                    : modalPlatform === "instagram"
                    ? "Instagram Username / Profile URL"
                    : "Facebook Page URL"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    modalPlatform === "whatsapp"
                      ? "919274560880"
                      : modalPlatform === "instagram"
                      ? "zentapdigitalsolutions"
                      : "https://facebook.com/zentap"
                  }
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Optional Message for WhatsApp */}
              {modalPlatform === "whatsapp" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Pre-filled WhatsApp Tap Message
                  </label>
                  <input
                    type="text"
                    value={modalMessage}
                    onChange={(e) => setModalMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Select Tag Code */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Assign Card Code from Inventory *
                </label>
                <select
                  required
                  value={modalTagCode}
                  onChange={(e) => setModalTagCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Available Card Code --</option>
                  {unassignedCardTags.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.code} ({t.form.toUpperCase()}) - /t/{t.code}
                    </option>
                  ))}
                  {/* Also show all tags in case user wants any tag */}
                  {tags
                    .filter((t) => !unassignedCardTags.some((u) => u.id === t.id))
                    .map((t) => (
                      <option key={t.id} value={t.code}>
                        {t.code} ({t.form.toUpperCase()}) {t.business_name ? `[Current: ${t.business_name}]` : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Save Social Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL PREVIEW */}
      {qrModalTag && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="font-mono text-xs font-bold text-zinc-800">
                Tag {qrModalTag.code} ({qrModalTag.type?.toUpperCase()})
              </span>
              <button
                onClick={() => setQrModalTag(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt={`QR code for ${qrModalTag.code}`}
                className="w-48 h-48 mx-auto rounded-2xl border border-zinc-200 shadow-sm p-2"
              />
            )}

            <p className="font-mono text-xs text-zinc-600">
              {originUrl}/t/{qrModalTag.code}
            </p>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => handleDownloadQr(qrModalTag)}
                className="tactile-btn px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
