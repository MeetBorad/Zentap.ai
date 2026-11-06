// src/app/api/admin/owner-credentials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashSecret, DEFAULT_PIN_HASH } from "@/lib/ownerAccess";

export const dynamic = "force-dynamic";

export interface OwnerCredentialItem {
  business_id: string; // e.g. "ZT-0004"
  business_name: string;
  city: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  page_slug: string;
  page_url: string;
  login_id: string;
  password: string;
  updated_at?: string;
}

function generateDeterministicPassword(businessId: string): string {
  const digits = (businessId.match(/\d+/) || [""])[0];
  const num = parseInt(digits || "1", 10);
  const code = (num * 7393 + 1234) % 10000;
  return `ZT@${String(code).padStart(4, "0")}`;
}

export async function GET() {
  const db = createAdminClient();
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://www.zentapdigitalsolutions.com";

  try {
    let clients: any[] = [];
    let tags: any[] = [];
    let pageConfigs: any[] = [];

    if (db) {
      const [cRes, tRes, pRes] = await Promise.all([
        db.from("clients").select("*").is("deleted_at", null).order("business_id", { ascending: true }),
        db.from("qr_nfc_tags").select("*").is("deleted_at", null),
        db.from("page_editor_configs").select("*").is("deleted_at", null),
      ]);
      clients = cRes.data || [];
      tags = tRes.data || [];
      pageConfigs = pRes.data || [];
    }

    // Fallback sample clients if DB returned empty
    if (clients.length === 0) {
      clients = [
        { business_id: "ZT-0004", business_name: "Zentap Digital Solutions", city: "Ahmedabad", owner_name: "Meet", owner_phone: "+91 92745 60880", owner_email: "meetborad@hotmail.com" },
        { business_id: "ZT-0001", business_name: "Café Aroma Bodakdev", city: "Ahmedabad", owner_name: "Aarav Sharma", owner_phone: "+91 98250 12345", owner_email: "contact@cafearoma.in" },
        { business_id: "ZT-0002", business_name: "Smile Dental Clinic", city: "Surat", owner_name: "Dr. Priya Patel", owner_phone: "+91 98251 23456", owner_email: "smiledental@gmail.com" },
        { business_id: "ZT-0003", business_name: "Urban Hair Salon", city: "Vadodara", owner_name: "Rohan Mehta", owner_phone: "+91 98252 34567", owner_email: "urbanhairsalon@gmail.com" },
      ];
    }

    const credentials: OwnerCredentialItem[] = clients.map((c) => {
      const bid = c.business_id || c.id || "ZT-0001";
      
      // Match tag or page config
      const matchedTag = tags.find((t) => t.business_id === bid || (t.tag_id && bid.toLowerCase().includes(t.tag_id.toLowerCase())));
      const matchedPage = pageConfigs.find((p) => p.business_id === bid || p.tag_id === matchedTag?.tag_id);

      const pageSlug = matchedTag?.tag_id || matchedPage?.tag_id || (bid === "ZT-0004" ? "st3" : bid.toLowerCase());
      const pageUrl = `${domain}/r/${pageSlug}`;

      const customFields = c.custom_fields || {};
      const loginId = customFields.owner_login_id || matchedPage?.config_data?.owner_login_id || bid;
      const existingPass = customFields.owner_password || matchedPage?.config_data?.owner_password;
      const password = existingPass || generateDeterministicPassword(bid);

      return {
        business_id: bid,
        business_name: c.business_name || "Business",
        city: c.city || "Ahmedabad",
        owner_name: c.owner_name || "",
        owner_phone: c.owner_phone || c.whatsapp || "",
        owner_email: c.owner_email || "",
        page_slug: pageSlug,
        page_url: pageUrl,
        login_id: loginId,
        password: password,
        updated_at: c.updated_at || c.created_at,
      };
    });

    return NextResponse.json({ success: true, credentials });
  } catch (err: any) {
    console.error("GET /api/admin/owner-credentials error:", err);
    return NextResponse.json({ error: err.message || "Failed to load credentials" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = createAdminClient();

  try {
    const body = await req.json();
    const { business_id, login_id, password } = body;

    if (!business_id) {
      return NextResponse.json({ error: "business_id is required" }, { status: 400 });
    }

    const cleanBid = business_id.trim();
    const newLoginId = (login_id || cleanBid).trim();
    const newPassword = (password || generateDeterministicPassword(cleanBid)).trim();
    const pinHash = hashSecret(newPassword);

    if (db) {
      // 1. Update in clients table (inside custom_fields)
      const { data: existingClient } = await db
        .from("clients")
        .select("*")
        .eq("business_id", cleanBid)
        .maybeSingle();

      if (existingClient) {
        const customFields = existingClient.custom_fields || {};
        customFields.owner_login_id = newLoginId;
        customFields.owner_password = newPassword;

        await db
          .from("clients")
          .update({
            custom_fields: customFields,
            updated_at: new Date().toISOString(),
          })
          .eq("business_id", cleanBid);
      }

      // 2. Update page_editor_configs
      const { data: existingPage } = await db
        .from("page_editor_configs")
        .select("*")
        .or(`business_id.eq.${cleanBid},tag_id.ilike.${cleanBid}`)
        .maybeSingle();

      if (existingPage) {
        const configData = existingPage.config_data || {};
        configData.owner_login_id = newLoginId;
        configData.owner_password = newPassword;

        await db
          .from("page_editor_configs")
          .update({
            config_data: configData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPage.id);
      }

      // 3. Update tags / businesses if found
      try {
        await db
          .from("tags")
          .update({ pin_hash: pinHash, password_hash: pinHash })
          .or(`code.ilike.${cleanBid},business_id.eq.${cleanBid}`);
      } catch {
        // Ignored if tags table schema differs
      }
    }

    return NextResponse.json({
      success: true,
      business_id: cleanBid,
      login_id: newLoginId,
      password: newPassword,
    });
  } catch (err: any) {
    console.error("POST /api/admin/owner-credentials error:", err);
    return NextResponse.json({ error: err.message || "Failed to update credentials" }, { status: 500 });
  }
}

