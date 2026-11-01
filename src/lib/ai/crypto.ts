// src/lib/ai/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

function getEncryptionKey(): Buffer {
  const secret = 
    process.env.APP_ENC_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    "zentap_ai_resilience_master_secret_2026";
  
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt an API key using AES-256-GCM.
 * Output format: hex(iv):hex(tag):hex(ciphertext)
 */
export function encryptApiKey(plainKey: string): string {
  if (!plainKey) return "";
  const trimmed = plainKey.trim();
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(trimmed, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt an AES-256-GCM encrypted API key.
 */
export function decryptApiKey(cipherString: string): string {
  if (!cipherString) return "";
  const parts = cipherString.split(":");
  if (parts.length !== 3) {
    // If not encrypted in standard format, return as-is for backwards compatibility in dev
    return cipherString;
  }

  try {
    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("decryptApiKey error:", err);
    return "";
  }
}

/**
 * Mask an API key for safe UI display (e.g. sk-ant-...4a89).
 */
export function maskApiKey(plainOrEncrypted: string): string {
  if (!plainOrEncrypted) return "None";
  const clean = plainOrEncrypted.trim();
  if (clean.length <= 8) return "••••••••";

  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}••••••••${suffix}`;
}
