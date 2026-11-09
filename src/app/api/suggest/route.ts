// src/app/api/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai/router";
import { getBusinessBySlug, SAMPLE_DEMO_BUSINESS } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrBuildBusinessContext, BusinessContextData } from "@/lib/ai/businessContext";

export const dynamic = "force-dynamic";

// In-memory store of recent reviews per business (up to 30)
const recentReviewsPerBusiness = new Map<string, string[]>();

function getStoredReviews(businessId: string): string[] {
  return recentReviewsPerBusiness.get(businessId.toLowerCase()) || [];
}

function storeGeneratedReviews(businessId: string, drafts: string[]) {
  const key = businessId.toLowerCase();
  const existing = recentReviewsPerBusiness.get(key) || [];
  const updated = [...drafts, ...existing].slice(0, 30);
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

/**
 * Extracts past review history (up to 30 reviews): openings to avoid,
 * repeated phrases, and service frequency to encourage under-represented angles.
 */
async function analyzePastReviews(businessId: string): Promise<{
  avoidOpenings: string[];
  frequentPhrases: string[];
  allStoredReviews: string[];
}> {
  const key = businessId.toLowerCase();
  const memoryReviews = getStoredReviews(key);
  let dbReviews: string[] = [];

  const db = createAdminClient();
  if (db) {
    try {
      const { data } = await db
        .from("review_generations")
        .select("output_text")
        .ilike("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (Array.isArray(data) && data.length > 0) {
        dbReviews = data.map((d: any) => String(d.output_text || "").trim()).filter(Boolean);
      }
    } catch {}
  }

  // Merge and deduplicate up to last 30 reviews
  const allStoredReviews = Array.from(new Set([...memoryReviews, ...dbReviews])).slice(0, 30);

  // Extract openings (first 65 chars / first sentence)
  const avoidOpenings = allStoredReviews.map((r) => {
    const firstSentence = r.split(/[.!?]/)[0] || r;
    return firstSentence.slice(0, 65).trim();
  }).filter(Boolean);

  // Extract recurring 2-gram and 3-gram phrases that appear >= 3 times
  const phraseCounts = new Map<string, number>();
  for (const rev of allStoredReviews) {
    const ngrams = getNGrams(rev, 2);
    for (const g of ngrams) {
      phraseCounts.set(g, (phraseCounts.get(g) || 0) + 1);
    }
  }

  const frequentPhrases: string[] = [];
  for (const [phrase, count] of phraseCounts.entries()) {
    if (count >= 3 && phrase.length > 7) {
      frequentPhrases.push(phrase);
    }
  }

  return {
    avoidOpenings: avoidOpenings.slice(0, 15),
    frequentPhrases: frequentPhrases.slice(0, 8),
    allStoredReviews,
  };
}

const OPENING_ANGLES = [
  "Lead directly with the specific item, service, or aspect experienced today.",
  "Begin with an observation about the efficiency, promptness, or overall flow of the visit.",
  "Open with how comfortable, transparent, or courteous the experience felt.",
  "Start with the immediate tangible outcome or satisfaction with what was provided.",
  "Begin with a natural, conversational takeaway as a local customer.",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      slug = "zentap",
      stars = 5,
      language = "english",
      length = "medium", // "short" | "medium" | "detailed"
    } = body;

    const rawChips = body.selectedChips || body.chips || [];
    const rawNote = body.noteText !== undefined ? body.noteText : body.note;

    const chips: string[] = Array.isArray(rawChips)
      ? rawChips.map((c: any) => String(c).trim()).filter(Boolean)
      : [];
    const notes: string = typeof rawNote === "string" ? rawNote.trim() : "";

    // Require at least one real input (chip or note)
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

    // 1. Load basic business record from DB/Clients
    let rawClientRow: any = null;
    let businessId = cleanSlug;
    let businessName = "ZenTap Digital Solutions";
    let businessCategory = "Digital Growth & Smart NFC Systems";
    let businessArea = "Ahmedabad";

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
          rawClientRow = clientRow;
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

    // 2. Build Business Context (Owner -> Website -> Gemini Grounding)
    const bizContext: BusinessContextData = await getOrBuildBusinessContext(businessId, {
      name: businessName,
      category: businessCategory,
      area: businessArea,
      city: businessArea,
      custom_fields: rawClientRow?.custom_fields,
      website_url: rawClientRow?.custom_fields?.website_url || rawClientRow?.custom_fields?.website,
    });

    // 3. Analyze Review History (Last 30 Reviews)
    const { avoidOpenings, frequentPhrases, allStoredReviews } = await analyzePastReviews(businessId);

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
      langInstruction = "Write in natural Gujarati script (ગુજરાતી) that sounds genuinely spoken by a Gujarati local. Keep brand names and proper nouns in their original English spelling.";
    } else if (lowerLang.includes("hi") || lowerLang === "hindi") {
      langInstruction = "Write in natural Hindi script (हिन्दी) that sounds authentic and warm. Keep brand names and proper nouns in their original English spelling.";
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

    const randomAngle = OPENING_ANGLES[Math.floor(Math.random() * OPENING_ANGLES.length)];

    // Construct Contextual Prompt (strictly adhering to Section 3 Prompt Rules)
    const systemPrompt = `You are a real customer helping write authentic, genuine Google review drafts.
You must output strictly a JSON object with this exact shape:
{"drafts": ["draft 1 text", "draft 2 text", "draft 3 text"]}

PROMPT RULES & STRICT ANTI-HALLUCINATION CONTRACT:
1. Facts about the customer's experience come ONLY from what the customer provided:
   - Customer Highlights: ${chips.length > 0 ? chips.join(", ") : "None specified"}
   - Customer Note: ${notes ? `"${notes}"` : "None provided"}
2. DO NOT INVENT: Never make up dish names, menu items, employee names, exact rupee prices, discounts, or events not mentioned by the customer.
3. Business Context Usage:
   - Business Name (exact spelling): "${bizContext.business_name}" (mention at most ONCE per draft).
   - Category / Tone context: "${bizContext.category}"
   - Locality keyword (mention at most once naturally): "${bizContext.area}"
   - Known services for correct naming: ${bizContext.services.length > 0 ? bizContext.services.join(", ") : "None"}
   - RULE: If business context suggests a detail or service the customer DID NOT refer to, DO NOT include it!
4. Tone & Rating: Must match ${ratingNum}/5 stars. ${toneInstruction}
5. Diversity & Opening Variations:
   - Each of the 3 drafts must lead with a DIFFERENT angle. Suggested opening direction: ${randomAngle}
   - DO NOT start with or reuse these past review openings: ${JSON.stringify(avoidOpenings.slice(0, 10))}
   - AVOID repeating these signature phrases: ${JSON.stringify(frequentPhrases.slice(0, 6))}
   - Never copy or paraphrase another review.
6. Language: ${langInstruction}
7. Length: ${lengthInstructions}
8. Output strictly raw JSON. No markdown backticks, no explanatory text outside the JSON.`;

    const userPrompt = `Generate 3 distinct, genuine review drafts for ${bizContext.business_name} with ${ratingNum} stars. Customer highlights: [${chips.join(", ")}]. Customer note: "${notes}".`;

    let drafts: string[] = [];

    // Call shared AI router with json: true
    const aiRes = await callAI({
      task: `suggest:ctx[${bizContext.sources_used.join(",") || "none"}]`,
      system: systemPrompt,
      prompt: userPrompt,
      json: true,
      businessId,
      temperature: 0.85,
      maxTokens: 800,
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
        drafts = aiRes.text
          .split("\n\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 20);
      }
    }

    // Ensure 3 drafts exist
    if (drafts.length < 3) {
      const baseNote = notes ? `${notes}. ` : "";
      const highlightStr = chips.join(", ");
      drafts = [
        ...drafts,
        `Really satisfied with the ${highlightStr || "service"} at ${bizContext.business_name}. ${baseNote}Great experience overall.`,
        `Had a good visit to ${bizContext.business_name} in ${bizContext.area}. ${baseNote}Everything was handled smoothly.`,
        `Appreciate the prompt assistance with ${highlightStr || "everything"} at ${bizContext.business_name}. ${baseNote}Definitely recommended.`,
      ].slice(0, 3);
    }

    // N-gram similarity check against all stored reviews (up to 30) and candidate drafts
    const sanitizedDrafts: string[] = [];

    for (let i = 0; i < drafts.length; i++) {
      let draft = drafts[i].replace(/^["']|["']$/g, "").trim();
      let isTooSimilar = false;

      // Check against all stored past reviews
      for (const past of allStoredReviews) {
        if (calculateSimilarity(draft, past) > 0.60) {
          isTooSimilar = true;
          break;
        }
      }

      // Check against drafts already accepted in this batch
      if (!isTooSimilar) {
        for (const accepted of sanitizedDrafts) {
          if (calculateSimilarity(draft, accepted) > 0.65) {
            isTooSimilar = true;
            break;
          }
        }
      }

      // If too similar, make an automatic diversification tweak
      if (isTooSimilar) {
        draft = draft.replace(/^I\s+/i, "Honestly, ").replace(/^Had a\s+/i, "Really had a ");
      }

      sanitizedDrafts.push(draft);
      if (sanitizedDrafts.length >= 3) break;
    }

    // Store in recent reviews cache
    storeGeneratedReviews(businessId, sanitizedDrafts);

    // Telemetry: Log generation event to Supabase review_generations table
    if (db && sanitizedDrafts.length > 0) {
      try {
        Promise.resolve(
          db.from("review_generations").insert({
            business_id: /^[0-9a-f-]{36}$/i.test(businessId) ? businessId : null,
            tag_id: cleanSlug,
            stars: ratingNum,
            length: length === "short" || length === "detailed" ? length : "medium",
            language: lowerLang.includes("gu") ? "gujarati_roman" : lowerLang.includes("hi") ? "hindi_roman" : "english",
            option_ids: chips,
            output_text: sanitizedDrafts[0],
            created_at: new Date().toISOString(),
          })
        ).catch(() => {});
      } catch {}
    }

    return NextResponse.json({
      success: true,
      drafts: sanitizedDrafts.slice(0, 3),
      context: {
        business_name: bizContext.business_name,
        category: bizContext.category,
        area: bizContext.area,
        source: bizContext.source,
        sources_used: bizContext.sources_used,
        confidence: bizContext.confidence,
      },
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
