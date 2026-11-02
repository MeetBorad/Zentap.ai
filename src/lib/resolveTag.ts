// lib/resolveTag.ts (server-only: uses Supabase service role key with local store fallback)
import { createAdminClient } from '@/lib/supabase/admin';
import { getTagByCode, getAllBusinesses, logScan } from '@/lib/businessStore';
import { getAllQrNfcTags, getAllGoogleReviewLinks, getAllSocialLinks, getAllPageEditorConfigs } from '@/lib/adminPlatformStore';

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

  // 1. Direct Supabase Query against qr_nfc_tags and connected tables
  const db = createAdminClient();
  if (db) {
    try {
      const { data: tagRow } = await db
        .from('qr_nfc_tags')
        .select('*')
        .ilike('tag_id', code)
        .is('deleted_at', null)
        .maybeSingle();

      // Check linked google_review_links table as well
      const { data: grlRow } = await db
        .from('google_review_links')
        .select('*')
        .ilike('tag_id', code)
        .is('deleted_at', null)
        .maybeSingle();

      // Check page_editor_configs table as well
      const { data: pageConfig } = await db
        .from('page_editor_configs')
        .select('*')
        .or(`tag_id.ilike.${code}${tagRow?.business_id ? `,business_id.ilike.${tagRow.business_id}` : ''}${grlRow?.business_id ? `,business_id.ilike.${grlRow.business_id}` : ''}`)
        .is('deleted_at', null)
        .maybeSingle();

      const localGrl = getAllGoogleReviewLinks().find((g) => g.tag_id.toLowerCase() === code);
      const localCfg = getAllPageEditorConfigs().find(
        (p) => p.tag_id.toLowerCase() === code || (tagRow?.business_id && p.business_id.toLowerCase() === tagRow.business_id.toLowerCase())
      );

      const effectiveDest =
        grlRow?.destination ||
        localGrl?.destination ||
        tagRow?.destination ||
        (pageConfig?.setup_status === 'completed' || localCfg?.setup_status === 'completed' ? 'zentap_google' : null) ||
        'not_assigned';

      const effectiveGoogleLink =
        (tagRow?.google_review_link || '').trim() ||
        (grlRow?.business_google_review_link || '').trim() ||
        (localGrl?.business_google_review_link || '').trim() ||
        (pageConfig?.config_data?.google_link || '').trim() ||
        (localCfg?.config_data?.google_link || '').trim();

      const effectiveBusinessId =
        tagRow?.business_id ||
        grlRow?.business_id ||
        pageConfig?.business_id ||
        localCfg?.business_id;

      if (tagRow) {
        // Increment scans_count asynchronously
        Promise.resolve(
          db.from('qr_nfc_tags')
            .update({ scans_count: (tagRow.scans_count || 0) + 1 })
            .eq('id', tagRow.id)
        ).catch(() => {});
      }

      // 1. Direct Google review:
      if (effectiveDest === 'direct_google') {
        if (effectiveGoogleLink) {
          const formatted = effectiveGoogleLink.startsWith('http://') || effectiveGoogleLink.startsWith('https://')
            ? effectiveGoogleLink
            : `https://${effectiveGoogleLink}`;
          return { kind: 'redirect', url: formatted };
        }
        return { kind: 'unavailable', unassigned: true };
      }

      // 2. Zentap Google Review (Standee Review Assistant):
      if (effectiveDest === 'zentap_google') {
        const effectiveStatus = pageConfig?.setup_status || localCfg?.setup_status;
        const isDesigned = effectiveStatus === 'completed' || Boolean(pageConfig?.config_data || localCfg?.config_data);

        if (!isDesigned) {
          // Setup status is Pending: show "Business Profile Under Process" (/unavailable)
          return { kind: 'unavailable', unassigned: false };
        }

        let slug = code;
        if (effectiveBusinessId) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveBusinessId);
          const bizQuery = isUuid
            ? db.from('businesses').select('slug').eq('id', effectiveBusinessId).maybeSingle()
            : db.from('businesses').select('slug').eq('slug', effectiveBusinessId.toLowerCase()).maybeSingle();
          const { data: bizRow } = await bizQuery;
          if (bizRow?.slug) {
            slug = bizRow.slug;
          }
        }

        return { kind: 'page', slug };
      }

      // 3. Social links for NFC Cards:
      if (tagRow?.product_type === 'Business NFC Card' && effectiveDest === 'assigned' && tagRow.social_link) {
        let destUrl = tagRow.social_link.trim();
        if (tagRow.social_platform === 'WhatsApp') {
          const wa = waUrl(destUrl);
          if (wa) return { kind: 'redirect', url: wa };
        } else if (tagRow.social_platform === 'Instagram') {
          const ig = igUrl(destUrl);
          if (ig) return { kind: 'redirect', url: ig };
        }
        const safe = safeHttps(destUrl);
        if (safe) return { kind: 'redirect', url: safe };
      }

      // 4. If destination not assigned or missing:
      if (!effectiveDest || effectiveDest === 'not_assigned' || !effectiveBusinessId) {
        return { kind: 'unavailable', unassigned: true };
      }
    } catch (err) {
      console.warn('resolveScan: qr_nfc_tags query failed', err);
    }
  }

  // 0. Fallback check for local store
  const allPlatformTags = getAllQrNfcTags();
  const matchedPlatformTag = allPlatformTags.find((t) => t.tag_id.toLowerCase() === code);
  if (matchedPlatformTag) {
    if (!matchedPlatformTag.business_id) {
      return { kind: 'unavailable', unassigned: true };
    }

    if (matchedPlatformTag.product_type === 'Counter Standee') {
      const gLinks = getAllGoogleReviewLinks();
      const gLink = gLinks.find((g) => g.tag_id.toLowerCase() === code);
      if (gLink) {
        if (gLink.destination === 'direct_google' && gLink.business_google_review_link) {
          const direct = safeHttps(gLink.business_google_review_link);
          if (direct) return { kind: 'redirect', url: direct };
        }
        if (gLink.destination === 'zentap_google') {
          const peConfigs = getAllPageEditorConfigs();
          const pe = peConfigs.find((p) => p.tag_id.toLowerCase() === code);
          if (pe && pe.setup_status === 'completed') {
            return { kind: 'page', slug: matchedPlatformTag.business_id?.toLowerCase() || 'zentap' };
          }
          return { kind: 'unavailable', unassigned: false };
        }
      }
    } else if (matchedPlatformTag.product_type === 'Business NFC Card') {
      const sLinks = getAllSocialLinks();
      const sLink = sLinks.find((s) => s.tag_id.toLowerCase() === code);
      if (sLink && sLink.destination === 'assigned' && sLink.social_link) {
        let destUrl = sLink.social_link;
        if (sLink.social_platform === 'WhatsApp') {
          const wa = waUrl(destUrl);
          if (wa) return { kind: 'redirect', url: wa };
        } else if (sLink.social_platform === 'Instagram') {
          const ig = igUrl(destUrl);
          if (ig) return { kind: 'redirect', url: ig };
        }
        const safe = safeHttps(destUrl);
        if (safe) return { kind: 'redirect', url: safe };
      }
    }
  }

  let tag: any = null;
  let biz: any = null;

  // 1. Try Supabase via Admin Client
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
