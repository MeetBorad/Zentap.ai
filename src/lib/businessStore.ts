// ZenTap Business Store & Analytics
// Isomorphic store: Works on both server (route handlers/SSR) and browser (localStorage)

export type ProductPlan =
  | "business_review_standee"
  | "zentap_smart_review_standee"
  | "zentap_smart_business_card"
  | "custom_solution"
  | "simple_direct"
  | "metal_reply"
  | "pvc_nfc"
  | "corporate_bulk"
  | "card_500"
  | "standee_1500"
  | "standee_auto_2000"
  | "franchise_custom";

export interface CustomCardDesign {
  format: "standee" | "card";
  material: "metal_obsidian" | "brushed_silver" | "brushed_gold" | "acrylic_minimal" | "executive_emerald";
  logo_url?: string;
  logo_preview?: string;
  business_name?: string;
  tagline?: string;
  accent_color?: string;
}

export interface LeadRecord {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  service_needed?: string;
  message?: string;
  source: "qr" | "nfc" | "web";
  status: "new" | "contacted" | "closed";
  at: string;
}

export type TagType = "review" | "whatsapp" | "instagram";
export type TagForm = "standee" | "card";
export type TagDestination = "zentap_page" | "direct";

export interface TagRecord {
  id: string;
  code: string;
  form: TagForm;
  type?: TagType | null;
  business_id?: string | null;
  partner_id?: string | null; // owner partner who owns this card/standee
  assignment_id?: string | null;
  destination: TagDestination;
  active: boolean;
  chip_written?: boolean; // whether the NFC chip has been written and verified with NFC Tools
  pin_hash?: string | null; // SHA-256 hashed owner card PIN (default "1234")
  password_hash?: string | null; // optional second secret / business password
  reset_level?: "off" | "needs_approval" | "direct" | null;
  label?: string | null;
  whatsapp_number?: string | null;
  whatsapp_message?: string | null;
  instagram_handle?: string | null;
  created_at: string;
  // joined / derived UI helper fields
  business_name?: string | null;
  business_slug?: string | null;
  partner_name?: string | null;
  scan_count?: number;
}

export interface PartnerRecord {
  id: string;
  name: string;
  phone: string;
  pin_hash: string;
  plain_pin?: string; // shown once upon creation or reset
  can_register: boolean;
  can_edit: boolean;
  reset_level: "off" | "needs_approval" | "direct";
  status: "active" | "locked" | "disabled";
  failed_attempts: number;
  locked_until?: string | null;
  created_at: string;
  updated_at?: string;
  // derived UI helper fields
  cards_owned?: number;
  cards_in_use?: number;
  last_activity?: string | null;
}

export interface ResetRequestRecord {
  id: string;
  tag_id: string;
  tag_code: string;
  partner_id?: string | null;
  partner_name?: string | null;
  business_id?: string | null;
  business_name?: string | null;
  type: "card_reset" | "pin_reset";
  status: "pending" | "approved" | "rejected";
  notes?: string | null;
  created_at: string;
  decided_at?: string | null;
  decided_by?: string | null;
}

export interface PartnerActionRecord {
  id: string;
  tag_code: string;
  tag_id?: string | null;
  partner_id?: string | null;
  business_id?: string | null;
  action: "pin_verify_success" | "pin_verify_fail" | "lockout" | "details_update" | "card_reset" | "partner_created" | "pin_reset";
  ip_address?: string | null;
  details?: Record<string, any>;
  created_at: string;
}

export interface TagAssignmentRecord {
  id: string;
  tag_id: string;
  business_id: string;
  type: TagType;
  label?: string | null;
  assigned_at: string;
  released_at?: string | null;
}

export interface BusinessRecord {
  id: string;
  owner_user_id: string;
  name: string;
  owner_name?: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gbp_link: string;
  slug: string; // unique permanent slug e.g. cafe-aroma
  slug_locked?: boolean;
  plan: ProductPlan | null;
  payment_status: "pending" | "paid" | "failed";
  review_url: string | null;
  google_review_link?: string | null;
  active: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  valid_until?: string | null;
  service_valid_until?: string | null;
  address?: string;
  category?: string;
  custom_chips?: string[];
  // Dynamic Profile (Interaction)
  whatsapp?: string;
  whatsapp_number?: string;
  whatsapp_message?: string;
  booking_url?: string;
  portfolio_url?: string;
  instagram?: string;
  instagram_url?: string;
  website_url?: string;
  redirect_mode?: "direct_review" | "interactive_profile";
  pin_hash?: string | null;
  password_hash?: string | null;
  custom_design?: CustomCardDesign;
  created_at: string;
}

export interface ScanRecord {
  id: string;
  business_id: string;
  source: "qr" | "nfc";
  visitor_hash: string;
  at: string;
}

export interface EventRecord {
  id: string;
  business_id: string;
  type: "rating" | "review_click" | "private_feedback";
  rating?: number | null;
  at: string;
}

export interface FeedbackRecord {
  id: string;
  business_id: string;
  rating: number;
  text: string;
  customer_name?: string;
  customer_phone?: string;
  at: string;
}

export interface OrderRecord {
  id: string;
  business_id: string;
  plan: ProductPlan;
  amount: number;
  courier: number;
  status: "processing" | "in_production" | "shipped" | "delivered";
  razorpay_id: string;
  tracking_number?: string;
  courier_name?: string;
  estimated_delivery?: string;
  custom_design?: CustomCardDesign;
  at: string;
}

export interface QuotationRecord {
  id: string; // e.g. ZT-QTN-84920
  business_id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  branch_count: number;
  standee_count: number;
  hardware_type: "matte_obsidian" | "laser_wood" | "card_and_standee";
  multiple_qr: boolean;
  addons: string[];
  estimated_hardware_total: number;
  estimated_monthly_sub: number;
  notes: string;
  status: "pending_review" | "contacted" | "quote_sent" | "approved";
  at: string;
}

const STORAGE_KEY_PREFIX = "zentap_v2_biz_";
const ALL_BIZ_INDEX_KEY = "zentap_v2_all_businesses";
const PURGED_BIZ_IDS_KEY = "zentap_v2_purged_biz_ids";
const SCANS_KEY_PREFIX = "zentap_v2_scans_";
const EVENTS_KEY_PREFIX = "zentap_v2_events_";
const FEEDBACK_KEY_PREFIX = "zentap_v2_feedback_";
const ORDERS_KEY_PREFIX = "zentap_v2_orders_";
const QUOTATIONS_INDEX_KEY = "zentap_v2_quotations";
const LEADS_KEY_PREFIX = "zentap_v2_leads_";

export function getPurgedBusinessIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PURGED_BIZ_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addPurgedBusinessId(bizId: string) {
  if (typeof window === "undefined" || !bizId) return;
  try {
    const list = getPurgedBusinessIds();
    if (!list.includes(bizId)) {
      list.push(bizId);
      localStorage.setItem(PURGED_BIZ_IDS_KEY, JSON.stringify(list));
    }
  } catch {}
}

// Google Review Link Validation Regex as specified
export const GOOGLE_REVIEW_LINK_REGEX = /^https:\/\/(g\.page\/r\/|search\.google\.com\/local\/writereview\?placeid=|maps\.app\.goo\.gl\/)/i;

export function validateGoogleReviewUrl(url: string): { valid: boolean; isAppShareLink: boolean; message: string } {
  if (!url || !url.trim()) {
    return { valid: false, isAppShareLink: false, message: "URL cannot be empty" };
  }
  const cleanUrl = url.trim();
  const valid = GOOGLE_REVIEW_LINK_REGEX.test(cleanUrl);
  if (!valid) {
    return {
      valid: false,
      isAppShareLink: false,
      message: "Link must start with https://g.page/r/, https://search.google.com/local/writereview?placeid=, or https://maps.app.goo.gl/",
    };
  }
  const isAppShareLink = cleanUrl.includes("maps.app.goo.gl");
  return {
    valid: true,
    isAppShareLink,
    message: isAppShareLink
      ? "Note: maps.app.goo.gl links open the business profile, not direct review form. Recommended to use g.page/r/ or placeid link."
      : "Valid Google Review Link",
  };
}

// Generate clean, permanent slug for physical NFC / QR encoding
export function generatePermanentSlug(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "business";
  return base;
}

