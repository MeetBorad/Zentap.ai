import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Signature Verification
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("Razorpay Webhook: Invalid signature detected");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      console.warn("RAZORPAY_WEBHOOK_SECRET not configured in environment. In development/test mode.");
    }

    // 2. Parse event payload
    const body = JSON.parse(rawBody);
    const event = body.event;
    const payload = body.payload;

    const supabase = createAdminClient();

    // 3. Process events
    if (event === "order.paid" || event === "payment.captured") {
      const payment = payload?.payment?.entity;
      const notes = payment?.notes || payload?.order?.entity?.notes || {};
      const businessId = notes.business_id;
      const plan = notes.plan || "standee_1500";
      const amount = payment?.amount ? payment.amount / 100 : 1500;
      const courier = notes.courier ? Number(notes.courier) : 99;

      if (supabase && businessId) {
        // Update business payment status and plan
        await supabase
          .from("businesses")
          .update({
            payment_status: "paid",
            plan: plan,
            active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", businessId);

        // Create order with status 'processing'
        await supabase.from("orders").insert([
          {
            business_id: businessId,
            plan: plan,
            amount: amount,
            courier: courier,
            status: "processing",
            razorpay_id: payment?.id || `rzp_${Date.now()}`,
            razorpay_order_id: payment?.order_id || null,
            razorpay_payment_id: payment?.id || null,
            tracking_number: `ZT-${Math.floor(100000 + Math.random() * 900000)}`,
            courier_name: "BlueDart / Delhivery Priority",
            estimated_delivery: "3-5 business days",
          },
        ]);

        // If plan is subscription-based, schedule subscription record with start_at = 1 month later
        if (plan === "standee_1500" || plan === "standee_auto_2000") {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          await supabase.from("subscriptions").insert([
            {
              business_id: businessId,
              razorpay_subscription_id: payment?.subscription_id || `sub_${Date.now()}`,
              plan: plan,
              monthly_amount: 1000.0,
              status: "active",
              start_at: nextMonth.toISOString(),
            },
          ]);
        }
      }

      return NextResponse.json({ status: "success", event, businessId }, { status: 200 });
    }

    if (
      event === "subscription.cancelled" ||
      event === "subscription.halted" ||
      event === "payment.failed"
    ) {
      const subscription = payload?.subscription?.entity;
      const businessId = subscription?.notes?.business_id;

      if (supabase && businessId) {
        // Deactivate business so /r/:slug shows temporarily unavailable notice
        await supabase
          .from("businesses")
          .update({
            active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", businessId);

        // Update subscription record
        await supabase
          .from("subscriptions")
          .update({
            status: event === "payment.failed" ? "failed" : "cancelled",
          })
          .eq("business_id", businessId);
      }

      return NextResponse.json({ status: "deactivated", event, businessId }, { status: 200 });
    }

    return NextResponse.json({ status: "ignored", event }, { status: 200 });
  } catch (err: any) {
    console.error("Razorpay Webhook Handler Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
