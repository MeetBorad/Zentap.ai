import { NextRequest, NextResponse } from "next/server";
import { getBusinessBySlug, logScan, logEvent } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();
  const searchParams = request.nextUrl.searchParams;
  const source = (searchParams.get("s") as "qr" | "nfc") || "qr";

  let instagramUrl: string | null = null;
  let businessId: string | null = null;
  let isActive = true;
  let isDeleted = false;

  // 1. Fetch from Supabase
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, slug, instagram_url, active, is_deleted")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (!error && data) {
        businessId = data.id;
        instagramUrl = data.instagram_url || null;
        isActive = data.active;
        isDeleted = !!data.is_deleted;
      }
    } catch (err) {
      console.warn("Supabase lookup in /i route error:", err);
    }
  }

  // 2. Fallback to in-memory/demo store
  if (!businessId) {
    const fallbackBiz = getBusinessBySlug(cleanSlug);
    if (fallbackBiz) {
      businessId = fallbackBiz.id;
      instagramUrl = fallbackBiz.instagram_url || null;
      isActive = fallbackBiz.active;
      isDeleted = !!fallbackBiz.is_deleted;
    }
  }

  // 3. Unavailable or soft-deleted
  if (!businessId || !isActive || isDeleted) {
    return NextResponse.redirect(new URL(`/r/${slug}?unavailable=1`, request.url), 302);
  }

  // 4. Log telemetry scan & event
  if (supabase && businessId) {
    try {
      await supabase.from("events").insert([
        {
          business_id: businessId,
          type: "instagram_click",
          at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn("Could not log DB instagram_click event:", e);
    }
  }
  logScan(cleanSlug, source);
  logEvent(cleanSlug, "instagram_click" as any);

  // 5. If no Instagram configured, fallback to review page
  if (!instagramUrl) {
    return NextResponse.redirect(new URL(`/r/${slug}`, request.url), 302);
  }

  // 6. Format Instagram URL
  let targetUrl = instagramUrl.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    const handle = targetUrl.replace(/^@/, "");
    targetUrl = `https://instagram.com/${handle}`;
  }

  return NextResponse.redirect(targetUrl, 302);
}
