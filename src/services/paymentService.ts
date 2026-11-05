/**
 * ZenTap.ai — Payment Business Logic Service
 *
 * Encapsulates Razorpay verification, ledger calculations,
 * and server-side payment integrity checks.
 */

import crypto from "crypto";
import { env } from "@/lib/config/env";

export interface PaymentVerificationResult {
  verified: boolean;
  orderId: string;
  paymentId: string;
  error?: string;
}

/**
 * Verify Razorpay payment signature cryptographically using HMAC-SHA256.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): PaymentVerificationResult {
  const secret = env.razorpay.keySecret;
  if (!secret) {
    return {
      verified: false,
      orderId,
      paymentId,
      error: "Server configuration error: missing Razorpay secret key.",
    };
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const verified = generatedSignature === signature;
  return {
    verified,
    orderId,
    paymentId,
    error: verified ? undefined : "Invalid cryptographic payment signature.",
  };
}

/**
 * Calculate financial balance for manual ledger entries.
 */
export function calculateLedgerBalance(totalAgreed: number, amountReceived: number): {
  balance: number;
  status: "paid" | "partial" | "pending";
} {
  const agreed = Math.max(0, totalAgreed || 0);
  const received = Math.max(0, amountReceived || 0);
  const balance = Math.max(0, agreed - received);

  let status: "paid" | "partial" | "pending" = "pending";
  if (balance === 0 && agreed > 0) {
    status = "paid";
  } else if (received > 0 && balance > 0) {
    status = "partial";
  }

  return { balance, status };
}
