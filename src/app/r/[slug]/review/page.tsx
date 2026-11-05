// src/app/r/[slug]/review/page.tsx
import { redirect } from "next/navigation";
import { getBusinessBySlug, BusinessRecord, SAMPLE_DEMO_BUSINESS } from "@/lib/businessStore";
import { fetchPublicBusinessBySlug } from "@/lib/supabase/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllPageEditorConfigs, getAllGoogleReviewLinks, getAllQrNfcTags } from "@/lib/adminPlatformStore";
import ZenTapReviewAssistant from "@/components/customer/ZenTapReviewAssistant";

export const dynamic = "force-dynamic";

function toBusinessRecord(raw: any): BusinessRecord {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    review_url: raw.review_url,
    google_review_link: raw.google_review_link || raw.review_url,
    active: raw.active,
    is_deleted: raw.is_deleted || false,
    owner_user_id: raw.owner_user_id || "",
    email: raw.email || "",
    phone: raw.phone || "",
    city: raw.city || "",
    state: raw.state || "",
    country: raw.country || "India",
    pincode: raw.pincode || "",
    gbp_link: raw.gbp_link || "",
    plan: raw.plan || null,
    payment_status: raw.payment_status || "paid",
    created_at: raw.created_at || new Date().toISOString(),
    redirect_mode: raw.redirect_mode,
    address: raw.address,
    whatsapp_number: raw.whatsapp_number,
    whatsapp: raw.whatsapp,
    instagram: raw.instagram,
    custom_design: raw.custom_design,
    website: raw.website,
    location_image: raw.location_image,
  };
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ s?: string; via?: string; preview?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const source = resolvedSearchParams.s === "nfc" ? "nfc" : "qr";
  const via = resolvedSearchParams.via;
  const isPreview = resolvedSearchParams.preview === "1";

  const cleanSlug = slug.toLowerCase().trim();

  // Find business
  const rawBiz = getBusinessBySlug(cleanSlug) || (await fetchPublicBusinessBySlug(cleanSlug));

  // Check if customized in Page Editor (page_editor_configs)
  const db = createAdminClient();
  let pageConfig: any = null;
  let tagRow: any = null;
  let grlRow: any = null;

  if (db) {
    try {
      const q = db
        .from("page_editor_configs")
        .select("*")
        .or(`business_id.ilike.${cleanSlug},tag_id.ilike.${cleanSlug}${via ? `,tag_id.ilike.${via}` : ""}`)
        .is("deleted_at", null)
        .maybeSingle();
      const { data } = await q;
      pageConfig = data;

      // Query tag and google review links to determine effective destination
      const tagQuery = via || cleanSlug;
      const { data: tData } = await db
        .from("qr_nfc_tags")
        .select("*")
        .ilike("tag_id", tagQuery)
        .is("deleted_at", null)
        .maybeSingle();
      tagRow = tData;

      const { data: gData } = await db
        .from("google_review_links")
        .select("*")
        .ilike("tag_id", tagQuery)
        .is("deleted_at", null)
        .maybeSingle();
      grlRow = gData;
    } catch (e) {
      console.warn("Error fetching data for review page:", e);
    }
  }

  if (!pageConfig) {
    const local = getAllPageEditorConfigs().find(
      (p) =>
        p.tag_id.toLowerCase() === cleanSlug ||
        p.business_id.toLowerCase() === cleanSlug ||
        (via && p.tag_id.toLowerCase() === via.toLowerCase()) ||
        (rawBiz && p.business_id.toLowerCase() === rawBiz.id.toLowerCase()) ||
        (cleanSlug === "zentap" && (p.tag_id.toLowerCase() === "zentap" || p.business_id.toLowerCase() === "sample-demo-biz-01" || p.tag_id.toLowerCase() === "st1"))
    );
    if (local) {
      pageConfig = local;
    }
  }

  // Parse config_data
  let cfg: any = {};
  if (pageConfig?.config_data) {
    try {
      cfg = typeof pageConfig.config_data === "string"
        ? JSON.parse(pageConfig.config_data)
        : (pageConfig.config_data || {});
    } catch {
      cfg = pageConfig.config_data || {};
    }
  }

  // Fallback demo business for sample/zentap
  const fallbackBiz: BusinessRecord = cleanSlug === "zentap" || cleanSlug === "sample"
    ? SAMPLE_DEMO_BUSINESS
    : {
        id: pageConfig?.business_id || pageConfig?.tag_id || cleanSlug,
        name: pageConfig?.business_name || cfg.title || "Business",
        slug: (pageConfig?.business_id || pageConfig?.tag_id || cleanSlug).toLowerCase(),
        review_url: cfg.google_link || "",
        google_review_link: cfg.google_link || "",
        active: true,
        is_deleted: false,
        owner_user_id: "",
        email: cfg.email || "",
        phone: cfg.phone || "",
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        pincode: "",
        address: cfg.address || "",
        category: cfg.subtitle || "Service",
        gbp_link: cfg.google_link || "",
        plan: "standee_1500",
        payment_status: "paid",
        created_at: pageConfig?.created_at || new Date().toISOString(),
        redirect_mode: "interactive_profile",
        whatsapp_number: cfg.whatsapp || cfg.phone || "",
        whatsapp: cfg.whatsapp || cfg.phone || "",
        instagram: cfg.instagram || "",
        website: cfg.website || "",
        location_image: cfg.location_image || "",
      };

  const biz: BusinessRecord = rawBiz ? toBusinessRecord(rawBiz) : fallbackBiz;

  // Determine effective destination
  const localGrl = getAllGoogleReviewLinks().find((g) => g.tag_id.toLowerCase() === (via || cleanSlug));
  const localTag = getAllQrNfcTags().find((t) => t.tag_id.toLowerCase() === (via || cleanSlug));

  const effectiveDest =
    grlRow?.destination ||
    localGrl?.destination ||
    tagRow?.destination ||
    localTag?.destination ||
    pageConfig?.destination ||
    (cleanSlug === "zentap" ? "business_page" : "business_page");

  // Rule: When destination is strictly 'zentap_google', do NOT give access to the Business Page
  const allowBusinessPageAccess = effectiveDest !== "zentap_google";

  // Effective Google Review link (Link of Tag ID)
  const effectiveGoogleLink =
    (grlRow?.business_google_review_link || "").trim() ||
    (localGrl?.business_google_review_link || "").trim() ||
    (tagRow?.google_review_link || "").trim() ||
    (cfg.google_link || "").trim() ||
    (biz.google_review_link || "").trim() ||
    (biz.review_url || "").trim() ||
    "https://www.google.com/maps/place//@23.0393793,72.6446507,17z";

  return (
    <ZenTapReviewAssistant
      business={biz}
      pageConfig={cfg}
      tagCode={via || cleanSlug}
      googleReviewUrl={effectiveGoogleLink}
      allowBusinessPageAccess={allowBusinessPageAccess}
      source={source}
      isPreview={isPreview}
    />
  );
}
