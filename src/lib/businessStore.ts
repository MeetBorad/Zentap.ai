// Zentap.ai Business Store & Analytics
// Isomorphic store: Works on both server (route handlers/SSR) and browser (localStorage)

export interface BusinessRecord {
  id: string;
  owner_user_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gbp_link: string;
  slug: string; // unique slug e.g. cafe-aroma-x7k2
  plan: "card_500" | "standee_1500" | "standee_auto_2000" | null;
  payment_status: "pending" | "paid" | "failed";
  review_url: string | null;
  active: boolean;
  address?: string;
  category?: string;
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
  plan: "card_500" | "standee_1500" | "standee_auto_2000";
  amount: number;
  courier: number;
  status: "processing" | "in_production" | "shipped" | "delivered";
  razorpay_id: string;
  tracking_number?: string;
  courier_name?: string;
  estimated_delivery?: string;
  at: string;
}

const STORAGE_KEY_PREFIX = "zentap_v2_biz_";
const ALL_BIZ_INDEX_KEY = "zentap_v2_all_businesses";
const SCANS_KEY_PREFIX = "zentap_v2_scans_";
const EVENTS_KEY_PREFIX = "zentap_v2_events_";
const FEEDBACK_KEY_PREFIX = "zentap_v2_feedback_";
const ORDERS_KEY_PREFIX = "zentap_v2_orders_";

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

// Sample Demonstration Business (Used for Sample Dashboard preview)
export const SAMPLE_DEMO_BUSINESS: BusinessRecord = {
  id: "sample-demo-biz-01",
  owner_user_id: "demo-owner",
  name: "Virat Gold Palace",
  email: "contact@viratgoldpalace.com",
  phone: "+91 87884 16911",
  city: "Ahmedabad",
  state: "Gujarat",
  country: "India",
  pincode: "382350",
  gbp_link: "https://maps.google.com/?q=virat+jewellers+nikol+ahmedabad",
  slug: "virat-gold-palace",
  plan: "standee_auto_2000",
  payment_status: "paid",
  review_url: "https://www.google.com/search?q=virat+jewellers+nikol#lrd=0x395e86e45b70bdb3:0x77d77b4d7586ba7b,3,,,,",
  active: true,
  address: "Shop 12-14, Shivalik Arcade, Nikol Gam Road",
  category: "Certified 22K Hallmark Gold & Diamond Jewellery",
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

// Get or initialize user business record
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
    if (raw) {
      return JSON.parse(raw);
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

  if (clean === "virat-gold-palace" || clean === "sample" || clean === "demo") {
    return SAMPLE_DEMO_BUSINESS;
  }

  const all = getAllBusinesses();
  const match = all.find((b) => b.slug.toLowerCase() === clean || b.id === slug);
  return match || null;
}

// Save or update to global directory index (used by Admin Dashboard)
function saveToGlobalIndex(record: BusinessRecord) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ALL_BIZ_INDEX_KEY);
    let list: BusinessRecord[] = raw ? JSON.parse(raw) : [...INITIAL_FLEET];
    const idx = list.findIndex((b) => b.id === record.id || b.owner_user_id === record.owner_user_id);
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
    const raw = localStorage.getItem(ALL_BIZ_INDEX_KEY);
    let list: BusinessRecord[] = raw ? JSON.parse(raw) : [];
    INITIAL_FLEET.forEach((seed) => {
      if (!list.some((b) => b.id === seed.id || b.slug === seed.slug)) {
        list.push(seed);
      }
    });
    return list;
  } catch {
    return INITIAL_FLEET;
  }
}

// Admin update (e.g. manual Google Review Link insertion, status)
export function adminUpdateBusinessRecord(bizId: string, updates: Partial<BusinessRecord>): BusinessRecord[] {
  if (typeof window === "undefined") return INITIAL_FLEET;
  try {
    let list = getAllBusinesses();
    const idx = list.findIndex((b) => b.id === bizId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(ALL_BIZ_INDEX_KEY, JSON.stringify(list));

      if (list[idx].owner_user_id) {
        const userKey = `${STORAGE_KEY_PREFIX}${list[idx].owner_user_id}`;
        const userRaw = localStorage.getItem(userKey);
        if (userRaw) {
          const parsed = JSON.parse(userRaw);
          localStorage.setItem(userKey, JSON.stringify({ ...parsed, ...updates }));
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
  plan: "card_500" | "standee_1500" | "standee_auto_2000",
  pincode: string
): OrderRecord {
  const planPrices: Record<string, number> = {
    card_500: 500,
    standee_1500: 1500,
    standee_auto_2000: 2000,
  };

  const courierInfo = calculateCourierCharge(pincode);
  const amount = planPrices[plan];
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
