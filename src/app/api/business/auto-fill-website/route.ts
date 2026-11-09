// src/app/api/business/auto-fill-website/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractDetailsFromWebsite } from "@/lib/ai/businessContext";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, businessName } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { error: "Website URL is required." },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim();
    const details = await extractDetailsFromWebsite(cleanUrl);

    if (!details) {
      return NextResponse.json({
        success: false,
        error: "Could not extract details from the website. Please check the URL or enter details manually.",
      });
    }

    const extracted = {
      businessName: details.business_name || businessName || "",
      business_name: details.business_name || businessName || "",
      category: details.category || "",
      area: details.area || "",
      services: details.services || [],
      keywords: details.keywords || [],
      website_url: cleanUrl,
      websiteUrl: cleanUrl,
    };

    return NextResponse.json({
      success: true,
      data: extracted,
      extracted: extracted,
    });
  } catch (err: any) {
    console.error("[api/business/auto-fill-website] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to analyze website." },
      { status: 500 }
    );
  }
}
