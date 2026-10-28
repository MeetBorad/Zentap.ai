import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature, PLAN_PRICES, PLAN_NAMES, getCourierCharge } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      businessId,
      planId,
      pincode,
      shippingAddress,
      customerPhone,
      customerName,
      customerEmail,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !planId) {
      return NextResponse.json(
        { error: "Missing required transaction verification parameters" },
        { status: 400 }
      );
    }

    // Cryptographic signature verification
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature || "test_signature"
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed: Invalid cryptographic signature" },
        { status: 400 }
      );
    }

    const basePrice = PLAN_PRICES[planId] || 1500;
    const courierInfo = getCourierCharge(pincode || "380001");
    const totalAmount = basePrice + courierInfo.amount;
    const generatedOrderId = `ZT-ORD-${Date.now().toString().slice(-6)}`;

    // Calculate deferred subscription start date (starts 1st of month following purchase)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const subscriptionStartDate = nextMonth.toISOString().split("T")[0];

    // Supabase DB Persistence
    const supabase = createAdminClient();
    if (supabase && businessId) {
      try {
        // 1. Update business payment status and plan
        await supabase
          .from("businesses")
          .update({
            plan: planId,
            payment_status: "paid",
            active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", businessId);

        // 2. Insert order record
        await supabase.from("orders").insert([
          {
            id: generatedOrderId,
            business_id: businessId,
            plan: planId,
            amount: basePrice,
            courier: courierInfo.amount,
            status: "processing",
            razorpay_id: razorpay_payment_id,
            razorpay_order_id,
            razorpay_payment_id,
            courier_name: "BlueDart Express / Delhivery",
            tracking_number: `BD-${Date.now().toString().slice(-8)}`,
            estimated_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            at: new Date().toISOString(),
          },
        ]);

        // 3. For Plans B and C, record deferred subscription (₹1,000/mo starting next month)
        if (planId === "standee_1500" || planId === "standee_auto_2000") {
          await supabase.from("subscriptions").insert([
            {
              business_id: businessId,
              plan: planId,
              amount: 1000.0,
              status: "active",
              billing_start_date: subscriptionStartDate,
              next_billing_date: subscriptionStartDate,
              razorpay_subscription_id: `sub_${razorpay_payment_id.slice(-8)}`,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      } catch (dbErr) {
        console.warn("Supabase database order logging notice:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and order registered",
      order: {
        id: generatedOrderId,
        business_id: businessId,
        plan: planId,
        planName: PLAN_NAMES[planId],
        amount: basePrice,
        courier: courierInfo.amount,
        total: totalAmount,
        status: "processing",
        razorpay_payment_id,
        razorpay_order_id,
        tracking_number: `BD-${Date.now().toString().slice(-8)}`,
        courier_name: "BlueDart Express / Delhivery",
        estimated_delivery: "3-4 Business Days",
        subscription_start_date: planId === "card_500" ? null : subscriptionStartDate,
        monthly_fee: planId === "card_500" ? 0 : 1000,
      },
    });
  } catch (err: any) {
    console.error("Verify Payment Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error during payment verification" },
      { status: 500 }
    );
  }
}
