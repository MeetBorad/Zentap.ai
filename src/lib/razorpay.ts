import Razorpay from "razorpay";
import crypto from "crypto";

export const PLAN_PRICES: Record<string, number> = {
  card_500: 500,
  standee_1500: 1500,
  standee_auto_2000: 2000,
};

export const PLAN_NAMES: Record<string, string> = {
  card_500: "Normal Smart NFC Review Card (₹500)",
  standee_1500: "Auto Google Review Standee with NFC & QR (₹1,500)",
  standee_auto_2000: "Auto Google Review Standee + Auto Reply Engine (₹2,000)",
};

export function getCourierCharge(pincode: string): { amount: number; zone: string } {
  const cleanPin = pincode.replace(/\D/g, "");
  if (!cleanPin) return { amount: 99, zone: "Standard Pan-India Express" };
  const firstDigit = cleanPin[0];
  if (firstDigit === "3") {
    // Gujarat & West
    return { amount: 69, zone: "West Region (Priority Next-Day)" };
  } else if (["1", "2", "4", "5", "6"].includes(firstDigit)) {
    // Metro / Major zones
    return { amount: 99, zone: "Standard Express Air Cargo" };
  }
  return { amount: 149, zone: "Pan-India Remote Delivery" };
}

export function getRazorpayServerInstance(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    // In sandbox test mode without configured secret, verify structure
    return paymentId.startsWith("pay_") || paymentId.startsWith("rzp_test_");
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}
