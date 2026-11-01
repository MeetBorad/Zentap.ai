// src/lib/ai/modelManager.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptApiKey, decryptApiKey } from "./crypto";
import { createAdapter, AdapterError } from "./adapters";

export type ModelProvider = "anthropic" | "openai" | "google" | "openrouter" | "openai_compatible";
export type ModelStatus = "active" | "standby" | "exhausted" | "cooldown" | "disabled";

export interface AiModelRecord {
  id: string;
  label: string;
  provider: ModelProvider;
  model_id: string;
  base_url?: string | null;
  api_key_encrypted?: string | null;
  priority: number;
  enabled: boolean;
  status: ModelStatus;
  cooldown_until?: string | null;
  monthly_budget_usd?: number | null;
  input_cost_per_1m?: number | null;
  output_cost_per_1m?: number | null;
  last_success_at?: string | null;
  last_error_at?: string | null;
  last_error_message?: string | null;
  created_at: string;
}

export interface AiSettingsRecord {
  id: string;
  failover_enabled: boolean;
  manual_primary_id?: string | null;
  exhausted_retry_hours: number;
  cooldown_seconds: number;
  alert_email?: string | null;
  last_failover_at?: string | null;
  last_failover_info?: string | null;
  updated_at?: string;
}

export interface AiModelUsageRecord {
  id: string;
  model_id: string;
  business_id: string;
  generation_id?: string | null;
  input_tokens: number;
  output_tokens: number;
  est_cost_usd: number;
  success: boolean;
  error_type?: string | null;
  latency_ms: number;
  created_at: string;
}

const LOCAL_MODELS_KEY = "zentap_ai_models_store";
const LOCAL_SETTINGS_KEY = "zentap_ai_settings_store";
const LOCAL_USAGE_KEY = "zentap_ai_usage_store";

