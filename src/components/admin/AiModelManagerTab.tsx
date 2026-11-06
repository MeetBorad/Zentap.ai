// src/components/admin/AiModelManagerTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Sparkles,
  Check,
  Save,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Zap,
  Clock,
  DollarSign,
  Mail,
  Sliders,
  ExternalLink,
  Play,
  RotateCcw,
  BarChart3
} from "lucide-react";

interface AiModelItem {
  id: string;
  label: string;
  provider: "anthropic" | "openai" | "google" | "openrouter" | "openai_compatible";
  model_id: string;
  base_url?: string | null;
  api_key_masked?: string;
  priority: number;
  enabled: boolean;
  status: "active" | "standby" | "exhausted" | "cooldown" | "disabled";
  cooldown_until?: string | null;
  monthly_budget_usd?: number | null;
  input_cost_per_1m?: number | null;
  output_cost_per_1m?: number | null;
  last_success_at?: string | null;
  last_error_at?: string | null;
  last_error_message?: string | null;
  created_at: string;
}

interface AiSettingsItem {
  id: string;
  failover_enabled: boolean;
  manual_primary_id?: string | null;
  exhausted_retry_hours: number;
  cooldown_seconds: number;
  alert_email?: string | null;
  last_failover_at?: string | null;
  last_failover_info?: string | null;
}

interface AiModelManagerTabProps {
  showToast: (msg: string) => void;
}

