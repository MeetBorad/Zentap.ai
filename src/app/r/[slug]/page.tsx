// app/r/[slug]/page.tsx
// Server Component: handles legacy printed standees (/r/{slug}), destination switching,
// and 302 redirects via resolveScan, delegating interactive UI to ZenTapHubPage (when hub_enabled)
// or ReviewAssistantClient (when hub_enabled is false - preserving exact current behavior).

import { redirect } from "next/navigation";
import { resolveScan } from "@/lib/resolveTag";
import { getTagByCode, getBusinessBySlug, BusinessRecord, SAMPLE_DEMO_BUSINESS } from "@/lib/businessStore";
import { fetchPublicBusinessBySlug } from "@/lib/supabase/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllPageEditorConfigs, getAllGoogleReviewLinks, getAllQrNfcTags } from "@/lib/adminPlatformStore";
import { getCachedTagData, setCachedTagData } from "@/lib/tagCache";
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
    category: raw.category,
    whatsapp_number: raw.whatsapp_number,
    whatsapp: raw.whatsapp || raw.whatsapp_number,
    instagram: raw.instagram || raw.instagram_url,
    instagram_url: raw.instagram_url || raw.instagram,
    instagram_handle: raw.instagram_handle,
    facebook: raw.facebook || raw.facebook_url,
    facebook_url: raw.facebook_url || raw.facebook,
    website: raw.website || raw.website_url,
    website_url: raw.website_url || raw.website,
    logo_url: raw.logo_url,
    about_us: raw.about_us,
    opening_hours: raw.opening_hours,
    faqs: raw.faqs,
    location_image: raw.location_image,
    location_title: raw.location_title,
    maps_link: raw.maps_link || raw.gbp_link || raw.review_url,
    custom_design: raw.custom_design,
    custom_chips: raw.custom_chips,
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
  const lookupKey = via || cleanCode;

  // 0. Fast Memory Cache lookup (from /t/[code] handover or recent scan)
  const cached = getCachedTagData(lookupKey);
  const db = createAdminClient();

  let pageConfig: any = cached?.pageConfig || null;
  let rawBiz: any = cached?.business || null;
  let cachedDest: string | undefined = cached?.destination;

  // If not cached, fetch all required records in a single parallel round trip (eliminating waterfalls)
  if (!pageConfig && db) {
    try {
      const isLikelyTag = cleanCode.startsWith('st') || cleanCode.startsWith('tag_') || cleanCode.length <= 6;
      const [pageConfigRes, bizFetchRes, grlRes, tagRes] = await Promise.all([
        via
          ? db.from('page_editor_configs').select('*').ilike('tag_id', via).is('deleted_at', null).maybeSingle()
          : db.from('page_editor_configs').select('*').or(`business_id.ilike.${cleanCode},tag_id.ilike.${cleanCode}`).is('deleted_at', null).maybeSingle(),
        isLikelyTag ? Promise.resolve(null) : fetchPublicBusinessBySlug(cleanCode),
        db.from('google_review_links').select('destination').or(`tag_id.ilike.${lookupKey},business_id.ilike.${cleanCode}`).is('deleted_at', null).maybeSingle(),
        db.from('qr_nfc_tags').select('destination').or(`tag_id.ilike.${lookupKey},business_id.ilike.${cleanCode}`).is('deleted_at', null).maybeSingle(),
      ]);

      pageConfig = pageConfigRes?.data || null;
      rawBiz = bizFetchRes || getBusinessBySlug(cleanCode);
      cachedDest = grlRes?.data?.destination || tagRes?.data?.destination;

      if (pageConfig) {
        setCachedTagData(lookupKey, {
          tagId: pageConfig.tag_id || lookupKey,
          businessId: pageConfig.business_id,
          destination: cachedDest || 'business_page',
          pageConfig,
          business: rawBiz,
        });
      }
    } catch (e) {
      console.warn('Error fetching parallel page data:', e);
    }
  }

  // If cleanCode is zentap or zt-0004 or via is st3/zentap and pageConfig is still null, fetch from ST3 / ZT-0004
  if (!pageConfig && db && (cleanCode === "zentap" || cleanCode === "zt-0004" || cleanCode === "sample" || via?.toLowerCase() === "st3" || lookupKey.toLowerCase() === "st3")) {
    try {
      const { data: st3Data } = await db
        .from('page_editor_configs')
        .select('*')
        .or('tag_id.ilike.st3,business_id.ilike.zt-0004')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (st3Data) {
        pageConfig = st3Data;
      }
    } catch {}
  }

  if (!rawBiz) {
    rawBiz = getBusinessBySlug(cleanCode);
  }
  const biz = rawBiz ? toBusinessRecord(rawBiz) : null;

  if (!pageConfig) {
    const local = getAllPageEditorConfigs().find(
      (p) =>
        p.tag_id.toLowerCase() === cleanCode ||
        p.business_id.toLowerCase() === cleanCode ||
        (via && p.tag_id.toLowerCase() === via.toLowerCase()) ||
        (biz && p.business_id.toLowerCase() === biz.id.toLowerCase()) ||
        (cleanCode === "zentap" && (p.tag_id.toLowerCase() === "zentap" || p.business_id.toLowerCase() === "sample-demo-biz-01" || p.tag_id.toLowerCase() === "st1"))
    );
    if (local) {
      pageConfig = local;
    }
  }

  // Parse config_data
  let cfg: any = {};
  if (pageConfig?.config_data) {
    try {
      cfg = typeof pageConfig.config_data === 'string' 
        ? JSON.parse(pageConfig.config_data) 
        : (pageConfig.config_data || {});
    } catch {
      cfg = pageConfig.config_data || {};
    }
  }

  const effectiveBiz: BusinessRecord = biz || {
    id: pageConfig?.business_id || pageConfig?.tag_id || "sample-demo-biz-01",
    name: cfg.title || pageConfig?.business_name || "ZenTap Digital Solutions",
    slug: (pageConfig?.business_id || pageConfig?.tag_id || "zentap").toLowerCase(),
    review_url: cfg.google_link || "https://www.google.com/maps/place//@23.0393793,72.6446507,17z",
    google_review_link: cfg.google_link || "https://www.google.com/maps/place//@23.0393793,72.6446507,17z",
    active: true,
    is_deleted: false,
    owner_user_id: "",
    email: cfg.email || "contact@zentapdigitalsolutions.com",
    phone: cfg.phone || "+91 92745 60880",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    pincode: "380001",
    address: cfg.address || "Ahmedabad, Gujarat, India",
    category: cfg.subtitle || cfg.category || "Ahmedabad • Welcome to our official digital hub",
    gbp_link: cfg.google_link || "https://www.google.com/maps/place//@23.0393793,72.6446507,17z",
    plan: "metal_reply",
    payment_status: "paid",
    created_at: pageConfig?.created_at || new Date().toISOString(),
    redirect_mode: "interactive_profile",
    whatsapp_number: cfg.whatsapp || cfg.phone || "919274560880",
    whatsapp: cfg.whatsapp || cfg.phone || "919274560880",
    instagram: cfg.instagram || "https://instagram.com",
    instagram_url: cfg.instagram || "https://instagram.com",
    facebook: cfg.facebook || "https://facebook.com",
    website: cfg.website || "https://zentapdigitalsolutions.com",
    about_us: cfg.about_us,
    opening_hours: cfg.opening_hours,
    faqs: cfg.faqs,
    location_image: cfg.location_image,
    location_title: cfg.location_title,
    logo_url: cfg.logo_url,
  };

  const defaultDesign = getPageDesign(effectiveBiz.id);
  const customDesign: PageDesignRecord = {
    ...defaultDesign,
    hub_enabled: true,
    theme_preset: cfg.theme === 'slate' ? 'modern_slate'
                : cfg.theme === 'emerald' ? 'emerald_luxe'
                : cfg.theme === 'sunset' ? 'midnight_amber'
                : cfg.theme === 'clean_light' ? 'clean_minimal'
                : 'modern_slate',
    primary_color: cfg.theme === 'sunset' ? '#ea580c' : cfg.theme === 'emerald' ? '#059669' : '#ffc174',
    bg_color: cfg.theme === 'clean_light' ? '#ffffff' : cfg.theme === 'slate' ? '#0f172a' : cfg.theme === 'emerald' ? '#062016' : '#0B0F17',
    dark_mode: cfg.theme === 'clean_light' ? 'light' : 'dark',
    cover_url: cfg.cover_image || cfg.cover_url || defaultDesign.cover_url,
    logo_url: cfg.logo_url || defaultDesign.logo_url,
    wallpaper_url: cfg.wallpaper_url,
    tagline: cfg.subtitle || defaultDesign.tagline,
    texts: {
      ...defaultDesign.texts,
      write_review_btn: cfg.cta_text || "Loved your visit? Tap to write a rapid 5-Star Google Review",
    },
  };

  // If not preview mode, check if destination is strictly 'zentap_google'
  // Rule: "when the destination is only Zentap Google Review it will not give access to Business Page"
  if (!isPreview) {
    let dest = pageConfig?.destination || cachedDest;
    if (!dest && db) {
      try {
        const { data: grlRow } = await db
          .from('google_review_links')
          .select('destination')
          .or(`tag_id.ilike.${via || cleanCode},business_id.ilike.${cleanCode}`)
          .is('deleted_at', null)
          .maybeSingle();
        dest = grlRow?.destination;

        if (!dest) {
          const { data: tagRow } = await db
            .from('qr_nfc_tags')
            .select('destination')
            .or(`tag_id.ilike.${via || cleanCode},business_id.ilike.${cleanCode}`)
            .is('deleted_at', null)
            .maybeSingle();
          dest = tagRow?.destination;
        }
      } catch {}
    }
    if (!dest) {
      const localGrl = getAllGoogleReviewLinks().find(
        (g) => g.tag_id.toLowerCase() === (via || cleanCode) || g.business_id.toLowerCase() === cleanCode
      );
      const localTag = getAllQrNfcTags().find(
        (t) => t.tag_id.toLowerCase() === (via || cleanCode) || (t.business_id && t.business_id.toLowerCase() === cleanCode)
      );
      dest = localGrl?.destination || localTag?.destination || "business_page";
    }

    if (dest === 'zentap_google') {
      const destUrl = `/r/${cleanCode}/review${via ? `?via=${via}` : ''}${source ? `${via ? '&' : '?'}s=${source}` : ''}`;
      redirect(destUrl);
    }
    if (dest === 'direct_google' || dest === 'google_direct') {
      const gLink = cfg.google_link || effectiveBiz.google_review_link || effectiveBiz.review_url;
      if (gLink) {
        redirect(gLink);
      }
    }
  }

  // If preview mode, always render the Hub Page with latest parsed config!
  if (isPreview) {
    return (
      <ZenTapHubPage
        business={effectiveBiz}
        design={customDesign}
        buttons={getPageButtons(effectiveBiz.id)}
        sections={getPageSections(effectiveBiz.id)}
        photos={getPagePhotos(effectiveBiz.id)}
        source={source}
        isPreview={true}
        pageConfig={cfg}
        via={via}
      />
    );
  }

  // 2. Check if a legacy tag with code = slug exists (strictly when not arriving via a tag router and not a registered business)
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
      if (res.target === "review") {
        redirect(`/r/${res.slug}/review${via ? `?via=${via}` : ""}`);
      }
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
              pageConfig={cfg}
            />
          );
        }
      }
      return <ReviewAssistantClient />;
    }
  }

  // If page is explicitly pending in Page Editor, show "Business Profile Under Process"
  if (pageConfig && pageConfig.setup_status === 'pending' && !pageConfig.config_data) {
    redirect("/unavailable");
  }

  // If page is configured and completed in Page Editor, render ZenTapHubPage with the custom design!
  if (pageConfig && (pageConfig.setup_status === 'completed' || pageConfig.config_data)) {
    return (
      <ZenTapHubPage
        business={{
          ...effectiveBiz,
          name: cfg.title || effectiveBiz.name,
        }}
        design={customDesign}
        buttons={getPageButtons(effectiveBiz.id)}
        sections={getPageSections(effectiveBiz.id)}
        photos={getPagePhotos(effectiveBiz.id)}
        source={source}
        pageConfig={cfg}
        via={via}
      />
    );
  }

  // 3. Fall back to business record lookup if no completed page config was found
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
        pageConfig={cfg}
        via={via}
      />
    );
  }

  return <ReviewAssistantClient />;
}
