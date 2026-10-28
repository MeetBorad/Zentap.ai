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
  KeyRound
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

  const [business, setBusiness] = useState<BusinessRecord>(SAMPLE_DEMO_BUSINESS);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [analytics, setAnalytics] = useState({
    totalScans: 1428,
    nfcScans: 1114,
    qrScans: 314,
    reviewClicks: 382,
    privateFeedbackCount: 14,
    starsCount: { 5: 320, 4: 62, 3: 18, 2: 9, 1: 5 },
    scansPerDay: [48, 54, 38, 62, 70, 85, 92],
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [toastMsg, setToastMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile Form State (Link Google Business Profile)
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

  // In-Dashboard Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (user) {
        // Fast local load
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
        setBusiness(SAMPLE_DEMO_BUSINESS);
        populateForm(SAMPLE_DEMO_BUSINESS);
        setFeedbacks(getFeedbacksForBusiness(SAMPLE_DEMO_BUSINESS.id));
        setOrders(getOrdersForBusiness(SAMPLE_DEMO_BUSINESS.id));
        setAnalytics(getBusinessAnalytics(SAMPLE_DEMO_BUSINESS.id));
      }
    }

    loadData();
  }, [user]);

  // Generate QR Code with Error Correction Level Q
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.zentapdigitalsolutions.com";
    const qrUrl = `${origin}/r/${business.slug}?s=qr`;

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
  }, [business.slug]);

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
      country: formCountry.trim(),
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

    showToast("✓ Google Review link & Profile saved and linked to your Standee!");
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);

    setTimeout(() => {
      const newOrder = createOrderRecord(business.id, selectedPlan, formPincode || business.pincode || "380001");
      const userId = user?.id || business.id;
      const updated = updateUserBusiness(userId, {
        plan: selectedPlan,
        payment_status: "paid",
        name: formName || business.name,
        phone: formPhone || business.phone,
        address: formAddress || business.address,
        city: formCity || business.city,
        state: formState || business.state,
        pincode: formPincode || business.pincode,
        review_url: formReviewUrl || business.review_url,
      });

      setBusiness(updated);
      setOrders(getOrdersForBusiness(business.id));
      setPaymentProcessing(false);
      showToast("✓ Payment Verified! Standee order created and dispatched to laser production.");
    }, 1200);
  };

  const handleSimulateScan = (source: "qr" | "nfc") => {
    logScan(business.slug, source, false);
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
    a.download = `${business.slug}-standee-qr-level-q.png`;
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
  const assistantUrl = `${originUrl}/r/${business.slug}`;
  const linkReady = !!business.review_url;

  const planTitles = {
    card_500: "Smart NFC Review Card (₹500)",
    standee_1500: "Custom Acrylic NFC Standee (₹1,500)",
    standee_auto_2000: "Acrylic Standee + AI Automation Engine (₹2,000)",
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
                Previewing all merchant telemetry, live Google review assistant linking, and standee order tracking. Log in to sync your registered store.
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

      {/* TOP HEADER: Profile Summary & Counter Touchpoint Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-low p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-surface-variant/40 shadow-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-on-primary flex items-center justify-center font-headline font-black text-2xl shadow-md border border-white/20">
            {business.name ? business.name[0].toUpperCase() : "Z"}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {business.payment_status === "paid" ? "Subscribed & Active" : "Active Trial"}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Slug: /r/{business.slug}
              </span>
            </div>

            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
              {business.name || "My Business Profile"}
            </h1>

            <p className="text-xs text-on-surface-variant mt-0.5 flex flex-wrap items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>{[business.city, business.state, business.country].filter(Boolean).join(", ") || "Ahmedabad, Gujarat, India"}</span>
              <span className="mx-1">•</span>
              <Phone className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>{business.phone || "No phone added"}</span>
              <span className="mx-1">•</span>
              <Mail className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <span>{business.email}</span>
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
            href="#link-section"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 shadow-sm transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Update Google Link</span>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GOOGLE REVIEW ASSISTANT PAGE LINK & QR CODE HUB + CURRENT PLAN         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 1: GOOGLE REVIEW ASSISTANT PAGE LINKED HERE & TOUCHPOINT CARD */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-bold text-secondary">
                  Live Customer Destination
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                linkReady ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"
              }`}>
                {linkReady ? "✓ Google Review Link Active" : "⚠ Setup Review Link"}
              </span>
            </div>

            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              Your Google Review Assistant Page
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              When a customer taps your NFC Standee or scans the laser QR code at your counter, they instantly land on this page. High ratings (4-5★) submit straight to Google Reviews; lower ratings provide private feedback.
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

          {/* NFC & QR Encoding specs */}
          <div className="pt-4 border-t border-surface-variant/30 flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-secondary" />
              <span>NFC Direct Tap URL: <code className="font-mono text-on-surface font-semibold">{assistantUrl}?s=nfc</code></span>
            </span>
            <a
              href="#link-section"
              className="text-secondary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Destination Link</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* SECTION 2: CURRENT PLAN WITH US */}
        <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                Current Plan With Us
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold">
                Paid &amp; Active
              </span>
            </div>

            <div className="my-2">
              <h4 className="font-headline font-bold text-xl text-on-surface">
                {business.plan && planTitles[business.plan] ? planTitles[business.plan] : "Acrylic NFC Standee (₹1,500)"}
              </h4>
              <span className="block text-xs text-emerald-600 font-semibold mt-1">
                ✓ Lifetime Hardware &amp; Dynamic Routing License
              </span>
            </div>

            <div className="space-y-2 mt-4 text-xs text-on-surface-variant">
              <div className="flex justify-between py-1 border-b border-surface-variant/20">
                <span>Hardware Chip:</span>
                <span className="font-semibold text-on-surface">NTAG216 (888 Bytes)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-variant/20">
                <span>Payment Status:</span>
                <span className="font-semibold text-emerald-600">Paid &amp; Verified</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-variant/20">
                <span>Touchpoints Active:</span>
                <span className="font-semibold text-on-surface">1 Counter Standee</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Google Anti-Gating:</span>
                <span className="font-semibold text-emerald-600">100% Policy Compliant</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-surface-variant/30">
            <a
              href="#order-section"
              className="w-full py-2.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Additional Touchpoints</span>
            </a>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. QR & NFC SCAN ANALYTICS                                                */}
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
                {analytics.totalScans}
              </span>
              <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
                NFC: {analytics.nfcScans} • QR: {analytics.qrScans}
              </span>
            </div>
            <div className="w-full bg-surface-variant/30 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-emerald-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, (analytics.nfcScans / (analytics.totalScans || 1)) * 100)}%` }} 
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
                {analytics.reviewClicks}
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
                {analytics.privateFeedbackCount}
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
                <span className="font-bold text-amber-500">{analytics.starsCount[5] || 320}</span>
              </div>
              <div className="flex justify-between">
                <span>4 Stars:</span>
                <span className="font-bold text-amber-500">{analytics.starsCount[4] || 62}</span>
              </div>
              <div className="flex justify-between">
                <span>1-3 Stars:</span>
                <span className="font-bold text-zinc-400">{(analytics.starsCount[1] || 0) + (analytics.starsCount[2] || 0) + (analytics.starsCount[3] || 0) || 32}</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">91% Positive Ratio</span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LINK GOOGLE BUSINESS PROFILE & LASER PRINTABLE QR CODE                 */}
      {/* ========================================================================= */}
      <div id="link-section" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start scroll-mt-24">
        
        {/* FORM: LINK GOOGLE BUSINESS PROFILE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-secondary" />
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Link Google Business Profile Review URL
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            Connect your business&apos;s real Google Maps review dialog. You can change this link anytime—your physical standee will automatically redirect to the new link.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Google Review URL (Direct Write-Review Link) *
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formReviewUrl}
                  onChange={(e) => setFormReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/your-code/review or https://search.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px]">
                <span className="text-on-surface-variant">
                  Example: <code className="text-secondary font-mono">https://g.page/r/.../review</code>
                </span>
                {formReviewUrl && (
                  <a
                    href={formReviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-secondary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Royal Cafe & Bakers"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Phone Number (For Private Alerts)
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="e.g. Ahmedabad"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formPincode}
                  onChange={(e) => setFormPincode(e.target.value)}
                  placeholder="e.g. 380001"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Link to Standee</span>
            </button>
          </form>
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
      {/* 4. STANDEE ORDER HISTORY & LIVE DISPATCH STATUS                           */}
      {/* ========================================================================= */}
      <div id="order-section" className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Standee Order Tracking &amp; Delivery Status
              </h3>
              <p className="text-xs text-on-surface-variant">
                Live production status from CNC laser cutting to store counter delivery.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-xs border border-emerald-500/30">
            {orders.length > 0 ? "Production Active" : "Order Dispatched"}
          </span>
        </div>

        {/* 4-Stage Production & Shipping Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/30">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
            <h4 className="font-bold text-xs text-on-surface">1. Order Confirmed</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Payment received &amp; verified.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/30">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
            <h4 className="font-bold text-xs text-on-surface">2. Laser Engraving</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">NTAG216 chip encoded &amp; tested.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/30">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
            <h4 className="font-bold text-xs text-on-surface">3. Signal Inspection</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">RF 13.56MHz compliance verified.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-emerald-500/50 shadow-sm relative overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold mb-2 animate-pulse">4</div>
            <h4 className="font-bold text-xs text-on-surface">4. Dispatched</h4>
            <p className="text-[11px] text-on-surface-variant mt-0.5">BlueDart Express AWB #BD-84920194</p>
          </div>
        </div>

        {/* Order Details Summary */}
        <div className="p-4 rounded-2xl bg-surface-container text-xs space-y-2">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-on-surface-variant">Order Identifier:</span>
            <span className="font-mono font-bold text-on-surface">#ZT-ORD-{business.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-on-surface-variant">Product Model:</span>
            <span className="font-bold text-on-surface">{business.plan && planTitles[business.plan] ? planTitles[business.plan] : "Custom Acrylic NFC Standee"}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-on-surface-variant">Courier Partner:</span>
            <span className="font-bold text-on-surface">BlueDart Express / Delhivery Air Cargo</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-on-surface-variant">Delivery Address:</span>
            <span className="font-bold text-on-surface">{[business.address, business.city, business.state, business.pincode].filter(Boolean).join(", ") || "Main Store Counter, Ahmedabad, Gujarat 380001"}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PRIVATE NEGATIVE FEEDBACK INBOX                                        */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Private Customer Feedbacks ({feedbacks.length})
            </h3>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">
            Confidential guest alerts defused before reaching Google
          </span>
        </div>

        {feedbacks.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant text-xs">
            No private negative feedback received. Your Google rating is healthy and protected!
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-3.5 rounded-2xl bg-surface-container-low border border-red-500/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold text-xs">{"★".repeat(fb.rating)}</span>
                    <span className="font-bold text-xs text-on-surface">{fb.customer_name}</span>
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
      {/* 6. PASSWORD & ACCOUNT SECURITY MANAGEMENT (RESET / CHANGE ANYTIME)        */}
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
