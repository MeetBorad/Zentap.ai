// src/lib/adminPlatformStore.ts
// Unified store for ZenTap Admin Webpages Redesign:
// Clients, Payments, QR/NFC Generator, Google Links, Social Links, and Page Editor

export interface CustomFieldDefinition {
  id: string; // unique slug e.g. "website_url", "google_maps_link"
  label: string; // display label e.g. "Website URL"
  type: "text" | "url" | "tel" | "email" | "number";
  placeholder?: string;
  category?: "contact" | "social" | "location" | "billing" | "general";
  is_active: boolean;
  created_at?: string;
}

export interface ClientRecord {
  id: string;
  business_id: string; // e.g. ZT-0001
  business_name: string;
  owner_name: string;
  owner_phone: string;
  contact_phone?: string;
  owner_email: string;
  whatsapp: string;
  instagram_link: string;
  facebook_link: string;
  google_review_link?: string;
  google_business_page?: string;
  twitter_link?: string;
  upi_id?: string;
  directions_link?: string;
  website_url?: string;
  website?: string;
  city: string;
  custom_fields?: Record<string, string>;
  created_at: string;
}

export interface DeletedBusinessRecord {
  id: string;
  business_id: string;
  business_name: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  whatsapp: string;
  instagram_link: string;
  facebook_link: string;
  google_review_link?: string;
  city: string;
  custom_fields?: Record<string, string>;
  deleted_at: string;
  deleted_by: string;
  notes?: string;
}

export interface PaymentItemRecord {
  id: string;
  business_id: string; // e.g. ZT-0001
  business_name: string;
  product: string;
  product_price?: number;
  selling_rate: number; // amount received / selling rate
  payment_date: string;
  payment_method: "UPI" | "Cash";
  payment_status: "Completed paid" | "Partial Advance" | "Pending Unpaid";
  notes?: string;
  created_at: string;
}

export interface QrNfcTagItemRecord {
  id: string;
  tag_id: string; // e.g. ST1, ST2... or CRD1, CRD2...
  product_type: "Counter Standee" | "Business NFC Card";
  business_id: string | null; // e.g. ZT-0001 or null
  business_name: string | null;
  link: string; // e.g. https://www.zentapdigitalsolutions.com/t/ST1
  scans_count: number;
  destination?: string;
  google_review_link?: string | null;
  social_link?: string | null;
  created_at: string;
}

export interface GoogleReviewLinkItemRecord {
  id: string;
  tag_id: string; // e.g. ST1
  business_id: string; // e.g. ZT-0001
  business_name: string;
  link_of_tag_id: string;
  business_google_review_link: string;
  destination: "not_assigned" | "direct_google" | "zentap_google" | "business_page";
  setup_status: "pending" | "completed"; // completed if destination !== 'not_assigned'
  total_scans: number;
  created_at: string;
  updated_at?: string;
}

export interface SocialLinkItemRecord {
  id: string;
  tag_id: string; // e.g. CRD1
  business_id: string; // e.g. ZT-0001
  business_name: string;
  social_platform: "WhatsApp" | "Instagram" | "Facebook" | "N/A";
  link_of_tag_id: string;
  social_link: string;
  destination: "not_assigned" | "assigned";
  setup_status: "pending" | "completed"; // completed if destination === 'assigned'
  total_scans: number;
  created_at: string;
  updated_at?: string;
}

export interface PageEditorConfigItemRecord {
  id: string;
  tag_id: string; // e.g. ST1
  business_id: string; // e.g. ZT-0001
  business_name: string;
  link_url: string;
  destination?: string;
  setup_status: "pending" | "completed";
  config_data: Record<string, any>;
  updated_at: string;
}

export interface DeletedPaymentRecord extends PaymentItemRecord {
  deleted_at: string;
  deleted_by: string;
}

export interface DeletedGoogleReviewLinkRecord extends GoogleReviewLinkItemRecord {
  deleted_at: string;
  deleted_by: string;
}

export interface DeletedSocialLinkRecord extends SocialLinkItemRecord {
  deleted_at: string;
  deleted_by: string;
}

export interface DeletedQrNfcTagRecord extends QrNfcTagItemRecord {
  deleted_at: string;
  deleted_by: string;
}

export interface DeletedPageEditorConfigRecord extends PageEditorConfigItemRecord {
  deleted_at: string;
  deleted_by: string;
}

// Storage Keys
const KEY_CLIENTS = "zentap_clients_v2";
const KEY_DELETED_BUSINESSES = "zentap_deleted_businesses_v2";
const KEY_PAYMENTS = "zentap_payments_records_v2";
const KEY_DELETED_PAYMENTS = "zentap_deleted_payments_v2";
const KEY_QR_NFC_TAGS = "zentap_qr_nfc_tags_v2";
const KEY_DELETED_QR_NFC_TAGS = "zentap_deleted_qr_nfc_tags_v2";
const KEY_GOOGLE_LINKS = "zentap_google_review_links_v2";
const KEY_DELETED_GOOGLE_LINKS = "zentap_deleted_google_links_v2";
const KEY_SOCIAL_LINKS = "zentap_social_links_v2";
const KEY_DELETED_SOCIAL_LINKS = "zentap_deleted_social_links_v2";
const KEY_PAGE_EDITOR = "zentap_page_editor_configs_v2";
const KEY_DELETED_PAGE_EDITOR = "zentap_deleted_page_editor_v2";

export const DOMAIN_BASE = "https://www.zentapdigitalsolutions.com";

// Initial seed fleet
const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: "cl_01",
    business_id: "ZT-0001",
    business_name: "Café Aroma Bodakdev",
    owner_name: "Aarav Sharma",
    owner_phone: "+91 98250 12345",
    owner_email: "contact@cafearoma.in",
    whatsapp: "+91 98250 12345",
    instagram_link: "https://instagram.com/cafearoma_ahmedabad",
    facebook_link: "https://facebook.com/cafearomabodakdev",
    city: "Ahmedabad",
    created_at: "2026-10-25T10:00:00Z",
  },
  {
    id: "cl_02",
    business_id: "ZT-0002",
    business_name: "Smile Dental Clinic",
    owner_name: "Dr. Priya Patel",
    owner_phone: "+91 98251 23456",
    owner_email: "smiledental@gmail.com",
    whatsapp: "+91 98251 23456",
    instagram_link: "https://instagram.com/smiledentalclinic",
    facebook_link: "https://facebook.com/smiledentalclinicindia",
    city: "Surat",
    created_at: "2026-10-28T14:30:00Z",
  },
  {
    id: "cl_03",
    business_id: "ZT-0003",
    business_name: "Urban Hair Salon",
    owner_name: "Rohan Mehta",
    owner_phone: "+91 98252 34567",
    owner_email: "urbanhairsalon@gmail.com",
    whatsapp: "+91 98252 34567",
    instagram_link: "https://instagram.com/urbanhairsalon_official",
    facebook_link: "https://facebook.com/urbanhairsalon",
    city: "Vadodara",
    created_at: "2026-10-30T11:15:00Z",
  },
  {
    id: "cl_04",
    business_id: "ZT-0004",
    business_name: "Zentap Digital Solutions",
    owner_name: "Meet",
    owner_phone: "+91 96627 60880",
    owner_email: "meetborad@hotmail.com",
    whatsapp: "+91 92745 60880",
    instagram_link: "https://www.instagram.com/zenttap/",
    facebook_link: "",
    google_review_link: "https://g.page/r/CdJX2OGu1yhoEAI/review",
    city: "Ahmedabad",
    custom_fields: {
      directions: "Ahmedabad, Gujarat, India",
      website: "https://www.zentapdigitalsolutions.com",
      category: "Digital Growth & Smart NFC Systems"
    },
    created_at: "2026-11-02T13:20:00Z",
  },
];

const INITIAL_TAGS: QrNfcTagItemRecord[] = [
  {
    id: "tag_st1",
    tag_id: "ST1",
    product_type: "Counter Standee",
    business_id: "ZT-0001",
    business_name: "ZenTap Digital Solutions",
    link: `${DOMAIN_BASE}/t/ST1`,
    destination: "business_page",
    scans_count: 142,
    created_at: "2026-10-25T10:05:00Z",
  },
  {
    id: "tag_st2",
    tag_id: "ST2",
    product_type: "Counter Standee",
    business_id: "ZT-0002",
    business_name: "Smile Dental Clinic",
    link: `${DOMAIN_BASE}/t/ST2`,
    scans_count: 88,
    created_at: "2026-10-28T14:35:00Z",
  },
  {
    id: "tag_crd1",
    tag_id: "CRD1",
    product_type: "Business NFC Card",
    business_id: "ZT-0003",
    business_name: "Urban Hair Salon",
    link: `${DOMAIN_BASE}/t/CRD1`,
    scans_count: 53,
    created_at: "2026-10-30T11:20:00Z",
  },
  {
    id: "tag_st3",
    tag_id: "ST3",
    product_type: "Counter Standee",
    business_id: "ZT-0004",
    business_name: "XYZ",
    link: `${DOMAIN_BASE}/t/ST3`,
    destination: "business_page",
    scans_count: 36,
    created_at: "2026-11-01T09:00:00Z",
  },
  {
    id: "tag_crd2",
    tag_id: "CRD2",
    product_type: "Business NFC Card",
    business_id: null,
    business_name: null,
    link: `${DOMAIN_BASE}/t/CRD2`,
    scans_count: 0,
    created_at: "2026-11-01T09:00:00Z",
  },
];

const INITIAL_PAYMENTS: PaymentItemRecord[] = [
  {
    id: "pay_01",
    business_id: "ZT-0001",
    business_name: "Café Aroma Bodakdev",
    product: "Counter Standee",
    product_price: 1499,
    selling_rate: 1499,
    payment_date: "2026-10-25",
    payment_method: "UPI",
    payment_status: "Completed paid",
    notes: "Full payment received via PhonePe. Standee dispatched.",
    created_at: "2026-10-25T10:10:00Z",
  },
  {
    id: "pay_02",
    business_id: "ZT-0002",
    business_name: "Smile Dental Clinic",
    product: "Counter Standee",
    product_price: 999,
    selling_rate: 500,
    payment_date: "2026-10-28",
    payment_method: "Cash",
    payment_status: "Partial Advance",
    notes: "₹500 advance received. Remaining ₹499 on installation.",
    created_at: "2026-10-28T14:40:00Z",
  },
  {
    id: "pay_03",
    business_id: "ZT-0003",
    business_name: "Urban Hair Salon",
    product: "Business NFC Card",
    product_price: 699,
    selling_rate: 699,
    payment_date: "2026-10-30",
    payment_method: "UPI",
    payment_status: "Completed paid",
    notes: "Google Pay verified by founder.",
    created_at: "2026-10-30T11:25:00Z",
  },
];

