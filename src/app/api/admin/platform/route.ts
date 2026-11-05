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
      activePaymentsRes,
      deletedPaymentsRes,
      activeTagsRes,
      deletedTagsRes,
      activeGoogleLinksRes,
      deletedGoogleLinksRes,
      activeSocialLinksRes,
      deletedSocialLinksRes,
      activePageEditorRes,
      deletedPageEditorRes,
    ] = await Promise.all([
      supabase.from("clients").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("clients").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),

      supabase.from("payments").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),

      supabase.from("qr_nfc_tags").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("qr_nfc_tags").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),

      supabase.from("google_review_links").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("google_review_links").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),

      supabase.from("social_links").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("social_links").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),

      supabase.from("page_editor_configs").select("*").is("deleted_at", null).order("updated_at", { ascending: false }),
      supabase.from("page_editor_configs").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
    ]);

    const clients = activeClientsRes.data || [];
    const deletedBusinesses = deletedClientsRes.data || [];

    const payments = activePaymentsRes.data || [];
    const deletedPayments = deletedPaymentsRes.data || [];

    const tags = activeTagsRes.data || [];
    const deletedTags = deletedTagsRes.data || [];

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
        const setup_status: "active" | "pending" = isValidGoogleUrl(googleUrl) ? "active" : "pending";
        return {
          id: t.id,
          tag_id: t.tag_id,
          business_id: t.business_id,
          business_name: client?.business_name || t.business_name || "Assigned Business",
          link_of_tag_id: t.link,
          business_google_review_link: googleUrl,
          destination: t.destination || "not_assigned",
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
        const setup_status: "active" | "pending" = isValidSocialUrl(platform, socialUrl) ? "active" : "pending";
        return {
          id: t.id,
          tag_id: t.tag_id,
          business_id: t.business_id,
          business_name: client?.business_name || t.business_name || "Assigned Business",
          social_platform: platform,
          link_of_tag_id: t.link,
          social_link: socialUrl,
          destination: t.destination || (setup_status === "active" ? "assigned" : "not_assigned"),
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
        const setup_status = isValidGoogleUrl(row.business_google_review_link) ? "active" : "pending";
        googleLinks.push({ ...row, setup_status, destination: row.destination || "not_assigned" });
      }
    });

    const socialLinks = [...socialLinksFromTags];
    (activeSocialLinksRes.data || []).forEach((row) => {
      if (!socialLinks.some((s) => s.tag_id === row.tag_id)) {
        const setup_status = isValidSocialUrl(row.social_platform, row.social_link) ? "active" : "pending";
        socialLinks.push({ ...row, setup_status });
      }
    });

    const deletedGoogleLinks = deletedGoogleLinksRes.data || [];
    const deletedSocialLinks = deletedSocialLinksRes.data || [];

    // Page Editor configs: strictly derived from Standees whose Destination is 'zentap_google' or 'business_page' and has assigned business
    const pageEditorFromTags = tags
      .filter((t) => t.product_type === "Counter Standee" && t.business_id && (t.destination === "zentap_google" || t.destination === "business_page"))
      .map((t) => {
        const client = clientMap.get(t.business_id);
        const googleUrl = (t.google_review_link || client?.google_review_link || "").trim();
        const existingConfig = (activePageEditorRes.data || []).find((p) => p.tag_id === t.tag_id);
        // Setup status / Status of Design: completed when designed and saved; pending otherwise
        const setup_status: "completed" | "pending" = existingConfig?.setup_status === "completed" ? "completed" : "pending";
        return {
          id: existingConfig?.id || t.id,
          tag_id: t.tag_id,
          business_id: t.business_id,
          business_name: client?.business_name || t.business_name || "Assigned Business",
          link_url: t.link,
          destination: t.destination || "business_page",
          setup_status,
          config_data: existingConfig?.config_data || {
            theme: "obsidian",
            title: client?.business_name || t.business_name || "Welcome",
            subtitle: "Rate your experience on Google",
            cta_text: "Write a 5-Star Review on Google",
            google_link: googleUrl,
            phone: client?.owner_phone || "",
            whatsapp: client?.whatsapp || client?.owner_phone || "",
            instagram: client?.instagram_link || "",
          },
          created_at: existingConfig?.created_at || t.created_at,
          updated_at: existingConfig?.updated_at || t.updated_at,
          deleted_at: t.deleted_at,
          deleted_by: t.deleted_by,
        };
      });

    const pageEditorConfigs = [...pageEditorFromTags];
    (activePageEditorRes.data || []).forEach((row) => {
      if (!pageEditorConfigs.some((p) => p.tag_id === row.tag_id)) {
        const matchingTag = tags.find((t) => t.tag_id.toLowerCase() === row.tag_id.toLowerCase());
        const matchingGLink = googleLinks.find((g) => g.tag_id.toLowerCase() === row.tag_id.toLowerCase());
        const dest = matchingTag?.destination || matchingGLink?.destination || row.destination;
        if (dest === "zentap_google" || dest === "business_page") {
          pageEditorConfigs.push({
            ...row,
            destination: dest,
            setup_status: row.setup_status === "completed" ? "completed" : "pending",
          });
        }
      }
    });

    const deletedPageEditorConfigs = deletedPageEditorRes.data || [];

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
      
      const { data: existingClients } = await (supabase as any).from("clients").select("id").limit(1);
      if (!existingClients || existingClients.length === 0) {
        if (initialClients?.length) {
          const clean = initialClients.map((c: any) => sanitizeRowForTable(c, "clients"));
          await (supabase as any).from("clients").insert(clean);
        }
        if (initialTags?.length) {
          const clean = initialTags.map((t: any) => sanitizeRowForTable(t, "qr_nfc_tags"));
          await (supabase as any).from("qr_nfc_tags").insert(clean);
        }
        if (initialPayments?.length) {
          const clean = initialPayments.map((p: any) => sanitizeRowForTable(p, "payments"));
          await (supabase as any).from("payments").insert(clean);
        }
        if (initialGoogleLinks?.length) {
          const clean = initialGoogleLinks.map((g: any) => sanitizeRowForTable(g, "google_review_links"));
          await (supabase as any).from("google_review_links").insert(clean);
        }
        if (initialSocialLinks?.length) {
          const clean = initialSocialLinks.map((s: any) => sanitizeRowForTable(s, "social_links"));
          await (supabase as any).from("social_links").insert(clean);
        }
        if (initialPageEditors?.length) {
          const clean = initialPageEditors.map((pe: any) => sanitizeRowForTable(pe, "page_editor_configs"));
          await (supabase as any).from("page_editor_configs").insert(clean);
        }
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

      // Step 1: Verify row is currently deleted in primary table
      const { data: targetRow, error: findErr } = await (supabase as any)
        .from(table)
        .select("*")
        .eq(idField, idValue)
        .not("deleted_at", "is", null)
        .maybeSingle();

      if (findErr) {
        console.error(`Error querying deleted record in ${table}:`, findErr);
        throw findErr;
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

      // Step 3: Delete the row from the primary table (guaranteeing it had deleted_at IS NOT NULL)
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

      const deletedRow = deletedRows[0];
      return NextResponse.json({ success: true, deleted: deletedRow });
    }

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TABLE_COLUMNS: Record<string, string[]> = {
  clients: [
    "id",
    "business_id",
    "business_name",
    "owner_name",
    "owner_phone",
    "owner_email",
    "whatsapp",
    "instagram_link",
    "facebook_link",
    "city",
    "created_at",
    "updated_at",
    "deleted_at",
    "deleted_by",
    "google_review_link",
    "custom_fields",
  ],
  payments: [
    "id",
    "business_id",
    "business_name",
    "product",
    "product_price",
    "selling_rate",
    "payment_date",
    "payment_method",
    "payment_status",
    "notes",
    "created_at",
    "updated_at",
    "deleted_at",
    "deleted_by",
  ],
  qr_nfc_tags: [
    "id",
    "tag_id",
    "product_type",
    "business_id",
    "business_name",
    "link",
    "scans_count",
    "created_at",
    "updated_at",
    "deleted_at",
    "deleted_by",
    "google_review_link",
    "destination",
    "social_platform",
    "social_link",
  ],
  google_review_links: [
    "id",
    "tag_id",
    "business_id",
    "business_name",
    "link_of_tag_id",
    "business_google_review_link",
    "destination",
    "setup_status",
    "total_scans",
    "created_at",
    "updated_at",
    "deleted_at",
    "deleted_by",
  ],
  social_links: [
    "id",
    "tag_id",
    "business_id",
    "business_name",
    "social_platform",
    "link_of_tag_id",
    "social_link",
    "destination",
    "setup_status",
    "total_scans",
    "created_at",
    "updated_at",
    "deleted_at",
    "deleted_by",
  ],
  page_editor_configs: [
    "id",
    "tag_id",
    "business_id",
    "business_name",
    "link_url",
    "setup_status",
    "config_data",
    "created_at",
    "updated_at",
    "deleted_at",
    "deleted_by",
  ],
};

function sanitizeRowForTable(item: any, table: string) {
  if (!item || typeof item !== "object") return item;
  const copy: any = {};
  const allowed = TABLE_COLUMNS[table];

  for (const [key, value] of Object.entries(item)) {
    if (allowed && !allowed.includes(key)) {
      continue; // Skip extra fields that don't exist in Supabase schema
    }
    if (key === "id" && typeof value === "string" && !UUID_REGEX.test(value)) {
      continue; // Skip non-UUID strings so PostgreSQL auto-generates gen_random_uuid()
    }
    copy[key] = value;
  }
  return copy;
}

    // 5. UPSERT RECORD
    if (action === "upsert") {
      if (!table || !data) {
        return NextResponse.json({ error: "Missing table or data" }, { status: 400 });
      }

      // If table is clients: handle both update and insert with error resilience & cascade
      if (table === "clients") {
        const checkItem = Array.isArray(data) ? data[0] : data;
        const oldBizId = body.oldBusinessId || checkItem.business_id;

        // 1. Try to find existing client by id, oldBusinessId, or business_id
        let existingClient: any = null;
        if (checkItem.id && UUID_REGEX.test(checkItem.id)) {
          const { data: byId } = await (supabase as any)
            .from("clients")
            .select("id, business_id, business_name")
            .eq("id", checkItem.id)
            .maybeSingle();
          if (byId) existingClient = byId;
        }

        if (!existingClient && oldBizId) {
          const { data: byOldBiz } = await (supabase as any)
            .from("clients")
            .select("id, business_id, business_name")
            .eq("business_id", oldBizId)
            .maybeSingle();
          if (byOldBiz) existingClient = byOldBiz;
        }

        if (!existingClient && checkItem.business_id) {
          const { data: byBiz } = await (supabase as any)
            .from("clients")
            .select("id, business_id, business_name")
            .eq("business_id", checkItem.business_id)
            .maybeSingle();
          if (byBiz) existingClient = byBiz;
        }

        if (existingClient) {
          // UPDATE EXISTING CLIENT
          const clean = sanitizeRowForTable(checkItem, "clients");
          delete clean.id; // Do not overwrite primary key UUID
          clean.updated_at = new Date().toISOString();

          let updateRes = await (supabase as any)
            .from("clients")
            .update(clean)
            .eq("id", existingClient.id)
            .select();

          // If custom_fields column is missing in remote DB, strip and retry
          if (updateRes.error && updateRes.error.message?.includes("custom_fields")) {
            delete clean.custom_fields;
            updateRes = await (supabase as any)
              .from("clients")
              .update(clean)
              .eq("id", existingClient.id)
              .select();
          }

          if (updateRes.error) {
            console.error("Client update error:", updateRes.error);
            return NextResponse.json({ error: updateRes.error.message }, { status: 500 });
          }

          // If business_id or business_name changed, cascade to all dependent tables
          const targetBizId = existingClient.business_id;
          const newBizId = clean.business_id || targetBizId;
          const newName = clean.business_name || existingClient.business_name;

          if (targetBizId !== newBizId || existingClient.business_name !== newName) {
            const cascadePayload: any = {};
            if (newBizId) cascadePayload.business_id = newBizId;
            if (newName) cascadePayload.business_name = newName;

            await Promise.allSettled([
              (supabase as any).from("qr_nfc_tags").update(cascadePayload).eq("business_id", targetBizId),
              (supabase as any).from("google_review_links").update(cascadePayload).eq("business_id", targetBizId),
              (supabase as any).from("social_links").update(cascadePayload).eq("business_id", targetBizId),
              (supabase as any).from("page_editor_configs").update(cascadePayload).eq("business_id", targetBizId),
              (supabase as any).from("payments").update(cascadePayload).eq("business_id", targetBizId),
            ]);
          }

          return NextResponse.json({ success: true, data: updateRes.data });
        } else {
          // INSERT NEW CLIENT
          let targetBid = checkItem.business_id;
          if (!targetBid) {
            const { data: allBiz } = await (supabase as any).from("clients").select("business_id");
            let max = 0;
            (allBiz || []).forEach((b: any) => {
              const match = (b.business_id || "").match(/ZT-(\d+)/i);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num > max) max = num;
              }
            });
            targetBid = `ZT-${String(max + 1).padStart(4, "0")}`;
          }

          const clean = sanitizeRowForTable({ ...checkItem, business_id: targetBid }, "clients");
          if (clean.id && !UUID_REGEX.test(clean.id)) {
            delete clean.id; // Let Postgres generate UUID
          }
          clean.created_at = clean.created_at || new Date().toISOString();
          clean.updated_at = new Date().toISOString();

          let insertRes = await (supabase as any)
            .from("clients")
            .insert(clean)
            .select();

          // If custom_fields column is missing in remote DB, strip and retry
          if (insertRes.error && insertRes.error.message?.includes("custom_fields")) {
            delete clean.custom_fields;
            insertRes = await (supabase as any)
              .from("clients")
              .insert(clean)
              .select();
          }

          if (insertRes.error) {
            console.error("Client insert error:", insertRes.error);
            return NextResponse.json({ error: insertRes.error.message }, { status: 500 });
          }

          return NextResponse.json({ success: true, data: insertRes.data });
        }
      }

      // If table is qr_nfc_tags and updating existing tag, use update to avoid not-null check on unprovided columns
      if (table === "qr_nfc_tags") {
        const checkItem = Array.isArray(data) ? data[0] : data;
        if (checkItem.tag_id) {
          const { data: existingTag } = await (supabase as any)
            .from("qr_nfc_tags")
            .select("id")
            .eq("tag_id", checkItem.tag_id)
            .maybeSingle();

          if (existingTag) {
            const clean = sanitizeRowForTable(checkItem, "qr_nfc_tags");
            delete clean.id;
            const { data: updated, error: upErr } = await (supabase as any)
              .from("qr_nfc_tags")
              .update(clean)
              .eq("tag_id", checkItem.tag_id)
              .select();

            if (upErr) {
              console.error("qr_nfc_tags update error:", upErr);
              return NextResponse.json({ error: upErr.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, data: updated });
          }
        }
      }

      // If table is google_review_links and updating existing row by tag_id, use update
      if (table === "google_review_links") {
        const checkItem = Array.isArray(data) ? data[0] : data;
        if (checkItem.tag_id) {
          const { data: existingGLink } = await (supabase as any)
            .from("google_review_links")
            .select("id")
            .eq("tag_id", checkItem.tag_id)
            .maybeSingle();

          if (existingGLink) {
            const clean = sanitizeRowForTable(checkItem, "google_review_links");
            delete clean.id;
            const { data: updated, error: upErr } = await (supabase as any)
              .from("google_review_links")
              .update(clean)
              .eq("tag_id", checkItem.tag_id)
              .select();

            if (upErr) {
              console.error("google_review_links update error:", upErr);
              return NextResponse.json({ error: upErr.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, data: updated });
          }
        }
      }

      // If table is social_links and updating existing row by tag_id, use update
      if (table === "social_links") {
        const checkItem = Array.isArray(data) ? data[0] : data;
        if (checkItem.tag_id) {
          const { data: existingSLink } = await (supabase as any)
            .from("social_links")
            .select("id")
            .eq("tag_id", checkItem.tag_id)
            .maybeSingle();

          if (existingSLink) {
            const clean = sanitizeRowForTable(checkItem, "social_links");
            delete clean.id;
            const { data: updated, error: upErr } = await (supabase as any)
              .from("social_links")
              .update(clean)
              .eq("tag_id", checkItem.tag_id)
              .select();

            if (upErr) {
              console.error("social_links update error:", upErr);
              return NextResponse.json({ error: upErr.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, data: updated });
          }
        }
      }

      // If table is page_editor_configs and updating existing config by tag_id, use update
      if (table === "page_editor_configs") {
        const checkItem = Array.isArray(data) ? data[0] : data;
        if (checkItem.tag_id) {
          const { data: existingCfg } = await (supabase as any)
            .from("page_editor_configs")
            .select("id")
            .eq("tag_id", checkItem.tag_id)
            .maybeSingle();

          if (existingCfg) {
            const clean = sanitizeRowForTable(checkItem, "page_editor_configs");
            delete clean.id;
            const { data: updated, error: upErr } = await (supabase as any)
              .from("page_editor_configs")
              .update(clean)
              .eq("tag_id", checkItem.tag_id)
              .select();

            if (upErr) {
              console.error("page_editor_configs update error:", upErr);
              return NextResponse.json({ error: upErr.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, data: updated });
          }
        }
      }

      // Column whitelist + UUID sanitization: strips non-existent columns and non-UUID IDs
      const cleanData = Array.isArray(data)
        ? data.map((item) => sanitizeRowForTable(item, table))
        : sanitizeRowForTable(data, table);

      const conflictTarget = body.onConflict || (table === "clients" ? "business_id" : (table === "qr_nfc_tags" ? "tag_id" : idField));

      const { data: res, error } = await (supabase as any)
        .from(table)
        .upsert(cleanData, { onConflict: conflictTarget })
        .select();

      if (error) {
        console.error(`Upsert error on ${table}:`, error);
        return NextResponse.json({ error: error.message || `Failed to save to ${table}` }, { status: 500 });
      }

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
