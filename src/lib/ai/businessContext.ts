// src/lib/ai/businessContext.ts
// Business Context Engine: Multi-source context retrieval (Owner -> Website -> Gemini Grounding),
// 7-day TTL caching in Supabase table `business_context`, and strict privacy/anti-hallucination guardrails.

import { callAI } from "@/lib/ai/router";
import { createAdminClient } from "@/lib/supabase/admin";

export interface BusinessContextData {
  business_name: string;
  category: string;
  area: string;
  services: string[];
  keywords: string[];
  website_url?: string;
  source: "owner" | "website" | "grounding" | "none";
  sources_used: Array<"owner" | "website" | "grounding">;
  confidence: "high" | "medium" | "low";
  refreshed_at: string;
}

// In-memory cache fallback (business_id -> { data, expiresAt })
const inMemoryContextCache = new Map<string, { data: BusinessContextData; expiresAt: number }>();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Blocklist to ensure we NEVER scrape search engines, Google Maps, or social platforms
const DISALLOWED_DOMAINS = [
  "google.com",
  "google.co.in",
  "g.page",
  "maps.app.goo.gl",
  "search.google.com",
  "facebook.com",
  "fb.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
];

function isSafeWebsiteUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    for (const bad of DISALLOWED_DOMAINS) {
      if (hostname === bad || hostname.endsWith(`.${bad}`)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Strips HTML tags, scripts, styles, and extra whitespace to keep under 200KB.
 */
function cleanHtmlContent(rawHtml: string): string {
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks robots.txt (with 2-second timeout). Respects Disallow: /
 */
async function checkRobotsPermission(baseUrl: string): Promise<boolean> {
  try {
    const parsed = new URL(baseUrl);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;
    const res = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(2000),
      headers: { "User-Agent": "ZenTapBot/1.0" },
    });
    if (res.ok) {
      const text = await res.text();
      // Simple standard check: if User-agent: * has Disallow: /
      const lines = text.split("\n").map((l) => l.trim().toLowerCase());
      let inWildcardBlock = false;
      for (const line of lines) {
        if (line.startsWith("user-agent:")) {
          inWildcardBlock = line.includes("*");
        } else if (inWildcardBlock && line === "disallow: /") {
          return false;
        }
      }
    }
    return true;
  } catch {
    // If robots.txt times out or doesn't exist, proceed safely
    return true;
  }
}

/**
 * Source (b): Fetches the business's own website (homepage + about/services page).
 * Max 5s timeout per request, max 200KB body limit. Never throws.
 */
export async function fetchWebsiteText(websiteUrl: string): Promise<string | null> {
  let targetUrl = websiteUrl.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  if (!isSafeWebsiteUrl(targetUrl)) {
    return null;
  }

  try {
    const isAllowed = await checkRobotsPermission(targetUrl);
    if (!isAllowed) {
      console.info(`[BusinessContext] robots.txt disallows scraping for ${targetUrl}`);
      return null;
    }

    // 1. Fetch Homepage
    const homeRes = await fetch(targetUrl, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "ZenTapReviewAssistant/1.0 (+https://www.zentapdigitalsolutions.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!homeRes.ok) return null;

    const rawHomeText = (await homeRes.text()).slice(0, 200000); // 200KB limit
    const cleanedHome = cleanHtmlContent(rawHomeText);

    // 2. Discover About or Services link
    let secondaryText = "";
    try {
      const linkMatches = Array.from(rawHomeText.matchAll(/href=["'](\/[^"']*(?:about|services|service|menu|products)[^"']*)["']/gi));
      if (linkMatches.length > 0 && linkMatches[0][1]) {
        const subpath = linkMatches[0][1];
        const subUrl = new URL(subpath, targetUrl).toString();

        if (isSafeWebsiteUrl(subUrl)) {
          const subRes = await fetch(subUrl, {
            signal: AbortSignal.timeout(4000),
            headers: { "User-Agent": "ZenTapReviewAssistant/1.0" },
          });
          if (subRes.ok) {
            const rawSub = (await subRes.text()).slice(0, 150000);
            secondaryText = cleanHtmlContent(rawSub);
          }
        }
      }
    } catch {}

    const combined = `${cleanedHome}\n\n${secondaryText}`.trim();
    return combined.slice(0, 30000); // Max 30k characters for model context
  } catch (err: any) {
    console.warn(`[BusinessContext] Website fetch aborted/failed for ${targetUrl}:`, err.message);
    return null;
  }
}

/**
 * Extracts structured business info from raw website text using callAI.
 */
export async function extractDetailsFromWebsite(websiteUrl: string): Promise<Partial<BusinessContextData> | null> {
  const pageText = await fetchWebsiteText(websiteUrl);
  if (!pageText || pageText.length < 50) return null;

  try {
    const aiRes = await callAI({
      task: "extract_business_context",
      system: `You are an expert business context analyzer.
Extract the structured business identity from the provided website text.
Output STRICTLY valid JSON with this exact shape:
{
  "business_name": "Exact brand name with correct capitalization",
  "category": "Main business category (e.g. Italian Restaurant, Dental Clinic, IT Solutions)",
  "area": "Locality or city if mentioned, or empty string",
  "services": ["service 1", "service 2", "service 3"],
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4"]
}
RULES:
1. Extract ONLY products and services explicitly named on the page. Never invent items.
2. Keep the exact spelling of proper nouns.
3. 3 to 5 keywords maximum.
4. Output NO markdown formatting outside the JSON object.`,
      prompt: `Website content:\n${pageText.slice(0, 8000)}`,
      json: true,
      maxTokens: 500,
      temperature: 0.1,
      timeoutMs: 10000,
    });

    const parsed = aiRes.data || (typeof aiRes.text === "string" ? JSON.parse(aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim()) : null);

    if (parsed && typeof parsed === "object") {
      return {
        business_name: String(parsed.business_name || "").trim(),
        category: String(parsed.category || "").trim(),
        area: String(parsed.area || "").trim(),
        services: Array.isArray(parsed.services) ? parsed.services.map((s: any) => String(s).trim()).filter(Boolean) : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map((k: any) => String(k).trim()).filter(Boolean) : [],
        website_url: websiteUrl,
      };
    }
  } catch (err: any) {
    console.warn("[BusinessContext] AI website extraction error:", err.message);
  }
  return null;
}

/**
 * Source (c): Gemini Grounding with Google Search (low confidence, category/area/services only).
 * Uses existing GEMINI_API_KEY. Never throws.
 */
async function runGeminiGrounding(businessName: string, areaHint: string): Promise<Partial<BusinessContextData> | null> {
  try {
    const aiRes = await callAI({
      task: "grounding_context",
      system: `You are a business lookup assistant. Use Google Search grounding to confirm ONLY:
1. Primary category
2. Area / locality
3. 2-3 core services offered.
Output strictly JSON:
{
  "category": "...",
  "area": "...",
  "services": ["..."]
}`,
      prompt: `Find the general category, locality, and main services of the local business: "${businessName}" located in "${areaHint || "India"}".`,
      searchGrounding: true,
      json: true,
      maxTokens: 300,
      temperature: 0.2,
      timeoutMs: 7000,
    });

    const parsed = aiRes.data || (typeof aiRes.text === "string" ? JSON.parse(aiRes.text.replace(/```json/gi, "").replace(/```/g, "").trim()) : null);
    if (parsed && typeof parsed === "object") {
      return {
        category: String(parsed.category || "").trim(),
        area: String(parsed.area || "").trim(),
        services: Array.isArray(parsed.services) ? parsed.services.map((s: any) => String(s).trim()).filter(Boolean) : [],
      };
    }
  } catch (err: any) {
    console.warn("[BusinessContext] Gemini grounding skipped/failed:", err.message);
  }
  return null;
}

/**
 * Loads cached business context from Supabase table `business_context` or memory.
 */
async function loadCachedContext(businessId: string): Promise<BusinessContextData | null> {
  const cleanId = businessId.toLowerCase().trim();

  // 1. In-memory cache check
  const mem = inMemoryContextCache.get(cleanId);
  if (mem && mem.expiresAt > Date.now()) {
    return mem.data;
  }

  // 2. Supabase table check
  const db = createAdminClient();
  if (db) {
    try {
      const { data, error } = await db
        .from("business_context")
        .select("*")
        .ilike("business_id", cleanId)
        .maybeSingle();

      if (!error && data && data.context_data) {
        const refreshedAt = new Date(data.refreshed_at || data.created_at || Date.now()).getTime();
        if (Date.now() - refreshedAt < SEVEN_DAYS_MS) {
          const cachedData: BusinessContextData = {
            ...data.context_data,
            refreshed_at: data.refreshed_at || new Date().toISOString(),
            sources_used: data.sources_used || ["owner"],
          };
          inMemoryContextCache.set(cleanId, {
            data: cachedData,
            expiresAt: refreshedAt + SEVEN_DAYS_MS,
          });
          return cachedData;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Saves context to Supabase table `business_context` & in-memory cache.
 */
async function saveCachedContext(businessId: string, context: BusinessContextData) {
  const cleanId = businessId.toLowerCase().trim();

  // Save to in-memory map
  inMemoryContextCache.set(cleanId, {
    data: context,
    expiresAt: Date.now() + SEVEN_DAYS_MS,
  });

  // Save to Supabase (non-blocking)
  const db = createAdminClient();
  if (db) {
    try {
      Promise.resolve(
        db.from("business_context").upsert({
          business_id: cleanId,
          context_data: context,
          sources_used: context.sources_used,
          refreshed_at: new Date().toISOString(),
        })
      ).catch(() => {});
    } catch {}
  }
}

/**
 * Main function: getOrBuildBusinessContext
 * Builds or fetches business context in exact priority order:
 * a) Owner-entered info (highest priority, always overrides anything fetched)
 * b) Business's own website (if URL saved)
 * c) Gemini Search Grounding (if a & b are empty and Gemini is active)
 *
 * Caches in `business_context` (7-day TTL). Never blocks review generation.
 */
export async function getOrBuildBusinessContext(
  businessId: string,
  rawProfile: {
    name?: string;
    category?: string;
    area?: string;
    city?: string;
    services?: string[] | string;
    keywords?: string[] | string;
    website_url?: string;
    custom_fields?: any;
  },
  forceRefresh = false
): Promise<BusinessContextData> {
  const cleanId = (businessId || "zentap").toLowerCase().trim();

  // 1. Check cache unless forceRefresh is true
  if (!forceRefresh) {
    const cached = await loadCachedContext(cleanId);
    if (cached) {
      return cached;
    }
  }

  const sourcesUsed: Array<"owner" | "website" | "grounding"> = [];

  // Parse owner-entered fields (Priority a)
  const cf = rawProfile.custom_fields || {};
  const ownerName = (rawProfile.name || cf.business_name || "").trim();
  const ownerCategory = (rawProfile.category || cf.category || cf.subtitle || "").trim();
  const ownerArea = (rawProfile.area || cf.area || rawProfile.city || cf.city || cf.address || "Ahmedabad").trim();
  const ownerWebsite = (rawProfile.website_url || cf.website_url || cf.website || "").trim();

  let ownerServices: string[] = [];
  if (Array.isArray(rawProfile.services)) {
    ownerServices = rawProfile.services.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof rawProfile.services === "string" && rawProfile.services.trim()) {
    ownerServices = rawProfile.services.split(/[•|,]/).map((s) => s.trim()).filter(Boolean);
  } else if (Array.isArray(cf.services)) {
    ownerServices = cf.services.map((s: any) => String(s).trim()).filter(Boolean);
  } else if (typeof cf.services === "string" && cf.services.trim()) {
    ownerServices = cf.services.split(/[•|,]/).map((s: string) => s.trim()).filter(Boolean);
  }

  let ownerKeywords: string[] = [];
  if (Array.isArray(rawProfile.keywords)) {
    ownerKeywords = rawProfile.keywords.map((k) => String(k).trim()).filter(Boolean);
  } else if (typeof rawProfile.keywords === "string" && rawProfile.keywords.trim()) {
    ownerKeywords = rawProfile.keywords.split(/[•|,]/).map((k) => k.trim()).filter(Boolean);
  } else if (Array.isArray(cf.keywords)) {
    ownerKeywords = cf.keywords.map((k: any) => String(k).trim()).filter(Boolean);
  } else if (typeof cf.keywords === "string" && cf.keywords.trim()) {
    ownerKeywords = cf.keywords.split(/[•|,]/).map((k: string) => k.trim()).filter(Boolean);
  }

  if (ownerName || ownerCategory || ownerServices.length > 0) {
    sourcesUsed.push("owner");
  }

  let finalName = ownerName || "ZenTap Digital Solutions";
  let finalCategory = ownerCategory;
  let finalArea = ownerArea;
  let finalServices = [...ownerServices];
  let finalKeywords = [...ownerKeywords];
  let confidence: "high" | "medium" | "low" = "high";

  // Priority b: Fetch website if URL is saved and we need services/keywords/category
  if (ownerWebsite && isSafeWebsiteUrl(ownerWebsite) && (finalServices.length === 0 || !finalCategory)) {
    const webDetails = await extractDetailsFromWebsite(ownerWebsite);
    if (webDetails) {
      sourcesUsed.push("website");
      // Owner-entered info ALWAYS overrides fetched website values
      if (!finalCategory && webDetails.category) finalCategory = webDetails.category;
      if (!finalArea && webDetails.area) finalArea = webDetails.area;
      if (webDetails.services && webDetails.services.length > 0) {
        finalServices = Array.from(new Set([...finalServices, ...webDetails.services]));
      }
      if (webDetails.keywords && webDetails.keywords.length > 0) {
        finalKeywords = Array.from(new Set([...finalKeywords, ...webDetails.keywords]));
      }
      confidence = "high";
    }
  }

  // Priority c: Web Grounding (only if (a) and (b) are completely empty)
  if (!finalCategory && finalServices.length === 0 && !ownerWebsite) {
    const grounded = await runGeminiGrounding(finalName, finalArea);
    if (grounded) {
      sourcesUsed.push("grounding");
      if (!finalCategory && grounded.category) finalCategory = grounded.category;
      if (!finalArea && grounded.area) finalArea = grounded.area;
      if (grounded.services && grounded.services.length > 0) {
        finalServices = Array.from(new Set([...finalServices, ...grounded.services]));
      }
      confidence = "low"; // Low confidence as required
    }
  }

  const primarySource: "owner" | "website" | "grounding" | "none" =
    sourcesUsed[0] || "none";

  const result: BusinessContextData = {
    business_name: finalName,
    category: finalCategory || "Service",
    area: finalArea || "Ahmedabad",
    services: finalServices.slice(0, 10),
    keywords: finalKeywords.slice(0, 5),
    website_url: ownerWebsite || undefined,
    source: primarySource,
    sources_used: sourcesUsed,
    confidence,
    refreshed_at: new Date().toISOString(),
  };

  // Cache in Supabase and memory (non-blocking)
  saveCachedContext(cleanId, result);

  return result;
}

