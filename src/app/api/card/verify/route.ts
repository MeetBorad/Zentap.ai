// app/api/card/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { 
  checkLockout, 
  recordFailedAttempt, 
  resetLockout, 
  hashSecret, 
  generateOwnerSessionToken, 
  logPartnerAction, 
  DEFAULT_PIN_HASH 
} from "@/lib/ownerAccess";
import { getTagByCode, getBusinessBySlug, getAllBusinesses, getAllTags, getBusinessAnalytics } from "@/lib/businessStore";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, pin, password } = body;

    if (!code || typeof code !== "string" || !pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN is incorrect" }, { status: 400 });
    }

    const cleanCode = code.toLowerCase().trim();
    const ip = getClientIp(req);

    // 1. Check Rate Limit & 30-Minute Lockout
    const { isLocked } = checkLockout(cleanCode, ip);
    if (isLocked) {
      await logPartnerAction({
        tag_code: cleanCode,
        action: "lockout",
        ip_address: ip,
        details: { reason: "attempt_while_locked" },
      });
      // Generic error to avoid leaking lockout status
      return NextResponse.json({ error: "PIN is incorrect" }, { status: 401 });
    }

    // 2. Locate Tag & Business
    let tag: any = null;
    let business: any = null;

    // Check DB first if available
    const db = createAdminClient();
    if (db) {
      try {
        const { data: dbTag } = await db
          .from("tags")
          .select("*, businesses (*)")
          .eq("code", cleanCode)
          .maybeSingle();

        if (dbTag) {
          tag = dbTag;
          business = dbTag.businesses;
        } else {
          // If code was a business slug, check businesses table
          const { data: dbBiz } = await db
            .from("businesses")
            .select("*")
            .eq("slug", cleanCode)
            .maybeSingle();
          if (dbBiz) {
            business = dbBiz;
            const { data: bTag } = await db
              .from("tags")
              .select("*")
              .eq("business_id", dbBiz.id)
              .maybeSingle();
            tag = bTag;
          }
        }
      } catch (err) {
        console.warn("DB card lookup error, checking local store:", err);
      }
    }

    // Fallback to local store
    if (!tag && !business) {
      tag = getTagByCode(cleanCode);
      if (tag && tag.business_id) {
        business = getAllBusinesses().find((b) => b.id === tag.business_id || b.slug === tag.business_id) || null;
      } else {
        business = getBusinessBySlug(cleanCode);
        if (business) {
          tag = getAllTags().find((t) => t.business_id === business.id || t.code.toLowerCase() === business.slug.toLowerCase()) || null;
        }
      }
    }

    // If neither tag nor business exists, fail with generic error
    if (!tag && !business) {
      recordFailedAttempt(cleanCode, ip);
      await logPartnerAction({
        tag_code: cleanCode,
        action: "pin_verify_fail",
        ip_address: ip,
        details: { reason: "target_not_found" },
      });
      return NextResponse.json({ error: "PIN is incorrect" }, { status: 401 });
    }

    // 3. Verify Hashed PIN
    const enteredHash = hashSecret(pin);
    const expectedPinHash = tag?.pin_hash || business?.pin_hash || DEFAULT_PIN_HASH;

    let isPinValid = enteredHash === expectedPinHash;

    // If a secondary password is required on the account, verify it
    const expectedPasswordHash = tag?.password_hash || business?.password_hash;
    if (expectedPasswordHash) {
      if (!password || hashSecret(password) !== expectedPasswordHash) {
        isPinValid = false;
      }
    }

    // 4. Handle Failure
    if (!isPinValid) {
      const { lockedNow } = recordFailedAttempt(cleanCode, ip);
      await logPartnerAction({
        tag_code: cleanCode,
        business_id: business?.id || tag?.business_id || null,
        action: lockedNow ? "lockout" : "pin_verify_fail",
        ip_address: ip,
        details: { lockedNow },
      });
      return NextResponse.json({ error: "PIN is incorrect" }, { status: 401 });
    }

    // 5. Success: reset lockout counter, generate 15-minute token, log success
    resetLockout(cleanCode, ip);
    const { token, expiresAt } = generateOwnerSessionToken(cleanCode, business?.id || tag?.business_id);

    await logPartnerAction({
      tag_code: cleanCode,
      business_id: business?.id || tag?.business_id || null,
      action: "pin_verify_success",
      ip_address: ip,
    });

    // Compute live scan analytics
    const targetSlug = business?.slug || cleanCode;
    const stats = getBusinessAnalytics(targetSlug);

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
      tag: tag ? {
        id: tag.id,
        code: tag.code,
        form: tag.form || "standee",
        destination: tag.destination || "zentap_page",
        active: tag.active ?? true,
        whatsapp_number: tag.whatsapp_number,
        whatsapp_message: tag.whatsapp_message,
        instagram_handle: tag.instagram_handle,
      } : null,
      business: business ? {
        id: business.id,
        name: business.name,
        slug: business.slug,
        review_url: business.review_url || business.google_review_link,
        whatsapp_number: business.whatsapp_number || business.whatsapp,
        whatsapp_message: business.whatsapp_message,
        instagram_url: business.instagram_url || business.instagram,
      } : null,
      stats: {
        totalScans: stats.totalScans || 0,
        nfcScans: stats.nfcScans || 0,
        qrScans: stats.qrScans || 0,
        reviewClicks: stats.reviewClicks || 0,
      },
    });
  } catch (err) {
    console.warn("POST /api/card/verify error:", err);
    return NextResponse.json({ error: "PIN is incorrect" }, { status: 500 });
  }
}
