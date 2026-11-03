// src/components/admin/PlatformSettingsTab.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ToggleRight,
  Edit3,
  Search,
  RefreshCw,
  Download,
  Building,
  CheckSquare,
  ArrowRight,
  Shield,
  FileCode,
  HardDrive,
  Cpu,
  Smartphone,
  Eye,
  X
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
  getAllClients,
  getAllQrNfcTags,
  getAllPayments,
  serverFetchPlatformData,
} from "@/lib/adminPlatformStore";

interface PlatformSettingsTabProps {
  showToast: (msg: string) => void;
  onOpenPasswordModal: () => void;
}

type SettingsSection = "general" | "custom_fields" | "security" | "ai_models" | "database";

export default function PlatformSettingsTab({ showToast, onOpenPasswordModal }: PlatformSettingsTabProps) {
  const { user } = useAuth();

  // Navigation & Search
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Section 1: General & Routing State
  const [adminWhatsapp, setAdminWhatsapp] = useState("919274560880");
  const [siteDomain, setSiteDomain] = useState("https://zentapdigitalsolutions.com");
  const [defaultCity, setDefaultCity] = useState("Ahmedabad");
  const [idPrefix, setIdPrefix] = useState("ZT-");
  const [defaultRouting, setDefaultRouting] = useState<"zentap_review" | "direct_google">("zentap_review");

  // Section 2: Custom Fields State
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "url" | "tel" | "email" | "number">("text");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldCategory, setNewFieldCategory] = useState<"general" | "contact" | "social" | "location" | "billing">("general");

  // Inline editing state for custom fields
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<"text" | "url" | "tel" | "email" | "number">("text");
  const [editPlaceholder, setEditPlaceholder] = useState("");

  // Section 3: Security & PIN Controls
  const [lockoutThreshold, setLockoutThreshold] = useState<number>(5);
  const [sessionDuration, setSessionDuration] = useState<number>(15);
  const [defaultTagPin, setDefaultTagPin] = useState("1234");

  // Telemetry counts for Database section
  const [stats, setStats] = useState({ clients: 0, tags: 0, payments: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // General
      const wa = localStorage.getItem("zentap_admin_whatsapp");
      if (wa) setAdminWhatsapp(wa);
      const dom = localStorage.getItem("zentap_site_domain");
      if (dom) setSiteDomain(dom);
      const city = localStorage.getItem("zentap_default_city");
      if (city) setDefaultCity(city);
      const prefix = localStorage.getItem("zentap_id_prefix");
      if (prefix) setIdPrefix(prefix);
      const route = localStorage.getItem("zentap_default_routing");
      if (route === "direct_google" || route === "zentap_review") setDefaultRouting(route);

      // Security
      const lock = localStorage.getItem("zentap_lockout_threshold");
      if (lock) setLockoutThreshold(parseInt(lock, 10));
      const sess = localStorage.getItem("zentap_session_duration");
      if (sess) setSessionDuration(parseInt(sess, 10));
      const pin = localStorage.getItem("zentap_default_pin");
      if (pin) setDefaultTagPin(pin);

      // Custom fields
      setCustomFields(getCustomFieldDefinitions());

      // Stats
      setStats({
        clients: getAllClients().length,
        tags: getAllQrNfcTags().length,
        payments: getAllPayments().length,
      });
    }
  }, []);

  // Save General & Routing Settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("zentap_admin_whatsapp", adminWhatsapp.trim().replace(/\D/g, ""));
      localStorage.setItem("zentap_site_domain", siteDomain.trim());
      localStorage.setItem("zentap_default_city", defaultCity.trim());
      localStorage.setItem("zentap_id_prefix", idPrefix.trim().toUpperCase());
      localStorage.setItem("zentap_default_routing", defaultRouting);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    showToast("✓ General platform settings saved and applied!");
  };

  // Save Security Settings
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("zentap_lockout_threshold", String(lockoutThreshold));
      localStorage.setItem("zentap_session_duration", String(sessionDuration));
      localStorage.setItem("zentap_default_pin", defaultTagPin.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    showToast("✓ Security policies and PIN rules updated!");
  };

  // Custom Fields Operations
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
    showToast(`✓ Custom field "${newFieldLabel.trim()}" created!`);
  };

  const handleStartEditField = (field: CustomFieldDefinition) => {
    setEditingFieldId(field.id);
    setEditLabel(field.label);
    setEditType(field.type);
    setEditPlaceholder(field.placeholder || "");
  };

  const handleSaveEditField = () => {
    if (!editingFieldId || !editLabel.trim()) return;
    const current = getCustomFieldDefinitions();
    const updated = current.map((f) =>
      f.id === editingFieldId
        ? {
            ...f,
            label: editLabel.trim(),
            type: editType,
            placeholder: editPlaceholder.trim() || undefined,
          }
        : f
    );
    saveCustomFieldDefinitions(updated);
    setCustomFields(updated);
    setEditingFieldId(null);
    showToast(`✓ Updated field "${editLabel.trim()}"`);
  };

  const handleToggleCustomField = (id: string) => {
    const updated = toggleCustomFieldDefinition(id);
    setCustomFields(updated);
    const field = updated.find((f) => f.id === id);
    showToast(field?.is_active ? `✓ "${field.label}" active in forms` : `✓ "${field?.label}" disabled in forms`);
  };

  const handleDeleteCustomField = (id: string, label: string) => {
    if (window.confirm(`Are you sure you want to remove the custom field "${label}"?`)) {
      const updated = removeCustomFieldDefinition(id);
      setCustomFields(updated);
      showToast(`✓ Custom field "${label}" deleted`);
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
      showToast(`✓ Preset "${preset.label}" added & activated!`);
    }
  };

  // Force platform data resync
  const handleResyncData = async () => {
    setIsRefreshing(true);
    const res = await serverFetchPlatformData();
    setIsRefreshing(false);
    if (res.success && res.data) {
      setStats({
        clients: res.data.clients?.length || 0,
        tags: res.data.tags?.length || 0,
        payments: res.data.payments?.length || 0,
      });
      showToast("✓ Live database state synchronized!");
    } else {
      showToast("Failed to sync database state");
    }
  };

  // Export Settings Backup
  const handleExportBackup = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      platform: {
        admin_whatsapp: adminWhatsapp,
        site_domain: siteDomain,
        default_city: defaultCity,
        id_prefix: idPrefix,
        default_routing: defaultRouting,
      },
      security: {
        lockout_threshold: lockoutThreshold,
        session_duration: sessionDuration,
        default_pin: defaultTagPin,
      },
      custom_fields: customFields,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zentap-platform-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("✓ Platform configuration exported!");
  };

  // Filtered fields if search is used
  const filteredCustomFields = useMemo(() => {
    if (!searchQuery.trim()) return customFields;
    const q = searchQuery.toLowerCase();
    return customFields.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
    );
  }, [customFields, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300 pb-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TELEMETRY BAR                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-zinc-900">
                Super Admin Platform Settings
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Centralized control center for routing, custom business options, security rules, and AI models.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action & Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase RLS Active</span>
          </div>

          <button
            type="button"
            onClick={handleResyncData}
            disabled={isRefreshing}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
            title="Refresh cache from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-zinc-900" : "text-zinc-600"}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Database"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold cursor-pointer transition-colors"
            title="Export settings JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>Export Config</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>✓ Settings saved and active across website and routing endpoints!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB CONTROLS & SEARCH BAR                                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1.5 bg-zinc-200/70 rounded-2xl overflow-x-auto text-xs font-bold text-zinc-600">
          <button
            type="button"
            onClick={() => setActiveSection("general")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "general"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900 hover:bg-white/40"
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>General &amp; Routing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("custom_fields")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "custom_fields"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900 hover:bg-white/40"
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Custom Business Fields</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono">
              {customFields.filter((f) => f.is_active).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("security")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "security"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900 hover:bg-white/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Security &amp; PIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("ai_models")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "ai_models"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900 hover:bg-white/40"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Models &amp; Failover</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("database")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === "database"
                ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                : "hover:text-zinc-900 hover:bg-white/40"
            }`}
          >
            <Database className="w-4 h-4 text-purple-600" />
            <span>System &amp; DB</span>
          </button>
        </div>

        {/* Quick Filter Search */}
        {activeSection === "custom_fields" && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search custom fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTION 1: GENERAL & ROUTING                                          */}
      {/* ========================================================================= */}
      {activeSection === "general" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <form onSubmit={handleSaveGeneral} className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Globe className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-zinc-900">
                    Platform Routing &amp; Contact Endpoints
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Master WhatsApp phone, hardware QR/NFC domain prefix, and business registration defaults.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
              >
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Save General Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* WhatsApp Dispatch */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  Super Admin WhatsApp Dispatch Number
                </label>
                <p className="text-[11px] text-zinc-500">
                  Target number for WhatsApp customer inquiries, PIN recovery, and direct business notifications.
                </p>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400 font-bold">+</span>
                  <input
                    type="text"
                    required
                    value={adminWhatsapp}
                    onChange={(e) => setAdminWhatsapp(e.target.value)}
                    placeholder="919274560880"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold"
                  />
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Current cleaned value: <strong className="font-mono text-zinc-700">+{adminWhatsapp.replace(/\D/g, "")}</strong></span>
                  <a
                    href={`https://wa.me/${adminWhatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5"
                  >
                    <span>Test Chat</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Tag Domain Base */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  Permanent Hardware Tag Domain Base
                </label>
                <p className="text-[11px] text-zinc-500">
                  Base URL permanently printed on QR stands and encoded into physical NTAG216 NFC chips.
                </p>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    value={siteDomain}
                    onChange={(e) => setSiteDomain(e.target.value)}
                    placeholder="https://zentapdigitalsolutions.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 font-mono truncate">
                  Preview: <span className="text-zinc-700 font-semibold">{siteDomain}/t/ST1</span>
                </p>
              </div>

              {/* Default Business City */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  Default City for New Businesses
                </label>
                <p className="text-[11px] text-zinc-500">
                  Pre-populated in the "Add New Business" dialog for faster onboarding.
                </p>
                <input
                  type="text"
                  value={defaultCity}
                  onChange={(e) => setDefaultCity(e.target.value)}
                  placeholder="e.g. Ahmedabad, Gujarat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold"
                />
              </div>

              {/* Default Business ID Prefix */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <label className="block text-xs font-bold text-zinc-800">
                  Business ID Sequential Prefix
                </label>
                <p className="text-[11px] text-zinc-500">
                  Prefix applied when generating auto-assigned business codes (e.g. {idPrefix}0005).
                </p>
                <input
                  type="text"
                  value={idPrefix}
                  onChange={(e) => setIdPrefix(e.target.value.toUpperCase())}
                  placeholder="ZT-"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold"
                />
              </div>
            </div>

            {/* Standee Default Route */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <label className="block text-xs font-bold text-zinc-800">
                Default Routing for Newly Assigned Standees
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  onClick={() => setDefaultRouting("zentap_review")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    defaultRouting === "zentap_review"
                      ? "bg-white border-zinc-900 shadow-xs"
                      : "bg-zinc-100/60 border-zinc-200 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="default_routing"
                    checked={defaultRouting === "zentap_review"}
                    onChange={() => setDefaultRouting("zentap_review")}
                    className="mt-0.5 text-zinc-900"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 block">ZenTap Smart Review Assistant (Recommended)</span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">
                      Renders guided review drafting, 5-star helper, and private resolution desk for unhappy customers.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setDefaultRouting("direct_google")}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    defaultRouting === "direct_google"
                      ? "bg-white border-zinc-900 shadow-xs"
                      : "bg-zinc-100/60 border-zinc-200 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="default_routing"
                    checked={defaultRouting === "direct_google"}
                    onChange={() => setDefaultRouting("direct_google")}
                    className="mt-0.5 text-zinc-900"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 block">Direct Google Review Redirection</span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">
                      Immediately 302 redirects customer taps directly to the Google Maps review submission prompt.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="tactile-btn flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
              >
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Save All General Platform Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION 2: CUSTOM BUSINESS FIELDS (EXTENDED OPTIONS)                   */}
      {/* ========================================================================= */}
      {activeSection === "custom_fields" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                  <Sliders className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-zinc-900">
                    Business Custom Fields &amp; Extended Options Manager
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Define, edit, and activate custom attributes that appear when adding or editing businesses.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-semibold">
                  {customFields.filter((f) => f.is_active).length} of {customFields.length} active in forms
                </span>
              </div>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="pt-3 border-t border-zinc-100">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                1-Click Preset Activations:
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
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300"
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

          {/* Form to Add New Custom Field */}
          <form onSubmit={handleCreateCustomField} className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-zinc-900">Create New Custom Field</h4>
              </div>
              <span className="text-[11px] text-zinc-400">Instantly available in business creation &amp; edit dialogs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Field Display Label *
                </label>
                <input
                  type="text"
                  required
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="e.g. Zomato Menu Link, Secondary Contact"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Field Input Type
                </label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white font-medium"
                >
                  <option value="text">Standard Text</option>
                  <option value="url">Link / URL (https://...)</option>
                  <option value="tel">Phone / Contact</option>
                  <option value="email">Email Address</option>
                  <option value="number">Numeric Value</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Sample Placeholder
                </label>
                <input
                  type="text"
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  placeholder="e.g. https://zomato.com/... or 24AAAA..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500">
                Created fields persist across sessions and synchronize with all team members.
              </span>
              <button
                type="submit"
                className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Save New Custom Field</span>
              </button>
            </div>
          </form>

          {/* Configured Fields List with Inline Editing */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-zinc-700" />
                <h4 className="text-sm font-bold text-zinc-900">
                  Configured Fields ({filteredCustomFields.length})
                </h4>
              </div>
              <span className="text-[11px] text-zinc-500">
                Click <strong>Edit</strong> on any field to modify its label, type, or placeholder.
              </span>
            </div>

            {filteredCustomFields.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                No custom fields found matching your criteria.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredCustomFields.map((field) => {
                  const isEditing = editingFieldId === field.id;

                  if (isEditing) {
                    return (
                      <div key={field.id} className="py-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                          <span>Editing Field: {field.id}</span>
                          <button
                            type="button"
                            onClick={() => setEditingFieldId(null)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">Field Label</label>
                            <input
                              type="text"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-900 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">Field Type</label>
                            <select
                              value={editType}
                              onChange={(e) => setEditType(e.target.value as any)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-900 font-semibold"
                            >
                              <option value="text">Standard Text</option>
                              <option value="url">Link / URL</option>
                              <option value="tel">Phone</option>
                              <option value="email">Email</option>
                              <option value="number">Number</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">Placeholder</label>
                            <input
                              type="text"
                              value={editPlaceholder}
                              onChange={(e) => setEditPlaceholder(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-900"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingFieldId(null)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEditField}
                            className="tactile-btn px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
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
                            Placeholder: <span className="font-mono text-zinc-600">{field.placeholder}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditField(field)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                          title="Edit field label and type"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCustomField(field.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            field.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200"
                          }`}
                        >
                          {field.is_active ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                              <span>Active</span>
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
                          title="Delete field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Form Simulation Preview */}
          <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/90 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>How your custom fields look inside the Add &amp; Edit Business Modals:</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customFields.filter((f) => f.is_active).slice(0, 4).map((f) => (
                  <div key={f.id}>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1 flex items-center justify-between">
                      <span>{f.label}</span>
                      <span className="text-[9px] font-mono text-zinc-400">({f.type})</span>
                    </label>
                    <input
                      disabled
                      type="text"
                      placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-400 text-center pt-1">
                {customFields.filter((f) => f.is_active).length > 4 ? `+ ${customFields.filter((f) => f.is_active).length - 4} more active custom fields rendered in full modal.` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SECTION 3: SECURITY & PIN CONTROLS                                    */}
      {/* ========================================================================= */}
      {activeSection === "security" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <form onSubmit={handleSaveSecurity} className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-zinc-900">
                    Hardware &amp; Card PIN Security Controls
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Anti-brute force lockouts, session expiry rules, and root administrator credentials.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="tactile-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
              >
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Save Security Rules</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Lockout Threshold */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Lockout Threshold</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Card locks for 30 minutes after consecutive wrong PIN inputs.
                </p>
                <select
                  value={lockoutThreshold}
                  onChange={(e) => setLockoutThreshold(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value={3}>3 Attempts (Strict)</option>
                  <option value={5}>5 Attempts (Standard)</option>
                  <option value={10}>10 Attempts (Relaxed)</option>
                </select>
              </div>

              {/* Session Expiry */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Session Expiry</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Card owner management panels automatically close after idle timeout.
                </p>
                <select
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes (Default)</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              {/* Default Initial PIN */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Default Initial PIN</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Factory default PIN assigned to new standees and digital cards before owner customization.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={defaultTagPin}
                  onChange={(e) => setDefaultTagPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 font-mono text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Cryptographic Standard Notice */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-zinc-800">
                  All owner PINs are hashed with SHA-256 before database storage. Plaintext is never stored.
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">Zero-Plaintext Policy</span>
            </div>

            {/* Root Superadmin Master Password Card */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-900">Root Superadmin Master Credentials</h4>
                  <p className="text-[11px] text-zinc-500">
                    Logged in as: <strong className="font-mono text-zinc-700">{user?.email || "admin@zentapdigitalsolutions.com"}</strong>
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
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SECTION 4: AI MODELS & FAILOVER                                       */}
      {/* ========================================================================= */}
      {activeSection === "ai_models" && (
        <AiModelManagerTab showToast={showToast} />
      )}

      {/* ========================================================================= */}
      {/* 7. SECTION 5: SYSTEM & DATABASE                                          */}
      {/* ========================================================================= */}
      {activeSection === "database" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-zinc-900">
                    Supabase PostgreSQL Engine &amp; Cache Status
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Real-time connection telemetry, purge safeguards, and platform data synchronizers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResyncData}
                disabled={isRefreshing}
                className="tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-transform active:scale-[0.978] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-white" : ""}`} />
                <span>{isRefreshing ? "Syncing..." : "Sync All Data"}</span>
              </button>
            </div>

            {/* Live Count Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Registered Clients</span>
                  <Building className="w-4 h-4 text-zinc-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-zinc-900">{stats.clients}</p>
                <p className="text-[10px] text-zinc-400">Public table: <code className="font-mono text-zinc-600">clients</code></p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Hardware Standees &amp; Cards</span>
                  <Smartphone className="w-4 h-4 text-zinc-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-zinc-900">{stats.tags}</p>
                <p className="text-[10px] text-zinc-400">Public table: <code className="font-mono text-zinc-600">qr_nfc_tags</code></p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Recorded Ledger Payments</span>
                  <CheckSquare className="w-4 h-4 text-zinc-400" />
                </div>
                <p className="text-2xl font-bold font-mono text-zinc-900">{stats.payments}</p>
                <p className="text-[10px] text-zinc-400">Public table: <code className="font-mono text-zinc-600">payments</code></p>
              </div>
            </div>

            {/* Purge Safeguards Card */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Hardware Purge &amp; Cascade Safeguard Policy</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  Enforced
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                The database safeguard <code className="font-mono text-zinc-800">purge_business()</code> strictly prevents permanent deletion of any business if active physical counter standees or NFC cards remain assigned to it. Physical hardware must first be released or unassigned before an audit record can be destroyed.
              </p>
            </div>

            {/* Diagnostics & Cache Reset Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-500">
                Facing sync or stale cache issues? Re-fetch or export configuration.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Clear local cache and re-fetch fresh state from Supabase?")) {
                      localStorage.removeItem("zentap_platform_cache");
                      handleResyncData();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-xs font-bold cursor-pointer"
                >
                  Clear Local Cache
                </button>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="tactile-btn flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download Backup JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
