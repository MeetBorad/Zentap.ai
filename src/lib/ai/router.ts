// src/lib/ai/router.ts
// Universal, server-side AI router with per-error auto-failover, 10s timeout,
// deduplicated quota alerts, JSON validation, and privacy-first usage telemetry.

import { 
  getAllAiModels, 
  getAiSettings, 
  upsertAiModel, 
  saveAiSettings, 
  AiModelRecord, 
  AiSettingsRecord 
} from "@/lib/ai/modelManager";
import { decryptApiKey } from "@/lib/ai/crypto";
import { createAdapter, AdapterError } from "@/lib/ai/adapters";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CallAIOptions {
  task: string; // e.g. "suggest", "translate", "test_model", "review_writer"
  system: string;
  prompt: string;
  json?: boolean;
  businessId?: string;
  modelOverrideId?: string | null;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number; // default 10,000ms (10 seconds)
}

export interface CallAIResult {
  text: string;
  data?: any; // Parsed JSON when json === true
  modelId: string;
  modelLabel: string;
  latencyMs: number;
}

// In-memory alert deduplication map: key = `${modelId}:${type}` -> timestamp ms
const alertDedupeMap = new Map<string, number>();

/**
 * Resolves the decrypted or environment API key for a model.
 * Returns null if no API key is available.
 */
export function resolveModelApiKey(model: AiModelRecord): string | null {
  if (model.api_key_encrypted) {
    const dec = decryptApiKey(model.api_key_encrypted);
    if (dec && dec.trim()) return dec.trim();
  }

  const p = (model.provider || "").toLowerCase();
  const b = (model.base_url || "").toLowerCase();

  if (p === "google") {
    const k = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (k && k.trim()) return k.trim();
  } else if (p === "openai_compatible" || p === "openai") {
    if (b.includes("groq.com")) {
      const k = process.env.GROQ_API_KEY;
      if (k && k.trim()) return k.trim();
    } else if (b.includes("cerebras.ai")) {
      const k = process.env.CEREBRAS_API_KEY;
      if (k && k.trim()) return k.trim();
    } else if (b.includes("mistral.ai")) {
      const k = process.env.MISTRAL_API_KEY;
      if (k && k.trim()) return k.trim();
    }
    const generic = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (generic && generic.trim()) return generic.trim();
  } else if (p === "anthropic") {
    const k = process.env.ANTHROPIC_API_KEY;
    if (k && k.trim()) return k.trim();
  }

  return null;
}

/**
 * Sends a deduplicated alert email for Quota Exhaustion or Invalid Key.
 */
async function sendQuotaAlertEmail(
  model: AiModelRecord,
  alertType: "quota_exhausted" | "bad_key",
  errorMessage: string,
  alertEmailTarget: string | null | undefined,
  exhaustedRetryHours: number
) {
  const dedupeKey = `${model.id}:${alertType}`;
  const now = Date.now();
  const lastAlert = alertDedupeMap.get(dedupeKey);
  const windowMs = (exhaustedRetryHours || 6) * 60 * 60 * 1000;

  if (lastAlert && now - lastAlert < windowMs) {
    // Deduplicated: already alerted within this window
    return;
  }

  alertDedupeMap.set(dedupeKey, now);

  const recipient = alertEmailTarget?.trim() || process.env.ALERT_EMAIL || "admin@zentapdigitalsolutions.com";
  const subject = alertType === "quota_exhausted"
    ? `[ZenTap AI Alert] Model Quota / Credit Exhausted: ${model.label}`
    : `[ZenTap AI Alert] Model Disabled (Bad Key / Unauthorized): ${model.label}`;

  console.warn(
    `\n🚨 ${subject}\nTo: ${recipient}\nModel: ${model.label} (${model.model_id})\nProvider: ${model.provider}\nError: ${errorMessage}\n`
  );

  // If a notification webhook or resend is configured, trigger here
  const db = createAdminClient();
  if (db) {
    try {
      await db.from("partner_actions").insert({
        tag_code: "SYSTEM_AI_ROUTER",
        action: alertType,
        business_id: null,
        details: {
          model_id: model.id,
          model_label: model.label,
          recipient,
          error: errorMessage,
        },
      });
    } catch {}
  }
}

/**
 * Privacy-first usage telemetry logger.
 * Never logs API keys or full customer text!
 */
