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
        // Parallel fetch for existing client record and existing page configs to eliminate waterfall delays
        const [existingClient, pageConfigRes] = await Promise.all([
          fetchClientRecord(db, targetBid).then(c => c || fetchClientRecord(db, cleanCode)).then(c => c || fetchClientRecord(db, effectiveTagCode)),
          db.from("page_editor_configs").select("*").or(`tag_id.ilike.${effectiveTagCode},business_id.ilike.${targetBid},tag_id.ilike.${cleanCode}`).is("deleted_at", null),
        ]);

        const parallelTasks: any[] = [];

        // 1. Prepare sync to clients table (Master Source of Truth)
        if (existingClient) {
          const clientUpdates: any = {
            updated_at: new Date().toISOString(),
          };
          if (updates.name !== undefined) clientUpdates.business_name = updates.name.trim();
          if (updates.city !== undefined) clientUpdates.city = updates.city.trim();
          if (updates.owner_name !== undefined) clientUpdates.owner_name = updates.owner_name.trim();
          if (updates.owner_phone !== undefined) clientUpdates.owner_phone = updates.owner_phone.trim();
          else if (updates.phone !== undefined) clientUpdates.owner_phone = updates.phone.trim();
          if (updates.owner_email !== undefined) clientUpdates.owner_email = updates.owner_email.trim();
          else if (updates.email !== undefined) clientUpdates.owner_email = updates.email.trim();
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

          const customFields = { ...(existingClient.custom_fields || {}) };
          if (updates.contact_phone !== undefined) customFields.contact_phone = updates.contact_phone.trim();
          if (updates.google_business_page !== undefined) customFields.google_business_page = updates.google_business_page.trim();
          if (updates.twitter !== undefined || updates.twitter_link !== undefined) {
            customFields.twitter_link = (updates.twitter || updates.twitter_link).trim();
          }
          if (updates.upi_id !== undefined || updates.upi !== undefined) {
            customFields.upi_id = (updates.upi_id || updates.upi).trim();
          }
          if (updates.website !== undefined || updates.website_url !== undefined) {
            const w = (updates.website || updates.website_url).trim();
            customFields.website = w;
            customFields.website_url = w;
          }
          if (updates.directions !== undefined || updates.directions_link !== undefined || updates.address !== undefined) {
            const d = (updates.directions_link || updates.directions || updates.address).trim();
            customFields.directions_link = d;
            customFields.directions = d;
            customFields.address = d;
          }
          if (updates.category !== undefined) {
            customFields.category = updates.category.trim();
            customFields.subtitle = updates.category.trim();
          }
          if (updates.area !== undefined) {
            customFields.area = updates.area.trim();
          }
          if (updates.services !== undefined) {
            customFields.services = Array.isArray(updates.services)
              ? updates.services
              : String(updates.services).split(/[•|,]/).map((s: string) => s.trim()).filter(Boolean);
          }
          if (updates.keywords !== undefined) {
            customFields.keywords = Array.isArray(updates.keywords)
              ? updates.keywords
              : String(updates.keywords).split(/[•|,]/).map((k: string) => k.trim()).filter(Boolean);
          }

          parallelTasks.push(
            (async () => {
              try {
                const res = await db
                  .from("clients")
                  .update({ ...clientUpdates, custom_fields: customFields })
                  .eq("id", existingClient.id)
                  .select();
                if (res.data && res.data.length > 0) {
                  updatedClientRow = { ...res.data[0], custom_fields: customFields };
                }
              } catch {
                await db.from("clients").update(clientUpdates).eq("id", existingClient.id);
              }
            })()
          );

          try {
            updateClient(existingClient.business_id || targetBid, {
              ...clientUpdates,
              contact_phone: customFields.contact_phone,
              google_business_page: customFields.google_business_page,
              twitter_link: customFields.twitter_link,
              upi_id: customFields.upi_id,
              directions_link: customFields.directions_link,
              website_url: customFields.website_url,
              website: customFields.website,
              custom_fields: customFields,
            });
          } catch { }
        }

        // 2. Prepare sync to page_editor_configs table (Two-way live populated)
        const existingPages = pageConfigRes?.data;
        if (existingPages && existingPages.length > 0) {
          for (const pageRow of existingPages) {
            const cfg = { ...(pageRow.config_data || {}) };
            if (updates.name !== undefined) cfg.title = updates.name.trim();
            if (updates.city !== undefined) cfg.city = updates.city.trim();
            if (updates.owner_name !== undefined) cfg.owner_name = updates.owner_name.trim();
            if (updates.owner_phone !== undefined) cfg.owner_phone = updates.owner_phone.trim();
            if (updates.contact_phone !== undefined) cfg.contact_phone = updates.contact_phone.trim();
            if (updates.phone !== undefined) cfg.phone = updates.phone.trim();
            if (updates.whatsapp_number !== undefined) cfg.whatsapp = updates.whatsapp_number.trim();
            if (updates.google_review_link || updates.review_url) {
              cfg.google_link = (updates.google_review_link || updates.review_url).trim();
            }
            if (updates.google_business_page !== undefined) cfg.google_business_page = updates.google_business_page.trim();
            if (updates.instagram_handle || updates.instagram_url) {
              cfg.instagram = (updates.instagram_handle || updates.instagram_url).trim();
            }
            if (updates.facebook_link || updates.facebook_url) {
              cfg.facebook = (updates.facebook_link || updates.facebook_url).trim();
            }
            if (updates.twitter !== undefined || updates.twitter_link !== undefined) {
              cfg.twitter = (updates.twitter || updates.twitter_link).trim();
            }
            if (updates.upi_id !== undefined || updates.upi !== undefined) {
              cfg.upi_id = (updates.upi_id || updates.upi).trim();
            }
            if (updates.website !== undefined || updates.website_url !== undefined) {
              cfg.website = (updates.website || updates.website_url).trim();
            }
            if (updates.directions_link !== undefined || updates.directions !== undefined || updates.address !== undefined) {
              const dir = (updates.directions_link || updates.directions || updates.address).trim();
              cfg.directions_link = dir;
              cfg.address = dir;
            }
            if (updates.category !== undefined) {
              cfg.category = updates.category.trim();
              cfg.subtitle = updates.category.trim();
            }

            parallelTasks.push(
              db.from("page_editor_configs")
                .update({
                  business_name: updates.name ? updates.name.trim() : pageRow.business_name,
                  config_data: cfg,
                  setup_status: "completed",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", pageRow.id)
            );
          }
        } else {
          const newCfg = {
            title: (updates.name || "").trim(),
            city: (updates.city || "Ahmedabad").trim(),
            subtitle: (updates.category || "").trim(),
            category: (updates.category || "").trim(),
            owner_name: (updates.owner_name || "").trim(),
            owner_phone: (updates.owner_phone || updates.phone || "").trim(),
            contact_phone: (updates.contact_phone || updates.phone || "").trim(),
            phone: (updates.contact_phone || updates.phone || "").trim(),
            whatsapp: (updates.whatsapp_number || "").trim(),
            google_link: (updates.google_review_link || updates.review_url || "").trim(),
            google_business_page: (updates.google_business_page || "").trim(),
            instagram: (updates.instagram_handle || updates.instagram_url || "").trim(),
            facebook: (updates.facebook_link || updates.facebook_url || "").trim(),
            twitter: (updates.twitter || updates.twitter_link || "").trim(),
            upi_id: (updates.upi_id || updates.upi || "").trim(),
            website: (updates.website || updates.website_url || "").trim(),
            directions_link: (updates.directions_link || updates.directions || updates.address || "").trim(),
            address: (updates.directions_link || updates.directions || updates.address || "").trim(),
          };

          parallelTasks.push(
            db.from("page_editor_configs").insert({
              tag_id: effectiveTagCode,
              business_id: targetBid,
              business_name: updates.name ? updates.name.trim() : "ZenTap Business",
              config_data: newCfg,
              setup_status: "completed",
              updated_at: new Date().toISOString(),
            })
          );
        }

        // 3. Prepare sync to qr_nfc_tags & google_review_links tables
        const grUrl = (updates.google_review_link || updates.review_url || "").trim();
        const tagUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.name) tagUpdates.business_name = updates.name.trim();
        if (grUrl) tagUpdates.google_review_link = grUrl;

        parallelTasks.push(
          db.from("qr_nfc_tags")
            .update(tagUpdates)
            .or(`tag_id.ilike.${effectiveTagCode},business_id.ilike.${targetBid}`)
            .is("deleted_at", null)
        );

        if (grUrl || updates.name) {
          const grlUpdates: any = { updated_at: new Date().toISOString() };
          if (updates.name) grlUpdates.business_name = updates.name.trim();
          if (grUrl) grlUpdates.business_google_review_link = grUrl;
          parallelTasks.push(
            db.from("google_review_links")
              .update(grlUpdates)
              .or(`tag_id.ilike.${effectiveTagCode},business_id.ilike.${targetBid}`)
              .is("deleted_at", null)
          );
        }

        // 4. Prepare sync to businesses table
        const bizUpdates: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.name) bizUpdates.name = updates.name.trim();
        if (updates.city) bizUpdates.city = updates.city.trim();
        if (updates.contact_phone || updates.phone) bizUpdates.phone = (updates.contact_phone || updates.phone).trim();
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
        if (updates.website || updates.website_url) {
          const w = (updates.website || updates.website_url).trim();
          bizUpdates.website = w;
          bizUpdates.website_url = w;
        }
        if (updates.category) bizUpdates.category = updates.category.trim();
        if (updates.directions_link || updates.directions || updates.address) {
          bizUpdates.address = (updates.directions_link || updates.directions || updates.address).trim();
        }

        // 5. Sync to business_context table with refreshed_at
        const contextPayload = {
          business_name: updates.name ? updates.name.trim() : existingClient?.business_name || "ZenTap Business",
          category: updates.category ? updates.category.trim() : (existingClient?.custom_fields?.category || "Service"),
          area: updates.area ? updates.area.trim() : (updates.city ? updates.city.trim() : "Ahmedabad"),
          services: Array.isArray(updates.services)
            ? updates.services
            : typeof updates.services === "string"
            ? updates.services.split(/[•|,]/).map((s: string) => s.trim()).filter(Boolean)
            : (existingClient?.custom_fields?.services || []),
          keywords: Array.isArray(updates.keywords)
            ? updates.keywords
            : typeof updates.keywords === "string"
            ? updates.keywords.split(/[•|,]/).map((k: string) => k.trim()).filter(Boolean)
            : (existingClient?.custom_fields?.keywords || []),
          website_url: updates.website || updates.website_url || undefined,
          source: "owner",
          sources_used: ["owner"],
          confidence: "high",
          refreshed_at: new Date().toISOString(),
        };

        parallelTasks.push(
          (async () => {
            try {
              await db.from("business_context").upsert({
                business_id: (existingClient?.business_id || targetBid).toLowerCase(),
                context_data: contextPayload,
                sources_used: ["owner"],
                refreshed_at: new Date().toISOString(),
              });
            } catch {}
          })()
        );

        parallelTasks.push(
          db.from("businesses")
            .update(bizUpdates)
            .or(`id.ilike.${targetBid},slug.ilike.${cleanCode}`)
        );

        // Execute all database updates concurrently in parallel!
        await Promise.allSettled(parallelTasks);

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

