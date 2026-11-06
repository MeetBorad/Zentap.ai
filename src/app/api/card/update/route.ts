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

    const cleanCode = (code || "").toLowerCase().trim();

    // Verify 15-minute session token
    const { valid, businessId: tokenBizId, tagCode: tokenTagCode, remainingMs } = verifyOwnerSessionToken(token, cleanCode);
    if (!valid) {
      return NextResponse.json({ error: "Session expired or invalid. Please re-authenticate." }, { status: 401 });
    }

    // Apply updates via businessStore
    const result = updateTagAndBusinessFromOwner(cleanCode || tokenTagCode || "st3", {
      name: updates.name,
      review_url: updates.google_review_link || updates.review_url,
      whatsapp_number: updates.whatsapp_number,
      whatsapp_message: updates.whatsapp_message,
      instagram_handle: updates.instagram_handle || updates.instagram_url,
    });

    const db = createAdminClient();
    const effectiveTagCode = tokenTagCode || cleanCode || "st3";
    let targetBid = tokenBizId || cleanCode.toUpperCase();
    if (effectiveTagCode === "st3" || effectiveTagCode === "zentap" || targetBid === "ST3" || targetBid === "ZENTAP" || cleanCode === "st3") {
      targetBid = "ZT-0004";
    }

    if (db) {
      try {
        // 1. Sync to clients table (Master Source of Truth)
        let existingClient: any = null;
        const candidateIds = Array.from(new Set([cleanCode, targetBid, tokenBizId, tokenTagCode, "ZT-0004"].filter(Boolean)));
        const orFilter = candidateIds.map((id) => `business_id.ilike.${id},id.ilike.${id}`).join(",");
        
        const { data: cData } = await db
          .from("clients")
          .select("*")
          .or(orFilter)
          .is("deleted_at", null)
          .maybeSingle();
        existingClient = cData;

        if (!existingClient) {
          const { data: tRow } = await db
            .from("qr_nfc_tags")
            .select("business_id")
            .ilike("tag_id", effectiveTagCode)
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
          if (updates.name !== undefined) clientUpdates.business_name = updates.name.trim();
          if (updates.city !== undefined) clientUpdates.city = updates.city.trim();
          if (updates.owner_name !== undefined) clientUpdates.owner_name = updates.owner_name.trim();
          if (updates.phone !== undefined) clientUpdates.owner_phone = updates.phone.trim();
          if (updates.whatsapp_number !== undefined) clientUpdates.whatsapp = updates.whatsapp_number.trim();
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
          if (updates.website !== undefined) customFields.website = updates.website.trim();
          if (updates.address !== undefined) customFields.directions = updates.address.trim();
          if (updates.category !== undefined) customFields.category = updates.category.trim();
          clientUpdates.custom_fields = customFields;

          const { error: cErr } = await db.from("clients").update(clientUpdates).eq("id", existingClient.id);
          if (cErr) {
            console.error("clients update error:", cErr);
          }
          try {
            updateClient(existingClient.business_id || targetBid, clientUpdates);
          } catch {}
        }

        // 2. Sync to page_editor_configs table
        const pageSearch = Array.from(new Set([effectiveTagCode, cleanCode, targetBid, "st3", "ZT-0004"].filter(Boolean)));
        const pageFilter = pageSearch.map((id) => `tag_id.ilike.${id},business_id.ilike.${id}`).join(",");
        const { data: existingPage } = await db
          .from("page_editor_configs")
          .select("*")
          .or(pageFilter)
          .is("deleted_at", null)
          .maybeSingle();

        if (existingPage) {
          const cfg = existingPage.config_data || {};
          if (updates.name !== undefined) cfg.title = updates.name.trim();
          if (updates.city !== undefined) cfg.city = updates.city.trim();
          if (updates.phone !== undefined) cfg.phone = updates.phone.trim();
          if (updates.whatsapp_number !== undefined) cfg.whatsapp = updates.whatsapp_number.trim();
          if (updates.google_review_link || updates.review_url) {
            cfg.google_link = (updates.google_review_link || updates.review_url).trim();
          }
          if (updates.instagram_handle || updates.instagram_url) {
            cfg.instagram = (updates.instagram_handle || updates.instagram_url).trim();
          }
          if (updates.facebook_link || updates.facebook_url) {
            cfg.facebook = (updates.facebook_link || updates.facebook_url).trim();
          }
          if (updates.website !== undefined) cfg.website = updates.website.trim();
          if (updates.address !== undefined) cfg.address = updates.address.trim();
          if (updates.category !== undefined) {
            cfg.category = updates.category.trim();
            cfg.subtitle = updates.category.trim();
          }

          const pageUpdates = {
            business_name: updates.name ? updates.name.trim() : existingPage.business_name,
            config_data: cfg,
            setup_status: "completed",
            updated_at: new Date().toISOString(),
          };

          const { error: pErr } = await db.from("page_editor_configs").update(pageUpdates).eq("id", existingPage.id);
          if (pErr) {
            console.error("page_editor_configs update error:", pErr);
          }
        }

        // 3. Sync to qr_nfc_tags & google_review_links tables
        const grUrl = (updates.google_review_link || updates.review_url || "").trim();
        const tagUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.name) tagUpdates.business_name = updates.name.trim();
        if (grUrl) tagUpdates.google_review_link = grUrl;

        await db
          .from("qr_nfc_tags")
          .update(tagUpdates)
          .or(`tag_id.ilike.${effectiveTagCode},business_id.ilike.${targetBid}`)
          .is("deleted_at", null);

        if (grUrl || updates.name) {
          const grlUpdates: any = { updated_at: new Date().toISOString() };
          if (updates.name) grlUpdates.business_name = updates.name.trim();
          if (grUrl) grlUpdates.business_google_review_link = grUrl;
          await db
            .from("google_review_links")
            .update(grlUpdates)
            .or(`tag_id.ilike.${effectiveTagCode},business_id.ilike.${targetBid}`)
            .is("deleted_at", null);
        }

        // 4. Sync to businesses table
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
          if (grUrl) {
            bizUpdates.review_url = grUrl;
            bizUpdates.google_review_link = grUrl;
          }
          if (updates.instagram_handle || updates.instagram_url) {
            bizUpdates.instagram_url = (updates.instagram_handle || updates.instagram_url).trim();
          }

          await db.from("businesses").update(bizUpdates).eq("id", result.business.id);
        }

        // 5. Invalidate Edge & Server Tag Cache
        invalidateCachedTag(cleanCode);
        if (tokenTagCode) invalidateCachedTag(tokenTagCode);
        if (targetBid) invalidateCachedTag(targetBid);
        invalidateCachedTag("st3");
        invalidateCachedTag("zentap");
        invalidateCachedTag("zt-0004");
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

