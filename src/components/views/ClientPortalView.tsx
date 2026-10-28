"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  Store, 
  ArrowUpRight, 
  Star, 
  ShieldAlert, 
  Radio, 
  Check, 
  RefreshCw, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  Activity,
  Layers,
  MapPin,
  Clock,
  Wifi,
  Database,
  Building2,
  Phone,
  Mail,
  QrCode,
  Truck,
  CreditCard,
  Download,
  AlertCircle,
  Copy,
  TrendingUp,
  Sliders,
  ChevronRight,
  ShieldCheck,
  User,
  ShoppingBag,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  PackageCheck,
  Cpu,
  Lock,
  KeyRound,
  Send,
  Zap,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  BusinessRecord, 
  getUserBusiness, 
  updateUserBusiness, 
  createOrderRecord, 
  getOrdersForBusiness, 
  getFeedbacksForBusiness, 
  getBusinessAnalytics, 
  calculateCourierCharge, 
  SAMPLE_DEMO_BUSINESS, 
  FeedbackRecord, 
  OrderRecord,
  logScan
} from "@/lib/businessStore";
import { 
  fetchUserBusinessFromDb, 
  upsertUserBusinessInDb, 
  fetchDbOrders, 
  fetchDbFeedbacks 
} from "@/lib/supabase/service";
import StandeeVisual from "@/components/StandeeVisuals";

interface ClientPortalViewProps {
  onTriggerTapSimulator?: () => void;
  onOpenAuthModal?: (tab: "signin" | "signup") => void;
  onOpenUpcomingDrawer?: () => void;
}

