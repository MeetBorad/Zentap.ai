// src/app/api/admin/models/route.ts
import { NextRequest, NextResponse } from "next/server";
import { 
  getAllAiModels, 
  upsertAiModel, 
  deleteAiModel, 
  resetModelStatus, 
  getAiSettings, 
  saveAiSettings,
  AiModelRecord
} from "@/lib/ai/modelManager";
import { encryptApiKey, maskApiKey } from "@/lib/ai/crypto";
import { resolveModelApiKey } from "@/lib/ai/router";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await getAllAiModels();
    const settings = await getAiSettings();

    // Query recent usage logs to compute accurate Last Success / Error per model
    const db = createAdminClient();
    const latestLogsByModel = new Map<string, any>();

    if (db) {
      try {
        const { data: logs } = await db
          .from("ai_model_usage")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (Array.isArray(logs)) {
          for (const l of logs) {
            if (l.model_id && !latestLogsByModel.has(l.model_id)) {
              latestLogsByModel.set(l.model_id, l);
            }
          }
        }
      } catch (err) {
        console.warn("[api/admin/models] ai_model_usage lookup error:", err);
      }
    }

    const now = Date.now();

    // Map each model with real state, key presence, and latest log
    const enrichedModels = models.map((m) => {
      const resolvedKey = resolveModelApiKey(m);
      const hasKey = Boolean(resolvedKey && resolvedKey.trim().length > 0);
      const latestLog = latestLogsByModel.get(m.id);

      // Determine real status
      let realStatus: "active" | "standby" | "exhausted" | "cooldown" | "no_key" | "disabled" = "standby";
      let cooldownSecondsRemaining = 0;
      let exhaustedRetryHoursRemaining = 0;

      if (!m.enabled) {
        realStatus = "disabled";
      } else if (!hasKey) {
        realStatus = "no_key";
      } else if (m.status === "cooldown" && m.cooldown_until && new Date(m.cooldown_until).getTime() > now) {
        realStatus = "cooldown";
        cooldownSecondsRemaining = Math.max(0, Math.ceil((new Date(m.cooldown_until).getTime() - now) / 1000));
      } else if (m.status === "exhausted") {
        realStatus = "exhausted";
        if (m.last_error_at) {
          const hoursPassed = (now - new Date(m.last_error_at).getTime()) / (1000 * 60 * 60);
          exhaustedRetryHoursRemaining = Math.max(0, Number(((settings.exhausted_retry_hours || 6) - hoursPassed).toFixed(1)));
        }
      } else if (m.id === settings.manual_primary_id || (!settings.manual_primary_id && m.priority === 1)) {
        realStatus = "active";
      } else {
        realStatus = "standby";
      }

      // Inconsistency detection
      const labelLower = m.label.toLowerCase();
      const modelIdLower = m.model_id.toLowerCase();
      let isInconsistent = false;
      let inconsistencyReason = "";

      if (labelLower.includes("llama") && !modelIdLower.includes("llama")) {
        isInconsistent = true;
        inconsistencyReason = `Label mentions "Llama" but Model ID is "${m.model_id}"`;
      } else if (labelLower.includes("gemini") && !modelIdLower.includes("gemini")) {
        isInconsistent = true;
        inconsistencyReason = `Label mentions "Gemini" but Model ID is "${m.model_id}"`;
      } else if (labelLower.includes("claude") && !modelIdLower.includes("claude")) {
        isInconsistent = true;
        inconsistencyReason = `Label mentions "Claude" but Model ID is "${m.model_id}"`;
      } else if (labelLower.includes("mistral") && !modelIdLower.includes("mistral")) {
        isInconsistent = true;
        inconsistencyReason = `Label mentions "Mistral" but Model ID is "${m.model_id}"`;
      }

      return {
        ...m,
        has_key: hasKey,
        real_status: realStatus,
        cooldown_seconds_remaining: cooldownSecondsRemaining,
        exhausted_hours_remaining: exhaustedRetryHoursRemaining,
        is_inconsistent: isInconsistent,
        inconsistency_reason: inconsistencyReason,
        api_key_masked: hasKey
          ? m.api_key_encrypted
            ? maskApiKey(m.api_key_encrypted)
            : "•••••••• (Env)"
          : "No key",
        api_key_encrypted: undefined,
        last_log: latestLog
          ? {
              success: latestLog.success,
              error_type: latestLog.error_type,
              latency_ms: latestLog.latency_ms,
              created_at: latestLog.created_at,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      models: enrichedModels,
      settings,
    });
  } catch (err: any) {
    console.error("GET /api/admin/models error:", err);
    return NextResponse.json({ error: "Failed to load models" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "upsert") {
      const { id, label, provider, model_id, base_url, api_key, priority, enabled, monthly_budget_usd, input_cost_per_1m, output_cost_per_1m } = body;

      if (!label || !provider || !model_id) {
        return NextResponse.json({ error: "Label, provider and model ID are required." }, { status: 400 });
      }

      const patch: any = {
        id,
        label,
        provider,
        model_id,
        base_url: base_url || null,
        priority: priority ?? 1,
        enabled: enabled ?? true,
        monthly_budget_usd: monthly_budget_usd ? Number(monthly_budget_usd) : null,
        input_cost_per_1m: input_cost_per_1m ? Number(input_cost_per_1m) : 0.25,
        output_cost_per_1m: output_cost_per_1m ? Number(output_cost_per_1m) : 0.75,
      };

      if (api_key && api_key.trim()) {
        patch.api_key_encrypted = encryptApiKey(api_key.trim());
      }

      const saved = await upsertAiModel(patch);
      return NextResponse.json({ success: true, model: saved });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
      await deleteAiModel(id);
      return NextResponse.json({ success: true });
    }

    if (action === "reset_status") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
      await resetModelStatus(id);
      return NextResponse.json({ success: true });
    }

    if (action === "set_primary") {
      const { id } = body;
      await saveAiSettings({ manual_primary_id: id || null });
      return NextResponse.json({ success: true });
    }

    if (action === "update_settings") {
      const { failover_enabled, cooldown_seconds, exhausted_retry_hours, alert_email, manual_primary_id } = body;
      const patch: any = {};
      if (typeof failover_enabled === "boolean") patch.failover_enabled = failover_enabled;
      if (cooldown_seconds) patch.cooldown_seconds = Number(cooldown_seconds);
      if (exhausted_retry_hours) patch.exhausted_retry_hours = Number(exhausted_retry_hours);
      if (alert_email !== undefined) patch.alert_email = alert_email || null;
      if (manual_primary_id !== undefined) patch.manual_primary_id = manual_primary_id || null;

      const saved = await saveAiSettings(patch);
      return NextResponse.json({ success: true, settings: saved });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/models error:", err);
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}
