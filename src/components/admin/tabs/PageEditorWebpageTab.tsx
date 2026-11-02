"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Search,
  ExternalLink,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Phone,
  Navigation,
  MessageCircle,
  Instagram,
  Star,
  Save,
  Edit2,
  Trash2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import QRCode from "qrcode";
import {
  PageEditorConfigItemRecord,
  DeletedPageEditorConfigRecord,
  getAllPageEditorConfigs,
  getAllDeletedPageEditorConfigs,
  savePageEditorConfig,
  updatePageEditorConfig,
  softDeletePageEditorServer,
  restorePageEditorServer,
  permanentDeletePageEditorServer,
  serverFetchPlatformData,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";

interface PageEditorWebpageTabProps {
  onShowToast: (msg: string) => void;
}

export default function PageEditorWebpageTab({ onShowToast }: PageEditorWebpageTabProps) {
  const [editorConfigs, setEditorConfigs] = useState<PageEditorConfigItemRecord[]>([]);
  const [deletedConfigs, setDeletedConfigs] = useState<DeletedPageEditorConfigRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "deleted">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visual Editor State
  const [activeItem, setActiveItem] = useState<PageEditorConfigItemRecord | null>(null);
  const [editTheme, setEditTheme] = useState("obsidian");
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("/standees/standee_01.jpg");
  const [editLogoUrl, setEditLogoUrl] = useState("/logo.png");
  const [editCtaText, setEditCtaText] = useState("Write a 5-Star Review on Google");
  const [editGoogleLink, setEditGoogleLink] = useState("");
  const [editPhone, setEditPhone] = useState("+91 98250 12345");
  const [editWhatsapp, setEditWhatsapp] = useState("919825012345");
  const [editInstagram, setEditInstagram] = useState("");
  const [editTagLink, setEditTagLink] = useState("");

  // Edit Whole Entry Modal
  const [editWholeTarget, setEditWholeTarget] = useState<PageEditorConfigItemRecord | null>(null);
  const [editWholeTagId, setEditWholeTagId] = useState("");
  const [editWholeBusinessId, setEditWholeBusinessId] = useState("");
  const [editWholeBusinessName, setEditWholeBusinessName] = useState("");
  const [editWholeLinkUrl, setEditWholeLinkUrl] = useState("");
  const [editWholeSetupStatus, setEditWholeSetupStatus] = useState<"pending" | "completed">("pending");

  // Delete Target Modal (Soft delete)
  const [deleteTarget, setDeleteTarget] = useState<PageEditorConfigItemRecord | null>(null);

  // Permanent Delete Target (Deleted tab only)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<DeletedPageEditorConfigRecord | null>(null);
  const [typedConfirmName, setTypedConfirmName] = useState("");

  // QR Modal
  const [qrModalItem, setQrModalItem] = useState<PageEditorConfigItemRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    // Preserve URL state on refresh (Requirement 4)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const st = params.get("status");
      if (st === "deleted") {
        setActiveTab("deleted");
      }
    }
    refreshData();
  }, []);

  const setTabAndUrl = (status: "all" | "deleted") => {
    setActiveTab(status);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (status === "all") {
        url.searchParams.delete("status");
      } else {
        url.searchParams.set("status", status);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const refreshData = async () => {
    setEditorConfigs(getAllPageEditorConfigs());
    setDeletedConfigs(getAllDeletedPageEditorConfigs());
    const res = await serverFetchPlatformData();
    if (res.success && res.data) {
      setEditorConfigs(res.data.pageEditorConfigs || []);
      setDeletedConfigs(res.data.deletedPageEditorConfigs || []);
    }
  };

  const handleOpenEditor = (item: PageEditorConfigItemRecord) => {
    setActiveItem(item);
    const cfg = item.config_data || {};
    setEditTheme(cfg.theme || "obsidian");
    setEditTitle(cfg.title || item.business_name || "Business Name");
    setEditSubtitle(cfg.subtitle || "Customer Satisfaction Hub");
    setEditBannerUrl(cfg.cover_image || "/standees/standee_01.jpg");
    setEditLogoUrl(cfg.logo_url || "/logo.png");
    setEditCtaText(cfg.cta_text || "Leave a 5-Star Review on Google");
    setEditGoogleLink(cfg.google_link || "");
    setEditPhone(cfg.phone || "+91 98250 12345");
    setEditWhatsapp(cfg.whatsapp || "919825012345");
    setEditInstagram(cfg.instagram || "");
    setEditTagLink(item.link_url || `${DOMAIN_BASE}/r/zentap?preview=1`);
  };

  const handleSaveDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const newConfigData = {
      theme: editTheme,
      title: editTitle.trim(),
      subtitle: editSubtitle.trim(),
      cover_image: editBannerUrl.trim(),
      logo_url: editLogoUrl.trim(),
      cta_text: editCtaText.trim(),
      google_link: editGoogleLink.trim(),
      phone: editPhone.trim(),
      whatsapp: editWhatsapp.trim(),
      instagram: editInstagram.trim(),
      link_url: editTagLink.trim(),
    };

    const updated = savePageEditorConfig(activeItem.tag_id, newConfigData);
    if (updated) {
      onShowToast(`✓ Saved design changes for "${updated.business_name}"! Setup Status: Completed (Green).`);
      setActiveItem(null);
      refreshData();
    }
  };

  // Open Edit Whole Entry Modal
  const openEditWhole = (item: PageEditorConfigItemRecord) => {
    setEditWholeTarget(item);
    setEditWholeTagId(item.tag_id);
    setEditWholeBusinessId(item.business_id);
    setEditWholeBusinessName(item.business_name);
    setEditWholeLinkUrl(item.link_url);
    setEditWholeSetupStatus(item.setup_status);
  };

  const handleSaveWholeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWholeTarget) return;

    const updated = updatePageEditorConfig(editWholeTarget.tag_id, {
      business_id: editWholeBusinessId.trim(),
      business_name: editWholeBusinessName.trim(),
      link_url: editWholeLinkUrl.trim(),
      setup_status: editWholeSetupStatus,
    });

    if (updated) {
      onShowToast(`✓ Updated whole page editor entry for ${updated.business_name} (${updated.tag_id})!`);
      setEditWholeTarget(null);
      refreshData();
    }
  };

  // Soft delete (moves to Deleted tab)
  const handleConfirmSoftDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const res = await softDeletePageEditorServer(deleteTarget.tag_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Page configuration for ${deleteTarget.tag_id} moved to Deleted section`);
      setDeleteTarget(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to delete page configuration");
    }
  };

  // Restore
  const handleRestore = async (item: DeletedPageEditorConfigRecord) => {
    setIsSubmitting(true);
    const res = await restorePageEditorServer(item.tag_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Restored page configuration for ${item.tag_id}!`);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to restore page configuration");
    }
  };

  // Permanent Delete (Deleted tab only with typed Tag ID confirmation)
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    if (typedConfirmName.trim().toUpperCase() !== permanentDeleteTarget.tag_id.trim().toUpperCase()) {
      onShowToast(`Typed Tag ID does not match "${permanentDeleteTarget.tag_id}".`);
      return;
    }
    setIsSubmitting(true);
    const res = await permanentDeletePageEditorServer(permanentDeleteTarget.tag_id, typedConfirmName.trim());
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Permanently deleted page config for ${permanentDeleteTarget.tag_id}`);
      setPermanentDeleteTarget(null);
      setTypedConfirmName("");
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to permanently delete page configuration");
    }
  };

  const handleOpenQr = async (item: PageEditorConfigItemRecord) => {
    setQrModalItem(item);
    try {
      const url = await QRCode.toDataURL(item.link_url, {
        width: 320,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch (e) {
      console.warn("QR gen error", e);
    }
  };

  const handleDownloadQr = (item: PageEditorConfigItemRecord) => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `page-editor-qr-${item.tag_id.toLowerCase()}.png`;
    a.click();
    onShowToast(`✓ Downloaded Page QR Code for ${item.tag_id}`);
  };

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filteredConfigs = editorConfigs.filter((item) => {
    if (!q) return true;
    return (
      (item.business_id && item.business_id.toLowerCase().includes(q)) ||
      (item.business_name && item.business_name.toLowerCase().includes(q)) ||
      (item.tag_id && item.tag_id.toLowerCase().includes(q)) ||
      (item.link_url && item.link_url.toLowerCase().includes(q))
    );
  });

  const filteredDeleted = deletedConfigs.filter((item) => {
    if (!q) return true;
    return (
      (item.business_id && item.business_id.toLowerCase().includes(q)) ||
      (item.business_name && item.business_name.toLowerCase().includes(q)) ||
      (item.tag_id && item.tag_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                Standee Page Editor (ZenTap Review Assistant)
              </h1>
              <p className="text-xs text-zinc-500">
                Design custom review assistant landing pages for Standee merchants. Live interactive showcase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`${DOMAIN_BASE}/r/zentap?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="tactile-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978]"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>Preview Demo Page (/r/zentap)</span>
            </a>
          </div>
        </div>

        {/* Tab Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
            <button
              onClick={() => setTabAndUrl("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All Standees ({editorConfigs.length})
            </button>
            <button
              onClick={() => setTabAndUrl("deleted")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "deleted" ? "bg-white text-rose-700 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Deleted ({deletedConfigs.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Business ID, Name, Tag ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* ACTIVE PAGE EDITOR DIRECTORY TABLE */}
      {activeTab === "all" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Tag ID</th>
                  <th className="py-3.5 px-4">Link</th>
                  <th className="py-3.5 px-4 text-center">QR Code</th>
                  <th className="py-3.5 px-4">Setup Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500 font-medium">
                      No Standee entries found. Standees created in QR/NFC Generator automatically populate here.
                    </td>
                  </tr>
                ) : (
                  filteredConfigs.map((item) => {
                    const isCompleted = item.setup_status === "completed";

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                        {/* Business ID */}
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[11px]">
                            {item.business_id}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 whitespace-nowrap font-bold text-zinc-900">
                          {item.business_name}
                        </td>

                        {/* Tag ID */}
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-xs tracking-wider">
                            {item.tag_id}
                          </span>
                        </td>

                        {/* Link */}
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                          <a
                            href={item.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            <span className="truncate max-w-[200px]">{item.link_url}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </td>

                        {/* QR to Download */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenQr(item)}
                            className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-all cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-zinc-700" />
                            <span>QR</span>
                          </button>
                        </td>

                        {/* Status */}
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

                        {/* Actions: Open Page Editor, Edit Whole Entry, Delete */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditor(item)}
                              title="Open Visual Page Designer"
                              className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Designer</span>
                            </button>
                            <button
                              onClick={() => openEditWhole(item)}
                              title="Edit Whole Entry"
                              className="tactile-btn p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              title="Delete Entry"
                              className="tactile-btn p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELETED PAGE EDITOR CONFIGS TABLE */}
      {activeTab === "deleted" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold">Deleted Page Configurations Registry</span>
            </div>
            <span className="text-[11px] text-rose-700">
              Archived Standee page customizations. Can be restored back to active directory at any time.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Tag ID</th>
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Link URL</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDeleted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-medium">
                      No deleted page configurations in registry.
                    </td>
                  </tr>
                ) : (
                  filteredDeleted.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-xs">
                          {item.tag_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-700">
                        {item.business_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900">{item.business_name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 truncate max-w-xs">
                        {item.link_url}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px]">
                        {new Date(item.deleted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(item)}
                            disabled={isSubmitting}
                            className="tactile-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => {
                              setPermanentDeleteTarget(item);
                              setTypedConfirmName("");
                            }}
                            disabled={isSubmitting}
                            className="tactile-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT WHOLE ENTRY                                                   */}
      {/* ========================================================================= */}
      {editWholeTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">
                    Edit Page Entry: {editWholeTarget.tag_id}
                  </h3>
                  <p className="text-[11px] text-zinc-500">Edit business name, target preview URL, or setup status</p>
                </div>
              </div>
              <button
                onClick={() => setEditWholeTarget(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWholeEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Tag ID</label>
                  <input
                    type="text"
                    disabled
                    value={editWholeTagId}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-mono font-bold text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Business ID</label>
                  <input
                    type="text"
                    value={editWholeBusinessId}
                    onChange={(e) => setEditWholeBusinessId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Business Name</label>
                <input
                  type="text"
                  value={editWholeBusinessName}
                  onChange={(e) => setEditWholeBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Link URL</label>
                <input
                  type="text"
                  value={editWholeLinkUrl}
                  onChange={(e) => setEditWholeLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Setup Status</label>
                <select
                  value={editWholeSetupStatus}
                  onChange={(e) => setEditWholeSetupStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditWholeTarget(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SOFT DELETE CONFIRMATION                                            */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-zinc-900">Move Config to Deleted Section?</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Are you sure you want to delete the page customization for <strong className="text-zinc-900 font-bold">{deleteTarget.business_name}</strong> ({deleteTarget.tag_id})?
                This will be moved to the <strong>Deleted</strong> section and can be restored at any time.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSoftDelete}
                disabled={isSubmitting}
                className="tactile-btn px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Yes, Move to Deleted"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PERMANENT DELETE WITH TYPED CONFIRMATION (Deleted Tab Only)          */}
      {/* ========================================================================= */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-rose-950">Delete Page Config Permanently</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                This action is <strong>irreversible</strong>. The landing page configuration for <strong>{permanentDeleteTarget.business_name}</strong> ({permanentDeleteTarget.tag_id}) will be permanently removed from the database.
              </p>
            </div>

            <div className="space-y-2 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
              <label className="block text-[11px] font-bold text-zinc-800">
                To confirm permanent deletion, please type:
                <span className="block mt-1 font-mono text-xs text-rose-900 bg-white px-2 py-1 rounded border border-rose-200 select-all">
                  {permanentDeleteTarget.tag_id}
                </span>
              </label>
              <input
                type="text"
                value={typedConfirmName}
                onChange={(e) => setTypedConfirmName(e.target.value)}
                placeholder="Type exact Tag ID here"
                className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono uppercase"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setPermanentDeleteTarget(null);
                  setTypedConfirmName("");
                }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={
                  isSubmitting ||
                  typedConfirmName.trim().toUpperCase() !== permanentDeleteTarget.tag_id.trim().toUpperCase()
                }
                className="tactile-btn px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL VISUAL PAGE EDITOR & LIVE MOCKUP PREVIEW                      */}
      {/* ========================================================================= */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Design Review Page — {activeItem.business_name} ({activeItem.tag_id})
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">{editTagLink}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Body: Controls on Left, Live Mockup on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* Controls Column (7 Cols) */}
              <div className="lg:col-span-7 p-6 overflow-y-auto space-y-5 border-r border-zinc-200 bg-zinc-50/50">
                <form onSubmit={handleSaveDesign} className="space-y-4">
                  {/* Theme Presets */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Theme Preset</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "obsidian", label: "Obsidian Dark", bg: "bg-[#0e1015] text-white" },
                        { id: "slate", label: "Slate Minimal", bg: "bg-slate-900 text-white" },
                        { id: "emerald", label: "Emerald Luxe", bg: "bg-emerald-950 text-white" },
                        { id: "sunset", label: "Sunset Amber", bg: "bg-orange-950 text-white" },
                        { id: "clean_light", label: "Pure Light", bg: "bg-white text-zinc-900 border" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setEditTheme(t.id)}
                          className={`p-2 rounded-xl text-center cursor-pointer transition-all ${
                            editTheme === t.id
                              ? "ring-2 ring-purple-600 shadow-sm"
                              : "opacity-75 hover:opacity-100"
                          }`}
                        >
                          <div className={`w-full h-8 rounded-lg ${t.bg} flex items-center justify-center text-[10px] font-bold shadow-2xs mb-1`}>
                            Aa
                          </div>
                          <span className="text-[11px] font-medium text-zinc-700">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Titles */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Headline / Business Title</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Subtitle / Category</label>
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                  </div>

                  {/* CTA Text & Google Link */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1">Primary Hero Button Text</label>
                    <input
                      type="text"
                      value={editCtaText}
                      onChange={(e) => setEditCtaText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1">Google Review Form URL</label>
                    <input
                      type="url"
                      placeholder="https://g.page/r/.../review"
                      value={editGoogleLink}
                      onChange={(e) => setEditGoogleLink(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono"
                    />
                  </div>

                  {/* Direct Contact Links */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Instagram URL</label>
                      <input
                        type="text"
                        value={editInstagram}
                        onChange={(e) => setEditInstagram(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setActiveItem(null)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="tactile-btn flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save &amp; Publish Live</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Interactive Phone Mockup (5 Cols) */}
              <div className="lg:col-span-5 p-6 bg-zinc-900 flex flex-col items-center justify-center overflow-y-auto">
                <div className="w-[280px] bg-[#0e1015] rounded-[36px] border-[5px] border-zinc-800 shadow-2xl overflow-hidden text-white flex flex-col relative">
                  {/* Notch */}
                  <div className="h-4 bg-zinc-900 flex justify-center items-center">
                    <div className="w-16 h-2.5 bg-zinc-950 rounded-full" />
                  </div>

                  {/* Cover */}
                  <div className="h-20 bg-gradient-to-r from-orange-500 to-amber-500 relative flex items-center justify-center">
                    <div className="absolute -bottom-6 w-12 h-12 rounded-full border-2 border-zinc-900 bg-white overflow-hidden shadow-md flex items-center justify-center">
                      <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-8 px-4 pb-4 text-center space-y-3">
                    <div>
                      <h4 className="font-extrabold text-xs text-white leading-tight">
                        {editTitle || "Business Name"}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{editSubtitle}</p>
                    </div>

                    {/* Quick Call & Directions */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="px-2.5 py-1 rounded-md bg-zinc-800 text-[9px] font-bold text-zinc-300 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Call</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-md bg-zinc-800 text-[9px] font-bold text-zinc-300 flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5 text-blue-400" />
                        <span>Directions</span>
                      </div>
                    </div>

                    {/* Primary Review Hero Button */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-sm text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3 h-3 fill-white text-white" />
                        ))}
                      </div>
                      <span className="block text-[10px] font-extrabold text-white leading-snug">
                        {editCtaText}
                      </span>
                    </div>

                    {/* Social Shortcuts */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-pink-600/30 border border-pink-500/40 flex items-center justify-center">
                        <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      </div>
                    </div>
                  </div>

                  {/* Home Bar */}
                  <div className="py-2 flex justify-center">
                    <div className="w-20 h-1 bg-zinc-700 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR CODE PREVIEW & DOWNLOAD                                         */}
      {/* ========================================================================= */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="text-left">
                <h3 className="font-bold text-base text-zinc-900">{qrModalItem.tag_id} Page QR</h3>
                <p className="text-[11px] text-zinc-500">{qrModalItem.business_name}</p>
              </div>
              <button
                onClick={() => setQrModalItem(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR for ${qrModalItem.tag_id}`} className="w-56 h-56 rounded-lg shadow-xs" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-zinc-400">
                  Generating high-res QR...
                </div>
              )}
              <span className="font-mono text-xs font-bold text-zinc-700 mt-3">{qrModalItem.link_url}</span>
            </div>

            <button
              onClick={() => handleDownloadQr(qrModalItem)}
              className="tactile-btn w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Page QR PNG</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
