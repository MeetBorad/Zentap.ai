// src/app/api/review/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { submitPrivateFeedback } from "@/lib/reviewAssistantStore";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyFounderNegativeFeedback } from "@/lib/telegram";

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

    const db = createAdminClient();
    let ownerName = "";
    let ownerPhone = "";
    let resolvedBizName = recorded.business_name;

    if (db) {
      try {
        const cleanBid = String(business_id).trim();
        // 1. Try matching client by business_id or id
        let { data: client } = await db
          .from("clients")
          .select("business_name, owner_name, owner_phone, whatsapp")
          .or(`business_id.ilike.${cleanBid},id.eq.${cleanBid}`)
          .maybeSingle();

        // 2. If not matched, check if it's a tag_code (e.g. ST1, ST3)
        if (!client && (tag_code || cleanBid)) {
          const targetTag = (tag_code || cleanBid).trim();
          const { data: tagRow } = await db
            .from("qr_nfc_tags")
            .select("business_id, business_name")
            .ilike("tag_id", targetTag)
            .maybeSingle();

          if (tagRow?.business_id) {
            const { data: matchedClient } = await db
              .from("clients")
              .select("business_name, owner_name, owner_phone, whatsapp")
              .eq("business_id", tagRow.business_id)
              .maybeSingle();
            if (matchedClient) client = matchedClient;
          }
        }

        if (client) {
          if (client.business_name) resolvedBizName = client.business_name;
          ownerName = client.owner_name || "";
          ownerPhone = client.owner_phone || client.whatsapp || "";
        }
      } catch (lookupErr) {
        console.warn("Client owner lookup notice:", lookupErr);
      }
    }

    // Notify founder & management immediately via Telegram with 1-tap WhatsApp to Store Owner
    notifyFounderNegativeFeedback({
      business_id,
      business_name: resolvedBizName,
      owner_name: ownerName,
      owner_phone: ownerPhone,
      stars: recorded.stars,
      feedback_text: recorded.feedback_text,
      customer_name: recorded.customer_name || undefined,
      customer_phone: recorded.customer_phone || undefined,
      tag_code: recorded.tag_code || undefined,
      created_at: recorded.created_at,
    }).catch((err) => console.warn("Failed to dispatch negative feedback alert:", err));

    // Sync to Supabase if available
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
      ).catch(() => { });
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