const INITIAL_GOOGLE_LINKS: GoogleReviewLinkItemRecord[] = [
  {
    id: "gl_01",
    tag_id: "ST1",
    business_id: "ZT-0001",
    business_name: "ZenTap Digital Solutions",
    link_of_tag_id: `${DOMAIN_BASE}/t/ST1`,
    business_google_review_link: "https://g.page/r/CdJX2OGu1yhoEAI/review",
    destination: "business_page",
    setup_status: "completed",
    total_scans: 142,
    created_at: "2026-10-25T10:05:00Z",
  },
  {
    id: "gl_02",
    tag_id: "ST2",
    business_id: "ZT-0002",
    business_name: "Smile Dental Clinic",
    link_of_tag_id: `${DOMAIN_BASE}/t/ST2`,
    business_google_review_link: "https://g.page/r/CbOD_SmileDental/review",
    destination: "direct_google",
    setup_status: "completed",
    total_scans: 88,
    created_at: "2026-10-28T14:35:00Z",
  },
  {
    id: "gl_03",
    tag_id: "ST3",
    business_id: "ZT-0004",
    business_name: "XYZ",
    link_of_tag_id: `${DOMAIN_BASE}/t/ST3`,
    business_google_review_link: "https://search.google.com/local/writereview?placeid=ChIJudXhNva7woAR9Q9ALHZaF50",
    destination: "business_page",
    setup_status: "completed",
    total_scans: 36,
    created_at: "2026-11-02T04:25:00Z",
  },
];

const INITIAL_SOCIAL_LINKS: SocialLinkItemRecord[] = [
  {
    id: "sl_01",
    tag_id: "CRD1",
    business_id: "ZT-0003",
    business_name: "Urban Hair Salon",
    social_platform: "Instagram",
    link_of_tag_id: `${DOMAIN_BASE}/t/CRD1`,
    social_link: "https://instagram.com/urbanhairsalon_official",
    destination: "assigned",
    setup_status: "completed",
    total_scans: 53,
    created_at: "2026-10-30T11:20:00Z",
  },
];

const INITIAL_PAGE_EDITORS: PageEditorConfigItemRecord[] = [
  {
    id: "pe_zentap",
    tag_id: "zentap",
    business_id: "ZT-0001",
    business_name: "ZenTap Digital Solutions",
    link_url: `${DOMAIN_BASE}/r/zentap?preview=1`,
    setup_status: "completed",
    config_data: {
      theme: "obsidian",
      title: "ZenTap Digital Solutions",
      subtitle: "Ahmedabad • Welcome to our official digital hub",
      address: "Ahmedabad, Gujarat, India",
      maps_link: "https://g.page/r/CdJX2OGu1yhoEAI/review",
      logo_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1v0R5J-iLk5f40ycfMMud4JnJoswjm15FbobEOnF982t6u0ffqZ5svfbrN6qmKCgW6F-ejOC4Wb7QfcaQxHkJ1zNt1_wwvtSXB_tS_LnuUT3Ix44J8qUCCdD5R0FV5uVKI6skyKM5QrdeTcFxjYpSEt1QvFc280v1TA_DIT0JIOkcNc80JTWv6k4ina32ylCuUkv281QHYkmRhBaS2AuAkImi5kyMIeFwMO0zhd8316MT0gk6t2Q50A",
      cta_text: "Loved your visit? Tap to write a rapid 5-Star Google Review",
      google_link: "https://g.page/r/CdJX2OGu1yhoEAI/review",
      phone: "+91 92745 60880",
      whatsapp: "+91 92745 60880",
      instagram: "https://instagram.com/zentapdigitalsolutions",
      facebook: "https://facebook.com/zentapdigitalsolutions",
      website: "https://zentapdigitalsolutions.com",
      email: "contact@zentapdigitalsolutions.com",
      about_us: "Welcome to ZenTap Digital Solutions! We take pride in delivering premier service, top craftsmanship, and genuine hospitality to every visitor.",
      opening_hours: "Monday – Saturday: 10:00 AM – 09:00 PM\nSunday: 11:00 AM – 06:00 PM",
      faqs: [
        {
          question: "Do you offer parking?",
          answer: "Yes, dedicated on-site parking is available for visitors, with seamless accessibility directly in front of our premises.",
        },
        {
          question: "What payment modes are accepted?",
          answer: "We support all major payment types including UPI (Google Pay, PhonePe, Paytm), Visa/Mastercard/RuPay credit & debit cards, net banking, and cash.",
        },
      ],
      location_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBntBRRtvFsUDBYuSpyCqOKOrww8i3Jra2cvrOlya4dusW8PVtI8vY7kNlQT6oWsIbi_RxEvnxmKef0KVtOB85lYnw8jONF_Iq3ZThxyxk6mZACXbKDiXpMZyAsooT3GYU_dpN4F5OQ6bwFzaHC988imjfe9wnu2h5NOQPefD_KjMN5mLgmOXi2e77FzabIrI3F4X9mEWZg-Dd5qiEghoie3wXTVnHyKlrg9B18etzc",
      location_title: "Ahmedabad Central Hub",
      tags: [
        "Cleanliness",
        "Nice Staff",
        "Good Behaviour",
        "Excellent Quality",
        "Fair Pricing",
        "Fast Service",
        "Good Ambience",
        "Value for Money",
        "Hygiene",
        "Professional Team",
        "On-time Delivery",
        "Easy Parking",
      ],
    },
    updated_at: "2026-11-05T12:00:00Z",
  },
  {
    id: "pe_01",
    tag_id: "ST1",
    business_id: "ZT-0001",
    business_name: "Café Aroma Bodakdev",
    link_url: `${DOMAIN_BASE}/t/ST1`,
    setup_status: "completed",
    config_data: {
      theme: "obsidian",
      title: "Café Aroma Bodakdev",
      subtitle: "Artisanal Coffee & Gourmet Bistro",
      cover_image: "/standees/standee_01.jpg",
      logo_url: "/logo.png",
      cta_text: "Leave a 5-Star Review on Google",
      google_link: "https://g.page/r/CbOD_Cafearoma/review",
    },
    updated_at: "2026-10-25T10:15:00Z",
  },
  {
    id: "pe_02",
    tag_id: "ST2",
    business_id: "ZT-0002",
    business_name: "Smile Dental Clinic",
    link_url: `${DOMAIN_BASE}/t/ST2`,
    setup_status: "completed",
    config_data: {
      theme: "slate",
      title: "Smile Dental Clinic",
      subtitle: "Multi-Speciality Dental Care",
      cta_text: "Rate Your Visit on Google",
      google_link: "https://g.page/r/CbOD_SmileDental/review",
    },
    updated_at: "2026-10-28T14:45:00Z",
  },
  {
    id: "pe_03",
    tag_id: "ST3",
    business_id: "ZT-0004",
    business_name: "XYZ",
    link_url: `${DOMAIN_BASE}/t/ST3`,
    setup_status: "completed",
    config_data: {
      theme: "clean_light",
      title: "XYZ",
      subtitle: "Ahmedabad • Customer Satisfaction Hub",
      category: "Customer Satisfaction Hub",
      cover_image: "/standees/standee_01.jpg",
      logo_url: "/logo.png",
      cta_text: "Leave a 5-Star Review on Google",
      google_link: "https://search.google.com/local/writereview?placeid=ChIJudXhNva7woAR9Q9ALHZaF50",
      phone: "+91 91919 19192",
      whatsapp: "9191919192",
    },
    updated_at: "2026-11-02T13:22:00Z",
  },
];

// Helper: safe read
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Helper: safe write + event notification
function setStored<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("zentap_platform_updated", { detail: { key } }));
  } catch (e) {
    console.warn("Storage write error for key:", key, e);
  }
}

// Background sync helpers with Supabase
function asyncDbUpsert(table: string, data: any, onConflict?: string) {
  if (typeof window === "undefined") return;
  fetch("/api/admin/platform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "upsert", table, data, onConflict }),
  }).catch((err) => console.warn(`Async DB upsert to ${table} notice:`, err));
}

function asyncDbDelete(table: string, idField: string, idValue: string) {
  if (typeof window === "undefined") return;
  fetch("/api/admin/platform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "soft_delete", table, idField, idValue }),
  }).catch((err) => console.warn(`Async DB delete from ${table} notice:`, err));
}

export interface PlatformCounts {
  clients: { all: number; deleted: number };
  payments: { all: number; paid: number; unpaid: number; deleted: number };
  tags: { all: number; deleted: number };
  googleLinks: { all: number; deleted: number };
  socialLinks: { all: number; deleted: number };
  pageEditorConfigs: { all: number; deleted: number };
}

export function getPlatformCounts(): PlatformCounts {
  return getStored<PlatformCounts>("zentap_platform_counts_v2", {
    clients: { all: 0, deleted: 0 },
    payments: { all: 0, paid: 0, unpaid: 0, deleted: 0 },
    tags: { all: 0, deleted: 0 },
    googleLinks: { all: 0, deleted: 0 },
    socialLinks: { all: 0, deleted: 0 },
    pageEditorConfigs: { all: 0, deleted: 0 },
  });
}

export async function serverFetchPlatformData(): Promise<{ success: boolean; counts?: PlatformCounts; data?: any }> {
  if (typeof window === "undefined") return { success: false };
  try {
    const res = await fetch("/api/admin/platform", { cache: "no-store" });
    if (!res.ok) return { success: false };
    const json = await res.json();
    if (!json.success || !json.data) return { success: false };

    const {
      clients,
      deletedBusinesses,
      payments,
      deletedPayments,
      tags,
      deletedTags,
      googleLinks,
      deletedGoogleLinks,
      socialLinks,
      deletedSocialLinks,
      pageEditorConfigs,
      deletedPageEditorConfigs,
    } = json.data;

    // Always persist database state, even if empty array
    localStorage.setItem(KEY_CLIENTS, JSON.stringify(clients || []));
    localStorage.setItem(KEY_DELETED_BUSINESSES, JSON.stringify(deletedBusinesses || []));
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(payments || []));
    localStorage.setItem(KEY_DELETED_PAYMENTS, JSON.stringify(deletedPayments || []));
    localStorage.setItem(KEY_QR_NFC_TAGS, JSON.stringify(tags || []));
    localStorage.setItem(KEY_DELETED_QR_NFC_TAGS, JSON.stringify(deletedTags || []));
    localStorage.setItem(KEY_GOOGLE_LINKS, JSON.stringify(googleLinks || []));
    localStorage.setItem(KEY_DELETED_GOOGLE_LINKS, JSON.stringify(deletedGoogleLinks || []));
    localStorage.setItem(KEY_SOCIAL_LINKS, JSON.stringify(socialLinks || []));
    localStorage.setItem(KEY_DELETED_SOCIAL_LINKS, JSON.stringify(deletedSocialLinks || []));
    localStorage.setItem(KEY_PAGE_EDITOR, JSON.stringify(pageEditorConfigs || []));
    localStorage.setItem(KEY_DELETED_PAGE_EDITOR, JSON.stringify(deletedPageEditorConfigs || []));

    if (json.counts) {
      localStorage.setItem("zentap_platform_counts_v2", JSON.stringify(json.counts));
    }

    window.dispatchEvent(new CustomEvent("zentap_platform_updated", { detail: { source: "backend", counts: json.counts } }));
    return { success: true, counts: json.counts, data: json.data };
  } catch (err) {
    console.warn("serverFetchPlatformData notice:", err);
    return { success: false };
  }
}