// Generate unique slug with random suffix (e.g. virat-gold-palace-x7k2)
export function generateRandomSlug(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "business";
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

// Courier charge calculator (Flat rate with pincode zone lookup placeholder)
export function calculateCourierCharge(pincode: string): { amount: number; zone: string } {
  const cleanPin = pincode.replace(/\D/g, "");
  if (!cleanPin) return { amount: 99, zone: "Standard Pan-India" };
  const firstDigit = cleanPin[0];
  if (firstDigit === "3") {
    // Gujarat / Local Zone
    return { amount: 69, zone: "West Region (Priority Next-Day)" };
  } else if (["1", "2", "4", "5", "6"].includes(firstDigit)) {
    // Metro / Major zones
    return { amount: 99, zone: "Standard Express Delivery" };
  }
  // Northeast / Island / Remote zones
  return { amount: 149, zone: "Special Delivery Zone" };
}

// Sample Demonstration Business (ZenTap Official Google Review Assistant Showcase)
export const SAMPLE_DEMO_BUSINESS: BusinessRecord = {
  id: "sample-demo-biz-01",
  owner_user_id: "demo-owner",
  name: "ZenTap Digital Solutions",
  email: "contact@zentapdigitalsolutions.com",
  phone: "+91 92745 60880",
  city: "Ahmedabad",
  state: "Gujarat",
  country: "India",
  pincode: "380001",
  gbp_link: "https://share.google/9PoGc4WwJpFoTgAMh",
  slug: "zentap",
  plan: "metal_reply",
  payment_status: "paid",
  review_url: "https://www.google.com/maps/place//@23.0393793,72.6446507,17z/data=!3m1!4b1!4m3!3m2!1s0x395e87bea719fdfb:0x6828d7aee1d857d2!12e1?entry=ttu&g_ep=EgoyMDI2MTAyNy4wIKXMDSoASAFQAw%3D%3D",
  active: true,
  address: "Ahmedabad, Gujarat, India",
  category: "NFC & Dynamic QR Smart Hardware Solutions",
  whatsapp_number: "919274560880",
  whatsapp_message: "Hello ZenTap Team! I scanned your standee and would like to inquire about NFC products for my business.",
  booking_url: "https://calendly.com",
  portfolio_url: "https://www.zentapdigitalsolutions.com/#products",
  instagram_url: "https://www.instagram.com/zentapdigitalsolutions",
  website_url: "https://www.zentapdigitalsolutions.com",
  redirect_mode: "interactive_profile",
  custom_design: {
    format: "standee",
    material: "metal_obsidian",
    business_name: "ZenTap Digital",
    tagline: "Tap Phone or Scan QR to Connect & Review",
    accent_color: "#D94826",
  },
  custom_chips: [
    "Instant NFC Phone Tap",
    "Dynamic QR Standee",
    "Fast 5-Star Reviews",
    "Laser-Engraved Standee Quality",
    "Prompt Customer Support",
    "Verified Google Maps Boost",
  ],
  created_at: "2026-09-01T10:00:00.000Z",
};

// Initial admin seed fleet
const INITIAL_FLEET: BusinessRecord[] = [
  SAMPLE_DEMO_BUSINESS,
  {
    id: "biz-102",
    owner_user_id: "user-102",
    name: "The Urban Bistro & Lounge",
    email: "hello@urbanbistro.in",
    phone: "+91 98251 44210",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    pincode: "380054",
    gbp_link: "https://maps.google.com/?q=urban+bistro+lounge",
    slug: "the-urban-bistro-a82k",
    plan: "standee_1500",
    payment_status: "paid",
    review_url: "https://g.page/r/urban-bistro/review",
    active: true,
    address: "Plot 42, Sindhu Bhavan Road",
    category: "Artisanal Cafe & Fine Dining",
    created_at: "2026-09-12T10:00:00.000Z",
  },
  {
    id: "biz-103",
    owner_user_id: "user-103",
    name: "Iron Works Fitness Arena",
    email: "admin@ironworksgym.in",
    phone: "+91 98980 12345",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    pincode: "380015",
    gbp_link: "https://maps.google.com/?q=iron+works+fitness",
    slug: "iron-works-fitness-p9m4",
    plan: "card_500",
    payment_status: "paid",
    review_url: null, // Awaiting review link
    active: true,
    address: "3rd Floor, Apex Mall, SG Highway",
    category: "Gym & Premium Wellness Club",
    created_at: "2026-10-01T10:00:00.000Z",
  },
];

// Get or initialize user business record (Synced with Admin Master Table)
export function getUserBusiness(userId: string, email: string, initialName?: string): BusinessRecord {
  if (typeof window === "undefined") {
    return {
      ...SAMPLE_DEMO_BUSINESS,
      id: `biz_${userId}`,
      owner_user_id: userId,
      email,
      name: initialName || "My Business",
      slug: generateRandomSlug(initialName || "my-business"),
    };
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);

    // Look for matching business in Admin Master Table
    const all = getAllBusinesses();
    const fromMaster = all.find(
      (b) =>
        b.owner_user_id === userId ||
        (email && b.email && b.email.toLowerCase() === email.toLowerCase()) ||
        b.id === `biz_${userId}`
    );

    if (raw) {
      const parsed: BusinessRecord = JSON.parse(raw);
      if (fromMaster) {
        const merged: BusinessRecord = {
          ...parsed,
          name: fromMaster.name || parsed.name,
          slug: fromMaster.slug || parsed.slug,
          review_url: fromMaster.review_url !== undefined ? fromMaster.review_url : parsed.review_url,
          gbp_link: fromMaster.gbp_link !== undefined ? fromMaster.gbp_link : parsed.gbp_link,
          plan: fromMaster.plan !== undefined ? fromMaster.plan : parsed.plan,
          payment_status: fromMaster.payment_status || parsed.payment_status,
          active: fromMaster.active !== undefined ? fromMaster.active : parsed.active,
          phone: fromMaster.phone || parsed.phone,
          city: fromMaster.city || parsed.city,
        };
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }

    if (fromMaster) {
      localStorage.setItem(key, JSON.stringify(fromMaster));
      return fromMaster;
    }

    const defaultBizName = initialName || (email ? email.split("@")[0].toUpperCase() + " ENTERPRISES" : "My Business");
    const newBiz: BusinessRecord = {
      id: `biz_${userId}`,
      owner_user_id: userId,
      name: defaultBizName,
      email: email || "",
      phone: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      gbp_link: "",
      slug: generateRandomSlug(defaultBizName),
      plan: null,
      payment_status: "pending",
      review_url: null,
      active: true,
      address: "",
      category: "Retail / Hospitality Business",
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(newBiz));
    saveToGlobalIndex(newBiz);
    return newBiz;
  } catch {
    return SAMPLE_DEMO_BUSINESS;
  }
}

// Alias for backwards compatibility
export const getUserBusinessProfile = getUserBusiness;

// Update user business profile
export function updateUserBusiness(userId: string, updates: Partial<BusinessRecord>): BusinessRecord {
  if (typeof window === "undefined") {
    return { ...SAMPLE_DEMO_BUSINESS, ...updates };
  }

  try {
    const existing = getUserBusiness(userId, updates.email || "");
    const updated: BusinessRecord = {
      ...existing,
      ...updates,
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
    saveToGlobalIndex(updated);
    return updated;
  } catch {
    return { ...SAMPLE_DEMO_BUSINESS, ...updates };
  }
}

// Find business by slug (for public /r/:slug and /r/:slug/go)
export function getBusinessBySlug(slug: string): BusinessRecord | null {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();

  if (
    clean === "zentap" ||
    clean === "zentap-in" ||
    clean === "sample" ||
    clean === "demo" ||
    clean === "virat-gold-palace"
  ) {
    return SAMPLE_DEMO_BUSINESS;
  }

  const all = getAllBusinesses();
  const match = all.find((b) => b.slug.toLowerCase() === clean || b.id === slug);
  return match || null;
}

// Find business by id
export function getBusinessById(id: string): BusinessRecord | null {
  if (!id) return null;
  const all = getAllBusinesses();
  const match = all.find((b) => b.id === id);
  if (match) return match;
  if (SAMPLE_DEMO_BUSINESS.id === id) return SAMPLE_DEMO_BUSINESS;
  return null;
}

// Save or update to global directory index (used by Admin Dashboard)
function saveToGlobalIndex(record: BusinessRecord) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ALL_BIZ_INDEX_KEY);
    let list: BusinessRecord[] = raw ? JSON.parse(raw) : [...INITIAL_FLEET];
    const idx = list.findIndex(
      (b) =>
        b.id === record.id ||
        (record.owner_user_id && b.owner_user_id === record.owner_user_id) ||
        (record.email && b.email && b.email.toLowerCase() === record.email.toLowerCase())
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.unshift(record);
    }
    localStorage.setItem(ALL_BIZ_INDEX_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("saveToGlobalIndex error:", err);
  }
}

// Get all businesses (Admin Table View)
export function getAllBusinesses(): BusinessRecord[] {
  if (typeof window === "undefined") return INITIAL_FLEET;
  try {
    const purgedIds = getPurgedBusinessIds();
    const raw = localStorage.getItem(ALL_BIZ_INDEX_KEY);
    let list: BusinessRecord[] = raw ? JSON.parse(raw) : [];
    INITIAL_FLEET.forEach((seed) => {
      if (!purgedIds.includes(seed.id) && !list.some((b) => b.id === seed.id || b.slug === seed.slug)) {
        list.push(seed);
      }
    });
    return list.filter((b) => !purgedIds.includes(b.id));
  } catch {
    return INITIAL_FLEET;
  }
}

