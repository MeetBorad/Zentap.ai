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

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await getAllAiModels();
    const settings = await getAiSettings();

    // Mask API keys before returning to client
    const safeModels = models.map((m) => ({
      ...m,
      api_key_masked: m.api_key_encrypted ? maskApiKey(m.api_key_encrypted) : "None",
      api_key_encrypted: undefined, // Never expose encrypted cipher string to client
    }));

    return NextResponse.json({
      success: true,
      models: safeModels,
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
        output_cost_per_1m: output_cost_per_1m ? Number(output_cost_per_1m) : 1.25,
      };

      if (api_key && api_key.trim()) {
        patch.api_key_encrypted = encryptApiKey(api_key.trim());
      }

      const saved = await upsertAiModel(patch);
      return NextResponse.json({ success: true, model: { ...saved, api_key_encrypted: undefined } });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "Missing model ID" }, { status: 400 });
      await deleteAiModel(id);
      return NextResponse.json({ success: true });
    }

    if (action === "toggle") {
      const { id, enabled } = body;
      const all = await getAllAiModels();
      const target = all.find((m) => m.id === id);
      if (target) {
        await upsertAiModel({ ...target, enabled });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "reset_status") {
      const { id } = body;
      const all = await getAllAiModels();
      const target = all.find((m) => m.id === id);
      if (target) {
        await resetModelStatus(id);
      }
      return NextResponse.json({ success: true });
    }

    if (action === "make_primary") {
      const { id } = body;
      await saveAiSettings({ manual_primary_id: id || null });
      return NextResponse.json({ success: true });
    }

    if (action === "update_settings") {
      const { failover_enabled, exhausted_retry_hours, cooldown_seconds, alert_email } = body;
      const updated = await saveAiSettings({
        failover_enabled: failover_enabled !== undefined ? !!failover_enabled : undefined,
        exhausted_retry_hours: exhausted_retry_hours !== undefined ? Number(exhausted_retry_hours) : undefined,
        cooldown_seconds: cooldown_seconds !== undefined ? Number(cooldown_seconds) : undefined,
        alert_email: alert_email !== undefined ? alert_email : undefined,
      });
      return NextResponse.json({ success: true, settings: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/models error:", err);
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}
