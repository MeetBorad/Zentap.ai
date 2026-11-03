// src/components/admin/PlatformSettingsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Lock, 
  KeyRound, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Save, 
  AlertTriangle,
  RotateCcw,
  Clock,
  Database,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  Tag,
  ExternalLink,
  Layers,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AiModelManagerTab from "./AiModelManagerTab";
import {
  CustomFieldDefinition,
  DEFAULT_CUSTOM_FIELD_PRESETS,
  getCustomFieldDefinitions,
  saveCustomFieldDefinitions,
  addCustomFieldDefinition,
  toggleCustomFieldDefinition,
  removeCustomFieldDefinition,
} from "@/lib/adminPlatformStore";

interface PlatformSettingsTabProps {
  showToast: (msg: string) => void;
  onOpenPasswordModal: () => void;
}

export default function PlatformSettingsTab({ showToast, onOpenPasswordModal }: PlatformSettingsTabProps) {
  const { user } = useAuth();

  const [adminWhatsapp, setAdminWhatsapp] = useState("919274560880");
  const [siteDomain, setSiteDomain] = useState("https://zentapdigitalsolutions.com");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [subTab, setSubTab] = useState<"general" | "custom_fields" | "ai_models">("general");

  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "url" | "tel" | "email" | "number">("text");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldCategory, setNewFieldCategory] = useState<"general" | "contact" | "social" | "location" | "billing">("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wa = localStorage.getItem("zentap_admin_whatsapp");
      if (wa) setAdminWhatsapp(wa);
      const dom = localStorage.getItem("zentap_site_domain");
      if (dom) setSiteDomain(dom);
      setCustomFields(getCustomFieldDefinitions());
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("zentap_admin_whatsapp", adminWhatsapp.trim().replace(/\D/g, ""));
      localStorage.setItem("zentap_site_domain", siteDomain.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    showToast("✓ Platform settings saved successfully!");
  };

  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) {
      showToast("Please enter a field label");
      return;
    }

    const updated = addCustomFieldDefinition({
      label: newFieldLabel.trim(),
      type: newFieldType,
      placeholder: newFieldPlaceholder.trim() || undefined,
      category: newFieldCategory,
      is_active: true,
    });
    setCustomFields(updated);
    setNewFieldLabel("");
    setNewFieldPlaceholder("");
    showToast(`✓ Custom field "${newFieldLabel.trim()}" added to business forms!`);
  };

  const handleToggleCustomField = (id: string) => {
    const updated = toggleCustomFieldDefinition(id);
    setCustomFields(updated);
    const field = updated.find((f) => f.id === id);
    showToast(field?.is_active ? `✓ "${field.label}" enabled in business forms` : `✓ "${field?.label}" disabled in business forms`);
  };

  const handleDeleteCustomField = (id: string, label: string) => {
    if (window.confirm(`Are you sure you want to delete the custom field "${label}"?`)) {
      const updated = removeCustomFieldDefinition(id);
      setCustomFields(updated);
      showToast(`✓ Custom field "${label}" removed`);
    }
  };

  const handleQuickAddPreset = (preset: CustomFieldDefinition) => {
    const existing = customFields.find((f) => f.id === preset.id);
    if (existing) {
      handleToggleCustomField(preset.id);
    } else {
      const updated = addCustomFieldDefinition({
        ...preset,
        is_active: true,
      });
      setCustomFields(updated);
      showToast(`✓ Preset "${preset.label}" added and enabled!`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      
      {/* Page Title & Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-headline font-bold text-zinc-900">
            Super Admin Settings
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure platform endpoints, business custom fields &amp; options, and AI generation engine.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-200/80 rounded-2xl text-xs font-bold text-zinc-600 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab("general")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              subTab === "general"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900"
            }`}
          >
            General Platform
          </button>
          <button
            type="button"
            onClick={() => setSubTab("custom_fields")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === "custom_fields"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Custom Business Fields</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("ai_models")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === "ai_models"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Models &amp; Failover</span>
          </button>
        </div>
      </div>

      {subTab === "ai_models" ? (
        <AiModelManagerTab showToast={showToast} />
      ) : subTab === "custom_fields" ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Sliders className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-zinc-900">
                  Custom Business Fields &amp; Extended Options
                </h3>
                <p className="text-xs text-zinc-500">
                  Define additional options for businesses. Any active custom fields defined here automatically appear in the <strong>Add New Business</strong> and <strong>Edit Business</strong> forms.
                </p>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="pt-3 border-t border-zinc-100">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                Quick-Add Recommended Fields:
              </span>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CUSTOM_FIELD_PRESETS.map((preset) => {
                  const existing = customFields.find((f) => f.id === preset.id);
                  const isEnabled = existing?.is_active;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleQuickAddPreset(preset)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isEnabled
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-bold"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {isEnabled ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                      <span>{preset.label}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({preset.type})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form to Create Custom Field */}
          <form onSubmit={handleCreateCustomField} className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-zinc-900">Add New Custom Field / Option</h4>
              </div>
              <span className="text-[11px] text-zinc-400">Available across all business entries</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Field Label *
                </label>
                <input
                  type="text"
                  required
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="e.g. Website URL, GST Number, Zomato Link"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Input Type
                </label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                >
                  <option value="text">Standard Text</option>
                  <option value="url">Link / URL (https://...)</option>
                  <option value="tel">Phone / Contact Number</option>
                  <option value="email">Email Address</option>
                  <option value="number">Number</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Placeholder / Sample
                </label>
                <input
                  type="text"
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  placeholder="e.g. https://domain.com or 24AAAA..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500">
                Newly created fields are automatically enabled in the business creation and edit dialogs.
              </span>
              <button
                type="submit"
                className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Save Custom Field</span>
              </button>
            </div>
          </form>

          {/* Configured Custom Fields List */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-zinc-700" />
                <h4 className="text-sm font-bold text-zinc-900">
                  Configured Custom Fields ({customFields.length})
                </h4>
              </div>
              <span className="text-[11px] text-zinc-500">
                {customFields.filter((f) => f.is_active).length} active in forms
              </span>
            </div>

            {customFields.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                No custom fields configured yet. Click any quick preset above or add a new field to get started!
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {customFields.map((field) => (
                  <div key={field.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">{field.label}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {field.id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100 uppercase">
                          {field.type}
                        </span>
                      </div>
                      {field.placeholder && (
                        <p className="text-[11px] text-zinc-400 truncate">
                          Placeholder: <span className="font-mono text-zinc-500">{field.placeholder}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCustomField(field.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          field.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200"
                        }`}
                      >
                        {field.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>Active in Forms</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-zinc-400" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCustomField(field.id, field.label)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Delete custom field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Live Preview */}
          <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/90 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>How this appears in "Add New Business" &amp; "Edit Business":</span>
            </div>
            <p className="text-xs text-zinc-500">
              When an admin clicks <strong>Add New Business</strong> or <strong>Edit Business Entry</strong>, an expandable <strong>Custom Business Details</strong> section automatically displays all active fields configured above, allowing you to fill in or update their values per business.
            </p>
          </div>

        </div>
      ) : (
        <>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>✓ Settings saved and applied across routing!</span>
        </div>
      )}

      {/* Card 1: Core Routing & Communications */}
      <form onSubmit={handleSaveSettings} className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Hardware Links &amp; WhatsApp Master Routing
            </h3>
            <p className="text-xs text-zinc-500">
              Root configuration for all physical QR and NFC standee codes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Super Admin WhatsApp Dispatch Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400 font-bold">+</span>
              <input
                type="text"
                required
                value={adminWhatsapp}
                onChange={(e) => setAdminWhatsapp(e.target.value)}
                placeholder="919274560880"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Used for "Order on WhatsApp", owner PIN recovery, and direct notifications.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Permanent Tag Domain Base
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={siteDomain}
                onChange={(e) => setSiteDomain(e.target.value)}
                placeholder="https://zentapdigitalsolutions.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Base URL encoded into physical NFC chips and printed QR stickers ({siteDomain}/t/zt-XXXX).
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
          >
            <Save className="w-3.5 h-3.5 text-white" />
            <span>Save Platform Settings</span>
          </button>
        </div>
      </form>

      {/* Card 2: Security & Lockout Rules */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-zinc-900">
              Card Owner PIN Security &amp; Lockout Rules
            </h3>
            <p className="text-xs text-zinc-500">
              Tamper protection and anti-brute force mechanisms for physical hardware.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-700 font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Lockout Threshold</span>
            </div>
            <p className="font-mono text-base font-bold text-zinc-900">5 Attempts</p>
            <p className="text-[10px] text-zinc-400">Card locks for 30 minutes on 5 consecutive wrong PINs.</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-700 font-bold">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Session Expiry</span>
            </div>
            <p className="font-mono text-base font-bold text-zinc-900">15 Minutes</p>
            <p className="text-[10px] text-zinc-400">Owner panels expire automatically after 15 minutes of inactivity.</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>PIN Storage</span>
            </div>
            <p className="font-mono text-base font-bold text-zinc-900">SHA-256 Hashed</p>
            <p className="text-[10px] text-zinc-400">Zero plaintext PIN storage. Uniform error message on failure.</p>
          </div>
        </div>

        {/* Database & Purge Safeguard */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-zinc-600" />
              <span>Database Engine &amp; Safeguards</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
              Supabase PostgreSQL RLS Active
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            <strong>Purge Safeguard:</strong> The database function <code className="font-mono text-zinc-900">purge_business()</code> strictly refuses deletion if any physical standee or card is currently assigned. Standees must be released first.
          </p>
        </div>
      </div>

      {/* Card 3: Root Superadmin Master Password */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-zinc-900">
                Root Superadmin Credentials
              </h3>
              <p className="text-xs text-zinc-500">
                Logged in as: <span className="font-mono font-semibold text-zinc-800">{user?.email || "admin@zentapdigitalsolutions.com"}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPasswordModal}
            className="tactile-btn px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm"
          >
            Update Admin Password
          </button>
        </div>
      </div>
      </>
      )}

    </div>
  );
}