// Admin Add Business (Supreme Fleet Creation)
export function addBusinessRecord(bizData: Omit<BusinessRecord, "id" | "created_at"> & { id?: string }): BusinessRecord {
  const newBiz: BusinessRecord = {
    id: bizData.id || `biz-${Date.now()}`,
    owner_user_id: bizData.owner_user_id || `owner-${Date.now()}`,
    name: bizData.name.trim(),
    owner_name: bizData.owner_name?.trim() || "",
    email: bizData.email.trim(),
    phone: bizData.phone?.trim() || "",
    city: bizData.city?.trim() || "Ahmedabad",
    state: bizData.state?.trim() || "Gujarat",
    country: bizData.country || "India",
    pincode: bizData.pincode || "",
    gbp_link: bizData.gbp_link || "",
    slug: bizData.slug.toLowerCase().trim(),
    plan: bizData.plan || "standee_1500",
    payment_status: bizData.payment_status || "paid",
    review_url: bizData.review_url || null,
    active: bizData.active !== undefined ? bizData.active : true,
    is_deleted: false,
    deleted_at: null,
    service_valid_until: bizData.service_valid_until || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // +6 months default
    address: bizData.address || "",
    category: bizData.category || "General",
    custom_chips: bizData.custom_chips || [],
    whatsapp_number: bizData.whatsapp_number?.trim() || "",
    whatsapp_message: bizData.whatsapp_message || "Hello, I visited your store and would like to connect!",
    instagram_url: bizData.instagram_url?.trim() || "",
    redirect_mode: bizData.redirect_mode || "interactive_profile",
    created_at: new Date().toISOString(),
  };

  saveToGlobalIndex(newBiz);
  return newBiz;
}

// Soft Delete: marks business inactive & deleted, preserving physical standee slug
export function softDeleteBusiness(bizId: string): BusinessRecord[] {
  return adminUpdateBusinessRecord(bizId, {
    active: false,
    is_deleted: true,
    deleted_at: new Date().toISOString(),
  });
}

// Restore Soft-Deleted Business
export function restoreBusiness(bizId: string): BusinessRecord[] {
  return adminUpdateBusinessRecord(bizId, {
    active: true,
    is_deleted: false,
    deleted_at: null,
  });
}