export async function serverSoftDelete(
  table: "clients" | "payments" | "qr_nfc_tags" | "google_review_links" | "social_links" | "page_editor_configs",
  idField: string,
  idValue: string,
  deletedBy = "admin"
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "soft_delete",
        table,
        idField,
        idValue,
        deletedBy,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to soft-delete record on server" };
    }

    await serverFetchPlatformData();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while deleting" };
  }
}

export async function serverRestore(
  table: "clients" | "payments" | "qr_nfc_tags" | "google_review_links" | "social_links" | "page_editor_configs",
  idField: string,
  idValue: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "restore",
        table,
        idField,
        idValue,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to restore record on server" };
    }

    await serverFetchPlatformData();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while restoring" };
  }
}

export async function serverPermanentDelete(
  table: "clients" | "payments" | "qr_nfc_tags" | "google_review_links" | "social_links" | "page_editor_configs",
  idField: string,
  idValue: string,
  confirmationName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "permanent_delete",
        table,
        idField,
        idValue,
        confirmationName,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to permanently delete record on server" };
    }

    await serverFetchPlatformData();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while permanently deleting" };
  }
}

export async function initPlatformStoreFromBackend(): Promise<boolean> {
  const result = await serverFetchPlatformData();
  return result.success;
}

// ============================================================================
// 1. CLIENTS STORE & DELETED BUSINESSES
// ============================================================================

// Client helpers
export async function softDeleteClientServer(businessId: string): Promise<{ success: boolean; error?: string }> {
  return serverSoftDelete("clients", "business_id", businessId);
}

export async function restoreClientServer(businessId: string): Promise<{ success: boolean; error?: string }> {
  return serverRestore("clients", "business_id", businessId);
}

export async function permanentDeleteClientServer(businessId: string, confirmationName: string): Promise<{ success: boolean; error?: string }> {
  return serverPermanentDelete("clients", "business_id", businessId, confirmationName);
}

export const STANDARD_BUSINESS_FIELD_KEYS = new Set([
  "business_name",
  "name",
  "slug",
  "owner_name",
  "owner_phone",
  "contact_phone",
  "phone",
  "owner_email",
  "email",
  "whatsapp",
  "whatsapp_number",
  "google_review_link",
  "review_link",
  "google_business_page",
  "google_business",
  "google_maps_link",
  "google_maps",
  "maps_link",
  "instagram_link",
  "instagram",
  "facebook_link",
  "facebook",
  "twitter_link",
  "twitter",
  "x_link",
  "website_url",
  "website",
  "website_link",
  "directions_link",
  "directions",
  "direction_link",
  "direction",
  "city",
  "location",
  "city_location",
  "upi_id",
  "upi",
  "business_upi_id",
  "category",
  "area",
  "locality",
  "services",
  "products",
  "keywords",
]);

export function isStandardBusinessField(idOrLabel: string): boolean {
  if (!idOrLabel || typeof idOrLabel !== "string") return false;
  const normalized = idOrLabel
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (STANDARD_BUSINESS_FIELD_KEYS.has(normalized)) return true;
  if (
    normalized === "directions" ||
    normalized.startsWith("direction") ||
    normalized.endsWith("direction") ||
    normalized.includes("directions_link") ||
    normalized === "website" ||
    normalized.startsWith("website") ||
    normalized.endsWith("website") ||
    normalized.includes("website_url") ||
    normalized.includes("google_map")
  ) {
    return true;
  }
  return false;
}

export const DEFAULT_CUSTOM_FIELD_PRESETS: CustomFieldDefinition[] = [
  { id: "gst_number", label: "GST / Tax ID", type: "text", placeholder: "24AAAAA0000A1Z5", category: "billing", is_active: false },
  { id: "full_address", label: "Full Address / Street", type: "text", placeholder: "Shop 12, Ground Floor, Sunrise Mall", category: "location", is_active: false },
  { id: "linkedin_link", label: "LinkedIn Profile", type: "url", placeholder: "https://linkedin.com/company/...", category: "social", is_active: false },
  { id: "youtube_link", label: "YouTube Channel", type: "url", placeholder: "https://youtube.com/@...", category: "social", is_active: false },
  { id: "fssai_license", label: "FSSAI Food License", type: "text", placeholder: "100XXXXXXXXXX", category: "general", is_active: false },
  { id: "branch_code", label: "Store / Branch Code", type: "text", placeholder: "BR-01", category: "general", is_active: false },
];

export function getCustomFieldDefinitions(): CustomFieldDefinition[] {
  if (typeof window === "undefined") return DEFAULT_CUSTOM_FIELD_PRESETS;
  try {
    const raw = localStorage.getItem("zentap_custom_field_definitions");
    if (!raw) {
      localStorage.setItem("zentap_custom_field_definitions", JSON.stringify(DEFAULT_CUSTOM_FIELD_PRESETS));
      return DEFAULT_CUSTOM_FIELD_PRESETS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_CUSTOM_FIELD_PRESETS;
    }
    // Automatically purge any standard fields (e.g. legacy directions, website, etc.)
    const cleaned = parsed.filter(
      (f: any) => f && f.id && !isStandardBusinessField(f.id) && !isStandardBusinessField(f.label)
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem("zentap_custom_field_definitions", JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return DEFAULT_CUSTOM_FIELD_PRESETS;
  }
}

export function saveCustomFieldDefinitions(defs: CustomFieldDefinition[]): void {
  if (typeof window === "undefined") return;
  try {
    const cleaned = defs.filter(
      (f) => f && f.id && !isStandardBusinessField(f.id) && !isStandardBusinessField(f.label)
    );
    localStorage.setItem("zentap_custom_field_definitions", JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent("zentap_custom_fields_updated", { detail: cleaned }));
  } catch (err) {
    console.error("Failed to save custom field definitions:", err);
  }
}

export function addCustomFieldDefinition(def: Omit<CustomFieldDefinition, "id"> & { id?: string }): CustomFieldDefinition[] {
  const current = getCustomFieldDefinitions();
  const slug = def.id || def.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `field_${Date.now()}`;
  if (isStandardBusinessField(slug) || isStandardBusinessField(def.label)) {
    console.warn(`Skipping addition of field "${def.label}": matches standard native field.`);
    return current;
  }
  const existingIdx = current.findIndex((f) => f.id === slug);
  const newDef: CustomFieldDefinition = {
    ...def,
    id: slug,
    is_active: def.is_active ?? true,
    created_at: new Date().toISOString(),
  };
  let updated: CustomFieldDefinition[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...newDef, is_active: true };
  } else {
    updated = [...current, newDef];
  }
  saveCustomFieldDefinitions(updated);
  return updated;
}

export function toggleCustomFieldDefinition(id: string): CustomFieldDefinition[] {
  const current = getCustomFieldDefinitions();
  const updated = current.map((f) => (f.id === id ? { ...f, is_active: !f.is_active } : f));
  saveCustomFieldDefinitions(updated);
  return updated;
}

export function removeCustomFieldDefinition(id: string): CustomFieldDefinition[] {
  const current = getCustomFieldDefinitions();
  const updated = current.filter((f) => f.id !== id);
  saveCustomFieldDefinitions(updated);
  return updated;
}

export interface StandardClientColumnDef {
  id: string;
  label: string;
  category: "basic" | "contact" | "social" | "links" | "context" | "payment" | "location";
  type: "text" | "url" | "tel" | "email" | "number";
  placeholder: string;
  description: string;
}

export const STANDARD_CLIENT_COLUMNS: StandardClientColumnDef[] = [
  { id: "business_name", label: "Business Name", category: "basic", type: "text", placeholder: "e.g. Zentap Digital Solutions", description: "Official business title displayed across client cards and hub." },
  { id: "city", label: "City / Location", category: "basic", type: "text", placeholder: "e.g. Ahmedabad", description: "Primary operating city or jurisdiction." },
  { id: "category", label: "Category / Subtitle", category: "basic", type: "text", placeholder: "e.g. Service • Digital Agency", description: "Business category and tagline." },
  { id: "owner_name", label: "Owner Name", category: "contact", type: "text", placeholder: "e.g. Meet Borad", description: "Full legal or operating name of the business owner." },
  { id: "owner_phone", label: "Owner Phone", category: "contact", type: "tel", placeholder: "+91 92745 60880", description: "Direct private contact phone for the owner." },
  { id: "contact_phone", label: "Contact Phone", category: "contact", type: "tel", placeholder: "+91 96627 60880", description: "Customer-facing business hotline / reception line." },
  { id: "owner_email", label: "Owner Email", category: "contact", type: "email", placeholder: "contact@zentapdigitalsolutions.com", description: "Official billing and notification email address." },
  { id: "google_review_link", label: "Google Review Link", category: "links", type: "url", placeholder: "https://g.page/r/.../review", description: "Destination target URL for customer Google Reviews." },
  { id: "google_business_page", label: "Google Business Page", category: "links", type: "url", placeholder: "https://maps.app.goo.gl/...", description: "Public Google Maps listing or Business Profile page." },
  { id: "whatsapp", label: "WhatsApp Number", category: "contact", type: "tel", placeholder: "+91 92745 60880", description: "Direct customer messaging WhatsApp number." },
  { id: "instagram_link", label: "Instagram Link / Handle", category: "social", type: "text", placeholder: "https://instagram.com/...", description: "Instagram profile or username." },
  { id: "facebook_link", label: "Facebook Page URL", category: "social", type: "url", placeholder: "https://facebook.com/...", description: "Official Facebook page link." },
  { id: "website_url", label: "Website / Portfolio URL", category: "links", type: "url", placeholder: "https://yourwebsite.com", description: "Official company website or portfolio." },
  { id: "area", label: "Area / Locality", category: "context", type: "text", placeholder: "e.g. Bodakdev / SG Highway", description: "Neighborhood or area used for local context in reviews." },
  { id: "services", label: "Services / Products List", category: "context", type: "text", placeholder: "e.g. NFC Standees, Tap Cards", description: "Comma-separated list of offerings." },
  { id: "keywords", label: "Focus Keywords (3–5)", category: "context", type: "text", placeholder: "e.g. Smart NFC, Tap Review, Fast Setup", description: "Keywords emphasized in smart review drafts." },
  { id: "twitter_link", label: "Twitter / X Profile", category: "social", type: "text", placeholder: "https://x.com/... or @handle", description: "Twitter/X handle or URL." },
  { id: "upi_id", label: "Business UPI ID", category: "payment", type: "text", placeholder: "e.g. merchant@okhdfcbank", description: "VPA for instant customer UPI payments." },
  { id: "directions_link", label: "Directions Link / Full Address Note", category: "location", type: "text", placeholder: "e.g. https://maps.app.goo.gl/... or Ahmedabad", description: "Google Maps directions link or detailed physical address." },
];

export function getOwnerFieldPermissions(): Record<string, boolean> {
  const defaultPerms: Record<string, boolean> = {};
  STANDARD_CLIENT_COLUMNS.forEach((col) => {
    defaultPerms[col.id] = true;
  });
  if (typeof window === "undefined") return defaultPerms;
  try {
    const raw = localStorage.getItem("zentap_owner_field_permissions");
    if (!raw) return defaultPerms;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? { ...defaultPerms, ...parsed } : defaultPerms;
  } catch {
    return defaultPerms;
  }
}

export function saveOwnerFieldPermissions(permissions: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("zentap_owner_field_permissions", JSON.stringify(permissions));
    window.dispatchEvent(new CustomEvent("zentap_owner_field_permissions_updated", { detail: permissions }));
  } catch (err) {
    console.error("Failed to save owner field permissions:", err);
  }
}

