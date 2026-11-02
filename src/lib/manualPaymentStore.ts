// ZenTap Manual Payment Store
// Isomorphic store with localStorage persistence & mock/in-memory data for Founder Operations

export const PRODUCT_CATEGORIES = [
  {
    id: "business_review_standee",
    name: "Business Review Standee",
    description: "Direct 1-tap Google Review Standee (No intermediate page)",
    defaultPrice: 999,
  },
  {
    id: "zentap_smart_review_standee",
    name: "ZenTap Smart Review Standee",
    description: "Customized Review Assistant page with AI guidance & customer feedback inbox",
    defaultPrice: 1499,
  },
  {
    id: "zentap_smart_business_card",
    name: "ZenTap Smart Business Card",
    description: "QR/NFC Digital Business Card with socials & WhatsApp hub",
    defaultPrice: 699,
  },
  {
    id: "custom_solution",
    name: "ZenTap Custom Solutions",
    description: "Bespoke QR/NFC hardware, displays, and multi-location setups",
    defaultPrice: 2499,
  },
] as const;

export type ProductCategoryId = typeof PRODUCT_CATEGORIES[number]["id"];

export type PaymentMethod = "upi" | "cash" | "bank_transfer" | "cheque" | "card" | "other";
export type PaymentStatus = "pending" | "partial" | "completed";

export interface ManualPaymentRecord {
  id: string;
  business_id: string;
  business_name: string;
  product_purchased: string;
  total_agreed_amount: number;
  amount_received: number;
  pending_balance: number;
  payment_date: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "zentap_manual_payments_v1";

// Seed data for initial demo & operations
const INITIAL_PAYMENTS: ManualPaymentRecord[] = [
  {
    id: "pay_01",
    business_id: "biz_aroma",
    business_name: "Café Aroma Bodakdev",
    product_purchased: "zentap_smart_review_standee",
    total_agreed_amount: 1499,
    amount_received: 1499,
    pending_balance: 0,
    payment_date: "2026-10-25",
    payment_method: "upi",
    payment_status: "completed",
    admin_notes: "GPay received directly by founder. Standee dispatched via BlueDart.",
    created_at: "2026-10-25T10:00:00Z",
    updated_at: "2026-10-25T10:00:00Z",
  },
  {
    id: "pay_02",
    business_id: "biz_smile",
    business_name: "Smile Dental Clinic",
    product_purchased: "business_review_standee",
    total_agreed_amount: 999,
    amount_received: 500,
    pending_balance: 499,
    payment_date: "2026-10-28",
    payment_method: "cash",
    payment_status: "partial",
    admin_notes: "500 advance received. Balance 499 on standee counter installation.",
    created_at: "2026-10-28T14:30:00Z",
    updated_at: "2026-10-28T14:30:00Z",
  },
  {
    id: "pay_03",
    business_id: "biz_urban",
    business_name: "Urban Hair Salon",
    product_purchased: "zentap_smart_business_card",
    total_agreed_amount: 699,
    amount_received: 699,
    pending_balance: 0,
    payment_date: "2026-10-30",
    payment_method: "upi",
    payment_status: "completed",
    admin_notes: "Full payment done via PhonePe. PVC card engraved.",
    created_at: "2026-10-30T11:15:00Z",
    updated_at: "2026-10-30T11:15:00Z",
  },
];

let inMemoryPayments: ManualPaymentRecord[] = [...INITIAL_PAYMENTS];

export function getAllManualPayments(): ManualPaymentRecord[] {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PAYMENTS));
    } catch (e) {
      console.warn("Could not read manual payments from localStorage", e);
    }
  }
  return inMemoryPayments;
}

export function saveManualPayment(
  payment: Omit<ManualPaymentRecord, "id" | "pending_balance" | "created_at" | "updated_at"> & {
    id?: string;
  }
): ManualPaymentRecord {
  const all = getAllManualPayments();
  const now = new Date().toISOString();
  const totalAgreed = Number(payment.total_agreed_amount) || 0;
  const received = Number(payment.amount_received) || 0;
  const pending = Math.max(0, totalAgreed - received);

  // Automatically derive status if not manually overridden to custom
  let status: PaymentStatus = payment.payment_status;
  if (received >= totalAgreed && totalAgreed > 0) {
    status = "completed";
  } else if (received > 0 && received < totalAgreed) {
    status = "partial";
  } else if (received === 0) {
    status = "pending";
  }

  let record: ManualPaymentRecord;

  if (payment.id) {
    // Update
    const idx = all.findIndex((p) => p.id === payment.id);
    if (idx !== -1) {
      record = {
        ...all[idx],
        ...payment,
        id: payment.id,
        total_agreed_amount: totalAgreed,
        amount_received: received,
        pending_balance: pending,
        payment_status: status,
        updated_at: now,
      };
      all[idx] = record;
    } else {
      record = {
        ...payment,
        id: payment.id,
        total_agreed_amount: totalAgreed,
        amount_received: received,
        pending_balance: pending,
        payment_status: status,
        created_at: now,
        updated_at: now,
      };
      all.unshift(record);
    }
  } else {
    // Insert new
    record = {
      ...payment,
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      total_agreed_amount: totalAgreed,
      amount_received: received,
      pending_balance: pending,
      payment_status: status,
      created_at: now,
      updated_at: now,
    };
    all.unshift(record);
  }

  inMemoryPayments = all;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn("Could not save manual payments to localStorage", e);
    }
  }

  return record;
}

export function deleteManualPayment(id: string): boolean {
  const all = getAllManualPayments().filter((p) => p.id !== id);
  inMemoryPayments = all;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (e) {
      console.warn("Could not delete manual payment from localStorage", e);
    }
  }
  return true;
}

export function getManualPaymentStats() {
  const all = getAllManualPayments();
  const totalAgreed = all.reduce((sum, p) => sum + (Number(p.total_agreed_amount) || 0), 0);
  const totalReceived = all.reduce((sum, p) => sum + (Number(p.amount_received) || 0), 0);
  const totalPending = all.reduce((sum, p) => sum + (Number(p.pending_balance) || 0), 0);
  const completedCount = all.filter((p) => p.payment_status === "completed").length;
  const partialCount = all.filter((p) => p.payment_status === "partial").length;
  const pendingCount = all.filter((p) => p.payment_status === "pending").length;

  return {
    totalAgreed,
    totalReceived,
    totalPending,
    completedCount,
    partialCount,
    pendingCount,
    totalCount: all.length,
  };
}