// Permanent Delete: complete removal from system
export function permanentlyDeleteBusiness(bizId: string): BusinessRecord[] {
  if (typeof window === "undefined") return INITIAL_FLEET;
  try {
    addPurgedBusinessId(bizId);
    const purgedIds = getPurgedBusinessIds();
    const raw = localStorage.getItem(ALL_BIZ_INDEX_KEY);
    let list: BusinessRecord[] = raw ? JSON.parse(raw) : [];
    list = list.filter((b) => b.id !== bizId && !purgedIds.includes(b.id));
    localStorage.setItem(ALL_BIZ_INDEX_KEY, JSON.stringify(list));
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${bizId}`);
    return list;
  } catch {
    return INITIAL_FLEET;
  }
}

// Toggle Redirect Mode (ON = interactive_profile, OFF = direct_review)
export function updateBusinessRedirectMode(bizId: string, mode: "direct_review" | "interactive_profile"): BusinessRecord[] {
  return adminUpdateBusinessRecord(bizId, { redirect_mode: mode });
}

// Admin update (e.g. manual Google Review Link insertion, status, slug)
export function adminUpdateBusinessRecord(bizId: string, updates: Partial<BusinessRecord>): BusinessRecord[] {
  if (typeof window === "undefined") return INITIAL_FLEET;
  try {
    let list = getAllBusinesses();
    const idx = list.findIndex((b) => b.id === bizId);
    if (idx >= 0) {
      const current = list[idx];
      const sanitizedUpdates = { ...updates };

      // Slug lock rule: can be edited once after creation, then permanently locked
      if (sanitizedUpdates.slug !== undefined && sanitizedUpdates.slug !== current.slug) {
        if (current.slug_locked) {
          // Locked: reject slug mutation
          delete sanitizedUpdates.slug;
        } else {
          // Allow once, then lock
          sanitizedUpdates.slug = sanitizedUpdates.slug.toLowerCase().trim();
          sanitizedUpdates.slug_locked = true;
        }
      }

      // Sync field aliases
      if (sanitizedUpdates.google_review_link && !sanitizedUpdates.review_url) {
        sanitizedUpdates.review_url = sanitizedUpdates.google_review_link;
      } else if (sanitizedUpdates.review_url && !sanitizedUpdates.google_review_link) {
        sanitizedUpdates.google_review_link = sanitizedUpdates.review_url;
      }
      if (sanitizedUpdates.whatsapp && !sanitizedUpdates.whatsapp_number) {
        sanitizedUpdates.whatsapp_number = sanitizedUpdates.whatsapp;
      } else if (sanitizedUpdates.whatsapp_number && !sanitizedUpdates.whatsapp) {
        sanitizedUpdates.whatsapp = sanitizedUpdates.whatsapp_number;
      }
      if (sanitizedUpdates.instagram && !sanitizedUpdates.instagram_url) {
        sanitizedUpdates.instagram_url = sanitizedUpdates.instagram;
      } else if (sanitizedUpdates.instagram_url && !sanitizedUpdates.instagram) {
        sanitizedUpdates.instagram = sanitizedUpdates.instagram_url;
      }

      list[idx] = { ...current, ...sanitizedUpdates };
      localStorage.setItem(ALL_BIZ_INDEX_KEY, JSON.stringify(list));

      if (list[idx].owner_user_id) {
        const userKey = `${STORAGE_KEY_PREFIX}${list[idx].owner_user_id}`;
        const userRaw = localStorage.getItem(userKey);
        if (userRaw) {
          const parsed = JSON.parse(userRaw);
          localStorage.setItem(userKey, JSON.stringify({ ...parsed, ...sanitizedUpdates }));
        }
      }
    }
    return list;
  } catch {
    return INITIAL_FLEET;
  }
}

// Log a scan event (Deduplicated by visitor hash per day)
export function logScan(slug: string, source: "qr" | "nfc" = "nfc", isPreview: boolean = false): void {
  if (typeof window === "undefined" || isPreview) return;
  try {
    const biz = getBusinessBySlug(slug);
    if (!biz || !biz.active) return;

    // Simple browser visitor hash
    const visitorHash = btoa(navigator.userAgent.slice(0, 30) + screen.width).slice(0, 16);
    const today = new Date().toISOString().split("T")[0];
    const dedupeKey = `scan_dedupe_${biz.id}_${visitorHash}_${today}`;
    
    // Check if already scanned today by this visitor
    if (sessionStorage.getItem(dedupeKey)) {
      return; // Deduplicated
    }
    sessionStorage.setItem(dedupeKey, "1");

    const scan: ScanRecord = {
      id: `scan_${Date.now()}`,
      business_id: biz.id,
      source,
      visitor_hash: visitorHash,
      at: new Date().toISOString(),
    };

    const key = `${SCANS_KEY_PREFIX}${biz.id}`;
    const raw = localStorage.getItem(key);
    const list: ScanRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(scan);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
  } catch (err) {
    console.warn("logScan error:", err);
  }
}

// Log generic telemetry event (rating, review_click, private_feedback)
export function logEvent(slug: string, type: "rating" | "review_click" | "private_feedback", rating?: number): void {
  if (typeof window === "undefined") return;
  try {
    const biz = getBusinessBySlug(slug);
    if (!biz) return;

    const eventItem: EventRecord = {
      id: `event_${Date.now()}`,
      business_id: biz.id,
      type,
      rating: rating ?? null,
      at: new Date().toISOString(),
    };

    const key = `${EVENTS_KEY_PREFIX}${biz.id}`;
    const raw = localStorage.getItem(key);
    const list: EventRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(eventItem);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 300)));
  } catch (err) {
    console.warn("logEvent error:", err);
  }
}

// Save private negative feedback (1 or 2 stars)
export function logFeedback(slug: string, rating: number, text: string, name?: string, phone?: string): void {
  if (typeof window === "undefined") return;
  try {
    const biz = getBusinessBySlug(slug);
    if (!biz) return;

    const fb: FeedbackRecord = {
      id: `fb_${Date.now()}`,
      business_id: biz.id,
      rating,
      text: text.trim(),
      customer_name: name || "Anonymous Customer",
      customer_phone: phone || "Not specified",
      at: new Date().toISOString(),
    };

    const key = `${FEEDBACK_KEY_PREFIX}${biz.id}`;
    const raw = localStorage.getItem(key);
    const list: FeedbackRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(fb);
    localStorage.setItem(key, JSON.stringify(list));

    // Also log event
    logEvent(slug, "private_feedback", rating);
  } catch (err) {
    console.warn("logFeedback error:", err);
  }
}

export interface BusinessAnalytics {
  totalScans: number;
  nfcScans: number;
  qrScans: number;
  reviewClicks: number;
  privateFeedbackCount: number;
  starsCount: { 1: number; 2: number; 3: number; 4: number; 5: number };
  scansPerDay: number[];
}

// Get analytics for an owner's business
export function getBusinessAnalytics(bizId: string): BusinessAnalytics {
  if (typeof window === "undefined") {
    return {
      totalScans: 1428,
      nfcScans: 1114,
      qrScans: 314,
      reviewClicks: 382,
      privateFeedbackCount: 14,
      starsCount: { 1: 5, 2: 9, 3: 18, 4: 62, 5: 320 },
      scansPerDay: [48, 54, 38, 62, 70, 85, 92],
    };
  }

  try {
    const scansRaw = localStorage.getItem(`${SCANS_KEY_PREFIX}${bizId}`);
    const scans: ScanRecord[] = scansRaw ? JSON.parse(scansRaw) : [];

    const eventsRaw = localStorage.getItem(`${EVENTS_KEY_PREFIX}${bizId}`);
    const events: EventRecord[] = eventsRaw ? JSON.parse(eventsRaw) : [];

    const fbRaw = localStorage.getItem(`${FEEDBACK_KEY_PREFIX}${bizId}`);
    const fbs: FeedbackRecord[] = fbRaw ? JSON.parse(fbRaw) : [];

    // Fallback to sample metrics if demo business
    if (bizId === SAMPLE_DEMO_BUSINESS.id && scans.length === 0) {
      return {
        totalScans: 1428,
        nfcScans: 1114,
        qrScans: 314,
        reviewClicks: 382,
        privateFeedbackCount: 14,
        starsCount: { 1: 5, 2: 9, 3: 18, 4: 62, 5: 320 },
        scansPerDay: [48, 54, 38, 62, 70, 85, 92],
      };
    }

    const nfcScans = scans.filter((s) => s.source === "nfc").length;
    const qrScans = scans.filter((s) => s.source === "qr").length;
    const reviewClicks = events.filter((e) => e.type === "review_click").length;

    const starsCount: { 1: number; 2: number; 3: number; 4: number; 5: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    events.filter((e) => e.type === "rating" && e.rating).forEach((e) => {
      const r = e.rating as 1 | 2 | 3 | 4 | 5;
      if (r >= 1 && r <= 5) {
        starsCount[r] = (starsCount[r] || 0) + 1;
      }
    });

    return {
      totalScans: scans.length,
      nfcScans,
      qrScans,
      reviewClicks,
      privateFeedbackCount: fbs.length,
      starsCount,
      scansPerDay: [12, 19, 15, 24, 28, 35, 42],
    };
  } catch {
    return {
      totalScans: 0,
      nfcScans: 0,
      qrScans: 0,
      reviewClicks: 0,
      privateFeedbackCount: 0,
      starsCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      scansPerDay: [0, 0, 0, 0, 0, 0, 0],
    };
  }
}

// Get private feedbacks for business owner
export function getFeedbacksForBusiness(bizId: string): FeedbackRecord[] {
  if (typeof window === "undefined") {
    return [
      {
        id: "fb_1",
        business_id: bizId,
        rating: 2,
        text: "The checkout counter took 15 minutes during the afternoon peak. Staff was polite though.",
        customer_name: "Rahul Sharma",
        customer_phone: "+91 98250 11223",
        at: "28 Oct 2026, 04:15 PM",
      },
      {
        id: "fb_2",
        business_id: bizId,
        rating: 1,
        text: "Card machine connection was slow at billing counter 2.",
        customer_name: "Pooja Patel",
        customer_phone: "+91 99090 33441",
        at: "27 Oct 2026, 07:30 PM",
      },
    ];
  }

  try {
    const raw = localStorage.getItem(`${FEEDBACK_KEY_PREFIX}${bizId}`);
    if (raw) return JSON.parse(raw);
    if (bizId === SAMPLE_DEMO_BUSINESS.id) {
      return [
        {
          id: "fb_1",
          business_id: bizId,
          rating: 2,
          text: "The checkout counter took 15 minutes during the afternoon peak. Staff was polite though.",
          customer_name: "Rahul Sharma",
          customer_phone: "+91 98250 11223",
          at: "28 Oct 2026, 04:15 PM",
        },
        {
          id: "fb_2",
          business_id: bizId,
          rating: 1,
          text: "Card machine connection was slow at billing counter 2.",
          customer_name: "Pooja Patel",
          customer_phone: "+91 99090 33441",
          at: "27 Oct 2026, 07:30 PM",
        },
      ];
    }
    return [];
  } catch {
    return [];
  }
}

// Create an order (Razorpay checkout)
export function createOrderRecord(
  businessId: string,
  plan: ProductPlan,
  pincode: string,
  customDesign?: CustomCardDesign
): OrderRecord {
  const planPrices: Record<string, number> = {
    simple_direct: 499,
    metal_reply: 1999,
    pvc_nfc: 699,
    corporate_bulk: 499,
    card_500: 500,
    standee_1500: 1500,
    standee_auto_2000: 2000,
    franchise_custom: 0,
  };

  const courierInfo = calculateCourierCharge(pincode);
  const amount = planPrices[plan] ?? 999;
  const orderId = `ZT-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  const order: OrderRecord = {
    id: orderId,
    business_id: businessId,
    plan,
    amount,
    courier: courierInfo.amount,
    status: "processing",
    razorpay_id: `rzp_live_${Math.random().toString(36).substring(2, 10)}`,
    courier_name: "BlueDart Express / Delhivery",
    tracking_number: `BD-${Math.floor(1000000 + Math.random() * 9000000)}`,
    estimated_delivery: "3 to 5 business days",
    custom_design: customDesign,
    at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const key = `${ORDERS_KEY_PREFIX}${businessId}`;
      const raw = localStorage.getItem(key);
      const list: OrderRecord[] = raw ? JSON.parse(raw) : [];
      list.unshift(order);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (err) {
      console.warn("createOrderRecord storage error:", err);
    }
  }

  return order;
}

// Get orders for a business
export function getOrdersForBusiness(businessId: string): OrderRecord[] {
  if (typeof window === "undefined") {
    return [
      {
        id: "ZT-ORD-94102",
        business_id: businessId,
        plan: "standee_auto_2000",
        amount: 2000,
        courier: 99,
        status: "delivered",
        razorpay_id: "rzp_live_84920194",
        courier_name: "BlueDart Express",
        tracking_number: "BD-84920194",
        estimated_delivery: "Delivered",
        at: "2026-10-15T10:00:00.000Z",
      },
    ];
  }

  try {
    const key = `${ORDERS_KEY_PREFIX}${businessId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    if (businessId === SAMPLE_DEMO_BUSINESS.id) {
      return [
        {
          id: "ZT-ORD-94102",
          business_id: businessId,
          plan: "standee_auto_2000",
          amount: 2000,
          courier: 99,
          status: "delivered",
          razorpay_id: "rzp_live_84920194",
          courier_name: "BlueDart Express",
          tracking_number: "BD-84920194",
          estimated_delivery: "Delivered",
          at: "2026-10-15T10:00:00.000Z",
        },
      ];
    }
    return [];
  } catch {
    return [];
  }
}

// Get all orders across the fleet for Superadmin
export function getAllOrders(): OrderRecord[] {
  if (typeof window === "undefined") {
    return [
      {
        id: "ZT-ORD-94102",
        business_id: SAMPLE_DEMO_BUSINESS.id,
        plan: "standee_auto_2000",
        amount: 2000,
        courier: 99,
        status: "delivered",
        razorpay_id: "rzp_live_84920194",
        courier_name: "BlueDart Express",
        tracking_number: "BD-84920194",
        estimated_delivery: "Delivered",
        at: "2026-10-15T10:00:00.000Z",
      },
    ];
  }

  const all: OrderRecord[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(ORDERS_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list: OrderRecord[] = JSON.parse(raw);
            if (Array.isArray(list)) all.push(...list);
          } catch {}
        }
      }
    }
    if (all.length === 0) {
      all.push({
        id: "ZT-ORD-94102",
        business_id: SAMPLE_DEMO_BUSINESS.id,
        plan: "standee_auto_2000",
        amount: 2000,
        courier: 99,
        status: "delivered",
        razorpay_id: "rzp_live_84920194",
        courier_name: "BlueDart Express",
        tracking_number: "BD-84920194",
        estimated_delivery: "Delivered",
        at: "2026-10-15T10:00:00.000Z",
      });
    }
  } catch {}

  // Deduplicate by ID
  const map = new Map<string, OrderRecord>();
  all.forEach((o) => map.set(o.id, o));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

// Admin update an order's fulfillment status & tracking
export function adminUpdateOrderStatus(
  businessId: string,
  orderId: string,
  status: OrderRecord["status"],
  trackingNumber?: string,
  courierName?: string
): OrderRecord[] {
  if (typeof window === "undefined") return getAllOrders();
  try {
    const key = `${ORDERS_KEY_PREFIX}${businessId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const list: OrderRecord[] = JSON.parse(raw);
      const idx = list.findIndex((o) => o.id === orderId);
      if (idx >= 0) {
        list[idx].status = status;
        if (trackingNumber !== undefined) list[idx].tracking_number = trackingNumber;
        if (courierName !== undefined) list[idx].courier_name = courierName;
        localStorage.setItem(key, JSON.stringify(list));
      }
    }
  } catch (err) {
    console.warn("adminUpdateOrderStatus notice:", err);
  }
  return getAllOrders();
}

// Admin create a standee order on behalf of a business
export function adminCreateOrder(
  businessId: string,
  plan: ProductPlan,
  pincode: string = "380001",
  address?: string
): OrderRecord {
  const order = createOrderRecord(businessId, plan as any, pincode);
  // Auto-mark business payment status as paid
  adminUpdateBusinessRecord(businessId, { payment_status: "paid" });
  return order;
}

// =========================================================================
// 8. FRANCHISE & MULTI-LOCATION CUSTOM QUOTATIONS HUB
// =========================================================================

const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: "ZT-QTN-88210",
    business_id: "biz-102",
    business_name: "The Urban Bistro & Lounge (Franchise Group)",
    contact_name: "Karan Mehta",
    email: "hello@urbanbistro.in",
    phone: "+91 98251 44210",
    city: "Ahmedabad & Vadodara",
    branch_count: 4,
    standee_count: 8,
    hardware_type: "matte_obsidian",
    multiple_qr: true,
    addons: [
      "Unique QR per Branch Counter",
      "Auto Google Review Reply Engine",
      "Centralized Multi-Outlet Dashboard",
      "Custom Laser Logo Engraving",
    ],
    estimated_hardware_total: 9600,
    estimated_monthly_sub: 3200,
    notes: "Branch 1: Sindhu Bhavan (2 standees), Branch 2: Vastrapur (2 standees), Branch 3: Alkapuri Vadodara (2 standees), Branch 4: Manjalpur Vadodara (2 standees). Require separate review destination links for each branch Google listing.",
    status: "pending_review",
    at: "2026-10-28T14:30:00.000Z",
  },
];

