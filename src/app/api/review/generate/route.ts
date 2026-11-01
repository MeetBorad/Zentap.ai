// src/app/api/review/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { 
  getBusinessReviewConfig, 
  getAllReviewOptions, 
  getRecentGenerationsForBusiness,
  logReviewGeneration,
  ReviewLength,
  ReviewLanguage,
  ReviewTone
} from "@/lib/reviewAssistantStore";
import { getBusinessById } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";
import { executeWithFailover } from "@/lib/ai/modelManager";

export const dynamic = "force-dynamic";

// In-memory rate limiting counters (IP and Business per hour)
const ipRateLimits = new Map<string, { count: number; expiresAt: number }>();
const bizRateLimits = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ipHash: string, businessId: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  // 1. IP check (max 15/hour)
  const ipRecord = ipRateLimits.get(ipHash);
  if (ipRecord && ipRecord.expiresAt > now) {
    if (ipRecord.count >= 15) {
      return { allowed: false, error: "Too many review drafts generated from this device. Please wait a while." };
    }
    ipRecord.count++;
  } else {
    ipRateLimits.set(ipHash, { count: 1, expiresAt: now + ONE_HOUR });
  }

  // 2. Business check (max 60/hour)
  const bizRecord = bizRateLimits.get(businessId);
  if (bizRecord && bizRecord.expiresAt > now) {
    if (bizRecord.count >= 60) {
      return { allowed: false, error: "Review assistant hourly threshold reached for this business." };
    }
    bizRecord.count++;
  } else {
    bizRateLimits.set(businessId, { count: 1, expiresAt: now + ONE_HOUR });
  }

  return { allowed: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, stars, option_ids, length, tag_id } = body;

    if (!business_id || !stars || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Invalid business ID or star rating." }, { status: 400 });
    }

    // 1. Validate Business & Review Config
    const biz = getBusinessById(business_id);
    if (!biz || !biz.active) {
      return NextResponse.json({ error: "Business is not currently active." }, { status: 403 });
    }

    const config = getBusinessReviewConfig(business_id);
    if (!config.ai_review_enabled) {
      return NextResponse.json({ error: "AI Review Assistant is not enabled for this business." }, { status: 403 });
    }

    // 2. Client IP Hashing & Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const clientIp = forwarded.split(",")[0].trim();
    const ipHash = crypto.createHash("sha256").update(clientIp + "zentap_salt").digest("hex").slice(0, 16);

    const rateCheck = checkRateLimit(ipHash, business_id);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    // 3. Validate Options
    const allOptions = getAllReviewOptions(business_id);
    const validOptionIds: string[] = Array.isArray(option_ids) ? option_ids : [];
    const selectedOptions = allOptions.filter((o) => validOptionIds.includes(o.id));

    if (selectedOptions.length === 0) {
      return NextResponse.json({ error: "Please select at least 1 feature or service aspect." }, { status: 400 });
    }

    const targetLength: ReviewLength = length === "short" || length === "long" ? length : config.default_length || "medium";
    const language: ReviewLanguage = config.language || "english";
    const tone: ReviewTone = config.tone || "friendly";
    const suggestionsCount = (config as any).suggestions_count || 3;

    // 4. Fetch recent 20 generations for deduplication
    const recentGens = getRecentGenerationsForBusiness(business_id, 20);
    const avoidPhrases = recentGens.map((g) => g.output_text.slice(0, 80));

    // 5. Construct Anthropic System Prompt
    const products = selectedOptions.filter((o) => o.kind === "product").map((o) => o.label);
    const aspects = selectedOptions.filter((o) => o.kind === "aspect").map((o) => o.label);

    const lengthDescription =
      targetLength === "short"
        ? "Exactly 1 to 2 concise sentences (approx. 20-35 words)."
        : targetLength === "long"
        ? "Exactly 5 to 6 short, natural sentences (approx. 60-90 words)."
        : "Exactly 3 to 4 natural sentences (approx. 40-60 words).";

    const languageDescription =
      language === "hinglish"
        ? "Natural Indian Hinglish using English Roman script only (e.g. 'Staff bohot polite tha aur service ekdum fast thi. Experience overall kafi accha raha.'). Do NOT use Devanagari script."
        : language === "gujarati_roman"
        ? "Gujarati written strictly in English Roman script (e.g. 'Bahu j saras service ane staff nu behaviour ekdum vinamra hatu. Khub anand thayo.'). Do NOT use Gujarati script."
        : language === "hindi_roman"
        ? "Conversational Hindi in English Roman script only. Do NOT use Devanagari script."
        : language === "mixed"
        ? "Natural contemporary Indian English blended with common everyday conversational Roman terms."
        : "Fluent, natural, clear English.";

    const toneDescription =
      tone === "professional"
        ? "Professional, respectful, courteous, well-articulated."
        : tone === "casual"
        ? "Casual, easy-going, authentic. Up to 1 tasteful emoji allowed."
        : tone === "warm"
        ? "Warm, appreciative, grateful, and community-minded."
        : "Friendly, direct, relatable, everyday customer tone.";

    const sentimentGuide =
      stars >= 4
        ? `Positive ${stars}-star customer review. Express genuine satisfaction and appreciation.`
        : stars === 3
        ? "Balanced 3-star review. Honest, acknowledging what was good while mildly noting an ordinary or standard experience."
        : `Factual, calm, mild ${stars}-star critique. State factual observations calmly without hyperbole, personal attacks, or rude insults.`;

    const systemPrompt = `You are a helpful customer review writer assistant for real visitors writing genuine Google reviews.
You must output strictly valid JSON matching the format:
{"options": [${Array.from({ length: suggestionsCount }, (_, i) => `"option ${i + 1} text"`).join(", ")}]}

RULES:
1. Generate exactly ${suggestionsCount} distinct, authentic review drafts written in first person ("I", "We").
2. Business name: "${biz.name}".
3. Star rating: ${stars} / 5 stars. ${sentimentGuide}
4. Mention ONLY the customer's selected features:
   - Products/Services: ${products.length > 0 ? products.join(", ") : "General services"}
   - Aspects experienced: ${aspects.join(", ")}
5. Highlights for context (use ONLY if relevant to selected chips): "${config.highlights || "Great service and clean premises."}"
6. Never invent specific prices, rupee amounts, discounts, dates, employee names, or services that were not selected.
7. Length requirement: ${lengthDescription}
8. Language & Script: ${languageDescription}
9. Tone: ${toneDescription}
10. DIVERSITY: Each option must lead with a different selected aspect and have a different opening sentence.
11. Avoid repeating these past openings: ${JSON.stringify(avoidPhrases.slice(0, 10))}
12. Output NO markdown formatting outside the JSON, no backticks, no preamble. Return strictly the raw JSON object.`;

    let generatedOptions: string[] = [];
    let usedModelId: string | null = null;
    let usedModelLabel: string = "Synthesizer";

    // 6. Attempt execution through AI Model Manager with auto-failover
    try {
      const failoverResult = await executeWithFailover({
        businessId: business_id,
        system: systemPrompt,
        prompt: `Please generate ${suggestionsCount} distinct review drafts for ${biz.name} with ${stars} stars. Selected chips: ${[...products, ...aspects].join(", ")}. Length: ${targetLength}.`,
        maxTokens: 600,
        modelOverrideId: (config as any).model_override_id || null,
      });

      const cleaned = failoverResult.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.options) && parsed.options.length > 0) {
        generatedOptions = parsed.options.slice(0, suggestionsCount).map((s: any) => String(s).trim());
        usedModelId = failoverResult.modelId;
        usedModelLabel = failoverResult.modelLabel;
      }
    } catch (failoverErr: any) {
      // If no models exist or all fail, fall back to env ANTHROPIC_API_KEY exactly as before
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey && generatedOptions.length === 0) {
        try {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-5-5",
              max_tokens: 600,
              temperature: 0.75,
              system: systemPrompt,
              messages: [
                {
                  role: "user",
                  content: `Please generate ${suggestionsCount} distinct review drafts for ${biz.name} with ${stars} stars. Selected chips: ${[...products, ...aspects].join(", ")}. Length: ${targetLength}.`,
                },
              ],
            }),
          });

          if (response.ok) {
            const result = await response.json();
            const rawText = result.content?.[0]?.text || "";
            const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed.options) && parsed.options.length > 0) {
              generatedOptions = parsed.options.slice(0, suggestionsCount).map((s: any) => String(s).trim());
              usedModelLabel = "Claude Haiku (Env)";
            }
          }
        } catch (anthropicErr) {
          console.warn("Direct env fallback note (using synthesizer):", anthropicErr);
        }
      }
    }

    // 7. Fallback High-Quality Generator (ensures 100% uptime even if offline or keys unset)
    if (generatedOptions.length === 0) {
      generatedOptions = generateFallbackReviewOptions({
        bizName: biz.name,
        stars,
        products,
        aspects,
        targetLength,
        language,
        tone,
      }).slice(0, suggestionsCount);
    }

    // 8. Save each option to review_generations & log to Supabase if available
    const outputResults = [];
    const db = createAdminClient();

    for (const text of generatedOptions) {
      const genRecord = logReviewGeneration({
        business_id,
        tag_id: tag_id || null,
        stars,
        length: targetLength,
        language,
        option_ids: validOptionIds,
        output_text: text,
        ip_hash: ipHash,
      });

      outputResults.push({
        id: genRecord.id,
        text,
      });

      // Async write to Supabase if available
      if (db) {
        Promise.resolve(
          db.from("review_generations").insert({
            id: genRecord.id,
            business_id,
            tag_id: tag_id || null,
            stars,
            length: targetLength,
            language,
            option_ids: validOptionIds,
            output_text: text,
            ip_hash: ipHash,
            model_id: usedModelId || null,
          })
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      options: outputResults,
      model_label: usedModelLabel,
      config: {
        language,
        tone,
        length: targetLength,
        google_review_link: config.google_review_link || biz.review_url || "",
      },
    });

  } catch (err: any) {
    console.error("POST /api/review/generate error:", err);
    return NextResponse.json({ error: "Failed to generate review drafts. Please try again." }, { status: 500 });
  }
}

