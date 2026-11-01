// src/app/api/hub/click/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logClickEvent } from "@/lib/hubDesignStore";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, button_type, source } = body;

    if (!business_id || !button_type) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const recorded = logClickEvent(business_id, button_type, (source as any) || "web");

    // Sync to Supabase if available
    const db = createAdminClient();
    if (db) {
      Promise.resolve(
        db.from("click_events").insert({
          id: recorded.id,
          business_id,
          button_type,
          source: (source as any) || "web",
        })
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, event: recorded });
  } catch (err: any) {
    console.error("POST /api/hub/click error:", err);
    return NextResponse.json({ error: "Failed to record click" }, { status: 500 });
  }
}
