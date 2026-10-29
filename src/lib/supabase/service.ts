import { createClient as createBrowserSupabaseClient } from "./client";
import { createAdminClient } from "./admin";

export interface DbBusinessRecord {
  id: string;
  owner_user_id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string;
  pincode: string | null;
  address: string | null;
  category: string | null;
  gbp_link: string | null;
  slug: string;
  plan: "card_500" | "standee_1500" | "standee_auto_2000" | null;
  payment_status: "pending" | "paid" | "failed";
  review_url: string | null;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DbPublicBusiness {
  id: string;
  name: string;
  slug: string;
  review_url: string | null;
  active: boolean;
  category: string | null;
  city: string | null;
  address: string | null;
}

export interface DbScanRecord {
  id: string;
  business_id: string;
  source: "qr" | "nfc";
  visitor_hash: string;
  is_preview: boolean;
  scanned_date: string;
  at: string;
}

export interface DbFeedbackRecord {
  id: string;
  business_id: string;
  rating: number;
  text: string;
  customer_name: string | null;
  customer_phone: string | null;
  at: string;
}

export interface DbOrderRecord {
  id: string;
  business_id: string;
  plan: "card_500" | "standee_1500" | "standee_auto_2000";
  amount: number;
  courier: number;
  status: "processing" | "in_production" | "shipped" | "delivered";
  razorpay_id: string;
  tracking_number?: string | null;
  courier_name?: string | null;
  estimated_delivery?: string | null;
  at: string;
}

// Helper to get supabase client (browser or admin depending on execution context)
function getSupabase(useAdmin = false) {
  if (useAdmin && typeof window === "undefined") {
    const admin = createAdminClient();
    if (admin) return admin;
  }
  return createBrowserSupabaseClient();
}

/**
 * Helper to check if string is a valid UUID
 */
export function isValidUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * 1. Fetch user business by owner user ID from Supabase
 */
export async function fetchUserBusinessFromDb(userId: string): Promise<DbBusinessRecord | null> {
  try {
    const supabase = getSupabase();
    const cleanUserId = userId.replace(/^biz_/, "");
    
    // First query by owner_user_id
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_user_id", cleanUserId)
      .maybeSingle();

    if (!error && data) {
      return data;
    }

    // Fallback: If userId is itself a UUID, also check id column
    if (isValidUuid(cleanUserId)) {
      const { data: byId } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", cleanUserId)
        .maybeSingle();
      if (byId) return byId;
    }

    if (error) {
      console.warn("Supabase fetchUserBusinessFromDb notice:", error.message);
    }
    return null;
  } catch (err) {
    console.warn("Supabase fetchUserBusinessFromDb exception:", err);
    return null;
  }
}

/**
 * 2. Upsert user business in Supabase
 */
export async function upsertUserBusinessInDb(
  biz: Partial<DbBusinessRecord> & { owner_user_id: string; slug: string; name: string; email: string }
): Promise<DbBusinessRecord | null> {
  try {
    const supabase = getSupabase();
    const cleanOwnerId = biz.owner_user_id.replace(/^biz_/, "");
    const isIdUuid = isValidUuid(biz.id);

    const payload: any = {
      ...biz,
      owner_user_id: cleanOwnerId,
      updated_at: new Date().toISOString(),
    };

    // If biz.id is not a valid 36-char UUID (e.g. "biz_..."), omit it so Postgres gen_random_uuid() generates a real UUID
    if (!isIdUuid) {
      delete payload.id;
    }

    const { data, error } = await supabase
      .from("businesses")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("Supabase upsertUserBusinessInDb notice:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase upsertUserBusinessInDb exception:", err);
    return null;
  }
}

/**
 * 3. Fetch public business details for Assistant Page (/r/[slug])
 * Uses safe public view to never leak owner personal info
 */
export async function fetchPublicBusinessBySlug(slug: string): Promise<DbPublicBusiness | null> {
  try {
    const supabase = getSupabase();
    // Try public_businesses view first (safe), fallback to businesses if view not created
    const { data, error } = await supabase
      .from("public_businesses")
      .select("id, name, slug, review_url, active, category, city, address")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();

    if (!error && data) {
      return data;
    }

    // Fallback directly to businesses table
    const { data: directData, error: directErr } = await supabase
      .from("businesses")
      .select("id, name, slug, review_url, active, category, city, address")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();

    if (directErr) {
      return null;
    }
    return directData;
  } catch (err) {
    console.warn("fetchPublicBusinessBySlug exception:", err);
    return null;
  }
}

/**
 * 4. Record visitor scan in Supabase
 */
export async function recordDbScan(
  businessId: string,
  source: "qr" | "nfc",
  visitorHash: string,
  isPreview = false
) {
  try {
    if (!isValidUuid(businessId)) return;
    const supabase = getSupabase();
    const { error } = await supabase.from("scans").insert([
      {
        business_id: businessId,
        source,
        visitor_hash: visitorHash,
        is_preview: isPreview,
        scanned_date: new Date().toISOString().split("T")[0],
      },
    ]);
    if (error) {
      console.warn("recordDbScan notice:", error.message);
    }
  } catch (err) {
    console.warn("recordDbScan exception:", err);
  }
}

/**
 * 5. Record telemetry event (rating, review_click, private_feedback)
 */
export async function recordDbEvent(
  businessId: string,
  type: "rating" | "review_click" | "private_feedback",
  rating?: number
) {
  try {
    if (!isValidUuid(businessId)) return;
    const supabase = getSupabase();
    const { error } = await supabase.from("events").insert([
      {
        business_id: businessId,
        type,
        rating: rating || null,
      },
    ]);
    if (error) {
      console.warn("recordDbEvent notice:", error.message);
    }
  } catch (err) {
    console.warn("recordDbEvent exception:", err);
  }
}

/**
 * 6. Record private customer feedback (1-2 stars)
 */
export async function recordDbFeedback(
  businessId: string,
  rating: number,
  text: string,
  customerName?: string,
  customerPhone?: string
) {
  try {
    if (!isValidUuid(businessId)) return null;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback")
      .insert([
        {
          business_id: businessId,
          rating,
          text,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.warn("recordDbFeedback notice:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("recordDbFeedback exception:", err);
    return null;
  }
}

/**
 * 7. Fetch orders for an owner's business
 */
export async function fetchDbOrders(businessId: string): Promise<DbOrderRecord[]> {
  try {
    if (!isValidUuid(businessId)) return [];
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("business_id", businessId)
      .order("at", { ascending: false });

    if (error) {
      console.warn("fetchDbOrders notice:", error.message);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

/**
 * 8. Fetch feedbacks for an owner's business
 */
export async function fetchDbFeedbacks(businessId: string): Promise<DbFeedbackRecord[]> {
  try {
    if (!isValidUuid(businessId)) return [];
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("business_id", businessId)
      .order("at", { ascending: false });

    if (error) {
      console.warn("fetchDbFeedbacks notice:", error.message);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

/**
 * 9. Fetch all businesses for Admin Console
 */
export async function fetchDbAdminBusinesses(): Promise<DbBusinessRecord[]> {
  try {
    const supabase = getSupabase(true);
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchDbAdminBusinesses notice:", error.message);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

/**
 * 10. Update Google Review Link for Admin Console
 */
export async function updateDbReviewUrl(businessId: string, reviewUrl: string | null) {
  return adminUpdateDbBusiness(businessId, { review_url: reviewUrl });
}

/**
 * 11. Generic Admin Business Updater (Supreme Authority)
 */
export async function adminUpdateDbBusiness(businessId: string, updates: Partial<DbBusinessRecord>) {
  try {
    const supabase = getSupabase(true);
    const isIdUuid = isValidUuid(businessId);
    if (!isIdUuid) return false;

    const { error } = await supabase
      .from("businesses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", businessId);

    if (error) {
      console.warn("adminUpdateDbBusiness error:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 12. Fetch all orders across the fleet for Admin Console
 */
export async function fetchDbAdminOrders(): Promise<DbOrderRecord[]> {
  try {
    const supabase = getSupabase(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("at", { ascending: false });

    if (error) {
      console.warn("fetchDbAdminOrders notice:", error.message);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

/**
 * 13. Admin update order status in Supabase
 */
export async function adminUpdateDbOrder(orderId: string, updates: Partial<DbOrderRecord>) {
  try {
    const supabase = getSupabase(true);
    const isIdUuid = isValidUuid(orderId);

    if (isIdUuid) {
      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId);

      if (error) {
        console.warn("adminUpdateDbOrder notice:", error.message);
        return false;
      }
      return true;
    } else {
      // Lookup or match by tracking_number or razorpay_id
      const { error } = await supabase
        .from("orders")
        .update(updates)
        .or(`tracking_number.eq.${orderId},razorpay_id.eq.${orderId},razorpay_order_id.eq.${orderId}`);

      if (error) {
        console.warn("adminUpdateDbOrder by tracking notice:", error.message);
        return false;
      }
      return true;
    }
  } catch {
    return false;
  }
}
