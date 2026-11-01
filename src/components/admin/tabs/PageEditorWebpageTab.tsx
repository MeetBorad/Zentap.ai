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
} from "lucide-react";
import QRCode from "qrcode";
import {
  PageEditorConfigItemRecord,
  getAllPageEditorConfigs,
  savePageEditorConfig,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";

interface PageEditorWebpageTabProps {
  onShowToast: (msg: string) => void;
}

export default function PageEditorWebpageTab({ onShowToast }: PageEditorWebpageTabProps) {
  const [editorConfigs, setEditorConfigs] = useState<PageEditorConfigItemRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  // QR Modal
  const [qrModalItem, setQrModalItem] = useState<PageEditorConfigItemRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setEditorConfigs(getAllPageEditorConfigs());
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

    // savePageEditorConfig automatically changes setup_status to "completed" in green!
    const saved = savePageEditorConfig(activeItem.tag_id, newConfigData);
    if (saved) {
      onShowToast(`✓ Saved custom review page for ${saved.business_name} (${saved.tag_id})! Status marked Completed.`);
      setActiveItem(null);
      refreshData();
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
      console.warn("QR generation error", e);
    }
  };

  const handleDownloadQr = (item: PageEditorConfigItemRecord, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `page-editor-qr-${item.tag_id.toLowerCase()}.png`;
    a.click();
    onShowToast(`✓ Downloaded QR code for ${item.tag_id}`);
  };

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filteredConfigs = editorConfigs.filter((c) => {
    if (!q) return true;
    return (
      (c.business_id && c.business_id.toLowerCase().includes(q)) ||
      (c.business_name && c.business_name.toLowerCase().includes(q)) ||
      (c.tag_id && c.tag_id.toLowerCase().includes(q)) ||
      (c.setup_status && c.setup_status.toLowerCase().includes(q))
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

        {/* Search Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
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

      {/* PAGE EDITOR DIRECTORY TABLE */}
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
                <th className="py-3.5 px-4 text-right">Page Editor</th>
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

                      {/* Status of this Setup: Default Pending in Red; Completed in Green once saved */}
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

                      {/* Page Editor Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditor(item)}
                          className="tactile-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Open Page Editor</span>
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
                        { id: "obsidian", label: "Obsidian Dark", bg: "bg-zinc-950 text-white" },
                        { id: "gold", label: "Luxury Gold", bg: "bg-amber-950 text-amber-300" },
                        { id: "emerald", label: "Emerald Clean", bg: "bg-emerald-950 text-emerald-300" },
                        { id: "indigo", label: "Indigo Glass", bg: "bg-indigo-950 text-indigo-200" },
                        { id: "slate", label: "Minimal Slate", bg: "bg-slate-900 text-white" },
                      ].map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setEditTheme(th.id)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${th.bg} ${
                            editTheme === th.id
                              ? "ring-2 ring-purple-500 border-white"
                              : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                        >
                          {th.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tag Link URL */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Target Link / Review Page URL
                    </label>
                    <input
                      type="url"
                      value={editTagLink}
                      onChange={(e) => setEditTagLink(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Business Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Banner & Logo */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Cover Banner Image URL
                      </label>
                      <input
                        type="text"
                        value={editBannerUrl}
                        onChange={(e) => setEditBannerUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Business Logo Image URL
                      </label>
                      <input
                        type="text"
                        value={editLogoUrl}
                        onChange={(e) => setEditLogoUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Primary CTA & Google Review Link */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Hero Button CTA Text
                    </label>
                    <input
                      type="text"
                      value={editCtaText}
                      onChange={(e) => setEditCtaText(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Destination Google Review Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://g.page/r/.../review"
                      value={editGoogleLink}
                      onChange={(e) => setEditGoogleLink(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  {/* Contact Shortcuts */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">Instagram</label>
                      <input
                        type="text"
                        placeholder="@username"
                        value={editInstagram}
                        onChange={(e) => setEditInstagram(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      Saving marks this setup as <strong className="text-emerald-700">Completed</strong>
                    </span>
                    <button
                      type="submit"
                      className="tactile-btn flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save &amp; Complete Setup</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Interactive Phone Mockup (5 Cols) */}
              <div className="lg:col-span-5 bg-zinc-900 p-6 flex items-center justify-center overflow-y-auto">
                <div className="w-[310px] rounded-[38px] border-[6px] border-zinc-800 bg-[#0e1015] shadow-2xl overflow-hidden flex flex-col text-white">
                  {/* Phone Speaker Notch */}
                  <div className="pt-3 pb-1 text-center">
                    <div className="w-16 h-1.5 rounded-full bg-zinc-700 mx-auto" />
                  </div>

                  {/* Mockup Banner */}
                  <div className="relative h-28 bg-zinc-800 overflow-hidden">
                    <img
                      src={editBannerUrl || "/standees/standee_01.jpg"}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-transparent to-black/30" />
                  </div>

                  {/* Mockup Logo */}
                  <div className="-mt-8 px-4 flex items-end gap-3 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border-2 border-white/20 p-1 overflow-hidden shadow-lg">
                      <img
                        src={editLogoUrl || "/logo.png"}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="pb-1">
                      <h4 className="text-xs font-bold text-white leading-tight">{editTitle}</h4>
                      <p className="text-[10px] text-zinc-400">{editSubtitle}</p>
                    </div>
                  </div>

                  {/* Star Rating Badges */}
                  <div className="px-4 mt-3 flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[10px] text-zinc-300 font-bold ml-1">5.0 (Google)</span>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="px-4 grid grid-cols-4 gap-1.5 mt-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      <Phone className="w-3 h-3 mx-auto text-emerald-400 mb-0.5" />
                      <span className="text-[9px] text-zinc-300">Call</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      <Navigation className="w-3 h-3 mx-auto text-blue-400 mb-0.5" />
                      <span className="text-[9px] text-zinc-300">Route</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      <MessageCircle className="w-3 h-3 mx-auto text-[#25D366] mb-0.5" />
                      <span className="text-[9px] text-zinc-300">Chat</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      <Instagram className="w-3 h-3 mx-auto text-pink-400 mb-0.5" />
                      <span className="text-[9px] text-zinc-300">Follow</span>
                    </div>
                  </div>

                  {/* Primary CTA Hero Button */}
                  <div className="p-4 mt-2">
                    <button
                      type="button"
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-extrabold text-[11px] shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-black" />
                      <span>{editCtaText}</span>
                    </button>
                    <p className="text-center text-[9px] text-zinc-500 mt-2">
                      Powered by ZenTap Smart Review Assistant
                    </p>
                  </div>

                  {/* Home Indicator */}
                  <div className="mt-auto py-2">
                    <div className="w-20 h-1 rounded-full bg-zinc-700 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
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
              <p className="text-[11px] text-zinc-500 font-mono truncate">{qrModalItem.link_url}</p>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
