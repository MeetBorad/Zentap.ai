import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin client unconfigured" }, { status: 500 });
  }

  try {
    const [
      clientsRes,
      deletedBizRes,
      paymentsRes,
      deletedPaymentsRes,
      tagsRes,
      deletedTagsRes,
      googleLinksRes,
      deletedGoogleLinksRes,
      socialLinksRes,
      deletedSocialLinksRes,
      pageEditorRes,
      deletedPageEditorRes,
    ] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("deleted_businesses").select("*").order("deleted_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("deleted_payments").select("*").order("deleted_at", { ascending: false }),
      supabase.from("qr_nfc_tags").select("*").order("created_at", { ascending: false }),
      supabase.from("deleted_qr_nfc_tags").select("*").order("deleted_at", { ascending: false }),
      supabase.from("google_review_links").select("*").order("created_at", { ascending: false }),
      supabase.from("deleted_google_review_links").select("*").order("deleted_at", { ascending: false }),
      supabase.from("social_links").select("*").order("created_at", { ascending: false }),
      supabase.from("deleted_social_links").select("*").order("deleted_at", { ascending: false }),
      supabase.from("page_editor_configs").select("*").order("updated_at", { ascending: false }),
      supabase.from("deleted_page_editor_configs").select("*").order("deleted_at", { ascending: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        clients: clientsRes.data || [],
        deletedBusinesses: deletedBizRes.data || [],
        payments: paymentsRes.data || [],
        deletedPayments: deletedPaymentsRes.data || [],
        tags: tagsRes.data || [],
        deletedTags: deletedTagsRes.data || [],
        googleLinks: googleLinksRes.data || [],
        deletedGoogleLinks: deletedGoogleLinksRes.data || [],
        socialLinks: socialLinksRes.data || [],
        deletedSocialLinks: deletedSocialLinksRes.data || [],
        pageEditorConfigs: pageEditorRes.data || [],
        deletedPageEditorConfigs: deletedPageEditorRes.data || [],
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
    const { action, table, data, idField = "id", idValue } = body;

    if (action === "seed_initial") {
      const { initialClients, initialTags, initialPayments, initialGoogleLinks, initialSocialLinks, initialPageEditors } = body;
      
      // Check if clients empty before seeding
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

    if (action === "delete") {
      if (!table || !idValue) {
        return NextResponse.json({ error: "Missing table or idValue" }, { status: 400 });
      }

      const { error } = await (supabase as any).from(table).delete().eq(idField, idValue);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/platform error:", err);
    return NextResponse.json({ error: err.message || "Failed to mutate platform table" }, { status: 500 });
  }
}
