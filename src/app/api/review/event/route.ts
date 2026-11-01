// src/app/api/review/event/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logReviewEvent, ReviewEventType } from "@/lib/reviewAssistantStore";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, event, generation_id } = body;

    if (!business_id || !event || (event !== "copied" && event !== "opened_google")) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const recorded = logReviewEvent(business_id, event as ReviewEventType, generation_id);

    // Sync to Supabase if available
    const db = createAdminClient();
    if (db) {
      Promise.resolve(
        db.from("review_events").insert({
          id: recorded.id,
          business_id,
          generation_id: generation_id || null,
          event,
        })
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, event: recorded });
  } catch (err: any) {
    console.error("POST /api/review/event error:", err);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
