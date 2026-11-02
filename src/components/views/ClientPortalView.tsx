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
  Eye,
  Palette,
  Briefcase,
  Calendar,
  Globe,
  Instagram,
  MessageCircle,
  Bell,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Settings
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
  validateGoogleReviewUrl,
  LeadRecord,
  CustomCardDesign,
  getLeadsForBusiness,
  updateLeadStatus,
  deleteLeadRecord,
  SAMPLE_DEMO_LEADS,
  ProductPlan
} from "@/lib/businessStore";
import CardCustomizerModal from "@/components/CardCustomizerModal";
import { 
  fetchUserBusinessFromDb, 
  upsertUserBusinessInDb, 
  fetchDbOrders, 
  fetchDbFeedbacks
} from "@/lib/supabase/service";
import StandeeVisual from "@/components/StandeeVisuals";
import RazorpayCheckoutModal from "@/components/modals/RazorpayCheckoutModal";

interface ClientPortalViewProps {
  initialPlan?: ProductPlan | null;
  onTriggerTapSimulator?: () => void;
  onOpenAuthModal?: (tab: "signin" | "signup") => void;
  onNavigate?: (view: any) => void;
  onOpenUpcomingDrawer?: () => void;
}

export default function ClientPortalView({ 
  initialPlan,
  onOpenAuthModal, 
  onTriggerTapSimulator,
  onNavigate,
  onOpenUpcomingDrawer,
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
  
  type ClientPortalMenuItem = 
    | "dashboard"
    | "standees"
    | "reviews"
    | "profile"
    | "orders"
    | "upcoming"
    | "settings";

  const [activeMenu, setActiveMenu] = useState<ClientPortalMenuItem>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const [portalSubTab, setPortalSubTab] = useState<
    | "dashboard"
    | "dynamic_profile"
    | "leads"
    | "customizer"
    | "edit_details"
    | "link_gbp"
    | "custom_categories"
    | "assistant_qr"
    | "orders"
    | "plan"
  >("dashboard");

  const [business, setBusiness] = useState<BusinessRecord>(SAMPLE_DEMO_BUSINESS);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>(SAMPLE_DEMO_LEADS);
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | "new" | "contacted" | "closed">("all");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customDesign, setCustomDesign] = useState<CustomCardDesign | null>(null);

  // Dynamic Profile Form State
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formWhatsappMsg, setFormWhatsappMsg] = useState("");
  const [formBookingUrl, setFormBookingUrl] = useState("");
  const [formPortfolioUrl, setFormPortfolioUrl] = useState("");
  const [formInstagramUrl, setFormInstagramUrl] = useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = useState("");
  const [formRedirectMode, setFormRedirectMode] = useState<"direct_review" | "interactive_profile">("interactive_profile");
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
  const [selectedPlan, setSelectedPlan] = useState<ProductPlan>("standee_1500");
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
    "Auto Google Review Reply Engine",
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

  // Sample data constants for preview mode (ZenTap Digital Solutions Showcase)
  const SAMPLE_ANALYTICS = {
    totalScans: 1428,
    nfcScans: 1114,
    qrScans: 314,
    reviewClicks: 382,
    privateFeedbackCount: 14,
    starsCount: { 5: 320, 4: 62, 3: 18, 2: 9, 1: 5 },
    scansPerDay: [48, 54, 38, 62, 70, 85, 92],
  };

  const handleSaveDynamicProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = {
      whatsapp_number: formWhatsapp,
      whatsapp_message: formWhatsappMsg,
      booking_url: formBookingUrl,
      portfolio_url: formPortfolioUrl,
      instagram_url: formInstagramUrl,
      website_url: formWebsiteUrl,
      redirect_mode: formRedirectMode,
    };
    const updated = updateUserBusiness(business.id, updates);
    setBusiness(updated);
    upsertUserBusinessInDb({
      owner_user_id: user?.id || business.owner_user_id,
      slug: updated.slug,
      name: updated.name,
      email: updated.email,
      ...updates,
    }).catch((err) => console.warn(err));
    setToastMsg("✓ Dynamic Profile & Interaction settings saved!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleSaveCustomDesign = (design: CustomCardDesign) => {
    setCustomDesign(design);
    const updated = updateUserBusiness(business.id, { custom_design: design });
    setBusiness(updated);
    upsertUserBusinessInDb({
      owner_user_id: user?.id || business.owner_user_id,
      slug: updated.slug,
      name: updated.name,
      email: updated.email,
      custom_design: design as any,
    }).catch((err) => console.warn(err));
    setToastMsg("✓ Hardware custom design saved to profile!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleUpdateLeadStatus = (leadId: string, status: "new" | "contacted" | "closed") => {
    updateLeadStatus(business.id, leadId, status as any);
    setLeads(getLeadsForBusiness(business.id));
    setToastMsg(`✓ Lead marked as ${status}`);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleDeleteLead = (leadId: string) => {
    deleteLeadRecord(business.id, leadId);
    setLeads(getLeadsForBusiness(business.id));
    setToastMsg("✓ Lead removed");
    setTimeout(() => setToastMsg(""), 2500);
  };


  // Preselect plan and navigate to order tab when routed from landing page / pricing CTA
  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan as any);
      setDashboardTab("live");
      setPortalSubTab("orders");
      setActiveMenu("orders");
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "dashboard" || tab === "standees" || tab === "reviews" || tab === "profile" || tab === "orders" || tab === "upcoming" || tab === "settings") {
        setActiveMenu(tab as any);
      }
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
        // Guest mode default to sample showcase (ZenTap Digital Solutions)
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
    <div className="flex h-screen w-full bg-[#F8F9FA] text-zinc-900 overflow-hidden font-sans">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* LEFT SIDE: FIXED VERTICAL SIDEBAR                                         */}
      {/* ========================================================================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white border-r border-zinc-200/80 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
        mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        
        {/* Sidebar Header: ZenTap Logo */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-100">
            <div 
              onClick={() => onNavigate ? onNavigate("home") : null}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="Return to ZenTap Homepage"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B91C1C] to-red-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                Z
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-black text-base text-zinc-900 tracking-tight flex items-center">
                  Zen<span className="text-[#B91C1C]">Tap</span>
                </span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest -mt-1">
                  Merchant Portal
                </span>
              </div>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Business Summary Pill in Sidebar */}
          <div className="px-5 py-4 border-b border-zinc-100/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D94826] to-[#E68A00] text-white flex items-center justify-center font-headline font-bold text-sm shadow-sm flex-shrink-0">
                {displayBusiness.name ? displayBusiness.name[0].toUpperCase() : "Z"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-zinc-900 truncate">
                  {displayBusiness.name || "My Store"}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-zinc-400"}`} />
                  <span className="text-[10px] font-semibold text-zinc-500 truncate">
                    {isPaid ? "Subscribed Standee" : "Free Showcase"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu (7 Items) */}
          <nav className="py-4 px-3 space-y-1" aria-label="Portal Navigation">
            {/* 1. Dashboard */}
            <button
              onClick={() => { setActiveMenu("dashboard"); setPortalSubTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeMenu === "dashboard"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* 2. Standees */}
            <button
              onClick={() => { setActiveMenu("standees"); setPortalSubTab("customizer"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeMenu === "standees"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <QrCode className="w-4 h-4 flex-shrink-0" />
              <span>Standees</span>
            </button>

            {/* 3. Reviews */}
            <button
              onClick={() => { setActiveMenu("reviews"); setPortalSubTab("leads"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeMenu === "reviews"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Star className="w-4 h-4 flex-shrink-0" />
              <span>Reviews</span>
              {feedbacks.length > 0 && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeMenu === "reviews" ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-700"
                }`}>
                  {feedbacks.length}
                </span>
              )}
            </button>

            {/* 4. Business Profile */}
            <button
              onClick={() => { setActiveMenu("profile"); setPortalSubTab("edit_details"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeMenu === "profile"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span>Business Profile</span>
            </button>

            {/* 5. Plans & Orders */}
            <button
              onClick={() => { setActiveMenu("orders"); setPortalSubTab("orders"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeMenu === "orders"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span>Plans &amp; Orders</span>
            </button>

            {/* 6. Upcoming Services */}
            <button
              onClick={() => { 
                if (onOpenUpcomingDrawer) onOpenUpcomingDrawer();
                else setActiveMenu("upcoming");
                setMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeMenu === "upcoming"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>Upcoming Services</span>
            </button>

            {/* 7. Settings */}
            <button
              onClick={() => { setActiveMenu("settings"); setPortalSubTab("plan"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeMenu === "settings"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: WhatsApp Support */}
        <div className="p-4 border-t border-zinc-100 space-y-2">
          <a
            href="https://wa.me/919274560880?text=Hello%20ZenTap%20Support,%20I%20need%20help%20with%20my%20Merchant%20Account"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Merchant Support</span>
          </a>
          
          <button
            onClick={() => onNavigate ? onNavigate("home") : null}
            className="w-full py-1.5 px-3 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Return to Website</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* RIGHT SIDE: TOP BAR + SCROLLABLE CONTENT AREA                             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Sticky Top Bar */}
        <header className="h-16 bg-white border-b border-zinc-200/80 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 z-30 shadow-xs">
          {/* Mobile hamburger & Current page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 lg:hidden cursor-pointer"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
              <h2 className="font-headline font-bold text-sm sm:text-base text-zinc-900 capitalize">
                {activeMenu === "profile" ? "Business Profile" : activeMenu === "orders" ? "Plans & Orders" : activeMenu}
              </h2>
              <span className="hidden sm:inline-block text-xs text-zinc-400 font-normal">|</span>
              <span className="hidden sm:inline-block text-xs font-semibold text-zinc-500">
                {displayBusiness.name || "ZenTap Account"}
              </span>
            </div>
          </div>

          {/* Right Action Icons: Notification Bell & User Avatar */}
          <div className="flex items-center gap-3 relative">
            
            {/* 1. Test NFC Simulation CTA */}
            {onTriggerTapSimulator && (
              <button
                onClick={onTriggerTapSimulator}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-[#B91C1C] animate-pulse" />
                <span>Simulate NFC Tap</span>
              </button>
            )}

            {/* 2. Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationDropdownOpen(!notificationDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="p-2 rounded-full text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {(leads.length > 0 || feedbacks.length > 0) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B91C1C] ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-zinc-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-3">
                    <span className="text-xs font-bold text-zinc-900">Notifications</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 font-semibold text-zinc-600">
                      {leads.length + feedbacks.length} alerts
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {leads.slice(0, 3).map((lead) => (
                      <div key={lead.id} className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-sky-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-zinc-900">{lead.name}</p>
                          <p className="text-[11px] text-zinc-500 truncate">{lead.service_needed || lead.message}</p>
                        </div>
                      </div>
                    ))}

                    {feedbacks.slice(0, 2).map((fb) => (
                      <div key={fb.id} className="p-2 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-zinc-900">Feedback: {fb.rating} Stars</p>
                          <p className="text-[11px] text-zinc-500 truncate">{fb.text}</p>
                        </div>
                      </div>
                    ))}

                    {leads.length === 0 && feedbacks.length === 0 && (
                      <p className="text-center text-zinc-400 py-3">All caught up! No new alerts.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. User Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                  {user?.email ? user.email[0].toUpperCase() : (displayBusiness.name ? displayBusiness.name[0].toUpperCase() : "M")}
                </div>
                <span className="hidden md:inline-block text-xs font-semibold text-zinc-800 max-w-[120px] truncate">
                  {user?.email || "Demo Merchant"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 rotate-90" />
              </button>

              {/* User Avatar Dropdown Popover */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-zinc-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 border-b border-zinc-100">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {displayBusiness.name || "Merchant Account"}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">
                      {user?.email || "Guest Demo Session"}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveMenu("profile");
                        setPortalSubTab("edit_details");
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit Business Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveMenu("settings");
                        setPortalSubTab("plan");
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Account Settings</span>
                    </button>

                    {onNavigate && (
                      <button
                        onClick={() => {
                          onNavigate("home");
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Visit Website</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-zinc-100">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (user) {
                          // Sign out
                          window.location.reload();
                        } else if (onOpenAuthModal) {
                          onOpenAuthModal("signin");
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-[#B91C1C] hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{user ? "Sign Out" : "Log In to Account"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] space-y-6">
          
          {/* Guest Notice if viewing without login */}
          {!user && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">
                    My Live Business Analytics (Interactive Showcase)
                  </h4>
                  <p className="text-[11px] text-zinc-600">
                    Previewing merchant telemetry, live Google review assistant linking, and standee order tracking. Log in to manage your registered store.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="https://wa.me/919274560880?text=Hi,%20I%20want%20to%20order%20a%20ZenTap%20standee"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-full bg-[#25D366] text-black font-extrabold text-xs hover:bg-[#20bd5a] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-black text-black" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* Business Summary Banner on Dashboard */}
          {activeMenu === "dashboard" && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-br from-[#1C1B1A] via-[#2A2928] to-[#1C1B1A] text-white p-6 sm:p-7 rounded-3xl relative overflow-hidden border border-[#3A3836] shadow-xl">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start gap-4 sm:gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D94826] to-[#E68A00] text-white flex items-center justify-center font-headline font-black text-2xl shadow-xl border border-white/20 flex-shrink-0">
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
                  </div>

                  <h1 className="font-headline font-bold text-xl sm:text-2xl text-white mt-1">
                    {displayBusiness.name || "My Business Profile"}
                  </h1>

                  <p className="text-xs text-zinc-300 mt-1 flex flex-wrap items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span>{[displayBusiness.city, displayBusiness.state, displayBusiness.country].filter(Boolean).join(", ") || "Ahmedabad, Gujarat, India"}</span>
                    <span className="mx-1">•</span>
                    <Phone className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span>{displayBusiness.phone || "No phone added"}</span>
                  </p>
                </div>
              </div>

              {/* Mode Switcher & Quick Actions */}
              <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md relative z-10">
                <button
                  onClick={() => setDashboardTab("live")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    dashboardTab === "live" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>My Live Data</span>
                </button>

                <button
                  onClick={() => setDashboardTab("sample")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    dashboardTab === "sample" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sample Showcase</span>
                </button>

                <button
                  onClick={() => { setActiveMenu("orders"); setPortalSubTab("orders"); }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#B91C1C] hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Order Standee
                </button>
              </div>
            </div>
          )}

          {/* Sample Showcase Mode Banner */}
          {activeMenu === "dashboard" && dashboardTab === "sample" && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">
                    Sample Showcase: How Your Dashboard Looks Once You Order a Standee
                  </h4>
                  <p className="text-[11px] text-zinc-600">
                    Live preview of official ZenTap metrics: real customer NFC taps, Level Q QR scans, ~88% conversions, and BlueDart tracking!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDashboardTab("live")}
                className="px-3 py-1 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
              >
                Return to Live Data
              </button>
            </div>
          )}

          {/* Upcoming Services Section (when activeMenu === 'upcoming') */}
          {activeMenu === "upcoming" && (
            <div className="p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-zinc-900">
                    Upcoming Tech Services &amp; Products
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Explore the next-generation touchpoint technologies launching soon on the ZenTap platform.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Coming Q1</span>
                  <h4 className="font-bold text-sm text-zinc-900">NFC Smart Restaurant Menus</h4>
                  <p className="text-xs text-zinc-500">Contactless digital menu standees with instant updates and ordering.</p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Coming Q1</span>
                  <h4 className="font-bold text-sm text-zinc-900">WhatsApp Automated Flow</h4>
                  <p className="text-xs text-zinc-500">Automated feedback follow-ups and coupon delivery after customer tap.</p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Coming Q2</span>
                  <h4 className="font-bold text-sm text-zinc-900">Corporate NFC Fleet</h4>
                  <p className="text-xs text-zinc-500">Employee smart business cards with centralized enterprise management.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <p className="text-xs text-zinc-500">Want early beta access to upcoming products?</p>
                <button
                  onClick={() => onOpenUpcomingDrawer ? onOpenUpcomingDrawer() : null}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Open Full Innovation Drawer
                </button>
              </div>
            </div>
          )}

          {/* Right Main Content Area (Conditional Tab Blocks) */}
          <div className="w-full space-y-6">
            
          {/* ========================================================================= */}
          {/* SUB-TAB 1: DASHBOARD (ANALYTICS - LOCKED & BLURRY IF NOT PAID)            */}
          {/* ========================================================================= */}
          {(activeMenu === "dashboard" || portalSubTab === "dashboard") && (
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
          {(activeMenu === "profile" || portalSubTab === "edit_details") && (
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
          {(activeMenu === "standees" || portalSubTab === "link_gbp") && (
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
          {(activeMenu === "reviews" || portalSubTab === "custom_categories") && (
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
                    Customize the quick tags your patrons see on their phone screen when tapping your NFC standee. These tags dynamically feed our smart review writer.
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
          {(activeMenu === "standees" || portalSubTab === "assistant_qr") && (
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
          {(activeMenu === "orders" || portalSubTab === "orders") && (
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

                    {/* Stage 3: Integration with ZenTap Smart Review Assistant */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/50 space-y-1">
                      <div className="w-7 h-7 rounded-full bg-surface-variant text-on-surface flex items-center justify-center text-xs font-bold mb-2">
                        3
                      </div>
                      <h4 className="font-bold text-xs text-on-surface">3. ZenTap Integration</h4>
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
                      type={selectedPlan as any} 
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
                            Customized designed acrylic standee matched to your business branding with smart review draft assistant.
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
                            Custom acrylic standee PLUS automated reply engine that responds to every incoming Google review 24/7.
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
          {(activeMenu === "settings" || portalSubTab === "plan") && (
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

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS PRESERVED                                                          */}
      {/* ========================================================================= */}
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

      <CardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        initialDesign={customDesign || undefined}
        businessName={formName || displayBusiness.name || "YOUR BUSINESS"}
        onSaveDesign={handleSaveCustomDesign}
        onProceedOrder={(design) => {
          handleSaveCustomDesign(design);
          setPortalSubTab("orders");
          setActiveMenu("orders");
        }}
      />

    </div>
  );
}
