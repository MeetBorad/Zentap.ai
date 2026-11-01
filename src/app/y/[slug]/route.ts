import { NextRequest, NextResponse } from "next/server";
import { getBusinessBySlug, logScan } from "@/lib/businessStore";
import { getPageButtons } from "@/lib/hubDesignStore";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();
  const searchParams = request.nextUrl.searchParams;
  const source = (searchParams.get("s") as "qr" | "nfc") || "qr";

  let businessId: string | null = null;
  let youtubeUrl: string | null = null;

  // 1. Supabase check
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("businesses")
        .select("id, slug, is_deleted, active")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (data) {
        businessId = data.id;
        if (data.is_deleted || !data.active) {
          return NextResponse.redirect(new URL("/unavailable", request.url));
        }

        const { data: btnData } = await supabase
          .from("page_buttons")
          .select("url_or_value")
          .eq("business_id", data.id)
          .eq("type", "youtube")
          .maybeSingle();

        if (btnData?.url_or_value) {
          youtubeUrl = btnData.url_or_value;
        }
      }
    } catch (e) {
      console.warn("Supabase check error in /y/[slug]:", e);
    }
  }

  // 2. Local fallback
  if (!businessId) {
    const biz = getBusinessBySlug(cleanSlug);
    if (biz) {
      businessId = biz.id;
      if (biz.is_deleted || !biz.active) {
        return NextResponse.redirect(new URL("/unavailable", request.url));
      }
      const buttons = getPageButtons(biz.id);
      const ytBtn = buttons.find((b) => b.type === "youtube");
      if (ytBtn?.url_or_value) {
        youtubeUrl = ytBtn.url_or_value;
      }
    }
  }

  // Format destination URL
  let target = youtubeUrl ? youtubeUrl.trim() : `https://youtube.com/@${cleanSlug}`;
  if (!target.startsWith("http://") && !target.startsWith("https://")) {
    target = `https://${target}`;
  }

  // Log scan / click telemetry
  if (businessId) {
    try {
      logScan(businessId, source);
      if (supabase) {
        Promise.resolve(
          supabase.from("click_events").insert({
            business_id: businessId,
            button_type: "youtube",
            source,
          })
        ).catch(() => {});
      }
    } catch {}
  }

  return NextResponse.redirect(target, {
    status: 302,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
