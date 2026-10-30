import { NextRequest, NextResponse } from "next/server";
import { createLeadRecord } from "@/lib/businessStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, name, phone, email, serviceNeeded, message, source } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and Phone / WhatsApp number are required" },
        { status: 400 }
      );
    }

    const lead = createLeadRecord({
      business_id: businessId || "sample-demo-biz-01",
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || "",
      service_needed: serviceNeeded?.trim() || "General Inquiry",
      message: message?.trim() || "",
      source: source === "qr" ? "qr" : source === "nfc" ? "nfc" : "web",
    });

    return NextResponse.json({
      success: true,
      message: "Lead inquiry captured successfully",
      lead,
    });
  } catch (error: any) {
    console.error("Leads API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process lead inquiry" },
      { status: 500 }
    );
  }
}
