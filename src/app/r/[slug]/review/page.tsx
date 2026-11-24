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
  const rawVia = resolvedSearchParams.via;
  const isPreview = resolvedSearchParams.preview === "1";

  const cleanSlug = (slug || "").replace(/[|%#?&\s/]+$/g, "").toLowerCase().trim();
  const via = rawVia ? rawVia.replace(/[|%#?&\s/]+$/g, "").trim() : undefined;
  const isTagOrClientId = cleanSlug.startsWith("zt-") || cleanSlug.startsWith("st") || cleanSlug.startsWith("crd") || cleanSlug.startsWith("tag_");

  // Fast memory business lookup (avoids hanging on remote database for client IDs)
  let rawBiz: any = getBusinessBySlug(cleanSlug);

  // Check if customized in Page Editor (page_editor_configs) and clients table
  const db = createAdminClient();
  let pageConfig: any = null;
  let tagRow: any = null;
  let grlRow: any = null;
  let clientRecord: any = null;

  if (db) {
    try {
      const tagQuery = via || cleanSlug;
      const isSharedDemo = cleanSlug === "zentap" || cleanSlug === "st3" || (via || "").toLowerCase() === "st3" || cleanSlug === "zt-0004";

      const cfgPromise = isSharedDemo
        ? db
            .from("page_editor_configs")
            .select("*")
            .or("tag_id.ilike.st3,tag_id.ilike.zentap,business_id.ilike.zt-0004")
            .is("deleted_at", null)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : db
            .from("page_editor_configs")
            .select("*")
            .or(`business_id.ilike.${cleanSlug},tag_id.ilike.${cleanSlug}${via ? `,tag_id.ilike.${via},business_id.ilike.${via}` : ''}`)
            .is("deleted_at", null)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

      const tagPromise = db
        .from("qr_nfc_tags")
        .select("*")
        .ilike("tag_id", tagQuery)
        .is("deleted_at", null)
        .maybeSingle();

      const grlPromise = db
        .from("google_review_links")
        .select("*")
        .ilike("tag_id", tagQuery)
        .is("deleted_at", null)
        .maybeSingle();

      const clientPromise = isSharedDemo
        ? db.from("clients").select("*").ilike("business_id", "ZT-0004").is("deleted_at", null).limit(1).maybeSingle()
        : db.from("clients").select("*").or(`business_id.ilike.${cleanSlug}${via ? `,business_id.ilike.${via}` : ''}`).is("deleted_at", null).limit(1).maybeSingle();

      const bizPromise = (rawBiz || isTagOrClientId)
        ? Promise.resolve(null)
        : fetchPublicBusinessBySlug(cleanSlug).catch(() => null);

      // Single parallel round trip with strict 1.5s timeout guard to prevent 504 Vercel timeouts
      const [cfgRes, tRes, gRes, cRes, bRes] = await Promise.race([
        Promise.all([cfgPromise, tagPromise, grlPromise, clientPromise, bizPromise]),
        new Promise<any[]>((resolve) =>
          setTimeout(() => {
            console.warn(`Review page query timed out (1.5s) for ${tagQuery}. Using instant local fallback.`);
            resolve([{ data: null }, { data: null }, { data: null }, { data: null }, null]);
          }, 1500)
        ),
      ]);

      pageConfig = cfgRes?.data || null;
      tagRow = tRes?.data || null;
      grlRow = gRes?.data || null;
      clientRecord = cRes?.data || null;
      if (!rawBiz && bRes) rawBiz = bRes;
    } catch (e) {
      console.warn("Error fetching data for review page:", e);
    }
  }

  // Canonicalization: If cleanSlug is a hardware tag (e.g. st3, crd1, tag_),
  // automatically redirect to the assigned business's canonical review page (/r/[business_id]/review).
  const isHardwareTag = /^(st\d+|crd\d+|tag_)/i.test(cleanSlug);
  if (isHardwareTag) {
    let assignedBizId = pageConfig?.business_id || tagRow?.business_id || grlRow?.business_id;
    if (!assignedBizId) {
      const localT = getAllQrNfcTags().find((t) => (t.tag_id || "").toLowerCase() === cleanSlug);
      if (localT?.business_id) assignedBizId = localT.business_id;
    }
    if (assignedBizId && (assignedBizId || "").toLowerCase() !== cleanSlug) {
      const canonicalSlug = assignedBizId.toLowerCase().trim();
      const qParams = new URLSearchParams();
      qParams.set('via', via || cleanSlug);
      if (source) qParams.set('s', source);
      if (isPreview) qParams.set('preview', '1');
      redirect(`/r/${canonicalSlug}/review?${qParams.toString()}`);
    }
  }

  // Fallback to local memory store if database timed out or was empty
  if (!clientRecord) {
    const allClients = getAllClients();
    clientRecord = allClients.find(
      (c) =>
        (c.business_id || "").toLowerCase() === cleanSlug ||
        (via && (c.business_id || "").toLowerCase() === via.toLowerCase()) ||
        (cleanSlug === "st3" && c.business_id === "ZT-0004")
    ) || null;
  }

  if (!pageConfig) {
    const local = getAllPageEditorConfigs().find(
      (p) =>
        (via && (p.tag_id || "").toLowerCase() === via.toLowerCase()) ||
        (p.tag_id || "").toLowerCase() === cleanSlug ||
        (p.business_id || "").toLowerCase() === cleanSlug ||
        (rawBiz && (p.business_id || "").toLowerCase() === (rawBiz.id || "").toLowerCase()) ||
        (cleanSlug === "zentap" && ((p.tag_id || "").toLowerCase() === "zentap" || (p.business_id || "").toLowerCase() === "sample-demo-biz-01" || (p.tag_id || "").toLowerCase() === "st1"))
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

  const isDemoOrZentap = cleanSlug === "st3" || cleanSlug === "zentap" || via?.toLowerCase() === "st3" || cleanSlug === "zt-0004" || cleanSlug === "sample";

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
    email: clientRecord?.owner_email || cfg.email || (isDemoOrZentap ? "meetborad@hotmail.com" : ""),
    phone: clientRecord?.owner_phone || cfg.phone || (isDemoOrZentap ? "9662760880" : ""),
    city: clientRecord?.city || cfg.address || "Ahmedabad",
    state: "Gujarat",
    country: "India",
    pincode: "",
    address: clientRecord?.custom_fields?.directions || cfg.address || "Ahmedabad",
    category: clientRecord?.custom_fields?.category || cfg.subtitle || cfg.category || "Service",
    gbp_link: clientRecord?.google_review_link || cfg.google_link || (isDemoOrZentap ? "https://g.page/r/CdJX2OGu1yhoEAI/review" : ""),
    plan: "standee_1500",
    payment_status: "paid",
    created_at: clientRecord?.created_at || pageConfig?.created_at || new Date().toISOString(),
    redirect_mode: "interactive_profile",
    whatsapp_number: clientRecord?.whatsapp || cfg.whatsapp || cfg.phone || (isDemoOrZentap ? "9274560880" : ""),
    whatsapp: clientRecord?.whatsapp || cfg.whatsapp || cfg.phone || (isDemoOrZentap ? "9274560880" : ""),
    instagram: clientRecord?.instagram_link || cfg.instagram || (isDemoOrZentap ? "https://www.instagram.com/zenttap/" : ""),
    website: clientRecord?.custom_fields?.website || cfg.website || (isDemoOrZentap ? "https://www.zentapdigitalsolutions.com/" : ""),
    location_image: cfg.location_image || "",
    logo_url: cfg.logo_url || "/logo.png",
  };

  const parsedBiz = rawBiz ? toBusinessRecord(rawBiz) : null;
  const biz: BusinessRecord = parsedBiz ? {
    ...parsedBiz,
    name: clientRecord?.business_name || parsedBiz.name,
    city: clientRecord?.city || parsedBiz.city,
    google_review_link: clientRecord?.google_review_link || parsedBiz.google_review_link || parsedBiz.review_url,
    review_url: clientRecord?.google_review_link || parsedBiz.google_review_link || parsedBiz.review_url,
    phone: clientRecord?.owner_phone || parsedBiz.phone,
    whatsapp: clientRecord?.whatsapp || parsedBiz.whatsapp,
    whatsapp_number: clientRecord?.whatsapp || parsedBiz.whatsapp_number,
    instagram: clientRecord?.instagram_link || parsedBiz.instagram,
    facebook: clientRecord?.facebook_link || parsedBiz.facebook,
    website: clientRecord?.website_url || clientRecord?.website || clientRecord?.custom_fields?.website_url || clientRecord?.custom_fields?.website || parsedBiz.website,
    category: (clientRecord as any)?.category || clientRecord?.custom_fields?.category || clientRecord?.custom_fields?.subtitle || parsedBiz.category,
    address: clientRecord?.directions_link || clientRecord?.custom_fields?.directions_link || clientRecord?.custom_fields?.directions || clientRecord?.custom_fields?.address || parsedBiz.address,
  } : fallbackBiz;

  // Determine effective destination
  const localGrl = getAllGoogleReviewLinks().find((g) => (g.tag_id || "").toLowerCase() === (via || cleanSlug).toLowerCase());
  const localTag = getAllQrNfcTags().find((t) => (t.tag_id || "").toLowerCase() === (via || cleanSlug).toLowerCase());

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
    (clientRecord?.google_review_link || "").trim() ||
    (grlRow?.business_google_review_link || "").trim() ||
    (localGrl?.business_google_review_link || "").trim() ||
    (tagRow?.google_review_link || "").trim() ||
    (cfg.google_link || "").trim() ||
    (biz.google_review_link || "").trim() ||
    (biz.review_url || "").trim() ||
    "https://g.page/r/CdJX2OGu1yhoEAI/review";

  if (!effectiveGoogleLink && (cleanSlug === "zentap" || cleanSlug === "sample" || isPreview)) {
    effectiveGoogleLink = "https://g.page/r/CdJX2OGu1yhoEAI/review";
  }

  const effectiveTheme = cfg.theme || pageConfig?.theme || pageConfig?.config_data?.theme || "clean_light";

  return (
    <ZenTapReviewAssistant
      business={biz}
      pageConfig={{ ...pageConfig, ...cfg, theme: effectiveTheme }}
      tagCode={via || cleanSlug}
      googleReviewUrl={effectiveGoogleLink}
      allowBusinessPageAccess={allowBusinessPageAccess}
      source={source}
      isPreview={isPreview}
    />
  );
}
