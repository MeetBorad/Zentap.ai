// app/api/card/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyOwnerSessionToken, logPartnerAction } from "@/lib/ownerAccess";
import { updateTagAndBusinessFromOwner } from "@/lib/businessStore";
import { updateClient } from "@/lib/adminPlatformStore";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateCachedTag } from "@/lib/tagCache";
import { fetchClientRecord } from "../verify/route";

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

    let updatedClientRow: any = null;

    if (db) {
      try {
        // 1. Sync to clients table (Master Source of Truth)
        let existingClient = await fetchClientRecord(db, targetBid) || 
                             await fetchClientRecord(db, cleanCode) || 
                             await fetchClientRecord(db, effectiveTagCode);

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

          // Try update with custom_fields, and fallback without it if column doesn't exist
          const customFields = { ...(existingClient.custom_fields || {}) };
          if (updates.website !== undefined) customFields.website = updates.website.trim();
          if (updates.address !== undefined) {
            customFields.directions = updates.address.trim();
            customFields.address = updates.address.trim();
          }
          if (updates.category !== undefined) {
            customFields.category = updates.category.trim();
            customFields.subtitle = updates.category.trim();
          }

          let updateRes = await db
            .from("clients")
            .update({ ...clientUpdates, custom_fields: customFields })
            .eq("id", existingClient.id)
            .select();

          if (updateRes.error && updateRes.error.message?.includes("custom_fields")) {
            updateRes = await db
              .from("clients")
              .update(clientUpdates)
              .eq("id", existingClient.id)
              .select();
          }

          if (updateRes.data && updateRes.data.length > 0) {
            updatedClientRow = { ...updateRes.data[0], custom_fields: customFields };
          } else {
            updatedClientRow = { ...existingClient, ...clientUpdates, custom_fields: customFields };
          }

          try {
            updateClient(existingClient.business_id || targetBid, {
              ...clientUpdates,
              custom_fields: customFields,
            });
          } catch {}
        }

        // 2. Sync to page_editor_configs table (Two-way live populated)
        const { data: existingPages } = await db
          .from("page_editor_configs")
          .select("*")
          .or(`tag_id.ilike.${effectiveTagCode},business_id.ilike.${targetBid},tag_id.ilike.${cleanCode}`)
          .is("deleted_at", null);

        if (existingPages && existingPages.length > 0) {
          for (const pageRow of existingPages) {
            const cfg = { ...(pageRow.config_data || {}) };
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

            await db
              .from("page_editor_configs")
              .update({
                business_name: updates.name ? updates.name.trim() : pageRow.business_name,
                config_data: cfg,
                setup_status: "completed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", pageRow.id);
          }
        } else {
          // Create initial page editor config entry
          const newCfg = {
            title: (updates.name || "").trim(),
            city: (updates.city || "Ahmedabad").trim(),
            subtitle: (updates.category || "").trim(),
            category: (updates.category || "").trim(),
            phone: (updates.phone || "").trim(),
            whatsapp: (updates.whatsapp_number || "").trim(),
            google_link: (updates.google_review_link || updates.review_url || "").trim(),
            instagram: (updates.instagram_handle || updates.instagram_url || "").trim(),
            facebook: (updates.facebook_link || updates.facebook_url || "").trim(),
            website: (updates.website || "").trim(),
            address: (updates.address || "").trim(),
          };

          await db.from("page_editor_configs").insert({
            tag_id: effectiveTagCode,
            business_id: targetBid,
            business_name: updates.name ? updates.name.trim() : "ZenTap Business",
            config_data: newCfg,
            setup_status: "completed",
            updated_at: new Date().toISOString(),
          });
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
        if (updates.facebook_link || updates.facebook_url) {
          bizUpdates.facebook_url = (updates.facebook_link || updates.facebook_url).trim();
        }
        if (updates.website) {
          bizUpdates.website = updates.website.trim();
          bizUpdates.website_url = updates.website.trim();
        }
        if (updates.category) bizUpdates.category = updates.category.trim();
        if (updates.address) bizUpdates.address = updates.address.trim();

        await db
          .from("businesses")
          .update(bizUpdates)
          .or(`id.ilike.${targetBid},slug.ilike.${cleanCode}`);

        // 5. Invalidate Edge & Server Tag Cache completely
        invalidateCachedTag();
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
        id: targetBid,
      },
      client: updatedClientRow,
      sessionRemainingMs: remainingMs,
    });
  } catch (err) {
    console.warn("POST /api/card/update error:", err);
    return NextResponse.json({ error: "Failed to update details" }, { status: 500 });
  }
}

