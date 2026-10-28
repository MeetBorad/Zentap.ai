import { NextRequest, NextResponse } from "next/server";
import { getBusinessBySlug, logEvent } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();

  let reviewUrl: string | null = null;
  let isActive = true;
  let businessId: string | null = null;

  // 1. Try fetching from Supabase database
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, slug, review_url, active")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (!error && data) {
        businessId = data.id;
        reviewUrl = data.review_url;
        isActive = data.active;
      }
    } catch (err) {
      console.warn("Supabase lookup in /go route notice:", err);
    }
  }

  // 2. Fallback to in-memory/demo store if not resolved from DB
  if (!businessId) {
    const fallbackBiz = getBusinessBySlug(cleanSlug);
    if (fallbackBiz) {
      businessId = fallbackBiz.id;
      reviewUrl = fallbackBiz.review_url;
      isActive = fallbackBiz.active;
    }
  }

  // 3. If business not found or inactive, show unavailable
  if (!businessId || !isActive) {
    return NextResponse.redirect(new URL(`/r/${slug}?unavailable=1`, request.url), 302);
  }

  // 4. Log review_click event in Supabase and local store
  if (supabase && businessId) {
    try {
      await supabase.from("events").insert([
        {
          business_id: businessId,
          type: "review_click",
          at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn("Could not log DB review_click event:", e);
    }
  }
  logEvent(cleanSlug, "review_click");

  // 5. If review link is not yet configured, redirect back with pending notice
  if (!reviewUrl) {
    return NextResponse.redirect(new URL(`/r/${slug}?pending=1`, request.url), 302);
  }

  // 6. HTTP 302 Redirect directly to the business's Google Review URL
  return NextResponse.redirect(reviewUrl, 302);
}
