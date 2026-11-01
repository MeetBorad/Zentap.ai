// app/api/card/reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyOwnerSessionToken, logPartnerAction } from "@/lib/ownerAccess";
import { resetTagCardFromOwner, createResetRequest } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, code, resetLevel } = body;

    if (!token || !code) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const cleanCode = code.toLowerCase().trim();
    const level: "off" | "needs_approval" | "direct" =
      resetLevel === "direct" ? "direct" : resetLevel === "needs_approval" ? "needs_approval" : "off";

    // Verify 15-minute session token
    const { valid, businessId } = verifyOwnerSessionToken(token, cleanCode);
    if (!valid) {
      return NextResponse.json({ error: "Session expired or invalid. Please re-authenticate." }, { status: 401 });
    }

    // Execute reset in businessStore
    const result = resetTagCardFromOwner(cleanCode, level);

    // If level is needs_approval, record a pending reset request for superadmin
    if (level === "needs_approval") {
      createResetRequest({
        tag_id: result.tag?.id || cleanCode,
        tag_code: cleanCode,
        partner_id: result.tag?.partner_id,
        business_id: businessId || result.business?.id,
        type: "card_reset",
        notes: "Card owner requested card release via owner panel (Pending Super Admin Approval)",
      });
    }

    // Sync to Supabase if DB available
    const db = createAdminClient();
    if (db) {
      try {
        if (level === "needs_approval") {
          await db.from("reset_requests").insert({
            tag_id: result.tag?.id,
            tag_code: cleanCode,
            partner_id: result.tag?.partner_id || null,
            business_id: businessId || result.business?.id || null,
            type: "card_reset",
            status: "pending",
            notes: "Card owner requested card release via owner panel",
          });
        }

        if (result.tag?.id) {
          const tagUpdates: any = {};
          if (level === "off") {
            tagUpdates.active = false;
          } else if (level === "direct") {
            tagUpdates.destination = "direct";
            tagUpdates.active = true;
          } else if (level === "needs_approval") {
            tagUpdates.active = false;
          }
          await db.from("tags").update(tagUpdates).eq("id", result.tag.id);
        }
        if (result.business?.id) {
          if (level === "off") {
            await db.from("businesses").update({ active: false }).eq("id", result.business.id);
          } else if (level === "direct") {
            await db.from("businesses").update({ redirect_mode: "direct_review", active: true }).eq("id", result.business.id);
          }
        }
      } catch (dbErr) {
        console.warn("DB reset error (using local store):", dbErr);
      }
    }

    // Log to partner_actions
    await logPartnerAction({
      tag_code: cleanCode,
      business_id: businessId || result.business?.id || null,
      action: "card_reset",
      details: { reset_level: level },
    });

    return NextResponse.json({
      success: true,
      resetLevel: level,
      tag: result.tag,
      business: result.business,
    });
  } catch (err) {
    console.warn("POST /api/card/reset error:", err);
    return NextResponse.json({ error: "Failed to reset card" }, { status: 500 });
  }
}
