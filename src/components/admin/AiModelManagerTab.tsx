// src/components/admin/AiModelManagerTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";

interface AiModelItem {
  id: string;
  label: string;
  provider: "anthropic" | "openai" | "google" | "openrouter" | "openai_compatible";
  model_id: string;
  base_url?: string | null;
  api_key_masked?: string;
  has_key?: boolean;
  priority: number;
  enabled: boolean;
  status: "active" | "standby" | "exhausted" | "cooldown" | "disabled";
  real_status?: "active" | "standby" | "exhausted" | "cooldown" | "no_key" | "disabled";
  cooldown_until?: string | null;
  cooldown_seconds_remaining?: number;
  exhausted_hours_remaining?: number;
  is_inconsistent?: boolean;
  inconsistency_reason?: string;
  monthly_budget_usd?: number | null;
  input_cost_per_1m?: number | null;
  output_cost_per_1m?: number | null;
  last_success_at?: string | null;
  last_error_at?: string | null;
  last_error_message?: string | null;
  last_log?: {
    success: boolean;
    error_type?: string | null;
    latency_ms: number;
    created_at: string;
  } | null;
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
  const [formModelId, setFormModelId] = useState("gemini-2.5-flash");
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formPriority, setFormPriority] = useState(1);
  const [formBudget, setFormBudget] = useState("");
  const [formInCost, setFormInCost] = useState("0.075");
  const [formOutCost, setFormOutCost] = useState("0.30");

  // Test states
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testResult, setTestResult] = useState<{
    id: string;
    success: boolean;
    latency_ms?: number;
    text?: string;
    error?: string;
    batchResults?: Array<{ id: string; label: string; success: boolean; latency_ms: number; error?: string }>;
  } | null>(null);

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

  // Live countdown timer ticker for cooldowns
  useEffect(() => {
    const timer = setInterval(() => {
      setModels((prev) =>
        prev.map((m) => {
          if (m.cooldown_seconds_remaining && m.cooldown_seconds_remaining > 0) {
            return {
              ...m,
              cooldown_seconds_remaining: m.cooldown_seconds_remaining - 1,
            };
          }
          return m;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenAdd = () => {
    setEditingModel(null);
    setFormLabel("");
    setFormProvider("google");
    setFormModelId("gemini-2.5-flash");
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
    setFormApiKey("");
    setFormPriority(m.priority);
    setFormBudget(m.monthly_budget_usd ? String(m.monthly_budget_usd) : "");
    setFormInCost(m.input_cost_per_1m ? String(m.input_cost_per_1m) : "0.075");
    setFormOutCost(m.output_cost_per_1m ? String(m.output_cost_per_1m) : "0.30");
    setModalOpen(true);
  };

  const handleSaveModel = async () => {
    if (!formLabel.trim() || !formModelId.trim()) {
      showToast("Label and Model ID are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          id: editingModel ? editingModel.id : undefined,
          label: formLabel.trim(),
          provider: formProvider,
          model_id: formModelId.trim(),
          base_url: formBaseUrl.trim() || null,
          api_key: formApiKey.trim() || undefined,
          priority: formPriority,
          monthly_budget_usd: formBudget ? Number(formBudget) : null,
          input_cost_per_1m: Number(formInCost),
          output_cost_per_1m: Number(formOutCost),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingModel ? "✓ Model updated successfully!" : "✓ New AI model added!");
        setModalOpen(false);
        fetchModelsAndSettings();
      } else {
        showToast(`Error: ${data.error || "Save failed"}`);
      }
    } catch {
      showToast("Network error saving model.");
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this AI model?")) return;
    try {
      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Model removed");
        fetchModelsAndSettings();
      }
    } catch {
      showToast("Failed to delete model");
    }
  };

  const handleToggleEnable = async (id: string, currentEnabled: boolean) => {
    try {
      await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          id,
          label: models.find((m) => m.id === id)?.label,
          provider: models.find((m) => m.id === id)?.provider,
          model_id: models.find((m) => m.id === id)?.model_id,
          enabled: !currentEnabled,
        }),
      });
      showToast(`✓ Model ${!currentEnabled ? "enabled" : "disabled"}`);
      fetchModelsAndSettings();
    } catch {}
  };

  const handleMakePrimary = async (id: string) => {
    const target = models.find((m) => m.id === id);
    if (target && !target.has_key) {
      showToast("Cannot set model as Primary because it has no configured API key.");
      return;
    }

    try {
      await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_primary", id }),
      });
      showToast("✓ Primary model updated!");
      fetchModelsAndSettings();
    } catch {}
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
    } catch {}
  };

  const handleMovePriority = async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= models.length) return;

    const currentModel = models[idx];
    const targetModel = models[targetIdx];

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
        showToast(`✓ ${model.label} ping success (${data.latency_ms}ms)`);
      } else {
        showToast(`✗ ${model.label} test error: ${data.error || "Failed"}`);
      }
      fetchModelsAndSettings();
    } catch (e: any) {
      setTestResult({
        id: model.id,
        success: false,
        error: e.message || "Network test failed",
      });
    } finally {
      setTestingModelId(null);
    }
  };

  const handleTestAllModels = async () => {
    setIsTestingAll(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/models/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: "all" }),
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.results)) {
        const passedCount = data.results.filter((r: any) => r.success).length;
        setTestResult({
          id: "all",
          success: passedCount > 0,
          batchResults: data.results,
        });
        showToast(`✓ Batch test complete: ${passedCount}/${data.results.length} models healthy`);
      } else {
        showToast(`Batch test error: ${data.error || "Failed"}`);
      }
      fetchModelsAndSettings();
    } catch {
      showToast("Network error executing batch test");
    } finally {
      setIsTestingAll(false);
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
    } catch {}
  };

  // Primary model calculation: Must have key and be enabled to be active primary
  const primaryModel =
    models.find((m) => m.id === settings?.manual_primary_id && m.has_key && m.enabled) ||
    models.find((m) => m.enabled && m.has_key && m.status !== "disabled") ||
    null;

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
              <span className={`w-2.5 h-2.5 rounded-full ${primaryModel ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className={`text-xs font-mono uppercase tracking-wider font-bold ${primaryModel ? "text-emerald-400" : "text-amber-400"}`}>
                {primaryModel ? "Active Primary Engine" : "No Active Engine (Action Needed)"}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              {primaryModel ? `${primaryModel.label} (${primaryModel.model_id})` : "Configure an API key on an enabled model to activate"}
            </h3>
            {settings?.last_failover_at && (
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Last failover: {new Date(settings.last_failover_at).toLocaleTimeString()} ({settings.last_failover_info || "auto-switched"})
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {primaryModel && (
            <button
              type="button"
              onClick={() => handleTestModel(primaryModel)}
              disabled={testingModelId === primaryModel.id || isTestingAll}
              className="tactile-btn px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-white/10"
              title="Test generating a live review with the active engine"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${testingModelId === primaryModel.id ? "animate-spin" : ""}`} />
              <span>{testingModelId === primaryModel.id ? "Testing Engine..." : "Test Active Engine"}</span>
            </button>
          )}

          {/* Test All Action Button */}
          <button
            type="button"
            onClick={handleTestAllModels}
            disabled={isTestingAll || loading}
            className="tactile-btn px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-indigo-500/30"
            title="Ping all registered models sequentially"
          >
            <Zap className={`w-3.5 h-3.5 text-indigo-400 ${isTestingAll ? "animate-spin" : ""}`} />
            <span>{isTestingAll ? "Testing All..." : "Test All"}</span>
          </button>

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

      {/* Live Test Diagnostic Output Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
            testResult.success
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-100"
              : "bg-red-950/40 border-red-500/30 text-red-100"
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold">
                {testResult.batchResults
                  ? "Batch Diagnostics Report"
                  : testResult.success
                  ? `AI Model Diagnostic OK (${testResult.latency_ms}ms latency)`
                  : "Engine Test Call Failed"}
              </span>
              <button
                type="button"
                onClick={() => setTestResult(null)}
                className="text-[11px] opacity-60 hover:opacity-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>

            {testResult.batchResults ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {testResult.batchResults.map((b) => (
                  <div
                    key={b.id}
                    className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${
                      b.success
                        ? "bg-emerald-900/30 border-emerald-500/20 text-emerald-200"
                        : "bg-red-900/30 border-red-500/20 text-red-200"
                    }`}
                  >
                    <span className="font-semibold">{b.label}</span>
                    <span className="font-mono text-[10px]">
                      {b.success ? `✓ ${b.latency_ms}ms` : `✗ ${b.error || "Failed"}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11.5px] opacity-90 leading-relaxed font-mono">
                {testResult.success
                  ? `Output: "${testResult.text || "OK"}"`
                  : testResult.error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* AUTO-FAILOVER GLOBAL SETTINGS */}
      <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-sm text-zinc-900">
              Resilience &amp; Auto-Failover Policy
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Automatically switches provider if quota runs out, rate limits hit, or invalid response is returned.
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
            <p className="text-xs text-zinc-500">No custom models registered.</p>
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
                  const isPrimary = primaryModel?.id === m.id;
                  const hasKey = Boolean(m.has_key);
                  const isCooldown = m.real_status === "cooldown";
                  const isExhausted = m.real_status === "exhausted";
                  const isDisabled = !m.enabled;
                  const isNoKey = !hasKey;

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

                      {/* Label & Model with Inconsistency Warning */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{m.label}</span>
                          {isPrimary && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              Active Primary
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 block truncate max-w-[200px]">
                          {m.model_id}
                        </span>

                        {/* Inconsistency Warning (Part B) */}
                        {m.is_inconsistent && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate max-w-[220px]" title={m.inconsistency_reason}>
                                Inconsistent: {m.inconsistency_reason}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(m)}
                              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              Edit Both
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Provider */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-700">
                          {m.provider}
                        </span>
                      </td>

                      {/* Status per Row from real state (Part B) */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1.5 ${
                            isDisabled
                              ? "bg-zinc-100 text-zinc-500 border border-zinc-200"
                              : isNoKey
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : isCooldown
                              ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                              : isExhausted
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : isPrimary
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDisabled
                                ? "bg-zinc-400"
                                : isNoKey
                                ? "bg-amber-500"
                                : isCooldown
                                ? "bg-amber-600 animate-ping"
                                : isExhausted
                                ? "bg-rose-600"
                                : isPrimary
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-blue-500"
                            }`}
                          />
                          <span>
                            {isDisabled
                              ? "Disabled"
                              : isNoKey
                              ? "No key"
                              : isCooldown
                              ? `Cooldown (${m.cooldown_seconds_remaining || 60}s)`
                              : isExhausted
                              ? `Exhausted (${m.exhausted_hours_remaining || 6}h)`
                              : isPrimary
                              ? "Active (Primary)"
                              : "Standby"}
                          </span>
                        </span>
                      </td>

                      {/* Key Masked */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className={hasKey ? "text-zinc-600" : "text-amber-600 font-semibold"}>
                          {m.api_key_masked || "No key"}
                        </span>
                      </td>

                      {/* Last Success / Error (Part B) */}
                      <td className="py-3 px-3 text-[11px]">
                        {m.last_log ? (
                          m.last_log.success ? (
                            <div className="text-emerald-700 font-medium">
                              <span>✓ OK • {m.last_log.latency_ms}ms</span>
                              <span className="text-[10px] text-zinc-400 block">
                                {new Date(m.last_log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          ) : (
                            <div className="text-rose-600 font-medium">
                              <span>✗ {m.last_log.error_type || "Error"}</span>
                              <span className="text-[10px] text-zinc-400 block">
                                {new Date(m.last_log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )
                        ) : m.last_success_at ? (
                          <span className="text-emerald-600 block">
                            ✓ {new Date(m.last_success_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : (
                          <span className="text-zinc-400 block">—</span>
                        )}
                        {m.last_error_message && !m.last_log && (
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
                            disabled={testingModelId === m.id || isTestingAll || !hasKey}
                            className={`p-1.5 rounded-lg border text-zinc-700 transition-colors ${
                              hasKey
                                ? "border-zinc-200 hover:bg-zinc-100 cursor-pointer"
                                : "opacity-40 cursor-not-allowed border-zinc-100 text-zinc-400"
                            }`}
                            title={hasKey ? "Ping test model" : "Cannot test: No API key"}
                          >
                            <Play className={`w-3.5 h-3.5 ${testingModelId === m.id ? "animate-spin text-amber-500" : ""}`} />
                          </button>

                          {/* Reset Status if in cooldown or exhausted */}
                          {(isCooldown || isExhausted) && (
                            <button
                              type="button"
                              onClick={() => handleResetStatus(m.id)}
                              className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                              title="Reset status to standby"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Make Primary: only allowed if has key */}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleMakePrimary(m.id)}
                              disabled={!hasKey}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                hasKey
                                  ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
                                  : "opacity-40 cursor-not-allowed bg-zinc-50 text-zinc-400"
                              }`}
                              title={hasKey ? "Set as first choice" : "Cannot make primary without API key"}
                            >
                              Set Primary
                            </button>
                          )}

                          {/* Enable / Disable */}
                          <button
                            type="button"
                            onClick={() => handleToggleEnable(m.id, m.enabled)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                              m.enabled ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {m.enabled ? "Active" : "Off"}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                            title="Edit model & label"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteModel(m.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                            title="Delete model"
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
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
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
                  placeholder="e.g. Groq Llama 3.3 70B or Google Gemini 2.5 Flash"
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
                    placeholder="gemini-2.5-flash or llama-3.3-70b-versatile"
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
                    placeholder="https://api.groq.com/openai/v1 or https://openrouter.ai/api/v1"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  API Key {editingModel ? "(leave blank to keep current key or env key)" : ""}
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
                className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white cursor-pointer"
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
