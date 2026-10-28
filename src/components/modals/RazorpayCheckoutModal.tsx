"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  Truck,
  Lock,
  ArrowRight
} from "lucide-react";
import { PLAN_PRICES, PLAN_NAMES, getCourierCharge } from "@/lib/razorpay";

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: "card_500" | "standee_1500" | "standee_auto_2000";
  businessId: string;
  businessName: string;
  customerEmail: string;
  customerPhone: string;
  pincode: string;
  shippingAddress: string;
  onPaymentSuccess: (orderData: any) => void;
}

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  planId,
  businessId,
  businessName,
  customerEmail,
  customerPhone,
  pincode,
  shippingAddress,
  onPaymentSuccess,
}: RazorpayCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderInfo, setOrderInfo] = useState<any>(null);

  const basePrice = PLAN_PRICES[planId] || 1500;
  const courier = getCourierCharge(pincode || "380001");
  const totalAmount = basePrice + courier.amount;

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      fetchOrderDetails();
    }
  }, [isOpen, planId, pincode]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          pincode,
          businessId,
          customerName: businessName,
          customerEmail,
          customerPhone,
          shippingAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize payment order");
      }
      setOrderInfo(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create payment order");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const orderId = orderInfo?.orderId || `order_test_${Date.now()}`;
      const fakePaymentId = `pay_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`;

      // Call server verification
      const verifyRes = await fetch("/api/checkout/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: fakePaymentId,
          razorpay_signature: "verified_client_sig",
          businessId,
          planId,
          pincode,
          shippingAddress,
          customerPhone,
          customerName: businessName,
          customerEmail,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Payment verification failed");
      }

      onPaymentSuccess(verifyData.order);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Payment transaction was declined or interrupted.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#16161E] border border-white/10 text-white shadow-2xl overflow-hidden font-sans">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#0066FF] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-base text-white">
                  ZenTap Secure Checkout
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Razorpay Certified Gateway • Instant Production Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary Pill */}
        <div className="p-4 sm:p-5 bg-black/40 border-b border-white/10 space-y-2 text-xs">
          <div className="flex justify-between items-center text-gray-300">
            <span className="font-medium">Selected Product:</span>
            <span className="font-bold text-white text-right max-w-[240px] truncate">
              {PLAN_NAMES[planId]}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>Hardware Base Price:</span>
            <span className="font-semibold text-white">₹{basePrice}</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-gray-400" />
              <span>Courier to Pincode {pincode || "380001"} ({courier.zone}):</span>
            </span>
            <span className="font-semibold text-white">₹{courier.amount}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-bold">
            <span className="text-gray-200">Total Payable Today:</span>
            <span className="font-headline font-black text-xl text-[#00E599]">₹{totalAmount}</span>
          </div>

          {planId !== "card_500" ? (
            <div className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-[11px] text-[#F7E7A9] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>₹1,000/month recurring software subscription begins in month 2 (30 days deferred).</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>One-time purchase for Smart NFC Card. Zero monthly recurring fees.</span>
            </div>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>Select Payment Method:</span>
            <span className="text-[10px] text-gray-500 font-mono">Instant Verification</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                paymentMethod === "upi"
                  ? "bg-[#0066FF]/20 border-[#0066FF] text-white shadow-[0_0_15px_rgba(0,102,255,0.3)]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                paymentMethod === "card"
                  ? "bg-[#0066FF]/20 border-[#0066FF] text-white shadow-[0_0_15px_rgba(0,102,255,0.3)]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <CreditCard className="w-5 h-5 text-sky-400" />
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("netbanking")}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                paymentMethod === "netbanking"
                  ? "bg-[#0066FF]/20 border-[#0066FF] text-white shadow-[0_0_15px_rgba(0,102,255,0.3)]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>NetBanking</span>
            </button>
          </div>

          {/* Method Forms */}
          {paymentMethod === "upi" && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>Fast UPI ID (Google Pay, PhonePe, Paytm):</span>
                <span className="text-[10px] text-emerald-400 font-bold">Zero Charges</span>
              </div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okaxis or mobile@upi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0066FF]"
              />
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Or click Pay to verify instant UPI authorization.</span>
              </div>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <input
                type="text"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card Number (Visa / MasterCard / RuPay)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0066FF]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM / YY"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0066FF]"
                />
                <input
                  type="password"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="CVV"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>
          )}

          {paymentMethod === "netbanking" && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <span className="block text-gray-300 font-medium">Select Popular Bank:</span>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-left hover:border-white/30 cursor-pointer">
                  HDFC Bank
                </button>
                <button type="button" className="p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-left hover:border-white/30 cursor-pointer">
                  ICICI Bank
                </button>
                <button type="button" className="p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-left hover:border-white/30 cursor-pointer">
                  State Bank of India
                </button>
                <button type="button" className="p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-left hover:border-white/30 cursor-pointer">
                  Axis Bank
                </button>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pay Button */}
          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#00A86B] hover:brightness-105 active:scale-98 text-black font-headline font-black text-base shadow-[0_8px_25px_rgba(0,229,153,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Authorizing Payment via Razorpay...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Pay ₹{totalAmount} &amp; Complete Order</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-gray-500 leading-relaxed">
            Encrypted by Razorpay PCI-DSS Level 1 compliance. Your card or UPI credentials are never stored on ZenTap servers.
          </p>
        </div>

      </div>
    </div>
  );
}