async function logCallTelemetry(params: {
  modelId: string;
  businessId?: string;
  task: string;
  success: boolean;
  errorType?: string | null;
  latencyMs: number;
}) {
  const db = createAdminClient();
  if (db) {
    try {
      // Non-blocking log insertion
      Promise.resolve(
        db.from("ai_model_usage").insert({
          model_id: params.modelId.startsWith("mod_") || /^[0-9a-f-]{36}$/i.test(params.modelId) ? params.modelId : null,
          business_id: params.businessId && /^[0-9a-f-]{36}$/i.test(params.businessId) ? params.businessId : null,
          task: params.task,
          success: params.success,
          error_type: params.errorType || null,
          latency_ms: params.latencyMs,
          created_at: new Date().toISOString(),
        })
      ).catch(() => {});
    } catch {}
  }
}

/**
 * Core Universal AI Function callAI({task, system, prompt, json, ...})
 */
export async function callAI(options: CallAIOptions): Promise<CallAIResult> {
  const {
    task,
    system,
    prompt,
    json = false,
    businessId,
    modelOverrideId,
    maxTokens = 600,
    temperature = 0.75,
    timeoutMs = 10000,
  } = options;

  const now = Date.now();
  const settings: AiSettingsRecord = await getAiSettings();
  const allModels: AiModelRecord[] = await getAllAiModels();

  if (allModels.length === 0) {
    throw new Error("NO_MODELS_CONFIGURED: No AI models are registered in settings.");
  }

  // 1. Build Candidate Queue in Priority Order
  const queue: AiModelRecord[] = [];

  // Model override has top priority if enabled
  if (modelOverrideId) {
    const override = allModels.find((m) => m.id === modelOverrideId && m.enabled);
    if (override) queue.push(override);
  }

  // Manual primary model
  if (settings.manual_primary_id) {
    const primary = allModels.find((m) => m.id === settings.manual_primary_id && m.enabled);
    if (primary && !queue.some((q) => q.id === primary.id)) {
      queue.push(primary);
    }
  }

  // Remaining enabled models ordered by priority
  const sorted = [...allModels].sort((a, b) => a.priority - b.priority);
  for (const m of sorted) {
    if (m.enabled && !queue.some((q) => q.id === m.id)) {
      queue.push(m);
    }
  }

  // 2. Filter Candidate Queue
  const candidateModels = queue.filter((m) => {
    // Must be enabled
    if (!m.enabled || m.status === "disabled") return false;

    // Must have a valid API key (stored encrypted or env fallback)
    const key = resolveModelApiKey(m);
    if (!key) return false;

    // Skip if in cooldown
    if (m.status === "cooldown" && m.cooldown_until) {
      const cooldownEnd = new Date(m.cooldown_until).getTime();
      if (cooldownEnd > now) return false;
    }

    // Skip if in quota exhausted window
    if (m.status === "exhausted" && m.last_error_at) {
      const errTime = new Date(m.last_error_at).getTime();
      const retryMs = (settings.exhausted_retry_hours || 6) * 60 * 60 * 1000;
      if (now - errTime < retryMs) return false;
    }

    return true;
  });

  if (candidateModels.length === 0) {
    throw new Error("ALL_AI_MODELS_UNAVAILABLE: All candidate models are in cooldown, exhausted, disabled, or missing API keys.");
  }

  // If Auto-Failover is disabled, use ONLY the primary model and return/throw the error immediately
  const modelsToAttempt = settings.failover_enabled ? candidateModels : [candidateModels[0]];

  let lastCaughtError: any = null;

  for (let i = 0; i < modelsToAttempt.length; i++) {
    const model = modelsToAttempt[i];
    const apiKey = resolveModelApiKey(model);

    if (!apiKey) {
      continue;
    }

    const adapter = createAdapter(model.provider, apiKey, model.model_id, model.base_url || undefined);
    const startCallTime = Date.now();

    try {
      // Execute with 10-second timeout
      const output = await adapter.generate({
        system,
        prompt,
        maxTokens,
        temperature,
        json,
        timeoutMs,
      });

      const latencyMs = Date.now() - startCallTime;

      // JSON parsing & validation requirement (Part A-4)
      let parsedData: any = undefined;
      if (json) {
        let cleanRaw = output.text.trim();
        // Remove markdown formatting ```json ... ``` if model wrapped it
        cleanRaw = cleanRaw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        try {
          parsedData = JSON.parse(cleanRaw);
          if (!parsedData || (typeof parsedData !== "object" && !Array.isArray(parsedData))) {
            throw new Error("Parsed JSON root is not an object or array");
          }
        } catch (jsonErr: any) {
          // Count as failure for that model and fall through to the next one!
          const failMsg = `Failed JSON validation: ${jsonErr.message || "Invalid JSON output"}`;
          await upsertAiModel({
            ...model,
            status: "standby",
            last_error_at: new Date().toISOString(),
            last_error_message: failMsg,
          });

          await logCallTelemetry({
            modelId: model.id,
            businessId,
            task,
            success: false,
            errorType: "invalid_json",
            latencyMs,
          });

          lastCaughtError = new Error(failMsg);
          continue; // Try next model in queue
        }
      }

      // Success! Update model state
      await upsertAiModel({
        ...model,
        status: i === 0 && !settings.manual_primary_id ? "active" : model.status === "cooldown" || model.status === "exhausted" ? "standby" : model.status,
        last_success_at: new Date().toISOString(),
        last_error_message: null,
        cooldown_until: null,
      });

      // Log success telemetry
      await logCallTelemetry({
        modelId: model.id,
        businessId,
        task,
        success: true,
        latencyMs,
      });

      return {
        text: output.text,
        data: parsedData,
        modelId: model.id,
        modelLabel: model.label,
        latencyMs,
      };
    } catch (err: any) {
      lastCaughtError = err;
      const latencyMs = Date.now() - startCallTime;
      const status = err.status || 500;
      const isAdapterErr = err instanceof AdapterError;
      const errType = isAdapterErr ? err.errorType : "invalid_response";
      const errMsg = err.message || "Model execution failed";

      // Per-error handling (Part A-3):
      if (errType === "rate_limited" || status === 429) {
        // 429 rate limit: put model in cooldown for cooldown_seconds, try next
        const cooldownMs = (settings.cooldown_seconds || 60) * 1000;
        await upsertAiModel({
          ...model,
          status: "cooldown",
          cooldown_until: new Date(Date.now() + cooldownMs).toISOString(),
          last_error_at: new Date().toISOString(),
          last_error_message: `Rate limited (429): ${errMsg}`,
        });

        await logCallTelemetry({
          modelId: model.id,
          businessId,
          task,
          success: false,
          errorType: "rate_limited",
          latencyMs,
        });
      } else if (errType === "credit_exhausted" || status === 402) {
        // 402 / quota / credit exhausted: mark exhausted for exhausted_retry_hours
        await upsertAiModel({
          ...model,
          status: "exhausted",
          cooldown_until: null,
          last_error_at: new Date().toISOString(),
          last_error_message: `Quota/Credit exhausted: ${errMsg}`,
        });

        // Send ONE alert email (deduplicated)
        await sendQuotaAlertEmail(
          model,
          "quota_exhausted",
          errMsg,
          settings.alert_email,
          settings.exhausted_retry_hours
        );

        await logCallTelemetry({
          modelId: model.id,
          businessId,
          task,
          success: false,
          errorType: "credit_exhausted",
          latencyMs,
        });
      } else if (errType === "invalid_key" || status === 401 || status === 403) {
        // 401 / 403 bad key: disable that model, send one alert, try next
        await upsertAiModel({
          ...model,
          enabled: false,
          status: "disabled",
          last_error_at: new Date().toISOString(),
          last_error_message: `Bad Key / Unauthorized (${status}): ${errMsg}`,
        });

        // Send ONE alert email (deduplicated)
        await sendQuotaAlertEmail(
          model,
          "bad_key",
          errMsg,
          settings.alert_email,
          settings.exhausted_retry_hours
        );

        await logCallTelemetry({
          modelId: model.id,
          businessId,
          task,
          success: false,
          errorType: "invalid_key",
          latencyMs,
        });
      } else {
        // 5xx, timeout, connection_error, or invalid_response: try next model immediately, no long cooldown!
        await upsertAiModel({
          ...model,
          last_error_at: new Date().toISOString(),
          last_error_message: errMsg,
        });

        await logCallTelemetry({
          modelId: model.id,
          businessId,
          task,
          success: false,
          errorType: errType,
          latencyMs,
        });
      }

      // Record failover info in settings
      const nextModel = modelsToAttempt[i + 1];
      if (nextModel) {
        await saveAiSettings({
          last_failover_at: new Date().toISOString(),
          last_failover_info: `Auto-failover from "${model.label}" (${errType}) to "${nextModel.label}"`,
        });
      }

      // If Auto-Failover is off, do NOT try next models; throw the error immediately!
      if (!settings.failover_enabled) {
        throw new Error(`Primary model (${model.label}) failed: ${errMsg}. Auto-Failover is disabled.`);
      }
    }
  }

  throw lastCaughtError || new Error("All candidate AI models failed to fulfill the request.");
}