export function toggleOwnerFieldPermission(fieldId: string): Record<string, boolean> {
  const current = getOwnerFieldPermissions();
  const updated = {
    ...current,
    [fieldId]: current[fieldId] === false ? true : false,
  };
  saveOwnerFieldPermissions(updated);
  return updated;
}

// Server-side Client Creation (Direct to Supabase with auto UUID)
export async function addClientServer(params: {
  business_name: string;
  owner_name?: string;
  owner_phone?: string;
  contact_phone?: string;
  owner_email?: string;
  whatsapp?: string;
  instagram_link?: string;
  facebook_link?: string;
  city?: string;
  google_review_link?: string;
  google_business_page?: string;
  twitter_link?: string;
  upi_id?: string;
  directions_link?: string;
  website_url?: string;
  website?: string;
  custom_fields?: Record<string, string>;
}): Promise<{ success: boolean; data?: ClientRecord; error?: string }> {
  const current = getAllClients();
  const nextBusinessId = generateNextBusinessIdCode(current);

  const mergedCustomFields: Record<string, string> = {
    ...(params.custom_fields || {}),
  };
  if (params.contact_phone) mergedCustomFields.contact_phone = params.contact_phone.trim();
  if (params.google_business_page) mergedCustomFields.google_business_page = params.google_business_page.trim();
  if (params.twitter_link) mergedCustomFields.twitter_link = params.twitter_link.trim();
  if (params.upi_id) mergedCustomFields.upi_id = params.upi_id.trim();
  if (params.directions_link) mergedCustomFields.directions_link = params.directions_link.trim();
  if (params.website_url || params.website) {
    const web = (params.website_url || params.website || "").trim();
    mergedCustomFields.website_url = web;
    mergedCustomFields.website = web;
  }

  const clientPayload: Omit<ClientRecord, "id" | "created_at"> & { id?: string; business_id: string } = {
    business_id: nextBusinessId,
    business_name: params.business_name.trim(),
    owner_name: params.owner_name?.trim() || "",
    owner_phone: params.owner_phone?.trim() || "",
    contact_phone: params.contact_phone?.trim() || params.owner_phone?.trim() || "",
    owner_email: params.owner_email?.trim() || "",
    whatsapp: params.whatsapp?.trim() || params.owner_phone?.trim() || "",
    instagram_link: params.instagram_link?.trim() || "",
    facebook_link: params.facebook_link?.trim() || "",
    city: params.city?.trim() || "India",
    google_review_link: params.google_review_link?.trim() || "",
    google_business_page: params.google_business_page?.trim() || "",
    twitter_link: params.twitter_link?.trim() || "",
    upi_id: params.upi_id?.trim() || "",
    directions_link: params.directions_link?.trim() || "",
    website_url: params.website_url?.trim() || params.website?.trim() || "",
    website: params.website?.trim() || params.website_url?.trim() || "",
    custom_fields: mergedCustomFields,
  };

  // Optimistically update local storage so UI displays it immediately
  const localCreated = addClient(clientPayload);

  try {
    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        table: "clients",
        data: localCreated,
        onConflict: "business_id",
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      console.warn("Server add client notice:", json.error);
      return { success: true, data: localCreated, error: json.error };
    }

    await serverFetchPlatformData();
    const created = json.data?.[0] || localCreated;
    return { success: true, data: created };
  } catch (err: any) {
    console.warn("Network error during addClientServer:", err);
    return { success: true, data: localCreated, error: err.message };
  }
}

// Server-side Client Update
export async function updateClientServer(
  businessId: string,
  updates: Partial<ClientRecord>
): Promise<{ success: boolean; data?: ClientRecord; error?: string }> {
  try {
    const mergedCustomFields: Record<string, string> = {
      ...(updates.custom_fields || {}),
    };
    if (updates.contact_phone) mergedCustomFields.contact_phone = updates.contact_phone;
    if (updates.google_business_page) mergedCustomFields.google_business_page = updates.google_business_page;
    if (updates.twitter_link) mergedCustomFields.twitter_link = updates.twitter_link;
    if (updates.upi_id) mergedCustomFields.upi_id = updates.upi_id;
    if (updates.directions_link) mergedCustomFields.directions_link = updates.directions_link;
    if (updates.website_url || updates.website) {
      const web = (updates.website_url || updates.website || "").trim();
      mergedCustomFields.website_url = web;
      mergedCustomFields.website = web;
    }

    const normalizedUpdates = {
      ...updates,
      custom_fields: mergedCustomFields,
    };

    // Optimistically update local storage and cascade locally
    const localUpdated = updateClient(businessId, normalizedUpdates);

    const payload = {
      ...normalizedUpdates,
      business_id: updates.business_id || businessId,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        table: "clients",
        data: payload,
        oldBusinessId: businessId,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      console.warn("Server update client notice:", json.error);
      return { success: true, data: localUpdated || (payload as ClientRecord), error: json.error };
    }

    await serverFetchPlatformData();
    return { success: true, data: json.data?.[0] || localUpdated };
  } catch (err: any) {
    console.warn("Network error during updateClientServer:", err);
    const localUpdated = updateClient(businessId, updates);
    return { success: true, data: localUpdated || undefined, error: err.message };
  }
}

// Payment helpers
export async function softDeletePaymentServer(id: string): Promise<{ success: boolean; error?: string }> {
  return serverSoftDelete("payments", "id", id);
}

export async function restorePaymentServer(id: string): Promise<{ success: boolean; error?: string }> {
  return serverRestore("payments", "id", id);
}

export async function permanentDeletePaymentServer(id: string, confirmationName: string): Promise<{ success: boolean; error?: string }> {
  return serverPermanentDelete("payments", "id", id, confirmationName);
}

// Server-side Payment Creation (Auto UUID in database)
export async function addPaymentServer(params: {
  business_id: string;
  business_name: string;
  product: string;
  product_price?: number;
  selling_rate: number;
  payment_date: string;
  payment_method: "UPI" | "Cash";
  payment_status: "Completed paid" | "Partial Advance" | "Pending Unpaid";
  notes?: string;
}): Promise<{ success: boolean; data?: PaymentItemRecord; error?: string }> {
  try {
    const paymentPayload = {
      business_id: params.business_id,
      business_name: params.business_name,
      product: params.product,
      product_price: params.product_price ?? params.selling_rate,
      selling_rate: params.selling_rate,
      payment_date: params.payment_date,
      payment_method: params.payment_method,
      payment_status: params.payment_status,
      notes: params.notes || null,
      created_at: new Date().toISOString(),
    };

    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        table: "payments",
        data: paymentPayload,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to save payment in database" };
    }

    await serverFetchPlatformData();
    const created = json.data?.[0] || paymentPayload;
    return { success: true, data: created };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while saving payment" };
  }
}

// Server-side Payment Update
export async function updatePaymentServer(
  id: string,
  updates: Partial<PaymentItemRecord>
): Promise<{ success: boolean; data?: PaymentItemRecord; error?: string }> {
  try {
    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        table: "payments",
        data: {
          ...updates,
          id,
          updated_at: new Date().toISOString(),
        },
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to update payment in database" };
    }

    await serverFetchPlatformData();
    return { success: true, data: json.data?.[0] };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while updating payment" };
  }
}

// Tag helpers
export async function softDeleteTagServer(tagId: string): Promise<{ success: boolean; error?: string }> {
  return serverSoftDelete("qr_nfc_tags", "tag_id", tagId);
}

export async function restoreTagServer(tagId: string): Promise<{ success: boolean; error?: string }> {
  return serverRestore("qr_nfc_tags", "tag_id", tagId);
}

export async function permanentDeleteTagServer(tagId: string, confirmationName: string): Promise<{ success: boolean; error?: string }> {
  return serverPermanentDelete("qr_nfc_tags", "tag_id", tagId, confirmationName);
}

// Atomic Server-Side Tag Generation (Single or Batch - 1 to 100)
export async function generateTagsServer(params: {
  product_type: "Counter Standee" | "Business NFC Card";
  quantity: number;
  business_id?: string | null;
  business_name?: string | null;
}): Promise<{ success: boolean; data?: QrNfcTagItemRecord[]; error?: string }> {
  const qty = Math.floor(Number(params.quantity) || 1);
  if (qty < 1 || qty > 100) {
    return { success: false, error: "Batch quantity must be a typed integer between 1 and 100" };
  }

  try {
    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_tags",
        product_type: params.product_type,
        quantity: qty,
        business_id: params.business_id || null,
        business_name: params.business_name || null,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to generate tags on server" };
    }

    await serverFetchPlatformData();
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while generating tags" };
  }
}

