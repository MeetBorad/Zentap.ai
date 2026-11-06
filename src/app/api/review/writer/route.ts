import { generateReviewSuggestions } from "@/services/reviewService";

export const dynamic = "force-dynamic";

const LENGTH_GUIDE: Record<string, string> = {
  short: "1-2 sentences",
  medium: "3-4 sentences",
  long: "5 or more sentences (about 6-7)",
  detailed: "5 or more sentences (about 6-7)",
};

interface ProviderConfig {
  name: string;
  label: string;
  url: string;
  key?: string;
  model: string;
}

function getProviders(): ProviderConfig[] {
  return [
    {
      name: "gemini",
      label: "Google Gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    },
    {
      name: "groq",
      label: "Groq AI",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    },
    {
      name: "cerebras",
      label: "Cerebras AI",
      url: "https://api.cerebras.ai/v1/chat/completions",
      key: process.env.CEREBRAS_API_KEY,
      model: process.env.CEREBRAS_MODEL || "llama-3.3-70b",
    },
    {
      name: "mistral",
      label: "Mistral AI",
      url: "https://api.mistral.ai/v1/chat/completions",
      key: process.env.MISTRAL_API_KEY,
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
    },
  ];
}

function buildPrompts(b: any) {
  const stars = b.stars || b.rating || 5;
  const lenKey = (b.length || "medium").toLowerCase();
  const highlightsList = Array.isArray(b.highlights)
    ? b.highlights
    : Array.isArray(b.chips)
    ? b.chips
    : Array.isArray(b.selectedTags)
    ? b.selectedTags
    : [];

  const noteText = b.note || b.notes || b.customNotes || b.voiceNotes || "";

  const system = `You help a real customer put their own experience into words for a Google review.
Rules:
- Use ONLY the highlights and note the customer gave. Never invent dishes, staff names, prices, or events.
- First person, natural, human. No hashtags, no emojis, no marketing slogans.
- Do not mention AI. Do not offer anything in exchange for the review.
- Match the tone of a ${stars} out of 5 rating.
- Length: ${LENGTH_GUIDE[lenKey] ?? LENGTH_GUIDE.medium}.
- Output only the review text.`;

  const prompt = `Business: ${b.businessName || "Local Business"} (${b.category ?? "local business"})
What stood out: ${highlightsList.slice(0, 3).join(", ") || "not specified"}
Customer's note: ${String(noteText).slice(0, 300) || "none"}
${b.variation ? `Use different wording from before (variation #${b.variation}).` : ""}`;

  return { system, prompt, stars, highlightsList, noteText };
}

async function generate(system: string, prompt: string): Promise<{ text: string; provider: string; model: string; label: string } | null> {
  const providers = getProviders();

  for (const p of providers) {
    if (!p.key) continue; // skip providers you haven't set up

    try {
      const res = await fetch(p.url, {
        method: "POST",
        signal: AbortSignal.timeout(6000), // don't let one slow provider hang the page
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${p.key}`,
        },
        body: JSON.stringify({
          model: p.model,
          max_tokens: 400,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        console.warn(`[ReviewWriter] ${p.name} responded with status ${res.status}`);
        continue; // 429 / 5xx -> try the next one
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) {
        return { text, provider: p.name, model: p.model, label: p.label };
      }
    } catch (err: any) {
      console.warn(`[ReviewWriter] ${p.name} failed:`, err?.message || err);
      /* timeout or network error -> next provider */
    }
  }

  return null; // caller falls back to templateReview
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const wantsJson = req.headers.get("accept")?.includes("application/json");
    const { system, prompt, stars, highlightsList, noteText } = buildPrompts(body);

    // 1. Run multi-provider waterfall
    const result = await generate(system, prompt);

    if (result?.text) {
      // Clean leading/trailing quotes or markdown backticks if returned
      const cleanText = result.text.replace(/^["'`]+|["'`]+$/g, "").trim();

      if (wantsJson) {
        return Response.json({
          text: cleanText,
          provider: result.provider,
          label: result.label,
          model: result.model,
          source: "cloud_llm",
        });
      }

      return new Response(cleanText, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Review-Provider": result.provider,
          "X-Review-Label": result.label,
          "X-Review-Model": result.model,
          "X-Review-Source": "cloud_llm",
        },
      });
    }

    // 2. High-availability fallback: if all providers are down/unset, use local template synthesizer
    console.info("[ReviewWriter] All cloud providers failed or unset. Using local templateReview fallback.");
    const fallbackList = generateReviewSuggestions({
      businessName: body.businessName || "this business",
      city: body.city || "Ahmedabad",
      rating: stars,
      selectedTags: highlightsList,
      customNotes: noteText,
      seed: Number(body.variation || body.seed || 0),
    });
    const fallbackText = fallbackList[0] || `Had a wonderful experience at ${body.businessName || "this store"}! Highly recommended.`;

    if (wantsJson) {
      return Response.json({
        text: fallbackText,
        provider: "synthesizer",
        label: "ZenTap Review Synthesizer",
        model: "smart-templates-v2",
        source: "synthesizer",
      });
    }

    return new Response(fallbackText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Review-Provider": "synthesizer",
        "X-Review-Label": "ZenTap Review Synthesizer",
        "X-Review-Model": "smart-templates-v2",
        "X-Review-Source": "synthesizer",
        "X-Review-Fallback": "synthesizer",
      },
    });
  } catch (e: any) {
    console.error("[ReviewWriter] Fatal error:", e);
    return new Response("Could not generate a review right now.", { status: 503 });
  }
}
