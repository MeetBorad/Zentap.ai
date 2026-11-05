/**
 * ZenTap.ai — Hardware Tag & Routing Service
 *
 * Encapsulates URL formatting and NFC/QR code redirection logic.
 */

const CODE_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;

export function isValidTagCode(code: string): boolean {
  return CODE_RE.test(code.toLowerCase().trim());
}

export function formatWhatsAppUrl(number?: string | null, message?: string | null): string | null {
  const digits = (number ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}` + (message ? `?text=${encodeURIComponent(message)}` : "");
}

export function formatInstagramUrl(handleOrUrl?: string | null): string | null {
  const h = (handleOrUrl ?? "")
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  return /^[A-Za-z0-9._]{1,30}$/.test(h) ? `https://www.instagram.com/${h}` : null;
}

export function formatSafeHttps(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const withProtocol = trimmed.startsWith("http://") || trimmed.startsWith("https://") 
    ? trimmed 
    : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
