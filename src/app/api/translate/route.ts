// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { callAI } from "@/lib/ai/router";

export const dynamic = "force-dynamic";

// IP rate limit: max 30 translations per minute per IP
const ipRateLimits = new Map<string, { count: number; expiresAt: number }>();

function checkTranslateRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const ONE_MINUTE = 60 * 1000;
  const record = ipRateLimits.get(ipHash);

  if (record && record.expiresAt > now) {
    if (record.count >= 30) {
      return false;
    }
    record.count++;
  } else {
    ipRateLimits.set(ipHash, { count: 1, expiresAt: now + ONE_MINUTE });
  }

  // Cleanup old keys periodically
  if (ipRateLimits.size > 1000) {
    for (const [key, val] of ipRateLimits.entries()) {
      if (val.expiresAt < now) ipRateLimits.delete(key);
    }
  }

  return true;
}

const LANG_MAP: Record<string, string> = {
  "gu": "Gujarati",
  "gu-IN": "Gujarati",
  "gujarati": "Gujarati",
  "hi": "Hindi",
  "hi-IN": "Hindi",
  "hindi": "Hindi",
  "en": "English",
  "en-IN": "English",
  "en-US": "English",
  "english": "English",
};

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const clientIp = forwarded.split(",")[0].trim();
    const ipHash = crypto.createHash("sha256").update(clientIp + "zentap_translate_salt").digest("hex").slice(0, 16);

    if (!checkTranslateRateLimit(ipHash)) {
      return NextResponse.json(
        { error: "Too many translation requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { text, from, to } = body;

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required for translation." },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: "Text exceeds maximum limit of 500 characters." },
        { status: 400 }
      );
    }

    const sourceLang = LANG_MAP[String(from || "").toLowerCase()] || String(from || "auto-detected language");
    const targetLang = LANG_MAP[String(to || "").toLowerCase()] || String(to || "English");

    const systemPrompt = `You are an expert, faithful translator.
Translate the user's note accurately from ${sourceLang} into natural, human-sounding ${targetLang}.
RULES:
1. Maintain the exact original sentiment, tone, and specific details.
2. Do not add explanations, quotes, intros, or markdown notes.
3. Return ONLY the translated text string.`;

    const aiRes = await callAI({
      task: "translate",
      system: systemPrompt,
      prompt: text.trim(),
      temperature: 0.2,
      maxTokens: 500,
      timeoutMs: 10000,
    });

    const translatedText = aiRes.text.trim().replace(/^["']|["']$/g, "").trim();

    return NextResponse.json({
      text: translatedText,
      modelId: aiRes.modelId,
    });
  } catch (error: any) {
    console.error("[api/translate] Translation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to translate text." },
      { status: 500 }
    );
  }
}

