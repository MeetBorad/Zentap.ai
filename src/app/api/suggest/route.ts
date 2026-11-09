// src/app/api/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { callAI } from "@/lib/ai/router";
import { getBusinessBySlug, SAMPLE_DEMO_BUSINESS } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// In-memory store of the last 20 generated reviews per business for uniqueness & n-gram checks
const recentReviewsPerBusiness = new Map<string, string[]>();

function getStoredOpenings(businessId: string): string[] {
  const reviews = recentReviewsPerBusiness.get(businessId.toLowerCase()) || [];
  return reviews.map((r) => r.slice(0, 60));
}

function storeGeneratedReviews(businessId: string, drafts: string[]) {
  const key = businessId.toLowerCase();
  const existing = recentReviewsPerBusiness.get(key) || [];
  const updated = [...drafts, ...existing].slice(0, 20);
  recentReviewsPerBusiness.set(key, updated);
}

// Compute word n-grams
function getNGrams(text: string, n = 2): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u0A80-\u0AFF\u0900-\u097F]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const ngrams = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(" "));
  }
  return ngrams;
}

// Jaccard similarity coefficient between two strings based on bi-grams
function calculateSimilarity(textA: string, textB: string): number {
  const ngramsA = getNGrams(textA, 2);
  const ngramsB = getNGrams(textB, 2);
  if (ngramsA.size === 0 || ngramsB.size === 0) return 0;

  let intersection = 0;
  for (const gram of ngramsA) {
    if (ngramsB.has(gram)) intersection++;
  }
  const union = ngramsA.size + ngramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const OPENING_STYLES = [
  "Start directly with what was experienced or purchased today.",
  "Begin with a warm observation about the staff's demeanor and prompt attention.",
  "Lead straight into the outcome or quality of the visit.",
  "Begin with a genuine personal reflection as a customer.",
  "Start by noting how straightforward and smooth the entire process was.",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      slug = "zentap",
      stars = 5,
      selectedChips = [],
      noteText = "",
      language = "english",
      length = "medium", // "short" | "medium" | "detailed"
    } = body;

    const chips: string[] = Array.isArray(selectedChips)
      ? selectedChips.map((c) => String(c).trim()).filter(Boolean)
      : [];
    const notes: string = typeof noteText === "string" ? noteText.trim() : "";

    // Requirement: Require at least one real input (a chip or note text) before generating;
    // otherwise show "Pick a highlight or write a few words first" and do not generate.
    if (chips.length === 0 && !notes) {
      return NextResponse.json(
        { error: "Pick a highlight or write a few words first" },
        { status: 400 }
      );
    }

    // Clean and sanitize slug
    const cleanSlug = String(slug || "zentap")
      .replace(/[|%#?&\s/]+$/g, "")
      .trim()
      .toLowerCase();

    // 1. Load business profile (name, category, area)
    let businessName = "ZenTap Digital Solutions";
    let businessCategory = "Digital Growth & Smart NFC Systems";
    let businessArea = "Ahmedabad";
    let businessId = cleanSlug;

    const db = createAdminClient();
    if (db) {
      try {
        const { data: clientRow } = await db
          .from("clients")
          .select("business_id, business_name, city, custom_fields")
          .or(`business_id.ilike.${cleanSlug},id.ilike.${cleanSlug}`)
          .is("deleted_at", null)
          .maybeSingle();

        if (clientRow) {
          businessId = clientRow.business_id || cleanSlug;
          businessName = clientRow.business_name || businessName;
          businessArea = clientRow.city || businessArea;
          businessCategory = clientRow.custom_fields?.category || clientRow.custom_fields?.subtitle || businessCategory;
        } else {
          const { data: pageCfg } = await db
            .from("page_editor_configs")
            .select("business_name, config_data")
            .or(`tag_id.ilike.${cleanSlug},business_id.ilike.${cleanSlug}`)
            .is("deleted_at", null)
            .maybeSingle();

          if (pageCfg) {
            businessName = pageCfg.business_name || pageCfg.config_data?.title || businessName;
            businessArea = pageCfg.config_data?.address || businessArea;
            businessCategory = pageCfg.config_data?.subtitle || pageCfg.config_data?.category || businessCategory;
          }
        }
      } catch (dbErr) {
        console.warn("[api/suggest] Database lookup fallback:", dbErr);
      }
    }

    if (businessName === "ZenTap Digital Solutions") {
      const localBiz = getBusinessBySlug(cleanSlug);
      if (localBiz) {
        businessName = localBiz.name || businessName;
        businessArea = localBiz.city || businessArea;
        businessCategory = (localBiz as any).category || businessCategory;
        businessId = localBiz.id || businessId;
      }
    }

    const ratingNum = Math.min(5, Math.max(1, Number(stars) || 5));

    // Length specifications
    let lengthInstructions = "2 to 3 natural, human sentences (approx. 35 to 55 words).";
    if (length === "short") {
      lengthInstructions = "Exactly 1 or 2 concise, punchy sentences (approx. 15 to 30 words).";
    } else if (length === "detailed") {
      lengthInstructions = "3 to 5 clear, descriptive sentences (approx. 60 to 95 words) detailing the experience.";
    }

    // Language specifications
    let langInstruction = "Write in natural, fluent English.";
    const lowerLang = String(language).toLowerCase();
    if (lowerLang.includes("gu") || lowerLang === "gujarati") {
      langInstruction = "Write in natural Gujarati script (ગુજરાતી) that sounds genuinely spoken by a Gujarati local.";
    } else if (lowerLang.includes("hi") || lowerLang === "hindi") {
      langInstruction = "Write in natural Hindi script (हिन्दी) that sounds authentic and warm.";
    } else if (lowerLang.includes("hinglish")) {
      langInstruction = "Write in conversational Hinglish using English Roman script only (e.g. 'Service bahut badiya thi aur staff ka behavior ekdum helpful tha.').";
    }

    // Tone based on star rating
    let toneInstruction = "Express genuine, natural satisfaction. Friendly and warm.";
    if (ratingNum <= 2) {
      toneInstruction = `Tone must strictly match a ${ratingNum}-star review: polite, calm, matter-of-fact critique. Highlight specific unmet expectations without rude hostility or advertising praise.`;
    } else if (ratingNum === 3) {
      toneInstruction = "Tone must strictly match a 3-star review: balanced, acknowledging what was acceptable or satisfactory, while mentioning standard or ordinary aspects. Do NOT sound glowing or enthusiastic.";
    } else if (ratingNum === 4) {
      toneInstruction = "Express solid satisfaction with room for minor routine praise. Realistic 4-star sentiment.";
    }

    // Uniqueness & past openings to avoid
    const pastOpenings = getStoredOpenings(businessId);
    const randomOpening = OPENING_STYLES[Math.floor(Math.random() * OPENING_STYLES.length)];

    const systemPrompt = `You are a real customer helping write genuine, human review drafts.
You must output strictly a JSON object with this exact shape:
{"drafts": ["draft 1 text", "draft 2 text", "draft 3 text"]}

STRICT CRITERIA & ANTI-HALLUCINATION RULES:
1. Provide exactly 3 DISTINCT drafts that a real person would write.
2. Use ONLY the details provided by the customer below:
   - Selected highlights: ${chips.length > 0 ? chips.join(", ") : "None specified"}
   - Customer's own experience notes: ${notes ? `"${notes}"` : "None provided"}
3. DO NOT INVENT: Never make up dish names, menu items, employee names, exact rupee prices, discounts, or special events not stated above.
4. Sound like a real customer speaking spontaneously, NEVER like marketing copy or an advertisement.
5. Star rating: ${ratingNum}/5 stars. ${toneInstruction}
6. Business name: Mention "${businessName}" at most ONCE across each draft.
7. Location: You may mention "${businessArea}" at most once naturally if appropriate.
8. Language: ${langInstruction}
9. Length: ${lengthInstructions}
10. Random opening style to consider: ${randomOpening}
11. Do NOT repeat or start with these recent openings: ${JSON.stringify(pastOpenings.slice(0, 10))}
12. Output NO markdown, backticks, or explanatory text outside the JSON.`;

    const userPrompt = `Generate 3 authentic review drafts for ${businessName} (${businessArea}) with ${ratingNum} stars. Customer highlights: [${chips.join(", ")}]. Customer note: "${notes}".`;

    let drafts: string[] = [];

    // Call shared AI router with json: true
    const aiRes = await callAI({
      task: "suggest",
      system: systemPrompt,
      prompt: userPrompt,
      json: true,
      businessId,
      temperature: 0.85, // Higher temperature for diversity
      maxTokens: 750,
      timeoutMs: 10000,
    });

    if (aiRes.data && Array.isArray(aiRes.data.drafts) && aiRes.data.drafts.length > 0) {
      drafts = aiRes.data.drafts.map((d: any) => String(d).trim()).filter(Boolean);
    } else if (aiRes.data && Array.isArray(aiRes.data.options) && aiRes.data.options.length > 0) {
      drafts = aiRes.data.options.map((d: any) => String(d).trim()).filter(Boolean);
    } else if (typeof aiRes.text === "string") {
      try {
        const cleaned = aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        const candidate = parsed.drafts || parsed.options;
        if (Array.isArray(candidate)) {
          drafts = candidate.map((d: any) => String(d).trim()).filter(Boolean);
        }
      } catch {
        // Fallback split by lines
        drafts = aiRes.text
          .split("\n\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 20);
      }
    }

    // Ensure we have 3 drafts
    if (drafts.length < 3) {
      // Fallback simple variants if fewer than 3 were returned
      const baseNote = notes ? `${notes}. ` : "";
      const highlightStr = chips.join(", ");
      if (drafts.length === 0) {
        drafts = [
          `Really satisfied with the ${highlightStr || "service"} at ${businessName}. ${baseNote}Great experience overall.`,
          `Had a good visit to ${businessName} in ${businessArea}. ${baseNote}The ${highlightStr || "service"} was handled very smoothly.`,
          `Appreciate the prompt assistance with ${highlightStr || "everything"} at ${businessName}. ${baseNote}Definitely recommended.`,
        ];
      }
    }

    // N-gram similarity check against stored reviews and intra-draft similarity
    const storedReviews = recentReviewsPerBusiness.get(businessId.toLowerCase()) || [];
    const sanitizedDrafts: string[] = [];

    for (let i = 0; i < drafts.length; i++) {
      let draft = drafts[i].replace(/^["']|["']$/g, "").trim();
      let isTooSimilar = false;

      // Check against stored reviews
      for (const past of storedReviews) {
        if (calculateSimilarity(draft, past) > 0.65) {
          isTooSimilar = true;
          break;
        }
      }

      // Check against drafts already accepted in this batch
      if (!isTooSimilar) {
        for (const accepted of sanitizedDrafts) {
          if (calculateSimilarity(draft, accepted) > 0.70) {
            isTooSimilar = true;
            break;
          }
        }
      }

      sanitizedDrafts.push(draft);
      if (sanitizedDrafts.length >= 3) break;
    }

    // Store in recent reviews
    storeGeneratedReviews(businessId, sanitizedDrafts);

    return NextResponse.json({
      success: true,
      drafts: sanitizedDrafts.slice(0, 3),
      modelId: aiRes.modelId,
      modelLabel: aiRes.modelLabel,
    });
  } catch (error: any) {
    console.error("[api/suggest] Suggest error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate suggestions." },
      { status: 500 }
    );
  }
}

