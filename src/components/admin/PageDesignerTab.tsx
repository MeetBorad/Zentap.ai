// src/components/admin/PageDesignerTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Palette, 
  Layout, 
  Smartphone, 
  ExternalLink, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Sliders, 
  Image as ImageIcon, 
  Type, 
  Eye, 
  EyeOff, 
  Star, 
  Sparkles, 
  BarChart3, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Clock,
  MessageCircle,
  Phone,
  MapPin,
  ChevronDown
} from "lucide-react";
import { BusinessRecord } from "@/lib/businessStore";
import { 
  PageDesignRecord, 
  PageButtonRecord, 
  PageSectionRecord, 
  PagePhotoRecord,
  ThemePreset,
  ButtonStyle,
  CardStyle,
  DarkModeSetting,
  THEME_PRESET_CONFIGS,
  getPageDesign,
  savePageDesign,
  getPageButtons,
  savePageButtons,
  getPageSections,
  savePageSections,
  getPagePhotos,
  savePagePhotos,
  addPageButton,
  deletePageButton,
  addPagePhoto,
  deletePagePhoto,
  duplicatePageDesign,
  getAllClickEvents
} from "@/lib/hubDesignStore";
import ZenTapHubPage from "@/components/customer/ZenTapHubPage";

interface PageDesignerTabProps {
  businesses: BusinessRecord[];
  initialBusinessId?: string;
  showToast: (msg: string) => void;
  onNavigateToReviews?: (bizId: string) => void;
}

type DesignerSubTab = 
  | "branding" 
  | "theme" 
  | "buttons" 
  | "sections" 
  | "review_assistant" 
  | "texts" 
  | "behaviour" 
  | "analytics";

