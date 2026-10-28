import { NextRequest, NextResponse } from "next/server";
import { PLAN_PRICES, PLAN_NAMES, getCourierCharge, getRazorpayServerInstance } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, pincode, businessId, customerName, customerEmail, customerPhone, shippingAddress } = body;

    if (!planId || !PLAN_PRICES[planId]) {
      return NextResponse.json({ error: "Invalid plan identifier" }, { status: 400 });
    }

    const basePrice = PLAN_PRICES[planId];
    const courierInfo = getCourierCharge(pincode || "380001");
    const totalInr = basePrice + courierInfo.amount;
    const amountInPaise = totalInr * 100;
    const receiptId = `rcpt_${Date.now().toString().slice(-8)}`;

    const razorpay = getRazorpayServerInstance();

    if (razorpay && process.env.RAZORPAY_KEY_ID) {
      // Live / Staging Razorpay API
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          business_id: businessId || "unknown",
          plan_id: planId,
          plan_name: PLAN_NAMES[planId],
          courier_charge: courierInfo.amount.toString(),
          pincode: pincode || "",
        },
      });

      return NextResponse.json({
        success: true,
        orderId: rzpOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        basePrice,
        courierAmount: courierInfo.amount,
        zone: courierInfo.zone,
        totalInr,
        planName: PLAN_NAMES[planId],
        mode: "razorpay_live",
      });
    }

    // Standard Sandbox / Test Mode when live keys not configured
    const testOrderId = `order_test_${Date.now().toString().slice(-8)}`;
    return NextResponse.json({
      success: true,
      orderId: testOrderId,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_sandbox_mode",
      amount: amountInPaise,
      currency: "INR",
      basePrice,
      courierAmount: courierInfo.amount,
      zone: courierInfo.zone,
      totalInr,
      planName: PLAN_NAMES[planId],
      mode: "sandbox_simulation",
    });
  } catch (err: any) {
    console.error("Create Razorpay Order Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error while creating payment order" },
      { status: 500 }
    );
  }
}
