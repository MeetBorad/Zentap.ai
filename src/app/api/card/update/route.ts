// app/api/card/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyOwnerSessionToken, logPartnerAction } from "@/lib/ownerAccess";
import { updateTagAndBusinessFromOwner } from "@/lib/businessStore";
import { updateClient } from "@/lib/adminPlatformStore";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateCachedTag } from "@/lib/tagCache";

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
      review_url: updates.google_review_link || updates.review_url,
      whatsapp_number: updates.whatsapp_number,
      whatsapp_message: updates.whatsapp_message,
      instagram_handle: updates.instagram_handle || updates.instagram_url,
    });

    const db = createAdminClient();
    let targetBid = businessId || result.business?.id || cleanCode.toUpperCase();
    if (cleanCode === "st3" || cleanCode === "zentap" || targetBid === "ST3" || targetBid === "ZENTAP") {
      targetBid = "ZT-0004";
    }

    if (db) {
      try {
        // 1. Sync to clients table (Source of Truth)
        let existingClient: any = null;
        const { data: cData } = await db
          .from("clients")
          .select("*")
          .or(`business_id.ilike.${cleanCode},business_id.ilike.${targetBid},id.ilike.${cleanCode},id.ilike.${targetBid}`)
          .is("deleted_at", null)
          .maybeSingle();
        existingClient = cData;

        if (!existingClient) {
          const { data: tRow } = await db
            .from("qr_nfc_tags")
            .select("business_id")
            .ilike("tag_id", cleanCode)
            .is("deleted_at", null)
            .maybeSingle();
          if (tRow?.business_id) {
            const { data: linkedC } = await db
              .from("clients")
              .select("*")
              .ilike("business_id", tRow.business_id)
              .is("deleted_at", null)
              .maybeSingle();
            if (linkedC) {
              existingClient = linkedC;
              targetBid = linkedC.business_id;
            }
          }
        }

        if (existingClient) {
          const clientUpdates: any = {
            updated_at: new Date().toISOString(),
          };
          if (updates.name) clientUpdates.business_name = updates.name.trim();
          if (updates.city) clientUpdates.city = updates.city.trim();
          if (updates.owner_name) clientUpdates.owner_name = updates.owner_name.trim();
          if (updates.phone) clientUpdates.owner_phone = updates.phone.trim();
          if (updates.whatsapp_number) clientUpdates.whatsapp = updates.whatsapp_number.trim();
          if (updates.google_review_link || updates.review_url) {
            clientUpdates.google_review_link = (updates.google_review_link || updates.review_url).trim();
          }
          if (updates.instagram_handle || updates.instagram_url) {
            clientUpdates.instagram_link = (updates.instagram_handle || updates.instagram_url).trim();
          }
          if (updates.facebook_link || updates.facebook_url) {
            clientUpdates.facebook_link = (updates.facebook_link || updates.facebook_url).trim();
          }

          const customFields = existingClient.custom_fields || {};
          if (updates.website) customFields.website = updates.website.trim();
          if (updates.address) customFields.directions = updates.address.trim();
          if (updates.category) customFields.category = updates.category.trim();
          clientUpdates.custom_fields = customFields;

          await db.from("clients").update(clientUpdates).eq("id", existingClient.id);
          try {
            updateClient(existingClient.business_id || targetBid, clientUpdates);
          } catch {}
        }

        // 2. Sync to page_editor_configs table
        const { data: existingPage } = await db
          .from("page_editor_configs")
          .select("*")
          .or(`tag_id.ilike.${cleanCode},business_id.eq.${targetBid},tag_id.ilike.st3`)
          .is("deleted_at", null)
          .maybeSingle();

        if (existingPage) {
          const cfg = existingPage.config_data || {};
          if (updates.name) cfg.title = updates.name.trim();
          if (updates.city) cfg.city = updates.city.trim();
          if (updates.phone) cfg.phone = updates.phone.trim();
          if (updates.whatsapp_number) cfg.whatsapp = updates.whatsapp_number.trim();
          if (updates.google_review_link || updates.review_url) {
            cfg.google_link = (updates.google_review_link || updates.review_url).trim();
          }
          if (updates.instagram_handle || updates.instagram_url) {
            cfg.instagram = (updates.instagram_handle || updates.instagram_url).trim();
          }
          if (updates.facebook_link || updates.facebook_url) {
            cfg.facebook = (updates.facebook_link || updates.facebook_url).trim();
          }
          if (updates.website) cfg.website = updates.website.trim();
          if (updates.address) cfg.address = updates.address.trim();
          if (updates.category) cfg.category = updates.category.trim();

          const pageUpdates: any = {
            config_data: cfg,
            updated_at: new Date().toISOString(),
          };
          if (updates.name) pageUpdates.title = updates.name.trim();
          if (updates.phone) pageUpdates.phone = updates.phone.trim();
          if (updates.whatsapp_number) pageUpdates.whatsapp = updates.whatsapp_number.trim();
          if (updates.google_review_link || updates.review_url) {
            pageUpdates.google_link = (updates.google_review_link || updates.review_url).trim();
          }
          if (updates.instagram_handle || updates.instagram_url) {
            pageUpdates.instagram = (updates.instagram_handle || updates.instagram_url).trim();
          }
          if (updates.facebook_link || updates.facebook_url) {
            pageUpdates.facebook = (updates.facebook_link || updates.facebook_url).trim();
          }

          await db.from("page_editor_configs").update(pageUpdates).eq("id", existingPage.id);
        }

        // 3. Sync to businesses table
        if (result.business?.id) {
          const bizUpdates: any = {
            updated_at: new Date().toISOString(),
          };
          if (updates.name) bizUpdates.name = updates.name.trim();
          if (updates.city) bizUpdates.city = updates.city.trim();
          if (updates.phone) bizUpdates.phone = updates.phone.trim();
          if (updates.whatsapp_number) {
            bizUpdates.whatsapp_number = updates.whatsapp_number.trim();
            bizUpdates.whatsapp = updates.whatsapp_number.trim();
          }
          if (updates.whatsapp_message) bizUpdates.whatsapp_message = updates.whatsapp_message.trim();
          if (updates.google_review_link || updates.review_url) {
            const grUrl = (updates.google_review_link || updates.review_url).trim();
            bizUpdates.review_url = grUrl;
            bizUpdates.google_review_link = grUrl;
          }
          if (updates.instagram_handle || updates.instagram_url) {
            bizUpdates.instagram_url = (updates.instagram_handle || updates.instagram_url).trim();
          }

          await db.from("businesses").update(bizUpdates).eq("id", result.business.id);
        }

        // 4. Invalidate Edge & Server Tag Cache
        invalidateCachedTag(cleanCode);
        if (targetBid) invalidateCachedTag(targetBid);
        invalidateCachedTag("st3");
        invalidateCachedTag("zentap");
      } catch (dbErr) {
        console.warn("DB update error (using local store):", dbErr);
      }
    }

    // Log to partner_actions
    await logPartnerAction({
      tag_code: cleanCode,
      business_id: targetBid,
      action: "details_update",
      details: {
        updated_fields: Object.keys(updates),
      },
    });

    return NextResponse.json({
      success: true,
      tag: result.tag,
      business: {
        ...result.business,
        ...updates,
      },
      sessionRemainingMs: remainingMs,
    });
  } catch (err) {
    console.warn("POST /api/card/update error:", err);
    return NextResponse.json({ error: "Failed to update details" }, { status: 500 });
  }
}