// Create and save custom franchise quotation request
export function createQuotationRecord(
  data: Omit<QuotationRecord, "id" | "at" | "status">
): QuotationRecord {
  const newQuote: QuotationRecord = {
    ...data,
    id: `ZT-QTN-${Math.floor(10000 + Math.random() * 90000)}`,
    status: "pending_review",
    at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const all = getAllQuotations();
      all.unshift(newQuote);
      localStorage.setItem(QUOTATIONS_INDEX_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn("createQuotationRecord error:", err);
    }
  }

  return newQuote;
}

// Fetch all quotations (for Admin Console)
export function getAllQuotations(): QuotationRecord[] {
  if (typeof window === "undefined") return INITIAL_QUOTATIONS;
  try {
    const raw = localStorage.getItem(QUOTATIONS_INDEX_KEY);
    let list: QuotationRecord[] = raw ? JSON.parse(raw) : [];
    INITIAL_QUOTATIONS.forEach((seed) => {
      if (!list.some((q) => q.id === seed.id)) {
        list.push(seed);
      }
    });
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  } catch {
    return INITIAL_QUOTATIONS;
  }
}

// Fetch quotations for a specific business
export function getQuotationsForBusiness(businessId: string): QuotationRecord[] {
  const all = getAllQuotations();
  return all.filter((q) => q.business_id === businessId);
}

// Admin update quotation status
export function adminUpdateQuotationStatus(
  id: string,
  status: QuotationRecord["status"]
): QuotationRecord[] {
  if (typeof window === "undefined") return getAllQuotations();
  try {
    const all = getAllQuotations();
    const idx = all.findIndex((q) => q.id === id);
    if (idx >= 0) {
      all[idx].status = status;
      localStorage.setItem(QUOTATIONS_INDEX_KEY, JSON.stringify(all));
    }
    return all;
  } catch (err) {
    console.warn("adminUpdateQuotationStatus error:", err);
    return getAllQuotations();
  }
}

// -------------------------------------------------------------
// LEADS & INQUIRIES CAPTURE HUB
// -------------------------------------------------------------

export const SAMPLE_DEMO_LEADS: LeadRecord[] = [
  {
    id: "lead_101",
    business_id: "sample-demo-biz-01",
    name: "Pooja Mehta",
    phone: "+91 98980 12345",
    email: "pooja.mehta@fintech.co",
    service_needed: "15 Custom Metal NFC Cards for Executive Team",
    message: "We need custom black matte finish with company logo engraved on both sides.",
    source: "nfc",
    status: "new",
    at: "29 Oct 2026, 11:20 AM",
  },
  {
    id: "lead_102",
    business_id: "sample-demo-biz-01",
    name: "Vikram Patel",
    phone: "+91 97230 55441",
    email: "vikram@theurbanbrew.in",
    service_needed: "3 Acrylic Standees for Cafe Counters",
    message: "Interested in the Auto Google Review Standee with dynamic QR and auto-replies.",
    source: "qr",
    status: "contacted",
    at: "28 Oct 2026, 03:45 PM",
  },
  {
    id: "lead_103",
    business_id: "sample-demo-biz-01",
    name: "Dr. Ananya Roy",
    phone: "+91 98240 88990",
    email: "ananya.roy@dentalcare.com",
    service_needed: "NFC Standee + Google Maps Review Boost",
    message: "Want to know delivery timeline for Clinic reception counter.",
    source: "nfc",
    status: "closed",
    at: "27 Oct 2026, 05:10 PM",
  },
];

export function createLeadRecord(lead: Omit<LeadRecord, "id" | "at" | "status">): LeadRecord {
  const newLead: LeadRecord = {
    ...lead,
    id: `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    status: "new",
    at: new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };

  if (typeof window !== "undefined") {
    try {
      const key = `${LEADS_KEY_PREFIX}${lead.business_id}`;
      const raw = localStorage.getItem(key);
      const list: LeadRecord[] = raw ? JSON.parse(raw) : [];
      list.unshift(newLead);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (err) {
      console.warn("createLeadRecord storage error:", err);
    }
  }

  return newLead;
}

export function getLeadsForBusiness(businessId: string): LeadRecord[] {
  if (typeof window === "undefined") {
    return businessId === SAMPLE_DEMO_BUSINESS.id ? SAMPLE_DEMO_LEADS : [];
  }

  try {
    const key = `${LEADS_KEY_PREFIX}${businessId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    if (businessId === SAMPLE_DEMO_BUSINESS.id) {
      return SAMPLE_DEMO_LEADS;
    }
    return [];
  } catch {
    return [];
  }
}

export function updateLeadStatus(
  businessId: string,
  leadId: string,
  status: "new" | "contacted" | "closed"
): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${LEADS_KEY_PREFIX}${businessId}`;
    const raw = localStorage.getItem(key);
    const list: LeadRecord[] = raw
      ? JSON.parse(raw)
      : businessId === SAMPLE_DEMO_BUSINESS.id
      ? [...SAMPLE_DEMO_LEADS]
      : [];
    const updated = list.map((l) => (l.id === leadId ? { ...l, status } : l));
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("updateLeadStatus error:", err);
  }
}

export function deleteLeadRecord(businessId: string, leadId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${LEADS_KEY_PREFIX}${businessId}`;
    const raw = localStorage.getItem(key);
    const list: LeadRecord[] = raw ? JSON.parse(raw) : [];
    const updated = list.filter((l) => l.id !== leadId);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("deleteLeadRecord error:", err);
  }
}

// =========================================================================
// PHYSICAL TAG LAYER (STANDYES & CARDS)
// Permanent hardware codes (e.g. zt-0042) dynamically assigned to businesses
// =========================================================================

const TAGS_INDEX_KEY = "zentap_v2_tags";
const TAG_ASSIGNMENTS_INDEX_KEY = "zentap_v2_tag_assignments";

const INITIAL_TAGS: TagRecord[] = [
  {
    id: "tag-zt-0001",
    code: "zt-0001",
    form: "standee",
    type: "review",
    business_id: "sample-demo-biz-01",
    partner_id: "partner-001",
    assignment_id: "asg-0001",
    destination: "zentap_page",
    active: true,
    chip_written: true,
    created_at: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "tag-zt-0002",
    code: "zt-0002",
    form: "standee",
    type: "review",
    business_id: "biz-102",
    partner_id: "partner-002",
    assignment_id: "asg-0002",
    destination: "zentap_page",
    active: true,
    chip_written: true,
    created_at: "2026-09-12T10:00:00.000Z",
  },
  {
    id: "tag-zt-0003",
    code: "zt-0003",
    form: "card",
    type: "whatsapp",
    business_id: "sample-demo-biz-01",
    partner_id: "partner-001",
    assignment_id: "asg-0003",
    destination: "direct",
    active: true,
    chip_written: true,
    label: "Meet (Founder)",
    whatsapp_number: "919274560880",
    whatsapp_message: "Hi Meet, tapped your ZenTap business card!",
    created_at: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "tag-zt-0004",
    code: "zt-0004",
    form: "card",
    type: "instagram",
    business_id: "sample-demo-biz-01",
    partner_id: "partner-001",
    assignment_id: "asg-0004",
    destination: "direct",
    active: true,
    chip_written: true,
    label: "ZenTap Official",
    instagram_handle: "zentapdigitalsolutions",
    created_at: "2026-10-05T10:00:00.000Z",
  },
  {
    id: "tag-zt-0005",
    code: "zt-0005",
    form: "standee",
    type: null,
    business_id: null,
    partner_id: "partner-001",
    assignment_id: null,
    destination: "zentap_page",
    active: true,
    chip_written: true, // Free & written -> "Ready to give out" demo
    created_at: "2026-10-10T10:00:00.000Z",
  },
  {
    id: "tag-zt-0006",
    code: "zt-0006",
    form: "card",
    type: null,
    business_id: null,
    partner_id: "partner-002",
    assignment_id: null,
    destination: "zentap_page",
    active: true,
    chip_written: false, // Free but needs writing -> demonstrates "Needs Writing"
    created_at: "2026-10-15T10:00:00.000Z",
  },
];

