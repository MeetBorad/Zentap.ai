import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let dataUrl = "";
    let slot = "banner";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      dataUrl = body.image || body.dataUrl || "";
      slot = body.slot || "banner";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      slot = (formData.get("slot") as string) || "banner";
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mime = file.type || "image/jpeg";
      dataUrl = `data:${mime};base64,${base64}`;
    }

    if (!dataUrl) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

    return NextResponse.json({
      success: true,
      url: dataUrl,
      slot,
      sizeKb,
      message: `Image processed successfully (${sizeKb} KB).`,
    });
  } catch (err: any) {
    console.error("POST /api/admin/upload-image error:", err);
    return NextResponse.json({ error: err.message || "Failed to process image" }, { status: 500 });
  }
}