// Server-Side Assign or Unassign Tag (Single Source of Truth)
export async function assignTagServer(
  tagId: string,
  businessId: string | null,
  businessName?: string | null
): Promise<{ success: boolean; data?: QrNfcTagItemRecord; error?: string }> {
  try {
    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "assign_tag",
        tag_id: tagId,
        business_id: businessId || null,
        business_name: businessId ? (businessName || null) : null,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to update tag assignment on server" };
    }

    await serverFetchPlatformData();
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while updating tag assignment" };
  }
}

// Google Review Link helpers
export async function softDeleteGoogleLinkServer(tagId: string): Promise<{ success: boolean; error?: string }> {
  return serverSoftDelete("google_review_links", "tag_id", tagId);
}

export async function restoreGoogleLinkServer(tagId: string): Promise<{ success: boolean; error?: string }> {
  return serverRestore("google_review_links", "tag_id", tagId);
}

export async function permanentDeleteGoogleLinkServer(tagId: string, confirmationName: string): Promise<{ success: boolean; error?: string }> {
  return serverPermanentDelete("google_review_links", "tag_id", tagId, confirmationName);
}

export async function updateGoogleReviewLinkServer(
  tagId: string,
  updates: Partial<GoogleReviewLinkItemRecord>
): Promise<{ success: boolean; data?: GoogleReviewLinkItemRecord; error?: string }> {
  try {
    // 1. Single source of truth update against qr_nfc_tags
    const tagPayload: any = {
      tag_id: tagId,
      updated_at: new Date().toISOString(),
    };
    if (updates.business_google_review_link !== undefined) {
      tagPayload.google_review_link = updates.business_google_review_link ? updates.business_google_review_link.trim() : null;
    }
    if (updates.destination !== undefined) {
      tagPayload.destination = updates.destination;
    }
    if (updates.business_id !== undefined) {
      tagPayload.business_id = updates.business_id;
    }
    if (updates.business_name !== undefined) {
      tagPayload.business_name = updates.business_name;
    }

    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        table: "qr_nfc_tags",
        data: tagPayload,
        onConflict: "tag_id",
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to update link in database" };
    }

    // 2. Also keep google_review_links in sync
    await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        table: "google_review_links",
        data: {
          tag_id: tagId,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        onConflict: "tag_id",
      }),
    }).catch(() => {});

    // 3. If business_id is known and review link is updated, update clients table
    if (updates.business_id && updates.business_google_review_link !== undefined) {
      await fetch("/api/admin/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          table: "clients",
          data: {
            business_id: updates.business_id,
            google_review_link: updates.business_google_review_link ? updates.business_google_review_link.trim() : null,
            updated_at: new Date().toISOString(),
          },
          onConflict: "business_id",
        }),
      }).catch(() => {});
    }

    // 4. Also keep page_editor_configs in sync (Connected to Design Review Page)
    if (updates.business_google_review_link !== undefined) {
      const cleanGoogleReviewUrl = updates.business_google_review_link ? updates.business_google_review_link.trim() : "";
      await fetch("/api/admin/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          table: "page_editor_configs",
          data: {
            tag_id: tagId,
            link_url: `${DOMAIN_BASE}/t/${tagId}`,
            config_data: {
              google_link: cleanGoogleReviewUrl,
            },
            updated_at: new Date().toISOString(),
          },
          onConflict: "tag_id",
        }),
      }).catch(() => {});

      const pConfigs = getAllPageEditorConfigs();
      const pIdx = pConfigs.findIndex((p) => p.tag_id.toLowerCase() === tagId.toLowerCase());
      if (pIdx !== -1) {
        pConfigs[pIdx] = {
          ...pConfigs[pIdx],
          link_url: `${DOMAIN_BASE}/t/${tagId}`,
          config_data: {
            ...(pConfigs[pIdx].config_data || {}),
            google_link: cleanGoogleReviewUrl,
          },
          updated_at: new Date().toISOString(),
        };
        setStored(KEY_PAGE_EDITOR, pConfigs);
      }
    }

    await serverFetchPlatformData();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while updating link" };
  }
}

// Social Link helpers
export async function softDeleteSocialLinkServer(tagId: string): Promise<{ success: boolean; error?: string }> {
  return serverSoftDelete("social_links", "tag_id", tagId);
}

export async function restoreSocialLinkServer(tagId: string): Promise<{ success: boolean; error?: string }> {
  return serverRestore("social_links", "tag_id", tagId);
}

export async function permanentDeleteSocialLinkServer(tagId: string, confirmationName: string): Promise<{ success: boolean; error?: string }> {
  return serverPermanentDelete("social_links", "tag_id", tagId, confirmationName);
}

// Page Editor Config helpers
export async function savePageEditorConfigServer(
  tagId: string,
  configData: Record<string, any>,
  extra?: { business_id?: string; business_name?: string; link_url?: string; destination?: string }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const payload: any = {
      tag_id: tagId,
      config_data: configData,
      setup_status: "completed",
      updated_at: new Date().toISOString(),
    };
    if (extra?.business_id) payload.business_id = extra.business_id;
    payload.business_name = configData?.title || extra?.business_name;
    // Link URL is always the Link of Tag ID from Google Links & QR Sharing
    payload.link_url = extra?.link_url || `${DOMAIN_BASE}/t/${tagId}`;

    const res = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        table: "page_editor_configs",
        data: payload,
        onConflict: "tag_id",
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to save page editor config in database" };
    }

    // Keep google_review_links & qr_nfc_tags in sync (Two-way connected)
    if (configData?.google_link !== undefined) {
      const cleanGoogleUrl = (configData.google_link || "").trim();
      
      // Preserve existing destination if already configured (do NOT force zentap_google)
      const existingGLink = getAllGoogleReviewLinks().find((g) => g.tag_id.toLowerCase() === tagId.toLowerCase());
      const existingTag = getAllQrNfcTags().find((t) => t.tag_id.toLowerCase() === tagId.toLowerCase());
      const preservedDest = extra?.destination || existingGLink?.destination || existingTag?.destination || "business_page";

      await fetch("/api/admin/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          table: "google_review_links",
          data: {
            tag_id: tagId,
            business_id: extra?.business_id,
            business_name: extra?.business_name,
            link_of_tag_id: `${DOMAIN_BASE}/t/${tagId}`,
            business_google_review_link: cleanGoogleUrl,
            destination: preservedDest,
            setup_status: cleanGoogleUrl ? "completed" : "pending",
            updated_at: new Date().toISOString(),
          },
          onConflict: "tag_id",
        }),
      }).catch(() => {});

      await fetch("/api/admin/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          table: "qr_nfc_tags",
          data: {
            tag_id: tagId,
            google_review_link: cleanGoogleUrl,
            destination: preservedDest,
            updated_at: new Date().toISOString(),
          },
          onConflict: "tag_id",
        }),
      }).catch(() => {});

      const gLinks = getAllGoogleReviewLinks();
      const gIdx = gLinks.findIndex((g) => g.tag_id.toLowerCase() === tagId.toLowerCase());
      if (gIdx !== -1) {
        gLinks[gIdx] = {
          ...gLinks[gIdx],
          business_google_review_link: cleanGoogleUrl,
          link_of_tag_id: `${DOMAIN_BASE}/t/${tagId}`,
          setup_status: cleanGoogleUrl ? "completed" : "pending",
          updated_at: new Date().toISOString(),
        };
        setStored(KEY_GOOGLE_LINKS, gLinks);
      }
    }

    await serverFetchPlatformData();
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error saving page editor configuration" };
  }
}

export async function softDeletePageEditorServer(tagId: string): Promise<{ success: boolean; error?: string }> {
  return serverSoftDelete("page_editor_configs", "tag_id", tagId);
}

export async function restorePageEditorServer(tagId: string): Promise<{ success: boolean; error?: string }> {
  return serverRestore("page_editor_configs", "tag_id", tagId);
}

export async function permanentDeletePageEditorServer(tagId: string, confirmationName: string): Promise<{ success: boolean; error?: string }> {
  return serverPermanentDelete("page_editor_configs", "tag_id", tagId, confirmationName);
}

export function getAllClients(): ClientRecord[] {
  return getStored<ClientRecord[]>(KEY_CLIENTS, INITIAL_CLIENTS);
}

