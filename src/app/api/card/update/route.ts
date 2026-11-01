// app/api/card/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyOwnerSessionToken, logPartnerAction } from "@/lib/ownerAccess";
import { updateTagAndBusinessFromOwner } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, code, updates } = body;

    if (!token || !code || !updates) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const cleanCode = code.toLowerCase().trim();

    // Verify 15-minute session token
    const { valid, businessId, remainingMs } = verifyOwnerSessionToken(token, cleanCode);
    if (!valid) {
      return NextResponse.json({ error: "Session expired or invalid. Please re-authenticate." }, { status: 401 });
    }

    // Apply updates via businessStore
    const result = updateTagAndBusinessFromOwner(cleanCode, {
      name: updates.name,
      review_url: updates.review_url,
      whatsapp_number: updates.whatsapp_number,
      whatsapp_message: updates.whatsapp_message,
      instagram_handle: updates.instagram_handle,
    });

    // Sync to Supabase if DB available
    const db = createAdminClient();
    if (db) {
      try {
        if (result.business?.id) {
          await db.from("businesses").update({
            name: result.business.name,
            review_url: result.business.review_url,
            google_review_link: result.business.review_url,
            whatsapp_number: result.business.whatsapp_number,
            whatsapp_message: result.business.whatsapp_message,
            instagram_url: result.business.instagram_url,
          }).eq("id", result.business.id);
        }
        if (result.tag?.id) {
          await db.from("tags").update({
            whatsapp_number: result.tag.whatsapp_number,
            whatsapp_message: result.tag.whatsapp_message,
            instagram_handle: result.tag.instagram_handle,
          }).eq("id", result.tag.id);
        }
      } catch (dbErr) {
        console.warn("DB update error (using local store):", dbErr);
      }
    }

    // Log to partner_actions
    await logPartnerAction({
      tag_code: cleanCode,
      business_id: businessId || result.business?.id || null,
      action: "details_update",
      details: {
        updated_fields: Object.keys(updates),
      },
    });

    return NextResponse.json({
      success: true,
      tag: result.tag,
      business: result.business,
      sessionRemainingMs: remainingMs,
    });
  } catch (err) {
    console.warn("POST /api/card/update error:", err);
    return NextResponse.json({ error: "Failed to update details" }, { status: 500 });
  }
}