export function getAllTags(): TagRecord[] {
  if (typeof window === "undefined") return INITIAL_TAGS;
  try {
    const raw = localStorage.getItem(TAGS_INDEX_KEY);
    let list: TagRecord[] = raw ? JSON.parse(raw) : [];
    INITIAL_TAGS.forEach((seed) => {
      if (!list.some((t) => t.id === seed.id || t.code === seed.code)) {
        list.push(seed);
      }
    });

    // Populate business name, partner name and scan count helpers
    const allBiz = getAllBusinesses();
    const allPartners = typeof window !== "undefined" && localStorage.getItem(PARTNERS_INDEX_KEY)
      ? JSON.parse(localStorage.getItem(PARTNERS_INDEX_KEY)!)
      : INITIAL_PARTNERS;

    return list.map((tag) => {
      const biz = tag.business_id ? allBiz.find((b) => b.id === tag.business_id) : null;
      const partner = tag.partner_id ? allPartners.find((p: any) => p.id === tag.partner_id) : null;
      let scanCount = 0;
      if (biz?.slug) {
        const stats = getBusinessAnalytics(biz.slug);
        scanCount = stats.totalScans;
      }
      return {
        ...tag,
        business_name: biz ? biz.name : null,
        business_slug: biz ? biz.slug : null,
        partner_name: partner ? partner.name : null,
        scan_count: scanCount,
      };
    });
  } catch {
    return INITIAL_TAGS;
  }
}

export function getTagByCode(rawCode: string): TagRecord | null {
  if (!rawCode) return null;
  const clean = rawCode.toLowerCase().trim();
  const all = getAllTags();
  return all.find((t) => t.code.toLowerCase() === clean) || null;
}

export function generateTagBatch(count: number, form: TagForm = "standee"): TagRecord[] {
  if (count < 1 || count > 500) {
    throw new Error("Count must be between 1 and 500");
  }
  const currentTags = getAllTags();

  // Find max sequence number from existing codes formatted as zt-XXXX
  let maxSeq = 0;
  currentTags.forEach((t) => {
    const match = t.code.match(/^zt-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });

  const newTags: TagRecord[] = [];
  const now = new Date().toISOString();

  for (let i = 1; i <= count; i++) {
    const nextNum = maxSeq + i;
    const code = `zt-${String(nextNum).padStart(4, "0")}`;
    newTags.push({
      id: `tag-${code}-${Date.now()}`,
      code,
      form,
      type: null, // free in inventory
      business_id: null,
      assignment_id: null,
      destination: "zentap_page",
      active: true,
      chip_written: false,
      created_at: now,
    });
  }

  const updatedList = [...newTags, ...currentTags];
  if (typeof window !== "undefined") {
    localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(updatedList));
  }
  return updatedList;
}

export interface CreateSingleTagOptions {
  code?: string;
  form?: TagForm;
  chip_written?: boolean;
  business_id?: string | null;
  type?: TagType | null;
  destination?: TagDestination;
  label?: string | null;
  whatsapp_number?: string | null;
  whatsapp_message?: string | null;
  instagram_handle?: string | null;
}

export function createSingleTag(options: CreateSingleTagOptions = {}): TagRecord[] {
  const currentTags = getAllTags();
  const form = options.form || "standee";
  const now = new Date().toISOString();

  let code: string;
  if (options.code && options.code.trim()) {
    code = options.code.toLowerCase().trim();
    if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(code)) {
      throw new Error("Tag code must contain only lowercase letters, numbers, and hyphens (2-64 chars).");
    }
    const exists = currentTags.some((t) => t.code.toLowerCase() === code);
    if (exists) {
      throw new Error(`Tag code "${code}" already exists in the inventory.`);
    }
  } else {
    // Auto-generate sequential zt-XXXX code
    let maxSeq = 0;
    currentTags.forEach((t) => {
      const match = t.code.match(/^zt-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });
    code = `zt-${String(maxSeq + 1).padStart(4, "0")}`;
  }

  const newTagId = `tag-${code}-${Date.now()}`;
  let assignmentId: string | null = null;

  if (options.business_id) {
    assignmentId = `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    if (typeof window !== "undefined") {
      try {
        const rawAsg = localStorage.getItem(TAG_ASSIGNMENTS_INDEX_KEY);
        const assignments: TagAssignmentRecord[] = rawAsg ? JSON.parse(rawAsg) : [];
        assignments.push({
          id: assignmentId,
          tag_id: newTagId,
          business_id: options.business_id,
          type: options.type || "review",
          label: options.label || null,
          assigned_at: now,
          released_at: null,
        });
        localStorage.setItem(TAG_ASSIGNMENTS_INDEX_KEY, JSON.stringify(assignments));
      } catch (err) {
        console.warn("createSingleTag assignment error:", err);
      }
    }
  }

  const newTag: TagRecord = {
    id: newTagId,
    code,
    form,
    type: options.business_id ? (options.type || "review") : (options.type || null),
    business_id: options.business_id || null,
    assignment_id: assignmentId,
    destination: options.destination || (options.type === "review" ? "zentap_page" : "direct"),
    active: true,
    chip_written: options.chip_written ?? false,
    label: options.label || null,
    whatsapp_number: options.whatsapp_number || null,
    whatsapp_message: options.whatsapp_message || null,
    instagram_handle: options.instagram_handle || null,
    created_at: now,
  };

  const updatedList = [newTag, ...currentTags];
  if (typeof window !== "undefined") {
    localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(updatedList));
  }
  return updatedList;
}

export function toggleTagChipWritten(tagId: string, forced?: boolean): TagRecord[] {
  if (typeof window === "undefined") return INITIAL_TAGS;
  try {
    const tags = getAllTags();
    const tagIdx = tags.findIndex((t) => t.id === tagId);
    if (tagIdx >= 0) {
      const nextWritten = forced !== undefined ? forced : !tags[tagIdx].chip_written;
      tags[tagIdx] = { ...tags[tagIdx], chip_written: nextWritten };
      localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(tags));
    }
    return getAllTags();
  } catch {
    return INITIAL_TAGS;
  }
}

/**
 * Creates or retrieves a legacy tag whose code matches the business slug.
 * Allows remote switching of old printed /r/{slug} standees without physical hardware modification.
 */
export function ensureLegacyTagForSlug(slug: string, businessId: string): TagRecord {
  const clean = slug.toLowerCase().trim();
  const existing = getTagByCode(clean);
  if (existing) {
    return existing;
  }
  const updated = createSingleTag({
    code: clean,
    form: "standee",
    chip_written: true,
    business_id: businessId,
    type: "review",
    destination: "zentap_page",
    label: "Legacy Printed Standee",
  });
  return updated.find((t) => t.code.toLowerCase() === clean)!;
}

export function assignTag(
  tagId: string,
  businessId: string,
  type: TagType,
  options?: {
    label?: string;
    whatsapp_number?: string;
    whatsapp_message?: string;
    instagram_handle?: string;
  }
): TagRecord[] {
  if (typeof window === "undefined") return INITIAL_TAGS;
  try {
    const tags = getAllTags();
    const tagIdx = tags.findIndex((t) => t.id === tagId);
    if (tagIdx < 0) return tags;

    const currentTag = tags[tagIdx];

    // Release existing assignment if present
    const rawAsg = localStorage.getItem(TAG_ASSIGNMENTS_INDEX_KEY);
    const assignments: TagAssignmentRecord[] = rawAsg ? JSON.parse(rawAsg) : [];

    if (currentTag.assignment_id) {
      const oldAsgIdx = assignments.findIndex((a) => a.id === currentTag.assignment_id && !a.released_at);
      if (oldAsgIdx >= 0) {
        assignments[oldAsgIdx].released_at = new Date().toISOString();
      }
    }

    // Create new assignment
    const newAsgId = `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    assignments.push({
      id: newAsgId,
      tag_id: currentTag.id,
      business_id: businessId,
      type,
      label: options?.label || null,
      assigned_at: new Date().toISOString(),
      released_at: null,
    });
    localStorage.setItem(TAG_ASSIGNMENTS_INDEX_KEY, JSON.stringify(assignments));

    // Update tag record
    tags[tagIdx] = {
      ...currentTag,
      business_id: businessId,
      assignment_id: newAsgId,
      type,
      label: options?.label || null,
      whatsapp_number: options?.whatsapp_number || null,
      whatsapp_message: options?.whatsapp_message || null,
      instagram_handle: options?.instagram_handle || null,
      destination: type === "review" ? (currentTag.destination || "zentap_page") : "direct",
    };

    localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(tags));
    return getAllTags();
  } catch {
    return INITIAL_TAGS;
  }
}

