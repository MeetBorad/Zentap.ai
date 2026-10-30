"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  ShieldCheck, 
  ShieldAlert,
  Users, 
  Radio, 
  Star, 
  DollarSign, 
  PlusCircle, 
  Check, 
  Cpu, 
  RefreshCw,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  Edit2,
  Download,
  Copy,
  QrCode,
  MapPin,
  Phone,
  Mail,
  Truck,
  Sparkles,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  CheckCircle,
  Clock,
  ChevronDown,
  Lock,
  KeyRound,
  AlertCircle,
  BarChart3,
  ShoppingBag,
  TrendingUp,
  Sliders,
  PackageCheck,
  CreditCard,
  Building2,
  FileCheck,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  Bell
} from "lucide-react";
import { 
  BusinessRecord, 
  getAllBusinesses, 
  adminUpdateBusinessRecord, 
  validateGoogleReviewUrl,
  getBusinessAnalytics,
  generateRandomSlug,
  calculateCourierCharge,
  getAllOrders,
  adminUpdateOrderStatus,
  adminCreateOrder,
  OrderRecord,
  QuotationRecord,
  getAllQuotations,
  adminUpdateQuotationStatus,
  ProductPlan
} from "@/lib/businessStore";
import { useAuth } from "@/context/AuthContext";
import { 
  fetchDbAdminBusinesses, 
  updateDbReviewUrl, 
  upsertUserBusinessInDb, 
  adminUpdateDbBusiness,
  fetchDbAdminOrders,
  adminUpdateDbOrder,
  DbBusinessRecord,
  DbOrderRecord
} from "@/lib/supabase/service";

interface AdminConsoleViewProps {
  onNavigate?: (view: any) => void;
  onOpenAuthModal?: (tab: "signin" | "signup" | "admin") => void;
}

