import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED_PLATFORM_TABLES = [
  "clients",
  "payments",
  "qr_nfc_tags",
  "google_review_links",
  "social_links",
  "page_editor_configs",
] as const;

export async function GET(req: Request) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin client unconfigured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const requestedTable = searchParams.get("table");
    const requestedStatus = searchParams.get("status"); // "all" | "deleted" | null

    const [
      activeClientsRes,
      deletedClientsRes,
      legacyDeletedBizRes,
      activePaymentsRes,
      deletedPaymentsRes,
      legacyDeletedPaymentsRes,
      activeTagsRes,
      deletedTagsRes,
      legacyDeletedTagsRes,
      activeGoogleLinksRes,
      deletedGoogleLinksRes,
      legacyDeletedGoogleLinksRes,
      activeSocialLinksRes,
      deletedSocialLinksRes,
      legacyDeletedSocialLinksRes,
      activePageEditorRes,
      deletedPageEditorRes,
      legacyDeletedPageEditorRes,
    ] = await Promise.all([
      supabase.from("clients").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("clients").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
      supabase.from("deleted_businesses").select("*").order("deleted_at", { ascending: false }),

      supabase.from("payments").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
      supabase.from("deleted_payments").select("*").order("deleted_at", { ascending: false }),

      supabase.from("qr_nfc_tags").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("qr_nfc_tags").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
      supabase.from("deleted_qr_nfc_tags").select("*").order("deleted_at", { ascending: false }),

      supabase.from("google_review_links").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("google_review_links").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
      supabase.from("deleted_google_review_links").select("*").order("deleted_at", { ascending: false }),

      supabase.from("social_links").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("social_links").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
      supabase.from("deleted_social_links").select("*").order("deleted_at", { ascending: false }),

      supabase.from("page_editor_configs").select("*").is("deleted_at", null).order("updated_at", { ascending: false }),
      supabase.from("page_editor_configs").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
      supabase.from("deleted_page_editor_configs").select("*").order("deleted_at", { ascending: false }),
    ]);

    // Merge deleted items seamlessly with legacy audit rows if any exist
    const mergeDeleted = <T extends { business_id?: string; tag_id?: string; id?: string }>(
      primary: T[] | null,
      legacy: T[] | null,
      idProp: "business_id" | "tag_id" | "id"
    ): T[] => {
      const merged = [...(primary || [])];
      (legacy || []).forEach((item) => {
        if (!merged.some((m) => m[idProp] === item[idProp])) {
          merged.push(item);
        }
      });
      return merged;
    };

    const clients = activeClientsRes.data || [];
    const deletedBusinesses = mergeDeleted(deletedClientsRes.data, legacyDeletedBizRes.data, "business_id");

    const payments = activePaymentsRes.data || [];
    const deletedPayments = mergeDeleted(deletedPaymentsRes.data, legacyDeletedPaymentsRes.data, "id");

    const tags = activeTagsRes.data || [];
    const deletedTags = mergeDeleted(deletedTagsRes.data, legacyDeletedTagsRes.data, "tag_id");

    // =========================================================================
    // SINGLE SOURCE OF TRUTH (qr_nfc_tags):
    // "Moved" is a VIEW, NOT a copy.
    // - Standees with Business ID automatically appear on Google Links & QR Sharing
    // - Cards with Business ID automatically appear on Social Links & QR Setting
    // - Setup status is WORKED OUT dynamically, NOT stored:
    //   * Standee is Completed (green) when business has a valid Google review link; else Pending (red).
    //   * Card is Completed (green) when chosen what it opens (WhatsApp, Instagram, Facebook) and valid link; else Pending (red).
    // =========================================================================

    const isValidGoogleUrl = (link?: string | null) => {
      const s = (link || "").trim();
      return s.length > 5 && (s.startsWith("http://") || s.startsWith("https://"));
    };

    const isValidSocialUrl = (platform?: string | null, link?: string | null) => {
      const p = (platform || "").trim();
      const l = (link || "").trim();
      const hasPlat = ["WhatsApp", "Instagram", "Facebook"].includes(p);
      return hasPlat && l.length > 3 && (l.startsWith("http://") || l.startsWith("https://") || l.startsWith("wa.me/"));
    };

    const clientMap = new Map<string, any>();
    clients.forEach((c) => clientMap.set(c.business_id, c));

    // Active Google Links View: derived purely from assigned standees
    const googleLinksFromTags = tags
      .filter((t) => t.product_type === "Counter Standee" && t.business_id)
      .map((t) => {
        const client = clientMap.get(t.business_id);
        const googleUrl = (t.google_review_link || client?.google_review_link || "").trim();
        const setup_status: "completed" | "pending" = isValidGoogleUrl(googleUrl) ? "completed" : "pending";
        return {
          id: t.id,
          tag_id: t.tag_id,
          business_id: t.business_id,
          business_name: client?.business_name || t.business_name || "Assigned Business",
          link_of_tag_id: t.link,
          business_google_review_link: googleUrl,
          destination: t.destination || (googleUrl ? "direct_google" : "not_assigned"),
          setup_status,
          total_scans: t.scans_count || 0,
          created_at: t.created_at,
          updated_at: t.updated_at,
          deleted_at: t.deleted_at,
          deleted_by: t.deleted_by,
        };
      });

    // Active Social Links View: derived purely from assigned cards
    const socialLinksFromTags = tags
      .filter((t) => t.product_type === "Business NFC Card" && t.business_id)
      .map((t) => {
        const client = clientMap.get(t.business_id);
        const platform = t.social_platform || "N/A";
        const socialUrl = (t.social_link || "").trim();
        const setup_status: "completed" | "pending" = isValidSocialUrl(platform, socialUrl) ? "completed" : "pending";
        return {
          id: t.id,
          tag_id: t.tag_id,
          business_id: t.business_id,
          business_name: client?.business_name || t.business_name || "Assigned Business",
          social_platform: platform,
          link_of_tag_id: t.link,
          social_link: socialUrl,
          destination: t.destination || (setup_status === "completed" ? "assigned" : "not_assigned"),
          setup_status,
          total_scans: t.scans_count || 0,
          created_at: t.created_at,
          updated_at: t.updated_at,
          deleted_at: t.deleted_at,
          deleted_by: t.deleted_by,
        };
      });

    // Merge view items with any existing standalone rows ensuring tag_id deduplication
    const googleLinks = [...googleLinksFromTags];
    (activeGoogleLinksRes.data || []).forEach((row) => {
      if (!googleLinks.some((g) => g.tag_id === row.tag_id)) {
        const setup_status = isValidGoogleUrl(row.business_google_review_link) ? "completed" : "pending";
        googleLinks.push({ ...row, setup_status });
      }
    });

    const socialLinks = [...socialLinksFromTags];
    (activeSocialLinksRes.data || []).forEach((row) => {
      if (!socialLinks.some((s) => s.tag_id === row.tag_id)) {
        const setup_status = isValidSocialUrl(row.social_platform, row.social_link) ? "completed" : "pending";
        socialLinks.push({ ...row, setup_status });
      }
    });

    const deletedGoogleLinks = mergeDeleted(deletedGoogleLinksRes.data, legacyDeletedGoogleLinksRes.data, "tag_id");
    const deletedSocialLinks = mergeDeleted(deletedSocialLinksRes.data, legacyDeletedSocialLinksRes.data, "tag_id");

    const pageEditorConfigs = activePageEditorRes.data || [];
    const deletedPageEditorConfigs = mergeDeleted(deletedPageEditorRes.data, legacyDeletedPageEditorRes.data, "tag_id");

    const counts = {
      clients: {
        all: clients.length,
        deleted: deletedBusinesses.length,
      },
      payments: {
        all: payments.length,
        paid: payments.filter((p) => p.payment_status === "Completed paid").length,
        unpaid: payments.filter((p) => p.payment_status !== "Completed paid").length,
        deleted: deletedPayments.length,
      },
      tags: {
        all: tags.length,
        deleted: deletedTags.length,
      },
      googleLinks: {
        all: googleLinks.length,
        deleted: deletedGoogleLinks.length,
      },
      socialLinks: {
        all: socialLinks.length,
        deleted: deletedSocialLinks.length,
      },
      pageEditorConfigs: {
        all: pageEditorConfigs.length,
        deleted: deletedPageEditorConfigs.length,
      },
    };

    return NextResponse.json({
      success: true,
      counts,
      data: {
        clients,
        deletedBusinesses,
        payments,
        deletedPayments,
        tags,
        deletedTags,
        googleLinks,
        deletedGoogleLinks,
        socialLinks,
        deletedSocialLinks,
        pageEditorConfigs,
        deletedPageEditorConfigs,
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/platform error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch platform tables" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin client unconfigured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action, table, data, idField = "id", idValue, deletedBy = "admin", confirmationName } = body;

    // Validate table whitelist
    if (table && !ALLOWED_PLATFORM_TABLES.includes(table)) {
      return NextResponse.json({ error: `Table '${table}' not permitted` }, { status: 400 });
    }

    // 1. Initial Seeding if empty
    if (action === "seed_initial") {
      const { initialClients, initialTags, initialPayments, initialGoogleLinks, initialSocialLinks, initialPageEditors } = body;
      
      const { data: existingClients } = await supabase.from("clients").select("id").limit(1);
      if (!existingClients || existingClients.length === 0) {
        if (initialClients?.length) await supabase.from("clients").insert(initialClients);
        if (initialTags?.length) await supabase.from("qr_nfc_tags").insert(initialTags);
        if (initialPayments?.length) await supabase.from("payments").insert(initialPayments);
        if (initialGoogleLinks?.length) await supabase.from("google_review_links").insert(initialGoogleLinks);
        if (initialSocialLinks?.length) await supabase.from("social_links").insert(initialSocialLinks);
        if (initialPageEditors?.length) await supabase.from("page_editor_configs").insert(initialPageEditors);
      }
      return NextResponse.json({ success: true, message: "Seed check completed" });
    }

    // 2. SOFT DELETE (Requirement 2, 3, 7)
    if (action === "soft_delete") {
      if (!table || !idValue) {
        return NextResponse.json({ error: "Missing table or idValue" }, { status: 400 });
      }

      const now = new Date().toISOString();

      if (table === "clients") {
        // Find active client
        const { data: clientRow, error: findErr } = await (supabase as any)
          .from("clients")
          .select("business_id, business_name")
          .eq(idField, idValue)
          .is("deleted_at", null)
          .maybeSingle();

        if (findErr) throw findErr;
        if (!clientRow) {
          return NextResponse.json({ error: "Active client not found or already deleted" }, { status: 404 });
        }

        // Soft delete client
        const { data: updatedClients, error: updateErr } = await (supabase as any)
          .from("clients")
          .update({ deleted_at: now, deleted_by: deletedBy })
          .eq(idField, idValue)
          .is("deleted_at", null)
          .select();

        if (updateErr) throw updateErr;
        if (!updatedClients || updatedClients.length !== 1) {
          return NextResponse.json({ error: "Expected exactly 1 client row to be soft-deleted" }, { status: 409 });
        }

        const targetBizId = clientRow.business_id;

        // Cascade (Requirement 7):
        // 1. Release tags & cards
        await (supabase as any)
          .from("qr_nfc_tags")
          .update({ business_id: null, business_name: null })
          .eq("business_id", targetBizId);

        // 2. Hide linked payments, links, and page configs (soft delete with cascade flag)
        await Promise.all([
          (supabase as any)
            .from("payments")
            .update({ deleted_at: now, deleted_by: "cascade:client_delete" })
            .eq("business_id", targetBizId)
            .is("deleted_at", null),
          (supabase as any)
            .from("google_review_links")
            .update({ deleted_at: now, deleted_by: "cascade:client_delete" })
            .eq("business_id", targetBizId)
            .is("deleted_at", null),
          (supabase as any)
            .from("social_links")
            .update({ deleted_at: now, deleted_by: "cascade:client_delete" })
            .eq("business_id", targetBizId)
            .is("deleted_at", null),
          (supabase as any)
            .from("page_editor_configs")
            .update({ deleted_at: now, deleted_by: "cascade:client_delete" })
            .eq("business_id", targetBizId)
            .is("deleted_at", null),
        ]);

        return NextResponse.json({ success: true, updated: updatedClients[0] });
      } else {
        // Non-client table soft delete
        const { data: updatedRows, error } = await (supabase as any)
          .from(table)
          .update({ deleted_at: now, deleted_by: deletedBy })
          .eq(idField, idValue)
          .is("deleted_at", null)
          .select();

        if (error) throw error;
        if (!updatedRows || updatedRows.length !== 1) {
          return NextResponse.json({ error: "Expected exactly 1 row to be soft-deleted" }, { status: 409 });
        }

        return NextResponse.json({ success: true, updated: updatedRows[0] });
      }
    }

    // 3. RESTORE (Requirement 3, 5)
    if (action === "restore") {
      if (!table || !idValue) {
        return NextResponse.json({ error: "Missing table or idValue" }, { status: 400 });
      }

      if (table === "clients") {
        // 1. Fetch deleted target client
        const { data: targetClient, error: findErr } = await (supabase as any)
          .from("clients")
          .select("*")
          .eq(idField, idValue)
          .not("deleted_at", "is", null)
          .maybeSingle();

        if (findErr) throw findErr;
        if (!targetClient) {
          return NextResponse.json({ error: "Deleted client not found or already active" }, { status: 404 });
        }

        // 2. Clash checks on business_id, owner_email, owner_phone (Requirement 5)
        const { data: clashId } = await (supabase as any)
          .from("clients")
          .select("id, business_id, business_name")
          .eq("business_id", targetClient.business_id)
          .is("deleted_at", null)
          .neq("id", targetClient.id)
          .limit(1);

        if (clashId && clashId.length > 0) {
          return NextResponse.json({
            error: `Cannot restore: An active business with ID "${targetClient.business_id}" (${clashId[0].business_name}) already exists.`,
          }, { status: 400 });
        }

        if (targetClient.owner_email && targetClient.owner_email.trim()) {
          const { data: clashEmail } = await (supabase as any)
            .from("clients")
            .select("id, business_name, owner_email")
            .eq("owner_email", targetClient.owner_email.trim())
            .is("deleted_at", null)
            .neq("id", targetClient.id)
            .limit(1);

          if (clashEmail && clashEmail.length > 0) {
            return NextResponse.json({
              error: `Cannot restore: An active business "${clashEmail[0].business_name}" is already registered with email "${targetClient.owner_email}".`,
            }, { status: 400 });
          }
        }

        if (targetClient.owner_phone && targetClient.owner_phone.trim()) {
          const { data: clashPhone } = await (supabase as any)
            .from("clients")
            .select("id, business_name, owner_phone")
            .eq("owner_phone", targetClient.owner_phone.trim())
            .is("deleted_at", null)
            .neq("id", targetClient.id)
            .limit(1);

          if (clashPhone && clashPhone.length > 0) {
            return NextResponse.json({
              error: `Cannot restore: An active business "${clashPhone[0].business_name}" is already registered with phone "${targetClient.owner_phone}".`,
            }, { status: 400 });
          }
        }

        // 3. Perform restore
        const { data: restoredRows, error: restoreErr } = await (supabase as any)
          .from("clients")
          .update({ deleted_at: null, deleted_by: null })
          .eq(idField, idValue)
          .not("deleted_at", "is", null)
          .select();

        if (restoreErr) throw restoreErr;
        if (!restoredRows || restoredRows.length !== 1) {
          return NextResponse.json({ error: "Expected exactly 1 row to be restored" }, { status: 409 });
        }

        return NextResponse.json({ success: true, restored: restoredRows[0] });
      } else {
        // Non-client table restore
        const { data: restoredRows, error } = await (supabase as any)
          .from(table)
          .update({ deleted_at: null, deleted_by: null })
          .eq(idField, idValue)
          .not("deleted_at", "is", null)
          .select();

        if (error) throw error;
        if (!restoredRows || restoredRows.length !== 1) {
          return NextResponse.json({ error: "Expected exactly 1 row to be restored" }, { status: 409 });
        }

        return NextResponse.json({ success: true, restored: restoredRows[0] });
      }
    }

    // 4. DELETE PERMANENTLY (Requirement 3, 6)
    if (action === "permanent_delete") {
      if (!table || !idValue) {
        return NextResponse.json({ error: "Missing table or idValue" }, { status: 400 });
      }

      // Legacy audit table mapping
      const legacyAuditMap: Record<string, string> = {
        clients: "deleted_businesses",
        payments: "deleted_payments",
        qr_nfc_tags: "deleted_qr_nfc_tags",
        google_review_links: "deleted_google_review_links",
        social_links: "deleted_social_links",
        page_editor_configs: "deleted_page_editor_configs",
      };
      const legacyTable = legacyAuditMap[table];

      // Step 1: Verify row is currently deleted in primary table
      const { data: primaryRow, error: findErr } = await (supabase as any)
        .from(table)
        .select("*")
        .eq(idField, idValue)
        .not("deleted_at", "is", null)
        .maybeSingle();

      if (findErr) {
        console.error(`Error querying deleted record in ${table}:`, findErr);
        throw findErr;
      }

      let targetRow = primaryRow;
      let isLegacyOnly = false;

      // If not in primary table, check legacy audit table
      if (!targetRow && legacyTable) {
        const legacyKey = (idField === "business_id" || idField === "tag_id") ? idField : "id";
        const { data: legacyRow, error: legErr } = await (supabase as any)
          .from(legacyTable)
          .select("*")
          .eq(legacyKey, idValue)
          .maybeSingle();

        if (legErr) {
          console.error(`Error querying legacy deleted record in ${legacyTable}:`, legErr);
          throw legErr;
        }
        if (legacyRow) {
          targetRow = legacyRow;
          isLegacyOnly = true;
        }
      }

      if (!targetRow) {
        return NextResponse.json({ error: `Record "${idValue}" not found in Deleted section` }, { status: 404 });
      }

      // Step 2: Validate typed confirmation
      if (confirmationName) {
        const cleanTyped = confirmationName.trim().toLowerCase();
        // Collect all legitimate identifiers for this entity
        const permissible = [
          targetRow.tag_id,
          targetRow.business_name,
          targetRow.business_id,
          targetRow.product,
          String(idValue),
        ]
          .filter(Boolean)
          .map((s: string) => String(s).trim().toLowerCase());

        const isTagTable = ["google_review_links", "social_links", "page_editor_configs", "qr_nfc_tags"].includes(table);
        const primaryExpected = (isTagTable && targetRow.tag_id
          ? targetRow.tag_id
          : (targetRow.business_name || targetRow.business_id || targetRow.tag_id || String(idValue))
        ).trim();

        if (!permissible.includes(cleanTyped)) {
          return NextResponse.json({
            error: `Confirmation mismatch. You typed "${confirmationName.trim()}", but expected "${primaryExpected}".`,
          }, { status: 400 });
        }
      }

      // Step 3: Transactional cleanup of dependent / audit records first
      if (legacyTable) {
        const legacyKey = (idField === "business_id" || idField === "tag_id") ? idField : "id";
        const { error: legDelErr } = await (supabase as any)
          .from(legacyTable)
          .delete()
          .eq(legacyKey, idValue);

        if (legDelErr) {
          console.warn(`Notice: Failed to purge from ${legacyTable}:`, legDelErr);
        }
      }

      // Step 4: Delete the row from the primary table (guaranteeing it had deleted_at IS NOT NULL)
      let deletedRow = targetRow;
      if (!isLegacyOnly) {
        const { data: deletedRows, error: delErr } = await (supabase as any)
          .from(table)
          .delete()
          .eq(idField, idValue)
          .not("deleted_at", "is", null)
          .select();

        if (delErr) {
          console.error(`DELETE error on ${table}:`, delErr);
          return NextResponse.json({
            error: `Database delete failed on ${table}: ${delErr.message || delErr.details || "Constraint violation"}`
          }, { status: 500 });
        }

        if (!deletedRows || deletedRows.length !== 1) {
          return NextResponse.json({
            error: `Expected exactly 1 row to be permanently deleted from ${table}, but deleted ${deletedRows?.length || 0}.`
          }, { status: 409 });
        }
        deletedRow = deletedRows[0];
      }

      return NextResponse.json({ success: true, deleted: deletedRow });
    }

    // 5. UPSERT RECORD
    if (action === "upsert") {
      if (!table || !data) {
        return NextResponse.json({ error: "Missing table or data" }, { status: 400 });
      }

      const { data: res, error } = await (supabase as any)
        .from(table)
        .upsert(data, { onConflict: body.onConflict || idField })
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data: res });
    }

    // 6. ATOMIC TAG GENERATION (Single or Batch - 1 to 100)
    if (action === "generate_tags") {
      const { product_type, quantity = 1, business_id = null, business_name = null } = body;

      // Strict server-side verification: 1 to 100
      const qty = parseInt(String(quantity), 10);
      if (isNaN(qty) || qty < 1 || qty > 100) {
        return NextResponse.json({ error: "Batch quantity must be a typed integer from 1 to 100" }, { status: 400 });
      }

      if (product_type !== "Counter Standee" && product_type !== "Business NFC Card") {
        return NextResponse.json({ error: "Invalid product type. Must be 'Counter Standee' or 'Business NFC Card'" }, { status: 400 });
      }

      // Call database function: atomic, all-or-nothing, lock-protected
      const { data: generated, error: genErr } = await (supabase as any).rpc("generate_tags_batch", {
        p_product_type: product_type,
        p_count: qty,
        p_business_id: business_id || null,
        p_business_name: business_name || null,
      });

      if (genErr) {
        console.error("generate_tags_batch error:", genErr);
        return NextResponse.json({ error: genErr.message || "Failed to generate tags" }, { status: 500 });
      }

      return NextResponse.json({ success: true, count: generated?.length || 0, data: generated });
    }

    // 7. ASSIGN OR UNASSIGN TAG (Single Source of Truth)
    if (action === "assign_tag") {
      const { tag_id, business_id, business_name, google_review_link, social_platform, social_link } = body;
      if (!tag_id) {
        return NextResponse.json({ error: "Missing tag_id" }, { status: 400 });
      }

      const updates: any = {
        business_id: business_id ? business_id.trim() : null,
        business_name: business_id ? (business_name || null) : null,
        updated_at: new Date().toISOString(),
      };

      if (google_review_link !== undefined) updates.google_review_link = google_review_link;
      if (social_platform !== undefined) updates.social_platform = social_platform;
      if (social_link !== undefined) updates.social_link = social_link;

      const { data: updatedTag, error: upErr } = await (supabase as any)
        .from("qr_nfc_tags")
        .update(updates)
        .eq("tag_id", tag_id)
        .select()
        .single();

      if (upErr) {
        console.error("assign_tag error:", upErr);
        return NextResponse.json({ error: upErr.message || "Failed to update tag assignment" }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: updatedTag });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/platform error:", err);
    return NextResponse.json({ error: err.message || "Failed to process platform mutation" }, { status: 500 });
  }
}
