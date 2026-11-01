"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Plus,
  QrCode,
  Radio,
  ExternalLink,
  Edit,
  Download,
  Copy,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Instagram,
  Facebook,
} from "lucide-react";
import QRCode from "qrcode";
import {
  SocialLinkItemRecord,
  ClientRecord,
  getAllSocialLinks,
  getAllClients,
  updateSocialLink,
  addManualSocialLink,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";

interface SocialLinksWebpageTabProps {
  onShowToast: (msg: string) => void;
}

export default function SocialLinksWebpageTab({ onShowToast }: SocialLinksWebpageTabProps) {
  const [links, setLinks] = useState<SocialLinkItemRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Edit Link Modal
  const [editTarget, setEditTarget] = useState<SocialLinkItemRecord | null>(null);
  const [editPlatform, setEditPlatform] = useState<"WhatsApp" | "Instagram" | "Facebook" | "N/A">("N/A");
  const [editSocialUrl, setEditSocialUrl] = useState("");
  const [editDestination, setEditDestination] = useState<"not_assigned" | "assigned">("not_assigned");

  // Add Manual Entry Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualBusinessId, setManualBusinessId] = useState("");
  const [manualTagId, setManualTagId] = useState("");
  const [manualPlatform, setManualPlatform] = useState<"WhatsApp" | "Instagram" | "Facebook" | "N/A">("WhatsApp");
  const [manualSocialUrl, setManualSocialUrl] = useState("");
  const [manualDestination, setManualDestination] = useState<"not_assigned" | "assigned">("not_assigned");

  // QR Modal
  const [qrModalItem, setQrModalItem] = useState<SocialLinkItemRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copiedTagId, setCopiedTagId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setLinks(getAllSocialLinks());
    setClients(getAllClients());
  };

  const handleOpenEdit = (item: SocialLinkItemRecord) => {
    setEditTarget(item);
    setEditPlatform(item.social_platform);
    setEditSocialUrl(item.social_link || "");
    setEditDestination(item.destination);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    const updated = updateSocialLink(editTarget.tag_id, {
      social_platform: editPlatform,
      social_link: editSocialUrl.trim(),
      destination: editDestination,
    });

    if (updated) {
      onShowToast(`✓ Updated Social settings for ${updated.business_name} (${updated.tag_id})!`);
      setEditTarget(null);
      refreshData();
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBiz = clients.find((c) => c.business_id === manualBusinessId);
    if (!targetBiz) {
      onShowToast("Please select a registered client");
      return;
    }
    const cleanTagId = manualTagId.trim().toUpperCase() || `CRD${links.length + 1}`;

    const created = addManualSocialLink({
      tag_id: cleanTagId,
      business_id: targetBiz.business_id,
      business_name: targetBiz.business_name,
      social_platform: manualPlatform,
      link_of_tag_id: `${DOMAIN_BASE}/t/${cleanTagId}`,
      social_link: manualSocialUrl.trim(),
      destination: manualDestination,
      setup_status: manualDestination === "assigned" ? "completed" : "pending",
      total_scans: 0,
    });

    onShowToast(`✓ Added Social Smart Card setup for ${created.business_name} (${created.tag_id})!`);
    setIsManualModalOpen(false);
    setManualTagId("");
    setManualSocialUrl("");
    setManualDestination("not_assigned");
    refreshData();
  };

  const handleOpenQr = async (item: SocialLinkItemRecord) => {
    setQrModalItem(item);
    try {
      const url = await QRCode.toDataURL(item.link_of_tag_id, {
        width: 320,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch (e) {
      console.warn("QR generation error", e);
    }
  };

  const handleDownloadQr = (item: SocialLinkItemRecord, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `social-card-qr-${item.tag_id.toLowerCase()}.png`;
    a.click();
    onShowToast(`✓ Downloaded QR code for ${item.tag_id}`);
  };

  const handleCopyNfc = (item: SocialLinkItemRecord) => {
    const nfcUrl = `${item.link_of_tag_id}?s=nfc`;
    navigator.clipboard.writeText(nfcUrl);
    setCopiedTagId(item.tag_id);
    onShowToast(`✓ Copied NFC writing link: ${nfcUrl}`);
    setTimeout(() => setCopiedTagId(null), 2500);
  };

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filteredLinks = links.filter((l) => {
    if (platformFilter !== "all" && l.social_platform !== platformFilter) return false;
    if (!q) return true;
    return (
      (l.business_id && l.business_id.toLowerCase().includes(q)) ||
      (l.business_name && l.business_name.toLowerCase().includes(q)) ||
      (l.tag_id && l.tag_id.toLowerCase().includes(q)) ||
      (l.social_platform && l.social_platform.toLowerCase().includes(q)) ||
      (l.destination && l.destination.toLowerCase().includes(q)) ||
      (l.setup_status && l.setup_status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                Social Links &amp; QR Setting
              </h1>
              <p className="text-xs text-zinc-500">
                Manage NFC Business Cards routing to WhatsApp, Instagram, or Facebook profiles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (clients.length > 0 && !manualBusinessId) {
                  setManualBusinessId(clients[0].business_id);
                }
                setIsManualModalOpen(true);
              }}
              className="tactile-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Add Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Guidance Banner */}
        <div className="mt-5 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold text-zinc-900">Card Setup Routing Logic:</span>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-600 text-[11px]">
              <li>
                <span className="font-bold text-rose-700">Not Assigned (Red):</span> Requires adding the destination Social Link. Setup status remains <strong>Pending</strong>.
              </li>
              <li>
                <span className="font-bold text-emerald-800">Assigned (Green):</span> NFC tap or QR scan directly launches the configured WhatsApp chat, Instagram profile, or Facebook page. Setup status is <strong>Completed</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Search & Platform Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200/60 w-fit flex-wrap">
            {["all", "WhatsApp", "Instagram", "Facebook", "N/A"].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  platformFilter === p ? "bg-white text-zinc-900 shadow-xs font-bold" : "text-zinc-600"
                }`}
              >
                {p === "all" ? "All Platforms" : p}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Name, Platform, Tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* SOCIAL LINKS TABLE */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Business ID</th>
                <th className="py-3.5 px-4">Business Name</th>
                <th className="py-3.5 px-4">Social Platform</th>
                <th className="py-3.5 px-4">Tag ID</th>
                <th className="py-3.5 px-4">Link of Tag ID</th>
                <th className="py-3.5 px-4 text-center">QR Code</th>
                <th className="py-3.5 px-4 text-center">NFC Link</th>
                <th className="py-3.5 px-4">Setup Status</th>
                <th className="py-3.5 px-4 text-center">Scans/Taps</th>
                <th className="py-3.5 px-4">Destination of QR/NFC</th>
                <th className="py-3.5 px-4 text-right">Edit Social Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-zinc-500 font-medium">
                    No Smart Card entries found. Cards assigned in QR/NFC Generator automatically populate here.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((item) => {
                  const isCompleted = item.setup_status === "completed" || item.destination === "assigned";

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Business ID */}
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[11px]">
                          {item.business_id}
                        </span>
                      </td>

                      {/* Business Name */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-zinc-900">
                        {item.business_name}
                      </td>

                      {/* Social Platform (Default N/A in Red) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.social_platform === "WhatsApp" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </span>
                        )}
                        {item.social_platform === "Instagram" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-pink-50 text-pink-800 border border-pink-300 text-[11px] font-bold">
                            <Instagram className="w-3 h-3 text-pink-600" />
                            <span>Instagram</span>
                          </span>
                        )}
                        {item.social_platform === "Facebook" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-300 text-[11px] font-bold">
                            <Facebook className="w-3 h-3 text-blue-600" />
                            <span>Facebook</span>
                          </span>
                        )}
                        {item.social_platform === "N/A" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold">
                            <span>N/A</span>
                          </span>
                        )}
                      </td>

                      {/* Tag ID */}
                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-xs tracking-wider">
                          {item.tag_id}
                        </span>
                      </td>

                      {/* Link of Tag ID */}
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        <a
                          href={item.link_of_tag_id}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <span>{item.link_of_tag_id}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </td>

                      {/* Download QR */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenQr(item)}
                          className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-all cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-zinc-700" />
                          <span>QR</span>
                        </button>
                      </td>

                      {/* NFC Link Copy */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleCopyNfc(item)}
                          className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                        >
                          {copiedTagId === item.tag_id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Radio className="w-3.5 h-3.5 text-zinc-300" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Setup Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Total Scans/Taps */}
                      <td className="py-3 px-4 text-center font-bold text-zinc-900 whitespace-nowrap">
                        {item.total_scans || 0}
                      </td>

                      {/* Destination of QR/NFC */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.destination === "assigned" ? (
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            Assigned (Active)
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            Not Assigned
                          </span>
                        )}
                        {item.social_link && (
                          <span className="block text-[10px] text-zinc-500 font-mono truncate max-w-[150px] mt-0.5">
                            {item.social_link}
                          </span>
                        )}
                      </td>

                      {/* Edit Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-all cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Edit</span>
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

      {/* ========================================================================= */}
      {/* MODAL: EDIT SOCIAL DESTINATION                                            */}
      {/* ========================================================================= */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">
                    Edit Smart Card: {editTarget.tag_id}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {editTarget.business_name} ({editTarget.business_id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Social Platform */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Social Platform *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["WhatsApp", "Instagram", "Facebook", "N/A"] as const).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setEditPlatform(plat)}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        editPlatform === plat
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination of QR/NFC */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Destination Status *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                    <input
                      type="radio"
                      name="socialDest"
                      value="assigned"
                      checked={editDestination === "assigned"}
                      onChange={() => setEditDestination("assigned")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-emerald-900">
                        Assigned (Green)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Redirects directly to the Social Link entered below.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                    <input
                      type="radio"
                      name="socialDest"
                      value="not_assigned"
                      checked={editDestination === "not_assigned"}
                      onChange={() => setEditDestination("not_assigned")}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-rose-900">
                        Not Assigned (Red)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Awaiting destination link configuration.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Social Link URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Social Link / Phone / Profile URL
                </label>
                <input
                  type="text"
                  placeholder={
                    editPlatform === "WhatsApp"
                      ? "e.g. 919825012345 or https://wa.me/919825012345"
                      : editPlatform === "Instagram"
                      ? "e.g. https://instagram.com/mybusiness or @handle"
                      : "https://facebook.com/..."
                  }
                  value={editSocialUrl}
                  onChange={(e) => setEditSocialUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD MANUAL ENTRY                                                   */}
      {/* ========================================================================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-zinc-900" />
                <h3 className="font-bold text-lg text-zinc-900">Add Manual Social Card Link</h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Select Registered Client *
                </label>
                <select
                  value={manualBusinessId}
                  onChange={(e) => setManualBusinessId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.business_id}>
                      [{c.business_id}] {c.business_name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Tag ID (e.g. CRD1, CRD2...)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CRD4"
                  value={manualTagId}
                  onChange={(e) => setManualTagId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Social Platform *
                </label>
                <select
                  value={manualPlatform}
                  onChange={(e) => setManualPlatform(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Social Link / Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 919825012345 or https://..."
                  value={manualSocialUrl}
                  onChange={(e) => setManualSocialUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Destination Status *
                </label>
                <select
                  value={manualDestination}
                  onChange={(e) => setManualDestination(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="not_assigned">Not Assigned (Red - Default)</option>
                  <option value="assigned">Assigned (Green)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR PREVIEW                                                         */}
      {/* ========================================================================= */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-zinc-900 text-white">
                {qrModalItem.tag_id}
              </span>
              <button
                onClick={() => setQrModalItem(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-zinc-900 text-sm">{qrModalItem.business_name}</h4>
              <p className="text-[11px] text-zinc-500 font-mono truncate">{qrModalItem.link_of_tag_id}</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 inline-block">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${qrModalItem.tag_id}`}
                  className="w-48 h-48 mx-auto rounded-lg shadow-2xs"
                />
              )}
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => handleDownloadQr(qrModalItem, qrDataUrl)}
                className="tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => handleCopyNfc(qrModalItem)}
                className="tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-200 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
