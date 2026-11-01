// src/app/api/review/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { submitPrivateFeedback } from "@/lib/reviewAssistantStore";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { business_id, stars, feedback_text, customer_name, customer_phone, tag_code } = body;

    if (!business_id || !stars || !feedback_text) {
      return NextResponse.json({ error: "Please enter feedback details." }, { status: 400 });
    }

    const recorded = submitPrivateFeedback({
      business_id,
      stars: Number(stars),
      feedback_text: String(feedback_text).trim(),
      customer_name: customer_name ? String(customer_name).trim() : undefined,
      customer_phone: customer_phone ? String(customer_phone).trim() : undefined,
      tag_code: tag_code ? String(tag_code).trim() : undefined,
    });

    // Sync to Supabase if available
    const db = createAdminClient();
    if (db) {
      Promise.resolve(
        db.from("private_feedback").insert({
          id: recorded.id,
          business_id,
          stars: recorded.stars,
          feedback_text: recorded.feedback_text,
          customer_name: recorded.customer_name,
          customer_phone: recorded.customer_phone,
          tag_code: recorded.tag_code,
        })
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      feedback: recorded,
      message: "Thank you for sharing your feedback directly with management.",
    });
  } catch (err: any) {
    console.error("POST /api/review/feedback error:", err);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
