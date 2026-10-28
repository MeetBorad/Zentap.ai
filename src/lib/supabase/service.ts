import { createClient } from "./client";

export interface DbMerchant {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  google_place_id: string | null;
  google_review_url: string | null;
  auto_reply_mode: string | null;
  plan: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbStandee {
  id: string;
  merchant_id: string;
  serial_number: string;
  size: string | null;
  nfc_chip_type: string | null;
  shipping_address: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  delivery_status: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface DbReview {
  id: string;
  merchant_id: string;
  google_review_id: string | null;
  author_name: string;
  author_photo_url: string | null;
  rating: number;
  review_text: string | null;
  review_language: string | null;
  review_timestamp: string | null;
  created_at: string;
}

export interface DbPrivateFeedback {
  id: string;
  merchant_id: string;
  rating: number;
  customer_name: string | null;
  customer_phone: string | null;
  feedback_text: string | null;
  status: string | null;
  created_at: string;
}

// Fetch all active merchants
export async function fetchMerchants(): Promise<DbMerchant[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase fetchMerchants error:", error.message);
    return [];
  }
  return data || [];
}

// Fetch standees for a merchant
export async function fetchStandees(merchantId?: string): Promise<DbStandee[]> {
  const supabase = createClient();
  let query = supabase.from("standees").select("*");
  if (merchantId) {
    query = query.eq("merchant_id", merchantId);
  }
  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.warn("Supabase fetchStandees error:", error.message);
    return [];
  }
  return data || [];
}

// Log a standee scan / tap event
export async function logStandeeScan(
  merchantId: string,
  channel: "nfc" | "qr" = "nfc",
  deviceOs: string = "iOS"
) {
  const supabase = createClient();
  const { data, error } = await supabase.from("standee_scans").insert([
    {
      merchant_id: merchantId,
      channel,
      device_os: deviceOs,
      scanned_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.warn("Supabase logStandeeScan error:", error.message);
  }
  return data;
}

// Save private negative feedback (1-3 stars)
export async function logPrivateFeedback(
  merchantId: string,
  rating: number,
  customerName: string,
  customerPhone: string,
  feedbackText: string
) {
  const supabase = createClient();
  const { data, error } = await supabase.from("private_feedbacks").insert([
    {
      merchant_id: merchantId,
      rating,
      customer_name: customerName,
      customer_phone: customerPhone,
      feedback_text: feedbackText,
      status: "pending_resolution",
    },
  ]);

  if (error) {
    console.warn("Supabase logPrivateFeedback error:", error.message);
  }
  return data;
}

// Provision a new standee
export async function provisionStandee(
  merchantId: string,
  serialNumber: string,
  size: string = "Standard A6",
  nfcChipType: string = "NTAG216"
) {
  const supabase = createClient();
  const { data, error } = await supabase.from("standees").insert([
    {
      merchant_id: merchantId,
      serial_number: serialNumber,
      size,
      nfc_chip_type: nfcChipType,
      delivery_status: "active_deployed",
    },
  ]);

  if (error) {
    console.warn("Supabase provisionStandee error:", error.message);
  }
  return data;
}