// "Take Back" (formerly Release): removes business from tag so it can be given to someone new
export function releaseTag(tagId: string): TagRecord[] {
  if (typeof window === "undefined") return INITIAL_TAGS;
  try {
    const tags = getAllTags();
    const tagIdx = tags.findIndex((t) => t.id === tagId);
    if (tagIdx < 0) return tags;

    const currentTag = tags[tagIdx];

    // Close assignment record in history
    if (currentTag.assignment_id) {
      const rawAsg = localStorage.getItem(TAG_ASSIGNMENTS_INDEX_KEY);
      const assignments: TagAssignmentRecord[] = rawAsg ? JSON.parse(rawAsg) : [];
      const oldAsgIdx = assignments.findIndex((a) => a.id === currentTag.assignment_id && !a.released_at);
      if (oldAsgIdx >= 0) {
        assignments[oldAsgIdx].released_at = new Date().toISOString();
        localStorage.setItem(TAG_ASSIGNMENTS_INDEX_KEY, JSON.stringify(assignments));
      }
    }

    // Reset tag to blank inventory state
    tags[tagIdx] = {
      ...currentTag,
      business_id: null,
      assignment_id: null,
      type: null,
      destination: "zentap_page",
      active: true,
      label: null,
      whatsapp_number: null,
      whatsapp_message: null,
      instagram_handle: null,
    };

    localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(tags));
    return getAllTags();
  } catch {
    return INITIAL_TAGS;
  }
}

export function toggleTagActive(tagId: string, forcedActive?: boolean): TagRecord[] {
  if (typeof window === "undefined") return INITIAL_TAGS;
  try {
    const tags = getAllTags();
    const tagIdx = tags.findIndex((t) => t.id === tagId);
    if (tagIdx >= 0) {
      const nextActive = forcedActive !== undefined ? forcedActive : !tags[tagIdx].active;
      tags[tagIdx] = { ...tags[tagIdx], active: nextActive };
      localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(tags));
    }
    return getAllTags();
  } catch {
    return INITIAL_TAGS;
  }
}

export function updateTagDestination(tagId: string, destination: TagDestination): TagRecord[] {
  if (typeof window === "undefined") return INITIAL_TAGS;
  try {
    const tags = getAllTags();
    const tagIdx = tags.findIndex((t) => t.id === tagId);
    if (tagIdx >= 0) {
      tags[tagIdx] = { ...tags[tagIdx], destination };
      localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(tags));
    }
    return getAllTags();
  } catch {
    return INITIAL_TAGS;
  }
}

export function updateTagDetails(tagId: string, updates: Partial<TagRecord>): TagRecord[] {
  if (typeof window === "undefined") return INITIAL_TAGS;
  try {
    const tags = getAllTags();
    const tagIdx = tags.findIndex((t) => t.id === tagId);
    if (tagIdx >= 0) {
      tags[tagIdx] = { ...tags[tagIdx], ...updates };
      localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(tags));
    }
    return getAllTags();
  } catch {
    return INITIAL_TAGS;
  }
}

export function softDeleteBusinessWithTags(businessId: string): { releasedTagsCount: number; businesses: BusinessRecord[] } {
  let releasedCount = 0;
  if (typeof window !== "undefined") {
    try {
      const tags = getAllTags();
      const attached = tags.filter((t) => t.business_id === businessId);
      attached.forEach((t) => {
        releaseTag(t.id);
        releasedCount++;
      });
    } catch (err) {
      console.warn("softDeleteBusinessWithTags release error:", err);
    }
  }
  const updatedBusinesses = softDeleteBusiness(businessId);
  return { releasedTagsCount: releasedCount, businesses: updatedBusinesses };
}

/**
 * Update tag and business details from Owner Access Panel
 */
export function updateTagAndBusinessFromOwner(
  code: string,
  updates: {
    name?: string;
    review_url?: string;
    whatsapp_number?: string;
    whatsapp_message?: string;
    instagram_handle?: string;
  }
): { success: boolean; tag: TagRecord | null; business: BusinessRecord | null } {
  const cleanCode = code.toLowerCase().trim();
  const allTags = getAllTags();
  const allBiz = getAllBusinesses();

  let tag = allTags.find((t) => t.code.toLowerCase() === cleanCode) || null;
  let biz: BusinessRecord | null = null;

  if (tag && tag.business_id) {
    biz = allBiz.find((b) => b.id === tag!.business_id || b.slug === tag!.business_id) || null;
  } else {
    biz = allBiz.find((b) => b.slug.toLowerCase() === cleanCode || b.id === cleanCode) || null;
    if (!tag && biz) {
      tag = allTags.find((t) => t.business_id === biz!.id || t.code.toLowerCase() === biz!.slug.toLowerCase()) || null;
    }
  }

  // Update business
  if (biz) {
    const bizUpdates: Partial<BusinessRecord> = {};
    if (updates.name && updates.name.trim()) bizUpdates.name = updates.name.trim();
    if (updates.review_url !== undefined) {
      bizUpdates.review_url = updates.review_url.trim() || null;
      bizUpdates.google_review_link = updates.review_url.trim() || null;
    }
    if (updates.whatsapp_number !== undefined) {
      bizUpdates.whatsapp_number = updates.whatsapp_number.trim() || undefined;
      bizUpdates.whatsapp = updates.whatsapp_number.trim() || undefined;
    }
    if (updates.whatsapp_message !== undefined) {
      bizUpdates.whatsapp_message = updates.whatsapp_message.trim() || undefined;
    }
    if (updates.instagram_handle !== undefined) {
      bizUpdates.instagram_url = updates.instagram_handle.trim() || undefined;
      bizUpdates.instagram = updates.instagram_handle.trim() || undefined;
    }
    adminUpdateBusinessRecord(biz.id, bizUpdates);
    biz = { ...biz, ...bizUpdates };
  }

  // Update tag
  if (tag) {
    const tagUpdates: Partial<TagRecord> = {};
    if (updates.whatsapp_number !== undefined) tagUpdates.whatsapp_number = updates.whatsapp_number.trim() || null;
    if (updates.whatsapp_message !== undefined) tagUpdates.whatsapp_message = updates.whatsapp_message.trim() || null;
    if (updates.instagram_handle !== undefined) tagUpdates.instagram_handle = updates.instagram_handle.trim() || null;
    updateTagDetails(tag.id, tagUpdates);
    tag = { ...tag, ...tagUpdates };
  }

  return { success: true, tag, business: biz };
}

// =========================================================================
// PARTNERS ARCHITECTURE & RESET REQUESTS LAYER
// =========================================================================

export const PARTNERS_INDEX_KEY = "zentap_v2_partners";
export const RESET_REQUESTS_INDEX_KEY = "zentap_v2_reset_requests";
export const PARTNER_ACTIONS_INDEX_KEY = "zentap_v2_partner_actions";

export const INITIAL_PARTNERS: PartnerRecord[] = [
  {
    id: "partner-001",
    name: "Meet B (Core Founder)",
    phone: "919274560880",
    pin_hash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", // 1234
    can_register: true,
    can_edit: true,
    reset_level: "needs_approval",
    status: "active",
    failed_attempts: 0,
    created_at: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "partner-002",
    name: "Gujarat Hardware Agency",
    phone: "919825000001",
    pin_hash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", // 1234
    can_register: false,
    can_edit: true,
    reset_level: "needs_approval",
    status: "active",
    failed_attempts: 0,
    created_at: "2026-09-15T10:00:00.000Z",
  },
];

export const INITIAL_REQUESTS: ResetRequestRecord[] = [
  {
    id: "req-001",
    tag_id: "tag-zt-0002",
    tag_code: "zt-0002",
    partner_id: "partner-002",
    partner_name: "Gujarat Hardware Agency",
    business_id: "biz-102",
    business_name: "Dr. Kirit Shah Dental Clinic",
    type: "card_reset",
    status: "pending",
    notes: "Client relocated clinic; requesting standee reset for reassignment",
    created_at: "2026-10-31T14:30:00.000Z",
  },
];

export function generateRandomPin(): string {
  while (true) {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    if (/^(\d)\1{5}$/.test(pin)) continue;
    if ("0123456789".includes(pin)) continue;
    if ("9876543210".includes(pin)) continue;
    return pin;
  }
}

export function getAllPartners(): PartnerRecord[] {
  if (typeof window === "undefined") return INITIAL_PARTNERS;
  try {
    const raw = localStorage.getItem(PARTNERS_INDEX_KEY);
    let list: PartnerRecord[] = raw ? JSON.parse(raw) : [];
    INITIAL_PARTNERS.forEach((seed) => {
      if (!list.some((p) => p.id === seed.id || p.phone === seed.phone)) {
        list.push(seed);
      }
    });

    const tags = getAllTags();
    return list.map((partner) => {
      const ownedTags = tags.filter((t) => t.partner_id === partner.id);
      const inUseTags = ownedTags.filter((t) => !!t.business_id);
      return {
        ...partner,
        cards_owned: ownedTags.length,
        cards_in_use: inUseTags.length,
      };
    });
  } catch {
    return INITIAL_PARTNERS;
  }
}