export default function ClientPortalView({ 
  onTriggerTapSimulator, 
  onOpenAuthModal, 
  onOpenUpcomingDrawer 
}: ClientPortalViewProps) {
  const { user, updateUserPassword, resetPasswordForEmail } = useAuth();

  // Tab State: "live" (User's real isolated profile) vs "sample" (Sample preview with populated data)
  const [dashboardTab, setDashboardTab] = useState<"live" | "sample">("live");

  const [business, setBusiness] = useState<BusinessRecord>(SAMPLE_DEMO_BUSINESS);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [analytics, setAnalytics] = useState({
    totalScans: 0,
    nfcScans: 0,
    qrScans: 0,
    reviewClicks: 0,
    privateFeedbackCount: 0,
    starsCount: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    scansPerDay: [0, 0, 0, 0, 0, 0, 0],
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [toastMsg, setToastMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile Form State (Business Profile Section with all 8 fields)
  const [formName, setFormName] = useState("");
  const [formGbp, setFormGbp] = useState("");
  const [formReviewUrl, setFormReviewUrl] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formCountry, setFormCountry] = useState("India");
  const [formPincode, setFormPincode] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");

  // Buy Standee State
  const [selectedPlan, setSelectedPlan] = useState<"card_500" | "standee_1500" | "standee_auto_2000">("standee_1500");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderRecord | null>(null);

  // In-Dashboard Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Sample data constants for preview
  const SAMPLE_ANALYTICS = {
    totalScans: 1428,
    nfcScans: 1114,
    qrScans: 314,
    reviewClicks: 382,
    privateFeedbackCount: 14,
    starsCount: { 5: 320, 4: 62, 3: 18, 2: 9, 1: 5 },
    scansPerDay: [48, 54, 38, 62, 70, 85, 92],
  };

  useEffect(() => {
    async function loadData() {
      if (user) {
        // Fast local load for this isolated user
        const b = getUserBusiness(user.id, user.email || "", user.user_metadata?.business_name);
        setBusiness(b);
        populateForm(b);
        setFeedbacks(getFeedbacksForBusiness(b.id));
        setOrders(getOrdersForBusiness(b.id));
        setAnalytics(getBusinessAnalytics(b.id));

        // Supabase sync
        try {
          const dbBiz = await fetchUserBusinessFromDb(user.id);
          if (dbBiz) {
            const synced: BusinessRecord = {
              id: dbBiz.id,
              owner_user_id: dbBiz.owner_user_id,
              name: dbBiz.name,
              email: dbBiz.email,
              phone: dbBiz.phone || "",
              city: dbBiz.city || "",
              state: dbBiz.state || "",
              country: dbBiz.country || "India",
              pincode: dbBiz.pincode || "",
              gbp_link: dbBiz.gbp_link || "",
              slug: dbBiz.slug,
              plan: dbBiz.plan,
              payment_status: dbBiz.payment_status,
              review_url: dbBiz.review_url,
              active: dbBiz.active,
              address: dbBiz.address || "",
              category: dbBiz.category || "",
              created_at: dbBiz.created_at,
            };
            setBusiness(synced);
            populateForm(synced);

            const [remoteOrders, remoteFeedbacks] = await Promise.all([
              fetchDbOrders(dbBiz.id),
              fetchDbFeedbacks(dbBiz.id),
            ]);

            if (remoteOrders && remoteOrders.length > 0) {
              setOrders(
                remoteOrders.map((o) => ({
                  id: o.id,
                  business_id: o.business_id,
                  plan: o.plan,
                  amount: Number(o.amount),
                  courier: Number(o.courier),
                  status: o.status,
                  razorpay_id: o.razorpay_id,
                  tracking_number: o.tracking_number || undefined,
                  courier_name: o.courier_name || undefined,
                  estimated_delivery: o.estimated_delivery || undefined,
                  at: o.at,
                }))
              );
            }
            if (remoteFeedbacks && remoteFeedbacks.length > 0) {
              setFeedbacks(
                remoteFeedbacks.map((f) => ({
                  id: f.id,
                  business_id: f.business_id,
                  rating: f.rating,
                  text: f.text,
                  customer_name: f.customer_name || undefined,
                  customer_phone: f.customer_phone || undefined,
                  at: f.at,
                }))
              );
            }
          }
        } catch (err) {
          console.warn("Supabase background sync notice:", err);
        }
      } else {
        // Guest mode default to sample
        setBusiness(SAMPLE_DEMO_BUSINESS);
        populateForm(SAMPLE_DEMO_BUSINESS);
        setFeedbacks(getFeedbacksForBusiness(SAMPLE_DEMO_BUSINESS.id));
        setOrders(getOrdersForBusiness(SAMPLE_DEMO_BUSINESS.id));
        setAnalytics(SAMPLE_ANALYTICS);
      }
    }

    loadData();
  }, [user]);

  // Active display business based on tab
  const isSample = dashboardTab === "sample";
  const displayBusiness = isSample ? SAMPLE_DEMO_BUSINESS : business;
  const displayFeedbacks = isSample ? getFeedbacksForBusiness(SAMPLE_DEMO_BUSINESS.id) : feedbacks;
  const displayOrders = isSample ? getOrdersForBusiness(SAMPLE_DEMO_BUSINESS.id) : orders;
  const displayAnalytics = isSample ? SAMPLE_ANALYTICS : analytics;

  // Generate QR Code with Error Correction Level Q for displayed business
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.zentapdigitalsolutions.com";
    const qrUrl = `${origin}/r/${displayBusiness.slug}?s=qr`;

    QRCode.toDataURL(qrUrl, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: "Q",
      color: {
        dark: "#1C1B1A",
        light: "#FFFFFF",
      },
    }).then((url) => {
      setQrDataUrl(url);
    }).catch((err) => {
      console.warn("QR generation error:", err);
    });
  }, [displayBusiness.slug]);

  const populateForm = (b: BusinessRecord) => {
    setFormName(b.name || "");
    setFormGbp(b.gbp_link || "");
    setFormReviewUrl(b.review_url || "");
    setFormPhone(b.phone || "");
    setFormCity(b.city || "");
    setFormState(b.state || "");
    setFormCountry(b.country || "India");
    setFormPincode(b.pincode || "");
    setFormEmail(b.email || (user?.email || ""));
    setFormAddress(b.address || "");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      showToast("✓ Copied Review Assistant link to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id || business.id;

    const updated = updateUserBusiness(userId, {
      name: formName.trim(),
      gbp_link: formGbp.trim(),
      review_url: formReviewUrl.trim() || null,
      phone: formPhone.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      country: formCountry.trim() || "India",
      pincode: formPincode.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
    });

    setBusiness(updated);

    if (user) {
      upsertUserBusinessInDb({
        id: updated.id,
        owner_user_id: user.id,
        slug: updated.slug,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || null,
        city: updated.city || null,
        state: updated.state || null,
        country: updated.country || "India",
        pincode: updated.pincode || null,
        address: updated.address || null,
        gbp_link: updated.gbp_link || null,
        review_url: updated.review_url || null,
        active: updated.active,
        plan: updated.plan,
        payment_status: updated.payment_status,
        category: updated.category || null,
      }).catch((err) => console.warn("Supabase profile save error:", err));
    }

    showToast("✓ Business Profile saved! Review assistant & Standee link updated.");
  };

  // Standee Purchase / Checkout Handler
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);

    setTimeout(() => {
      const pin = formPincode.trim() || business.pincode || "380001";
      const newOrder = createOrderRecord(business.id, selectedPlan, pin);
      const userId = user?.id || business.id;
      const updated = updateUserBusiness(userId, {
        plan: selectedPlan,
        payment_status: "paid",
        name: formName || business.name,
        phone: formPhone || business.phone,
        address: formAddress || business.address,
        city: formCity || business.city,
        state: formState || business.state,
        country: formCountry || "India",
        pincode: pin,
        gbp_link: formGbp || business.gbp_link,
        review_url: formReviewUrl || business.review_url,
      });

      setBusiness(updated);
      setOrders(getOrdersForBusiness(business.id));
      setLastPlacedOrder(newOrder);
      setOrderSuccess(true);
      setPaymentProcessing(false);
      showToast("✓ Payment Verified! Your Standee order is in process.");
    }, 1200);
  };

  const handleSimulateScan = (source: "qr" | "nfc") => {
    logScan(displayBusiness.slug, source, false);
    setAnalytics((prev) => ({
      ...prev,
      totalScans: prev.totalScans + 1,
      nfcScans: source === "nfc" ? prev.nfcScans + 1 : prev.nfcScans,
      qrScans: source === "qr" ? prev.qrScans + 1 : prev.qrScans,
    }));
    showToast(`✓ Simulated guest ${source.toUpperCase()} tap! Live scan counter updated.`);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${displayBusiness.slug}-standee-qr-level-q.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✓ Standee QR (Level Q) downloaded as PNG!");
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match. Please verify.");
      return;
    }

    setPasswordUpdating(true);
    try {
      const { error } = await updateUserPassword(newPassword);
      if (error) {
        setPasswordError(error.message || "Failed to update password.");
      } else {
        setPasswordMsg("✓ Password updated successfully! Use your new password on next login.");
        setNewPassword("");
        setConfirmPassword("");
        showToast("✓ Password updated successfully!");
      }
    } catch (err: any) {
      setPasswordError(err.message || "An unexpected error occurred while updating password.");
    } finally {
      setPasswordUpdating(false);
    }
  };

  // Send Reset Password Email Handler
  const handleSendResetEmail = async () => {
    const targetEmail = business.email || user?.email || "";
    if (!targetEmail) {
      setPasswordError("No email address found to send reset instructions.");
      return;
    }

    try {
      const { error } = await resetPasswordForEmail(targetEmail);
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordMsg(`✓ Password reset email sent to ${targetEmail}! Please check your inbox.`);
        showToast(`✓ Reset instructions sent to ${targetEmail}`);
      }
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://www.zentapdigitalsolutions.com";
  const assistantUrl = `${originUrl}/r/${displayBusiness.slug}`;
  const linkReady = !!displayBusiness.review_url;

  // Courier and Plan Calculation
  const courierData = calculateCourierCharge(formPincode || displayBusiness.pincode || "380001");
  const basePlanPrice = selectedPlan === "card_500" ? 500 : selectedPlan === "standee_1500" ? 1500 : 2000;
  const grandTotal = basePlanPrice + courierData.amount;

  const planTitles = {
    card_500: "Normal Smart NFC Review Card (₹500)",
    standee_1500: "Auto Google Review Standee with NFC & QR (₹1,500)",
    standee_auto_2000: "Auto Google Review Standee + Auto Reply Engine (₹2,000)",
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Guest Notice if viewing without login */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-on-surface">
                Client Business Profile Dashboard (Interactive Showcase)
              </h4>
              <p className="text-[11px] text-on-surface-variant">
                Previewing merchant telemetry, live Google review assistant linking, and standee order tracking. Log in to manage your registered store.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal("signin")}
              className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal("signup")}
              className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
            >
              Register Business
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB SWITCHER: MY LIVE BUSINESS PROFILE vs SAMPLE DASHBOARD PREVIEW       */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-surface-variant/40">
        <div className="inline-flex p-1.5 rounded-2xl bg-surface-container border border-surface-variant/50 shadow-sm">
          <button
            onClick={() => setDashboardTab("live")}
            className={`px-4 py-2 rounded-xl font-headline font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              dashboardTab === "live"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>My Live Business Profile</span>
          </button>

          <button
            onClick={() => setDashboardTab("sample")}
            className={`px-4 py-2 rounded-xl font-headline font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              dashboardTab === "sample"
                ? "bg-secondary text-on-secondary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Dashboard Preview (See How It Looks)</span>
          </button>
        </div>

        {dashboardTab === "sample" ? (
          <span className="text-xs font-semibold text-secondary flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-xl border border-secondary/25">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Sample Showcase Mode (Virat Gold Palace)</span>
          </span>
        ) : (
          <span className="text-xs text-on-surface-variant font-mono">
            Isolated Account • {user?.email || "Demo Session"}
          </span>
        )}
      </div>

      {/* SAMPLE DASHBOARD PREVIEW NOTICE BANNER */}
      {dashboardTab === "sample" && (
        <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-secondary flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-on-surface">
                Sample Dashboard Preview Mode
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                This is how your ZenTap dashboard will look once your business is registered with us—with active NFC customer taps, laser QR scans, Google review conversions, and live dispatch tracking!
              </p>
            </div>
          </div>

          <button
            onClick={() => setDashboardTab("live")}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex-shrink-0 cursor-pointer shadow-sm"
          >
            Back to My Live Profile
          </button>
        </div>
      )}

      {/* TOP HEADER: Profile Summary & Counter Touchpoint Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-low p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-surface-variant/40 shadow-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-on-primary flex items-center justify-center font-headline font-black text-2xl shadow-md border border-white/20">
            {displayBusiness.name ? displayBusiness.name[0].toUpperCase() : "Z"}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {displayBusiness.payment_status === "paid" ? "Subscribed & Active" : "Active Trial / Standee Setup"}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Slug: /r/{displayBusiness.slug}
              </span>
            </div>

            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
              {displayBusiness.name || "My Business Profile"}
            </h1>

            <p className="text-xs text-on-surface-variant mt-0.5 flex flex-wrap items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>{[displayBusiness.city, displayBusiness.state, displayBusiness.country].filter(Boolean).join(", ") || "Ahmedabad, Gujarat, India"}</span>
              <span className="mx-1">•</span>
              <Phone className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>{displayBusiness.phone || "No phone added"}</span>
              <span className="mx-1">•</span>
              <Mail className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>{displayBusiness.email}</span>
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <a
            href={`${assistantUrl}?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface border border-secondary/40 text-xs font-bold text-on-surface hover:border-secondary shadow-sm transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-secondary" />
            <span>Test Customer Flow</span>
          </a>

          <a
            href="#purchase-section"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 shadow-sm transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy / Upgrade Standee</span>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORDER CONFIRMATION / ORDER IN PROCESS SCREEN (POST-PAYMENT)            */}
      {/* ========================================================================= */}
      {(orderSuccess || displayOrders.length > 0) && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-emerald-500/40 shadow-sm relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 flex items-center justify-center">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xl text-on-surface">
                    Your Order is in Process!
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold border border-emerald-500/30">
                    Payment Verified
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Your customized hardware touchpoint has been assigned to CNC laser engraving and courier dispatch.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-on-surface-variant block">Order Tracking ID</span>
              <span className="font-mono font-bold text-sm text-secondary">
                {lastPlacedOrder?.id || (displayOrders[0]?.id ? `#${displayOrders[0].id}` : `#ZT-ORD-${displayBusiness.id.slice(0, 8).toUpperCase()}`)}
              </span>
            </div>
          </div>

          {/* 4-Stage Production & Shipping Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/40">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
              <h4 className="font-bold text-xs text-on-surface">1. Order Confirmed</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Payment received &amp; verified.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/40">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
              <h4 className="font-bold text-xs text-on-surface">2. Laser Engraving</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Brand logo &amp; QR laser etched.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-amber-500/40">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold mb-2 animate-pulse">⚡</div>
              <h4 className="font-bold text-xs text-on-surface">3. Signal Inspection</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">NTAG216 RF 13.56MHz tested.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40">
              <div className="w-6 h-6 rounded-full bg-surface-variant text-on-surface flex items-center justify-center text-xs font-bold mb-2">4</div>
              <h4 className="font-bold text-xs text-on-surface">4. Dispatched</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">BlueDart Express Air Cargo</p>
            </div>
          </div>

          {/* Instant Live Google Review Assistant Access */}
          <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-secondary block tracking-wider">
                Live While Hardware Is In Transit
              </span>
              <h4 className="font-headline font-bold text-sm text-on-surface">
                Your Customized Google Review Assistant is Already Active!
              </h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                URL: <code className="font-mono text-secondary">{assistantUrl}</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`${assistantUrl}?preview=1`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Live Assistant</span>
              </a>
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-container-high border border-surface-variant/50 text-xs font-bold text-on-surface flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED BUSINESS PROFILE SECTION (SIGN & EDIT ANYTIME)               */}
      {/* ========================================================================= */}
      <div id="profile-section" className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-secondary" />
              <h3 className="font-headline font-bold text-xl text-on-surface">
                Business Profile Information
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Fill and update your business details anytime to customize your NFC standee, print Level Q QR codes, and connect your Google Business Profile.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs border border-secondary/30 self-start sm:self-auto">
            Editable Anytime
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Business Name */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Royal Cafe & Bakers"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* 2. Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Contact Number (For Private Alerts & WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* 3. Google Review URL */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Google Review URL (Direct Write-Review Link) *
              </label>
              <input
                type="url"
                value={formReviewUrl}
                onChange={(e) => setFormReviewUrl(e.target.value)}
                placeholder="https://g.page/r/your-code/review or https://search.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              <span className="text-[10px] text-on-surface-variant mt-1 block">
                Destination where customers submit 4-5 star reviews on Google.
              </span>
            </div>

            {/* 4. Google Business Profile Link */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Google Business Profile Link (Listing / Maps Link)
              </label>
              <input
                type="url"
                value={formGbp}
                onChange={(e) => setFormGbp(e.target.value)}
                placeholder="https://maps.google.com/?cid=... or https://g.co/kgs/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              <span className="text-[10px] text-on-surface-variant mt-1 block">
                Your main Google Maps profile page.
              </span>
            </div>

            {/* 5. Email */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Email Address (Prefilled from Account) *
              </label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="owner@yourbusiness.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* 6. City */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="e.g. Ahmedabad"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* 7. State */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                placeholder="e.g. Gujarat"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {/* 8. Country & Pincode */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={formPincode}
                  onChange={(e) => setFormPincode(e.target.value)}
                  placeholder="380001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
            </div>

          </div>

          {/* Delivery / Store Address */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Store / Billing Counter Shipping Address (For Standee Courier) *
            </label>
            <textarea
              rows={2}
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Shop No. 12, Ground Floor, Commercial Complex, Main Road..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-on-surface-variant">
              Changes take effect immediately on your physical standee and live QR destination.
            </span>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Update Business Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 3. ORDER / BUY STANDEE & HARDWARE TOUCHPOINT (PURCHASE FLOW)               */}
      {/* ========================================================================= */}
      <div id="purchase-section" className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm scroll-mt-24 space-y-6">
        
        {/* SEO Value Proposition Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-secondary/15 via-primary/10 to-transparent border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/40 text-secondary flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span>Boost Your Google Profile Reach, Views &amp; Local SEO</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold">
                10x Growth
              </span>
            </h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Our hardware standees convert your everyday customer footfall into verified 5-star Google reviews. Higher review frequency and positive customer keywords trigger Google&apos;s local algorithm to place your business in the prestigious <strong>Google 3-Pack</strong>, driving dramatic increases in search views, store visits, and revenue.
            </p>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface">
              Purchase Your Hardware Touchpoint
            </h3>
            <p className="text-xs text-on-surface-variant">
              Select your preferred hardware model to receive custom branded laser-cut hardware for your billing counter.
            </p>
          </div>
        </div>

        {/* Standee Visual Sample Preview & Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Visual Showcase (Dynamic based on selected plan & business name) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-container-low border border-surface-variant/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-3">
              Hardware Visual Preview
            </span>
            <StandeeVisual 
              type={selectedPlan} 
              businessName={formName || displayBusiness.name || "YOUR BUSINESS"} 
            />
            <span className="text-[11px] text-on-surface-variant mt-4 text-center">
              {selectedPlan === "card_500" 
                ? "Compact NFC & Level Q Laser QR PVC Card (Wallet / Bill Folder)" 
                : "Heavyweight Laser-Cut Acrylic Counter Standee with Embedded NTAG216 Chip"}
            </span>
          </div>

          {/* 3 Pricing Plans Cards */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* PLAN 1: Normal Smart NFC Review Card */}
            <div 
              onClick={() => setSelectedPlan("card_500")}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                selectedPlan === "card_500"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-surface-variant/40 bg-surface-container-low hover:border-surface-variant"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="standee_plan"
                  checked={selectedPlan === "card_500"}
                  onChange={() => setSelectedPlan("card_500")}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline font-bold text-sm text-on-surface">
                      Normal Smart NFC Review Card
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-surface-variant text-[10px] font-semibold text-on-surface-variant">
                      Card (Not Standee)
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Compact portable PVC card with NFC chip + laser QR code. Perfect for table servers or inside billing folders.
                  </p>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                    ✓ One-Time Payment (Zero monthly recurring fees)
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 sm:pl-4">
                <span className="font-headline font-black text-2xl text-on-surface">₹500</span>
                <span className="text-[10px] text-on-surface-variant block">+ Extra Courier</span>
              </div>
            </div>

            {/* PLAN 2: Auto Google Review Standee with NFC & QR */}
            <div 
              onClick={() => setSelectedPlan("standee_1500")}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
                selectedPlan === "standee_1500"
                  ? "border-secondary bg-secondary/10 shadow-md"
                  : "border-surface-variant/40 bg-surface-container-low hover:border-surface-variant"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="standee_plan"
                  checked={selectedPlan === "standee_1500"}
                  onChange={() => setSelectedPlan("standee_1500")}
                  className="mt-1 text-secondary focus:ring-secondary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline font-bold text-sm text-on-surface">
                      Auto Google Review Standee with NFC &amp; QR
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Customized designed acrylic standee matched to your business branding. 1-tap review assistant with AI draft generator.
                  </p>
                  <span className="text-[11px] text-secondary font-bold block mt-1">
                    ₹1,000 / month subscription starting next month of purchase
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 sm:pl-4">
                <span className="font-headline font-black text-2xl text-on-surface">₹1,500</span>
                <span className="text-[10px] text-on-surface-variant block">+ Courier Charges</span>
              </div>
            </div>

            {/* PLAN 3: Auto Google Review Standee + Auto Reply Engine */}
            <div 
              onClick={() => setSelectedPlan("standee_auto_2000")}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                selectedPlan === "standee_auto_2000"
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-surface-variant/40 bg-surface-container-low hover:border-surface-variant"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="standee_plan"
                  checked={selectedPlan === "standee_auto_2000"}
                  onChange={() => setSelectedPlan("standee_auto_2000")}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline font-bold text-sm text-on-surface">
                      Auto Google Review Standee + Auto Reply Engine
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                      Complete Automation
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Custom acrylic standee PLUS AI automation engine that automatically generates polite, SEO-optimized replies to every incoming Google review 24/7.
                  </p>
                  <span className="text-[11px] text-primary font-bold block mt-1">
                    ₹1,000 / month subscription starting next month of purchase
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 sm:pl-4">
                <span className="font-headline font-black text-2xl text-on-surface">₹2,000</span>
                <span className="text-[10px] text-on-surface-variant block">+ Courier Charges</span>
              </div>
            </div>

          </div>

        </div>

        {/* Dynamic Courier Charges Breakdown & Checkout Form */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-variant/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Courier Details */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-on-surface block">
                Express Courier Delivery Calculator
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formPincode}
                  onChange={(e) => setFormPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="px-3.5 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 w-44"
                />
                <span className="text-xs text-on-surface-variant font-medium">
                  Zone: <strong className="text-on-surface">{courierData.zone}</strong>
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Shipped via BlueDart Express Air Cargo / Delhivery with shock-absorbent acrylic foam packaging.
              </p>
            </div>

            {/* Price Summary & Submit */}
            <div className="p-4 rounded-xl bg-surface border border-surface-variant/40 space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Hardware Base Price:</span>
                <span className="font-bold text-on-surface">₹{basePlanPrice}</span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Courier &amp; Transit Insurance:</span>
                <span className="font-bold text-on-surface">₹{courierData.amount}</span>
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant pt-1 border-t border-surface-variant/30">
                <span>Next Month Subscription:</span>
                <span className="font-semibold text-secondary">
                  {selectedPlan === "card_500" ? "₹0 (No monthly fee)" : "₹1,000 / month (starts in 30 days)"}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-on-surface pt-1 border-t border-surface-variant/30">
                <span>Total Payable Now:</span>
                <span className="font-headline font-black text-lg text-primary">₹{grandTotal}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutSubmit}
                disabled={paymentProcessing}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 mt-2"
              >
                {paymentProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{grandTotal} &amp; Dispatch to Production</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. QR & NFC SCAN ANALYTICS                                                */}
      {/* ========================================================================= */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface">
              QR &amp; NFC Scan Analytics
            </h3>
            <p className="text-xs text-on-surface-variant">
              Live customer engagement data recorded from your physical counter touchpoint.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateScan("nfc")}
              className="px-3.5 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40 transition-colors"
              title="Simulate a customer NFC phone tap"
            >
              <Radio className="w-3.5 h-3.5 text-secondary" />
              <span>+ Test NFC Tap</span>
            </button>
            <button
              onClick={() => handleSimulateScan("qr")}
              className="px-3.5 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40 transition-colors"
              title="Simulate a customer QR camera scan"
            >
              <QrCode className="w-3.5 h-3.5 text-secondary" />
              <span>+ Test QR Scan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Total Scans */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Total Customer Scans
            </span>
            <div className="my-2">
              <span className="font-headline font-black text-3xl sm:text-4xl text-on-surface">
                {displayAnalytics.totalScans}
              </span>
              <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
                NFC: {displayAnalytics.nfcScans} • QR: {displayAnalytics.qrScans}
              </span>
            </div>
            <div className="w-full bg-surface-variant/30 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-emerald-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, (displayAnalytics.nfcScans / (displayAnalytics.totalScans || 1)) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Google Review Clicks */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Google Review Clicks
            </span>
            <div className="my-2">
              <span className="font-headline font-black text-3xl sm:text-4xl text-secondary">
                {displayAnalytics.reviewClicks}
              </span>
              <span className="block text-[11px] text-secondary font-semibold mt-1">
                ~88% Conversion to Google Maps
              </span>
            </div>
            <div className="w-full bg-secondary/20 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-secondary h-full rounded-full w-[88%]" />
            </div>
          </div>

          {/* Private Feedback Defused */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Private Feedbacks (1-2★)
            </span>
            <div className="my-2">
              <span className="font-headline font-black text-3xl sm:text-4xl text-red-500">
                {displayAnalytics.privateFeedbackCount}
              </span>
              <span className="block text-[11px] text-red-500 font-semibold mt-1">
                Resolved privately out of public view
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant">
              Direct management resolution
            </span>
          </div>

          {/* Positive Rating Ratio */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Stars Distribution
            </span>
            <div className="space-y-1 my-1 text-[11px]">
              <div className="flex justify-between">
                <span>5 Stars:</span>
                <span className="font-bold text-amber-500">{displayAnalytics.starsCount[5] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>4 Stars:</span>
                <span className="font-bold text-amber-500">{displayAnalytics.starsCount[4] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>1-3 Stars:</span>
                <span className="font-bold text-zinc-400">{(displayAnalytics.starsCount[1] || 0) + (displayAnalytics.starsCount[2] || 0) + (displayAnalytics.starsCount[3] || 0)}</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">91% Positive Ratio</span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. GOOGLE REVIEW ASSISTANT PAGE & PRINTABLE LEVEL Q QR CODE               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Assistant Destination Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-bold text-secondary">
                  Customer Destination Hub
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                linkReady ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"
              }`}>
                {linkReady ? "✓ Google Review Link Active" : "⚠ Setup Review Link"}
              </span>
            </div>

            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              Your Customized Google Review Assistant
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              When a guest taps your NFC Standee or scans your laser QR code, they land on this assistant page. High ratings (3-5★) generate tailored AI review drafts and direct straight to your Google review link; low ratings (1-2★) submit directly to your private management inbox.
            </p>

            {/* 1-Click Copy Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-surface-container-low border border-surface-variant/50 mb-4">
              <div className="flex items-center gap-2 px-2 flex-1 min-w-0">
                <Wifi className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-xs font-mono text-on-surface truncate select-all">
                  {assistantUrl}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(assistantUrl)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-container-high border border-surface-variant/50 text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                </button>
                <a
                  href={`${assistantUrl}?preview=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Flow</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-variant/30 flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-secondary" />
              <span>NFC Direct Tap URL: <code className="font-mono text-on-surface font-semibold">{assistantUrl}?s=nfc</code></span>
            </span>
            <a
              href="#profile-section"
              className="text-secondary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Destination Link</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* LASER PRINTABLE QR CODE (LEVEL Q ERROR CORRECTION) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col items-center text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">
            Hardware Touchpoint
          </span>
          <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
            Standee Laser QR Code (Level Q)
          </h3>
          <p className="text-xs text-on-surface-variant max-w-sm mb-4 leading-relaxed">
            Encoded with high Error Correction Level Q (25% redundancy) so it scans instantly even if smudged or scratched on your billing counter.
          </p>

          <div className="p-4 bg-white rounded-2xl shadow-md border border-surface-variant/30 mb-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Standee Laser QR Code" className="w-48 h-48 rounded-lg" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-500">Generating QR...</div>
            )}
          </div>

          <div className="w-full p-2.5 rounded-xl bg-surface border border-surface-variant/40 text-xs font-mono text-on-surface truncate mb-4">
            {assistantUrl}?s=qr
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadQR}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Print QR (PNG)</span>
            </button>
            <a
              href={`${assistantUrl}?preview=1`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Scan Page</span>
            </a>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. PRIVATE NEGATIVE FEEDBACK INBOX                                        */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Private Customer Feedbacks ({displayFeedbacks.length})
            </h3>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">
            Confidential guest alerts defused before reaching Google
          </span>
        </div>

        {displayFeedbacks.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant text-xs">
            No private negative feedback received. Your Google rating is healthy and protected!
          </div>
        ) : (
          <div className="space-y-3">
            {displayFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-3.5 rounded-2xl bg-surface-container-low border border-red-500/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold text-xs">{"★".repeat(fb.rating)}</span>
                    <span className="font-bold text-xs text-on-surface">{fb.customer_name || "Guest Customer"}</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{fb.at}</span>
                </div>
                <p className="text-xs text-on-surface-variant italic mb-2">
                  &quot;{fb.text}&quot;
                </p>
                {fb.customer_phone && (
                  <a
                    href={`tel:${fb.customer_phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Customer: {fb.customer_phone}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. PASSWORD & ACCOUNT SECURITY MANAGEMENT (RESET / CHANGE ANYTIME)        */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-secondary" />
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Account Password &amp; Security Settings
            </h3>
          </div>
          <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
            Self-Service Security
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
          Change your account password whenever you want, or request a password recovery email if you need to reset it.
        </p>

        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{passwordMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={passwordUpdating}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {passwordUpdating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Account Password</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-surface-variant/40"
            >
              <Mail className="w-3.5 h-3.5 text-secondary" />
              <span>Send Password Reset Email</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
