// src/lib/adminPlatformStore.ts
// Unified store for ZenTap Admin Webpages Redesign:
// Clients, Payments, QR/NFC Generator, Google Links, Social Links, and Page Editor

export interface ClientRecord {
  id: string;
  business_id: string; // e.g. ZT-0001
  business_name: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  whatsapp: string;
  instagram_link: string;
  facebook_link: string;
  city: string;
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
  city: string;
  deleted_at: string;
  deleted_by: string;
  notes?: string;
}

export interface PaymentItemRecord {
  id: string;
  business_id: string; // e.g. ZT-0001
  business_name: string;
  product: string;
  product_price: number;
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
  created_at: string;
}

export interface GoogleReviewLinkItemRecord {
  id: string;
  tag_id: string; // e.g. ST1
  business_id: string; // e.g. ZT-0001
  business_name: string;
  link_of_tag_id: string;
  business_google_review_link: string;
  destination: "not_assigned" | "direct_google" | "zentap_google";
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
];

const INITIAL_TAGS: QrNfcTagItemRecord[] = [
  {
    id: "tag_st1",
    tag_id: "ST1",
    product_type: "Counter Standee",
    business_id: "ZT-0001",
    business_name: "Café Aroma Bodakdev",
    link: `${DOMAIN_BASE}/t/ST1`,
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
    business_id: null,
    business_name: null,
    link: `${DOMAIN_BASE}/t/ST3`,
    scans_count: 0,
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
    business_name: "Café Aroma Bodakdev",
    link_of_tag_id: `${DOMAIN_BASE}/t/ST1`,
    business_google_review_link: "https://g.page/r/CbOD_Cafearoma/review",
    destination: "zentap_google",
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
    id: "pe_01",
    tag_id: "ST1",
    business_id: "ZT-0001",
    business_name: "Café Aroma Bodakdev",
    link_url: `${DOMAIN_BASE}/r/zentap?preview=1`,
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
    link_url: `${DOMAIN_BASE}/r/smile-dental?preview=1`,
    setup_status: "pending",
    config_data: {
      theme: "slate",
      title: "Smile Dental Clinic",
      subtitle: "Multi-Speciality Dental Care",
      cta_text: "Rate Your Visit on Google",
    },
    updated_at: "2026-10-28T14:45:00Z",
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

// Helper: safe write
function setStored<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Storage write error for key:", key, e);
  }
}

// ============================================================================
// 1. CLIENTS STORE & DELETED BUSINESSES
// ============================================================================

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

  return { success: true, deleted: deletedItem };
}

export function restoreDeletedBusiness(businessId: string): boolean {
  const deletedList = getAllDeletedBusinesses();
  const target = deletedList.find((d) => d.business_id === businessId || d.id === businessId);
  if (!target) return false;

  // Remove from deleted table
  const updatedDeleted = deletedList.filter((d) => d.business_id !== target.business_id);
  setStored(KEY_DELETED_BUSINESSES, updatedDeleted);

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
  return newPayment;
}

