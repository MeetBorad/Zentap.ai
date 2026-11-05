// src/lib/tagCache.ts
// Ultra-fast in-memory cache for physical NFC/QR tag resolutions and business page configs.
// Bridges /t/[code] -> /r/[slug] to eliminate duplicate database round trips and cut TTFB from ~4s to ~150ms.

interface CachedTagData {
  tagId: string;
  businessId?: string;
  destination: string;
  googleLink?: string;
  pageConfig?: any;
  business?: any;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL (invalidated immediately on admin save)
const tagCache = new Map<string, CachedTagData>();

export function getCachedTagData(code: string): CachedTagData | null {
  if (!code) return null;
  const key = code.toLowerCase().trim();
  const entry = tagCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    tagCache.delete(key);
    return null;
  }

  return entry;
}

export function setCachedTagData(code: string, data: Omit<CachedTagData, 'timestamp'>): void {
  if (!code) return;
  const key = code.toLowerCase().trim();
  tagCache.set(key, {
    ...data,
    timestamp: Date.now(),
  });
  // Also index by businessId if available
  if (data.businessId) {
    const bizKey = data.businessId.toLowerCase().trim();
    if (bizKey !== key) {
      tagCache.set(bizKey, {
        ...data,
        timestamp: Date.now(),
      });
    }
  }
}

export function invalidateCachedTag(codeOrBizId?: string): void {
  if (!codeOrBizId) {
    tagCache.clear();
    return;
  }
  const key = codeOrBizId.toLowerCase().trim();
  tagCache.delete(key);
  // Also clear any entries matching this as businessId or tagId
  for (const [k, v] of tagCache.entries()) {
    if (v.tagId?.toLowerCase() === key || v.businessId?.toLowerCase() === key) {
      tagCache.delete(k);
    }
  }
}
