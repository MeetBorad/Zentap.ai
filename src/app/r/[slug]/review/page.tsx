// src/app/r/[slug]/review/page.tsx
import { redirect } from "next/navigation";
import { getBusinessBySlug, BusinessRecord } from "@/lib/businessStore";
import { fetchPublicBusinessBySlug } from "@/lib/supabase/service";
import { getBusinessReviewConfig } from "@/lib/reviewAssistantStore";
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

  if (!rawBiz) {
    redirect("/unavailable");
  }

  const biz = toBusinessRecord(rawBiz);

  if (!isPreview && (!biz.active || biz.is_deleted)) {
    redirect("/unavailable");
  }

  // Load Review Config
  const config = getBusinessReviewConfig(biz.id);

  return (
    <div className="min-h-screen bg-[#0e1015] py-4 sm:py-8">
      <AiReviewCustomerFlow
        business={biz}
        config={config}
        tagCode={cleanSlug}
        isPreview={isPreview}
      />
    </div>
  );
}
