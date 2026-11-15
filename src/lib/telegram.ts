// src/lib/telegram.ts

const DEFAULT_BOT_TOKEN = "8846515289:AAHLwBSEziHZDWyop6fPu9xqK7AbkWd0pvQ";
const DEFAULT_CHAT_ID = "742309073";

export const BRAND_NAME = "ZenTap";
export const OFFICIAL_WEBSITE = "https://www.zentapdigitalsolutions.com";
export const OFFICIAL_LOGO_URL = "https://www.zentapdigitalsolutions.com/logo.png";

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

export interface TelegramInlineButton {
  text: string;
  url?: string;
}

export interface NegativeFeedbackNotification {
  business_id: string;
  business_name?: string;
  owner_name?: string;
  owner_phone?: string;
  stars: number;
  feedback_text: string;
  customer_name?: string;
  customer_phone?: string;
  tag_code?: string;
  created_at?: string;
}

export function generateDeterministicPassword(businessId?: string): string {
  const bid = businessId || "ZT-0001";
  const digits = (bid.match(/\d+/) || [""])[0];
  const num = parseInt(digits || "1", 10);
  const code = (num * 7393 + 1234) % 10000;
  return `ZT@${String(code).padStart(4, "0")}`;
}

export function formatIndianPhoneNumber(phone?: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return `91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith("91")) return cleaned;
  return cleaned;
}

function escapeHtml(str?: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send a notification message via Telegram Bot API with optional inline keyboard buttons
 */
export async function sendTelegramMessage(
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML",
  inlineButtons?: TelegramInlineButton[][]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram bot token or chat ID is missing");
    return false;
  }

  try {
    const payload: Record<string, any> = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: false,
    };

    if (inlineButtons && inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineButtons.map((row) =>
          row.map((btn) => ({
            text: btn.text,
            url: btn.url,
          }))
        ),
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
 * Helper to build pre-formatted WhatsApp share link with client credentials
 */
export function buildCredentialsWhatsAppUrl(creds: OwnerCredentialsNotification): string {
  const businessId = creds.business_id || creds.businessId || "";
  const businessName = creds.business_name || creds.businessName || businessId || "Business";
  const loginId = creds.login_id || creds.loginId || businessId;
  const password = creds.password || generateDeterministicPassword(businessId);
  const ownerName = creds.owner_name || creds.ownerName || "";
  const ownerPhone = creds.owner_phone || creds.ownerPhone || "";

  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://www.zentapdigitalsolutions.com";
  const portalUrl =
    creds.page_url || creds.pageUrl || creds.liveUrl || `${domain}/r/${(businessId || "").toLowerCase()}`;

  const intlPhone = formatIndianPhoneNumber(ownerPhone);

  const clientText = `Hello ${ownerName || businessName}! 👋

Here are your official ZenTap Digital Card management credentials:

🏢 Business: ${businessName}
🌐 Your Digital Hub: ${portalUrl}

🔑 Login ID: ${loginId}
🔒 Password: ${password}

To update your contact numbers, review link, or profile:
1. Open your link: ${portalUrl}
2. Tap "Business owner? Manage this card" at the bottom
3. Enter your Login ID & Password

Need help? Contact ZenTap Digital Solutions (+91 92745 60880).`;

  return intlPhone
    ? `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(clientText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(clientText)}`;
}

/**
 * Automatically send business owner credentials to founder Telegram chat
 * formatted so it's ready to be forwarded directly to the client with a 1-tap WhatsApp button.
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
  const portalUrl =
    creds.page_url || creds.pageUrl || creds.liveUrl || `${domain}/r/${(businessId || "").toLowerCase()}`;

  const safeBizName = escapeHtml(businessName);
  const safeOwnerName = escapeHtml(ownerName);
  const safeCity = escapeHtml(city);

  const waUrl = buildCredentialsWhatsAppUrl(creds);

  const message = `
<a href="${OFFICIAL_LOGO_URL}">&#8205;</a>
<b>${actionTitle} — ${BRAND_NAME}</b>

⚡ <b>Brand:</b> ${BRAND_NAME} | 🌐 <a href="${OFFICIAL_WEBSITE}">${OFFICIAL_WEBSITE.replace(/^https?:\/\//, "")}</a>

🏢 <b>Business Name:</b> ${safeBizName}
🆔 <b>Business ID:</b> <code>${businessId}</code>
📍 <b>City:</b> ${safeCity}
${safeOwnerName ? `👤 <b>Owner:</b> ${safeOwnerName}\n` : ""}${ownerPhone ? `📞 <b>Phone:</b> ${ownerPhone}\n` : ""}
🔑 <b>Owner Login ID:</b> <code>${loginId}</code>
🔒 <b>Password:</b> <code>${password}</code>
🌐 <b>Live Card / Hub:</b> ${portalUrl}

━━━━━━━━━━━━━━━━━━━━
<b>📋 Ready-to-Send Client Message:</b>
<i>(Tap and hold below to copy or click WhatsApp button)</i>
━━━━━━━━━━━━━━━━━━━━

<code>Hello ${safeOwnerName || safeBizName}! 👋

Here are your official ${BRAND_NAME} Digital Card management credentials:

🏢 Business: ${businessName}
🌐 Your Digital Hub: ${portalUrl}

🔑 Login ID: ${loginId}
🔒 Password: ${password}

To update your contact numbers, review link, or profile:
1. Open your link: ${portalUrl}
2. Tap "Business owner? Manage this card" at the bottom
3. Enter your Login ID & Password

Official Website: ${OFFICIAL_WEBSITE}
Need help? Contact ${BRAND_NAME} Digital Solutions (+91 92745 60880).</code>
`.trim();

  const inlineButtons: TelegramInlineButton[][] = [
    [{ text: "📲 Send Credentials on WhatsApp", url: waUrl }],
    [
      { text: "🌐 Open Live Digital Hub", url: portalUrl },
      { text: `⚡ ${BRAND_NAME} Website`, url: OFFICIAL_WEBSITE },
    ],
  ];

  return sendTelegramMessage(message, "HTML", inlineButtons);
}

/**
 * Send an urgent alert to founder Telegram when a 1-2 star private customer feedback is submitted
 * (protects Google review rating, and provides 1-tap WhatsApp redirection to the business owner).
 */
export async function notifyFounderNegativeFeedback(fb: NegativeFeedbackNotification): Promise<boolean> {
  const safeBiz = escapeHtml(fb.business_name || fb.business_id);
  const safeOwner = escapeHtml(fb.owner_name || "Store Owner");
  const safeName = escapeHtml(fb.customer_name || "Anonymous Customer");
  const safeText = escapeHtml(fb.feedback_text);
  const customerPhone = fb.customer_phone || "";
  const ownerPhone = fb.owner_phone || "";
  const starsEmoji = fb.stars === 1 ? "⭐ (1 Star)" : "⭐⭐ (2 Stars)";

  // Format Owner WhatsApp Message & Redirect Link
  const cleanOwnerPhone = formatIndianPhoneNumber(ownerPhone);
  const ownerAlertMessage = `⚠️ Urgent Customer Feedback Alert — ${BRAND_NAME}

Hello ${fb.owner_name || fb.business_name || "Store Partner"}! 👋

A customer at your counter just submitted private feedback (${starsEmoji}):

🏢 Business: ${fb.business_name || fb.business_id}
👤 Customer: ${fb.customer_name || "Anonymous Customer"}
${customerPhone ? `📞 Customer Phone: ${customerPhone}\n` : ""}📝 Feedback: "${fb.feedback_text}"

🛡️ This feedback was intercepted privately and was NOT posted to your public Google Review profile.

Please review this with your counter team or contact the customer to resolve the matter!
${OFFICIAL_WEBSITE}`;

  const ownerWaUrl = cleanOwnerPhone
    ? `https://api.whatsapp.com/send?phone=${cleanOwnerPhone}&text=${encodeURIComponent(ownerAlertMessage)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(ownerAlertMessage)}`;

  // Format Customer WhatsApp Link (if phone was provided)
  const cleanCustPhone = formatIndianPhoneNumber(customerPhone);
  const customerWaUrl = cleanCustPhone
    ? `https://api.whatsapp.com/send?phone=${cleanCustPhone}&text=${encodeURIComponent(
      `Hello ${fb.customer_name || "there"}! We noticed your feedback regarding ${fb.business_name || "your visit"}. We sincerely apologize and would love to resolve this for you right away.`
    )}`
    : "";

  const message = `
<a href="${OFFICIAL_LOGO_URL}">&#8205;</a>
🚨 <b>Urgent: Private Feedback Defused (${starsEmoji}) — ${BRAND_NAME}</b>

⚡ <b>Brand:</b> ${BRAND_NAME} | 🌐 <a href="${OFFICIAL_WEBSITE}">${OFFICIAL_WEBSITE.replace(/^https?:\/\//, "")}</a>

🏢 <b>Business:</b> ${safeBiz} (<code>${fb.business_id}</code>)
${fb.owner_name ? `👔 <b>Store Owner:</b> ${safeOwner} (${ownerPhone || "No phone"})\n` : ""}👤 <b>Customer:</b> ${safeName}
${customerPhone ? `📞 <b>Customer Phone:</b> <code>${customerPhone}</code>\n` : ""}${fb.tag_code ? `🏷️ <b>Standee Tag:</b> <code>${fb.tag_code}</code>\n` : ""}
📝 <b>Customer Feedback:</b>
<i>"${safeText}"</i>

🛡️ <i>This was kept private out of public Google view. Tap below to notify the store owner on WhatsApp immediately!</i>
`.trim();

  const buttons: TelegramInlineButton[][] = [];

  // Primary button: Redirect to Business Owner's WhatsApp
  buttons.push([
    {
      text: `📲 WhatsApp Store Owner (${fb.owner_name || "Owner"})`,
      url: ownerWaUrl,
    },
  ]);

  // Secondary button: WhatsApp customer directly if customer phone was provided
  if (customerWaUrl) {
    buttons.push([
      {
        text: "👤 WhatsApp Customer Directly",
        url: customerWaUrl,
      },
    ]);
  }

  // Brand & Website link button
  buttons.push([
    {
      text: `⚡ ${BRAND_NAME} Website`,
      url: OFFICIAL_WEBSITE,
    },
  ]);

  return sendTelegramMessage(message, "HTML", buttons);
}
