// src/app/api/admin/models/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllAiModels, upsertAiModel } from "@/lib/ai/modelManager";
import { callAI, resolveModelApiKey } from "@/lib/ai/router";

export const dynamic = "force-dynamic";

// In-memory rate limiting for test button
const testLimiter = new Map<string, { count: number; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ip = forwarded.split(",")[0].trim();
    const now = Date.now();

    const limit = testLimiter.get(ip);
    if (limit && limit.expiresAt > now) {
      if (limit.count >= 20) {
        return NextResponse.json(
          { error: "Rate limit: please wait a minute before running more model tests." },
          { status: 429 }
        );
      }
      limit.count++;
    } else {
      testLimiter.set(ip, { count: 1, expiresAt: now + 60000 });
    }

    const body = await req.json().catch(() => ({}));
    const { model_id } = body;

    if (!model_id) {
      return NextResponse.json({ error: "Model ID is required." }, { status: 400 });
    }

    const allModels = await getAllAiModels();

    // Test All Models action
    if (model_id === "all") {
      const results: any[] = [];
      for (const m of allModels) {
        const hasKey = Boolean(resolveModelApiKey(m));
        if (!m.enabled) {
          results.push({
            id: m.id,
            label: m.label,
            success: false,
            error: "Model is disabled",
            latency_ms: 0,
          });
          continue;
        }

        if (!hasKey) {
          results.push({
            id: m.id,
            label: m.label,
            success: false,
            error: "No API key configured",
            latency_ms: 0,
          });
          continue;
        }

        try {
          const aiRes = await callAI({
            task: "test_model",
            modelOverrideId: m.id,
            system: "You are a test ping agent. Respond strictly with: OK",
            prompt: "Respond with OK",
            maxTokens: 10,
            temperature: 0.1,
            timeoutMs: 10000,
          });

          // Update model's last success timestamp
          await upsertAiModel({
            ...m,
            last_success_at: new Date().toISOString(),
          });

          results.push({
            id: m.id,
            label: m.label,
            success: true,
            text: aiRes.text.trim(),
            latency_ms: aiRes.latencyMs,
          });
        } catch (err: any) {
          // Update model's last error message
          await upsertAiModel({
            ...m,
            last_error_at: new Date().toISOString(),
            last_error_message: err.message || "Ping failed",
          });

          results.push({
            id: m.id,
            label: m.label,
            success: false,
            error: err.message || "Test failed",
            latency_ms: err.latencyMs || 0,
          });
        }
      }

      return NextResponse.json({
        success: true,
        batch: true,
        results,
      });
    }

    // Single Model Test
    const targetModel = allModels.find((m) => m.id === model_id);
    if (!targetModel) {
      return NextResponse.json({ error: `Model ${model_id} not found.` }, { status: 404 });
    }

    const hasKey = Boolean(resolveModelApiKey(targetModel));
    if (!hasKey) {
      return NextResponse.json({
        success: false,
        error: "No API key configured for this model. Please add a valid API key.",
      });
    }

    try {
      const aiRes = await callAI({
        task: "test_model",
        modelOverrideId: targetModel.id,
        system: "You are a test ping agent. Respond strictly with: OK",
        prompt: "Respond with OK",
        maxTokens: 10,
        temperature: 0.1,
        timeoutMs: 10000,
      });

      // Update model record with success
      await upsertAiModel({
        ...targetModel,
        last_success_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        text: aiRes.text.trim(),
        latency_ms: aiRes.latencyMs,
        modelId: aiRes.modelId,
        modelLabel: aiRes.modelLabel,
      });
    } catch (err: any) {
      // Update model record with error
      await upsertAiModel({
        ...targetModel,
        last_error_at: new Date().toISOString(),
        last_error_message: err.message || "Ping failed",
      });

      return NextResponse.json({
        success: false,
        error: err.message || "Model test call failed",
        latency_ms: err.latencyMs || 0,
      });
    }
  } catch (err: any) {
    console.error("POST /api/admin/models/test error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Test request error",
    });
  }
}
