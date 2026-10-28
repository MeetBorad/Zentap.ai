# ZenTap.ai — Next Steps & Implementation Roadmap

## 1. Immediate Implementation Tasks (Current Phase)
1. **Razorpay Node SDK Installation & Configuration**:
   * Install `razorpay` npm package.
   * Create `src/lib/razorpay.ts` for server-side instance initialization and signature verification helpers.
2. **Server-Side Checkout APIs**:
   * Create `src/app/api/checkout/create-order/route.ts`:
     * Validates plan prices (₹500 / ₹1,500 / ₹2,000) and calculates courier charge by pincode.
     * Calls Razorpay API or provides standard test order response when test keys are enabled.
   * Create `src/app/api/checkout/verify-payment/route.ts`:
     * Verifies payment signature (`razorpay_order_id|razorpay_payment_id` with `RAZORPAY_KEY_SECRET`).
     * Updates database order and business subscription start date.
3. **Interactive Payment Gateway UI**:
   * Build `src/components/modals/RazorpayCheckoutModal.tsx`:
     * Displays clean payment interface (Razorpay Checkout.js or Sandbox Payment Simulator with UPI, QR, and Cards).
     * Prompts the user to actively pay, verify transaction, and transitions to "Your Order is in Process!".
4. **Hallmark Design Review & Audit**:
   * Execute design audit on `/src/app` and core landing view using Hallmark principles.
5. **Production Build & Vercel Deployment**:
   * Run typecheck, build, and deploy to Vercel production.
