// src/app/r/[slug]/review/page.tsx
import { redirect } from "next/navigation";
import { getBusinessBySlug, BusinessRecord } from "@/lib/businessStore";
import { fetchPublicBusinessBySlug } from "@/lib/supabase/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllPageEditorConfigs } from "@/lib/adminPlatformStore";
import { getBusinessReviewConfig } from "@/lib/reviewAssistantStore";
import { 
  getPageDesign, 
  getPageButtons, 
  PageDesignRecord, 
  PageButtonRecord 
} from "@/lib/hubDesignStore";
import AiReviewCustomerFlow from "@/components/customer/AiReviewCustomerFlow";

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
  };
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ s?: string; preview?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const source = resolvedSearchParams.s === "nfc" ? "nfc" : "qr";
  const isPreview = resolvedSearchParams.preview === "1";

  const cleanSlug = slug.toLowerCase().trim();

  // Find business
  const rawBiz = getBusinessBySlug(cleanSlug) || (await fetchPublicBusinessBySlug(cleanSlug));

  // Check if customized in Page Editor (page_editor_configs)
  const db = createAdminClient();
  let pageConfig: any = null;
  if (db) {
    try {
      const q = db
        .from("page_editor_configs")
        .select("*")
        .or(`business_id.ilike.${cleanSlug},tag_id.ilike.${cleanSlug}`)
        .is("deleted_at", null)
        .maybeSingle();
      const { data } = await q;
      pageConfig = data;
    } catch (e) {
      console.warn("Error fetching pageConfig for review page:", e);
    }
  }

  if (!pageConfig) {
    const local = getAllPageEditorConfigs().find(
      (p) =>
        p.tag_id.toLowerCase() === cleanSlug ||
        p.business_id.toLowerCase() === cleanSlug ||
        (rawBiz && p.business_id.toLowerCase() === rawBiz.id.toLowerCase())
    );
    if (local) {
      pageConfig = local;
    }
  }

  // If pending in page editor, show unavailable
  if (pageConfig && pageConfig.setup_status === "pending") {
    redirect("/unavailable");
  }

  if (!rawBiz && !pageConfig) {
    redirect("/unavailable");
  }

  const effectiveBizRecord: BusinessRecord = rawBiz
    ? toBusinessRecord(rawBiz)
    : {
        id: pageConfig.business_id || pageConfig.tag_id,
        name: pageConfig.business_name || pageConfig.config_data?.title || "Business",
        slug: (pageConfig.business_id || pageConfig.tag_id).toLowerCase(),
        review_url: pageConfig.config_data?.google_link || "",
        google_review_link: pageConfig.config_data?.google_link || "",
        active: true,
        is_deleted: false,
        owner_user_id: "",
        email: "",
        phone: pageConfig.config_data?.phone || "",
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        pincode: "",
        address: "",
        category: pageConfig.config_data?.category || pageConfig.config_data?.subtitle || "Service",
        gbp_link: pageConfig.config_data?.google_link || "",
        plan: "standee_1500",
        payment_status: "paid",
        created_at: pageConfig.created_at || new Date().toISOString(),
        redirect_mode: "interactive_profile",
        whatsapp_number: pageConfig.config_data?.whatsapp || pageConfig.config_data?.phone || "",
        whatsapp: pageConfig.config_data?.whatsapp || pageConfig.config_data?.phone || "",
        instagram: pageConfig.config_data?.instagram || "",
      };

  const biz = effectiveBizRecord;

  if (!isPreview && (!biz.active || biz.is_deleted)) {
    redirect("/unavailable");
  }

  // Load Review Config
  const config = getBusinessReviewConfig(biz.id);

  const defaultDesign = getPageDesign(biz.id);
  const cfg = pageConfig?.config_data || {};
  const customDesign: PageDesignRecord = {
    ...defaultDesign,
    hub_enabled: true,
    theme_preset: cfg.theme === "slate" ? "modern_slate"
                : cfg.theme === "emerald" ? "emerald_luxe"
                : cfg.theme === "sunset" ? "midnight_amber"
                : cfg.theme === "clean_light" ? "clean_minimal"
                : defaultDesign.theme_preset || "modern_slate",
    primary_color: cfg.theme === "sunset" ? "#ea580c" : cfg.theme === "emerald" ? "#059669" : defaultDesign.primary_color || "#ff7a00",
    bg_color: cfg.theme === "clean_light" ? "#ffffff" : cfg.theme === "slate" ? "#0f172a" : cfg.theme === "emerald" ? "#062016" : "#0e1015",
    dark_mode: cfg.theme === "clean_light" ? "light" : "dark",
    cover_url: cfg.cover_image || cfg.cover_url || defaultDesign.cover_url,
    logo_url: cfg.logo_url || defaultDesign.logo_url,
    wallpaper_url: cfg.wallpaper_url || defaultDesign.wallpaper_url,
    tagline: cfg.subtitle || cfg.category || defaultDesign.tagline,
    texts: {
      ...defaultDesign.texts,
      write_review_btn: cfg.cta_text || "Leave a 5-Star Review on Google",
    },
  };

  const customButtons: PageButtonRecord[] = [
    {
      id: `btn_review_${biz.id}`,
      business_id: biz.id,
      type: "review",
      label: cfg.cta_text || "Leave a 5-Star Review on Google",
      url_or_value: cfg.google_link || biz.google_review_link || biz.review_url || "",
      sort_order: 1,
      visible: true,
    },
    ...(cfg.phone || biz.phone ? [{
      id: `btn_call_${biz.id}`,
      business_id: biz.id,
      type: "call" as const,
      label: "Call",
      url_or_value: cfg.phone || biz.phone || "",
      sort_order: 2,
      visible: true,
    }] : []),
    {
      id: `btn_maps_${biz.id}`,
      business_id: biz.id,
      type: "directions" as const,
      label: "Directions",
      url_or_value: cfg.google_link || biz.google_review_link || biz.address || "",
      sort_order: 3,
      visible: true,
    },
    ...(cfg.whatsapp || biz.whatsapp_number ? [{
      id: `btn_wa_${biz.id}`,
      business_id: biz.id,
      type: "whatsapp" as const,
      label: "WhatsApp",
      url_or_value: cfg.whatsapp || biz.whatsapp_number || "",
      sort_order: 4,
      visible: true,
    }] : []),
    ...(cfg.instagram || biz.instagram ? [{
      id: `btn_ig_${biz.id}`,
      business_id: biz.id,
      type: "instagram" as const,
      label: "Instagram",
      url_or_value: cfg.instagram || biz.instagram || "",
      sort_order: 5,
      visible: true,
    }] : []),
    ...(cfg.facebook || config.facebook_url ? [{
      id: `btn_fb_${biz.id}`,
      business_id: biz.id,
      type: "facebook" as const,
      label: "Facebook",
      url_or_value: cfg.facebook || config.facebook_url || "",
      sort_order: 6,
      visible: true,
    }] : []),
  ];

  return (
    <AiReviewCustomerFlow
      business={biz}
      config={config}
      tagCode={cleanSlug}
      isPreview={isPreview}
      design={customDesign}
      buttons={customButtons}
      initialStars={5}
    />
  );
}
