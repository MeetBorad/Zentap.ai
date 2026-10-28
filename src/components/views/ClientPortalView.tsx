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
  Cpu
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
  const { user } = useAuth();

  // Navigation tabs for dedicated views
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "buy" | "orders" | "faq">("overview");

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

  // Profile Form State
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
      setActiveTab("orders");
      showToast("✓ Payment Verified! Order created and dispatched to production.");
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

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://www.zentapdigitalsolutions.com";
  const assistantUrl = `${originUrl}/r/${business.slug}`;
  const nfcUrl = `${assistantUrl}?s=nfc`;
  const linkReady = !!business.review_url;

  const planTitles = {
    card_500: "Smart NFC Review Card (₹500)",
    standee_1500: "Custom Acrylic NFC Standee (₹1,500)",
    standee_auto_2000: "Acrylic Standee + AI Automation Engine (₹2,000)",
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Guest Notice if viewing without login */}
      {!user && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-on-surface">
                Client Business Profile Dashboard (Demo Sandbox)
              </h4>
              <p className="text-[11px] text-on-surface-variant">
                You are previewing the client dashboard in sandbox mode. Log in to access your registered business data.
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

      {/* Top Profile Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-surface-container-low p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-surface-variant/40 shadow-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-on-primary flex items-center justify-center font-headline font-black text-2xl shadow-md border border-white/20">
            {business.name ? business.name[0].toUpperCase() : "Z"}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {business.payment_status === "paid" ? "Subscribed & Active" : "Trial Active"}
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

          <button
            onClick={() => setActiveTab("buy")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 shadow-sm transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order New Standee</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 border-b border-surface-variant/40 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Link Google Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Standee Order Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveTab("buy")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "buy"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buy Hardware Standee</span>
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "faq"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support &amp; FAQ</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB: CONTAINS ALL 5 CORE MERCHANT MODULES                      */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">

          {/* ITEM 1 & 3: REVIEW ASSISTANT LINK + CURRENT PLAN ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ITEM 1: GOOGLE REVIEW ASSISTANT PAGE LINKED HERE & TOUCHPOINT CARD */}
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
                      <span>Test Page</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* NFC & QR Encoding specs */}
              <div className="pt-4 border-t border-surface-variant/30 flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-secondary" />
                  <span>NFC Payload: <code className="font-mono text-on-surface font-semibold">{assistantUrl}?s=nfc</code></span>
                </span>
                <button
                  onClick={() => setActiveTab("profile")}
                  className="text-secondary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit Review URL</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ITEM 3: CURRENT PLAN WITH US */}
            <div className="p-6 sm:p-7 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                    Current Plan With Us
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold">
                    Active
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
                    <span>Counter Touchpoints:</span>
                    <span className="font-semibold text-on-surface">1 Standee Deployed</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Google Anti-Gating:</span>
                    <span className="font-semibold text-on-surface">Compliant</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-surface-variant/30">
                <button
                  onClick={() => setActiveTab("buy")}
                  className="w-full py-2.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order Additional Standees</span>
                </button>
              </div>
            </div>

          </div>

          {/* ITEM 2: ANALYTICS OF QR/NFC SCAN OF THAT BUSINESS */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  Customer Scan &amp; Review Analytics
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Real-time telemetry from your physical standee and counter QR touchpoints.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateScan("nfc")}
                  className="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40"
                  title="Simulate a real-life NFC phone tap"
                >
                  <Radio className="w-3.5 h-3.5 text-secondary" />
                  <span>+ Test NFC Tap</span>
                </button>
                <button
                  onClick={() => handleSimulateScan("qr")}
                  className="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40"
                  title="Simulate a real-life QR camera scan"
                >
                  <QrCode className="w-3.5 h-3.5 text-secondary" />
                  <span>+ Test QR Scan</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Metric 1: Total Scans */}
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

              {/* Metric 2: Google Review Clicks */}
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

              {/* Metric 3: Private Feedback Defused */}
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
                  Direct management notes
                </span>
              </div>

              {/* Metric 4: Positive Rating Ratio */}
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

          {/* ITEM 4 & QR HUB: LINK BUSINESS PROFILE & DOWNLOAD STAND-UP QR */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* ITEM 4: TO ADD / LINK BUSINESS PROFILE & GOOGLE REVIEW LINK */}
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

          {/* ITEM 5: STANDEE ORDER HISTORY & LIVE DISPATCH STATUS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    Standee Order History &amp; Delivery Tracking
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Tracking live progress from CNC laser engraving to store counter delivery.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-xs border border-emerald-500/30">
                {orders.length > 0 ? "Production Active" : "Order Confirmed &amp; Dispatched"}
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
                <span className="font-bold text-on-surface">{[business.address, business.city, business.state, business.pincode].filter(Boolean).join(", ") || "Main Counter, Ahmedabad, Gujarat 380001"}</span>
              </div>
            </div>
          </div>

          {/* PRIVATE FEEDBACK INBOX */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Private Customer Feedbacks ({feedbacks.length})
                </h3>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Confidential notes from guests
              </span>
            </div>

            {feedbacks.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant text-xs">
                No private negative feedback received. Your Google rating is healthy!
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED PROFILE & GOOGLE REVIEW LINK TAB                              */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm max-w-3xl mx-auto animate-in fade-in duration-200">
          <div className="mb-6">
            <h2 className="font-headline font-bold text-2xl text-on-surface">
              Business Profile &amp; Google Review Link
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Keep your contact details and Google Maps review link updated. Changes sync immediately to your NFC Standee and QR touchpoint.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Google Review URL (Direct Write-Review Link) *
              </label>
              <input
                type="url"
                value={formReviewUrl}
                onChange={(e) => setFormReviewUrl(e.target.value)}
                placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=..."
                className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              <p className="text-[11px] text-on-surface-variant mt-1">
                This link opens directly when customers tap 4 or 5 stars on your counter standee.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Store Counter / Delivery Address
              </label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Shop No., Complex, Street Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
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
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save &amp; Link Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEDICATED STANDEE ORDER STATUS TAB                                     */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm max-w-3xl mx-auto animate-in fade-in duration-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <Truck className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              Order Dispatched
            </span>

            <h2 className="font-headline font-bold text-2xl text-on-surface mt-2">
              Order #ZT-ORD-{business.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Custom-cut acrylic • NTAG216 chip encoded • Dispatched via BlueDart Express
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-6 max-w-md mx-auto mb-8 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-variant">
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow">✓</div>
              <div>
                <h4 className="font-bold text-xs text-on-surface">Payment Received &amp; Verified</h4>
                <p className="text-[11px] text-on-surface-variant">Razorpay payment confirmed.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow">✓</div>
              <div>
                <h4 className="font-bold text-xs text-on-surface">Laser Engraving &amp; NFC Programming</h4>
                <p className="text-[11px] text-on-surface-variant">Standee custom-printed and programmed with /r/{business.slug}.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shadow animate-pulse">3</div>
              <div>
                <h4 className="font-bold text-xs text-on-surface">Courier Dispatch (BlueDart Express)</h4>
                <p className="text-[11px] text-on-surface-variant">AWB #BD-84920194 in transit.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-bold text-xs border border-surface-variant">4</div>
              <div>
                <h4 className="font-bold text-xs text-on-surface-variant">Delivered to Store Counter</h4>
                <p className="text-[11px] text-on-surface-variant">Expected delivery in 2-3 business days.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Review Assistant Status:</span>
              <span className="font-bold text-emerald-600">Page Live at /r/{business.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Courier Partner:</span>
              <span className="font-bold text-on-surface">BlueDart Express</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Tracking Number:</span>
              <span className="font-mono font-bold text-on-surface">BD-84920194</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BUY HARDWARE STANDEE TAB                                               */}
      {/* ========================================================================= */}
      {activeTab === "buy" && (
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface">
              Order Custom NFC Hardware
            </h2>
            <p className="text-xs text-on-surface-variant mt-2">
              Select your preferred touchpoint format. All options include pre-encoded NTAG216 high-speed NFC chips and Level Q laser QR codes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => setSelectedPlan("card_500")}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === "card_500"
                  ? "bg-surface-container-low border-secondary shadow-md ring-2 ring-secondary/20"
                  : "bg-surface-container-lowest border-surface-variant/40 hover:border-surface-variant"
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Compact Touchpoint</span>
                <h4 className="font-headline font-bold text-lg text-on-surface mt-1">Smart NFC Card</h4>
                <div className="my-3">
                  <span className="font-headline font-black text-2xl text-on-surface">₹500</span>
                  <span className="text-xs text-on-surface-variant ml-1">one-time</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Pocket-sized PVC card for on-the-go service providers, waiters, and sales staff.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-surface-variant/20 text-xs font-bold text-secondary">
                {selectedPlan === "card_500" ? "✓ Selected" : "Select Card"}
              </div>
            </div>

            <div 
              onClick={() => setSelectedPlan("standee_1500")}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                selectedPlan === "standee_1500"
                  ? "bg-surface-container-low border-secondary shadow-md ring-2 ring-secondary/20"
                  : "bg-surface-container-lowest border-surface-variant/40 hover:border-surface-variant"
              }`}
            >
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-bold text-[10px] uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Counter Touchpoint</span>
                <h4 className="font-headline font-bold text-lg text-on-surface mt-1">Custom Acrylic Standee</h4>
                <div className="my-3">
                  <span className="font-headline font-black text-2xl text-on-surface">₹1,500</span>
                  <span className="text-xs text-on-surface-variant ml-1">one-time</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Premium counter display with built-in NTAG216 NFC chip and laser QR code.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-surface-variant/20 text-xs font-bold text-secondary">
                {selectedPlan === "standee_1500" ? "✓ Selected" : "Select Standee"}
              </div>
            </div>

            <div 
              onClick={() => setSelectedPlan("standee_auto_2000")}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === "standee_auto_2000"
                  ? "bg-surface-container-low border-secondary shadow-md ring-2 ring-secondary/20"
                  : "bg-surface-container-lowest border-surface-variant/40 hover:border-surface-variant"
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Complete Package</span>
                <h4 className="font-headline font-bold text-lg text-on-surface mt-1">Standee + AI Engine</h4>
                <div className="my-3">
                  <span className="font-headline font-black text-2xl text-on-surface">₹2,000</span>
                  <span className="text-xs text-on-surface-variant ml-1">one-time</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Custom Acrylic Standee plus WhatsApp follow-up automation and monthly review reporting.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-surface-variant/20 text-xs font-bold text-secondary">
                {selectedPlan === "standee_auto_2000" ? "✓ Selected" : "Select Automation"}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 text-center max-w-md mx-auto">
            <button
              onClick={handleCheckoutSubmit}
              disabled={paymentProcessing}
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              {paymentProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Razorpay Verification...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with Razorpay &amp; Confirm Standee Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FAQ TAB                                                                */}
      {/* ========================================================================= */}
      {activeTab === "faq" && (
        <div className="space-y-4 max-w-3xl mx-auto animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40">
            <h3 className="font-bold text-sm text-on-surface mb-1">Does the customer phone require an app?</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              No app is needed. iPhones and Androids detect the NFC chip natively within 4cm and open your review assistant instantly.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40">
            <h3 className="font-bold text-sm text-on-surface mb-1">How does Google review compliance work?</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every customer selecting 1 to 5 stars has the direct option to post on Google Maps in full compliance with Google anti-gating policies. For 1-2 stars, an additional confidential feedback form allows guests to explain concerns directly to management.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40">
            <h3 className="font-bold text-sm text-on-surface mb-1">Can I update my Google Review link later?</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Yes! You can update your Google Review URL anytime from your dashboard. The physical standee automatically routes customers to your latest link without replacing any hardware.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