// Deterministic high-quality review option synthesizer
function generateFallbackReviewOptions(params: {
  bizName: string;
  stars: number;
  products: string[];
  aspects: string[];
  targetLength: ReviewLength;
  language: ReviewLanguage;
  tone: ReviewTone;
}): string[] {
  const { bizName, stars, products, aspects, targetLength, language } = params;
  const leadAspect = aspects[0] || "Fast Service";
  const secondAspect = aspects[1] || aspects[0] || "Cleanliness";
  const thirdAspect = aspects[2] || aspects[0] || "Polite Staff";
  const prodMention = products.length > 0 ? ` for ${products.join(" & ")}` : "";

  if (language === "hinglish") {
    if (stars >= 4) {
      return [
        `Visited ${bizName}${prodMention} recently and experience bohot hi accha raha. Particularly inka ${leadAspect.toLowerCase()} aur ${secondAspect.toLowerCase()} was truly impressive. Staff kafi cooperative tha, definitely recommend karunga.`,
        `Bahut hi shandar service at ${bizName}. Inka ${secondAspect.toLowerCase()} dekhkar dil khush ho gaya aur overall vibes bhi kafi positive thi. Five stars for the genuine quality!`,
        `Had a really nice visit at ${bizName}. What stood out most was their ${thirdAspect.toLowerCase()} and attentive staff. Will surely be coming back again.`
      ];
    } else if (stars === 3) {
      return [
        `Visited ${bizName} recently. The ${leadAspect.toLowerCase()} was decent, but overall experience average raha. The staff is polite though.`,
        `Average experience at ${bizName}. Their ${secondAspect.toLowerCase()} was okay, though there is scope for improvement.`,
        `Fair experience overall at ${bizName}. Good ${thirdAspect.toLowerCase()}, but expecting a bit more consistency next time.`
      ];
    } else {
      return [
        `Visited ${bizName} recently. Felt that their ${leadAspect.toLowerCase()} needs improvement to meet standard customer expectations.`,
        `Experience was somewhat disappointing at ${bizName}. Expected better ${secondAspect.toLowerCase()} based on feedback.`,
        `Visited for ${leadAspect.toLowerCase()}. Found things below expectation and hoping management takes note of service quality.`
      ];
    }
  }

  if (language === "gujarati_roman") {
    if (stars >= 4) {
      return [
        `Hale j ${bizName} ni mulakat lidhi${prodMention}. Emni ${leadAspect.toLowerCase()} ane ${secondAspect.toLowerCase()} khub j saras lagi. Staff no swabhav pan vinamra hato, jarur visit karva jevu che.`,
        `${bizName} pase thi khub j uttam anubhav malyo. Vishesh kari ne ${secondAspect.toLowerCase()} ane vyavastha prashansaniya che. Badha ne strongly recommend karu chu.`,
        `Khub j anand thayo ${bizName} aavi ne. Emnu ${thirdAspect.toLowerCase()} ane samaypalana ekdum perfect che. Khub abhar!`
      ];
    } else {
      return [
        `${bizName} ni mulakat lidhi. ${leadAspect.toLowerCase()} thodu sudharva jevu lagyu. Average experience rahyo.`,
        `Madhyam anubhav rahyo ${bizName} par. Emnu ${secondAspect.toLowerCase()} theek hatu, pan vadhare sudharo apekshit che.`,
        `${bizName} ma ${thirdAspect.toLowerCase()} ma thodi vadhare savdheni ane dhyan apvani jarur che.`
      ];
    }
  }

  // English standard
  if (stars >= 4) {
    if (targetLength === "short") {
      return [
        `Excellent experience at ${bizName}${prodMention}. Their ${leadAspect.toLowerCase()} and staff courtesy are truly commendable.`,
        `Had a wonderful visit to ${bizName}. Really appreciated their ${secondAspect.toLowerCase()} and prompt service.`,
        `Top notch quality and great ${thirdAspect.toLowerCase()} at ${bizName}. Highly recommended!`
      ];
    } else if (targetLength === "long") {
      return [
        `I recently had the pleasure of visiting ${bizName}${prodMention} and was thoroughly impressed from start to finish. Their attention to ${leadAspect.toLowerCase()} is clearly visible in how they handle customers. The team was extremely attentive and maintained high standards of ${secondAspect.toLowerCase()}. It is rare to find such consistent dedication and fair treatment. I will definitely be a returning customer and wholeheartedly recommend them.`,
        `Outstanding overall service provided by ${bizName}. From the moment we stepped in, their ${secondAspect.toLowerCase()} and pleasant atmosphere made a wonderful impression. The staff took time to address everything politely without any rush. Their ${thirdAspect.toLowerCase()} truly sets them apart from other places in the area. Truly deserving of a full five-star rating!`,
        `My experience at ${bizName} exceeded all expectations today. Every aspect, especially their ${thirdAspect.toLowerCase()} and seamless management, was handled with remarkable professionalism. It is wonderful to see a local business take such pride in their ${leadAspect.toLowerCase()}. A genuine thank you to the entire team for their courteous hospitality!`
      ];
    } else {
      return [
        `Had a wonderful experience at ${bizName}${prodMention}. Their ${leadAspect.toLowerCase()} was exceptional and the staff was polite and courteous throughout. Everything was handled seamlessly and promptly. Highly recommend them to anyone looking for quality service!`,
        `Really pleased with my visit to ${bizName}. What stood out the most was their ${secondAspect.toLowerCase()} and overall attention to detail. It is refreshing to see such dedication and prompt assistance. Will definitely be returning soon!`,
        `Great visit to ${bizName} today. The team took wonderful care of us and their ${thirdAspect.toLowerCase()} was top notch. Clean, organized, and very reliable service overall. Deserves full appreciation!`
      ];
    }
  } else if (stars === 3) {
    return [
      `Visited ${bizName} recently. The ${leadAspect.toLowerCase()} was fairly reasonable, though there remains room for smoother coordination. A standard and balanced visit overall.`,
      `Had an average visit to ${bizName}. While their ${secondAspect.toLowerCase()} was acceptable, some aspects felt a bit standard. Appreciated the courteous demeanor of the staff.`,
      `A mixed but fair experience at ${bizName}. The ${thirdAspect.toLowerCase()} was okay, though with slight adjustments in service speed it could be much better.`
    ];
  } else {
    return [
      `Visited ${bizName} recently. Found that their ${leadAspect.toLowerCase()} fell short of what was expected for the visit. Sharing this so management can look into improvements.`,
      `An underwhelming experience at ${bizName}. Specifically, the ${secondAspect.toLowerCase()} could be managed with much better care and attention.`,
      `Expected a higher standard at ${bizName}, particularly regarding their ${thirdAspect.toLowerCase()}. Hope they address these service aspects soon.`
    ];
  }
}