export function generateNextBusinessIdCode(existing?: ClientRecord[]): string {
  const list = existing || getAllClients();
  let maxNum = 0;
  for (const c of list) {
    const m = (c.business_id || "").match(/ZT-(\d+)/i);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `ZT-${String(maxNum + 1).padStart(4, "0")}`;
}

export function addClient(
  client: Omit<ClientRecord, "id" | "created_at" | "business_id"> & { id?: string; business_id?: string }
): ClientRecord {
  const current = getAllClients();
  const nextId = client.id || `cl_${Date.now()}`;
  const businessId = client.business_id || generateNextBusinessIdCode(current);
  const newClient: ClientRecord = {
    ...client,
    id: nextId,
    business_id: businessId,
    created_at: new Date().toISOString(),
  };
  const updated = [newClient, ...current];
  setStored(KEY_CLIENTS, updated);
  asyncDbUpsert("clients", newClient, "business_id");
  return newClient;
}

export function getAllDeletedBusinesses(): DeletedBusinessRecord[] {
  return getStored<DeletedBusinessRecord[]>(KEY_DELETED_BUSINESSES, []);
}

export function deleteClientPermanently(businessId: string, notes?: string): { success: boolean; deleted?: DeletedBusinessRecord } {
  const clients = getAllClients();
  const target = clients.find((c) => c.business_id === businessId || c.id === businessId);
  if (!target) return { success: false };

  // 1. Remove from active clients
  const remaining = clients.filter((c) => c.business_id !== target.business_id && c.id !== target.id);
  setStored(KEY_CLIENTS, remaining);
  asyncDbDelete("clients", "business_id", target.business_id);

  // 2. Add to deleted_businesses table
  const deletedRecords = getAllDeletedBusinesses();
  const deletedItem: DeletedBusinessRecord = {
    id: `del_${Date.now()}`,
    business_id: target.business_id,
    business_name: target.business_name,
    owner_name: target.owner_name,
    owner_phone: target.owner_phone,
    owner_email: target.owner_email,
    whatsapp: target.whatsapp,
    instagram_link: target.instagram_link,
    facebook_link: target.facebook_link,
    city: target.city,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
    notes: notes || "Permanently deleted by founder via Clients tab",
  };
  setStored(KEY_DELETED_BUSINESSES, [deletedItem, ...deletedRecords]);
  asyncDbUpsert("deleted_businesses", deletedItem);

  return { success: true, deleted: deletedItem };
}

export function restoreDeletedBusiness(businessId: string): boolean {
  const deletedList = getAllDeletedBusinesses();
  const target = deletedList.find((d) => d.business_id === businessId || d.id === businessId);
  if (!target) return false;

  // Remove from deleted table
  const updatedDeleted = deletedList.filter((d) => d.business_id !== target.business_id);
  setStored(KEY_DELETED_BUSINESSES, updatedDeleted);
  asyncDbDelete("deleted_businesses", "business_id", target.business_id);

  // Restore back to clients table
  const clients = getAllClients();
  const restoredClient: ClientRecord = {
    id: `cl_${Date.now()}`,
    business_id: target.business_id,
    business_name: target.business_name,
    owner_name: target.owner_name,
    owner_phone: target.owner_phone,
    owner_email: target.owner_email,
    whatsapp: target.whatsapp,
    instagram_link: target.instagram_link,
    facebook_link: target.facebook_link,
    city: target.city || "India",
    created_at: new Date().toISOString(),
  };
  setStored(KEY_CLIENTS, [restoredClient, ...clients]);
  asyncDbUpsert("clients", restoredClient, "business_id");
  return true;
}

export function updateClient(businessId: string, updates: Partial<ClientRecord>): ClientRecord | null {
  const clients = getAllClients();
  const index = clients.findIndex((c) => c.business_id === businessId || c.id === businessId);
  if (index === -1) return null;

  const oldBusinessId = clients[index].business_id;
  const updatedClient: ClientRecord = {
    ...clients[index],
    ...updates,
  };
  clients[index] = updatedClient;
  setStored(KEY_CLIENTS, clients);
  asyncDbUpsert("clients", updatedClient, "business_id");

  // If business_id or business_name changed, cascade to other tables
  if ((updates.business_id && updates.business_id !== oldBusinessId) || updates.business_name) {
    const newBid = updatedClient.business_id;
    const newName = updatedClient.business_name;

    // Payments
    const payments = getAllPayments();
    let payUpdated = false;
    for (const p of payments) {
      if (p.business_id === oldBusinessId) {
        p.business_id = newBid;
        if (newName) p.business_name = newName;
        payUpdated = true;
      }
    }
    if (payUpdated) setStored(KEY_PAYMENTS, payments);

    // Tags
    const tags = getAllQrNfcTags();
    let tagUpdated = false;
    for (const t of tags) {
      if (t.business_id === oldBusinessId) {
        t.business_id = newBid;
        if (newName) t.business_name = newName;
        tagUpdated = true;
      }
    }
    if (tagUpdated) setStored(KEY_QR_NFC_TAGS, tags);

    // Google Links
    const gLinks = getAllGoogleReviewLinks();
    let gUpdated = false;
    for (const g of gLinks) {
      if (g.business_id === oldBusinessId) {
        g.business_id = newBid;
        if (newName) g.business_name = newName;
        gUpdated = true;
      }
    }
    if (gUpdated) setStored(KEY_GOOGLE_LINKS, gLinks);

    // Social Links
    const sLinks = getAllSocialLinks();
    let sUpdated = false;
    for (const s of sLinks) {
      if (s.business_id === oldBusinessId) {
        s.business_id = newBid;
        if (newName) s.business_name = newName;
        sUpdated = true;
      }
    }
    if (sUpdated) setStored(KEY_SOCIAL_LINKS, sLinks);

    // Page Editor
    const pConfigs = getAllPageEditorConfigs();
    let pUpdated = false;
    for (const pe of pConfigs) {
      if (pe.business_id === oldBusinessId) {
        pe.business_id = newBid;
        if (newName) pe.business_name = newName;
        pUpdated = true;
      }
    }
    if (pUpdated) setStored(KEY_PAGE_EDITOR, pConfigs);
  }

  return updatedClient;
}

// ============================================================================
// 2. PAYMENTS STORE
// ============================================================================

export function getAllPayments(): PaymentItemRecord[] {
  return getStored<PaymentItemRecord[]>(KEY_PAYMENTS, INITIAL_PAYMENTS);
}

export function addPayment(payment: Omit<PaymentItemRecord, "id" | "created_at">): PaymentItemRecord {
  const current = getAllPayments();
  const newPayment: PaymentItemRecord = {
    ...payment,
    id: `pay_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  const updated = [newPayment, ...current];
  setStored(KEY_PAYMENTS, updated);
  asyncDbUpsert("payments", newPayment);
  return newPayment;
}

export function updatePayment(id: string, updates: Partial<PaymentItemRecord>): PaymentItemRecord | null {
  const current = getAllPayments();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updatedItem = { ...current[index], ...updates };
  current[index] = updatedItem;
  setStored(KEY_PAYMENTS, current);
  asyncDbUpsert("payments", updatedItem);
  return updatedItem;
}

export function getAllDeletedPayments(): DeletedPaymentRecord[] {
  return getStored<DeletedPaymentRecord[]>(KEY_DELETED_PAYMENTS, []);
}

export function deletePayment(id: string, notes?: string): { success: boolean; deleted?: DeletedPaymentRecord } {
  const current = getAllPayments();
  const target = current.find((p) => p.id === id);
  if (!target) return { success: false };

  // Remove from active payments
  const remaining = current.filter((p) => p.id !== id);
  setStored(KEY_PAYMENTS, remaining);
  asyncDbDelete("payments", "id", target.id);

  // Add to deleted_payments
  const deletedRecords = getAllDeletedPayments();
  const deletedItem: DeletedPaymentRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
    notes: notes || target.notes,
  };
  setStored(KEY_DELETED_PAYMENTS, [deletedItem, ...deletedRecords]);
  asyncDbUpsert("deleted_payments", deletedItem);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedPayment(id: string): boolean {
  const deletedList = getAllDeletedPayments();
  const target = deletedList.find((p) => p.id === id);
  if (!target) return false;

  // Remove from deleted
  const remaining = deletedList.filter((p) => p.id !== id);
  setStored(KEY_DELETED_PAYMENTS, remaining);
  asyncDbDelete("deleted_payments", "id", target.id);

  // Restore to active payments
  const current = getAllPayments();
  const restored: PaymentItemRecord = {
    id: target.id,
    business_id: target.business_id,
    business_name: target.business_name,
    product: target.product,
    product_price: target.product_price,
    selling_rate: target.selling_rate,
    payment_date: target.payment_date,
    payment_method: target.payment_method,
    payment_status: target.payment_status,
    notes: target.notes,
    created_at: target.created_at,
  };
  setStored(KEY_PAYMENTS, [restored, ...current]);
  asyncDbUpsert("payments", restored);
  return true;
}

export function deletePaymentWithPassword(id: string, adminPasswordInput?: string): { success: boolean; message: string } {
  const res = deletePayment(id);
  return { success: res.success, message: res.success ? "Payment record deleted." : "Record not found." };
}

// ============================================================================
// 3. QR/NFC TAGS GENERATOR STORE
// ============================================================================

export function getAllQrNfcTags(): QrNfcTagItemRecord[] {
  return getStored<QrNfcTagItemRecord[]>(KEY_QR_NFC_TAGS, INITIAL_TAGS);
}

// Helper: generate next ST1, ST2... or CRD1, CRD2...
export function getNextTagId(productType: "Counter Standee" | "Business NFC Card", tagsList?: QrNfcTagItemRecord[]): string {
  const tags = tagsList || getAllQrNfcTags();
  const prefix = productType === "Counter Standee" ? "ST" : "CRD";
  const regex = new RegExp(`^${prefix}(\\d+)$`, "i");
  let maxNum = 0;
  for (const t of tags) {
    const match = t.tag_id.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `${prefix}${maxNum + 1}`;
}

export function createSingleTag(params: {
  product_type: "Counter Standee" | "Business NFC Card";
  business_id?: string | null;
  business_name?: string | null;
}): QrNfcTagItemRecord {
  const current = getAllQrNfcTags();
  const tagId = getNextTagId(params.product_type, current);
  const newTag: QrNfcTagItemRecord = {
    id: `tag_${tagId.toLowerCase()}_${Date.now()}`,
    tag_id: tagId,
    product_type: params.product_type,
    business_id: params.business_id || null,
    business_name: params.business_name || null,
    link: `${DOMAIN_BASE}/t/${tagId}`,
    scans_count: 0,
    created_at: new Date().toISOString(),
  };

  const updatedTags = [newTag, ...current];
  setStored(KEY_QR_NFC_TAGS, updatedTags);
  asyncDbUpsert("qr_nfc_tags", newTag, "tag_id");

  // If assigned right away, synchronize with downstream tabs!
  if (params.business_id) {
    syncTagAssignmentDownstream(newTag);
  }

  return newTag;
}

export function generateBatchTags(params: {
  product_type: "Counter Standee" | "Business NFC Card";
  quantity: number; // 1 to 100
}): QrNfcTagItemRecord[] {
  const qty = Math.max(1, Math.min(100, Math.floor(params.quantity)));
  const current = getAllQrNfcTags();
  const prefix = params.product_type === "Counter Standee" ? "ST" : "CRD";
  const regex = new RegExp(`^${prefix}(\\d+)$`, "i");

  let maxNum = 0;
  for (const t of current) {
    const match = t.tag_id.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  const generatedBatch: QrNfcTagItemRecord[] = [];
  for (let i = 1; i <= qty; i++) {
    const tagId = `${prefix}${maxNum + i}`;
    generatedBatch.push({
      id: `tag_${tagId.toLowerCase()}_${Date.now()}_${i}`,
      tag_id: tagId,
      product_type: params.product_type,
      business_id: null,
      business_name: null,
      link: `${DOMAIN_BASE}/t/${tagId}`,
      scans_count: 0,
      created_at: new Date().toISOString(),
    });
  }

  const updatedTags = [...generatedBatch, ...current];
  setStored(KEY_QR_NFC_TAGS, updatedTags);
  asyncDbUpsert("qr_nfc_tags", generatedBatch, "tag_id");
  return generatedBatch;
}

export function assignTagBusiness(tagId: string, businessId: string, businessName: string): QrNfcTagItemRecord | null {
  const current = getAllQrNfcTags();
  const index = current.findIndex((t) => t.tag_id === tagId);
  if (index === -1) return null;

  const updatedTag: QrNfcTagItemRecord = {
    ...current[index],
    business_id: businessId,
    business_name: businessName,
  };
  current[index] = updatedTag;
  setStored(KEY_QR_NFC_TAGS, current);
  asyncDbUpsert("qr_nfc_tags", updatedTag, "tag_id");

  // Sync to Google Links (Standee) or Social Links (Card) and Page Editor
  syncTagAssignmentDownstream(updatedTag);

  return updatedTag;
}

export function updateQrNfcTag(tagId: string, updates: Partial<QrNfcTagItemRecord>): QrNfcTagItemRecord | null {
  const current = getAllQrNfcTags();
  const index = current.findIndex((t) => t.tag_id === tagId);
  if (index === -1) return null;

  const original = current[index];
  const newTagId = updates.tag_id || original.tag_id;
  const updatedTag: QrNfcTagItemRecord = {
    ...original,
    ...updates,
    tag_id: newTagId,
    link: updates.link || `${DOMAIN_BASE}/t/${newTagId}`,
  };

  current[index] = updatedTag;
  setStored(KEY_QR_NFC_TAGS, current);
  asyncDbUpsert("qr_nfc_tags", updatedTag, "tag_id");

  if (updatedTag.business_id) {
    syncTagAssignmentDownstream(updatedTag);
  }

  return updatedTag;
}

export function getAllDeletedQrNfcTags(): DeletedQrNfcTagRecord[] {
  return getStored<DeletedQrNfcTagRecord[]>(KEY_DELETED_QR_NFC_TAGS, []);
}

export function deleteQrNfcTag(tagId: string): { success: boolean; deleted?: DeletedQrNfcTagRecord } {
  const current = getAllQrNfcTags();
  const target = current.find((t) => t.tag_id === tagId);
  if (!target) return { success: false };

  const remaining = current.filter((t) => t.tag_id !== tagId);
  setStored(KEY_QR_NFC_TAGS, remaining);
  asyncDbDelete("qr_nfc_tags", "tag_id", target.tag_id);

  const deletedRecords = getAllDeletedQrNfcTags();
  const deletedItem: DeletedQrNfcTagRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
  };
  setStored(KEY_DELETED_QR_NFC_TAGS, [deletedItem, ...deletedRecords]);
  asyncDbUpsert("deleted_qr_nfc_tags", deletedItem);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedQrNfcTag(tagId: string): boolean {
  const deletedList = getAllDeletedQrNfcTags();
  const target = deletedList.find((t) => t.tag_id === tagId);
  if (!target) return false;

  const remaining = deletedList.filter((t) => t.tag_id !== tagId);
  setStored(KEY_DELETED_QR_NFC_TAGS, remaining);
  asyncDbDelete("deleted_qr_nfc_tags", "tag_id", target.tag_id);

  const current = getAllQrNfcTags();
  const restored: QrNfcTagItemRecord = {
    id: target.id,
    tag_id: target.tag_id,
    product_type: target.product_type,
    business_id: target.business_id,
    business_name: target.business_name,
    link: target.link,
    scans_count: target.scans_count,
    created_at: target.created_at,
  };
  setStored(KEY_QR_NFC_TAGS, [restored, ...current]);
  asyncDbUpsert("qr_nfc_tags", restored, "tag_id");
  return true;
}

// ============================================================================
// DOWNSTREAM SYNC ENGINE
// ============================================================================

function syncTagAssignmentDownstream(tag: QrNfcTagItemRecord): void {
  if (!tag.business_id) return;

  if (tag.product_type === "Counter Standee") {
    // 1. Sync to Google Review Links
    const gLinks = getAllGoogleReviewLinks();
    const existingGLinkIndex = gLinks.findIndex((g) => g.tag_id === tag.tag_id);
    if (existingGLinkIndex === -1) {
      const newGLink: GoogleReviewLinkItemRecord = {
        id: `gl_${tag.tag_id.toLowerCase()}_${Date.now()}`,
        tag_id: tag.tag_id,
        business_id: tag.business_id,
        business_name: tag.business_name || "Assigned Business",
        link_of_tag_id: tag.link,
        business_google_review_link: "",
        destination: "not_assigned", // Red default
        setup_status: "pending",     // Red default
        total_scans: tag.scans_count || 0,
        created_at: new Date().toISOString(),
      };
      setStored(KEY_GOOGLE_LINKS, [newGLink, ...gLinks]);
    }

    // 2. Sync to Page Editor Configs
    const pConfigs = getAllPageEditorConfigs();
    const existingPIndex = pConfigs.findIndex((p) => p.tag_id === tag.tag_id);
    if (existingPIndex === -1) {
      const newPageConfig: PageEditorConfigItemRecord = {
        id: `pe_${tag.tag_id.toLowerCase()}_${Date.now()}`,
        tag_id: tag.tag_id,
        business_id: tag.business_id,
        business_name: tag.business_name || "Assigned Business",
        link_url: tag.link || `${DOMAIN_BASE}/t/${tag.tag_id}`,
        setup_status: "pending", // Default pending in red until saved in editor
        config_data: {
          title: tag.business_name || "Business Name",
          theme: "obsidian",
          google_link: tag.google_review_link || "",
        },
        updated_at: new Date().toISOString(),
      };
      setStored(KEY_PAGE_EDITOR, [newPageConfig, ...pConfigs]);
    }
  } else if (tag.product_type === "Business NFC Card") {
    // Sync to Social Links
    const sLinks = getAllSocialLinks();
    const existingSLinkIndex = sLinks.findIndex((s) => s.tag_id === tag.tag_id);
    if (existingSLinkIndex === -1) {
      const newSLink: SocialLinkItemRecord = {
        id: `sl_${tag.tag_id.toLowerCase()}_${Date.now()}`,
        tag_id: tag.tag_id,
        business_id: tag.business_id,
        business_name: tag.business_name || "Assigned Business",
        social_platform: "N/A", // Red N/A default
        link_of_tag_id: tag.link,
        social_link: "",
        destination: "not_assigned", // Red default
        setup_status: "pending",     // Red default
        total_scans: tag.scans_count || 0,
        created_at: new Date().toISOString(),
      };
      setStored(KEY_SOCIAL_LINKS, [newSLink, ...sLinks]);
    }
  }
}

// ============================================================================
// 4. GOOGLE REVIEW LINKS STORE
// ============================================================================

export function getAllGoogleReviewLinks(): GoogleReviewLinkItemRecord[] {
  return getStored<GoogleReviewLinkItemRecord[]>(KEY_GOOGLE_LINKS, INITIAL_GOOGLE_LINKS);
}

export function updateGoogleReviewLink(tagId: string, updates: Partial<GoogleReviewLinkItemRecord>): GoogleReviewLinkItemRecord | null {
  const current = getAllGoogleReviewLinks();
  const index = current.findIndex((g) => g.tag_id === tagId);
  if (index === -1) return null;

  const item = current[index];
  const newDestination = updates.destination !== undefined ? updates.destination : item.destination;
  const newReviewLink = updates.business_google_review_link !== undefined ? updates.business_google_review_link : item.business_google_review_link;
  
  // Setup status is worked out, not stored:
  // A standee is Completed (green) when its business has a valid Google review link. Otherwise it's Pending (red).
  const isValid = (newReviewLink || "").trim().length > 5 && ((newReviewLink || "").startsWith("http://") || (newReviewLink || "").startsWith("https://"));
  const autoStatus: "pending" | "completed" = isValid ? "completed" : "pending";

  const updatedItem: GoogleReviewLinkItemRecord = {
    ...item,
    ...updates,
    business_google_review_link: newReviewLink,
    destination: newDestination,
    setup_status: autoStatus,
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedItem;
  setStored(KEY_GOOGLE_LINKS, current);
  asyncDbUpsert("google_review_links", updatedItem, "tag_id");

  // Single Source of Truth: update qr_nfc_tags as well
  asyncDbUpsert("qr_nfc_tags", {
    tag_id: tagId,
    google_review_link: newReviewLink,
    destination: newDestination,
  }, "tag_id");

  // Keep page_editor_configs in sync (Connected to Design Review Page)
  if (newReviewLink !== undefined) {
    const pConfigs = getAllPageEditorConfigs();
    const pIdx = pConfigs.findIndex((p) => p.tag_id.toLowerCase() === tagId.toLowerCase());
    if (pIdx !== -1) {
      pConfigs[pIdx] = {
        ...pConfigs[pIdx],
        link_url: `${DOMAIN_BASE}/t/${tagId}`,
        config_data: {
          ...(pConfigs[pIdx].config_data || {}),
          google_link: newReviewLink || "",
        },
        updated_at: new Date().toISOString(),
      };
      setStored(KEY_PAGE_EDITOR, pConfigs);
      asyncDbUpsert("page_editor_configs", pConfigs[pIdx], "tag_id");
    }
  }

  return updatedItem;
}

export function addManualGoogleReviewLink(link: Omit<GoogleReviewLinkItemRecord, "id" | "created_at">): GoogleReviewLinkItemRecord {
  const current = getAllGoogleReviewLinks();
  const autoStatus = link.destination !== "not_assigned" ? "completed" : "pending";
  const newLink: GoogleReviewLinkItemRecord = {
    ...link,
    id: `gl_${link.tag_id.toLowerCase()}_${Date.now()}`,
    setup_status: link.setup_status || autoStatus,
    created_at: new Date().toISOString(),
  };
  const updated = [newLink, ...current];
  setStored(KEY_GOOGLE_LINKS, updated);
  asyncDbUpsert("google_review_links", newLink, "tag_id");
  return newLink;
}

export function getAllDeletedGoogleReviewLinks(): DeletedGoogleReviewLinkRecord[] {
  return getStored<DeletedGoogleReviewLinkRecord[]>(KEY_DELETED_GOOGLE_LINKS, []);
}

export function deleteGoogleReviewLink(tagId: string): { success: boolean; deleted?: DeletedGoogleReviewLinkRecord } {
  const current = getAllGoogleReviewLinks();
  const target = current.find((g) => g.tag_id === tagId);
  if (!target) return { success: false };

  const remaining = current.filter((g) => g.tag_id !== tagId);
  setStored(KEY_GOOGLE_LINKS, remaining);
  asyncDbDelete("google_review_links", "tag_id", target.tag_id);

  const deletedRecords = getAllDeletedGoogleReviewLinks();
  const deletedItem: DeletedGoogleReviewLinkRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
  };
  setStored(KEY_DELETED_GOOGLE_LINKS, [deletedItem, ...deletedRecords]);
  asyncDbUpsert("deleted_google_review_links", deletedItem);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedGoogleReviewLink(tagId: string): boolean {
  const deletedList = getAllDeletedGoogleReviewLinks();
  const target = deletedList.find((g) => g.tag_id === tagId);
  if (!target) return false;

  const remaining = deletedList.filter((g) => g.tag_id !== tagId);
  setStored(KEY_DELETED_GOOGLE_LINKS, remaining);
  asyncDbDelete("deleted_google_review_links", "tag_id", target.tag_id);

  const current = getAllGoogleReviewLinks();
  const restored: GoogleReviewLinkItemRecord = {
    id: target.id,
    tag_id: target.tag_id,
    business_id: target.business_id,
    business_name: target.business_name,
    link_of_tag_id: target.link_of_tag_id,
    business_google_review_link: target.business_google_review_link,
    destination: target.destination,
    setup_status: target.setup_status,
    total_scans: target.total_scans,
    created_at: target.created_at,
    updated_at: target.updated_at,
  };
  setStored(KEY_GOOGLE_LINKS, [restored, ...current]);
  asyncDbUpsert("google_review_links", restored, "tag_id");
  return true;
}

// ============================================================================
// 5. SOCIAL LINKS STORE
// ============================================================================

export function getAllSocialLinks(): SocialLinkItemRecord[] {
  return getStored<SocialLinkItemRecord[]>(KEY_SOCIAL_LINKS, INITIAL_SOCIAL_LINKS);
}

export function updateSocialLink(tagId: string, updates: Partial<SocialLinkItemRecord>): SocialLinkItemRecord | null {
  const current = getAllSocialLinks();
  const index = current.findIndex((s) => s.tag_id === tagId);
  if (index === -1) return null;

  const item = current[index];
  const newDestination = updates.destination !== undefined ? updates.destination : item.destination;
  const newSocialLink = updates.social_link !== undefined ? updates.social_link : item.social_link;
  const newPlatform = updates.social_platform !== undefined ? updates.social_platform : item.social_platform;
  
  // Setup status is worked out, not stored:
  // A card is Completed when you’ve chosen what it opens (WhatsApp, Instagram or Facebook) and that link is valid. Otherwise it's Pending (red).
  const hasPlatform = ["WhatsApp", "Instagram", "Facebook"].includes(newPlatform || "");
  const isValid = hasPlatform && (newSocialLink || "").trim().length > 3 && (
    (newSocialLink || "").startsWith("http://") || 
    (newSocialLink || "").startsWith("https://") || 
    (newSocialLink || "").startsWith("wa.me/")
  );
  const autoStatus: "pending" | "completed" = isValid ? "completed" : "pending";

  const updatedItem: SocialLinkItemRecord = {
    ...item,
    ...updates,
    social_platform: newPlatform,
    social_link: newSocialLink,
    destination: newDestination,
    setup_status: autoStatus,
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedItem;
  setStored(KEY_SOCIAL_LINKS, current);
  asyncDbUpsert("social_links", updatedItem, "tag_id");

  // Single Source of Truth: update qr_nfc_tags as well
  asyncDbUpsert("qr_nfc_tags", {
    tag_id: tagId,
    social_platform: newPlatform,
    social_link: newSocialLink,
    destination: newDestination,
  }, "tag_id");

  return updatedItem;
}

export function addManualSocialLink(link: Omit<SocialLinkItemRecord, "id" | "created_at">): SocialLinkItemRecord {
  const current = getAllSocialLinks();
  const autoStatus = link.destination === "assigned" ? "completed" : "pending";
  const newLink: SocialLinkItemRecord = {
    ...link,
    id: `sl_${link.tag_id.toLowerCase()}_${Date.now()}`,
    setup_status: link.setup_status || autoStatus,
    created_at: new Date().toISOString(),
  };
  const updated = [newLink, ...current];
  setStored(KEY_SOCIAL_LINKS, updated);
  asyncDbUpsert("social_links", newLink, "tag_id");
  return newLink;
}

export function getAllDeletedSocialLinks(): DeletedSocialLinkRecord[] {
  return getStored<DeletedSocialLinkRecord[]>(KEY_DELETED_SOCIAL_LINKS, []);
}

export function deleteSocialLink(tagId: string): { success: boolean; deleted?: DeletedSocialLinkRecord } {
  const current = getAllSocialLinks();
  const target = current.find((s) => s.tag_id === tagId);
  if (!target) return { success: false };

  const remaining = current.filter((s) => s.tag_id !== tagId);
  setStored(KEY_SOCIAL_LINKS, remaining);
  asyncDbDelete("social_links", "tag_id", target.tag_id);

  const deletedRecords = getAllDeletedSocialLinks();
  const deletedItem: DeletedSocialLinkRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
  };
  setStored(KEY_DELETED_SOCIAL_LINKS, [deletedItem, ...deletedRecords]);
  asyncDbUpsert("deleted_social_links", deletedItem);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedSocialLink(tagId: string): boolean {
  const deletedList = getAllDeletedSocialLinks();
  const target = deletedList.find((s) => s.tag_id === tagId);
  if (!target) return false;

  const remaining = deletedList.filter((s) => s.tag_id !== tagId);
  setStored(KEY_DELETED_SOCIAL_LINKS, remaining);
  asyncDbDelete("deleted_social_links", "tag_id", target.tag_id);

  const current = getAllSocialLinks();
  const restored: SocialLinkItemRecord = {
    id: target.id,
    tag_id: target.tag_id,
    business_id: target.business_id,
    business_name: target.business_name,
    social_platform: target.social_platform,
    link_of_tag_id: target.link_of_tag_id,
    social_link: target.social_link,
    destination: target.destination,
    setup_status: target.setup_status,
    total_scans: target.total_scans,
    created_at: target.created_at,
    updated_at: target.updated_at,
  };
  setStored(KEY_SOCIAL_LINKS, [restored, ...current]);
  asyncDbUpsert("social_links", restored, "tag_id");
  return true;
}

// ============================================================================
// 6. PAGE EDITOR CONFIGS STORE
// ============================================================================

export function getAllPageEditorConfigs(): PageEditorConfigItemRecord[] {
  return getStored<PageEditorConfigItemRecord[]>(KEY_PAGE_EDITOR, INITIAL_PAGE_EDITORS);
}

export function updatePageEditorConfig(tagId: string, updates: Partial<PageEditorConfigItemRecord>): PageEditorConfigItemRecord | null {
  const current = getAllPageEditorConfigs();
  const index = current.findIndex((p) => p.tag_id === tagId);
  if (index === -1) return null;

  const updatedItem: PageEditorConfigItemRecord = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedItem;
  setStored(KEY_PAGE_EDITOR, current);
  asyncDbUpsert("page_editor_configs", updatedItem, "tag_id");
  return updatedItem;
}

export function getAllDeletedPageEditorConfigs(): DeletedPageEditorConfigRecord[] {
  return getStored<DeletedPageEditorConfigRecord[]>(KEY_DELETED_PAGE_EDITOR, []);
}

export function deletePageEditorConfig(tagId: string): { success: boolean; deleted?: DeletedPageEditorConfigRecord } {
  const current = getAllPageEditorConfigs();
  const target = current.find((p) => p.tag_id === tagId);
  if (!target) return { success: false };

  const remaining = current.filter((p) => p.tag_id !== tagId);
  setStored(KEY_PAGE_EDITOR, remaining);
  asyncDbDelete("page_editor_configs", "tag_id", target.tag_id);

  const deletedRecords = getAllDeletedPageEditorConfigs();
  const deletedItem: DeletedPageEditorConfigRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
  };
  setStored(KEY_DELETED_PAGE_EDITOR, [deletedItem, ...deletedRecords]);
  asyncDbUpsert("deleted_page_editor_configs", deletedItem);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedPageEditorConfig(tagId: string): boolean {
  const deletedList = getAllDeletedPageEditorConfigs();
  const target = deletedList.find((p) => p.tag_id === tagId);
  if (!target) return false;

  const remaining = deletedList.filter((p) => p.tag_id !== tagId);
  setStored(KEY_DELETED_PAGE_EDITOR, remaining);
  asyncDbDelete("deleted_page_editor_configs", "tag_id", target.tag_id);

  const current = getAllPageEditorConfigs();
  const restored: PageEditorConfigItemRecord = {
    id: target.id,
    tag_id: target.tag_id,
    business_id: target.business_id,
    business_name: target.business_name,
    link_url: target.link_url,
    setup_status: target.setup_status,
    config_data: target.config_data,
    updated_at: target.updated_at,
  };
  setStored(KEY_PAGE_EDITOR, [restored, ...current]);
  asyncDbUpsert("page_editor_configs", restored, "tag_id");
  return true;
}

export function savePageEditorConfig(tagId: string, configData: Record<string, any>): PageEditorConfigItemRecord | null {
  const current = getAllPageEditorConfigs();
  const index = current.findIndex((p) => p.tag_id === tagId);
  if (index === -1) return null;

  // When saved from page editor, status changes to Completed in Green!
  const updatedItem: PageEditorConfigItemRecord = {
    ...current[index],
    business_name: configData?.title || current[index].business_name,
    link_url: `${DOMAIN_BASE}/t/${tagId}`,
    config_data: { ...current[index].config_data, ...configData },
    setup_status: "completed",
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedItem;
  setStored(KEY_PAGE_EDITOR, current);
  asyncDbUpsert("page_editor_configs", updatedItem, "tag_id");

  // Keep google_review_links in sync (Two-way connection with Google Links & QR Sharing)
  if (configData.google_link !== undefined) {
    const cleanGoogleLink = (configData.google_link || "").trim();
    const gLinks = getAllGoogleReviewLinks();
    const gIdx = gLinks.findIndex((g) => g.tag_id.toLowerCase() === tagId.toLowerCase());
    if (gIdx !== -1) {
      gLinks[gIdx] = {
        ...gLinks[gIdx],
        business_google_review_link: cleanGoogleLink,
        link_of_tag_id: `${DOMAIN_BASE}/t/${tagId}`,
        setup_status: cleanGoogleLink ? "completed" : gLinks[gIdx].setup_status,
        updated_at: new Date().toISOString(),
      };
      setStored(KEY_GOOGLE_LINKS, gLinks);
      asyncDbUpsert("google_review_links", gLinks[gIdx], "tag_id");
    }

    const allTags = getAllQrNfcTags();
    const tIdx = allTags.findIndex((t) => t.tag_id.toLowerCase() === tagId.toLowerCase());
    if (tIdx !== -1) {
      allTags[tIdx] = {
        ...allTags[tIdx],
        google_review_link: cleanGoogleLink,
      };
      setStored(KEY_QR_NFC_TAGS, allTags);
      asyncDbUpsert("qr_nfc_tags", allTags[tIdx], "tag_id");
    }
  }

  return updatedItem;
}
