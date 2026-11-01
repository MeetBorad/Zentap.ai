// lib/ownerAccess.ts
// Secure Owner Access Engine for ZenTap physical tags and cards
// Enforces:
// 1. SHA-256 PIN hashing
// 2. Lock for 30 minutes after 5 consecutive failed attempts
// 3. Rate limiting by IP and Tag
// 4. Uniform generic error "PIN is incorrect"
// 5. Audit logging to partner_actions
// 6. 15-minute scoped session token

import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTagByCode, getBusinessBySlug, getAllBusinesses, getAllTags, updateTagDetails, adminUpdateBusinessRecord, getBusinessAnalytics } from "@/lib/businessStore";

export const DEFAULT_PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // sha256("1234")
const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const MAX_FAILED_ATTEMPTS = 5;

// In-memory rate limiting and lockout map: key = `${normalizedTagCode}:::${ip}`
interface LockoutEntry {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const lockoutStore = new Map<string, LockoutEntry>();

export function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret.trim()).digest("hex");
}

function getLockoutKey(tagCode: string, ip: string): string {
  return `${tagCode.toLowerCase().trim()}:::${ip.trim()}`;
}

export function checkLockout(tagCode: string, ip: string): { isLocked: boolean; remainingMs: number } {
  const key = getLockoutKey(tagCode, ip);
  const entry = lockoutStore.get(key);
  if (!entry || !entry.lockedUntil) {
    return { isLocked: false, remainingMs: 0 };
  }

  const now = Date.now();
  if (now < entry.lockedUntil) {
    return { isLocked: true, remainingMs: entry.lockedUntil - now };
  }

  // Lockout expired: reset entry
  lockoutStore.delete(key);
  return { isLocked: false, remainingMs: 0 };
}

export function recordFailedAttempt(tagCode: string, ip: string): { lockedNow: boolean } {
  const key = getLockoutKey(tagCode, ip);
  const now = Date.now();
  const entry = lockoutStore.get(key) || { failedAttempts: 0, lockedUntil: null, lastAttempt: now };

  entry.failedAttempts += 1;
  entry.lastAttempt = now;

  let lockedNow = false;
  if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    lockedNow = true;
  }

  lockoutStore.set(key, entry);
  return { lockedNow };
}

export function resetLockout(tagCode: string, ip: string): void {
  const key = getLockoutKey(tagCode, ip);
  lockoutStore.delete(key);
}

// HMAC-based 15-minute Session Token
const SESSION_SECRET = process.env.OWNER_SESSION_SECRET || "zentap_owner_card_session_secret_2026";

export function generateOwnerSessionToken(tagCode: string, businessId?: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${tagCode.toLowerCase().trim()}|${businessId || ""}|${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}|${hmac}`).toString("base64");
  return { token, expiresAt };
}

export function verifyOwnerSessionToken(token: string, tagCode: string): { valid: boolean; businessId?: string; remainingMs: number } {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const [tCode, bId, expStr, hmac] = raw.split("|");
    if (!tCode || !expStr || !hmac) return { valid: false, remainingMs: 0 };

    if (tCode.toLowerCase() !== tagCode.toLowerCase().trim()) {
      return { valid: false, remainingMs: 0 };
    }

    const payload = `${tCode}|${bId}|${expStr}`;
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (expectedHmac !== hmac) {
      return { valid: false, remainingMs: 0 };
    }

    const expiresAt = parseInt(expStr, 10);
    const now = Date.now();
    if (now > expiresAt) {
      return { valid: false, remainingMs: 0 };
    }

    return { valid: true, businessId: bId || undefined, remainingMs: expiresAt - now };
  } catch {
    return { valid: false, remainingMs: 0 };
  }
}

// Log action to partner_actions (Supabase + console audit)
export async function logPartnerAction(entry: {
  tag_code: string;
  business_id?: string | null;
  action: "pin_verify_success" | "pin_verify_fail" | "lockout" | "details_update" | "card_reset";
  ip_address?: string | null;
  details?: Record<string, any>;
}): Promise<void> {
  const now = new Date().toISOString();
  try {
    const db = createAdminClient();
    if (db) {
      await db.from("partner_actions").insert({
        tag_code: entry.tag_code.toLowerCase().trim(),
        business_id: entry.business_id || null,
        action: entry.action,
        ip_address: entry.ip_address || "unknown",
        details: entry.details || {},
        created_at: now,
      });
    }
  } catch (err) {
    console.warn("logPartnerAction notice (DB offline or table pending):", err);
  }
}
