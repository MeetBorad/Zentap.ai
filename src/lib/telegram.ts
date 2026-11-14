// src/lib/telegram.ts

const DEFAULT_BOT_TOKEN = "8846515289:AAHLwBSEziHZDWyop6fPu9xqK7AbkWd0pvQ";
const DEFAULT_CHAT_ID = "742309073";

export interface OwnerCredentialsNotification {
  business_id?: string;
  businessId?: string;
  business_name?: string;
  businessName?: string;
  city?: string;
  owner_name?: string;
  ownerName?: string;
  owner_phone?: string;
  ownerPhone?: string;
  owner_email?: string;
  ownerEmail?: string;
  login_id?: string;
  loginId?: string;
  password?: string;
  page_url?: string;
  pageUrl?: string;
  liveUrl?: string;
  action_type?: "created" | "regenerated" | "updated";
}

export function generateDeterministicPassword(businessId: string): string {
  const digits = (businessId.match(/\d+/) || [""])[0];
  const num = parseInt(digits || "1", 10);
  const code = (num * 7393 + 1234) % 10000;
  return `ZT@${String(code).padStart(4, "0")}`;
}

function escapeHtml(str?: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send a notification message via Telegram Bot API
 */
export async function sendTelegramMessage(text: string, parseMode: "HTML" | "Markdown" = "HTML"): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram bot token or chat ID is missing");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.warn("Telegram sendMessage API error:", data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Failed to dispatch Telegram message:", err);
    return false;
  }
}

/**
 * Automatically send business owner credentials to founder Telegram chat
 * formatted so it's ready to be forwarded directly to the client.
 */
export async function notifyFounderOwnerCredentials(creds: OwnerCredentialsNotification): Promise<boolean> {
  const actionTitle =
    creds.action_type === "regenerated"
      ? "🔄 Password Regenerated"
      : creds.action_type === "updated"
      ? "✏️ Credentials Updated"
      : "🎉 New Client Login Created";

  const businessId = creds.business_id || creds.businessId || "";
  const businessName = creds.business_name || creds.businessName || businessId || "Business";
  const loginId = creds.login_id || creds.loginId || businessId;
  const password = creds.password || generateDeterministicPassword(businessId);
  const city = creds.city || "Ahmedabad";
  const ownerName = creds.owner_name || creds.ownerName || "";
  const ownerPhone = creds.owner_phone || creds.ownerPhone || "";

  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://www.zentapdigitalsolutions.com";
  const portalUrl = creds.page_url || creds.pageUrl || creds.liveUrl || `${domain}/r/${(businessId || "").toLowerCase()}`;

  const safeBizName = escapeHtml(businessName);
  const safeOwnerName = escapeHtml(ownerName);
  const safeCity = escapeHtml(city);

  const message = `
<b>${actionTitle} — ZenTap.ai</b>

🏢 <b>Business Name:</b> ${safeBizName}
🆔 <b>Business ID:</b> <code>${businessId}</code>
📍 <b>City:</b> ${safeCity}
${safeOwnerName ? `👤 <b>Owner:</b> ${safeOwnerName}\n` : ""}${ownerPhone ? `📞 <b>Phone:</b> ${ownerPhone}\n` : ""}
🔑 <b>Owner Login ID:</b> <code>${loginId}</code>
🔒 <b>Password:</b> <code>${password}</code>
🌐 <b>Live Card / Hub:</b> ${portalUrl}

━━━━━━━━━━━━━━━━━━━━
<b>📋 Ready-to-Send Client Message:</b>
<i>(Tap and hold below to copy & send to business owner)</i>
━━━━━━━━━━━━━━━━━━━━

<code>Hello ${safeOwnerName || safeBizName}! 👋

Here are your official ZenTap Digital Card management credentials:

🏢 Business: ${businessName}
🌐 Your Digital Hub: ${portalUrl}

🔑 Login ID: ${loginId}
🔒 Password: ${password}

To update your contact numbers, review link, or profile:
1. Open your link: ${portalUrl}
2. Tap "Business owner? Manage this card" at the bottom
3. Enter your Login ID & Password

Need help? Contact ZenTap Digital Solutions (+91 92745 60880).</code>
`.trim();

  return sendTelegramMessage(message, "HTML");
}
