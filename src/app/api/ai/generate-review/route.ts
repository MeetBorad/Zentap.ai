import { NextRequest, NextResponse } from "next/server";

interface GenerateReviewRequest {
  businessName: string;
  category?: string;
  city?: string;
  rating?: number;
  chips?: string[];
  language?: "en" | "gu" | "hi";
  style?: "humanized" | "balanced" | "detailed" | "concise";
  voiceNotes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateReviewRequest = await req.json();
    const {
      businessName = "this store",
      category = "store",
      city = "",
      rating = 5,
      chips = [],
      language = "en",
      style = "humanized",
      voiceNotes = "",
    } = body;

    const loc = city ? ` in ${city}` : "";
    const highlights = chips.length > 0 ? chips.join(", ") : "their wonderful service";
    const voiceContext = voiceNotes.trim() ? ` ${voiceNotes.trim()}` : "";

    let draft_humanized = "";
    let draft_detailed = "";
    let draft_concise = "";

    // -------------------------------------------------------------------------
    // GUJARATI (ગુજરાતી)
    // -------------------------------------------------------------------------
    if (language === "gu") {
      draft_humanized = `ખરેખર ખૂબ જ સુંદર અનુભવ રહ્યો ${businessName}${loc} ખાતે! ${highlights} ની બાબતમાં એમનું કામ વખાણવા લાયક છે. સ્ટાફ એટલો મદદરૂપ અને નમ્ર છે કે ફરી આવવાનું મન થાય.${voiceContext ? ` ${voiceContext}` : ""} ચોક્કસ બધાને ભલામણ કરું છું! ⭐⭐⭐⭐⭐`;

      draft_detailed = `${businessName}${loc} ની મુલાકાત દરમિયાન બધી જ સુવિધાઓ અદ્ભુત જોવા મળી. ખાસ કરીને ${highlights} અને પારદર્શક વહીવટ ખૂબ જ પ્રભાવશાળી હતો. ગ્રાહકો પ્રત્યેની એમની કાળજી શ્રેષ્ઠ છે.${voiceContext ? ` નોંધ: ${voiceContext}` : ""} પૂરા 5 સ્ટાર મળવા જોઈએ.`;

      draft_concise = `${businessName} ખાતે સુપર સર્વિસ! ${highlights} શ્રેષ્ઠ છે. દરેક બાબતમાં ઉત્તમ! ⭐⭐⭐⭐⭐`;
    } 
    // -------------------------------------------------------------------------
    // HINDI (हिन्दी)
    // -------------------------------------------------------------------------
    else if (language === "hi") {
      draft_humanized = `${businessName}${loc} में हमारा अनुभव सच में बेहद दिल छू लेने वाला रहा! खासकर ${highlights} ने हमें बहुत प्रभावित किया। यहां का स्टाफ बहुत विनम्र और ईमानदार है।${voiceContext ? ` ${voiceContext}` : ""} मेरी तरफ से पूरे 5 स्टार, सभी को जरूर आना चाहिए! ⭐⭐⭐⭐⭐`;

      draft_detailed = `${businessName}${loc} की सेवाएं वाकई बहुत ही उच्च कोटि की हैं। ${highlights} से लेकर कस्टमर केयर तक सब कुछ बहुत पेशेवर था। शुद्धता, पारदर्शिता और समयबद्धता के लिए यह जगह सबसे भरोसेमंद है।${voiceContext ? ` अतिरिक्त अनुभव: ${voiceContext}` : ""} अत्यंत अनुशंसित!`;

      draft_concise = `${businessName} की उत्कृष्ट सेवा और ${highlights}! बहुत ही संतुष्ट। 5 स्टार! ⭐⭐⭐⭐⭐`;
    } 
    // -------------------------------------------------------------------------
    // ENGLISH
    // -------------------------------------------------------------------------
    else {
      draft_humanized = `Had such a genuine, wonderful visit to ${businessName}${loc}! What really stood out was their ${highlights} — you can immediately tell they care about their customers. The team was warm, welcoming, and super attentive.${voiceContext ? ` ${voiceContext}` : ""} Highly recommended to anyone looking for top quality! ⭐⭐⭐⭐⭐`;

      draft_detailed = `I recently visited ${businessName}${loc} and was thoroughly impressed across the board. In particular, ${highlights} exceeded all expectations. Everything was handled with complete transparency, promptness, and professional courtesy.${voiceContext ? ` Special note: ${voiceContext}` : ""} An undisputed 5-star experience!`;

      draft_concise = `Superb experience at ${businessName}! Outstanding ${highlights} and courteous service. Highly recommended! ⭐⭐⭐⭐⭐`;
    }

    // Select primary draft based on requested style
    let primary = draft_humanized;
    if (style === "detailed") primary = draft_detailed;
    else if (style === "concise") primary = draft_concise;

    return NextResponse.json({
      success: true,
      primary,
      drafts: {
        humanized: draft_humanized,
        detailed: draft_detailed,
        concise: draft_concise,
      },
      metadata: {
        language,
        style,
        businessName,
        rating,
        chipsCount: chips.length,
        hasVoiceNotes: Boolean(voiceNotes.trim()),
      },
    });
  } catch (error: any) {
    console.error("AI review generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate review drafts",
      },
      { status: 500 }
    );
  }
}
