// src/app/r/[slug]/review/page.tsx
import { redirect } from "next/navigation";
import { getBusinessBySlug, BusinessRecord, SAMPLE_DEMO_BUSINESS } from "@/lib/businessStore";
import { fetchPublicBusinessBySlug } from "@/lib/supabase/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllPageEditorConfigs, getAllGoogleReviewLinks, getAllQrNfcTags, getAllClients } from "@/lib/adminPlatformStore";
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
      const tagQuery = via || cleanSlug;
      const { data: vData } = await db
        .from("page_editor_configs")
        .select("*")
        .ilike("tag_id", tagQuery)
        .is("deleted_at", null)
        .maybeSingle();
      if (vData) {
        pageConfig = vData;
      } else {
        const q = db
          .from("page_editor_configs")
          .select("*")
          .or(`tag_id.ilike.${cleanSlug},business_id.ilike.${cleanSlug}`)
          .is("deleted_at", null)
          .maybeSingle();
        const { data } = await q;
        pageConfig = data;
      }

      if (!pageConfig && (cleanSlug === "zentap" || cleanSlug === "zt-0004" || cleanSlug === "sample" || via?.toLowerCase() === "st3")) {
        const { data: st3ReviewConfig } = await db
          .from("page_editor_configs")
          .select("*")
          .or("tag_id.ilike.st3,business_id.ilike.zt-0004")
          .is("deleted_at", null)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (st3ReviewConfig) {
          pageConfig = st3ReviewConfig;
        }
      }

      // Query tag and google review links to determine effective destination
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

  // 1. Fetch Client Record from clients table (Master Source of Truth)
  let clientRecord: any = null;
  const candidateBizId = pageConfig?.business_id || (cleanSlug === "st3" || cleanSlug === "zentap" || via?.toLowerCase() === "st3" ? "ZT-0004" : cleanSlug);

  if (db) {
    try {
      const { data: cData } = await db
        .from('clients')
        .select('*')
        .or(`business_id.ilike.${cleanSlug},business_id.ilike.${candidateBizId},id.ilike.${cleanSlug}`)
        .is('deleted_at', null)
        .maybeSingle();
      if (cData) clientRecord = cData;
    } catch (e) {
      console.warn("Review page client lookup notice:", e);
    }
  }

  if (!clientRecord) {
    const allClients = getAllClients();
    clientRecord = allClients.find(
      (c) =>
        c.business_id.toLowerCase() === cleanSlug.toLowerCase() ||
        c.business_id.toLowerCase() === candidateBizId.toLowerCase() ||
        (cleanSlug === "st3" && c.business_id === "ZT-0004")
    ) || null;
  }

  if (!pageConfig) {
    const local = getAllPageEditorConfigs().find(
      (p) =>
        (via && p.tag_id.toLowerCase() === via.toLowerCase()) ||
        p.tag_id.toLowerCase() === cleanSlug ||
        p.business_id.toLowerCase() === cleanSlug ||
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

  // Fallback business record if not in businesses table (prioritizing clients table)
  const fallbackBiz: BusinessRecord = {
    id: clientRecord?.business_id || pageConfig?.business_id || pageConfig?.tag_id || cleanSlug,
    name: clientRecord?.business_name || cfg.title || pageConfig?.business_name || "ZenTap Digital Solutions",
    slug: (clientRecord?.business_id || pageConfig?.business_id || pageConfig?.tag_id || cleanSlug).toLowerCase(),
    review_url: clientRecord?.google_review_link || cfg.google_link || "https://g.page/r/CdJX2OGu1yhoEAI/review",
    google_review_link: clientRecord?.google_review_link || cfg.google_link || "https://g.page/r/CdJX2OGu1yhoEAI/review",
    active: true,
    is_deleted: false,
    owner_user_id: "",
    email: clientRecord?.owner_email || cfg.email || "meetborad@hotmail.com",
    phone: clientRecord?.owner_phone || cfg.phone || "9662760880",
    city: clientRecord?.city || cfg.address || "Ahmedabad",
    state: "Gujarat",
    country: "India",
    pincode: "",
    address: clientRecord?.custom_fields?.directions || cfg.address || "Ahmedabad",
    category: clientRecord?.custom_fields?.category || cfg.subtitle || cfg.category || "Service",
    gbp_link: clientRecord?.google_review_link || cfg.google_link || "https://g.page/r/CdJX2OGu1yhoEAI/review",
    plan: "standee_1500",
    payment_status: "paid",
    created_at: clientRecord?.created_at || pageConfig?.created_at || new Date().toISOString(),
    redirect_mode: "interactive_profile",
    whatsapp_number: clientRecord?.whatsapp || cfg.whatsapp || cfg.phone || "9274560880",
    whatsapp: clientRecord?.whatsapp || cfg.whatsapp || cfg.phone || "9274560880",
    instagram: clientRecord?.instagram_link || cfg.instagram || "https://www.instagram.com/zenttap/",
    website: clientRecord?.custom_fields?.website || cfg.website || "https://www.zentapdigitalsolutions.com/",
    location_image: cfg.location_image || "",
    logo_url: cfg.logo_url || "/logo.png",
  };

  const parsedBiz = rawBiz ? toBusinessRecord(rawBiz) : null;
  const biz: BusinessRecord = parsedBiz ? {
    ...parsedBiz,
    name: clientRecord?.business_name || parsedBiz.name,
    google_review_link: clientRecord?.google_review_link || parsedBiz.google_review_link || parsedBiz.review_url,
    phone: clientRecord?.owner_phone || parsedBiz.phone,
    whatsapp: clientRecord?.whatsapp || parsedBiz.whatsapp,
  } : fallbackBiz;

  // Determine effective destination
  const localGrl = getAllGoogleReviewLinks().find((g) => g.tag_id.toLowerCase() === (via || cleanSlug));
  const localTag = getAllQrNfcTags().find((t) => t.tag_id.toLowerCase() === (via || cleanSlug));

  const effectiveDest =
    grlRow?.destination ||
    tagRow?.destination ||
    localGrl?.destination ||
    localTag?.destination ||
    pageConfig?.destination ||
    "business_page";

  // Rule: When destination is strictly 'zentap_google', do NOT give access to the Business Page
  const allowBusinessPageAccess = effectiveDest !== "zentap_google";

  // Effective Google Review link (Link of Tag ID)
  let effectiveGoogleLink =
    (grlRow?.business_google_review_link || "").trim() ||
    (localGrl?.business_google_review_link || "").trim() ||
    (tagRow?.google_review_link || "").trim() ||
    (cfg.google_link || "").trim() ||
    (biz.google_review_link || "").trim() ||
    (biz.review_url || "").trim() ||
    "https://g.page/r/CdJX2OGu1yhoEAI/review";

  if (cleanSlug === "zentap" || cleanSlug === "sample" || isPreview) {
    effectiveGoogleLink = "https://g.page/r/CdJX2OGu1yhoEAI/review";
  }

  return (
    <ZenTapReviewAssistant
      business={biz}
      pageConfig={{ ...pageConfig, ...cfg }}
      tagCode={via || cleanSlug}
      googleReviewUrl={effectiveGoogleLink}
      allowBusinessPageAccess={allowBusinessPageAccess}
      source={source}
      isPreview={isPreview}
    />
  );
}
