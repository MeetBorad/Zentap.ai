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
  CheckCircle,
  Power,
  FileCheck
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
  QuotationRecord,
  createQuotationRecord,
  getQuotationsForBusiness,
  logScan,
  validateGoogleReviewUrl
} from "@/lib/businessStore";
import { 
  fetchUserBusinessFromDb, 
  upsertUserBusinessInDb, 
  fetchDbOrders, 
  fetchDbFeedbacks,
  adminUpdateDbBusiness,
  updateDbReviewUrl
} from "@/lib/supabase/service";
import StandeeVisual from "@/components/StandeeVisuals";
import RazorpayCheckoutModal from "@/components/modals/RazorpayCheckoutModal";

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

  // Top Tab State: "live" (User's real isolated profile) vs "sample" (Sample showcase preview)
  const [dashboardTab, setDashboardTab] = useState<"live" | "sample">("live");

  // Sub-Tabs under My Live Business Analytics:
  // 1: edit_details, 2: link_gbp (optional), 3: assistant_qr, 4: orders, 5: plan
  const [portalSubTab, setPortalSubTab] = useState<"edit_details" | "link_gbp" | "assistant_qr" | "orders" | "plan">("edit_details");

  const [business, setBusiness] = useState<BusinessRecord>(SAMPLE_DEMO_BUSINESS);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
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

  // Form State (Business Details)
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

  // Buy Standee & Custom Plan State
  const [selectedPlan, setSelectedPlan] = useState<"card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom">("standee_1500");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderRecord | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Franchise Custom Quotation Builder State
  const [quoteBranches, setQuoteBranches] = useState<number>(3);
  const [quoteStandees, setQuoteStandees] = useState<number>(6);
  const [quoteHardware, setQuoteHardware] = useState<"matte_obsidian" | "laser_wood" | "card_and_standee">("matte_obsidian");
  const [quoteMultipleQr, setQuoteMultipleQr] = useState<boolean>(true);
  const [quoteAddons, setQuoteAddons] = useState<string[]>([
    "Unique QR per Branch Counter",
    "Auto Google Review Reply AI",
    "Centralized Multi-Outlet Dashboard",
    "Custom Laser Logo Engraving",
  ]);
  const [quoteNotes, setQuoteNotes] = useState<string>("");
  const [quoteContactName, setQuoteContactName] = useState<string>("");
  const [quotePhone, setQuotePhone] = useState<string>("");
  const [quoteSubmittedRecord, setQuoteSubmittedRecord] = useState<QuotationRecord | null>(null);
  const [quoteSubmitting, setQuoteSubmitting] = useState<boolean>(false);

  // In-Dashboard Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Sample data constants for preview mode
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
        // Fast local load for this isolated user (synced with Admin Master Table)
        const b = getUserBusiness(user.id, user.email || "", user.user_metadata?.business_name);
        setBusiness(b);
        populateForm(b);
        setFeedbacks(getFeedbacksForBusiness(b.id));
        setOrders(getOrdersForBusiness(b.id));
        setQuotations(getQuotationsForBusiness(b.id));
        setQuoteContactName(b.name || user.user_metadata?.full_name || "");
        setQuotePhone(b.phone || "");
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
          } else {
            // First time login for merchant: persist initial merchant profile to Supabase
            const newDbBiz = await upsertUserBusinessInDb({
              owner_user_id: user.id,
              name: b.name,
              email: b.email,
              phone: b.phone || null,
              city: b.city || null,
              state: b.state || null,
              country: b.country || "India",
              pincode: b.pincode || null,
              address: b.address || null,
              category: b.category || "Retail / Hospitality Business",
              gbp_link: b.gbp_link || null,
              slug: b.slug,
              plan: b.plan,
              payment_status: b.payment_status || "pending",
              review_url: b.review_url || null,
              active: true,
            });
            if (newDbBiz) {
              const registered: BusinessRecord = {
                ...b,
                id: newDbBiz.id,
                created_at: newDbBiz.created_at,
              };
              setBusiness(registered);
              populateForm(registered);
            }
          }
        } catch (err) {
          console.warn("Supabase background sync notice:", err);
        }
      } else {
        // Guest mode default to sample showcase
        setBusiness(SAMPLE_DEMO_BUSINESS);
        populateForm(SAMPLE_DEMO_BUSINESS);
        setFeedbacks(getFeedbacksForBusiness(SAMPLE_DEMO_BUSINESS.id));
        setOrders(getOrdersForBusiness(SAMPLE_DEMO_BUSINESS.id));
        setQuotations(getQuotationsForBusiness(SAMPLE_DEMO_BUSINESS.id));
        setAnalytics(SAMPLE_ANALYTICS);
      }
    }

    loadData();
  }, [user]);

  // Active display business based on top tab
  const isSample = dashboardTab === "sample";
  const displayBusiness = isSample ? SAMPLE_DEMO_BUSINESS : business;
  const displayFeedbacks = isSample ? getFeedbacksForBusiness(SAMPLE_DEMO_BUSINESS.id) : feedbacks;
  const displayOrders = isSample ? getOrdersForBusiness(SAMPLE_DEMO_BUSINESS.id) : orders;
  const displayQuotations = isSample ? getQuotationsForBusiness(SAMPLE_DEMO_BUSINESS.id) : quotations;
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
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR:", err));
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
    setFormEmail(b.email || "");
    setFormAddress(b.address || "");
    if (b.plan) setSelectedPlan(b.plan);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    showToast("✓ Copied Live Assistant URL to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // -------------------------------------------------------------
  // TAB 1: Link Business Profile & Google Review URL (Save to Admin Master Table)
  // -------------------------------------------------------------
  const handleSaveGbpLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReviewUrl.trim() && !formGbp.trim()) {
      showToast("Please provide at least a Google Review Link or Google Maps Listing URL.");
      return;
    }

    if (formReviewUrl.trim()) {
      const check = validateGoogleReviewUrl(formReviewUrl.trim());
      if (!check.valid) {
        showToast(`⚠ Notice: ${check.message}`);
      }
    }

    const updates = {
      gbp_link: formGbp.trim(),
      review_url: formReviewUrl.trim() || null,
    };

    if (user) {
      const updated = updateUserBusiness(user.id, updates);
      setBusiness(updated);
      try {
        await upsertUserBusinessInDb({
          id: updated.id,
          owner_user_id: user.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          city: updated.city,
          slug: updated.slug,
          plan: updated.plan,
          payment_status: updated.payment_status,
          review_url: updated.review_url,
          gbp_link: updated.gbp_link,
          active: updated.active,
        });
      } catch (err) {
        console.warn("Supabase upsert error:", err);
      }
    } else {
      setBusiness((prev) => ({ ...prev, ...updates }));
    }
    showToast("✓ Business profile link saved & connected to Admin Master Table!");
  };

  // -------------------------------------------------------------
  // TAB 2: Edit Business Details (Sync to Admin Master Table)
  // -------------------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Business Name cannot be empty.");
      return;
    }

    const updates = {
      name: formName.trim(),
      gbp_link: formGbp.trim(),
      review_url: formReviewUrl.trim() || null,
      phone: formPhone.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      country: formCountry.trim() || "India",
      pincode: formPincode.trim(),
      email: formEmail.trim() || business.email,
      address: formAddress.trim(),
    };

    if (user) {
      const updated = updateUserBusiness(user.id, updates);
      setBusiness(updated);
      try {
        await upsertUserBusinessInDb({
          id: updated.id,
          owner_user_id: user.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          city: updated.city,
          slug: updated.slug,
          plan: updated.plan,
          payment_status: updated.payment_status,
          review_url: updated.review_url,
          gbp_link: updated.gbp_link,
          active: updated.active,
        });
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    } else {
      setBusiness((prev) => ({ ...prev, ...updates }));
    }

    showToast("✓ Business Details updated and synced with Admin Master Table!");
  };

  // -------------------------------------------------------------
  // TAB 5: Toggle Active / Deactivate Business Assistant
  // -------------------------------------------------------------
  const handleToggleActiveState = async () => {
    const nextActive = !business.active;
    const updates = { active: nextActive };
    if (user) {
      const updated = updateUserBusiness(user.id, updates);
      setBusiness(updated);
      try {
        await upsertUserBusinessInDb({
          id: updated.id,
          owner_user_id: user.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          city: updated.city,
          slug: updated.slug,
          plan: updated.plan,
          payment_status: updated.payment_status,
          review_url: updated.review_url,
          gbp_link: updated.gbp_link,
          active: nextActive,
        });
      } catch (e) {
        console.warn("Supabase toggle active notice:", e);
      }
    } else {
      setBusiness((prev) => ({ ...prev, ...updates }));
    }
    showToast(`✓ Review Assistant Touchpoint is now ${nextActive ? "ACTIVE" : "DEACTIVATED"}`);
  };

  // Checkout Handlers
  const handleCheckoutSubmit = () => {
    if (!formPincode.trim()) {
      showToast("Please enter your delivery Pincode to calculate courier fee.");
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setIsCheckoutModalOpen(false);
    const orderData = createOrderRecord(business.id, selectedPlan, formPincode || business.pincode || "380001");

    const updated = updateUserBusiness(user ? user.id : business.owner_user_id, {
      plan: selectedPlan,
      payment_status: "paid",
      pincode: formPincode || business.pincode,
      address: formAddress || business.address,
      gbp_link: formGbp || business.gbp_link,
      review_url: formReviewUrl || business.review_url,
    });

    setBusiness(updated);
    setOrders(getOrdersForBusiness(business.id));
    setLastPlacedOrder(orderData);
    setOrderSuccess(true);
    setPortalSubTab("orders");
    showToast("✓ Payment Verified! Your Standee order is in process.");
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
  const basePlanPrice = selectedPlan === "card_500" ? 500 : selectedPlan === "standee_1500" ? 1500 : selectedPlan === "standee_auto_2000" ? 2000 : 0;
  const grandTotal = basePlanPrice + courierData.amount;

  const planTitles: Record<string, string> = {
    card_500: "Normal Smart NFC Review Card (₹500)",
    standee_1500: "Auto Google Review Standee with NFC & QR (₹1,500)",
    standee_auto_2000: "Auto Google Review Standee + Auto Reply Engine (₹2,000)",
    franchise_custom: "Franchise Multi-Outlet Custom Standee Fleet (Custom Quotation)",
  };

  // Franchise Quotation Submission Handler
  const handleSubmitQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteBranches < 2) {
      showToast("Franchise custom plan requires at least 2 branches.");
      return;
    }
    if (quoteStandees < 2) {
      showToast("Please select at least 2 standees for your multi-location fleet.");
      return;
    }

    setQuoteSubmitting(true);
    try {
      // Volume discounted pricing:
      // Standees: ₹1,200/unit bulk pricing (regular ₹1,500)
      // Platform / AI Reply: ₹800/branch/month (regular ₹1,000)
      const estimatedHardware = quoteStandees * 1200;
      const estimatedSub = quoteBranches * 800;

      const newQuote = createQuotationRecord({
        business_id: displayBusiness.id,
        business_name: formName || displayBusiness.name || "Franchise Merchant",
        contact_name: quoteContactName || formName || displayBusiness.name,
        email: formEmail || displayBusiness.email || user?.email || "",
        phone: quotePhone || formPhone || displayBusiness.phone || "",
        city: formCity || displayBusiness.city || "Ahmedabad",
        branch_count: Number(quoteBranches),
        standee_count: Number(quoteStandees),
        hardware_type: quoteHardware,
        multiple_qr: quoteMultipleQr,
        addons: quoteAddons,
        estimated_hardware_total: estimatedHardware,
        estimated_monthly_sub: estimatedSub,
        notes: quoteNotes,
      });

      setQuoteSubmittedRecord(newQuote);
      setQuotations(getQuotationsForBusiness(displayBusiness.id));
      showToast(`✓ Quotation request ${newQuote.id} created & saved to Admin Hub!`);
    } catch (err) {
      console.error("Quotation creation error:", err);
      showToast("Could not submit quotation. Please try again.");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleToggleAddon = (addon: string) => {
    setQuoteAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
      
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
                My Live Business Analytics (Interactive Showcase)
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
      {/* 1. TOP 2 OPTIONS FOR FIRST-TIME LOGIN:                                    */}
      {/*    MY LIVE BUSINESS ANALYTICS vs SAMPLE DASHBOARD PREVIEW                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-surface-variant/40">
        <div className="inline-flex p-1.5 rounded-2xl bg-surface-container border border-surface-variant/50 shadow-sm">
          <button
            onClick={() => setDashboardTab("live")}
            className={`px-4 py-2 rounded-xl font-headline font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              dashboardTab === "live"
                ? "bg-[#1C1B1A] text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>My Live Business Analytics</span>
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
            <span>Sample Dashboard Preview (See How It Looks When You Order Standee)</span>
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
        <div className="p-5 rounded-3xl bg-secondary/10 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-secondary flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-on-surface">
                Sample Showcase: How Your Dashboard Looks Once You Order a Standee
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                This is a live preview of an active customer store (*Virat Gold Palace*). Once you order your physical standee and connect your Google Review link, you will see your own customer NFC taps, Level Q QR scans, ~88% review conversions, and BlueDart delivery tracking!
              </p>
            </div>
          </div>

          <button
            onClick={() => setDashboardTab("live")}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex-shrink-0 cursor-pointer shadow-sm"
          >
            Return to My Live Profile
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN HEADER BANNER (DYNAMIC DESIGN MATCHED TO ADMIN MASTER TABLE)      */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-[#1C1B1A] via-[#2A2928] to-[#1C1B1A] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-[#3A3836] shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D94826] to-[#E68A00] text-white flex items-center justify-center font-headline font-black text-2xl shadow-xl border border-white/20 flex-shrink-0">
            {displayBusiness.name ? displayBusiness.name[0].toUpperCase() : "Z"}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {displayBusiness.payment_status === "paid" ? "Subscribed & Active" : "Active Trial / Standee Setup"}
              </span>
              <span className="text-xs text-zinc-300 font-mono">
                Slug: /r/{displayBusiness.slug}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 text-[10px] font-bold">
                My Live Business Analytics
              </span>
            </div>

            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-white mt-1">
              {displayBusiness.name || "My Business Profile"}
            </h1>

            <p className="text-xs text-zinc-300 mt-1 flex flex-wrap items-center gap-1.5">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-secondary" />
            <span>Test Customer Flow</span>
          </a>

          <button
            onClick={() => setPortalSubTab("orders")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D94826] hover:bg-[#C23C1D] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy / Order Standee</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. VISUAL ANALYTICS DIRECTLY UNDER MAIN HEADER                            */}
      {/* ========================================================================= */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Customer Tap &amp; Scan Telemetry
            </h3>
            <p className="text-xs text-on-surface-variant">
              Live engagement data recorded from your physical counter touchpoint.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateScan("nfc")}
              className="px-3.5 py-1.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40 transition-colors"
              title="Simulate a customer NFC phone tap"
            >
              <Radio className="w-3.5 h-3.5 text-secondary" />
              <span>+ Test NFC Tap</span>
            </button>
            <button
              onClick={() => handleSimulateScan("qr")}
              className="px-3.5 py-1.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40 transition-colors"
              title="Simulate a customer QR camera scan"
            >
              <QrCode className="w-3.5 h-3.5 text-secondary" />
              <span>+ Test QR Scan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Customer Scans */}
          <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
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
          <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
              Google Review Clicks
            </span>
            <div className="my-2">
              <span className="font-headline font-black text-3xl sm:text-4xl text-secondary">
                {displayAnalytics.reviewClicks}
              </span>
              <span className="block text-[11px] text-secondary font-semibold mt-1">
                ~88% Conversion to Google
              </span>
            </div>
            <div className="w-full bg-secondary/20 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-secondary h-full rounded-full w-[88%]" />
            </div>
          </div>

          {/* Private Feedbacks Defused */}
          <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
              Private Feedbacks (1-2★)
            </span>
            <div className="my-2">
              <span className="font-headline font-black text-3xl sm:text-4xl text-red-500">
                {displayAnalytics.privateFeedbackCount}
              </span>
              <span className="block text-[11px] text-red-500 font-semibold mt-1">
                Resolved out of public view
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant">
              Saved from Google rating drop
            </span>
          </div>

          {/* Positive Stars Ratio */}
          <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
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
      {/* 4. THE 5 DEDICATED SUB-TABS CONTROLLER (NEW REQUESTED SEQUENCE)             */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface-container border border-surface-variant/40 shadow-sm">
        {/* 1. Edit Business Details */}
        <button
          onClick={() => setPortalSubTab("edit_details")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            portalSubTab === "edit_details"
              ? "bg-[#1C1B1A] text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface"
          }`}
        >
          <Building2 className="w-4 h-4 text-primary" />
          <span>1. Edit Business Details</span>
        </button>

        {/* 2. Link Business Profile (Optional / Not Mandatory) */}
        <button
          onClick={() => setPortalSubTab("link_gbp")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            portalSubTab === "link_gbp"
              ? "bg-[#1C1B1A] text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface"
          }`}
        >
          <Star className="w-4 h-4 text-secondary" />
          <span>2. Link Business Profile</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-medium">
            Optional
          </span>
        </button>

        {/* 3. Review Assistant & QR Hub */}
        <button
          onClick={() => setPortalSubTab("assistant_qr")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            portalSubTab === "assistant_qr"
              ? "bg-[#1C1B1A] text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface"
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-500" />
          <span>3. Review Assistant &amp; QR Hub</span>
        </button>

        {/* 4. Standee Order & Status */}
        <button
          onClick={() => setPortalSubTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            portalSubTab === "orders"
              ? "bg-[#1C1B1A] text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface"
          }`}
        >
          <Truck className="w-4 h-4 text-blue-500" />
          <span>4. Standee Order &amp; Status</span>
          {(orderSuccess || displayOrders.length > 0) && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 text-[9px] font-bold">
              Active Order
            </span>
          )}
        </button>

        {/* 5. Current Plan & Controls */}
        <button
          onClick={() => setPortalSubTab("plan")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            portalSubTab === "plan"
              ? "bg-[#1C1B1A] text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface"
          }`}
        >
          <CreditCard className="w-4 h-4 text-purple-500" />
          <span>5. Current Plan &amp; Controls</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: EDIT BUSINESS DETAILS (NAME, PHONE, CITY, ADDRESS ETC.)        */}
      {/* ========================================================================= */}
      {portalSubTab === "edit_details" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/30">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  1. Edit Business Details &amp; Contact Information
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Update your business identity, contact details, and shipping address. Changes are saved and synchronized with the <strong>Admin Master Table</strong>.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs border border-secondary/30 self-start sm:self-auto">
              Editable Anytime
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Business Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Royal Cafe & Bakers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Contact Number (For Private Alerts &amp; WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                />
              </div>

              {/* Email Address */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                />
              </div>

              {/* City */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                />
              </div>

              {/* State */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                />
              </div>

              {/* Country & Pincode */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Country</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={formPincode}
                    onChange={(e) => setFormPincode(e.target.value)}
                    placeholder="380001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Delivery / Store Address */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Store / Billing Counter Shipping Address (For Hardware Delivery)
              </label>
              <textarea
                rows={2}
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Shop No. 12, Ground Floor, Commercial Complex, Main Road..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none shadow-sm"
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
                <span>Save Business Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: LINK BUSINESS PROFILE (OPTIONAL / NOT MANDATORY)               */}
      {/* ========================================================================= */}
      {portalSubTab === "link_gbp" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/30">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-secondary" />
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  2. Link Google Business Profile &amp; Review Destination
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-surface-variant text-[10px] font-semibold text-on-surface-variant">
                  Optional
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Provide your Google Business Profile listing link and write-review destination URL. This configuration is optional and can be updated anytime.
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
              linkReady ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : "bg-zinc-100 text-zinc-600 border-zinc-200"
            }`}>
              {linkReady ? "✓ Destination Connected" : "○ Optional / Pending Link"}
            </span>
          </div>

          {/* Explicit Optional Notice Callout */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>It is NOT mandatory to provide this link right now.</strong> If you do not have your direct Google review link yet, or if your Google Business Profile is newly created, you can safely skip this step. Our ZenTap operations team will verify and connect your official Google Review destination before your hardware is laser-engraved and dispatched.
            </div>
          </div>

          <form onSubmit={handleSaveGbpLink} className="space-y-4 max-w-3xl">
            {/* Google Review Write Link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-on-surface">
                  Google Review URL (Direct Write-Review Link)
                </label>
                <span className="text-[11px] text-zinc-400 font-medium">Optional</span>
              </div>
              <input
                type="url"
                value={formReviewUrl}
                onChange={(e) => setFormReviewUrl(e.target.value)}
                placeholder="https://g.page/r/your-business-code/review or https://search.google.com/local/writereview?..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
              />
              <span className="text-[11px] text-on-surface-variant mt-1 block">
                This is where customers who rate 4–5★ will be redirected to write their review on Google. Leave blank if not available yet.
              </span>
            </div>

            {/* Google Business Profile Listing Link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-on-surface">
                  Google Business Profile Link (Google Maps / Listing Link)
                </label>
                <span className="text-[11px] text-zinc-400 font-medium">Optional</span>
              </div>
              <input
                type="url"
                value={formGbp}
                onChange={(e) => setFormGbp(e.target.value)}
                placeholder="https://maps.google.com/?cid=... or https://g.co/kgs/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
              />
              <span className="text-[11px] text-on-surface-variant mt-1 block">
                Your general Google Maps profile link for overall store visibility.
              </span>
            </div>

            {/* Test Links Action */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {formReviewUrl && (
                <a
                  href={formReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-semibold text-secondary hover:border-secondary flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Review Link</span>
                </a>
              )}
              {formGbp && (
                <a
                  href={formGbp}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-semibold text-on-surface hover:border-primary flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Maps Listing</span>
                </a>
              )}
            </div>

            <div className="pt-4 border-t border-surface-variant/30 flex justify-between items-center">
              <span className="text-[11px] text-on-surface-variant">
                You can save this anytime — updates sync directly to the Admin Master Table.
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Link Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: YOUR CUSTOMIZED GOOGLE REVIEW ASSISTANT & QR HUB               */}
      {/* ========================================================================= */}
      {portalSubTab === "assistant_qr" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
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
                    {linkReady ? "✓ Google Review Link Active" : "⚠ Review Link Needed"}
                  </span>
                </div>

                <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
                  Your Customized Google Review Assistant
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  When a customer taps your NFC Standee or scans your laser QR code, they open your personal review assistant page. High ratings (3–5★) generate tailored AI review drafts and direct straight to your Google review link; low ratings (1–2★) submit directly to your private management inbox.
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
                <button
                  onClick={() => setPortalSubTab("link_gbp")}
                  className="text-secondary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit Destination Link</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
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
                  <span>Download Standee QR (PNG)</span>
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: STANDEE ORDER & DISPATCH STATUS (WITH TEST FLOW)               */}
      {/* ========================================================================= */}
      {portalSubTab === "orders" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Order Status Timeline Card */}
          {(orderSuccess || displayOrders.length > 0) ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-emerald-500/40 shadow-sm relative overflow-hidden animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 flex items-center justify-center">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-bold text-xl text-on-surface">
                        Your Standee Order is in Process!
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

              {/* Live Assistant Test Banner While In Transit */}
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
                    <span>Open for Test (Live Flow)</span>
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
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm relative overflow-hidden animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-bold text-lg text-on-surface">
                        Standee Order Status: Pending Selection
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[10px] font-bold border border-amber-500/30">
                        No Order Placed Yet
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      You haven&apos;t ordered a physical NFC standee or review card yet. Choose a plan below to get custom laser-engraved hardware dispatched to your counter.
                    </p>
                  </div>
                </div>

                <a
                  href={`${assistantUrl}?preview=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-surface border border-secondary/40 text-xs font-bold text-secondary hover:border-secondary flex items-center gap-2 cursor-pointer shadow-sm flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open for Test</span>
                </a>
              </div>
            </div>
          )}

          {/* HARDWARE PURCHASE SECTION */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Standee Visual */}
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

              {/* 3 Plans Selection */}
              <div className="lg:col-span-7 space-y-3">
                
                {/* PLAN 1 */}
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

                {/* PLAN 2 */}
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

                {/* PLAN 3 */}
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
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 text-[10px] font-bold">
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

                {/* PLAN 4: Franchise & Multi-Location Custom Plan */}
                <div 
                  onClick={() => setSelectedPlan("franchise_custom")}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
                    selectedPlan === "franchise_custom"
                      ? "border-amber-500 bg-amber-500/10 shadow-md"
                      : "border-surface-variant/40 bg-surface-container-low hover:border-surface-variant"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="standee_plan"
                      checked={selectedPlan === "franchise_custom"}
                      onChange={() => setSelectedPlan("franchise_custom")}
                      className="mt-1 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline font-bold text-sm text-on-surface">
                          Plan 4 — Franchise &amp; Multi-Location Custom Plan
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-[10px] font-bold">
                          Multi-Branch Fleet
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Custom hardware fleet for franchise chains, multi-location restaurants, retail outlets &amp; clinics. Generate unique QR codes &amp; separate Google review links for each counter.
                      </p>
                      <span className="text-[11px] text-amber-600 font-bold block mt-1">
                        ✓ Custom Standee Count + Multiple QR Engine + Centralized Master Dashboard
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 sm:pl-4">
                    <span className="font-headline font-black text-xl text-on-surface">Custom Quotation</span>
                    <span className="text-[10px] text-on-surface-variant block">Volume Discount Applied</span>
                  </div>
                </div>

              </div>
            </div>

            {/* FRANCHISE CUSTOM QUOTATION BUILDER vs SINGLE CHECKOUT */}
            {selectedPlan === "franchise_custom" ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container border-2 border-amber-500/40 shadow-lg space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/40">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline font-bold text-lg text-on-surface">
                          Franchise &amp; Multi-Outlet Custom Quotation Builder
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-bold">
                          Bulk Fleet Plan
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Configure your franchise network specifications. Generates a formal quotation request saved directly into the <strong>Admin Master Quotation Hub</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitQuotation} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Branches & Standees Counters */}
                    <div className="p-4 rounded-2xl bg-surface border border-surface-variant/50 space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-on-surface">Number of Branches / Outlets</label>
                          <span className="text-xs font-mono font-bold text-amber-600">{quoteBranches} Branches</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setQuoteBranches(Math.max(2, quoteBranches - 1))}
                            className="w-9 h-9 rounded-xl bg-surface-container border border-surface-variant/60 font-bold text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={2}
                            max={100}
                            value={quoteBranches}
                            onChange={(e) => setQuoteBranches(Math.max(2, parseInt(e.target.value) || 2))}
                            className="flex-1 py-2 text-center rounded-xl bg-surface border border-surface-variant/50 font-headline font-bold text-base text-on-surface focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setQuoteBranches(quoteBranches + 1)}
                            className="w-9 h-9 rounded-xl bg-surface-container border border-surface-variant/60 font-bold text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] text-on-surface-variant mt-1 block">
                          Each branch can have its own customized Google review assistant and separate Google listing link.
                        </span>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-on-surface">Total Hardware Standees Required</label>
                          <span className="text-xs font-mono font-bold text-amber-600">{quoteStandees} Standees</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setQuoteStandees(Math.max(2, quoteStandees - 1))}
                            className="w-9 h-9 rounded-xl bg-surface-container border border-surface-variant/60 font-bold text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={2}
                            max={250}
                            value={quoteStandees}
                            onChange={(e) => setQuoteStandees(Math.max(2, parseInt(e.target.value) || 2))}
                            className="flex-1 py-2 text-center rounded-xl bg-surface border border-surface-variant/50 font-headline font-bold text-base text-on-surface focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setQuoteStandees(quoteStandees + 1)}
                            className="w-9 h-9 rounded-xl bg-surface-container border border-surface-variant/60 font-bold text-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] text-on-surface-variant mt-1 block">
                          Recommendation: 2 standees per branch (e.g. billing counter + waiting lounge).
                        </span>
                      </div>

                      {/* Hardware Material Choice */}
                      <div>
                        <label className="text-xs font-bold text-on-surface block mb-1">Hardware Material Finish</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setQuoteHardware("matte_obsidian")}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              quoteHardware === "matte_obsidian"
                                ? "border-amber-500 bg-amber-500/10 font-bold text-on-surface"
                                : "border-surface-variant/40 bg-surface text-on-surface-variant hover:border-surface-variant"
                            }`}
                          >
                            <span className="text-xs block">Matte Acrylic</span>
                            <span className="text-[10px] text-zinc-500">Black Obsidian</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuoteHardware("laser_wood")}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              quoteHardware === "laser_wood"
                                ? "border-amber-500 bg-amber-500/10 font-bold text-on-surface"
                                : "border-surface-variant/40 bg-surface text-on-surface-variant hover:border-surface-variant"
                            }`}
                          >
                            <span className="text-xs block">Laser Wood</span>
                            <span className="text-[10px] text-zinc-500">Rich Walnut</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuoteHardware("card_and_standee")}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              quoteHardware === "card_and_standee"
                                ? "border-amber-500 bg-amber-500/10 font-bold text-on-surface"
                                : "border-surface-variant/40 bg-surface text-on-surface-variant hover:border-surface-variant"
                            }`}
                          >
                            <span className="text-xs block">Hybrid Fleet</span>
                            <span className="text-[10px] text-zinc-500">Standee + Cards</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Multi-QR & Addons Checklist */}
                    <div className="p-4 rounded-2xl bg-surface border border-surface-variant/50 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-on-surface block mb-1">Multi-QR Architecture</label>
                        <div 
                          onClick={() => setQuoteMultipleQr(!quoteMultipleQr)}
                          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={quoteMultipleQr}
                            onChange={(e) => setQuoteMultipleQr(e.target.checked)}
                            className="mt-0.5 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-on-surface block">
                              Generate Unique QR &amp; Assistant Page for Each Branch Counter
                            </span>
                            <span className="text-[11px] text-on-surface-variant mt-0.5 block leading-relaxed">
                              Each physical standee routes customers to the respective branch&apos;s specific Google Maps listing and staff reporting channel.
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-on-surface block mb-2">Franchise Enterprise Add-ons</label>
                        <div className="space-y-2">
                          {[
                            { name: "Unique QR per Branch Counter", desc: "Separate QR slugs & destinations for each store" },
                            { name: "Auto Google Review Reply AI", desc: "24/7 intelligent automatic responses to every Google review" },
                            { name: "Centralized Multi-Outlet Dashboard", desc: "Unified analytics table comparing branch conversion rates" },
                            { name: "Custom Laser Logo Engraving", desc: "High-precision CNC laser etching of franchise brand emblem" },
                            { name: "Priority Multi-Location Logistics", desc: "Split-shipment courier delivery across multiple city addresses" }
                          ].map((addon) => {
                            const checked = quoteAddons.includes(addon.name);
                            return (
                              <div
                                key={addon.name}
                                onClick={() => handleToggleAddon(addon.name)}
                                className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                                  checked
                                    ? "bg-surface-container-high border-amber-500/60"
                                    : "bg-surface border-surface-variant/40 hover:border-surface-variant"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleToggleAddon(addon.name)}
                                  className="mt-0.5 text-amber-500 rounded"
                                />
                                <div className="text-xs">
                                  <span className="font-semibold text-on-surface block">{addon.name}</span>
                                  <span className="text-[10px] text-on-surface-variant">{addon.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Contact & Branch Notes Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">Contact Person Name *</label>
                      <input
                        type="text"
                        required
                        value={quoteContactName}
                        onChange={(e) => setQuoteContactName(e.target.value)}
                        placeholder="e.g. Ramesh Patel (Franchise Owner)"
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">Direct Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={quotePhone}
                        onChange={(e) => setQuotePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">Headquarters City / Cities</label>
                      <input
                        type="text"
                        value={formCity || displayBusiness.city || ""}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="e.g. Ahmedabad & Surat"
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Branch Addresses & Notes */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Branch Names, Locations &amp; Specific QR Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="e.g. Branch 1: Sindhu Bhavan Road (2 Standees), Branch 2: Vastrapur (2 Standees), Branch 3: Maninagar (2 Standees). We have 3 different Google Business listings to link."
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none resize-none"
                    />
                  </div>

                  {/* Real-time Estimated Quotation Summary */}
                  <div className="p-5 rounded-2xl bg-surface border border-amber-500/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-600 block">
                          Estimated Volume Pricing Summary
                        </span>
                        <div className="flex flex-wrap items-center gap-4 mt-1 text-xs">
                          <span>
                            Hardware ({quoteStandees} Standees): <strong className="text-on-surface">₹{(quoteStandees * 1200).toLocaleString("en-IN")}</strong> <span className="text-[10px] text-zinc-400">(₹1,200/unit bulk discount)</span>
                          </span>
                          <span>•</span>
                          <span>
                            Monthly Cloud &amp; AI: <strong className="text-on-surface">₹{(quoteBranches * 800).toLocaleString("en-IN")}/mo</strong> <span className="text-[10px] text-zinc-400">(₹800/branch)</span>
                          </span>
                          <span>•</span>
                          <span>
                            Courier Handling: <strong className="text-on-surface">₹{(quoteBranches * 69).toLocaleString("en-IN")}</strong>
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1">
                          Final quotation will be formally reviewed and confirmed by the ZenTap Admin Team with sample proofs before dispatch.
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        <button
                          type="submit"
                          disabled={quoteSubmitting}
                          className="w-full md:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          <span>{quoteSubmitting ? "Generating Quotation..." : "Submit Franchise Quotation Request"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Submitted Quotation Card Notification */}
                {quoteSubmittedRecord && (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-on-surface">
                            Quotation Request {quoteSubmittedRecord.id} Dispatched to Admin!
                          </h5>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-bold">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          Saved to ZenTap Admin Master Quotations Hub for {quoteSubmittedRecord.branch_count} branches &amp; {quoteSubmittedRecord.standee_count} standees. An enterprise specialist will contact you with custom QR mockups.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`https://wa.me/918140417772?text=Hello%20ZenTap%20Team,%20I%20have%20submitted%20Franchise%20Quotation%20${quoteSubmittedRecord.id}%20for%20${encodeURIComponent(quoteSubmittedRecord.business_name)}.%20Please%20review.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* Courier Breakdown & Checkout for Single Plans (1, 2, 3) */
              <div className="p-5 rounded-2xl bg-surface-container border border-surface-variant/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
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

                  <div className="p-4 rounded-xl bg-surface border border-surface-variant/40 space-y-2">
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>Hardware Base Price:</span>
                      <span className="font-bold text-on-surface">₹{basePlanPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>Courier &amp; Transit Insurance:</span>
                      <span className="font-bold text-on-surface">₹{courierData.amount}</span>
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
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{grandTotal} &amp; Dispatch to Production</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Display Previous Submitted Franchise Quotations If Any */}
            {displayQuotations.length > 0 && (
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-500" />
                    <h4 className="font-headline font-bold text-xs text-on-surface">
                      Your Submitted Franchise Quotation Requests ({displayQuotations.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    Stored in Admin Master Hub
                  </span>
                </div>

                <div className="space-y-2">
                  {displayQuotations.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-surface border border-surface-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-600">{q.id}</span>
                          <span className="text-on-surface font-semibold">{q.business_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            q.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-700"
                              : q.status === "quote_sent"
                              ? "bg-blue-500/20 text-blue-700"
                              : q.status === "contacted"
                              ? "bg-purple-500/20 text-purple-700"
                              : "bg-amber-500/20 text-amber-700"
                          }`}>
                            {q.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {q.branch_count} Branches • {q.standee_count} Standees • {q.multiple_qr ? "Individual Multi-QRs" : "Single QR"} • Hardware Est: ₹{q.estimated_hardware_total?.toLocaleString("en-IN")} • Submitted: {new Date(q.at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/918140417772?text=Hello%20ZenTap%20Team,%20inquiry%20regarding%20franchise%20quotation%20${q.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high border border-surface-variant/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-500" />
                          <span>WhatsApp Admin</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: CURRENT PLAN INFORMATION & ACTIVE/DEACTIVATE CONTROLS          */}
      {/* ========================================================================= */}
      {portalSubTab === "plan" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/30">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <h3 className="font-headline font-bold text-xl text-on-surface">
                    Current Hardware Plan &amp; Controls
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  View your current subscription tier, manage live status, or upgrade hardware touchpoints.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  displayBusiness.active 
                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" 
                    : "bg-zinc-500/15 text-zinc-600 border-zinc-500/30"
                }`}>
                  {displayBusiness.active ? "● Live & Active" : "○ Deactivated / Paused"}
                </span>
              </div>
            </div>

            {/* Plan Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Hardware Tier</span>
                <span className="font-bold text-sm text-on-surface mt-1 block">
                  {displayBusiness.plan ? planTitles[displayBusiness.plan] : "Normal Smart NFC Review Card"}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  Embedded NTAG216 (13.56MHz)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Billing Status</span>
                <span className="font-bold text-sm text-on-surface mt-1 block">
                  {displayBusiness.payment_status === "paid" ? "Subscribed & Paid" : "Trial / Setup Mode"}
                </span>
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  {displayBusiness.plan === "card_500" ? "₹0 / month recurring" : "₹1,000 / month recurring"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Touchpoint Control</span>
                  <span className="text-xs text-on-surface-variant mt-0.5 block">
                    Temporarily pause or resume customer review routing.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleActiveState}
                  className={`mt-3 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    displayBusiness.active 
                      ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200" 
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{displayBusiness.active ? "Deactivate Assistant" : "Activate Assistant"}</span>
                </button>
              </div>
            </div>

            {/* Quick Upgrade & Franchise Custom Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Standard Hardware &amp; Replacements</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Order additional single counter standees or upgrade to the 24/7 AI review auto-reply engine.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlan("standee_1500");
                    setPortalSubTab("orders");
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 self-start cursor-pointer shadow-sm"
                >
                  View Hardware Plans
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <h4 className="font-bold text-xs text-on-surface">Franchise &amp; Multi-Outlet Custom Plan</h4>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Need multiple unique QR codes for separate branches/counters? Get volume pricing &amp; enterprise dashboard.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlan("franchise_custom");
                    setPortalSubTab("orders");
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold self-start cursor-pointer shadow-sm"
                >
                  Configure Franchise Quotation
                </button>
              </div>
            </div>
          </div>

          {/* Private Feedbacks Inbox */}
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

          {/* Account Password & Security */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-secondary" />
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Account Password &amp; Security Settings
                </h3>
              </div>
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
                  <label className="block text-xs font-bold text-on-surface mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={passwordUpdating}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {passwordUpdating ? "Updating..." : "Update Account Password"}
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
      )}

      {/* Razorpay Interactive Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        planId={selectedPlan}
        businessId={business.id}
        businessName={formName || business.name || "My Business"}
        customerEmail={formEmail || business.email || (user?.email || "")}
        customerPhone={formPhone || business.phone || ""}
        pincode={formPincode || business.pincode || "380001"}
        shippingAddress={formAddress || business.address || ""}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