export default function AiModelManagerTab({ showToast }: AiModelManagerTabProps) {
  const [models, setModels] = useState<AiModelItem[]>([]);
  const [settings, setSettings] = useState<AiSettingsItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit / Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AiModelItem | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formProvider, setFormProvider] = useState<any>("google");
  const [formModelId, setFormModelId] = useState("gemini-3.5-flash-lite");
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formPriority, setFormPriority] = useState(1);
  const [formBudget, setFormBudget] = useState("");
  const [formInCost, setFormInCost] = useState("0.075");
  const [formOutCost, setFormOutCost] = useState("0.30");

  // Test state
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latency_ms?: number; text?: string; error?: string } | null>(null);

  const fetchModelsAndSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/models");
      const data = await res.json();
      if (data.success) {
        setModels(data.models || []);
        setSettings(data.settings || null);
      }
    } catch (e) {
      console.error("Failed to load AI models:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelsAndSettings();
  }, []);

  const handleOpenAdd = () => {
    setEditingModel(null);
    setFormLabel("");
    setFormProvider("google");
    setFormModelId("gemini-3.5-flash-lite");
    setFormBaseUrl("");
    setFormApiKey("");
    setFormPriority(models.length + 1);
    setFormBudget("");
    setFormInCost("0.075");
    setFormOutCost("0.30");
    setModalOpen(true);
  };

  const handleOpenEdit = (m: AiModelItem) => {
    setEditingModel(m);
    setFormLabel(m.label);
    setFormProvider(m.provider);
    setFormModelId(m.model_id);
    setFormBaseUrl(m.base_url || "");
    setFormApiKey(""); // leave blank unless updating
    setFormPriority(m.priority);
    setFormBudget(m.monthly_budget_usd ? String(m.monthly_budget_usd) : "");
    setFormInCost(m.input_cost_per_1m ? String(m.input_cost_per_1m) : "0.25");
    setFormOutCost(m.output_cost_per_1m ? String(m.output_cost_per_1m) : "1.25");
    setModalOpen(true);
  };

  const handleSaveModel = async () => {
    if (!formLabel.trim() || !formModelId.trim()) {
      showToast("Label and model ID are required");
      return;
    }

    try {
      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          id: editingModel?.id,
          label: formLabel.trim(),
          provider: formProvider,
          model_id: formModelId.trim(),
          base_url: formBaseUrl.trim() || null,
          api_key: formApiKey.trim() || undefined,
          priority: Number(formPriority) || 1,
          monthly_budget_usd: formBudget ? Number(formBudget) : null,
          input_cost_per_1m: Number(formInCost) || 0.25,
          output_cost_per_1m: Number(formOutCost) || 1.25,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingModel ? "✓ Model updated successfully!" : "✓ Model added to fleet!");
        setModalOpen(false);
        fetchModelsAndSettings();
      } else {
        showToast(data.error || "Failed to save model");
      }
    } catch {
      showToast("Error saving model");
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm("Are you sure you want to remove this model?")) return;
    try {
      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (res.ok) {
        showToast("Model removed");
        fetchModelsAndSettings();
      }
    } catch {
      showToast("Failed to delete model");
    }
  };

  const handleToggleEnable = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id, enabled: !current }),
      });
      showToast(!current ? "Model enabled" : "Model disabled");
      fetchModelsAndSettings();
    } catch { }
  };

  const handleMakePrimary = async (id: string) => {
    try {
      await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "make_primary", id }),
      });
      showToast("✓ Primary model set!");
      fetchModelsAndSettings();
    } catch { }
  };

  const handleResetStatus = async (id: string) => {
    try {
      await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_status", id }),
      });
      showToast("✓ Model status reset to Standby");
      fetchModelsAndSettings();
    } catch { }
  };

  const handleMovePriority = async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= models.length) return;

    const currentModel = models[idx];
    const targetModel = models[targetIdx];

    // Swap priority numbers
    await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        id: currentModel.id,
        label: currentModel.label,
        provider: currentModel.provider,
        model_id: currentModel.model_id,
        priority: targetModel.priority,
      }),
    });

    await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        id: targetModel.id,
        label: targetModel.label,
        provider: targetModel.provider,
        model_id: targetModel.model_id,
        priority: currentModel.priority,
      }),
    });

    fetchModelsAndSettings();
  };

  const handleTestModel = async (model: AiModelItem) => {
    setTestingModelId(model.id);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/models/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: model.id }),
      });
      const data = await res.json();
      setTestResult({
        id: model.id,
        success: data.success,
        latency_ms: data.latency_ms,
        text: data.text,
        error: data.error,
      });

      if (data.success) {
        showToast(`✓ Test ping passed (${data.latency_ms}ms)`);
      } else {
        showToast(`Test failed: ${data.error || "error"}`);
      }
    } catch {
      setTestResult({
        id: model.id,
        success: false,
        error: "Network timeout or server error during test.",
      });
      showToast("Test request failed");
    } finally {
      setTestingModelId(null);
    }
  };

  const handleUpdateSettings = async (patch: Partial<AiSettingsItem>) => {
    try {
      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_settings", ...patch }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast("✓ AI settings saved!");
      }
    } catch { }
  };

  // Primary model calculation
  const primaryModel =
    models.find((m) => m.id === settings?.manual_primary_id) ||
    models.find((m) => m.enabled && m.status !== "disabled") ||
    models[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* TOP STATUS BADGE */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-zinc-900 to-black text-white shadow-md border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Active Primary Engine
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              {primaryModel ? `${primaryModel.label} (${primaryModel.model_id})` : "Google Gemini 3.5 Flash Lite (gemini-3.5-flash-lite)"}
            </h3>
            {settings?.last_failover_at && (
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Last failover: {new Date(settings.last_failover_at).toLocaleTimeString()} ({settings.last_failover_info || "auto-switched"})
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchModelsAndSettings}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="tactile-btn px-3.5 py-2 rounded-xl bg-[#ff7a00] hover:bg-[#e56d00] text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Add Model</span>
          </button>
        </div>
      </div>

      {/* AUTO-FAILOVER GLOBAL SETTINGS */}
      <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-sm text-zinc-900">
              Resilience &amp; Auto-Failover Policy
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Automatically switches provider if credit runs out or rate limits hit.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-zinc-700">Auto-Failover</span>
            <input
              type="checkbox"
              checked={settings?.failover_enabled ?? true}
              onChange={(e) => handleUpdateSettings({ failover_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-bold text-zinc-700 block mb-1">
              Cooldown Duration (Seconds)
            </label>
            <input
              type="number"
              min={10}
              max={600}
              value={settings?.cooldown_seconds ?? 60}
              onChange={(e) => handleUpdateSettings({ cooldown_seconds: Number(e.target.value) })}
              className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-zinc-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-700 block mb-1">
              Exhausted Retry Window (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={48}
              value={settings?.exhausted_retry_hours ?? 6}
              onChange={(e) => handleUpdateSettings({ exhausted_retry_hours: Number(e.target.value) })}
              className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-zinc-200"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-700 block mb-1">
              Alert Email for Quota Exhaustion
            </label>
            <input
              type="email"
              value={settings?.alert_email || ""}
              onChange={(e) => handleUpdateSettings({ alert_email: e.target.value })}
              placeholder="admin@zentapdigitalsolutions.com"
              className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200"
            />
          </div>
        </div>
      </div>

      {/* MODELS FLEET TABLE */}
      <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
        <h3 className="font-headline font-bold text-sm text-zinc-900">
          Configured AI Models Priority Queue ({models.length})
        </h3>

        {models.length === 0 ? (
          <div className="p-8 text-center space-y-2 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-xs text-zinc-500">
              No custom models registered in database.
            </p>
            <p className="text-[11px] text-zinc-400">
              Review Assistant is safely using the default Google Gemini 3.5 Flash Lite from your environment key.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-2 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-bold"
            >
              Add First Provider Model
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="pb-3 px-3">Order</th>
                  <th className="pb-3 px-3">Label &amp; Model ID</th>
                  <th className="pb-3 px-3">Provider</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Key</th>
                  <th className="pb-3 px-3">Last Success / Error</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {models.map((m, idx) => {
                  const isPrimary = settings?.manual_primary_id === m.id;
                  const isCoolingDown = m.status === "cooldown" && m.cooldown_until && new Date(m.cooldown_until).getTime() > Date.now();
                  const isExhausted = m.status === "exhausted";

                  return (
                    <tr key={m.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Priority Up/Down */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-zinc-500 w-4">#{m.priority}</span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMovePriority(idx, "up")}
                              className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === models.length - 1}
                              onClick={() => handleMovePriority(idx, "down")}
                              className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Label & Model */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{m.label}</span>
                          {isPrimary && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                              Primary
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 block truncate max-w-[160px]">
                          {m.model_id}
                        </span>
                      </td>

                      {/* Provider */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-700">
                          {m.provider}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${!m.enabled
                            ? "bg-zinc-100 text-zinc-500"
                            : isCoolingDown
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : isExhausted
                                ? "bg-red-100 text-red-800"
                                : m.status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${!m.enabled ? "bg-zinc-400" : isCoolingDown ? "bg-amber-500" : isExhausted ? "bg-red-500" : "bg-emerald-500"
                            }`} />
                          <span>{!m.enabled ? "Disabled" : isCoolingDown ? "Cooldown" : isExhausted ? "Exhausted" : m.status}</span>
                        </span>
                      </td>

                      {/* Key Masked */}
                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">
                        {m.api_key_masked || "••••••••"}
                      </td>

                      {/* Last Success / Error */}
                      <td className="py-3 px-3 text-[11px]">
                        {m.last_success_at ? (
                          <span className="text-emerald-600 block">
                            ✓ {new Date(m.last_success_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-zinc-400 block">—</span>
                        )}
                        {m.last_error_message && (
                          <span className="text-red-500 text-[10px] block truncate max-w-[140px]" title={m.last_error_message}>
                            Err: {m.last_error_message}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Test Button */}
                          <button
                            type="button"
                            onClick={() => handleTestModel(m)}
                            disabled={testingModelId === m.id}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                            title="Ping test model"
                          >
                            <Play className={`w-3.5 h-3.5 ${testingModelId === m.id ? "animate-spin text-amber-500" : ""}`} />
                          </button>

                          {/* Reset Status if in cooldown or exhausted */}
                          {(isCoolingDown || isExhausted) && (
                            <button
                              type="button"
                              onClick={() => handleResetStatus(m.id)}
                              className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                              title="Reset status to standby"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Make Primary */}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleMakePrimary(m.id)}
                              className="px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
                              title="Set as first choice"
                            >
                              Set Primary
                            </button>
                          )}

                          {/* Enable / Disable */}
                          <button
                            type="button"
                            onClick={() => handleToggleEnable(m.id, m.enabled)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${m.enabled ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                              }`}
                          >
                            {m.enabled ? "Active" : "Off"}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteModel(m.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Live Test Diagnostics Banner */}
        {testResult && (
          <div className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${testResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-red-50 border-red-200 text-red-900"
            }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />}
            <div className="flex-1 space-y-1">
              <span className="font-bold">
                {testResult.success ? `Ping Success: Latency ${testResult.latency_ms}ms` : "Ping Diagnostic Error"}
              </span>
              <p className="text-[11px] opacity-80">
                {testResult.success ? `Response: "${testResult.text}"` : testResult.error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODEL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-headline font-bold text-base text-zinc-900">
              {editingModel ? "Edit AI Model" : "Add AI Provider Model"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Friendly Label</label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Google Gemini 3.5 Flash Lite (Primary)"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Provider</label>
                  <select
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200"
                  >
                    <option value="google">Google Gemini</option>
                    <option value="openai_compatible">OpenAI-Compatible (Groq/Cerebras/Mistral)</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="openrouter">OpenRouter</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Model ID</label>
                  <input
                    type="text"
                    value={formModelId}
                    onChange={(e) => setFormModelId(e.target.value)}
                    placeholder="gemini-3.5-flash-lite or llama-3.3-70b-versatile"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                  />
                </div>
              </div>

              {(formProvider === "openrouter" || formProvider === "openai_compatible") && (
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Base API URL</label>
                  <input
                    type="text"
                    value={formBaseUrl}
                    onChange={(e) => setFormBaseUrl(e.target.value)}
                    placeholder="https://openrouter.ai/api/v1"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  API Key {editingModel ? "(leave blank to keep current key)" : ""}
                </label>
                <input
                  type="password"
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Priority (1 = high)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formPriority}
                    onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Monthly Budget ($)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Output $/1M</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formOutCost}
                    onChange={(e) => setFormOutCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
              >
                {editingModel ? "Save Changes" : "Register Model"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