// -------------------------------------------------------------
// Settings Management
// -------------------------------------------------------------
export async function getAiSettings(): Promise<AiSettingsRecord> {
  const defaultSettings: AiSettingsRecord = {
    id: "global",
    failover_enabled: true,
    manual_primary_id: null,
    exhausted_retry_hours: 6,
    cooldown_seconds: 60,
    alert_email: null,
    last_failover_at: null,
    last_failover_info: null,
  };

  const db = createAdminClient();
  if (db) {
    try {
      const { data } = await db
        .from("ai_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (data) return data;
    } catch (e) {
      console.warn("Supabase ai_settings lookup error:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }

  return defaultSettings;
}

export async function saveAiSettings(patch: Partial<AiSettingsRecord>): Promise<AiSettingsRecord> {
  const current = await getAiSettings();
  const updated: AiSettingsRecord = {
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  const db = createAdminClient();
  if (db) {
    try {
      await db.from("ai_settings").upsert(updated);
    } catch (e) {
      console.warn("Supabase ai_settings save error:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));
    } catch {}
  }

  return updated;
}

// -------------------------------------------------------------
// Models Management
// -------------------------------------------------------------
export async function getAllAiModels(): Promise<AiModelRecord[]> {
  const db = createAdminClient();
  if (db) {
    try {
      const { data } = await db
        .from("ai_models")
        .select("*")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Supabase ai_models lookup error:", e);
    }
  }

  // Local storage fallback
  let list: AiModelRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_MODELS_KEY);
      if (raw) list = JSON.parse(raw);
    } catch {}
  }

  // Pre-seed from env ANTHROPIC_API_KEY if present and no models exist
  if (list.length === 0 && process.env.ANTHROPIC_API_KEY) {
    const seedModel: AiModelRecord = {
      id: "model_default_haiku",
      label: "Claude 3.5 Haiku (Default)",
      provider: "anthropic",
      model_id: "claude-haiku-5-5",
      api_key_encrypted: encryptApiKey(process.env.ANTHROPIC_API_KEY),
      priority: 1,
      enabled: true,
      status: "active",
      input_cost_per_1m: 0.25,
      output_cost_per_1m: 1.25,
      created_at: new Date().toISOString(),
    };
    list = [seedModel];

    if (db) {
      Promise.resolve(db.from("ai_models").upsert(seedModel)).catch(() => {});
    }
  }

  return list.sort((a, b) => a.priority - b.priority);
}

export async function upsertAiModel(record: Partial<AiModelRecord> & { label: string; provider: ModelProvider; model_id: string }): Promise<AiModelRecord> {
  const id = record.id || `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const existing = (await getAllAiModels()).find((m) => m.id === id);

  const model: AiModelRecord = {
    id,
    label: record.label.trim(),
    provider: record.provider,
    model_id: record.model_id.trim(),
    base_url: record.base_url?.trim() || null,
    api_key_encrypted: record.api_key_encrypted ?? existing?.api_key_encrypted ?? null,
    priority: record.priority ?? existing?.priority ?? 1,
    enabled: record.enabled ?? existing?.enabled ?? true,
    status: record.status ?? existing?.status ?? "standby",
    cooldown_until: record.cooldown_until ?? existing?.cooldown_until ?? null,
    monthly_budget_usd: record.monthly_budget_usd ?? existing?.monthly_budget_usd ?? null,
    input_cost_per_1m: record.input_cost_per_1m ?? existing?.input_cost_per_1m ?? 0.25,
    output_cost_per_1m: record.output_cost_per_1m ?? existing?.output_cost_per_1m ?? 1.25,
    last_success_at: record.last_success_at ?? existing?.last_success_at ?? null,
    last_error_at: record.last_error_at ?? existing?.last_error_at ?? null,
    last_error_message: record.last_error_message ?? existing?.last_error_message ?? null,
    created_at: existing?.created_at || new Date().toISOString(),
  };

  const db = createAdminClient();
  if (db) {
    try {
      await db.from("ai_models").upsert(model);
    } catch (e) {
      console.warn("Supabase upsert ai_models error:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const all = (await getAllAiModels()).filter((m) => m.id !== id);
      all.push(model);
      localStorage.setItem(LOCAL_MODELS_KEY, JSON.stringify(all));
    } catch {}
  }

  return model;
}

export async function deleteAiModel(id: string): Promise<boolean> {
  const db = createAdminClient();
  if (db) {
    try {
      await db.from("ai_models").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete ai_models error:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const all = (await getAllAiModels()).filter((m) => m.id !== id);
      localStorage.setItem(LOCAL_MODELS_KEY, JSON.stringify(all));
    } catch {}
  }

  return true;
}

export async function resetModelStatus(id: string): Promise<AiModelRecord | null> {
  return upsertAiModel({
    id,
    label: "", // ignored if existing
    provider: "anthropic",
    model_id: "",
    status: "standby",
    cooldown_until: null,
    last_error_message: null,
  });
}

// -------------------------------------------------------------
// Usage Telemetry Logging
// -------------------------------------------------------------
export async function logModelUsage(entry: Omit<AiModelUsageRecord, "id" | "created_at">): Promise<AiModelUsageRecord> {
  const record: AiModelUsageRecord = {
    ...entry,
    id: `usg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  };

  const db = createAdminClient();
  if (db) {
    Promise.resolve(db.from("ai_model_usage").insert(record)).catch(() => {});
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_USAGE_KEY);
      const list: AiModelUsageRecord[] = raw ? JSON.parse(raw) : [];
      list.push(record);
      localStorage.setItem(LOCAL_USAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  return record;
}

export async function getModelUsageStats(modelId?: string, businessId?: string): Promise<{
  totalGenerations: number;
  totalCostUsd: number;
  successRate: number;
  avgLatencyMs: number;
}> {
  let list: AiModelUsageRecord[] = [];
  const db = createAdminClient();
  if (db) {
    try {
      let query = db.from("ai_model_usage").select("*");
      if (modelId) query = query.eq("model_id", modelId);
      if (businessId) query = query.eq("business_id", businessId);
      const { data } = await query;
      if (data) list = data;
    } catch {}
  }

  if (list.length === 0 && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_USAGE_KEY);
      if (raw) {
        list = JSON.parse(raw);
        if (modelId) list = list.filter((u) => u.model_id === modelId);
        if (businessId) list = list.filter((u) => u.business_id === businessId);
      }
    } catch {}
  }

  if (list.length === 0) {
    return { totalGenerations: 0, totalCostUsd: 0, successRate: 100, avgLatencyMs: 0 };
  }

  const successCount = list.filter((u) => u.success).length;
  const totalCost = list.reduce((acc, u) => acc + (Number(u.est_cost_usd) || 0), 0);
  const totalLatency = list.reduce((acc, u) => acc + (Number(u.latency_ms) || 0), 0);

  return {
    totalGenerations: list.length,
    totalCostUsd: totalCost,
    successRate: Math.round((successCount / list.length) * 100),
    avgLatencyMs: Math.round(totalLatency / list.length),
  };
}

// -------------------------------------------------------------
// Auto-Failover Execution Engine
// -------------------------------------------------------------
export interface GenerationParams {
  businessId: string;
  system: string;
  prompt: string;
  maxTokens?: number;
  modelOverrideId?: string | null;
}

export interface GenerationResult {
  text: string;
  modelId: string;
  modelLabel: string;
  latencyMs: number;
}

export async function executeWithFailover(params: GenerationParams): Promise<GenerationResult> {
  const { businessId, system, prompt, maxTokens = 600, modelOverrideId } = params;
  const now = Date.now();

  const settings = await getAiSettings();
  const allModels = await getAllAiModels();

  // 1. If no rows exist in ai_models, return null so caller falls back to env ANTHROPIC_API_KEY
  if (allModels.length === 0) {
    throw new Error("NO_MODELS_CONFIGURED");
  }

  // 2. Build candidate queue in priority order:
  // Order: business.model_override_id -> settings.manual_primary_id -> remaining enabled models by priority
  const queue: AiModelRecord[] = [];

  // Check model override
  if (modelOverrideId) {
    const overrideModel = allModels.find((m) => m.id === modelOverrideId && m.enabled);
    if (overrideModel) queue.push(overrideModel);
  }

  // Check manual primary
  if (settings.manual_primary_id) {
    const primary = allModels.find((m) => m.id === settings.manual_primary_id && m.enabled);
    if (primary && !queue.some((m) => m.id === primary.id)) {
      queue.push(primary);
    }
  }

  // Remaining enabled models
  for (const m of allModels) {
    if (m.enabled && !queue.some((q) => q.id === m.id)) {
      queue.push(m);
    }
  }

  // 3. Filter out unavailable models
  const eligibleModels = queue.filter((m) => {
    if (m.status === "disabled") return false;

    // Check cooldown
    if (m.status === "cooldown" && m.cooldown_until) {
      const cooldownTime = new Date(m.cooldown_until).getTime();
      if (cooldownTime > now) return false;
    }

    // Check exhausted retry threshold
    if (m.status === "exhausted" && m.last_error_at) {
      const errTime = new Date(m.last_error_at).getTime();
      const retryMs = (settings.exhausted_retry_hours || 6) * 60 * 60 * 1000;
      if (now - errTime < retryMs) return false;
    }

    return true;
  });

  if (eligibleModels.length === 0) {
    throw new Error("ALL_MODELS_UNAVAILABLE");
  }

  // If failover_enabled is false, only try the primary (first in queue)
  const modelsToTry = settings.failover_enabled ? eligibleModels : [eligibleModels[0]];

  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const apiKey = decryptApiKey(model.api_key_encrypted || "") || process.env.ANTHROPIC_API_KEY || "";

    if (!apiKey) {
      continue;
    }

    const adapter = createAdapter(model.provider, apiKey, model.model_id, model.base_url || undefined);

    // Attempt generation with 1 immediate retry on invalid JSON/response
    let attempts = 0;
    while (attempts < 2) {
      attempts++;
      try {
        const out = await adapter.generate({ system, prompt, maxTokens });

        // Calculate estimated cost
        const inCost = ((model.input_cost_per_1m || 0.25) / 1_000_000) * out.usage.input_tokens;
        const outCost = ((model.output_cost_per_1m || 1.25) / 1_000_000) * out.usage.output_tokens;
        const totalCost = inCost + outCost;

        // Update model success status
        await upsertAiModel({
          ...model,
          status: "active",
          last_success_at: new Date().toISOString(),
          last_error_message: null,
          cooldown_until: null,
        });

        // Log usage telemetry
        await logModelUsage({
          model_id: model.id,
          business_id: businessId,
          input_tokens: out.usage.input_tokens,
          output_tokens: out.usage.output_tokens,
          est_cost_usd: totalCost,
          success: true,
          latency_ms: out.latency_ms,
        });

        return {
          text: out.text,
          modelId: model.id,
          modelLabel: model.label,
          latencyMs: out.latency_ms,
        };
      } catch (err: any) {
        lastError = err;
        const status = err.status || 500;
        const isAdapterErr = err instanceof AdapterError;
        const errType = isAdapterErr ? err.errorType : "invalid_response";

        // If invalid response, retry once on same model before failing over
        if (errType === "invalid_response" && attempts === 1) {
          continue;
        }

        // Handle cooldown vs exhausted
        const isExhausted = errType === "credit_exhausted";
        const cooldownMs = (settings.cooldown_seconds || 60) * 1000;
        const cooldownUntil = new Date(now + cooldownMs).toISOString();

        await upsertAiModel({
          ...model,
          status: isExhausted ? "exhausted" : "cooldown",
          cooldown_until: isExhausted ? null : cooldownUntil,
          last_error_at: new Date().toISOString(),
          last_error_message: err.message || "Model execution failed",
        });

        // Log failed attempt
        await logModelUsage({
          model_id: model.id,
          business_id: businessId,
          input_tokens: 0,
          output_tokens: 0,
          est_cost_usd: 0,
          success: false,
          error_type: errType,
          latency_ms: 0,
        });

        // Record failover event in settings
        const nextModel = modelsToTry[i + 1];
        if (nextModel) {
          await saveAiSettings({
            last_failover_at: new Date().toISOString(),
            last_failover_info: `Switched from ${model.label} (${errType}) to ${nextModel.label}`,
          });
        }

        break; // Break retry loop, proceed to next model in queue
      }
    }
  }

  throw lastError || new Error("Failed to generate with available models.");
}
