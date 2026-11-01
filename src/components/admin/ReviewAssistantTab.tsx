// src/components/admin/ReviewAssistantTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Settings, 
  Layers, 
  Globe, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  Check, 
  Save, 
  BarChart3, 
  ChevronDown, 
  ArrowUpDown, 
  Sliders, 
  Phone, 
  Instagram, 
  Facebook, 
  MapPin, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Copy
} from "lucide-react";
import { 
  BusinessRecord 
} from "@/lib/businessStore";
import { 
  ReviewConfigRecord, 
  ReviewOptionRecord, 
  ReviewLanguage, 
  ReviewTone, 
  ReviewLength,
  PRESET_ASPECTS,
  getBusinessReviewConfig, 
  updateBusinessReviewConfig, 
  getAllReviewOptions, 
  addReviewOption, 
  updateReviewOption, 
  deleteReviewOption, 
  reorderReviewOptions, 
  addPresetsForBusiness, 
  getReviewUsageStats,
  getRecentGenerationsForBusiness,
  ReviewGenerationRecord 
} from "@/lib/reviewAssistantStore";

interface ReviewAssistantTabProps {
  businesses: BusinessRecord[];
  initialBusinessId?: string;
  showToast: (msg: string) => void;
}

export default function ReviewAssistantTab({
  businesses,
  initialBusinessId,
  showToast,
}: ReviewAssistantTabProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>(
    initialBusinessId || businesses[0]?.id || ""
  );

  const [activeSubTab, setActiveSubTab] = useState<"options" | "language_tone" | "links_address" | "usage">("options");

  // Config State
  const [config, setConfig] = useState<ReviewConfigRecord>(() =>
    getBusinessReviewConfig(selectedBizId)
  );

  // Options State
  const [options, setOptions] = useState<ReviewOptionRecord[]>(() =>
    getAllReviewOptions(selectedBizId)
  );

  // Add Option inputs
  const [newProductInput, setNewProductInput] = useState("");
  const [newAspectInput, setNewAspectInput] = useState("");

  // Preset Selection Modal
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);

  // Usage Telemetry
  const [usageStats, setUsageStats] = useState(() => getReviewUsageStats(selectedBizId));
  const [recentGenerations, setRecentGenerations] = useState<ReviewGenerationRecord[]>(() =>
    getRecentGenerationsForBusiness(selectedBizId, 10)
  );
  const [availableModels, setAvailableModels] = useState<{ id: string; label: string; model_id: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/models")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.models)) {
          setAvailableModels(d.models.map((m: any) => ({ id: m.id, label: m.label, model_id: m.model_id })));
        }
      })
      .catch(() => {});
  }, []);

  // Switch business
  useEffect(() => {
    if (selectedBizId) {
      const freshConfig = getBusinessReviewConfig(selectedBizId);
      setConfig(freshConfig);
      setOptions(getAllReviewOptions(selectedBizId));
      setUsageStats(getReviewUsageStats(selectedBizId));
      setRecentGenerations(getRecentGenerationsForBusiness(selectedBizId, 10));
    }
  }, [selectedBizId]);

  const selectedBiz = businesses.find((b) => b.id === selectedBizId) || businesses[0];

  // Toggle Assistant On/Off
  const handleToggleAiReview = () => {
    const nextVal = !config.ai_review_enabled;
    const updated = updateBusinessReviewConfig(selectedBizId, {
      ai_review_enabled: nextVal,
    });
    setConfig(updated);
    showToast(
      nextVal
        ? `✓ AI Review Assistant ENABLED for "${selectedBiz?.name}"!`
        : `✓ AI Review Assistant DISABLED. Customer page reverted to standard mode.`
    );
  };

  // Save Config Section
  const handleSaveConfig = (updates: Partial<ReviewConfigRecord>) => {
    const updated = updateBusinessReviewConfig(selectedBizId, updates);
    setConfig(updated);
    showToast("✓ Settings updated successfully!");
  };

  // Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductInput.trim()) return;
    addReviewOption(selectedBizId, "product", newProductInput.trim());
    setOptions(getAllReviewOptions(selectedBizId));
    setNewProductInput("");
    showToast("✓ Product / Service added!");
  };

  // Add Aspect
  const handleAddAspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAspectInput.trim()) return;
    addReviewOption(selectedBizId, "aspect", newAspectInput.trim());
    setOptions(getAllReviewOptions(selectedBizId));
    setNewAspectInput("");
    showToast("✓ Experience aspect added!");
  };

  // Delete Option
  const handleDeleteOption = (id: string) => {
    deleteReviewOption(id);
    setOptions(getAllReviewOptions(selectedBizId));
    showToast("Option removed.");
  };

  // Toggle Option Active
  const handleToggleOptionActive = (opt: ReviewOptionRecord) => {
    updateReviewOption(opt.id, { active: !opt.active });
    setOptions(getAllReviewOptions(selectedBizId));
  };

  // Add Presets
  const handleAddSelectedPresets = () => {
    if (selectedPresets.length === 0) return;
    const updated = addPresetsForBusiness(selectedBizId, selectedPresets);
    setOptions(updated);
    setPresetModalOpen(false);
    setSelectedPresets([]);
    showToast(`✓ Added ${selectedPresets.length} aspect presets!`);
  };

  const productOptions = options.filter((o) => o.kind === "product");
  const aspectOptions = options.filter((o) => o.kind === "aspect");

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://zentap.in";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Bar: Select Business & Master AI Assistant Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff7a00] to-amber-500 text-black flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-headline font-bold text-zinc-900">
                AI Review Assistant
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                config.ai_review_enabled ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-500"
              }`}>
                {config.ai_review_enabled ? "ACTIVE ON /R/SLUG" : "OFF (STANDARD PAGE)"}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Personalized customer drafting flow: stars ➔ smart chips ➔ 3 editable Google reviews.
            </p>
          </div>
        </div>

        {/* Business Selector & Master Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <select
              value={selectedBizId}
              onChange={(e) => setSelectedBizId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-800 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city || "Ahmedabad"})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleToggleAiReview}
            className={`tactile-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-transform active:scale-[0.978] shadow-sm ${
              config.ai_review_enabled
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-zinc-800 hover:bg-zinc-900 text-white"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${config.ai_review_enabled ? "bg-emerald-300 animate-pulse" : "bg-zinc-400"}`} />
            <span>{config.ai_review_enabled ? "Assistant: ON" : "Assistant: OFF"}</span>
          </button>

          {/* Live Preview Button */}
          <a
            href={`${originUrl}/r/${selectedBiz?.slug}?preview=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 text-xs font-bold cursor-pointer shadow-2xs"
            title="Open customer page preview in new tab"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        </div>
      </div>

      {/* Sub-Navigation Tabs (4 Sections) */}
      <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-2xl border border-zinc-200/80 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("options")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "options"
              ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Products &amp; Aspects ({options.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("language_tone")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "language_tone"
              ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Language, Tone &amp; Highlights</span>
        </button>

        <button
          onClick={() => setActiveSubTab("links_address")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "links_address"
              ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Links, Icons &amp; Address</span>
        </button>

        <button
          onClick={() => setActiveSubTab("usage")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "usage"
              ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Usage &amp; Telemetry</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PRODUCTS & ASPECTS (CHIPS MANAGEMENT)                          */}
      {/* ========================================================================= */}
      {activeSubTab === "options" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section 1A: Products / Items / Categories */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-headline font-bold text-base text-zinc-900">
                  Products &amp; Specialities
                </h3>
                <p className="text-xs text-zinc-500">
                  Items the customer bought or ordered (e.g. Masala Dosa, Root Canal, Hair Cut).
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                {productOptions.length} items
              </span>
            </div>

            {/* Add product form */}
            <form onSubmit={handleAddProduct} className="flex gap-2">
              <input
                type="text"
                placeholder="Add item (e.g. Cold Coffee, Dental Implants)..."
                value={newProductInput}
                onChange={(e) => setNewProductInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50/50"
              />
              <button
                type="submit"
                className="tactile-btn px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {productOptions.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  No products added yet. (Optional - if empty, customer sees only aspect chips)
                </div>
              ) : (
                productOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-zinc-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-800">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleOptionActive(opt)}
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold cursor-pointer ${
                          opt.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-200 text-zinc-500"
                        }`}
                      >
                        {opt.active ? "Active" : "Disabled"}
                      </button>
                      <button
                        onClick={() => handleDeleteOption(opt.id)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 1B: Experience Aspects */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-headline font-bold text-base text-zinc-900">
                  Customer Experience Aspects
                </h3>
                <p className="text-xs text-zinc-500">
                  Qualities customers praise (e.g. Cleanliness, Polite Staff, Fast Service).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPresetModalOpen(true)}
                className="tactile-btn px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 hover:bg-amber-500/20 text-xs font-bold cursor-pointer"
              >
                + Add from Presets
              </button>
            </div>

            {/* Add custom aspect form */}
            <form onSubmit={handleAddAspect} className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom aspect (e.g. Child-Friendly)..."
                value={newAspectInput}
                onChange={(e) => setNewAspectInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50/50"
              />
              <button
                type="submit"
                className="tactile-btn px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {aspectOptions.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  No aspect chips configured. Click "+ Add from Presets" above!
                </div>
              ) : (
                aspectOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-zinc-50 transition-colors text-xs"
                  >
                    <span className="font-semibold text-zinc-800">{opt.label}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleOptionActive(opt)}
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold cursor-pointer ${
                          opt.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-200 text-zinc-500"
                        }`}
                      >
                        {opt.active ? "Active" : "Disabled"}
                      </button>
                      <button
                        onClick={() => handleDeleteOption(opt.id)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete aspect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: LANGUAGE, TONE & HIGHLIGHTS                                    */}
      {/* ========================================================================= */}
      {activeSubTab === "language_tone" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Language &amp; Voice Synthesis Persona
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Configures Claude Haiku's script dialect, sentence flow, and length parameters for {selectedBiz?.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Language */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Draft Language
              </label>
              <select
                value={config.language}
                onChange={(e) => handleSaveConfig({ language: e.target.value as ReviewLanguage })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-800 bg-white"
              >
                <option value="english">Fluent English</option>
                <option value="hinglish">Hinglish (Roman Script)</option>
                <option value="gujarati_roman">Gujarati (Roman Script)</option>
                <option value="hindi_roman">Hindi (Roman Script)</option>
                <option value="mixed">Mixed Indian English</option>
              </select>
              <p className="text-[10px] text-zinc-400 mt-1">Uses natural Roman letters, never foreign scripts.</p>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Review Tone
              </label>
              <select
                value={config.tone}
                onChange={(e) => handleSaveConfig({ tone: e.target.value as ReviewTone })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-800 bg-white"
              >
                <option value="friendly">Friendly &amp; Relatable</option>
                <option value="professional">Professional &amp; Courteous</option>
                <option value="casual">Casual (allows 1 emoji)</option>
                <option value="warm">Warm &amp; Appreciative</option>
              </select>
            </div>

            {/* Default Length */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Default Length
              </label>
              <select
                value={config.default_length}
                onChange={(e) => handleSaveConfig({ default_length: e.target.value as ReviewLength })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-800 bg-white"
              >
                <option value="short">Short (1-2 sentences)</option>
                <option value="medium">Medium (3-4 sentences)</option>
                <option value="long">Long (5-6 compact sentences)</option>
              </select>
            </div>
          </div>

          {/* Model Override & Suggestions Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
            {/* Model Override */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                AI Engine Model Override
              </label>
              <select
                value={config.model_override_id || ""}
                onChange={(e) => handleSaveConfig({ model_override_id: e.target.value || null })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-800 bg-white"
              >
                <option value="">Default Fleet (Auto-Failover Priority)</option>
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.model_id})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-400 mt-1">
                Pin a specific model for this client, or use the auto-failover fleet queue.
              </p>
            </div>

            {/* Suggestions Count */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Suggestions Count Per Tap
              </label>
              <select
                value={config.suggestions_count || 3}
                onChange={(e) => handleSaveConfig({ suggestions_count: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-800 bg-white"
              >
                <option value={3}>3 Suggestions (Standard)</option>
                <option value={2}>2 Suggestions (Compact)</option>
              </select>
              <p className="text-[10px] text-zinc-400 mt-1">Number of distinct review drafts generated in one tap.</p>
            </div>
          </div>

          {/* Highlights Context */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Business Highlights (Background context for matching chips, 1 per line)
            </label>
            <textarea
              rows={4}
              value={config.highlights}
              onChange={(e) => setConfig({ ...config, highlights: e.target.value })}
              onBlur={() => handleSaveConfig({ highlights: config.highlights })}
              placeholder="e.g.&#10;Polite and courteous staff&#10;Super clean premises with ample parking&#10;Authentic and fresh ingredients"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-sans leading-relaxed"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              The AI uses these true facts only when they match customer-selected chips. It will never invent outside claims.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: LINKS, ICONS & ADDRESS                                         */}
      {/* ========================================================================= */}
      {activeSubTab === "links_address" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Links, Contact Channels &amp; Displayed Icons
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Control which icons and social links appear on the review page footer for {selectedBiz?.name}.
            </p>
          </div>

          {/* Direct Google Review Link */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Google Write-Review URL *
            </label>
            <input
              type="url"
              value={config.google_review_link || ""}
              onChange={(e) => setConfig({ ...config, google_review_link: e.target.value })}
              onBlur={() => handleSaveConfig({ google_review_link: config.google_review_link })}
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              "Copy &amp; post on Google" automatically opens this link after copying the draft.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Facebook */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={config.facebook_url || ""}
                onChange={(e) => setConfig({ ...config, facebook_url: e.target.value })}
                onBlur={() => handleSaveConfig({ facebook_url: config.facebook_url })}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={config.website_url || ""}
                onChange={(e) => setConfig({ ...config, website_url: e.target.value })}
                onBlur={() => handleSaveConfig({ website_url: config.website_url })}
                placeholder="https://yourwebsite.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Display Address (Shown below icons)
            </label>
            <input
              type="text"
              value={config.address || ""}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
              onBlur={() => handleSaveConfig({ address: config.address })}
              placeholder="e.g. Shop 4, Ground Floor, SG Highway, Ahmedabad"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Toggle which icons show */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <span className="text-xs font-bold text-zinc-800 block">
              Toggle Displayed Footer Icons:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-xs text-zinc-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_icons?.instagram ?? true}
                  onChange={(e) =>
                    handleSaveConfig({
                      show_icons: { ...config.show_icons, instagram: e.target.checked },
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span>Instagram</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_icons?.whatsapp ?? true}
                  onChange={(e) =>
                    handleSaveConfig({
                      show_icons: { ...config.show_icons, whatsapp: e.target.checked },
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span>WhatsApp</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_icons?.facebook ?? true}
                  onChange={(e) =>
                    handleSaveConfig({
                      show_icons: { ...config.show_icons, facebook: e.target.checked },
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span>Facebook</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_icons?.website ?? true}
                  onChange={(e) =>
                    handleSaveConfig({
                      show_icons: { ...config.show_icons, website: e.target.checked },
                    })
                  }
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span>Website</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: USAGE & TELEMETRY                                              */}
      {/* ========================================================================= */}
      {activeSubTab === "usage" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Live Review Assistant Telemetry
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Monitor customer engagement, generation volume, and Google conversion clicks for {selectedBiz?.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Today Drafts</span>
              <span className="font-headline font-black text-2xl text-zinc-900 my-1">
                {usageStats.todayGenerations}
              </span>
              <span className="text-[10px] text-zinc-400">Written today</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Month Drafts</span>
              <span className="font-headline font-black text-2xl text-zinc-900 my-1">
                {usageStats.monthGenerations} / {config.monthly_generation_cap || 300}
              </span>
              <span className="text-[10px] text-zinc-400">Monthly cap quota</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Copied Drafts</span>
              <span className="font-headline font-black text-2xl text-emerald-600 my-1">
                {usageStats.copiedClicks}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">Ready for posting</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Opened Google</span>
              <span className="font-headline font-black text-2xl text-blue-600 my-1">
                {usageStats.openedGoogleClicks}
              </span>
              <span className="text-[10px] text-zinc-400">Google direct opens</span>
            </div>
          </div>

          {/* Monthly Cap Adjuster */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-zinc-900 block">Monthly Generation Cap</span>
              <span className="text-[11px] text-zinc-500">
                Safeguard against automated scraping or bot abuse for this business.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                max={5000}
                value={config.monthly_generation_cap || 300}
                onChange={(e) =>
                  setConfig({ ...config, monthly_generation_cap: parseInt(e.target.value) || 300 })
                }
                onBlur={() =>
                  handleSaveConfig({ monthly_generation_cap: config.monthly_generation_cap || 300 })
                }
                className="w-24 px-3 py-1.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 bg-white"
              />
              <span className="text-xs text-zinc-500 font-semibold">cap / mo</span>
            </div>
          </div>

          {/* Recent Generations with Model Info */}
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
              Recent Generations &amp; Model Engines Used
            </h4>
            <div className="space-y-2">
              {recentGenerations.length === 0 ? (
                <p className="text-xs text-zinc-400">No generations recorded yet for this client.</p>
              ) : (
                recentGenerations.slice(0, 5).map((gen) => (
                  <div key={gen.id} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold">{"★".repeat(gen.stars)}</span>
                        <span className="text-zinc-500 font-mono text-[11px] capitalize">{gen.length} length</span>
                        <span className="text-zinc-400 text-[10px]">
                          {new Date(gen.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                        {gen.model_label || "Claude 3.5 Haiku"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-700 leading-relaxed italic">
                      "{gen.output_text}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PRESET ASPECTS                                                 */}
      {/* ========================================================================= */}
      {presetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-headline font-bold text-base text-zinc-900">
                  Select Aspect Presets
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Pick from standard Google review triggers to add to {selectedBiz?.name}.
                </p>
              </div>
              <button
                onClick={() => setPresetModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
              {PRESET_ASPECTS.map((preset) => {
                const isSelected = selectedPresets.includes(preset);
                const isAlreadyAdded = aspectOptions.some(
                  (a) => a.label.toLowerCase().trim() === preset.toLowerCase().trim()
                );

                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={isAlreadyAdded}
                    onClick={() => {
                      setSelectedPresets((prev) =>
                        isSelected ? prev.filter((p) => p !== preset) : [...prev, preset]
                      );
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer border ${
                      isAlreadyAdded
                        ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                        : isSelected
                        ? "bg-amber-500 text-black border-amber-600 font-bold shadow-2xs"
                        : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{preset}</span>
                      {isAlreadyAdded && <span className="text-[9px] text-zinc-400">Added</span>}
                      {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setPresetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSelectedPresets}
                disabled={selectedPresets.length === 0}
                className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
              >
                Add {selectedPresets.length} Presets
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