export default function PageDesignerTab({
  businesses,
  initialBusinessId,
  showToast,
  onNavigateToReviews,
}: PageDesignerTabProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>(
    initialBusinessId || businesses[0]?.id || ""
  );

  const selectedBiz = businesses.find((b) => b.id === selectedBizId) || businesses[0];

  const [activeTab, setActiveTab] = useState<DesignerSubTab>("branding");

  // Live state
  const [design, setDesign] = useState<PageDesignRecord>(() => getPageDesign(selectedBizId));
  const [buttons, setButtons] = useState<PageButtonRecord[]>(() => getPageButtons(selectedBizId));
  const [sections, setSections] = useState<PageSectionRecord[]>(() => getPageSections(selectedBizId));
  const [photos, setPhotos] = useState<PagePhotoRecord[]>(() => getPagePhotos(selectedBizId));

  // Modals & temporary inputs
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateSourceBizId, setDuplicateSourceBizId] = useState("");
  const [newBtnModalOpen, setNewBtnModalOpen] = useState(false);
  const [newBtnType, setNewBtnType] = useState<any>("custom");
  const [newBtnLabel, setNewBtnLabel] = useState("");
  const [newBtnUrl, setNewBtnUrl] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");

  // Sync when business selection changes
  useEffect(() => {
    if (selectedBizId) {
      setDesign(getPageDesign(selectedBizId));
      setButtons(getPageButtons(selectedBizId));
      setSections(getPageSections(selectedBizId));
      setPhotos(getPagePhotos(selectedBizId));
    }
  }, [selectedBizId]);

  const handleSaveDesign = () => {
    savePageDesign(design);
    savePageButtons(selectedBizId, buttons);
    savePageSections(selectedBizId, sections);
    savePagePhotos(selectedBizId, photos);
    showToast("✓ Page design and layout saved!");
  };

  const handleApplyPreset = (presetKey: ThemePreset) => {
    const preset = THEME_PRESET_CONFIGS[presetKey];
    setDesign((prev) => ({
      ...prev,
      theme_preset: presetKey,
      primary_color: preset.primary_color,
      accent_color: preset.accent_color,
      bg_color: preset.bg_color,
      font: preset.font,
      button_style: preset.button_style,
      card_style: preset.card_style,
      dark_mode: preset.dark_mode,
    }));
    showToast(`✓ Applied ${preset.name} theme!`);
  };

  const handleDuplicate = () => {
    if (!duplicateSourceBizId || duplicateSourceBizId === selectedBizId) return;
    duplicatePageDesign(duplicateSourceBizId, selectedBizId);
    setDesign(getPageDesign(selectedBizId));
    setButtons(getPageButtons(selectedBizId));
    setSections(getPageSections(selectedBizId));
    setPhotos(getPagePhotos(selectedBizId));
    setDuplicateModalOpen(false);
    showToast("✓ Successfully duplicated design from selected business!");
  };

  const handleAddButton = () => {
    if (!newBtnLabel.trim() || !newBtnUrl.trim()) return;
    const added = addPageButton(selectedBizId, {
      type: newBtnType,
      label: newBtnLabel.trim(),
      url_or_value: newBtnUrl.trim(),
      sort_order: buttons.length,
      visible: true,
    });
    setButtons(getPageButtons(selectedBizId));
    setNewBtnLabel("");
    setNewBtnUrl("");
    setNewBtnModalOpen(false);
    showToast("✓ Added button!");
  };

  const handleToggleBtnVisibility = (btnId: string) => {
    const updated = buttons.map((b) => (b.id === btnId ? { ...b, visible: !b.visible } : b));
    setButtons(updated);
    savePageButtons(selectedBizId, updated);
  };

  const handleMoveButton = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= buttons.length) return;
    const next = [...buttons];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    next.forEach((b, i) => (b.sort_order = i));
    setButtons(next);
    savePageButtons(selectedBizId, next);
  };

  const handleDeleteBtn = (id: string) => {
    const updated = deletePageButton(selectedBizId, id);
    setButtons(updated);
    showToast("Button removed");
  };

  const handleToggleSectionVisibility = (secId: string) => {
    const updated = sections.map((s) => (s.id === secId ? { ...s, visible: !s.visible } : s));
    setSections(updated);
    savePageSections(selectedBizId, updated);
  };

  const handleMoveSection = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const next = [...sections];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    next.forEach((s, i) => (s.sort_order = i));
    setSections(next);
    savePageSections(selectedBizId, next);
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    addPagePhoto(selectedBizId, newPhotoUrl.trim(), newPhotoCaption.trim());
    setPhotos(getPagePhotos(selectedBizId));
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    showToast("✓ Added photo to gallery!");
  };

  const handleDeletePhoto = (photoId: string) => {
    const updated = deletePagePhoto(selectedBizId, photoId);
    setPhotos(updated);
    showToast("Photo removed");
  };

  // Click Analytics
  const clicks = getAllClickEvents(selectedBizId);
  const clicksByType = clicks.reduce((acc: any, c) => {
    acc[c.button_type] = (acc[c.button_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            <span className="font-headline font-bold text-base text-zinc-900">
              Page Designer
            </span>
          </div>

          {/* Business Selector */}
          <select
            value={selectedBizId}
            onChange={(e) => setSelectedBizId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 font-bold text-xs border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.slug})
              </option>
            ))}
          </select>

          {/* Master Hub Enabled Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextState = !design.hub_enabled;
              setDesign((prev) => ({ ...prev, hub_enabled: nextState }));
              savePageDesign({ ...design, hub_enabled: nextState });
              showToast(nextState ? "✓ ZenTap Hub Page is now LIVE for this business!" : "ZenTap Hub Page set to inactive");
            }}
            className={`tactile-btn px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              design.hub_enabled
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-zinc-100 text-zinc-600 border-zinc-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${design.hub_enabled ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
            <span>{design.hub_enabled ? "Hub Page: LIVE" : "Hub Page: OFF"}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDuplicateModalOpen(true)}
            className="tactile-btn px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs border border-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate From...</span>
          </button>

          <a
            href={`/r/${selectedBiz?.slug}?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="tactile-btn px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Preview</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <button
            type="button"
            onClick={handleSaveDesign}
            className="tactile-btn px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* 2. SPLIT WORKBENCH: CONTROLS (LEFT) + LIVE PHONE PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT PANE: CONFIGURATION TABS (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">

          {/* Sub-Tabs Navigation */}
          <div className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-2xl overflow-x-auto text-xs font-bold text-zinc-600">
            {[
              { id: "branding", label: "Branding", icon: ImageIcon },
              { id: "theme", label: "Theme", icon: Palette },
              { id: "buttons", label: "Buttons", icon: Sliders },
              { id: "sections", label: "Sections", icon: Layout },
              { id: "texts", label: "Texts", icon: Type },
              { id: "behaviour", label: "Behaviour", icon: CheckCircle2 },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-white text-zinc-900 shadow-xs font-black"
                      : "hover:text-zinc-900 hover:bg-white/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: BRANDING */}
          {activeTab === "branding" && (
            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <h3 className="font-headline font-bold text-sm text-zinc-900">
                Visual Branding &amp; Contact Details
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Tagline (shown below business name)
                  </label>
                  <input
                    type="text"
                    value={design.tagline || ""}
                    onChange={(e) => setDesign({ ...design, tagline: e.target.value })}
                    placeholder="Welcome to our official digital hub"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={design.logo_url || ""}
                      onChange={(e) => setDesign({ ...design, logo_url: e.target.value })}
                      placeholder="https://... (or leave empty for initial)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      Cover Banner URL
                    </label>
                    <input
                      type="text"
                      value={design.cover_url || ""}
                      onChange={(e) => setDesign({ ...design, cover_url: e.target.value })}
                      placeholder="https://... (or leave empty for dark gradient)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Address Pill Text
                  </label>
                  <input
                    type="text"
                    value={design.address || ""}
                    onChange={(e) => setDesign({ ...design, address: e.target.value })}
                    placeholder="e.g. Navrangpura, Ahmedabad, Gujarat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Google Maps Link
                  </label>
                  <input
                    type="text"
                    value={design.maps_link || ""}
                    onChange={(e) => setDesign({ ...design, maps_link: e.target.value })}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-indigo-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-700">
                    Show "Powered by ZenTap" badge in footer
                  </span>
                  <input
                    type="checkbox"
                    checked={design.show_powered_by}
                    onChange={(e) => setDesign({ ...design, show_powered_by: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THEME */}
          {activeTab === "theme" && (
            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-5">
              <div>
                <h3 className="font-headline font-bold text-sm text-zinc-900 mb-2">
                  1-Click Theme Presets
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(THEME_PRESET_CONFIGS) as ThemePreset[]).map((key) => {
                    const preset = THEME_PRESET_CONFIGS[key];
                    const isSelected = design.theme_preset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                            : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary_color }} />
                          <span className="text-xs font-bold truncate">{preset.name}</span>
                        </div>
                        <span className="text-[10px] opacity-70 block font-mono">
                          {preset.dark_mode.toUpperCase()} • {preset.card_style}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Colors & Style Controls */}
              <div className="border-t border-zinc-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                  Custom Colors &amp; Styling
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={design.primary_color}
                        onChange={(e) => setDesign({ ...design, primary_color: e.target.value })}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={design.primary_color}
                        onChange={(e) => setDesign({ ...design, primary_color: e.target.value })}
                        className="w-full text-xs font-mono font-bold px-2 py-1.5 rounded-lg border border-zinc-200 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={design.accent_color}
                        onChange={(e) => setDesign({ ...design, accent_color: e.target.value })}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={design.accent_color}
                        onChange={(e) => setDesign({ ...design, accent_color: e.target.value })}
                        className="w-full text-xs font-mono font-bold px-2 py-1.5 rounded-lg border border-zinc-200 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Canvas Background
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={design.bg_color}
                        onChange={(e) => setDesign({ ...design, bg_color: e.target.value })}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={design.bg_color}
                        onChange={(e) => setDesign({ ...design, bg_color: e.target.value })}
                        className="w-full text-xs font-mono font-bold px-2 py-1.5 rounded-lg border border-zinc-200 uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Typography Font
                    </label>
                    <select
                      value={design.font}
                      onChange={(e) => setDesign({ ...design, font: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold"
                    >
                      <option value="Inter">Inter (Clean Modern)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Premium)</option>
                      <option value="Outfit">Outfit (Bold Geometric)</option>
                      <option value="Roboto">Roboto (Classic)</option>
                      <option value="Poppins">Poppins (Friendly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Button Style
                    </label>
                    <select
                      value={design.button_style}
                      onChange={(e) => setDesign({ ...design, button_style: e.target.value as ButtonStyle })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold"
                    >
                      <option value="rounded">Rounded Corners (Modern)</option>
                      <option value="pill">Pill (Full Round)</option>
                      <option value="square">Square (Tactile Sharp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Card Container Style
                    </label>
                    <select
                      value={design.card_style}
                      onChange={(e) => setDesign({ ...design, card_style: e.target.value as CardStyle })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold"
                    >
                      <option value="glass">Glassmorphism (Frosted)</option>
                      <option value="flat">Flat Surface</option>
                      <option value="elevated">Elevated Shadow</option>
                      <option value="bordered">Sharp Bordered</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUTTONS */}
          {activeTab === "buttons" && (
            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-sm text-zinc-900">
                    Action Buttons &amp; Touchpoints
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Reorder, hide/show, or add custom external links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewBtnModalOpen(true)}
                  className="tactile-btn px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Button</span>
                </button>
              </div>

              <div className="space-y-2">
                {buttons.map((btn, idx) => (
                  <div
                    key={btn.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      btn.visible ? "bg-zinc-50/80 border-zinc-200" : "bg-zinc-100/40 border-zinc-200/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveButton(idx, "up")}
                          className="p-0.5 rounded text-zinc-400 hover:text-zinc-900 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === buttons.length - 1}
                          onClick={() => handleMoveButton(idx, "down")}
                          className="p-0.5 rounded text-zinc-400 hover:text-zinc-900 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-zinc-800 capitalize truncate">
                        {btn.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono">
                        {btn.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleBtnVisibility(btn.id)}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                          btn.visible ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-400 border-zinc-200"
                        }`}
                        title={btn.visible ? "Visible on Hub" : "Hidden"}
                      >
                        {btn.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {btn.type === "custom" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBtn(btn.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SECTIONS */}
          {activeTab === "sections" && (
            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <h3 className="font-headline font-bold text-sm text-zinc-900">
                Interactive Sections Layout &amp; Content
              </h3>

              <div className="space-y-4">
                {sections.map((section, idx) => (
                  <div key={section.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, "up")}
                            className="p-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sections.length - 1}
                            onClick={() => handleMoveSection(idx, "down")}
                            className="p-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wider text-zinc-800 font-mono">
                          {section.type}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSectionVisibility(section.id)}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                          section.visible ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-400 border-zinc-200"
                        }`}
                      >
                        {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Section Specific Content Editors */}
                    {section.type === "about" && (
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 block mb-1">About Text</label>
                        <textarea
                          rows={3}
                          value={section.content?.text || ""}
                          onChange={(e) => {
                            const updated = sections.map((s) => s.id === section.id ? { ...s, content: { ...s.content, text: e.target.value } } : s);
                            setSections(updated);
                          }}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 bg-white"
                        />
                      </div>
                    )}

                    {section.type === "photos" && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-700 block">Photo Gallery ({photos.length} Photos)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                            placeholder="Image URL (https://...)"
                            className="flex-1 text-xs p-2 rounded-xl border border-zinc-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddPhoto}
                            className="px-3 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 pt-2">
                          {photos.map((p) => (
                            <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group border border-zinc-200">
                              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(p.id)}
                                className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TEXTS */}
          {activeTab === "texts" && (
            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <h3 className="font-headline font-bold text-sm text-zinc-900">
                Custom Text Labels &amp; Headings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(design.texts).map((key) => (
                  <div key={key}>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1 capitalize">
                      {key.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      value={design.texts[key] || ""}
                      onChange={(e) => {
                        setDesign({
                          ...design,
                          texts: { ...design.texts, [key]: e.target.value },
                        });
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BEHAVIOUR */}
          {activeTab === "behaviour" && (
            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <h3 className="font-headline font-bold text-sm text-zinc-900">
                Scan Routing &amp; Hub Activation
              </h3>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <span className="font-bold text-xs text-indigo-900 block">
                  How the Hub Page Works
                </span>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  When <strong>Hub Page: LIVE</strong> is enabled, any visitor scanning this business's physical standee or NFC card lands on this branded mobile Hub.
                  From here, they can tap <strong>"Write a Review"</strong> (opening the AI assistant), call your store, get directions, or explore your gallery and social links.
                </p>
                <p className="text-xs text-indigo-700 font-semibold">
                  If set to <strong>OFF</strong>, scans follow the legacy review page or direct Google routing.
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-sm text-zinc-900">
                  Hub Touchpoint Analytics ({clicks.length} Total Clicks)
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["review", "call", "directions", "whatsapp", "instagram", "facebook", "youtube"].map((type) => (
                  <div key={type} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block capitalize">
                      {type} Clicks
                    </span>
                    <span className="font-headline font-bold text-lg text-zinc-900">
                      {clicksByType[type] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PANE: LIVE PHONE PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-[360px]">
            <div className="flex items-center justify-between pb-2 px-1 text-xs font-bold text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-zinc-700" />
                <span>Live Mobile Preview</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Interactive
              </span>
            </div>

            {/* Realistic Phone Frame */}
            <div className="relative rounded-[40px] border-[8px] border-zinc-900 shadow-2xl overflow-hidden bg-black aspect-[9/18] max-h-[720px] flex flex-col">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-900 rounded-full z-30" />

              {/* Scrollable Inside View */}
              <div className="flex-1 overflow-y-auto">
                <ZenTapHubPage
                  business={selectedBiz}
                  design={design}
                  buttons={buttons}
                  sections={sections}
                  photos={photos}
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DUPLICATE MODAL */}
      {duplicateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Duplicate Design From Another Client
            </h3>
            <p className="text-xs text-zinc-500">
              Copy all theme colors, layout, buttons, and sections from an existing business to <strong>{selectedBiz.name}</strong>.
            </p>

            <select
              value={duplicateSourceBizId}
              onChange={(e) => setDuplicateSourceBizId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold"
            >
              <option value="">Choose source client...</option>
              {businesses.filter((b) => b.id !== selectedBizId).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDuplicateModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!duplicateSourceBizId}
                onClick={handleDuplicate}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white disabled:opacity-40"
              >
                Duplicate Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW BUTTON MODAL */}
      {newBtnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Add New Touchpoint Button
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Button Type</label>
                <select
                  value={newBtnType}
                  onChange={(e) => setNewBtnType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-semibold"
                >
                  <option value="custom">Custom Web Link</option>
                  <option value="menu">Digital Menu / Catalog</option>
                  <option value="booking">Appointment / Booking</option>
                  <option value="whatsapp">WhatsApp Direct</option>
                  <option value="instagram">Instagram Profile</option>
                  <option value="facebook">Facebook Page</option>
                  <option value="youtube">YouTube Channel</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Button Label</label>
                <input
                  type="text"
                  value={newBtnLabel}
                  onChange={(e) => setNewBtnLabel(e.target.value)}
                  placeholder="e.g. View Digital Menu"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Destination URL or Value</label>
                <input
                  type="text"
                  value={newBtnUrl}
                  onChange={(e) => setNewBtnUrl(e.target.value)}
                  placeholder="https://... or phone/email"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewBtnModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddButton}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
              >
                Add Button
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
