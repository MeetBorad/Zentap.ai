// lib/resolveTag.ts (server-only: uses Supabase service role key with local store fallback)
import { createAdminClient } from '@/lib/supabase/admin';
import { getTagByCode, getAllBusinesses, logScan } from '@/lib/businessStore';

export type Resolution =
  | { kind: 'redirect'; url: string }
  | { kind: 'page'; slug: string }
  | { kind: 'unavailable'; unassigned?: boolean };

const CODE_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;

function waUrl(number?: string | null, message?: string | null) {
  const digits = (number ?? '').replace(/\D/g, '');
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}` + (message ? `?text=${encodeURIComponent(message)}` : '');
}

function igUrl(handle?: string | null) {
  const h = (handle ?? '')
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];
  return /^[A-Za-z0-9._]{1,30}$/.test(h) ? `https://www.instagram.com/${h}` : null;
}

function safeHttps(u?: string | null) {
  try {
    const x = new URL(u ?? '');
    return x.protocol === 'https:' ? x.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Decide where a physical NFC/QR scan goes and log it.
 * logPage: log a scan row even when the result is the ZenTap page.
 *   - /t/[code] passes true.
 *   - /r/[slug] (legacy) should pass true too, and must skip its own logging
 *     so each scan produces exactly one row.
 */
export async function resolveScan(
  rawCode: string,
  source: 'qr' | 'nfc',
  opts: { logPage?: boolean } = { logPage: true }
): Promise<Resolution> {
  const code = rawCode.toLowerCase().trim();
  if (!CODE_RE.test(code)) return { kind: 'unavailable' };

  let tag: any = null;
  let biz: any = null;

  // 1. Try Supabase via Admin Client
  const db = createAdminClient();
  if (db) {
    try {
      const { data, error } = await db
        .from('tags')
        .select(`
          id,
          code,
          type,
          destination,
          active,
          business_id,
          assignment_id,
          whatsapp_number,
          whatsapp_message,
          instagram_handle,
          businesses (
            id,
            slug,
            review_url,
            google_review_link,
            deleted_at,
            active
          )
        `)
        .eq('code', code)
        .maybeSingle();

      if (!error && data) {
        tag = data;
        const rawBiz: any = tag.businesses;
        biz = Array.isArray(rawBiz) ? rawBiz[0] : rawBiz;
      }
    } catch (err) {
      console.warn('resolveScan: Supabase query failed, falling back to local store', err);
    }
  }

  // 2. Fallback to local store if Supabase returned nothing or offline
  if (!tag) {
    const localTag = getTagByCode(code);
    if (localTag) {
      tag = localTag;
      if (localTag.business_id) {
        const allBiz = getAllBusinesses();
        biz = allBiz.find((b) => b.id === localTag.business_id || b.slug === localTag.business_id) || null;
      }
    }
  }

  // Check unassigned state (for admin shortcut in /t/[code])
  if (tag && (!tag.business_id || !tag.type)) {
    return { kind: 'unavailable', unassigned: true };
  }

  // Check validity & payment confirmation gate (standees remain inactive until payment is confirmed)
  if (
    !tag || 
    !tag.active || 
    !tag.type || 
    !biz || 
    biz.deleted_at || 
    biz.is_deleted || 
    biz.active === false || 
    biz.payment_status === 'pending'
  ) {
    return { kind: 'unavailable' };
  }

  let res: Resolution;
  if (tag.type === 'whatsapp') {
    const url = waUrl(tag.whatsapp_number, tag.whatsapp_message);
    res = url ? { kind: 'redirect', url } : { kind: 'unavailable' };
  } else if (tag.type === 'instagram') {
    const url = igUrl(tag.instagram_handle);
    res = url ? { kind: 'redirect', url } : { kind: 'unavailable' };
  } else {
    // review standee: direct Google or ZenTap page
    const directReviewUrl = biz.google_review_link || biz.review_url;
    const direct = tag.destination === 'direct' ? safeHttps(directReviewUrl) : null;
    // Fall back to ZenTap page if google review link is empty
    res = direct ? { kind: 'redirect', url: direct } : { kind: 'page', slug: biz.slug };
  }

  // Log scan telemetry (single entry)
  if (res.kind === 'redirect' || (res.kind === 'page' && opts.logPage)) {
    if (db) {
      try {
        await db.from('scans').insert({
          tag_id: tag.id,
          assignment_id: tag.assignment_id || null,
          business_id: tag.business_id,
          source,
          visitor_hash: 'tag-scan',
        });
      } catch (logErr) {
        console.warn('resolveScan: DB scan log error:', logErr);
      }
    }
    // Also record in local store analytics
    if (biz.slug) {
      logScan(biz.slug, source);
    }
  }

  return res;
}
