import { NextRequest, NextResponse } from "next/server";
import { getBusinessBySlug, logScan, logEvent } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();
  const searchParams = request.nextUrl.searchParams;
  const source = (searchParams.get("s") as "qr" | "nfc") || "qr";

  let whatsappNumber: string | null = null;
  let whatsappMessage: string | null = null;
  let businessId: string | null = null;
  let businessName: string = cleanSlug;
  let isActive = true;
  let isDeleted = false;

  // 1. Fetch from Supabase
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, slug, phone, whatsapp_number, whatsapp_message, active, is_deleted")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (!error && data) {
        businessId = data.id;
        businessName = data.name;
        whatsappNumber = data.whatsapp_number || data.phone || null;
        whatsappMessage = data.whatsapp_message || null;
        isActive = data.active;
        isDeleted = !!data.is_deleted;
      }
    } catch (err) {
      console.warn("Supabase lookup in /w route error:", err);
    }
  }

  // 2. Fallback to in-memory/demo store
  if (!businessId) {
    const fallbackBiz = getBusinessBySlug(cleanSlug);
    if (fallbackBiz) {
      businessId = fallbackBiz.id;
      businessName = fallbackBiz.name;
      whatsappNumber = fallbackBiz.whatsapp_number || fallbackBiz.phone || null;
      whatsappMessage = fallbackBiz.whatsapp_message || null;
      isActive = fallbackBiz.active;
      isDeleted = !!fallbackBiz.is_deleted;
    }
  }

  // 3. Unavailable or soft-deleted
  if (!businessId || !isActive || isDeleted) {
    return NextResponse.redirect(new URL(`/r/${slug}?unavailable=1`, request.url), 302);
  }

  // 4. Log telemetry scan & event
  if (supabase && businessId) {
    try {
      await supabase.from("events").insert([
        {
          business_id: businessId,
          type: "whatsapp_click",
          at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn("Could not log DB whatsapp_click event:", e);
    }
  }
  logScan(cleanSlug, source);
  logEvent(cleanSlug, "whatsapp_click" as any);

  // 5. If no WhatsApp number configured, fallback to customized review page
  if (!whatsappNumber) {
    return NextResponse.redirect(new URL(`/r/${slug}`, request.url), 302);
  }

  // 6. Format clean international phone digits
  let cleanDigits = whatsappNumber.replace(/[^0-9]/g, "");
  if (cleanDigits.length === 10) {
    cleanDigits = `91${cleanDigits}`;
  }

  const defaultMsg = `Hello ${businessName}! I scanned your ZenTap standee and would like to connect.`;
  const encodedText = encodeURIComponent(whatsappMessage || defaultMsg);

  return NextResponse.redirect(`https://wa.me/${cleanDigits}?text=${encodedText}`, 302);
}
