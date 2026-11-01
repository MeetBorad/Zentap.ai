// app/r/[slug]/page.tsx
// Server Component: handles legacy printed standees (/r/{slug}), destination switching,
// and 302 redirects via resolveScan, delegating interactive UI to ZenTapHubPage (when hub_enabled)
// or ReviewAssistantClient (when hub_enabled is false - preserving exact current behavior).

import { redirect } from "next/navigation";
import { resolveScan } from "@/lib/resolveTag";
import { getTagByCode, getBusinessBySlug, BusinessRecord } from "@/lib/businessStore";
import { fetchPublicBusinessBySlug } from "@/lib/supabase/service";
import ReviewAssistantClient from "./ReviewAssistantClient";
import ZenTapHubPage from "@/components/customer/ZenTapHubPage";
import { 
  getPageDesign, 
  getPageButtons, 
  getPageSections, 
  getPagePhotos 
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

  // If preview mode, check if hub preview requested
  if (isPreview) {
    if (biz) {
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
            isPreview={true}
          />
        );
      }
    }
    return <ReviewAssistantClient />;
  }

  // 1. Check if a legacy tag with code = slug exists (either locally or in DB)
  const legacyTag = getTagByCode(cleanCode);

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

  // 2. Fall back to business record lookup if no tag with code = slug was found
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