export function addPartner(data: {
  name: string;
  phone: string;
  can_register?: boolean;
  can_edit?: boolean;
  reset_level?: "off" | "needs_approval" | "direct";
}): { partner: PartnerRecord; plainPin: string } {
  const plainPin = generateRandomPin();
  let pinHash = "";
  try {
    const crypto = require("crypto");
    pinHash = crypto.createHash("sha256").update(plainPin).digest("hex");
  } catch {
    pinHash = plainPin;
  }

  const newPartner: PartnerRecord = {
    id: `partner-${Date.now()}`,
    name: data.name.trim(),
    phone: data.phone.trim(),
    pin_hash: pinHash,
    plain_pin: plainPin,
    can_register: data.can_register ?? false,
    can_edit: data.can_edit ?? true,
    reset_level: data.reset_level || "needs_approval",
    status: "active",
    failed_attempts: 0,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const current = getAllPartners();
    current.unshift(newPartner);
    localStorage.setItem(PARTNERS_INDEX_KEY, JSON.stringify(current));
  }
  return { partner: newPartner, plainPin };
}

export function resetPartnerPin(partnerId: string): { partner: PartnerRecord; plainPin: string } | null {
  const plainPin = generateRandomPin();
  let pinHash = "";
  try {
    const crypto = require("crypto");
    pinHash = crypto.createHash("sha256").update(plainPin).digest("hex");
  } catch {
    pinHash = plainPin;
  }

  if (typeof window === "undefined") return null;
  const list = getAllPartners();
  const idx = list.findIndex((p) => p.id === partnerId);
  if (idx < 0) return null;

  list[idx] = {
    ...list[idx],
    pin_hash: pinHash,
    plain_pin: plainPin,
    failed_attempts: 0,
    locked_until: null,
    status: list[idx].status === "locked" ? "active" : list[idx].status,
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(PARTNERS_INDEX_KEY, JSON.stringify(list));
  return { partner: list[idx], plainPin };
}

export function unlockPartner(partnerId: string): PartnerRecord[] {
  if (typeof window === "undefined") return INITIAL_PARTNERS;
  const list = getAllPartners();
  const idx = list.findIndex((p) => p.id === partnerId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      status: "active",
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(PARTNERS_INDEX_KEY, JSON.stringify(list));
  }
  return getAllPartners();
}

export function togglePartnerStatus(partnerId: string, status: "active" | "disabled"): PartnerRecord[] {
  if (typeof window === "undefined") return INITIAL_PARTNERS;
  const list = getAllPartners();
  const idx = list.findIndex((p) => p.id === partnerId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      status,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(PARTNERS_INDEX_KEY, JSON.stringify(list));
  }
  return getAllPartners();
}

export function sellCardsToPartner(partnerId: string, tagIds: string[]): TagRecord[] {
  if (typeof window === "undefined") return INITIAL_TAGS;
  const tags = getAllTags();
  tags.forEach((t) => {
    if (tagIds.includes(t.id)) {
      t.partner_id = partnerId;
    }
  });
  localStorage.setItem(TAGS_INDEX_KEY, JSON.stringify(tags));
  return getAllTags();
}

// Reset Requests Management
export function getAllResetRequests(): ResetRequestRecord[] {
  if (typeof window === "undefined") return INITIAL_REQUESTS;
  try {
    const raw = localStorage.getItem(RESET_REQUESTS_INDEX_KEY);
    let list: ResetRequestRecord[] = raw ? JSON.parse(raw) : [];
    INITIAL_REQUESTS.forEach((seed) => {
      if (!list.some((r) => r.id === seed.id)) {
        list.push(seed);
      }
    });
    return list;
  } catch {
    return INITIAL_REQUESTS;
  }
}

export function createResetRequest(data: {
  tag_id: string;
  tag_code: string;
  partner_id?: string | null;
  business_id?: string | null;
  type: "card_reset" | "pin_reset";
  notes?: string;
}): ResetRequestRecord {
  const newReq: ResetRequestRecord = {
    id: `req-${Date.now()}`,
    tag_id: data.tag_id,
    tag_code: data.tag_code,
    partner_id: data.partner_id || null,
    business_id: data.business_id || null,
    type: data.type,
    status: "pending",
    notes: data.notes || null,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const list = getAllResetRequests();
    list.unshift(newReq);
    localStorage.setItem(RESET_REQUESTS_INDEX_KEY, JSON.stringify(list));
  }
  return newReq;
}

export function approveResetRequest(requestId: string): ResetRequestRecord[] {
  if (typeof window === "undefined") return INITIAL_REQUESTS;
  const list = getAllResetRequests();
  const req = list.find((r) => r.id === requestId);
  if (req) {
    req.status = "approved";
    req.decided_at = new Date().toISOString();
    req.decided_by = "Super Admin";
    // Execute release_tag on card reset
    if (req.type === "card_reset" && req.tag_id) {
      releaseTag(req.tag_id);
    }
    localStorage.setItem(RESET_REQUESTS_INDEX_KEY, JSON.stringify(list));
  }
  return getAllResetRequests();
}

export function rejectResetRequest(requestId: string): ResetRequestRecord[] {
  if (typeof window === "undefined") return INITIAL_REQUESTS;
  const list = getAllResetRequests();
  const req = list.find((r) => r.id === requestId);
  if (req) {
    req.status = "rejected";
    req.decided_at = new Date().toISOString();
    req.decided_by = "Super Admin";
    localStorage.setItem(RESET_REQUESTS_INDEX_KEY, JSON.stringify(list));
  }
  return getAllResetRequests();
}

// Business Permanent Purge (Auto-releases assigned tags and completely removes business)
export function purgeBusinessRecord(businessId: string): { success: boolean; error?: string } {
  if (typeof window === "undefined") return { success: true };
  
  // Auto-release any assigned tags so they return safely to the pool
  try {
    const allTags = getAllTags();
    const assigned = allTags.filter((t) => t.business_id === businessId);
    assigned.forEach((t) => releaseTag(t.id));
  } catch (err) {
    console.warn("purgeBusinessRecord release tags notice:", err);
  }

  // Remove business & remember purge
  permanentlyDeleteBusiness(businessId);
  return { success: true };
}

export function batchAssignTags(
  tagIds: string[],
  businessId: string,
  type: TagType,
  options?: {
    labelPrefix?: string;
    whatsapp_number?: string;
    whatsapp_message?: string;
    instagram_handle?: string;
  }
): TagRecord[] {
  tagIds.forEach((id, idx) => {
    assignTag(id, businessId, type, {
      label: options?.labelPrefix ? `${options.labelPrefix} #${idx + 1}` : undefined,
      whatsapp_number: options?.whatsapp_number,
      whatsapp_message: options?.whatsapp_message,
      instagram_handle: options?.instagram_handle,
    });
  });
  return getAllTags();
}

/**
 * Reset tag card following reset level:
 * - off: deactivates card (scans show Page Unavailable)
 * - needs_approval: marks reset_level as 'needs_approval'
 * - direct: sets destination to 'direct' Google review
 */
export function resetTagCardFromOwner(
  code: string,
  resetLevel: "off" | "needs_approval" | "direct" = "off"
): { success: boolean; tag: TagRecord | null; business: BusinessRecord | null } {
  const cleanCode = code.toLowerCase().trim();
  const allTags = getAllTags();
  const allBiz = getAllBusinesses();

  let tag = allTags.find((t) => t.code.toLowerCase() === cleanCode) || null;
  let biz: BusinessRecord | null = null;

  if (tag && tag.business_id) {
    biz = allBiz.find((b) => b.id === tag!.business_id || b.slug === tag!.business_id) || null;
  } else {
    biz = allBiz.find((b) => b.slug.toLowerCase() === cleanCode || b.id === cleanCode) || null;
    if (!tag && biz) {
      tag = allTags.find((t) => t.business_id === biz!.id || t.code.toLowerCase() === biz!.slug.toLowerCase()) || null;
    }
  }

  if (tag) {
    const updates: Partial<TagRecord> = { reset_level: resetLevel };
    if (resetLevel === "off") {
      updates.active = false;
    } else if (resetLevel === "direct") {
      updates.destination = "direct";
      updates.active = true;
    } else if (resetLevel === "needs_approval") {
      updates.active = false;
    }
    updateTagDetails(tag.id, updates);
    tag = { ...tag, ...updates };
  }

  if (biz) {
    if (resetLevel === "off") {
      adminUpdateBusinessRecord(biz.id, { active: false });
      biz = { ...biz, active: false };
    } else if (resetLevel === "direct") {
      adminUpdateBusinessRecord(biz.id, { redirect_mode: "direct_review", active: true });
      biz = { ...biz, redirect_mode: "direct_review", active: true };
    }
  }

  return { success: true, tag, business: biz };
}

