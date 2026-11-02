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

    const googleLinks = activeGoogleLinksRes.data || [];
    const deletedGoogleLinks = mergeDeleted(deletedGoogleLinksRes.data, legacyDeletedGoogleLinksRes.data, "tag_id");

    const socialLinks = activeSocialLinksRes.data || [];
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

      // Verify row is currently deleted
      const { data: targetRow, error: findErr } = await (supabase as any)
        .from(table)
        .select("*")
        .eq(idField, idValue)
        .not("deleted_at", "is", null)
        .maybeSingle();

      if (findErr) throw findErr;
      if (!targetRow) {
        return NextResponse.json({ error: "Record not found in Deleted section" }, { status: 404 });
      }

      // Verify typed confirmation if provided
      const expectedName = (targetRow.business_name || targetRow.product || targetRow.tag_id || "").trim();
      if (confirmationName && expectedName && confirmationName.trim().toLowerCase() !== expectedName.toLowerCase()) {
        return NextResponse.json({
          error: `Confirmation mismatch. You typed "${confirmationName}", but expected "${expectedName}".`,
        }, { status: 400 });
      }

      const { data: deletedRows, error: delErr } = await (supabase as any)
        .from(table)
        .delete()
        .eq(idField, idValue)
        .select();

      if (delErr) throw delErr;
      if (!deletedRows || deletedRows.length !== 1) {
        return NextResponse.json({ error: "Expected exactly 1 row to be permanently deleted" }, { status: 409 });
      }

      return NextResponse.json({ success: true, deleted: deletedRows[0] });
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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/platform error:", err);
    return NextResponse.json({ error: err.message || "Failed to process platform mutation" }, { status: 500 });
  }
}