export function updatePayment(id: string, updates: Partial<PaymentItemRecord>): PaymentItemRecord | null {
  const current = getAllPayments();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const updatedItem = { ...current[index], ...updates };
  current[index] = updatedItem;
  setStored(KEY_PAYMENTS, current);
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

  // Add to deleted_payments
  const deletedRecords = getAllDeletedPayments();
  const deletedItem: DeletedPaymentRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
    notes: notes || target.notes,
  };
  setStored(KEY_DELETED_PAYMENTS, [deletedItem, ...deletedRecords]);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedPayment(id: string): boolean {
  const deletedList = getAllDeletedPayments();
  const target = deletedList.find((p) => p.id === id);
  if (!target) return false;

  // Remove from deleted
  const remaining = deletedList.filter((p) => p.id !== id);
  setStored(KEY_DELETED_PAYMENTS, remaining);

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

  const deletedRecords = getAllDeletedQrNfcTags();
  const deletedItem: DeletedQrNfcTagRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
  };
  setStored(KEY_DELETED_QR_NFC_TAGS, [deletedItem, ...deletedRecords]);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedQrNfcTag(tagId: string): boolean {
  const deletedList = getAllDeletedQrNfcTags();
  const target = deletedList.find((t) => t.tag_id === tagId);
  if (!target) return false;

  const remaining = deletedList.filter((t) => t.tag_id !== tagId);
  setStored(KEY_DELETED_QR_NFC_TAGS, remaining);

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
        link_url: `${DOMAIN_BASE}/r/zentap?preview=1`,
        setup_status: "pending", // Default pending in red until saved in editor
        config_data: {
          title: tag.business_name || "Business Name",
          theme: "obsidian",
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
  
  // Logic: when Destination of QR/NFC is anything EXCEPT Not Assigned, status is Completed (Green), default Pending (Red)
  const autoStatus: "pending" | "completed" = newDestination !== "not_assigned" ? "completed" : "pending";

  const updatedItem: GoogleReviewLinkItemRecord = {
    ...item,
    ...updates,
    destination: newDestination,
    setup_status: updates.setup_status || autoStatus,
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedItem;
  setStored(KEY_GOOGLE_LINKS, current);
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

  const deletedRecords = getAllDeletedGoogleReviewLinks();
  const deletedItem: DeletedGoogleReviewLinkRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
  };
  setStored(KEY_DELETED_GOOGLE_LINKS, [deletedItem, ...deletedRecords]);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedGoogleReviewLink(tagId: string): boolean {
  const deletedList = getAllDeletedGoogleReviewLinks();
  const target = deletedList.find((g) => g.tag_id === tagId);
  if (!target) return false;

  const remaining = deletedList.filter((g) => g.tag_id !== tagId);
  setStored(KEY_DELETED_GOOGLE_LINKS, remaining);

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
  
  // Logic: when Destination is Assigned (or social link is set), status is Completed (Green), else Pending (Red)
  const autoStatus: "pending" | "completed" = newDestination === "assigned" ? "completed" : "pending";

  const updatedItem: SocialLinkItemRecord = {
    ...item,
    ...updates,
    destination: newDestination,
    setup_status: updates.setup_status || autoStatus,
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedItem;
  setStored(KEY_SOCIAL_LINKS, current);
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

  const deletedRecords = getAllDeletedSocialLinks();
  const deletedItem: DeletedSocialLinkRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
  };
  setStored(KEY_DELETED_SOCIAL_LINKS, [deletedItem, ...deletedRecords]);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedSocialLink(tagId: string): boolean {
  const deletedList = getAllDeletedSocialLinks();
  const target = deletedList.find((s) => s.tag_id === tagId);
  if (!target) return false;

  const remaining = deletedList.filter((s) => s.tag_id !== tagId);
  setStored(KEY_DELETED_SOCIAL_LINKS, remaining);

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

  const deletedRecords = getAllDeletedPageEditorConfigs();
  const deletedItem: DeletedPageEditorConfigRecord = {
    ...target,
    deleted_at: new Date().toISOString(),
    deleted_by: "admin",
  };
  setStored(KEY_DELETED_PAGE_EDITOR, [deletedItem, ...deletedRecords]);
  return { success: true, deleted: deletedItem };
}

export function restoreDeletedPageEditorConfig(tagId: string): boolean {
  const deletedList = getAllDeletedPageEditorConfigs();
  const target = deletedList.find((p) => p.tag_id === tagId);
  if (!target) return false;

  const remaining = deletedList.filter((p) => p.tag_id !== tagId);
  setStored(KEY_DELETED_PAGE_EDITOR, remaining);

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
  return true;
}

export function savePageEditorConfig(tagId: string, configData: Record<string, any>): PageEditorConfigItemRecord | null {
  const current = getAllPageEditorConfigs();
  const index = current.findIndex((p) => p.tag_id === tagId);
  if (index === -1) return null;

  // When saved from page editor, status changes to Completed in Green!
  const updatedItem: PageEditorConfigItemRecord = {
    ...current[index],
    config_data: { ...current[index].config_data, ...configData },
    setup_status: "completed",
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedItem;
  setStored(KEY_PAGE_EDITOR, current);
  return updatedItem;
}