export default function AdminConsoleView({ onOpenAuthModal, onNavigate }: AdminConsoleViewProps) {
  const { user, isAdmin, loading, updateUserPassword, resetPasswordForEmail } = useAuth();
  
  // Navigation Tabs: Analytics Dashboard vs Fleet Table vs Standee Orders vs Plans vs Franchise Quotes
  
  type AdminMenuItem = 
    | "overview"
    | "clients"
    | "orders"
    | "review_links"
    | "analytics"
    | "settings";

  const [adminMenu, setAdminMenu] = useState<AdminMenuItem>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [adminNotificationOpen, setAdminNotificationOpen] = useState(false);

  const [adminTab, setAdminTab] = useState<"analytics" | "fleet" | "orders" | "plans" | "quotations">("analytics");

  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState("");
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<"all" | "pending_review" | "contacted" | "quote_sent" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "awaiting_link" | "name_pending" | "paid" | "pending">("all");
  const [toastMsg, setToastMsg] = useState("");

  // Direct Review Link Edit State
  const [editingBizId, setEditingBizId] = useState<string | null>(null);
  const [editReviewUrl, setEditReviewUrl] = useState("");
  const [validationWarning, setValidationWarning] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  // Comprehensive Business Name & Slug Editor Modal
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [selectedBizForEdit, setSelectedBizForEdit] = useState<BusinessRecord | null>(null);
  const [customBizName, setCustomBizName] = useState("");
  const [customBizSlug, setCustomBizSlug] = useState("");
  const [customGbpLink, setCustomGbpLink] = useState("");
  const [customReviewUrl, setCustomReviewUrl] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customCity, setCustomCity] = useState("");

  // Standee Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderTargetBizId, setOrderTargetBizId] = useState("");
  const [orderPlan, setOrderPlan] = useState<ProductPlan>("standee_1500");
  const [orderPincode, setOrderPincode] = useState("380001");
  const [orderAddress, setOrderAddress] = useState("");
  const [orderRecipient, setOrderRecipient] = useState("");

  // Plan Management Modal State
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedBizForPlan, setSelectedBizForPlan] = useState<BusinessRecord | null>(null);
  const [selectedPlanValue, setSelectedPlanValue] = useState<ProductPlan>("standee_1500");
  const [selectedBillingStatus, setSelectedBillingStatus] = useState<"paid" | "pending" | "failed">("paid");

  // New Business Onboarding Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizEmail, setNewBizEmail] = useState("");
  const [newBizPhone, setNewBizPhone] = useState("");
  const [newBizCity, setNewBizCity] = useState("");
  const [newBizPlan, setNewBizPlan] = useState<ProductPlan>("standee_1500");
  const [newBizReviewUrl, setNewBizReviewUrl] = useState("");

  // High-Res QR Modal State
  const [qrModalBiz, setQrModalBiz] = useState<BusinessRecord | null>(null);
  const [qrPngUrl, setQrPngUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");

  // Custom Review Categories ("What did you like most?") Modal State
  const [chipsModalOpen, setChipsModalOpen] = useState(false);
  const [selectedBizForChips, setSelectedBizForChips] = useState<BusinessRecord | null>(null);
  const [adminChipsList, setAdminChipsList] = useState<string[]>([]);
  const [adminNewChip, setAdminNewChip] = useState("");

  // Admin Security Password State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [adminPasswordUpdating, setAdminPasswordUpdating] = useState(false);
  const [adminPasswordMsg, setAdminPasswordMsg] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");

  // Check tab from URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "overview" || tab === "clients" || tab === "orders" || tab === "review_links" || tab === "analytics" || tab === "settings") {
        setAdminMenu(tab as any);
        if (tab === "clients") setAdminTab("fleet");
        if (tab === "orders") setAdminTab("orders");
        if (tab === "analytics") setAdminTab("analytics");
        if (tab === "review_links") {
          setAdminTab("fleet");
          setStatusFilter("awaiting_link");
        }
      }
    }
  }, []);

  // Load All Businesses & Orders
  useEffect(() => {
    async function loadAdminData() {
      // 1. Initial local load
      const local = getAllBusinesses();
      setBusinesses(local);
      const localOrders = getAllOrders();
      setOrders(localOrders);
      const localQuotes = getAllQuotations();
      setQuotations(localQuotes);

      // 2. Fetch all merchant records from Supabase
      try {
        const remote = await fetchDbAdminBusinesses();
        if (remote && remote.length > 0) {
          const formatted: BusinessRecord[] = remote.map((b) => ({
            id: b.id,
            owner_user_id: b.owner_user_id,
            name: b.name,
            email: b.email,
            phone: b.phone || "",
            city: b.city || "",
            state: b.state || "",
            country: b.country || "India",
            pincode: b.pincode || "",
            gbp_link: b.gbp_link || "",
            slug: b.slug,
            plan: b.plan,
            payment_status: b.payment_status,
            review_url: b.review_url,
            active: b.active,
            address: b.address || "",
            category: b.category || "",
            created_at: b.created_at,
          }));

          const merged = [...formatted];
          local.forEach((loc) => {
            if (!merged.some((m) => m.id === loc.id || m.slug === loc.slug)) {
              merged.push(loc);
            }
          });
          setBusinesses(merged);
        }

        const remoteOrders = await fetchDbAdminOrders();
        if (remoteOrders && remoteOrders.length > 0) {
          const formattedOrders: OrderRecord[] = remoteOrders.map((o) => ({
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
          }));
          const mergedOrders = [...formattedOrders];
          localOrders.forEach((lo) => {
            if (!mergedOrders.some((mo) => mo.id === lo.id)) {
              mergedOrders.push(lo);
            }
          });
          setOrders(mergedOrders);
        }
      } catch (e) {
        console.warn("fetchDbAdminBusinesses notice:", e);
      }
    }

    loadAdminData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Helper to check if a business name is pending confirmation
  const isNamePending = (b: BusinessRecord) => {
    if (!b.name || b.name.trim() === "") return true;
    const nameLower = b.name.toLowerCase().trim();
    if (nameLower === "my business" || nameLower === "business") return true;
    if (b.email) {
      const emailPrefix = b.email.split("@")[0].toLowerCase().trim();
      if (nameLower === emailPrefix || nameLower.includes("thedayithappened")) return true;
    }
    return false;
  };

  // -------------------------------------------------------------
  // ACTION: Open Name & Slug Customizer Modal
  // -------------------------------------------------------------
  const handleOpenNameModal = (b: BusinessRecord) => {
    setSelectedBizForEdit(b);
    setCustomBizName(b.name);
    setCustomBizSlug(b.slug);
    setCustomGbpLink(b.gbp_link || "");
    setCustomReviewUrl(b.review_url || "");
    setCustomPhone(b.phone || "");
    setCustomCity(b.city || "");
    setNameModalOpen(true);
  };

  const handleGenerateSlug = () => {
    if (!customBizName.trim()) return;
    const clean = customBizName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setCustomBizSlug(clean || "business");
  };

  const handleSaveCustomizedProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizForEdit || !customBizName.trim()) return;

    const finalSlug = (customBizSlug.trim() || generateRandomSlug(customBizName)).toLowerCase();

    const updates = {
      name: customBizName.trim(),
      slug: finalSlug,
      gbp_link: customGbpLink.trim() || "",
      review_url: customReviewUrl.trim() || null,
      phone: customPhone.trim() || selectedBizForEdit.phone,
      city: customCity.trim() || selectedBizForEdit.city,
    };

    const updated = adminUpdateBusinessRecord(selectedBizForEdit.id, updates);
    adminUpdateDbBusiness(selectedBizForEdit.id, updates).catch((err) => console.warn(err));

    setBusinesses(updated);
    setNameModalOpen(false);
    showToast(`✓ Updated Business Name to "${updates.name}" & Slug to "/r/${updates.slug}"! Reflects in merchant login.`);
  };

  // -------------------------------------------------------------
  // ACTION: Save Google Review Link Inline
  // -------------------------------------------------------------
  const handleStartEditReview = (b: BusinessRecord) => {
    setEditingBizId(b.id);
    setEditReviewUrl(b.review_url || "");
    setValidationError("");
    setValidationWarning("");
  };

  const handleSaveReviewUrl = (bizId: string) => {
    setValidationError("");
    setValidationWarning("");

    if (editReviewUrl.trim()) {
      const check = validateGoogleReviewUrl(editReviewUrl.trim());
      if (!check.valid) {
        setValidationError(check.message);
        return;
      }
      if (check.isAppShareLink) {
        setValidationWarning(check.message);
      }
    }

    const updated = adminUpdateBusinessRecord(bizId, {
      review_url: editReviewUrl.trim() || null,
    });

    updateDbReviewUrl(bizId, editReviewUrl.trim() || null).catch((err) =>
      console.warn("Supabase updateDbReviewUrl notice:", err)
    );

    setBusinesses(updated);
    setEditingBizId(null);
    showToast("✓ Google Review Link updated with Supreme Authority!");
  };

  // -------------------------------------------------------------
  // ACTION: Change / Delete Plan Modal
  // -------------------------------------------------------------
  const handleOpenPlanModal = (b: BusinessRecord) => {
    setSelectedBizForPlan(b);
    setSelectedPlanValue(b.plan || "standee_1500");
    setSelectedBillingStatus(b.payment_status);
    setPlanModalOpen(true);
  };

  const handleSavePlanChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizForPlan) return;

    const updates = {
      plan: selectedPlanValue,
      payment_status: selectedBillingStatus,
    };

    const updated = adminUpdateBusinessRecord(selectedBizForPlan.id, updates);
    adminUpdateDbBusiness(selectedBizForPlan.id, updates).catch((err) => console.warn(err));

    setBusinesses(updated);
    setPlanModalOpen(false);
    showToast(`✓ Plan updated to ${selectedPlanValue.toUpperCase()} (${selectedBillingStatus.toUpperCase()})`);
  };

  const handleDeletePlan = (bizId: string) => {
    if (confirm("Supreme Authority Confirmation: Reset plan to trial and mark pending?")) {
      const updates = {
        plan: "card_500" as const,
        payment_status: "pending" as const,
      };
      const updated = adminUpdateBusinessRecord(bizId, updates);
      adminUpdateDbBusiness(bizId, updates).catch((err) => console.warn(err));
      setBusinesses(updated);
      setPlanModalOpen(false);
      showToast("✓ Plan subscription reset to pending trial.");
    }
  };

  // -------------------------------------------------------------
  // ACTION: Order Standee for Business
  // -------------------------------------------------------------
  const handleOpenOrderModal = (bizId?: string) => {
    setOrderTargetBizId(bizId || (businesses[0]?.id || ""));
    setOrderPlan("standee_1500");
    setOrderPincode("380001");
    setOrderAddress("");
    setOrderModalOpen(true);
  };

  const handleCreateStandeeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderTargetBizId) return;

    const targetBiz = businesses.find((b) => b.id === orderTargetBizId);
    if (!targetBiz) return;

    const newOrder = adminCreateOrder(orderTargetBizId, orderPlan, orderPincode, orderAddress);
    
    // Sync to Supabase
    adminUpdateDbOrder(newOrder.id, {
      id: newOrder.id,
      business_id: newOrder.business_id,
      plan: newOrder.plan,
      amount: newOrder.amount,
      courier: newOrder.courier,
      status: "processing",
      tracking_number: newOrder.tracking_number,
      courier_name: newOrder.courier_name,
      estimated_delivery: newOrder.estimated_delivery,
      at: newOrder.at,
    }).catch((err) => console.warn(err));

    setOrders(getAllOrders());
    // Refresh business payment status
    setBusinesses(getAllBusinesses());
    setOrderModalOpen(false);
    showToast(`✓ Standee Order ${newOrder.id} placed! Assigned to BlueDart Express.`);
  };

  const handleUpdateOrderStatus = (order: OrderRecord, nextStatus: OrderRecord["status"]) => {
    adminUpdateOrderStatus(order.business_id, order.id, nextStatus);
    adminUpdateDbOrder(order.id, { status: nextStatus }).catch((e) => console.warn(e));
    setOrders(getAllOrders());
    showToast(`✓ Order ${order.id} updated to: ${nextStatus.toUpperCase()}`);
  };

  // -------------------------------------------------------------
  // ACTION: Onboard New Business
  // -------------------------------------------------------------
  const handleAddNewBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const cleanSlug = generateRandomSlug(newBizName.trim());
    const newRecord: BusinessRecord = {
      id: `biz_${Date.now()}`,
      owner_user_id: newBizEmail || "admin-managed",
      name: newBizName.trim(),
      email: newBizEmail.trim() || "admin@zentapdigitalsolutions.com",
      phone: newBizPhone.trim(),
      city: newBizCity.trim() || "India",
      state: "Gujarat",
      country: "India",
      pincode: "380001",
      gbp_link: "",
      slug: cleanSlug,
      plan: newBizPlan,
      payment_status: "paid",
      review_url: newBizReviewUrl.trim() || null,
      active: true,
      category: "Commercial Client",
      created_at: new Date().toISOString(),
    };

    const updated = [newRecord, ...businesses];
    setBusinesses(updated);

    adminUpdateBusinessRecord(newRecord.id, newRecord);
    upsertUserBusinessInDb({
      id: newRecord.id,
      owner_user_id: newRecord.owner_user_id,
      name: newRecord.name,
      email: newRecord.email,
      phone: newRecord.phone,
      city: newRecord.city,
      slug: newRecord.slug,
      plan: newRecord.plan,
      payment_status: newRecord.payment_status,
      review_url: newRecord.review_url,
      active: true,
    }).catch((err) => console.warn(err));

    setAddModalOpen(false);
    setNewBizName("");
    setNewBizEmail("");
    setNewBizPhone("");
    setNewBizCity("");
    setNewBizReviewUrl("");
    showToast("✓ New Client Business onboarded to Fleet!");
  };

  const handleDeleteBusiness = (bizId: string, name: string) => {
    if (confirm(`Supreme Authority Confirmation: Remove "${name}" from Fleet directory?`)) {
      const filtered = businesses.filter((b) => b.id !== bizId);
      setBusinesses(filtered);
      showToast(`✓ Removed "${name}" from Active Directory.`);
    }
  };

  // -------------------------------------------------------------
  // ACTION: High-Resolution Standee QR Generator
  // -------------------------------------------------------------
  const handleOpenQRModal = async (b: BusinessRecord) => {
    setQrModalBiz(b);
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.zentapdigitalsolutions.com";
    const targetUrl = `${origin}/r/${b.slug}?s=qr`;

    try {
      const png = await QRCode.toDataURL(targetUrl, {
        width: 1200,
        margin: 2,
        errorCorrectionLevel: "Q",
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrPngUrl(png);

      const svg = await QRCode.toString(targetUrl, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "Q",
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setQrSvgString(svg);
    } catch (err) {
      console.warn("QR generation error:", err);
    }
  };

  const handleDownloadPng = () => {
    if (!qrPngUrl || !qrModalBiz) return;
    const a = document.createElement("a");
    a.href = qrPngUrl;
    a.download = `${qrModalBiz.slug}-standee-qr-1200px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✓ High-Resolution 1200px PNG downloaded!");
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString || !qrModalBiz) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${qrModalBiz.slug}-standee-qr-vector.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("✓ Vector SVG downloaded for standee laser engraving!");
  };

  // -------------------------------------------------------------
  // ACTION: Customize Review Categories ("What did you like most?")
  // -------------------------------------------------------------
  const handleOpenChipsModal = (b: BusinessRecord) => {
    setSelectedBizForChips(b);
    setAdminChipsList(
      b.custom_chips && b.custom_chips.length > 0
        ? b.custom_chips
        : [
            "Top Quality & Authenticity",
            "Polite & Courteous Staff",
            "Fair & Transparent Pricing",
            "Fast & Attentive Service",
            "Superb Ambience & Cleanliness",
            "Highly Recommended Experience",
          ]
    );
    setAdminNewChip("");
    setChipsModalOpen(true);
  };

  const handleAddAdminChip = () => {
    if (!adminNewChip.trim()) return;
    if (adminChipsList.includes(adminNewChip.trim())) {
      showToast("Category tag already exists.");
      return;
    }
    setAdminChipsList((prev) => [...prev, adminNewChip.trim()]);
    setAdminNewChip("");
  };

  const handleRemoveAdminChip = (chip: string) => {
    setAdminChipsList((prev) => prev.filter((c) => c !== chip));
  };

  const handleResetAdminChips = () => {
    const defaults = [
      "Top Quality & Authenticity",
      "Polite & Courteous Staff",
      "Fair & Transparent Pricing",
      "Fast & Attentive Service",
      "Superb Ambience & Cleanliness",
      "Highly Recommended Experience",
    ];
    setAdminChipsList(defaults);
    showToast("Reset to standard categories.");
  };

  const handleSaveAdminChips = () => {
    if (!selectedBizForChips) return;
    if (adminChipsList.length === 0) {
      showToast("Please keep at least 1 category.");
      return;
    }
    const updated = adminUpdateBusinessRecord(selectedBizForChips.id, {
      custom_chips: adminChipsList,
    });
    setBusinesses(updated);
    setChipsModalOpen(false);
    showToast(`✓ Updated Review Categories for "${selectedBizForChips.name}"!`);
  };

  // Password Management Handlers
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordError("");
    setAdminPasswordMsg("");

    if (newAdminPassword.length < 6) {
      setAdminPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setAdminPasswordError("Passwords do not match.");
      return;
    }

    setAdminPasswordUpdating(true);
    try {
      const { error } = await updateUserPassword(newAdminPassword);
      if (error) {
        setAdminPasswordError(error.message || "Failed to update admin password.");
      } else {
        setAdminPasswordMsg("✓ Admin password updated successfully!");
        setNewAdminPassword("");
        setConfirmAdminPassword("");
        showToast("✓ Admin password updated!");
      }
    } catch (err: any) {
      setAdminPasswordError(err.message || "Failed to update password.");
    } finally {
      setAdminPasswordUpdating(false);
    }
  };

  const handleSendAdminResetEmail = async () => {
    try {
      const { error } = await resetPasswordForEmail("admin@zentapdigitalsolutions.com");
      if (error) {
        setAdminPasswordError(error.message);
      } else {
        setAdminPasswordMsg("✓ Recovery instructions dispatched to admin@zentapdigitalsolutions.com!");
        showToast("✓ Admin recovery email sent!");
      }
    } catch (err: any) {
      setAdminPasswordError(err.message);
    }
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://www.zentapdigitalsolutions.com";

  // Filtered list
  const filtered = businesses.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      b.name.toLowerCase().includes(q) ||
      (b.city && b.city.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.phone && b.phone.includes(q)) ||
      (b.slug && b.slug.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (statusFilter === "active") return b.active;
    if (statusFilter === "awaiting_link") return !b.review_url;
    if (statusFilter === "name_pending") return isNamePending(b);
    if (statusFilter === "paid") return b.payment_status === "paid";
    if (statusFilter === "pending") return b.payment_status === "pending";

    return true;
  });

  const handleUpdateQuoteStatus = (id: string, status: QuotationRecord["status"]) => {
    const updated = adminUpdateQuotationStatus(id, status);
    setQuotations(updated);
    showToast(`✓ Quotation ${id} status updated to ${status.replace("_", " ").toUpperCase()}`);
  };

  // Filtered quotations
  const filteredQuotations = quotations.filter((q) => {
    const query = quoteSearchQuery.toLowerCase();
    const matchesQuery =
      q.id.toLowerCase().includes(query) ||
      q.business_name.toLowerCase().includes(query) ||
      q.contact_name.toLowerCase().includes(query) ||
      (q.city && q.city.toLowerCase().includes(query)) ||
      (q.phone && q.phone.includes(query)) ||
      (q.email && q.email.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    if (quoteStatusFilter === "pending_review") return q.status === "pending_review";
    if (quoteStatusFilter === "contacted") return q.status === "contacted";
    if (quoteStatusFilter === "quote_sent") return q.status === "quote_sent";
    if (quoteStatusFilter === "approved") return q.status === "approved";

    return true;
  });

  // Comprehensive Fleet Analytics Calculations
  const totalFleet = businesses.length;
  const activeBusinesses = businesses.filter((b) => b.active).length;
  const verifiedLinks = businesses.filter((b) => !!b.review_url).length;
  const awaitingLinks = businesses.filter((b) => !b.review_url).length;
  const pendingNamesCount = businesses.filter(isNamePending).length;
  const paidDeployments = businesses.filter((b) => b.payment_status === "paid").length;
  const pendingLinksCount = awaitingLinks;
  const pendingOrdersCount = orders.filter((o) => o.status === "processing" || o.status === "in_production").length;
  const totalClients = totalFleet;
  const totalScans = totalFleet * 120; // fallback telemetry aggregator

  // Aggregate taps and scans across all businesses
  let totalTaps = 0;
  let totalNfcTaps = 0;
  let totalQrScans = 0;
  let totalReviewClicks = 0;
  let totalDefusedFeedback = 0;

  businesses.forEach((b) => {
    const a = getBusinessAnalytics(b.id);
    totalTaps += a.totalScans;
    totalNfcTaps += a.nfcScans;
    totalQrScans += a.qrScans;
    totalReviewClicks += a.reviewClicks;
    totalDefusedFeedback += a.privateFeedbackCount;
  });

  // Calculate Total Earnings
  const totalOrderRevenue = orders.reduce((sum, o) => sum + (o.amount || 0) + (o.courier || 0), 0);
  const totalPlanBase = businesses.reduce((sum, b) => {
    if (b.payment_status === "paid") {
      const p = b.plan === "card_500" ? 500 : b.plan === "standee_1500" ? 1500 : b.plan === "standee_auto_2000" ? 2000 : 2500;
      return sum + p;
    }
    return sum;
  }, 0);
  const totalFleetEarnings = Math.max(totalOrderRevenue, totalPlanBase);

  // Order Pipeline Counts
  const ordersProcessing = orders.filter((o) => o.status === "processing" || o.status === "in_production").length;
  const ordersDispatched = orders.filter((o) => o.status === "shipped").length;
  const ordersDelivered = orders.filter((o) => o.status === "delivered").length;

  const courierCalculation = calculateCourierCharge(orderPincode);
  const baseOrderPrice = orderPlan === "card_500" ? 500 : orderPlan === "standee_1500" ? 1500 : orderPlan === "standee_auto_2000" ? 2000 : 2500;

  // Strict Security Gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Admin Authentication Required</h2>
          <p className="text-sm text-zinc-500">
            Please authenticate with master administrator credentials to access fleet telemetry, merchant records, and hardware dispatch.
          </p>
          <button
            onClick={() => onOpenAuthModal ? onOpenAuthModal("signin") : null}
            className="w-full py-3 px-4 rounded-xl bg-[#B91C1C] text-white font-bold text-sm hover:bg-red-800 transition-colors shadow-md cursor-pointer"
          >
            Authenticate Admin
          </button>
        </div>
      </div>
    );
  }

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
                  Superadmin Console
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

          {/* Root Authority Badge */}
          <div className="px-5 py-4 border-b border-zinc-100/80">
            <div className="p-3 rounded-2xl bg-zinc-900 text-white space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Supreme Authority Active</span>
              </div>
              <p className="text-xs font-semibold text-zinc-200">
                Fleet Management &amp; Dispatch
              </p>
            </div>
          </div>

          {/* Navigation Menu (6 Items) */}
          <nav className="py-4 px-3 space-y-1" aria-label="Admin Navigation">
            {/* 1. Overview */}
            <button
              onClick={() => { 
                setAdminMenu("overview"); 
                setAdminTab("analytics");
                setMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                adminMenu === "overview"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Overview</span>
            </button>

            {/* 2. Clients */}
            <button
              onClick={() => { 
                setAdminMenu("clients"); 
                setStatusFilter("all");
                setAdminTab("fleet"); 
                setMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                adminMenu === "clients"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span>Clients</span>
              <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                adminMenu === "clients" ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-700"
              }`}>
                {businesses.length}
              </span>
            </button>

            {/* 3. Orders & Payments */}
            <button
              onClick={() => { 
                setAdminMenu("orders"); 
                setAdminTab("orders"); 
                setMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                adminMenu === "orders"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Truck className="w-4 h-4 flex-shrink-0" />
              <span>Orders &amp; Payments</span>
              {orders.length > 0 && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  adminMenu === "orders" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            {/* 4. Review Links */}
            <button
              onClick={() => { 
                setAdminMenu("review_links"); 
                setStatusFilter("awaiting_link");
                setAdminTab("fleet");
                setMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                adminMenu === "review_links"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              <span>Review Links</span>
              {pendingLinksCount > 0 && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  adminMenu === "review_links" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                }`}>
                  {pendingLinksCount}
                </span>
              )}
            </button>

            {/* 5. Analytics */}
            <button
              onClick={() => { 
                setAdminMenu("analytics"); 
                setAdminTab("analytics"); 
                setMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                adminMenu === "analytics"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span>Analytics</span>
            </button>

            {/* 6. Settings */}
            <button
              onClick={() => { 
                setAdminMenu("settings"); 
                setMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                adminMenu === "settings"
                  ? "bg-[#B91C1C] text-white shadow-sm font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Security & Return */}
        <div className="p-4 border-t border-zinc-100 space-y-2">
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Update Password</span>
          </button>
          
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
                {adminMenu === "review_links" ? "Review Links Hub" : adminMenu === "orders" ? "Orders & Payments" : adminMenu}
              </h2>
              <span className="hidden sm:inline-block text-xs text-zinc-400 font-normal">|</span>
              <span className="hidden sm:inline-block text-xs font-semibold text-zinc-500">
                ZenTap Master Fleet ({businesses.length} Clients)
              </span>
            </div>
          </div>

          {/* Right Action Icons: Notification Bell & Admin Avatar */}
          <div className="flex items-center gap-3 relative">
            
            {/* Quick Action: Onboard Business */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B91C1C] hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Onboard Business</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setAdminNotificationOpen(!adminNotificationOpen);
                  setAdminDropdownOpen(false);
                }}
                className="p-2 rounded-full text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors relative cursor-pointer"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {(pendingLinksCount > 0 || pendingOrdersCount > 0) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B91C1C] ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown Popover */}
              {adminNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-zinc-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-3">
                    <span className="text-xs font-bold text-zinc-900">Admin Alerts</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 font-semibold text-zinc-600">
                      {pendingLinksCount + pendingOrdersCount} pending
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {pendingLinksCount > 0 && (
                      <div 
                        onClick={() => {
                          setAdminMenu("review_links");
                          setStatusFilter("awaiting_link");
                          setAdminTab("fleet");
                          setAdminNotificationOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2 cursor-pointer hover:bg-amber-100/70"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-zinc-900">{pendingLinksCount} Clients Need Review URL</p>
                          <p className="text-[11px] text-zinc-500">Click to open Review Links Hub and paste URLs.</p>
                        </div>
                      </div>
                    )}

                    {pendingOrdersCount > 0 && (
                      <div 
                        onClick={() => {
                          setAdminMenu("orders");
                          setAdminTab("orders");
                          setAdminNotificationOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2 cursor-pointer hover:bg-blue-100/70"
                      >
                        <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-zinc-900">{pendingOrdersCount} Standee Orders</p>
                          <p className="text-[11px] text-zinc-500">Orders in processing or production.</p>
                        </div>
                      </div>
                    )}

                    {pendingLinksCount === 0 && pendingOrdersCount === 0 && (
                      <p className="text-center text-zinc-400 py-3">All clear! Fleet operating smoothly.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setAdminDropdownOpen(!adminDropdownOpen);
                  setAdminNotificationOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <span className="hidden md:inline-block text-xs font-semibold text-zinc-800 max-w-[120px] truncate">
                  {user?.email || "Superadmin"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Admin Avatar Dropdown Popover */}
              {adminDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-zinc-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 border-b border-zinc-100">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      Supreme Superadmin
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">
                      {user?.email || "admin@zentapdigitalsolutions.com"}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setAdminMenu("settings");
                        setAdminDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Security &amp; Passwords</span>
                    </button>

                    {onNavigate && (
                      <button
                        onClick={() => {
                          onNavigate("home");
                          setAdminDropdownOpen(false);
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
                        setAdminDropdownOpen(false);
                        window.location.reload();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-[#B91C1C] hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Exit Admin Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] space-y-6">
          
          {/* Settings Section (when adminMenu === 'settings') */}
          {adminMenu === "settings" && (
            <div className="p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-6 animate-in fade-in duration-200 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                  <Lock className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-zinc-900">
                    Root Superadmin Security Settings
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Update master administrator credentials and monitor system diagnostics.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-600">Admin Authority:</span>
                  <span className="font-bold text-emerald-600">Supreme Root Administrator</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-600">Database Engine:</span>
                  <span className="font-mono text-zinc-800">Supabase PostgreSQL (RLS Enabled)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-600">Admin Account Email:</span>
                  <span className="font-mono text-zinc-800">{user?.email || "admin@zentapdigitalsolutions.com"}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Update Admin Master Password</span>
                </button>
              </div>
            </div>
          )}

          {/* Existing Tab Blocks (Analytics, Fleet, Orders, Plans, Quotations) */}
                {adminTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total Fleet Earnings */}
            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
                Total Fleet Earnings
              </span>
              <div className="my-2">
                <span className="font-headline font-black text-2xl sm:text-3xl text-emerald-600">
                  ₹{totalFleetEarnings.toLocaleString("en-IN")}
                </span>
                <span className="block text-[10px] text-on-surface-variant mt-0.5">
                  Paid hardware + recurring subscriptions
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{paidDeployments} Paid Deployments</span>
              </div>
            </div>

            {/* Total Customer Taps & Scans */}
            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
                Total Taps / Scans
              </span>
              <div className="my-2">
                <span className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
                  {totalTaps}
                </span>
                <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                  NFC: {totalNfcTaps} • QR: {totalQrScans}
                </span>
              </div>
              <div className="w-full bg-surface-variant/30 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (totalNfcTaps / (totalTaps || 1)) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Google Review Clicks & Conversion */}
            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
                Google Review Clicks
              </span>
              <div className="my-2">
                <span className="font-headline font-black text-2xl sm:text-3xl text-secondary">
                  {totalReviewClicks}
                </span>
                <span className="block text-[10px] text-secondary font-semibold mt-0.5">
                  ~88% Conversion to Google Maps
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                {totalDefusedFeedback} Private Feedbacks Defused
              </span>
            </div>

            {/* Total Active Businesses */}
            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant">
                Active Client Stores
              </span>
              <div className="my-2">
                <span className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
                  {activeBusinesses} <span className="text-sm font-normal text-on-surface-variant">/ {totalFleet}</span>
                </span>
                <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Active in Live Review Routing
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                {totalFleet - activeBusinesses} Paused / Inactive
              </span>
            </div>

          </div>

          {/* Operational Status Row: Name Confirmation, Google Review Link, Orders & Franchise Quotes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Business Name Confirmation Pending Status */}
            <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between ${
              pendingNamesCount > 0 
                ? "bg-amber-500/10 border-amber-500/40 text-on-surface" 
                : "bg-surface-container-lowest border-surface-variant/40 text-on-surface"
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-500" />
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    Name Confirmation Status
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  pendingNamesCount > 0 ? "bg-amber-500/20 text-amber-800" : "bg-emerald-500/15 text-emerald-700"
                }`}>
                  {pendingNamesCount > 0 ? `${pendingNamesCount} Pending` : "✓ All Confirmed"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                {pendingNamesCount > 0
                  ? `${pendingNamesCount} registered merchant(s) have placeholder or auto-generated names. Open the Admin Table to customize their formal business name & generate clean slugs.`
                  : "All registered client businesses have verified, customized formal names assigned."}
              </p>
              <button
                onClick={() => {
                  setStatusFilter("name_pending");
                  setAdminTab("fleet");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-surface border border-surface-variant/50 hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center justify-between cursor-pointer"
              >
                <span>Review Pending Names</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Google Review Destination Confirmation Status */}
            <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between ${
              awaitingLinks > 0 
                ? "bg-red-500/10 border-red-500/30 text-on-surface" 
                : "bg-surface-container-lowest border-surface-variant/40 text-on-surface"
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-secondary" />
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    Google Review Link Status
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  awaitingLinks > 0 ? "bg-red-500/20 text-red-700" : "bg-emerald-500/15 text-emerald-700"
                }`}>
                  {awaitingLinks > 0 ? `${awaitingLinks} Awaiting` : "✓ 100% Connected"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                {awaitingLinks > 0 
                  ? `${awaitingLinks} business(es) do not have their Google write-review link connected yet. Standee taps will show pending notice.`
                  : "Every active business in the fleet has an authenticated Google Review destination URL."}
              </p>
              <button
                onClick={() => {
                  setStatusFilter("awaiting_link");
                  setAdminTab("fleet");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-surface border border-surface-variant/50 hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center justify-between cursor-pointer"
              >
                <span>Connect Review Links</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Hardware Standee Order Status */}
            <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-primary" />
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    Standee Order Status
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {orders.length} Total Orders
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 my-1 text-center">
                <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  <span className="font-bold text-xs text-amber-700 block">{ordersProcessing}</span>
                  <span className="text-[9px] text-on-surface-variant">Production</span>
                </div>
                <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/25">
                  <span className="font-bold text-xs text-blue-700 block">{ordersDispatched}</span>
                  <span className="text-[9px] text-on-surface-variant">In Transit</span>
                </div>
                <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <span className="font-bold text-xs text-emerald-700 block">{ordersDelivered}</span>
                  <span className="text-[9px] text-on-surface-variant">Delivered</span>
                </div>
              </div>
              <button
                onClick={() => setAdminTab("orders")}
                className="px-3.5 py-1.5 rounded-xl bg-surface border border-surface-variant/50 hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center justify-between cursor-pointer mt-2"
              >
                <span>Manage Dispatch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Franchise & Multi-Outlet Quotations Status */}
            <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between ${
              quotations.filter((q) => q.status === "pending_review").length > 0
                ? "bg-amber-500/10 border-amber-500/40 text-on-surface"
                : "bg-surface-container-lowest border-surface-variant/40 text-on-surface"
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    Franchise Quotations
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  quotations.filter((q) => q.status === "pending_review").length > 0
                    ? "bg-amber-500/20 text-amber-800"
                    : "bg-emerald-500/15 text-emerald-700"
                }`}>
                  {quotations.filter((q) => q.status === "pending_review").length > 0
                    ? `${quotations.filter((q) => q.status === "pending_review").length} New`
                    : `${quotations.length} Quotes`}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                {quotations.length > 0
                  ? `${quotations.length} enterprise quotation request(s) for multi-location standees and branch QR code fleets.`
                  : "No franchise quotation requests submitted yet."}
              </p>
              <button
                onClick={() => setAdminTab("quotations")}
                className="px-3.5 py-1.5 rounded-xl bg-surface border border-surface-variant/50 hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center justify-between cursor-pointer"
              >
                <span>Open Quotations Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Detailed Visual Analytics breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NFC Tap vs QR Scan Telemetry Visualizer */}
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
              <h4 className="font-headline font-bold text-base text-on-surface mb-1 flex items-center gap-2">
                <Radio className="w-4 h-4 text-secondary" />
                <span>Customer Touchpoint Channel Telemetry</span>
              </h4>
              <p className="text-xs text-on-surface-variant mb-4">
                Comparison of contact-free 13.56 MHz NFC phone taps vs. Level Q printed QR code scans.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>NFC 13.56MHz Taps: {totalNfcTaps}</span>
                    </span>
                    <span className="text-emerald-600">{Math.round((totalNfcTaps / (totalTaps || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-surface-variant/30 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.round((totalNfcTaps / (totalTaps || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>Level Q Laser QR Scans: {totalQrScans}</span>
                    </span>
                    <span className="text-blue-600">{Math.round((totalQrScans / (totalTaps || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-surface-variant/30 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.round((totalQrScans / (totalTaps || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial Plan Distribution */}
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
              <h4 className="font-headline font-bold text-base text-on-surface mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Commercial Hardware Plan Distribution</span>
              </h4>
              <p className="text-xs text-on-surface-variant mb-4">
                Distribution of deployed NFC review cards, counter standees, and auto reply engines.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant/40">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs font-bold text-on-surface">Auto Standee + Reply Engine (₹2,000)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-on-surface">
                    {businesses.filter((b) => b.plan === "standee_auto_2000").length} Units
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant/40">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary" />
                    <span className="text-xs font-bold text-on-surface">Auto Google Review Standee (₹1,500)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-on-surface">
                    {businesses.filter((b) => b.plan === "standee_1500").length} Units
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant/40">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-zinc-400" />
                    <span className="text-xs font-bold text-on-surface">Normal Smart NFC Review Card (₹500)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-on-surface">
                    {businesses.filter((b) => b.plan === "card_500").length} Units
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant/40">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-on-surface">Franchise Multi-Outlet Fleet (Custom Quote)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-amber-600">
                    {businesses.filter((b) => b.plan === "franchise_custom").length} Units
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FLEET MASTER DIRECTORY / ADMIN TABLE                               */}
      {/* ========================================================================= */}
      {adminTab === "fleet" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search business name, city, email, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-variant/50 text-xs text-on-surface placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-surface-variant/40 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === "all" ? "bg-[#1C1B1A] text-white font-semibold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All ({businesses.length})
              </button>
              <button
                onClick={() => setStatusFilter("name_pending")}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === "name_pending" ? "bg-amber-600 text-white font-semibold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Name Pending ({pendingNamesCount})
              </button>
              <button
                onClick={() => setStatusFilter("awaiting_link")}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === "awaiting_link" ? "bg-red-600 text-white font-semibold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Awaiting Link ({awaitingLinks})
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === "paid" ? "bg-emerald-700 text-white font-semibold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Paid ({paidDeployments})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === "active" ? "bg-[#1C1B1A] text-white font-semibold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Active ({activeBusinesses})
              </button>
            </div>
          </div>

          {/* The 10-Column Admin Master Table */}
          <div className="rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant/40 text-on-surface-variant uppercase text-[10px] font-mono tracking-wider font-semibold">
                    <th className="py-3.5 px-4 sm:px-6">Business &amp; Slug</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Customer Page</th>
                    <th className="py-3.5 px-4">Plan</th>
                    <th className="py-3.5 px-4">Billing</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Scans</th>
                    <th className="py-3.5 px-4">Google Review Destination</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Supreme Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/30">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-on-surface-variant">
                        No businesses matched your search filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b) => {
                      const a = getBusinessAnalytics(b.id);
                      const isPendingName = isNamePending(b);
                      const isEditingThisReview = editingBizId === b.id;

                      return (
                        <tr key={b.id} className="hover:bg-surface-container-low/50 transition-colors">
                          
                          {/* 1. Business & Slug (with customized name editor) */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex flex-col gap-1 max-w-[200px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-on-surface truncate block" title={b.name}>
                                  {b.name}
                                </span>
                                {isPendingName && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-[9px] font-bold whitespace-nowrap">
                                    Name Pending
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-secondary truncate">
                                /r/{b.slug}
                              </span>
                              <button
                                onClick={() => handleOpenNameModal(b)}
                                className="text-[10px] font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>Edit Name &amp; Slug</span>
                              </button>
                            </div>
                          </td>

                          {/* 2. Contact */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col text-[11px] text-on-surface-variant max-w-[150px]">
                              <span className="text-on-surface font-semibold truncate">{b.phone || "No phone"}</span>
                              <span className="truncate" title={b.email}>{b.email}</span>
                            </div>
                          </td>

                          {/* 3. City */}
                          <td className="py-4 px-4">
                            <span className="text-on-surface font-medium whitespace-nowrap">
                              {b.city || "Gujarat"}
                            </span>
                          </td>

                          {/* 4. Customer Page */}
                          <td className="py-4 px-4">
                            <a
                              href={`${originUrl}/r/${b.slug}?preview=1`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-secondary/30 text-[11px] font-semibold text-secondary hover:border-secondary cursor-pointer"
                            >
                              <span>/r/{b.slug.slice(0, 8)}...</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>

                          {/* 5. Plan */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleOpenPlanModal(b)}
                              className="px-2.5 py-1 rounded-full bg-surface-container font-bold text-[10px] text-on-surface border border-surface-variant/40 hover:border-primary cursor-pointer flex items-center gap-1 whitespace-nowrap"
                              title="Click to change plan"
                            >
                              <span>
                                {b.plan === "card_500" ? "Card ₹500" : b.plan === "standee_1500" ? "Standee ₹1,500" : b.plan === "standee_auto_2000" ? "Auto Reply ₹2,000" : "Franchise Custom"}
                              </span>
                              <ChevronDown className="w-2.5 h-2.5 text-on-surface-variant" />
                            </button>
                          </td>

                          {/* 6. Billing */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => {
                                const next = b.payment_status === "paid" ? "pending" : "paid";
                                const updated = adminUpdateBusinessRecord(b.id, { payment_status: next });
                                adminUpdateDbBusiness(b.id, { payment_status: next }).catch((e) => console.warn(e));
                                setBusinesses(updated);
                                showToast(`✓ Billing set to ${next.toUpperCase()}`);
                              }}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                                b.payment_status === "paid"
                                  ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25"
                                  : "bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25"
                              }`}
                            >
                              {b.payment_status.toUpperCase()}
                            </button>
                          </td>

                          {/* 7. Status */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => {
                                const next = !b.active;
                                const updated = adminUpdateBusinessRecord(b.id, { active: next });
                                adminUpdateDbBusiness(b.id, { active: next }).catch((e) => console.warn(e));
                                setBusinesses(updated);
                                showToast(`✓ Business status: ${next ? "ACTIVE" : "INACTIVE"}`);
                              }}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                                b.active
                                  ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25"
                                  : "bg-zinc-500/15 text-zinc-600 border-zinc-500/30 hover:bg-zinc-500/25"
                              }`}
                            >
                              {b.active ? "ACTIVE" : "INACTIVE"}
                            </button>
                          </td>

                          {/* 8. Scans */}
                          <td className="py-4 px-4 font-mono font-bold text-on-surface">
                            <span title={`NFC: ${a.nfcScans} • QR: ${a.qrScans} • Clicks: ${a.reviewClicks}`}>
                              {a.totalScans}
                            </span>
                          </td>

                          {/* 9. Google Review Destination */}
                          <td className="py-4 px-4">
                            {isEditingThisReview ? (
                              <div className="flex flex-col gap-1 min-w-[220px]">
                                <input
                                  type="url"
                                  value={editReviewUrl}
                                  onChange={(e) => setEditReviewUrl(e.target.value)}
                                  placeholder="https://g.page/r/.../review"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-surface-variant text-[11px] font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                {validationError && (
                                  <span className="text-[10px] text-red-600">{validationError}</span>
                                )}
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <button
                                    onClick={() => handleSaveReviewUrl(b.id)}
                                    className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer"
                                  >
                                    Save Link
                                  </button>
                                  <button
                                    onClick={() => setEditingBizId(null)}
                                    className="px-2 py-1 rounded bg-surface-container text-on-surface-variant font-bold text-[10px] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 max-w-[220px]">
                                {b.review_url ? (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <span className="text-[11px] font-mono text-on-surface-variant truncate" title={b.review_url}>
                                      {b.review_url.replace(/^https?:\/\//, "")}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 font-bold text-[10px]">
                                    Awaiting Link
                                  </span>
                                )}
                                <button
                                  onClick={() => handleStartEditReview(b)}
                                  className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer flex-shrink-0"
                                  title="Edit Google Review Link"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* 10. Supreme Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenQRModal(b)}
                                className="p-1.5 rounded-lg bg-surface border border-surface-variant/50 hover:bg-surface-container text-on-surface cursor-pointer"
                                title="Download 1200px PNG / SVG Laser QR"
                              >
                                <QrCode className="w-3.5 h-3.5 text-secondary" />
                              </button>

                              <button
                                onClick={() => handleOpenChipsModal(b)}
                                className="p-1.5 rounded-lg bg-surface border border-surface-variant/50 hover:bg-surface-container text-amber-600 cursor-pointer"
                                title="Customize Review Categories ('What did you like most?')"
                              >
                                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                              </button>

                              <button
                                onClick={() => handleOpenOrderModal(b.id)}
                                className="p-1.5 rounded-lg bg-surface border border-surface-variant/50 hover:bg-surface-container text-on-surface cursor-pointer"
                                title="Order Hardware Standee for this Business"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                              </button>

                              <button
                                onClick={() => handleDeleteBusiness(b.id, b.name)}
                                className="p-1.5 rounded-lg bg-surface border border-surface-variant/50 hover:bg-rose-50 text-rose-600 cursor-pointer"
                                title="Delete from Fleet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STANDEE ORDERS & DISPATCH HUB                                      */}
      {/* ========================================================================= */}
      {adminTab === "orders" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
            <div>
              <h3 className="font-headline font-bold text-xl text-on-surface">
                Hardware Standee Fulfillment &amp; Dispatch
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Manage acrylic counter standee manufacturing, laser etching, RF inspection, and BlueDart tracking numbers.
              </p>
            </div>

            <button
              onClick={() => handleOpenOrderModal()}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Place Standee Order</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant/40 text-on-surface-variant uppercase text-[10px] font-mono tracking-wider font-semibold">
                    <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                    <th className="py-3.5 px-4">Business</th>
                    <th className="py-3.5 px-4">Hardware Tier</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Courier &amp; Tracking ID</th>
                    <th className="py-3.5 px-4">Fulfillment Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Advance Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/30">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                        No standee hardware orders recorded yet. Click &quot;Place Standee Order&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const biz = businesses.find((b) => b.id === o.business_id);
                      return (
                        <tr key={o.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-4 px-4 sm:px-6 font-mono font-bold text-secondary">
                            #{o.id}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-on-surface block">{biz?.name || o.business_id}</span>
                            <span className="text-[11px] text-on-surface-variant font-mono">/r/{biz?.slug || "unknown"}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-semibold text-[10px] text-on-surface border border-surface-variant/40">
                              {o.plan === "card_500" ? "Card ₹500" : o.plan === "standee_1500" ? "Standee ₹1,500" : o.plan === "standee_auto_2000" ? "Auto Reply ₹2,000" : "Franchise Custom"}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-on-surface">
                            ₹{(o.amount || 0) + (o.courier || 0)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col text-[11px]">
                              <span className="font-semibold text-on-surface">{o.courier_name || "BlueDart Express"}</span>
                              <span className="font-mono text-secondary">{o.tracking_number || "Pending dispatch"}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.status === "delivered"
                                ? "bg-emerald-500/15 text-emerald-700"
                                : o.status === "shipped"
                                ? "bg-blue-500/15 text-blue-700"
                                : "bg-amber-500/15 text-amber-700"
                            }`}>
                              {o.status === "shipped" ? "DISPATCHED" : o.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {o.status === "processing" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o, "shipped")}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 cursor-pointer"
                                >
                                  Mark Dispatched
                                </button>
                              )}
                              {o.status === "shipped" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o, "delivered")}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer"
                                >
                                  Mark Delivered
                                </button>
                              )}
                              {o.status === "delivered" && (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Delivered
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PLANS & SUBSCRIPTIONS MANAGEMENT                                   */}
      {/* ========================================================================= */}
      {adminTab === "plans" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Plan Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Tier 1</span>
                <h4 className="font-headline font-bold text-lg text-on-surface mt-1">Normal Smart NFC Review Card</h4>
                <div className="my-3">
                  <span className="font-headline font-black text-3xl text-on-surface">₹500</span>
                  <span className="text-xs text-on-surface-variant block mt-0.5">+ Extra Courier (One-Time)</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  PVC card format with embedded NFC chip and printed QR. Zero recurring monthly subscription fees.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant/30 mt-4 text-[11px] font-semibold text-emerald-600">
                {businesses.filter((b) => b.plan === "card_500").length} Active Subscriptions
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-secondary/40 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase">
                Most Popular
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Tier 2</span>
                <h4 className="font-headline font-bold text-lg text-on-surface mt-1">Auto Google Review Standee</h4>
                <div className="my-3">
                  <span className="font-headline font-black text-3xl text-secondary">₹1,500</span>
                  <span className="text-xs text-on-surface-variant block mt-0.5">+ ₹1,000 / month from Month 2</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Heavyweight laser-cut acrylic standee matched to client branding. Includes smart review draft assistant.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant/30 mt-4 text-[11px] font-semibold text-secondary">
                {businesses.filter((b) => b.plan === "standee_1500").length} Active Subscriptions
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-primary/40 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Tier 3</span>
                <h4 className="font-headline font-bold text-lg text-on-surface mt-1">Standee + Auto Reply Engine</h4>
                <div className="my-3">
                  <span className="font-headline font-black text-3xl text-primary">₹2,000</span>
                  <span className="text-xs text-on-surface-variant block mt-0.5">+ ₹1,000 / month from Month 2</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Full counter standee touchpoint plus 24/7 automated reply engine responding politely to incoming Google reviews.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant/30 mt-4 text-[11px] font-semibold text-primary">
                {businesses.filter((b) => b.plan === "standee_auto_2000").length} Active Subscriptions
              </div>
            </div>

            {/* Tier 4: Franchise & Multi-Location Fleet */}
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-amber-500/40 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase">
                Enterprise
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Tier 4</span>
                <h4 className="font-headline font-bold text-lg text-on-surface mt-1">Franchise Multi-Outlet Fleet</h4>
                <div className="my-3">
                  <span className="font-headline font-black text-2xl text-amber-600">Custom Quote</span>
                  <span className="text-xs text-on-surface-variant block mt-0.5">Bulk Hardware + Multi-QR SaaS</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Dedicated standee hardware fleet with individual QR codes for each branch counter and centralized owner reporting.
                </p>
              </div>
              <div className="pt-4 border-t border-surface-variant/30 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-700">
                  {quotations.length} Active Quote Requests
                </span>
                <button
                  onClick={() => setAdminTab("quotations")}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Quotes</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* Business Subscription Control Table */}
          <div className="rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-variant/30 bg-surface-container-low flex justify-between items-center">
              <h4 className="font-headline font-bold text-sm text-on-surface">
                Client Subscription &amp; Hardware Tier Manager
              </h4>
              <span className="text-xs text-on-surface-variant">
                Change or delete subscription plans per client store
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant/40 text-on-surface-variant uppercase text-[10px] font-mono tracking-wider font-semibold">
                    <th className="py-3 px-4">Business</th>
                    <th className="py-3 px-4">Current Plan</th>
                    <th className="py-3 px-4">Monthly Fee</th>
                    <th className="py-3 px-4">Billing Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/30">
                  {businesses.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-on-surface block">{b.name}</span>
                        <span className="text-[11px] text-on-surface-variant font-mono">{b.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-semibold text-[10px] text-on-surface border border-surface-variant/40">
                          {b.plan === "card_500" 
                            ? "Card ₹500" 
                            : b.plan === "standee_1500" 
                            ? "Standee ₹1,500" 
                            : b.plan === "standee_auto_2000"
                            ? "Auto Reply ₹2,000"
                            : b.plan === "franchise_custom"
                            ? "Franchise Fleet (Custom)"
                            : "Not Selected"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-secondary">
                        {b.plan === "card_500" 
                          ? "₹0 / mo" 
                          : b.plan === "franchise_custom"
                          ? "Custom SaaS"
                          : "₹1,000 / mo"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.payment_status === "paid" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
                        }`}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenPlanModal(b)}
                            className="px-3 py-1 rounded-lg bg-surface border border-surface-variant/50 hover:bg-surface-container font-bold text-[11px] text-on-surface cursor-pointer"
                          >
                            Change Plan
                          </button>
                          <button
                            onClick={() => handleDeletePlan(b.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 font-bold text-[11px] text-rose-700 cursor-pointer"
                            title="Cancel subscription / reset"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FRANCHISE & MULTI-OUTLET CUSTOM QUOTATIONS HUB                     */}
      {/* ========================================================================= */}
      {adminTab === "quotations" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-xl text-on-surface">
                    Franchise &amp; Multi-Outlet Custom Quotations Hub
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-bold">
                    Enterprise Pipeline
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Review, contact, and manage multi-location standee orders, individual branch QR requests, and franchise quotations.
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-700">
                {quotations.filter((q) => q.status === "pending_review").length} Pending Review
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-700">
                {quotations.filter((q) => q.status === "approved").length} Approved
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container-low border border-surface-variant/40">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search by franchise name, city, contact person, or quote ID..."
                value={quoteSearchQuery}
                onChange={(e) => setQuoteSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-surface-variant/40 text-xs text-on-surface focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-medium">Filter:</span>
              <select
                value={quoteStatusFilter}
                onChange={(e) => setQuoteStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-surface border border-surface-variant/40 text-xs font-bold text-on-surface focus:outline-none"
              >
                <option value="all">All Quotations ({quotations.length})</option>
                <option value="pending_review">Pending Review</option>
                <option value="contacted">Contacted</option>
                <option value="quote_sent">Quote Sent</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          {/* Quotations Table */}
          <div className="rounded-2xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant/40 text-on-surface-variant uppercase text-[10px] font-mono tracking-wider font-semibold">
                    <th className="py-3 px-4">Quote ID &amp; Date</th>
                    <th className="py-3 px-4">Franchise &amp; Location</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Configuration</th>
                    <th className="py-3 px-4">Estimated Value</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/30">
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant text-xs">
                        No franchise quotations found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((q) => {
                      const cleanPhone = (q.phone || "").replace(/\D/g, "");
                      return (
                        <tr key={q.id} className="hover:bg-surface-container-low/50">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-amber-600 block">{q.id}</span>
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              {new Date(q.at).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-on-surface block">{q.business_name}</span>
                            <span className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-secondary" />
                              <span>{q.city || "Pan-India"}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-on-surface block">{q.contact_name}</span>
                            <span className="text-[11px] text-on-surface-variant block font-mono">{q.phone}</span>
                            <span className="text-[10px] text-zinc-400 block font-mono">{q.email}</span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-surface-container font-bold text-[10px] text-on-surface border border-surface-variant/40">
                                {q.branch_count} Branches
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-surface-container font-bold text-[10px] text-on-surface border border-surface-variant/40">
                                {q.standee_count} Standees
                              </span>
                              {q.multiple_qr && (
                                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-700 font-bold text-[9px]">
                                  Multi-QR
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant block capitalize">
                              Finish: {q.hardware_type.replace(/_/g, " ")}
                            </span>
                            {q.notes && (
                              <p className="text-[10px] text-zinc-500 italic mt-1 max-w-xs line-clamp-2" title={q.notes}>
                                &quot;{q.notes}&quot;
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-emerald-600 block">
                              ₹{q.estimated_hardware_total?.toLocaleString("en-IN")} Hardware
                            </span>
                            <span className="text-[10px] text-on-surface-variant block font-mono">
                              + ₹{q.estimated_monthly_sub?.toLocaleString("en-IN")}/mo SaaS
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={q.status}
                              onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value as any)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border cursor-pointer focus:outline-none ${
                                q.status === "approved"
                                  ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                                  : q.status === "quote_sent"
                                  ? "bg-blue-500/15 text-blue-700 border-blue-500/30"
                                  : q.status === "contacted"
                                  ? "bg-purple-500/15 text-purple-700 border-purple-500/30"
                                  : "bg-amber-500/15 text-amber-700 border-amber-500/30"
                              }`}
                            >
                              <option value="pending_review">PENDING REVIEW</option>
                              <option value="contacted">CONTACTED</option>
                              <option value="quote_sent">QUOTE SENT</option>
                              <option value="approved">APPROVED</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(q.contact_name)},%20this%20is%20ZenTap%20regarding%20your%20franchise%20quotation%20${q.id}%20for%20${encodeURIComponent(q.business_name)}.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                                  title="Chat with Franchise Client on WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {q.email && (
                                <a
                                  href={`mailto:${q.email}?subject=ZenTap%20Franchise%20Standee%20Quotation%20${q.id}&body=Hello%20${encodeURIComponent(q.contact_name)},`}
                                  className="p-1.5 rounded-lg bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                                  title="Send Email Quote"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


        </main>
      </div>

      {/* ========================================================================= */}
      {/* ALL MODALS PRESERVED                                                      */}
      {/* ========================================================================= */}
            {/* ========================================================================= */}
      {/* MODAL 1: CUSTOMIZE BUSINESS NAME, SLUG & GOOGLE REVIEW DESTINATION        */}
      {/* ========================================================================= */}
      {nameModalOpen && selectedBizForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Customize Business Name &amp; URL Slug
                </h3>
              </div>
              <button
                onClick={() => setNameModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              If the client registered with an auto-generated email handle or incomplete name, enter their formal business name below. This name will automatically appear on their merchant portal login and physical standee touchpoints.
            </p>

            <form onSubmit={handleSaveCustomizedProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Customized Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={customBizName}
                  onChange={(e) => setCustomBizName(e.target.value)}
                  placeholder="e.g. Royal Cafe & Bakers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-on-surface">
                    Standee Customer URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[10px] font-bold text-secondary hover:underline cursor-pointer"
                  >
                    Auto-Generate from Name
                  </button>
                </div>
                <div className="flex items-center rounded-xl bg-surface-container border border-surface-variant px-3 py-2">
                  <span className="text-xs text-on-surface-variant font-mono mr-1">/r/</span>
                  <input
                    type="text"
                    required
                    value={customBizSlug}
                    onChange={(e) => setCustomBizSlug(e.target.value.toLowerCase().replace(/[\s_]+/g, "-"))}
                    className="w-full bg-transparent text-xs font-mono text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Connect Google Review Link (Direct Write-Review)
                </label>
                <input
                  type="url"
                  value={customReviewUrl}
                  onChange={(e) => setCustomReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/your-code/review"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Google Business Profile (Maps Listing) Link
                </label>
                <input
                  type="url"
                  value={customGbpLink}
                  onChange={(e) => setCustomGbpLink(e.target.value)}
                  placeholder="https://maps.google.com/?cid=..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">City</label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Phone</label>
                  <input
                    type="text"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-variant/30">
                <button
                  type="button"
                  onClick={() => setNameModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-sm"
                >
                  Save &amp; Apply Supreme Authority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PLACE HARDWARE STANDEE ORDER                                     */}
      {/* ========================================================================= */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Dispatch Hardware Standee Order
                </h3>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStandeeOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Select Target Business *
                </label>
                <select
                  value={orderTargetBizId}
                  onChange={(e) => setOrderTargetBizId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city || "India"}) — /r/{b.slug}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Hardware Model / Plan *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderPlan("card_500")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      orderPlan === "card_500" ? "border-primary bg-primary/10 font-bold" : "border-surface-variant/40 bg-surface-container"
                    }`}
                  >
                    <span className="block text-xs text-on-surface">NFC Card</span>
                    <span className="font-bold text-sm text-primary">₹500</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderPlan("standee_1500")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      orderPlan === "standee_1500" ? "border-secondary bg-secondary/15 font-bold" : "border-surface-variant/40 bg-surface-container"
                    }`}
                  >
                    <span className="block text-xs text-on-surface">Auto Standee</span>
                    <span className="font-bold text-sm text-secondary">₹1,500</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderPlan("standee_auto_2000")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      orderPlan === "standee_auto_2000" ? "border-purple-500 bg-purple-500/15 font-bold" : "border-surface-variant/40 bg-surface-container"
                    }`}
                  >
                    <span className="block text-xs text-on-surface">Standee+Reply</span>
                    <span className="font-bold text-sm text-purple-600">₹2,000</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderPlan("franchise_custom")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      orderPlan === "franchise_custom" ? "border-amber-500 bg-amber-500/15 font-bold" : "border-surface-variant/40 bg-surface-container"
                    }`}
                  >
                    <span className="block text-xs text-on-surface">Franchise Fleet</span>
                    <span className="font-bold text-sm text-amber-600">Custom</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Shipping Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderPincode}
                    onChange={(e) => setOrderPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs font-mono text-on-surface focus:outline-none"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs text-on-surface-variant">
                  <span>Courier: </span>
                  <strong className="text-on-surface">₹{courierCalculation.amount}</strong>
                  <span className="block text-[10px] text-emerald-600 font-semibold">{courierCalculation.zone}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Counter / Billing Shipping Address
                </label>
                <textarea
                  rows={2}
                  value={orderAddress}
                  onChange={(e) => setOrderAddress(e.target.value)}
                  placeholder="Shop No., Landmark, City, State..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container flex justify-between items-center text-xs">
                <span>Total Order Cost:</span>
                <span className="font-headline font-black text-base text-primary">
                  ₹{baseOrderPrice + courierCalculation.amount}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/30">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-sm"
                >
                  Dispatch Hardware Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CHANGE OR DELETE PLAN                                            */}
      {/* ========================================================================= */}
      {planModalOpen && selectedBizForPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-secondary" />
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Manage Plan &amp; Billing
                </h3>
              </div>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Changing plan for <strong>{selectedBizForPlan.name}</strong>.
            </p>

            <form onSubmit={handleSavePlanChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Select Active Tier
                </label>
                <select
                  value={selectedPlanValue}
                  onChange={(e: any) => setSelectedPlanValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                >
                  <option value="card_500">Normal Smart NFC Review Card (₹500)</option>
                  <option value="standee_1500">Auto Google Review Standee (₹1,500 + ₹1,000/mo)</option>
                  <option value="standee_auto_2000">Auto Standee + Reply Engine (₹2,000 + ₹1,000/mo)</option>
                  <option value="franchise_custom">Franchise Multi-Outlet Fleet (Custom Quotation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Billing State
                </label>
                <select
                  value={selectedBillingStatus}
                  onChange={(e: any) => setSelectedBillingStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                >
                  <option value="paid">PAID (Subscribed &amp; Verified)</option>
                  <option value="pending">PENDING (Awaiting Checkout / Trial)</option>
                  <option value="failed">FAILED (Payment Failed / Grace Period)</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-surface-variant/30">
                <button
                  type="button"
                  onClick={() => handleDeletePlan(selectedBizForPlan.id)}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Delete / Reset Plan
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ONBOARD NEW CLIENT BUSINESS                                      */}
      {/* ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#D94826]" />
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Onboard Client Business to Fleet
                </h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="e.g. Royal Bakers & Sweets"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Email</label>
                  <input
                    type="email"
                    value={newBizEmail}
                    onChange={(e) => setNewBizEmail(e.target.value)}
                    placeholder="merchant@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">City</label>
                  <input
                    type="text"
                    value={newBizCity}
                    onChange={(e) => setNewBizCity(e.target.value)}
                    placeholder="e.g. Ahmedabad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Plan</label>
                  <select
                    value={newBizPlan}
                    onChange={(e: any) => setNewBizPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  >
                    <option value="card_500">NFC Card (₹500)</option>
                    <option value="standee_1500">Auto Standee (₹1,500)</option>
                    <option value="standee_auto_2000">Auto Reply Standee (₹2,000)</option>
                    <option value="franchise_custom">Franchise Multi-Outlet Fleet (Custom Quote)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Google Review URL (Optional - can be linked later)
                </label>
                <input
                  type="url"
                  value={newBizReviewUrl}
                  onChange={(e) => setNewBizReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/.../review"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs font-mono text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/30">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D94826] text-white text-xs font-bold hover:bg-[#C23C1D] cursor-pointer shadow-sm"
                >
                  Onboard Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: LASER PRINTABLE QR CODE (LEVEL Q PNG & SVG)                      */}
      {/* ========================================================================= */}
      {qrModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-surface-variant/40 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant/30">
              <h3 className="font-headline font-bold text-base text-on-surface">
                Standee Laser QR (Level Q)
              </h3>
              <button
                onClick={() => setQrModalBiz(null)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              High-resolution vector assets for <strong>{qrModalBiz.name}</strong>.
            </p>

            <div className="p-3 bg-white rounded-2xl shadow-inner border border-surface-variant/30 inline-block">
              {qrPngUrl && <img src={qrPngUrl} alt="QR" className="w-44 h-44 rounded" />}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDownloadPng}
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res 1200px PNG</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-surface-variant/40"
              >
                <Download className="w-4 h-4" />
                <span>Download Vector SVG for CNC Laser</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADMIN SECURITY & PASSWORD SETTINGS                               */}
      {/* ========================================================================= */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Admin Password &amp; Security
                </h3>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminPasswordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600">
                {adminPasswordError}
              </div>
            )}

            {adminPasswordMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-700">
                {adminPasswordMsg}
              </div>
            )}

            <form onSubmit={handleChangeAdminPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">New Admin Password</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Confirm New Admin Password</label>
                <input
                  type="password"
                  required
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  disabled={adminPasswordUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {adminPasswordUpdating ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={handleSendAdminResetEmail}
                  className="px-3 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high cursor-pointer border border-surface-variant/40"
                >
                  Send Recovery Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customize Review Categories Modal ("What did you like most?") */}
      {chipsModalOpen && selectedBizForChips && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    Customize Review Categories
                  </h3>
                  <span className="text-xs text-on-surface-variant block">
                    {selectedBizForChips.name} (/r/{selectedBizForChips.slug})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setChipsModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              These are the positive category chips displayed under <strong>&quot;What did you like most?&quot;</strong> on this merchant&apos;s live Google review assistant page. Patrons can tap them to feed the smart review writer.
            </p>

            {/* Add New Tag */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface">Add Category Tag</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adminNewChip}
                  onChange={(e) => setAdminNewChip(e.target.value)}
                  placeholder="e.g. 24K Hallmark Certified, Delicious Dessert..."
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAdminChip();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddAdminChip}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs cursor-pointer shadow-sm"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Current Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">
                  Active Categories ({adminChipsList.length})
                </span>
                <button
                  type="button"
                  onClick={handleResetAdminChips}
                  className="text-[11px] text-amber-700 hover:underline cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {adminChipsList.map((chip) => (
                  <div
                    key={chip}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-surface-variant/60 text-xs font-semibold text-on-surface flex items-center gap-2"
                  >
                    <span>{chip}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdminChip(chip)}
                      className="text-on-surface-variant hover:text-red-500 cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-variant/30">
              <button
                type="button"
                onClick={() => setChipsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdminChips}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-sm"
              >
                Save Categories
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
