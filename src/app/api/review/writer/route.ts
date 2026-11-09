// src/app/api/review/writer/route.ts
import { generateReviewSuggestions } from "@/services/reviewService";
import { callAI } from "@/lib/ai/router";

export const dynamic = "force-dynamic";

const LENGTH_GUIDE: Record<string, string> = {
  short: "1-2 sentences",
  medium: "3-4 sentences",
  long: "5 or more sentences (about 6-7)",
  detailed: "5 or more sentences (about 6-7)",
};

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

  const noteText = (b.note || b.customNotes || b.notes || "").trim();
  const lenDescription = LENGTH_GUIDE[lenKey] || "3-4 sentences";

  const system = `You are a real customer helping write an authentic, human Google review.
Output ONLY the review text. Do not wrap in quotes. Do not include titles, intros, or disclaimers.
Write in first person ("I" or "we"). Make it sound natural, warm, and authentic.
Tone must match ${stars} stars. Never invent specific prices, staff names, or dishes not mentioned by the customer.`;

  const parts: string[] = [
    `Business: ${b.businessName || "this store"}`,
    b.category ? `Category: ${b.category}` : "",
    `Rating: ${stars} / 5 stars`,
    highlightsList.length > 0 ? `Highlights experienced: ${highlightsList.join(", ")}` : "",
    noteText ? `Customer's own note: "${noteText}"` : "",
    `Length: exactly ${lenDescription}`,
  ].filter(Boolean);

  const prompt = `Write a genuine customer review based on these details:\n${parts.join("\n")}`;

  return { system, prompt, stars, highlightsList, noteText };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const wantsJson = req.headers.get("accept")?.includes("application/json");
    const { system, prompt, stars, highlightsList, noteText } = buildPrompts(body);

    try {
      // Execute through unified server-side AI router
      const aiRes = await callAI({
        task: "review_writer",
        system,
        prompt,
        maxTokens: 400,
        temperature: 0.75,
        timeoutMs: 10000,
      });

      const cleanText = aiRes.text.replace(/^["'`]+|["'`]+$/g, "").trim();

      if (wantsJson) {
        return Response.json({
          text: cleanText,
          model: aiRes.modelId,
          label: aiRes.modelLabel,
          latency_ms: aiRes.latencyMs,
          source: "cloud_llm",
        });
      }

      return new Response(cleanText, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Review-Model": aiRes.modelId,
          "X-Review-Label": aiRes.modelLabel,
          "X-Review-Source": "cloud_llm",
        },
      });
    } catch (aiErr: any) {
      console.warn("[ReviewWriter] AI Router failed, using fallback synthesizer:", aiErr.message);
    }

    // High-availability fallback: local template synthesizer
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
      },
    });
  } catch (e: any) {
    console.error("[ReviewWriter] Fatal error:", e);
    return new Response("Could not generate a review right now.", { status: 503 });
  }
}
