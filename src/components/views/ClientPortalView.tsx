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
  FileCheck,
  Plus,
  Trash2,
  Eye
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
  fetchDbFeedbacks
} from "@/lib/supabase/service";
import StandeeVisual from "@/components/StandeeVisuals";
import RazorpayCheckoutModal from "@/components/modals/RazorpayCheckoutModal";

interface ClientPortalViewProps {
  initialPlan?: "card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom" | null;
  onTriggerTapSimulator?: () => void;
  onOpenAuthModal?: (tab: "signin" | "signup") => void;
  onOpenUpcomingDrawer?: () => void;
}

export default function ClientPortalView({ 
  initialPlan,
  onOpenAuthModal, 
}: ClientPortalViewProps) {
  const { user, updateUserPassword, resetPasswordForEmail } = useAuth();

  // Top Tab State: "live" (User's real isolated profile) vs "sample" (Sample showcase preview)
  const [dashboardTab, setDashboardTab] = useState<"live" | "sample">("live");

  // Navigation Sub-Tabs under My Live Business Analytics:
  // 1: dashboard (Analytics Dashboard - Blurry if unpaid)
  // 2: edit_details (Edit Business Profile)
  // 3: link_gbp (Link Business Profile - Optional)
  // 4: custom_categories (Customize Review Categories "What did you like most?")
  // 5: assistant_qr (Review Assistant & QR Hub)
  // 6: orders (Standee Order & Status)
  // 7: plan (Current Plan & Controls)
  const [portalSubTab, setPortalSubTab] = useState<
    "dashboard" | "edit_details" | "link_gbp" | "custom_categories" | "assistant_qr" | "orders" | "plan"
  >("dashboard");

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
  const [formCategory, setFormCategory] = useState("");
  const [formGbp, setFormGbp] = useState("");
  const [formReviewUrl, setFormReviewUrl] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formCountry, setFormCountry] = useState("India");
  const [formPincode, setFormPincode] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");

  // Custom Review Categories ("What did you like most?") State
  const [customChipsList, setCustomChipsList] = useState<string[]>([]);
  const [newChipInput, setNewChipInput] = useState("");

  // Buy Standee & Custom Plan State
  const [selectedPlan, setSelectedPlan] = useState<"card_500" | "standee_1500" | "standee_auto_2000" | "franchise_custom">("standee_1500");
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
  const [quoteSubmitting, setQuoteSubmitting] = useState<boolean>(false);

  // In-Dashboard Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Sample data constants for preview mode (ZenTap.in Digital Solutions Showcase)
  const SAMPLE_ANALYTICS = {
    totalScans: 1428,
    nfcScans: 1114,
    qrScans: 314,
    reviewClicks: 382,
    privateFeedbackCount: 14,
    starsCount: { 5: 320, 4: 62, 3: 18, 2: 9, 1: 5 },
    scansPerDay: [48, 54, 38, 62, 70, 85, 92],
  };

  // Preselect plan and navigate to order tab when routed from landing page / pricing CTA
  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
      setDashboardTab("live");
      setPortalSubTab("orders");
    }
  }, [initialPlan]);

  useEffect(() => {
    async function loadData() {
      if (user) {
        // Fast local load for this isolated user (synced with Admin Master Table)
        const b = getUserBusiness(user.id, user.email || "", user.user_metadata?.business_name);
        setBusiness(b);
        populateForm(b);
        setCustomChipsList(b.custom_chips || [
          "Instant NFC Phone Tap",
          "Fast 5-Star Reviews",
          "Laser-Engraved Standee Quality",
          "Prompt Customer Support",
          "Polite & Helpful Staff",
          "Fair & Transparent Pricing"
        ]);
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
              custom_chips: b.custom_chips || undefined,
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
        // Guest mode default to sample showcase (ZenTap.in)
        setBusiness(SAMPLE_DEMO_BUSINESS);
        populateForm(SAMPLE_DEMO_BUSINESS);
        setCustomChipsList(SAMPLE_DEMO_BUSINESS.custom_chips || []);
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

  // Determine if merchant has paid for a standee / has active subscription
  const isPaid = displayBusiness.payment_status === "paid" || orders.length > 0 || isSample;

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
    setFormCategory(b.category || "");
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
  // TAB 3: Link Business Profile & Google Review URL
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
      category: formCategory.trim() || business.category,
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
  // TAB 4: Customize Review Categories ("What did you like most?")
  // -------------------------------------------------------------
  const handleAddCustomChip = () => {
    if (!newChipInput.trim()) return;
    if (customChipsList.includes(newChipInput.trim())) {
      showToast("This category is already added.");
      return;
    }
    const updated = [...customChipsList, newChipInput.trim()];
    setCustomChipsList(updated);
    setNewChipInput("");
  };

  const handleRemoveCustomChip = (chipToRemove: string) => {
    setCustomChipsList((prev) => prev.filter((c) => c !== chipToRemove));
  };

  const handleResetDefaultChips = () => {
    const defaults = [
      "Top Quality Service",
      "Polite & Courteous Staff",
      "Fair & Transparent Pricing",
      "Fast & Attentive Service",
      "Superb Ambience & Cleanliness",
      "Highly Recommended Experience",
    ];
    setCustomChipsList(defaults);
    showToast("Reset to recommended review categories.");
  };

  const handleSaveCustomChips = () => {
    if (customChipsList.length === 0) {
      showToast("Please keep at least 1 category chip.");
      return;
    }

    const updates = { custom_chips: customChipsList };
    if (user) {
      const updated = updateUserBusiness(user.id, updates);
      setBusiness(updated);
    } else {
      setBusiness((prev) => ({ ...prev, ...updates }));
    }
    showToast("✓ 'What did you like most?' categories updated! Live on your review page.");
  };

  // -------------------------------------------------------------
  // Toggle Active / Deactivate Business Assistant
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
  const handlePaymentSuccess = () => {
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
  const zentapSampleUrl = `${originUrl}/r/zentap?preview=1`;

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
            <span>Sample Showcase Mode (ZenTap.in Digital Solutions)</span>
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
                This is a live preview of the official ZenTap.in showcase (*ZenTap.in Digital Solutions*). Once you order your physical standee and connect your Google Review link, you will see your own customer NFC taps, Level Q QR scans, ~88% review conversions, and BlueDart delivery tracking!
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
      {/* 2. MAIN HEADER BANNER (WITH BUY STANDEE & SAMPLE ZENTAP.IN REVIEW PAGE)   */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-br from-[#1C1B1A] via-[#2A2928] to-[#1C1B1A] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-[#3A3836] shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D94826] to-[#E68A00] text-white flex items-center justify-center font-headline font-black text-2xl shadow-xl border border-white/20 flex-shrink-0">
            {displayBusiness.name ? displayBusiness.name[0].toUpperCase() : "Z"}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border flex items-center gap-1 ${
                isPaid 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                  : "bg-zinc-700/50 text-zinc-300 border-zinc-600"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-400" : "bg-zinc-400"}`} />
                {isPaid ? "Subscribed & Active" : "No Active Standee Plan"}
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

        {/* Dedicated Header Action Box (Beside Business Name) */}
        <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md relative z-10">
          
          {/* Action 1: Buy / Order Standee */}
          <button
            onClick={() => setPortalSubTab("orders")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D94826] to-[#E68A00] hover:brightness-110 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buy / Order Standee</span>
          </button>

          {/* Action 2: Sample ZenTap.in Review Page */}
          <a
            href={zentapSampleUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 text-xs font-bold text-secondary shadow-sm transition-all cursor-pointer"
            title="Open ZenTap.in official sample review page"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Sample ZenTap.in Review Page</span>
          </a>

          {/* Action 3: Test Customer Flow */}
          <a
            href={`${assistantUrl}?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
            <span>Test Customer Flow</span>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. THE 7 HORIZONTAL NAVIGATION TABS (LEFT SIDE ONE BY ONE)                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* Left Side: Horizontal Navigation Tabs Stacked One by One */}
        <nav className="w-full lg:w-80 flex-shrink-0 space-y-3 lg:sticky lg:top-20 z-10" aria-label="Dashboard Navigation">
          <div className="p-2.5 sm:p-3 rounded-3xl bg-surface-container border border-surface-variant/40 shadow-sm space-y-2">
            <div className="px-3 pt-1 pb-1 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold flex items-center justify-between">
              <span>Navigation Tabs</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-variant/50 text-on-surface-variant font-semibold">7 Sections</span>
            </div>

            {/* 1. Dashboard (Analytics) */}
            <button
              onClick={() => setPortalSubTab("dashboard")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                portalSubTab === "dashboard"
                  ? "bg-[#1C1B1A] text-white shadow-md border-white/20 ring-1 ring-white/10"
                  : "bg-surface-container-low hover:bg-surface border-surface-variant/30 text-on-surface hover:border-surface-variant/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  portalSubTab === "dashboard" ? "bg-white/15 text-white" : "bg-emerald-500/15 text-emerald-600"
                }`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-xs font-bold truncate">1. Dashboard</span>
                    {!isPaid && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 font-bold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <span className={`block text-[10px] truncate ${portalSubTab === "dashboard" ? "text-zinc-300" : "text-on-surface-variant"}`}>
                    NFC / QR Telemetry &amp; Growth
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                portalSubTab === "dashboard" ? "text-white translate-x-0.5" : "text-on-surface-variant/40"
              }`} />
            </button>

            {/* 2. Edit Business Profile */}
            <button
              onClick={() => setPortalSubTab("edit_details")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                portalSubTab === "edit_details"
                  ? "bg-[#1C1B1A] text-white shadow-md border-white/20 ring-1 ring-white/10"
                  : "bg-surface-container-low hover:bg-surface border-surface-variant/30 text-on-surface hover:border-surface-variant/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  portalSubTab === "edit_details" ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold truncate">2. Edit Business Profile</span>
                  <span className={`block text-[10px] truncate ${portalSubTab === "edit_details" ? "text-zinc-300" : "text-on-surface-variant"}`}>
                    Store Name, Category &amp; Address
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                portalSubTab === "edit_details" ? "text-white translate-x-0.5" : "text-on-surface-variant/40"
              }`} />
            </button>

            {/* 3. Link Business Profile (Optional) */}
            <button
              onClick={() => setPortalSubTab("link_gbp")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                portalSubTab === "link_gbp"
                  ? "bg-[#1C1B1A] text-white shadow-md border-white/20 ring-1 ring-white/10"
                  : "bg-surface-container-low hover:bg-surface border-surface-variant/30 text-on-surface hover:border-surface-variant/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  portalSubTab === "link_gbp" ? "bg-white/15 text-white" : "bg-secondary/15 text-secondary"
                }`}>
                  <Star className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-xs font-bold truncate">3. Link Business Profile</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      portalSubTab === "link_gbp" ? "bg-white/20 text-white" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    }`}>
                      Optional
                    </span>
                  </div>
                  <span className={`block text-[10px] truncate ${portalSubTab === "link_gbp" ? "text-zinc-300" : "text-on-surface-variant"}`}>
                    Google Review Destination Link
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                portalSubTab === "link_gbp" ? "text-white translate-x-0.5" : "text-on-surface-variant/40"
              }`} />
            </button>

            {/* 4. Customize Review Categories ("What did you like most?") */}
            <button
              onClick={() => setPortalSubTab("custom_categories")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                portalSubTab === "custom_categories"
                  ? "bg-[#1C1B1A] text-white shadow-md border-white/20 ring-1 ring-white/10"
                  : "bg-surface-container-low hover:bg-surface border-surface-variant/30 text-on-surface hover:border-surface-variant/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  portalSubTab === "custom_categories" ? "bg-white/15 text-white" : "bg-amber-500/15 text-amber-600"
                }`}>
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-xs font-bold truncate">4. Review Categories</span>
                    {!isPaid ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 font-bold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        <span>After Paid</span>
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 font-bold">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className={`block text-[10px] truncate ${portalSubTab === "custom_categories" ? "text-zinc-300" : "text-on-surface-variant"}`}>
                    &quot;What did you like most?&quot;
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                portalSubTab === "custom_categories" ? "text-white translate-x-0.5" : "text-on-surface-variant/40"
              }`} />
            </button>

            {/* 5. Review Assistant & QR Hub */}
            <button
              onClick={() => setPortalSubTab("assistant_qr")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                portalSubTab === "assistant_qr"
                  ? "bg-[#1C1B1A] text-white shadow-md border-white/20 ring-1 ring-white/10"
                  : "bg-surface-container-low hover:bg-surface border-surface-variant/30 text-on-surface hover:border-surface-variant/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  portalSubTab === "assistant_qr" ? "bg-white/15 text-white" : "bg-emerald-500/15 text-emerald-600"
                }`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold truncate">5. Review Assistant &amp; QR Hub</span>
                  <span className={`block text-[10px] truncate ${portalSubTab === "assistant_qr" ? "text-zinc-300" : "text-on-surface-variant"}`}>
                    Your /r/{displayBusiness.slug || "link"} &amp; Laser QR
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                portalSubTab === "assistant_qr" ? "text-white translate-x-0.5" : "text-on-surface-variant/40"
              }`} />
            </button>

            {/* 6. Standee Order & Status */}
            <button
              onClick={() => setPortalSubTab("orders")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                portalSubTab === "orders"
                  ? "bg-[#1C1B1A] text-white shadow-md border-white/20 ring-1 ring-white/10"
                  : "bg-surface-container-low hover:bg-surface border-surface-variant/30 text-on-surface hover:border-surface-variant/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  portalSubTab === "orders" ? "bg-white/15 text-white" : "bg-blue-500/15 text-blue-600"
                }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-xs font-bold truncate">6. Standee Order &amp; Status</span>
                    {(orderSuccess || displayOrders.length > 0) ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 text-[9px] font-bold">
                        Active Order
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 text-[9px] font-bold">
                        Pending
                      </span>
                    )}
                  </div>
                  <span className={`block text-[10px] truncate ${portalSubTab === "orders" ? "text-zinc-300" : "text-on-surface-variant"}`}>
                    Dispatch Tracking &amp; Buy Standee
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                portalSubTab === "orders" ? "text-white translate-x-0.5" : "text-on-surface-variant/40"
              }`} />
            </button>

            {/* 7. Current Plan & Controls */}
            <button
              onClick={() => setPortalSubTab("plan")}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                portalSubTab === "plan"
                  ? "bg-[#1C1B1A] text-white shadow-md border-white/20 ring-1 ring-white/10"
                  : "bg-surface-container-low hover:bg-surface border-surface-variant/30 text-on-surface hover:border-surface-variant/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  portalSubTab === "plan" ? "bg-white/15 text-white" : "bg-purple-500/15 text-purple-600"
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-xs font-bold truncate">7. Current Plan &amp; Controls</span>
                    {!isPaid && (
                      <span className="px-1.5 py-0.2 rounded-full bg-zinc-400/20 text-zinc-600 text-[9px] font-bold">
                        No Active Plan
                      </span>
                    )}
                  </div>
                  <span className={`block text-[10px] truncate ${portalSubTab === "plan" ? "text-zinc-300" : "text-on-surface-variant"}`}>
                    Hardware Tier &amp; Touchpoint State
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                portalSubTab === "plan" ? "text-white translate-x-0.5" : "text-on-surface-variant/40"
              }`} />
            </button>
          </div>

          {/* Direct WhatsApp Specialist Contact Card */}
          <div className="p-4 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-on-surface">Merchant WhatsApp Support</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Have questions regarding your standee engraving or Google Review destination?
            </p>
            <a
              href="https://wa.me/919274560880?text=Hello%20ZenTap%20Team,%20I%20need%20assistance%20with%20my%20merchant%20account."
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat +91 92745 60880</span>
            </a>
          </div>
        </nav>

        {/* Right Main Content Area */}
        <div className="flex-1 min-w-0 w-full space-y-6">

          {/* ========================================================================= */}
          {/* SUB-TAB 1: DASHBOARD (ANALYTICS - LOCKED & BLURRY IF NOT PAID)            */}
          {/* ========================================================================= */}
          {portalSubTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-200 relative">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <span>Customer Tap &amp; Scan Telemetry Dashboard</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Live telemetry tracking NFC phone taps, QR camera scans, and Google Review conversion rates.
                  </p>
                </div>

                {isPaid && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSimulateScan("nfc")}
                      className="px-3.5 py-1.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40"
                    >
                      <Radio className="w-3.5 h-3.5 text-secondary" />
                      <span>+ Test NFC Tap</span>
                    </button>
                    <button
                      onClick={() => handleSimulateScan("qr")}
                      className="px-3.5 py-1.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer shadow-sm border border-surface-variant/40"
                    >
                      <QrCode className="w-3.5 h-3.5 text-secondary" />
                      <span>+ Test QR Scan</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Wrapper: If NOT paid, show blurry & locked overlay */}
              <div className="relative">
                
                {/* Locked Glass Overlay if unpaid */}
                {!isPaid && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-md rounded-3xl border border-white/20 text-center animate-in fade-in">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D94826] to-[#E68A00] text-white flex items-center justify-center shadow-2xl mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2 border border-amber-500/30">
                      Locked Feature
                    </span>
                    <h3 className="font-headline font-black text-2xl text-white mb-2 max-w-md">
                      Analytics Dashboard Locked Until Standee Order
                    </h3>
                    <p className="text-xs text-gray-300 max-w-md leading-relaxed mb-6">
                      Real-time guest NFC telemetry, Google Review conversion metrics, and daily tap charts are unlocked automatically once you purchase your physical counter standee.
                    </p>
                    <button
                      onClick={() => setPortalSubTab("orders")}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D94826] via-[#E68A00] to-[#D94826] hover:brightness-110 text-white font-headline font-black text-sm tracking-wide shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Buy / Order Standee to Unlock</span>
                    </button>
                  </div>
                )}

                {/* The Analytics Visuals (Blurred if unpaid) */}
                <div className={`space-y-6 ${!isPaid ? "filter blur-[3px] select-none pointer-events-none opacity-60" : ""}`}>
                  
                  {/* Stat Cards Grid */}
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

                    {/* Stars Distribution */}
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

                  {/* Visual Growth Chart */}
                  <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-headline font-bold text-sm text-on-surface">
                          Weekly Tap Activity &amp; Google Review Velocity
                        </h4>
                        <p className="text-[11px] text-on-surface-variant">
                          Telemetry across the last 7 business days.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+28% Review Lift</span>
                      </span>
                    </div>

                    {/* Daily Bar Visualization */}
                    <div className="grid grid-cols-7 gap-2 pt-4 items-end h-36 border-b border-surface-variant/30 pb-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                        const val = displayAnalytics.scansPerDay[idx] || (idx * 12 + 25);
                        const pct = Math.min(100, Math.max(15, (val / 100) * 100));
                        return (
                          <div key={day} className="flex flex-col items-center gap-1 h-full justify-end">
                            <span className="text-[9px] font-mono text-on-surface-variant font-bold">{val}</span>
                            <div className="w-full bg-surface-variant/30 rounded-t-xl h-full flex items-end overflow-hidden max-w-[40px]">
                              <div 
                                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all"
                                style={{ height: `${pct}%` }} 
                              />
                            </div>
                            <span className="text-[10px] font-medium text-on-surface-variant">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 2: EDIT BUSINESS DETAILS (NAME, CATEGORY, PHONE, CITY, ADDRESS)   */}
          {/* ========================================================================= */}
          {portalSubTab === "edit_details" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="font-headline font-bold text-xl text-on-surface">
                      2. Edit Business Profile &amp; Contact Information
                    </h3>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Update your business identity, store category, and contact details. Automatically synced with the <strong>Admin Master Table</strong>.
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

                  {/* Business Category */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Business Category / Industry *
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Fine Dining Restaurant / Gold Jewellery"
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
                      placeholder="+91 92745 60880"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Owner Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="owner@yourstore.com"
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
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="e.g. Gujarat"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Delivery Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={formPincode}
                      onChange={(e) => setFormPincode(e.target.value)}
                      placeholder="e.g. 380001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                    />
                  </div>

                  {/* Physical Address */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Store Physical Address (Courier Delivery)
                    </label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="Shop 12-14, Commercial Complex, Main Road"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Business Details</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 3: LINK BUSINESS PROFILE (OPTIONAL)                               */}
          {/* ========================================================================= */}
          {portalSubTab === "link_gbp" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-secondary" />
                    <h3 className="font-headline font-bold text-xl text-on-surface">
                      3. Link Business Profile &amp; Google Review Destination
                    </h3>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Connecting your Google Review link is <strong>optional</strong> during registration. Once provided, customer NFC taps route straight to your Google review box.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 text-xs font-bold self-start sm:self-auto">
                  Not Mandatory
                </span>
              </div>

              <form onSubmit={handleSaveGbpLink} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Google Review URL (Direct &quot;Write a Review&quot; Link)
                  </label>
                  <input
                    type="url"
                    value={formReviewUrl}
                    onChange={(e) => setFormReviewUrl(e.target.value)}
                    placeholder="https://g.page/r/.../review or https://maps.app.goo.gl/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                  />
                  <span className="text-[11px] text-on-surface-variant mt-1 block">
                    Example: Get this from your Google Business Profile &gt; &quot;Ask for reviews&quot; button.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Google Maps Business Listing URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formGbp}
                    onChange={(e) => setFormGbp(e.target.value)}
                    placeholder="https://maps.google.com/?q=your+business+name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
                  />
                  <span className="text-[11px] text-on-surface-variant mt-1 block">
                    Used for the &quot;Directions&quot; button on your customized customer landing page.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save &amp; Connect to Admin Master Table</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 4: CUSTOMIZE REVIEW CATEGORIES ("WHAT DID YOU LIKE MOST?")         */}
          {/* ========================================================================= */}
          {portalSubTab === "custom_categories" && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-6 animate-in fade-in duration-200 relative">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sliders className="w-5 h-5 text-amber-500" />
                    <h3 className="font-headline font-bold text-xl text-on-surface">
                      4. Customize Review Categories (&quot;What did you like most?&quot;)
                    </h3>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Customize the quick tags your patrons see on their phone screen when tapping your NFC standee. These tags dynamically feed our AI review writer.
                  </p>
                </div>

                {isPaid ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-xs self-start sm:self-auto">
                    ✓ Unlocked Feature
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 font-bold text-xs flex items-center gap-1 self-start sm:self-auto">
                    <Lock className="w-3 h-3" />
                    <span>Unlocked Once Standee Ordered</span>
                  </span>
                )}
              </div>

              {/* Gated: If NOT paid, show locked overlay */}
              {!isPaid ? (
                <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h4 className="font-headline font-bold text-lg text-on-surface">
                    Custom Categories Unlocked Upon Standee Purchase
                  </h4>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                    Once you order your standee, you can create your own custom review questions and category tags (e.g. &quot;Bridal Collection&quot;, &quot;Woodfired Pizza&quot;, &quot;Express Billing&quot;) so customers leave keyword-rich Google reviews matching your exact specialties.
                  </p>
                  <button
                    onClick={() => setPortalSubTab("orders")}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-sm"
                  >
                    Buy Standee to Unlock
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Add New Category Chip */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 space-y-3">
                    <label className="block text-xs font-bold text-on-surface">
                      Add a New Review Category Tag
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChipInput}
                        onChange={(e) => setNewChipInput(e.target.value)}
                        placeholder="e.g. Prompt Customer Support, Fresh Ingredients..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomChip();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomChip}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Categories List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-on-surface">
                        Active Tags on Customer Page ({customChipsList.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleResetDefaultChips}
                        className="text-[11px] text-amber-700 hover:underline cursor-pointer"
                      >
                        Reset to Defaults
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {customChipsList.map((chip) => (
                        <div
                          key={chip}
                          className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-surface-variant/60 text-xs font-semibold text-on-surface flex items-center gap-2 shadow-sm"
                        >
                          <span>{chip}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomChip(chip)}
                            className="text-on-surface-variant hover:text-red-500 cursor-pointer p-0.5"
                            title="Remove tag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveCustomChips}
                      className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Categories to Live Page</span>
                    </button>
                    <a
                      href={`${assistantUrl}?preview=1`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer border border-surface-variant/40"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Live on Page</span>
                    </a>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 5: REVIEW ASSISTANT & QR HUB                                      */}
          {/* ========================================================================= */}
          {portalSubTab === "assistant_qr" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LIVE ASSISTANT URL & TEST FLOW */}
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span>Live Customer Touchpoint</span>
                  </div>

                  <h3 className="font-headline font-bold text-xl text-on-surface">
                    Your Customized Google Review Assistant
                  </h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    This is your unique store touchpoint link. When patrons tap your NFC standee or scan the QR code on your billing counter, they arrive at this customized page.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/50 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-on-surface truncate">
                      {assistantUrl}
                    </span>
                    <button
                      onClick={() => copyToClipboard(assistantUrl)}
                      className="p-2 rounded-xl bg-surface hover:bg-surface-container-high text-on-surface border border-surface-variant/40 cursor-pointer transition-colors flex-shrink-0"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={`${assistantUrl}?preview=1`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Test Customer Flow</span>
                    </a>
                    <button
                      onClick={() => setPortalSubTab("link_gbp")}
                      className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer border border-surface-variant/40"
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
                      <img src={qrDataUrl} alt="Standee Laser QR Code" className="w-44 h-44 rounded-lg" />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-xs text-gray-500">Generating QR...</div>
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
          {/* SUB-TAB 6: STANDEE ORDER & STATUS (4-STAGE VISUAL TRACKING)               */}
          {/* ========================================================================= */}
          {portalSubTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* 4-Stage Attractive Order Status */}
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
                            Standee Order Status: Confirmed &amp; In Production
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold border border-emerald-500/30">
                            Order Confirmed
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Your physical standee order has been confirmed. Below is your live 4-stage hardware dispatch timeline.
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

                  {/* The 4 Stages Timeline Requested by User */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    {/* Stage 1: Order Confirmed */}
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 space-y-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">
                        ✓
                      </div>
                      <h4 className="font-bold text-xs text-on-surface">1. Order Confirmed</h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Payment received &amp; verified automatically.
                      </p>
                    </div>

                    {/* Stage 2: Create your customized standee (QR/NFC) */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-1">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold mb-2 animate-pulse">
                        ⚡
                      </div>
                      <h4 className="font-bold text-xs text-on-surface">2. Creating Standee (QR/NFC)</h4>
                      <p className="text-[11px] text-on-surface-variant">
                        CNC laser engraving acrylic &amp; NTAG216 RF chip programming.
                      </p>
                    </div>

                    {/* Stage 3: Integration with ZenTap.in Smart Review Assistant */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/50 space-y-1">
                      <div className="w-7 h-7 rounded-full bg-surface-variant text-on-surface flex items-center justify-center text-xs font-bold mb-2">
                        3
                      </div>
                      <h4 className="font-bold text-xs text-on-surface">3. ZenTap.in Integration</h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Paired with your customized review assistant &amp; cloud router.
                      </p>
                    </div>

                    {/* Stage 4: Dispatched & In Transit */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/50 space-y-1">
                      <div className="w-7 h-7 rounded-full bg-surface-variant text-on-surface flex items-center justify-center text-xs font-bold mb-2">
                        4
                      </div>
                      <h4 className="font-bold text-xs text-on-surface">4. Dispatched</h4>
                      <p className="text-[11px] text-on-surface-variant">
                        BlueDart Air Cargo courier tracking assigned.
                      </p>
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
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-amber-500/40 shadow-sm relative overflow-hidden animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline font-bold text-lg text-on-surface">
                            Standee Order Status: No Active Order
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[10px] font-bold border border-amber-500/30">
                            Select Plan Below
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
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface">
                    Purchase Your Hardware Touchpoint
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Select your preferred hardware model to receive custom branded laser-cut hardware for your billing counter.
                  </p>
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

                  {/* 4 Plans Selection */}
                  <div className="lg:col-span-7 space-y-3">
                    
                    {/* PLAN 1 */}
                    <div 
                      onClick={() => setSelectedPlan("card_500")}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
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
                            Compact portable PVC card with NFC chip + laser QR code.
                          </p>
                          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                            ✓ One-Time Payment (Zero monthly recurring fees)
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 sm:pl-4">
                        <span className="font-headline font-black text-2xl text-on-surface">₹500</span>
                        <span className="text-[10px] text-on-surface-variant block">+ Courier</span>
                      </div>
                    </div>

                    {/* PLAN 2 */}
                    <div 
                      onClick={() => setSelectedPlan("standee_1500")}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
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
                            Customized designed acrylic standee matched to your business branding with AI draft writer.
                          </p>
                          <span className="text-[11px] text-secondary font-bold block mt-1">
                            ₹1,000 / month starting next month of purchase
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 sm:pl-4">
                        <span className="font-headline font-black text-2xl text-on-surface">₹1,500</span>
                        <span className="text-[10px] text-on-surface-variant block">+ Courier</span>
                      </div>
                    </div>

                    {/* PLAN 3 */}
                    <div 
                      onClick={() => setSelectedPlan("standee_auto_2000")}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
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
                            Custom acrylic standee PLUS AI automation engine that replies to every incoming Google review 24/7.
                          </p>
                          <span className="text-[11px] text-primary font-bold block mt-1">
                            ₹1,000 / month starting next month of purchase
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 sm:pl-4">
                        <span className="font-headline font-black text-2xl text-on-surface">₹2,000</span>
                        <span className="text-[10px] text-on-surface-variant block">+ Courier</span>
                      </div>
                    </div>

                    {/* PLAN 4: Franchise & Multi-Location Custom Plan */}
                    <div 
                      onClick={() => setSelectedPlan("franchise_custom")}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
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
                            Custom hardware fleet for franchise chains &amp; multi-outlet businesses. Generate multiple unique QR codes per counter.
                          </p>
                          <span className="text-[11px] text-amber-600 font-bold block mt-1">
                            ✓ Custom Standee Fleet + Multi-QR Engine + Quotation Saved to Admin
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 sm:pl-4">
                        <span className="font-headline font-black text-xl text-on-surface">Custom Quotation</span>
                        <span className="text-[10px] text-on-surface-variant block">Volume Discount</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* FRANCHISE CUSTOM BUILDER vs SINGLE CHECKOUT BUTTON */}
                {selectedPlan === "franchise_custom" ? (
                  <div className="p-6 rounded-3xl bg-surface border-2 border-amber-500/40 space-y-4">
                    <h4 className="font-headline font-bold text-base text-on-surface">
                      Franchise Multi-Outlet Quotation Request
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Need custom hardware standees across multiple branches? Submit your requirements and our fleet specialist will prepare your volume quotation.
                    </p>
                    <form onSubmit={handleSubmitQuotation} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-on-surface block mb-1">Number of Branches</label>
                          <input
                            type="number"
                            min={2}
                            value={quoteBranches}
                            onChange={(e) => setQuoteBranches(parseInt(e.target.value) || 2)}
                            className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-variant/50 text-xs text-on-surface"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-on-surface block mb-1">Number of Standees</label>
                          <input
                            type="number"
                            min={2}
                            value={quoteStandees}
                            onChange={(e) => setQuoteStandees(parseInt(e.target.value) || 2)}
                            className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-variant/50 text-xs text-on-surface"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={quoteSubmitting}
                          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-headline font-black text-xs cursor-pointer shadow-md transition-all"
                        >
                          {quoteSubmitting ? "Submitting..." : "Submit Franchise Quotation"}
                        </button>
                        <a
                          href="https://wa.me/919274560880?text=Hello%20ZenTap%20Team,%20I%20want%20a%20franchise%20custom%20quotation."
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Quote (+91 92745 60880)</span>
                        </a>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-on-surface block">
                        Selected: {planTitles[selectedPlan]}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Includes: Custom branded acrylic standee, NFC chip, Level Q Laser QR &amp; Express Shipping ({courierData.zone}).
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-on-surface-variant block">Total with Courier</span>
                        <span className="font-headline font-black text-xl text-primary">₹{grandTotal}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCheckoutModalOpen(true)}
                        className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-headline font-bold text-xs hover:bg-primary/90 flex items-center gap-2 cursor-pointer shadow-md transition-all"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Order Now with Razorpay</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 7: CURRENT PLAN INFORMATION & ACTIVE/DEACTIVATE CONTROLS          */}
          {/* ========================================================================= */}
          {portalSubTab === "plan" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* If user is not paid / no standee ordered: Show "No Active Plan" */}
              {!isPaid ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-500/15 border border-zinc-500/40 text-zinc-500 flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline font-bold text-xl text-on-surface">
                          Current Plan: No Active Plan
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-500/15 text-zinc-600 text-[10px] font-bold border border-zinc-500/30">
                          Inactive / Standee Required
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Your account currently does not have an active hardware standee plan. Choose a plan to activate live Google review routing and counter analytics.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-xs text-amber-900 dark:text-amber-300">
                      Select your preferred standee hardware (₹1,500 Auto Standee or ₹2,000 Auto Reply Engine) to activate your account.
                    </p>
                    <button
                      onClick={() => setPortalSubTab("orders")}
                      className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex-shrink-0 cursor-pointer shadow-sm"
                    >
                      Choose a Standee Plan
                    </button>
                  </div>
                </div>
              ) : (
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
                        {displayBusiness.plan ? planTitles[displayBusiness.plan] : "Auto Google Review Standee with NFC & QR"}
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
                </div>
              )}

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

        </div>
      </div>

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
