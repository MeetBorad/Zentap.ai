// app/r/[slug]/page.tsx
// Server Component: handles legacy printed standees (/r/{slug}), destination switching,
// and 302 redirects via resolveScan, delegating interactive UI to ZenTapHubPage (when hub_enabled)
// or ReviewAssistantClient (when hub_enabled is false - preserving exact current behavior).

import { redirect } from "next/navigation";
import { resolveScan } from "@/lib/resolveTag";
import { getTagByCode, getBusinessBySlug, BusinessRecord } from "@/lib/businessStore";
import { fetchPublicBusinessBySlug } from "@/lib/supabase/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllPageEditorConfigs } from "@/lib/adminPlatformStore";
import ReviewAssistantClient from "./ReviewAssistantClient";
import ZenTapHubPage from "@/components/customer/ZenTapHubPage";
import { 
  getPageDesign, 
  getPageButtons, 
  getPageSections, 
  getPagePhotos,
  PageDesignRecord,
  PageButtonRecord
} from "@/lib/hubDesignStore";

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

export default async function Page({
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

  const cleanCode = slug.toLowerCase().trim();
  const rawBiz = getBusinessBySlug(cleanCode) || (await fetchPublicBusinessBySlug(cleanCode));
  const biz = rawBiz ? toBusinessRecord(rawBiz) : null;

  // If preview mode, always render the Hub Page for live simulation of saved design
  if (isPreview) {
    if (biz) {
      const design = getPageDesign(biz.id);
      return (
        <ZenTapHubPage
          business={biz}
          design={design}
          buttons={getPageButtons(biz.id)}
          sections={getPageSections(biz.id)}
          photos={getPagePhotos(biz.id)}
          source={source}
          isPreview={true}
        />
      );
    }
    return <ReviewAssistantClient />;
  }

  // 1. Check if a legacy tag with code = slug exists (strictly when not arriving via a tag router and not a registered business)
  const legacyTag = (!via && !biz) ? getTagByCode(cleanCode) : null;

  if (legacyTag) {
    // If tag exists, resolve using resolveScan
    const res = await resolveScan(cleanCode, source, { logPage: true });

    if (res.kind === "redirect") {
      redirect(res.url);
    }
    if (res.kind === "unavailable") {
      redirect("/unavailable");
    }
    if (res.kind === "page") {
      const tagRawBiz = getBusinessBySlug(res.slug) || (await fetchPublicBusinessBySlug(res.slug));
      if (tagRawBiz) {
        const tagBiz = toBusinessRecord(tagRawBiz);
        const design = getPageDesign(tagBiz.id);
        if (design.hub_enabled) {
          return (
            <ZenTapHubPage
              business={tagBiz}
              design={design}
              buttons={getPageButtons(tagBiz.id)}
              sections={getPageSections(tagBiz.id)}
              photos={getPagePhotos(tagBiz.id)}
              source={source}
            />
          );
        }
      }
      return <ReviewAssistantClient />;
    }
  }

  // Check if customized in Page Editor (page_editor_configs)
  const db = createAdminClient();
  let pageConfig: any = null;
  if (db) {
    try {
      const q = via 
        ? db.from('page_editor_configs').select('*').ilike('tag_id', via).is('deleted_at', null).maybeSingle()
        : db.from('page_editor_configs').select('*').or(`business_id.ilike.${cleanCode},tag_id.ilike.${cleanCode}${biz ? `,business_id.eq.${biz.id}` : ''}`).is('deleted_at', null).maybeSingle();
      const { data } = await q;
      pageConfig = data;
    } catch (e) {
      console.warn('Error fetching pageConfig:', e);
    }
  }

  if (!pageConfig) {
    const local = getAllPageEditorConfigs().find(
      (p) =>
        p.tag_id.toLowerCase() === cleanCode ||
        p.business_id.toLowerCase() === cleanCode ||
        (via && p.tag_id.toLowerCase() === via.toLowerCase()) ||
        (biz && p.business_id.toLowerCase() === biz.id.toLowerCase())
    );
    if (local) {
      pageConfig = local;
    }
  }

  // If page is explicitly pending in Page Editor, show "Business Profile Under Process"
  if (pageConfig && pageConfig.setup_status === 'pending') {
    redirect("/unavailable");
  }

  // If page is configured and completed in Page Editor, render ZenTapHubPage with the custom design!
  if (pageConfig && pageConfig.setup_status === 'completed' && pageConfig.config_data) {
    const cfg = pageConfig.config_data;
    const effectiveBiz: BusinessRecord = biz || {
      id: pageConfig.business_id || pageConfig.tag_id,
      name: pageConfig.business_name || cfg.title || "Business",
      slug: (pageConfig.business_id || pageConfig.tag_id).toLowerCase(),
      review_url: cfg.google_link || "",
      google_review_link: cfg.google_link || "",
      active: true,
      is_deleted: false,
      owner_user_id: "",
      email: "",
      phone: cfg.phone || "",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      pincode: "",
      address: "",
      category: cfg.category || cfg.subtitle || "Service",
      gbp_link: cfg.google_link || "",
      plan: "standee_1500",
      payment_status: "paid",
      created_at: pageConfig.created_at || new Date().toISOString(),
      redirect_mode: "interactive_profile",
      whatsapp_number: cfg.whatsapp || cfg.phone || "",
      whatsapp: cfg.whatsapp || cfg.phone || "",
      instagram: cfg.instagram || "",
    };

    const defaultDesign = getPageDesign(effectiveBiz.id);
    const customDesign: PageDesignRecord = {
      ...defaultDesign,
      hub_enabled: true,
      theme_preset: cfg.theme === 'slate' ? 'modern_slate'
                  : cfg.theme === 'emerald' ? 'emerald_luxe'
                  : cfg.theme === 'sunset' ? 'midnight_amber'
                  : cfg.theme === 'clean_light' ? 'clean_minimal'
                  : 'emerald_luxe',
      primary_color: cfg.theme === 'sunset' ? '#ea580c' : cfg.theme === 'emerald' ? '#059669' : '#ff7a00',
      bg_color: cfg.theme === 'clean_light' ? '#ffffff' : cfg.theme === 'slate' ? '#0f172a' : cfg.theme === 'emerald' ? '#062016' : '#0e1015',
      dark_mode: cfg.theme === 'clean_light' ? 'light' : 'dark',
      cover_url: cfg.cover_image || cfg.cover_url || defaultDesign.cover_url,
      logo_url: cfg.logo_url || defaultDesign.logo_url,
      wallpaper_url: cfg.wallpaper_url,
      tagline: cfg.subtitle || defaultDesign.tagline,
      texts: {
        ...defaultDesign.texts,
        write_review_btn: cfg.cta_text || "Leave a 5-Star Review on Google",
      },
    };

    const customButtons: PageButtonRecord[] = [
      {
        id: `btn_review_${effectiveBiz.id}`,
        business_id: effectiveBiz.id,
        type: 'review',
        label: cfg.cta_text || 'Leave a 5-Star Review on Google',
        url_or_value: cfg.google_link || effectiveBiz.google_review_link || effectiveBiz.review_url || '',
        sort_order: 1,
        visible: true,
      },
      ...(cfg.phone ? [{
        id: `btn_call_${effectiveBiz.id}`,
        business_id: effectiveBiz.id,
        type: 'call' as const,
        label: 'Call',
        url_or_value: cfg.phone,
        sort_order: 2,
        visible: true,
      }] : []),
      {
        id: `btn_maps_${effectiveBiz.id}`,
        business_id: effectiveBiz.id,
        type: 'directions' as const,
        label: 'Directions',
        url_or_value: cfg.google_link || effectiveBiz.google_review_link || effectiveBiz.address || '',
        sort_order: 3,
        visible: true,
      },
      ...(cfg.whatsapp ? [{
        id: `btn_wa_${effectiveBiz.id}`,
        business_id: effectiveBiz.id,
        type: 'whatsapp' as const,
        label: 'WhatsApp',
        url_or_value: cfg.whatsapp,
        sort_order: 4,
        visible: true,
      }] : []),
      ...(cfg.instagram ? [{
        id: `btn_ig_${effectiveBiz.id}`,
        business_id: effectiveBiz.id,
        type: 'instagram' as const,
        label: 'Instagram',
        url_or_value: cfg.instagram,
        sort_order: 5,
        visible: true,
      }] : []),
      ...(cfg.facebook ? [{
        id: `btn_fb_${effectiveBiz.id}`,
        business_id: effectiveBiz.id,
        type: 'facebook' as const,
        label: 'Facebook',
        url_or_value: cfg.facebook,
        sort_order: 6,
        visible: true,
      }] : []),
    ];

    return (
      <ZenTapHubPage
        business={{
          ...effectiveBiz,
          name: cfg.title || effectiveBiz.name,
        }}
        design={customDesign}
        buttons={customButtons}
        sections={getPageSections(effectiveBiz.id)}
        photos={getPagePhotos(effectiveBiz.id)}
        source={source}
      />
    );
  }

  // 2. Fall back to business record lookup if no completed page config was found
  // Enforce active link, deletion state, and payment confirmation gate
  if (!biz || !biz.active || biz.is_deleted || biz.payment_status === "pending") {
    redirect("/unavailable");
  }

  // If redirect_mode is direct_review and review_url is present, 302 straight to Google
  const directUrl = ("google_review_link" in biz && biz.google_review_link ? biz.google_review_link : null) || biz.review_url;
  if (biz.redirect_mode === "direct_review" && directUrl) {
    redirect(directUrl);
  }

  // Check if hub is enabled for this business
  const design = getPageDesign(biz.id);
  if (design.hub_enabled) {
    return (
      <ZenTapHubPage
        business={biz}
        design={design}
        buttons={getPageButtons(biz.id)}
        sections={getPageSections(biz.id)}
        photos={getPagePhotos(biz.id)}
        source={source}
      />
    );
  }

  return <ReviewAssistantClient />;
}
