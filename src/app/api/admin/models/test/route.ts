// src/app/api/admin/models/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllAiModels } from "@/lib/ai/modelManager";
import { decryptApiKey } from "@/lib/ai/crypto";
import { createAdapter } from "@/lib/ai/adapters";

export const dynamic = "force-dynamic";

// In-memory rate limiting for test button (max 10 tests/min)
const testLimiter = new Map<string, { count: number; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ip = forwarded.split(",")[0].trim();
    const now = Date.now();

    const limit = testLimiter.get(ip);
    if (limit && limit.expiresAt > now) {
      if (limit.count >= 10) {
        return NextResponse.json({ error: "Rate limit: please wait a minute before running more model tests." }, { status: 429 });
      }
      limit.count++;
    } else {
      testLimiter.set(ip, { count: 1, expiresAt: now + 60000 });
    }

    const body = await req.json();
    const { model_id, api_key } = body;

    if (!model_id) {
      return NextResponse.json({ error: "Model ID is required." }, { status: 400 });
    }

    // Lookup model record
    const models = await getAllAiModels();
    const modelRecord = models.find((m) => m.id === model_id);

    const provider = modelRecord?.provider || body.provider || "anthropic";
    const actualModelId = modelRecord?.model_id || body.actual_model_id || "claude-haiku-5-5";
    const baseUrl = modelRecord?.base_url || body.base_url || undefined;

    let key = api_key?.trim();
    if (!key && modelRecord?.api_key_encrypted) {
      key = decryptApiKey(modelRecord.api_key_encrypted);
    }
    if (!key && provider === "google") {
      key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    }
    if (!key && (provider === "openai_compatible" || provider === "openai")) {
      if (baseUrl?.includes("groq.com")) {
        key = process.env.GROQ_API_KEY;
      } else if (baseUrl?.includes("cerebras.ai")) {
        key = process.env.CEREBRAS_API_KEY;
      } else if (baseUrl?.includes("mistral.ai")) {
        key = process.env.MISTRAL_API_KEY;
      } else {
        key = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      }
    }
    if (!key && provider === "anthropic") {
      key = process.env.ANTHROPIC_API_KEY;
    }

    if (!key) {
      return NextResponse.json({ error: "No API key configured for this model." }, { status: 400 });
    }

    const adapter = createAdapter(provider, key, actualModelId, baseUrl);

    const out = await adapter.generate({
      system: "You are a test ping agent. Output strictly: OK",
      prompt: "Respond with the word OK.",
      maxTokens: 10,
    });

    return NextResponse.json({
      success: true,
      text: out.text.trim(),
      latency_ms: out.latency_ms,
      usage: out.usage,
    });
  } catch (err: any) {
    console.error("POST /api/admin/models/test error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Model test failed",
      status: err.status || 500,
      errorType: err.errorType || "unknown",
    }, { status: 200 }); // return 200 so UI displays friendly test diagnostics
  }
}
