"use client";

import React, { useState, useEffect, useRef } from "react";
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
  RotateCcw,
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
  Tag,
  Plus,
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
  Bell,
  MessageSquare,
  Palette,
  Share2,
  Eye,
} from "lucide-react";
import { 
  BusinessRecord, 
  getAllBusinesses, 
  adminUpdateBusinessRecord, 
  addBusinessRecord,
  softDeleteBusiness,
  restoreBusiness,
  permanentlyDeleteBusiness,
  generatePermanentSlug,
  updateBusinessRedirectMode,
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
  ProductPlan,
  TagRecord,
  TagType,
  TagForm,
  TagDestination,
  getAllTags,
  generateTagBatch,
  createSingleTag,
  toggleTagChipWritten,
  ensureLegacyTagForSlug,
  assignTag,
  releaseTag,
  toggleTagActive,
  updateTagDestination,
  updateTagDetails,
  softDeleteBusinessWithTags,
  PartnerRecord,
  ResetRequestRecord,
  getAllPartners,
  getAllResetRequests,
  purgeBusinessRecord,
  batchAssignTags,
  getPurgedBusinessIds,
  generateNextBusinessIdCode,
  getBusinessIdCode
} from "@/lib/businessStore";
import JSZip from "jszip";
import PartnersTab from "@/components/admin/PartnersTab";
import PlatformSettingsTab from "@/components/admin/PlatformSettingsTab";
import OverviewWebpageTab from "@/components/admin/tabs/OverviewWebpageTab";
import ClientsWebpageTab from "@/components/admin/tabs/ClientsWebpageTab";
import PaymentsWebpageTab from "@/components/admin/tabs/PaymentsWebpageTab";
import QrNfcGeneratorWebpageTab from "@/components/admin/tabs/QrNfcGeneratorWebpageTab";
import GoogleLinksWebpageTab from "@/components/admin/tabs/GoogleLinksWebpageTab";
import SocialLinksWebpageTab from "@/components/admin/tabs/SocialLinksWebpageTab";
import PageEditorWebpageTab from "@/components/admin/tabs/PageEditorWebpageTab";
import ManualPaymentsTab from "@/components/admin/ManualPaymentsTab";
import LinksAndQrSettingsTab from "@/components/admin/LinksAndQrSettingsTab";
import SocialLinksAndQrSettingsTab from "@/components/admin/SocialLinksAndQrSettingsTab";
import { getManualPaymentStats, saveManualPayment, getAllManualPayments } from "@/lib/manualPaymentStore";
import BulkAssignCardsModal from "@/components/admin/BulkAssignCardsModal";
import QuickSocialEditModal from "@/components/admin/QuickSocialEditModal";
import { useAuth } from "@/context/AuthContext";
import {
  ClientRecord,
  DeletedBusinessRecord,
  PaymentItemRecord,
  QrNfcTagItemRecord,
  GoogleReviewLinkItemRecord,
  SocialLinkItemRecord,
  PageEditorConfigItemRecord,
  getAllClients,
  getAllDeletedBusinesses,
  getAllPayments,
  getAllDeletedPayments,
  getAllQrNfcTags,
  getAllGoogleReviewLinks,
  getAllSocialLinks,
  getAllPageEditorConfigs,
  initPlatformStoreFromBackend,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";
import { 
  fetchDbAdminBusinesses, 
  updateDbReviewUrl, 
  upsertUserBusinessInDb, 
  adminUpdateDbBusiness,
  adminCreateDbBusiness,
  adminSoftDeleteDbBusiness,
  adminRestoreDbBusiness,
  adminPermanentDeleteDbBusiness,
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
  const { user, isAdmin, loading, updateUserPassword, resetPasswordForEmail, signOut } = useAuth();
  
  // Navigation Tabs: Analytics Dashboard vs Fleet Table vs Standee Orders vs Plans vs Franchise Quotes
  
  type AdminMenuItem = 
    | "overview"
    | "clients"
    | "manual_payments"
    | "tags"
    | "review_links"
    | "social_links"
    | "page_designer"
    | "settings";

  const [adminMenu, setAdminMenu] = useState<AdminMenuItem>("overview");

  // Sync tab with URL search parameter (?tab=clients, ?tab=payments, etc.)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        const tabMap: Record<string, AdminMenuItem> = {
          overview: "overview",
          clients: "clients",
          payments: "manual_payments",
          manual_payments: "manual_payments",
          generator: "tags",
          tags: "tags",
          google_links: "review_links",
          review_links: "review_links",
          social_links: "social_links",
          page_editor: "page_designer",
          page_designer: "page_designer",
          settings: "settings",
        };
        if (tabMap[tabParam]) {
          setAdminMenu(tabMap[tabParam]);
        }
      }
    }
  }, []);

  const handleSelectTab = (menu: AdminMenuItem) => {
    setAdminMenu(menu);
    setMobileMenuOpen(false);
    refreshPlatformData();
    if (typeof window !== "undefined") {
      const slugMap: Record<AdminMenuItem, string> = {
        overview: "overview",
        clients: "clients",
        manual_payments: "payments",
        tags: "generator",
        review_links: "google_links",
        social_links: "social_links",
        page_designer: "page_editor",
        settings: "settings",
      };
      const url = new URL(window.location.href);
      url.searchParams.set("tab", slugMap[menu] || menu);
      window.history.pushState({}, "", url.toString());
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [adminNotificationOpen, setAdminNotificationOpen] = useState(false);

  // Click-outside listener refs for header popovers
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const adminNotificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target as Node)
      ) {
        setAdminDropdownOpen(false);
      }
      if (
        adminNotificationRef.current &&
        !adminNotificationRef.current.contains(event.target as Node)
      ) {
        setAdminNotificationOpen(false);
      }
    }

    if (adminDropdownOpen || adminNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [adminDropdownOpen, adminNotificationOpen]);

  // Clean exit session handler redirecting to the main website homepage
  const handleExitAdminSession = async () => {
    setAdminDropdownOpen(false);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("zentap_admin_supreme");
        localStorage.removeItem("zentap_admin_authenticated");
        sessionStorage.clear();
        document.cookie = "zentap_admin=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "sb-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      if (signOut) {
        await signOut();
      }
    } catch (err) {
      console.warn("Exit admin session notice:", err);
    }
    if (onNavigate) {
      onNavigate("home");
    }
    window.location.href = "/";
  };

  const [adminTab, setAdminTab] = useState<"analytics" | "fleet" | "orders" | "plans" | "quotations">("analytics");

  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [partners, setPartners] = useState<PartnerRecord[]>(() => getAllPartners());
  const [resetRequests, setResetRequests] = useState<ResetRequestRecord[]>(() => getAllResetRequests());
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState("");
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<"all" | "pending_review" | "contacted" | "quote_sent" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "awaiting_link" | "name_pending" | "paid" | "pending" | "deleted" | "direct_mode">("all");
  const [toastMsg, setToastMsg] = useState("");

  // Live Unified Platform State for Overview and All Operations
  const [platformClients, setPlatformClients] = useState<ClientRecord[]>(() => getAllClients());
  const [platformDeletedClients, setPlatformDeletedClients] = useState<DeletedBusinessRecord[]>(() => getAllDeletedBusinesses());
  const [platformPayments, setPlatformPayments] = useState<PaymentItemRecord[]>(() => getAllPayments());
  const [platformTags, setPlatformTags] = useState<QrNfcTagItemRecord[]>(() => getAllQrNfcTags());
  const [platformGoogleLinks, setPlatformGoogleLinks] = useState<GoogleReviewLinkItemRecord[]>(() => getAllGoogleReviewLinks());
  const [platformSocialLinks, setPlatformSocialLinks] = useState<SocialLinkItemRecord[]>(() => getAllSocialLinks());
  const [platformPageEditors, setPlatformPageEditors] = useState<PageEditorConfigItemRecord[]>(() => getAllPageEditorConfigs());
  const [overviewSelectedBizId, setOverviewSelectedBizId] = useState<string>("all");

  const refreshPlatformData = () => {
    setPlatformClients(getAllClients());
    setPlatformDeletedClients(getAllDeletedBusinesses());
    setPlatformPayments(getAllPayments());
    setPlatformTags(getAllQrNfcTags());
    setPlatformGoogleLinks(getAllGoogleReviewLinks());
    setPlatformSocialLinks(getAllSocialLinks());
    setPlatformPageEditors(getAllPageEditorConfigs());
  };

  useEffect(() => {
    refreshPlatformData();
    initPlatformStoreFromBackend().then(() => {
      refreshPlatformData();
    });

    const handleUpdate = () => refreshPlatformData();
    window.addEventListener("zentap_platform_updated", handleUpdate);
    return () => window.removeEventListener("zentap_platform_updated", handleUpdate);
  }, []);

  const pendingRequestsCount = resetRequests.filter((r) => r.status === "pending").length;

  // New Modals State
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [quickSocialBiz, setQuickSocialBiz] = useState<BusinessRecord | null>(null);
  const [permDeleteConfirmInput, setPermDeleteConfirmInput] = useState("");

  // Physical Tags Layer State (Standees & Cards)
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<"all" | "ready_to_give_out" | "standee" | "card" | "assigned" | "unassigned">("all");
  const [singleTagModalOpen, setSingleTagModalOpen] = useState(false);
  const [singleTagCode, setSingleTagCode] = useState("");
  const [singleTagForm, setSingleTagForm] = useState<TagForm>("standee");
  const [singleTagChipWritten, setSingleTagChipWritten] = useState(false);
  const [singleTagBusinessId, setSingleTagBusinessId] = useState("");
  const [singleTagType, setSingleTagType] = useState<TagType>("review");
  const [singleTagDestination, setSingleTagDestination] = useState<TagDestination>("zentap_page");
  const [singleTagLabel, setSingleTagLabel] = useState("");
  const [singleTagWhatsappNumber, setSingleTagWhatsappNumber] = useState("");
  const [singleTagWhatsappMessage, setSingleTagWhatsappMessage] = useState("");
  const [singleTagInstagramHandle, setSingleTagInstagramHandle] = useState("");
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchCount, setBatchCount] = useState<number>(50);
  const [batchForm, setBatchForm] = useState<TagForm>("standee");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTagForAssign, setSelectedTagForAssign] = useState<TagRecord | null>(null);
  const [assignBusinessId, setAssignBusinessId] = useState<string>("");
  const [assignType, setAssignType] = useState<TagType>("review");
  const [assignLabel, setAssignLabel] = useState<string>("");
  const [assignWhatsappNumber, setAssignWhatsappNumber] = useState<string>("");
  const [assignWhatsappMessage, setAssignWhatsappMessage] = useState<string>("");
  const [assignInstagramHandle, setAssignInstagramHandle] = useState<string>("");
  const [takeBackModalTag, setTakeBackModalTag] = useState<TagRecord | null>(null);
  const [tagQrModalTag, setTagQrModalTag] = useState<TagRecord | null>(null);
  const [tagQrPng, setTagQrPng] = useState<string>("");
  const [tagQrSvg, setTagQrSvg] = useState<string>("");

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
  const [newBizSlug, setNewBizSlug] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newBizEmail, setNewBizEmail] = useState("");
  const [newBizPhone, setNewBizPhone] = useState("");
  const [newBizCity, setNewBizCity] = useState("Ahmedabad");
  const [newBizPlan, setNewBizPlan] = useState<ProductPlan>("standee_1500");
  const [newBizPaymentStatus, setNewBizPaymentStatus] = useState<"paid" | "pending" | "failed">("pending");
  const [newBizReviewUrl, setNewBizReviewUrl] = useState("");
  const [newBizWhatsapp, setNewBizWhatsapp] = useState("");
  const [newBizInstagram, setNewBizInstagram] = useState("");
  const [newBizRedirectMode, setNewBizRedirectMode] = useState<"interactive_profile" | "direct_review">("interactive_profile");
  const [newBizActive, setNewBizActive] = useState(true);
  const [newBizValidUntil, setNewBizValidUntil] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split("T")[0];
  });

  // Soft Delete & Permanent Delete Confirmation Modals
  const [softDeleteModalBiz, setSoftDeleteModalBiz] = useState<BusinessRecord | null>(null);
  const [permDeleteModalBiz, setPermDeleteModalBiz] = useState<BusinessRecord | null>(null);

  // Multi-Asset QR Modal State (Review, WhatsApp, Instagram)
  const [qrModalBiz, setQrModalBiz] = useState<BusinessRecord | null>(null);
  const [qrActiveTab, setQrActiveTab] = useState<"review" | "whatsapp" | "instagram">("review");
  const [qrAssets, setQrAssets] = useState<{
    review: { png: string; svg: string; url: string };
    whatsapp: { png: string; svg: string; url: string };
    instagram: { png: string; svg: string; url: string };
  }>({
    review: { png: "", svg: "", url: "" },
    whatsapp: { png: "", svg: "", url: "" },
    instagram: { png: "", svg: "", url: "" },
  });

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



  // Load All Businesses, Orders & Physical Tags
  useEffect(() => {
    async function loadAdminData() {
      // 1. Initial local load
      const local = getAllBusinesses();
      setBusinesses(local);
      const localOrders = getAllOrders();
      setOrders(localOrders);
      const localQuotes = getAllQuotations();
      setQuotations(localQuotes);
      const localTags = getAllTags();
      setTags(localTags);

      // 2. Fetch all merchant records from Supabase
      try {
        const purgedIds = getPurgedBusinessIds();
        const remote = await fetchDbAdminBusinesses();
        if (remote && remote.length > 0) {
          const formatted: BusinessRecord[] = remote
            .filter((b) => !purgedIds.includes(b.id))
            .map((b) => ({
              id: b.id,
              business_id_code: b.business_id_code || undefined,
              owner_user_id: b.owner_user_id,
              name: b.name,
              owner_name: b.owner_name || "",
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
              google_review_link: b.google_review_link || b.review_url || "",
              active: b.active,
              is_deleted: !!b.is_deleted,
              deleted_at: b.deleted_at || null,
              address: b.address || "",
              category: b.category || "",
              created_at: b.created_at,
            }));

          const merged = formatted.map((rem) => {
            const loc = local.find((l) => l.id === rem.id);
            if (loc && loc.is_deleted && !rem.is_deleted) {
              return { ...rem, is_deleted: true, active: false };
            }
            return rem;
          });
          local.forEach((loc) => {
            if (!purgedIds.includes(loc.id) && !merged.some((m) => m.id === loc.id || m.slug === loc.slug)) {
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
    if (confirm("Supreme Authority Confirmation: Reset plan and mark payment pending?")) {
      const updates = {
        plan: "card_500" as const,
        payment_status: "pending" as const,
      };
      const updated = adminUpdateBusinessRecord(bizId, updates);
      adminUpdateDbBusiness(bizId, updates).catch((err) => console.warn(err));
      setBusinesses(updated);
      setPlanModalOpen(false);
      showToast("✓ Plan subscription reset to pending status.");
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
  // ACTION: Add Business (Supreme Admin Creation)
  // -------------------------------------------------------------
  const handleAddNewBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    // Auto-generate unique permanent slug and sequential Business ID
    const nextBizIdCode = generateNextBusinessIdCode();
    const baseSlug = generatePermanentSlug(newBizName.trim());
    let cleanSlug = baseSlug.toLowerCase();
    if (businesses.some((b) => b.slug.toLowerCase() === cleanSlug)) {
      cleanSlug = `${cleanSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 1. Create in Supabase Database first to acquire real backend UUID
    let dbId: string | null = null;
    try {
      const dbRecord = await adminCreateDbBusiness({
        business_id_code: nextBizIdCode,
        name: newBizName.trim(),
        owner_name: newOwnerName.trim(),
        email: newBizEmail.trim() || "admin@zentapdigitalsolutions.com",
        phone: newBizPhone.trim(),
        city: newBizCity.trim() || "Ahmedabad",
        state: "Gujarat",
        country: "India",
        pincode: "380001",
        slug: cleanSlug,
        plan: newBizPlan,
        payment_status: "pending",
        review_url: null,
        whatsapp_number: newBizWhatsapp.trim(),
        instagram_url: newBizInstagram.trim(),
        redirect_mode: "interactive_profile",
        active: false, // Locked until payment confirmation
        service_valid_until: newBizValidUntil,
      });
      if (dbRecord && dbRecord.id) {
        dbId = dbRecord.id;
      }
    } catch (err) {
      console.warn("Database creation error:", err);
    }

    // 2. Add to isomorphic businessStore
    const newRecord = addBusinessRecord({
      ...(dbId ? { id: dbId } : {}),
      business_id_code: nextBizIdCode,
      name: newBizName.trim(),
      owner_name: newOwnerName.trim(),
      email: newBizEmail.trim() || "admin@zentapdigitalsolutions.com",
      phone: newBizPhone.trim(),
      city: newBizCity.trim() || "Ahmedabad",
      state: "Gujarat",
      country: "India",
      pincode: "380001",
      gbp_link: "",
      slug: cleanSlug,
      plan: newBizPlan,
      payment_status: "pending",
      review_url: null,
      whatsapp_number: newBizWhatsapp.trim(),
      instagram_url: newBizInstagram.trim(),
      redirect_mode: "interactive_profile",
      active: false, // Locked until payment confirmation
      service_valid_until: newBizValidUntil,
      owner_user_id: dbId || `admin-managed-${Date.now()}`,
    });

    // 3. Automatically record entry in Manual Payments ledger as Unpaid
    const planPrices: Record<string, number> = {
      business_review_standee: 999,
      zentap_smart_review_standee: 1499,
      zentap_smart_business_card: 699,
      custom_solution: 2499,
    };
    const agreedAmount = planPrices[newBizPlan] || 999;
    saveManualPayment({
      business_id: newRecord.id,
      business_name: newRecord.name,
      product_purchased: newBizPlan,
      total_agreed_amount: agreedAmount,
      amount_received: 0,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "upi",
      payment_status: "pending",
      admin_notes: "Initial registration (Awaiting payment confirmation to activate hardware)",
    });

    const updated = [newRecord, ...businesses.filter((b) => b.id !== newRecord.id && b.slug !== newRecord.slug)];
    setBusinesses(updated);

    setAddModalOpen(false);
    setNewBizName("");
    setNewBizSlug("");
    setNewOwnerName("");
    setNewBizEmail("");
    setNewBizPhone("");
    setNewBizCity("Ahmedabad");
    setNewBizReviewUrl("");
    setNewBizWhatsapp("");
    setNewBizInstagram("");
    setNewBizPlan("business_review_standee");
    setNewBizRedirectMode("interactive_profile");
    setNewBizActive(false);
    setNewBizPaymentStatus("pending");
    showToast(`✓ Business "${newRecord.name}" registered as Unpaid! Confirm payment in Clients or Payments tab to activate hardware.`);
  };

  // -------------------------------------------------------------
  // ACTION: Confirm Payment & Unlock Hardware Activation Gate
  // -------------------------------------------------------------
  const handleConfirmPayment = (biz: BusinessRecord) => {
    // 1. Update business payment status to paid & turn link ON
    adminUpdateBusinessRecord(biz.id, { payment_status: "paid", active: true });
    adminUpdateDbBusiness(biz.id, { payment_status: "paid", active: true }).catch((e) => console.warn(e));

    // 2. Synchronize with manual payment ledger
    const payments = getAllManualPayments();
    const existing = payments.find((p) => p.business_id === biz.id || p.business_name === biz.name);
    if (existing) {
      saveManualPayment({
        ...existing,
        amount_received: existing.total_agreed_amount,
        payment_status: "completed",
        admin_notes: (existing.admin_notes ? existing.admin_notes + " • " : "") + "Payment confirmed via 1-click admin action.",
      });
    }

    setBusinesses(getAllBusinesses());
    showToast(`✓ Payment confirmed for "${biz.name}"! Standee routing and features unlocked.`);
  };

  // -------------------------------------------------------------
  // ACTION: Soft Delete / Restore / Permanent Delete
  // -------------------------------------------------------------
  const handleExecuteSoftDelete = (biz: BusinessRecord) => {
    const { releasedTagsCount, businesses: updated } = softDeleteBusinessWithTags(biz.id);
    adminSoftDeleteDbBusiness(biz.id).catch((e) => console.warn(e));
    setBusinesses(updated);
    setTags(getAllTags());
    setSoftDeleteModalBiz(null);
    showToast(
      releasedTagsCount > 0
        ? `✓ "${biz.name}" deleted. Moved to Deleted tab (${releasedTagsCount} standee/card(s) freed up).`
        : `✓ "${biz.name}" deleted. Moved to Deleted tab.`
    );
  };

  const handleRestoreBusiness = (biz: BusinessRecord) => {
    // Check if slug or email clashes with an active business
    const clash = businesses.find(
      (b) => !b.is_deleted && (b.slug.toLowerCase() === biz.slug.toLowerCase() || (biz.email && b.email.toLowerCase() === biz.email.toLowerCase()))
    );
    if (clash) {
      showToast(`⚠️ Cannot restore: Active business "${clash.name}" already uses slug "/r/${biz.slug}". Rename or change slug first.`);
      return;
    }
    const updated = restoreBusiness(biz.id);
    adminRestoreDbBusiness(biz.id).catch((e) => console.warn(e));
    setBusinesses(updated);
    showToast(`✓ "${biz.name}" restored & activated on main list!`);
  };

  const handleExecutePermanentDelete = (biz: BusinessRecord) => {
    const res = purgeBusinessRecord(biz.id);
    if (!res.success) {
      showToast(`❌ ${res.error}`);
      return;
    }
    adminPermanentDeleteDbBusiness(biz.id).catch((e) => console.warn(e));
    setBusinesses((prev) => prev.filter((b) => b.id !== biz.id));
    setTags(getAllTags());
    setPermDeleteModalBiz(null);
    setPermDeleteConfirmInput("");
    showToast(`✓ "${biz.name}" permanently deleted.`);
  };

  const handleExportNfcCsv = () => {
    const domain = (typeof window !== "undefined" && localStorage.getItem("zentap_site_domain")) || (typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com");
    const rows = [
      ["Tag Code", "Item Form", "NFC Link", "QR Link", "Assigned Business", "Status"],
      ...tags.map((t) => [
        t.code,
        t.form,
        `${domain}/t/${t.code}?s=nfc`,
        `${domain}/t/${t.code}?s=qr`,
        t.business_name || "Unassigned",
        t.active ? "Active" : "Inactive"
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zentap_tags_nfc_manifest_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Exported NFC Links CSV!");
  };

  const handleDownloadQrZip = async () => {
    try {
      showToast("Generating QR codes ZIP bundle...");
      const domain = (typeof window !== "undefined" && localStorage.getItem("zentap_site_domain")) || (typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com");
      const zip = new JSZip();
      const folder = zip.folder("zentap_qr_codes");
      for (const t of tags) {
        const url = `${domain}/t/${t.code}?s=qr`;
        const pngData = await QRCode.toDataURL(url, { width: 1000, margin: 2, errorCorrectionLevel: "Q" });
        const svgData = await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "Q" });
        const base64Png = pngData.replace(/^data:image\/png;base64,/, "");
        folder?.file(`${t.code}.png`, base64Png, { base64: true });
        folder?.file(`${t.code}.svg`, svgData);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `zentap_qr_codes_all_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("✓ Downloaded all QR codes as ZIP!");
    } catch (err) {
      console.warn("QR ZIP error:", err);
      showToast("Failed to generate QR zip");
    }
  };

  // -------------------------------------------------------------
  // PHYSICAL TAG ACTIONS (STANDYES & CARDS LAYER)
  // -------------------------------------------------------------
  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = generateTagBatch(batchCount, batchForm);
      setTags(updated);
      setBatchModalOpen(false);
      showToast(`✓ Generated ${batchCount} new ${batchForm} codes (e.g. ${updated[0]?.code})!`);
    } catch (err: any) {
      showToast(err?.message || "Failed to generate batch.");
    }
  };

  const handleCreateSingleTag = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = createSingleTag({
        code: singleTagCode.trim() || undefined,
        form: singleTagForm,
        chip_written: singleTagChipWritten,
        business_id: singleTagBusinessId || null,
        type: singleTagBusinessId ? singleTagType : null,
        destination: singleTagDestination,
        label: singleTagLabel.trim() || undefined,
        whatsapp_number: singleTagWhatsappNumber.trim() || undefined,
        whatsapp_message: singleTagWhatsappMessage.trim() || undefined,
        instagram_handle: singleTagInstagramHandle.trim() || undefined,
      });
      setTags(updated);
      setSingleTagModalOpen(false);
      // Reset form
      setSingleTagCode("");
      setSingleTagForm("standee");
      setSingleTagChipWritten(false);
      setSingleTagBusinessId("");
      setSingleTagType("review");
      setSingleTagDestination("zentap_page");
      setSingleTagLabel("");
      setSingleTagWhatsappNumber("");
      setSingleTagWhatsappMessage("");
      setSingleTagInstagramHandle("");
      showToast(`✓ Added single tag ${updated[0]?.code.toUpperCase()}!`);
    } catch (err: any) {
      showToast(err?.message || "Failed to create single tag.");
    }
  };

  const handleToggleChipWritten = (tag: TagRecord) => {
    const updated = toggleTagChipWritten(tag.id);
    setTags(updated);
    const updatedTag = updated.find((t) => t.id === tag.id);
    showToast(
      updatedTag?.chip_written
        ? `✓ ${tag.code.toUpperCase()} marked as Chip Written & Tested! Ready to give out.`
        : `✓ ${tag.code.toUpperCase()} marked as Needs Writing.`
    );
  };

  const handleLinkLegacyStandee = (biz: BusinessRecord) => {
    try {
      const tag = ensureLegacyTagForSlug(biz.slug, biz.id);
      setTags(getAllTags());
      showToast(`✓ Standee tag created for /r/${biz.slug}! Destination can now be remotely switched.`);
    } catch (err: any) {
      showToast(err?.message || "Failed to link legacy standee.");
    }
  };

  const handleOpenAssignModal = (tag: TagRecord) => {
    setSelectedTagForAssign(tag);
    const initialBizId = tag.business_id || (businesses[0]?.id || "");
    setAssignBusinessId(initialBizId);
    setAssignType(tag.type || "review");
    setAssignLabel(tag.label || "");
    const biz = businesses.find((b) => b.id === initialBizId);
    setAssignWhatsappNumber(tag.whatsapp_number || biz?.whatsapp_number || biz?.whatsapp || "");
    setAssignWhatsappMessage(tag.whatsapp_message || biz?.whatsapp_message || `Hello ${biz?.name || "there"}! I tapped your card.`);
    setAssignInstagramHandle(tag.instagram_handle || biz?.instagram_url || biz?.instagram || "");
    setAssignModalOpen(true);
  };

  const handleExecuteAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTagForAssign || !assignBusinessId) return;

    const updated = assignTag(selectedTagForAssign.id, assignBusinessId, assignType, {
      label: assignLabel.trim() || undefined,
      whatsapp_number: assignWhatsappNumber.trim() || undefined,
      whatsapp_message: assignWhatsappMessage.trim() || undefined,
      instagram_handle: assignInstagramHandle.trim() || undefined,
    });
    setTags(updated);
    setAssignModalOpen(false);
    const biz = businesses.find((b) => b.id === assignBusinessId);
    showToast(`✓ Given ${selectedTagForAssign.code.toUpperCase()} to "${biz?.name || "Business"}"!`);
  };

  const handleExecuteTakeBack = (tag: TagRecord) => {
    const updated = releaseTag(tag.id);
    setTags(updated);
    setTakeBackModalTag(null);
    showToast(`✓ ${tag.code.toUpperCase()} taken back and freed up. Previous analytics preserved.`);
  };

  const handleToggleTagActive = (tag: TagRecord) => {
    const updated = toggleTagActive(tag.id);
    setTags(updated);
    showToast(`✓ ${tag.code.toUpperCase()} turned ${tag.active ? "OFF" : "ON"}.`);
  };

  const handleToggleTagDestination = (tag: TagRecord, dest: TagDestination) => {
    const updated = updateTagDestination(tag.id, dest);
    setTags(updated);
    showToast(`✓ ${tag.code.toUpperCase()} scan now opens: ${dest === "direct" ? "Direct Google" : "ZenTap Page"}`);
  };

  const handleCopyNfcLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com";
    const url = `${origin}/t/${code.toLowerCase()}?s=nfc`;
    navigator.clipboard.writeText(url);
    showToast(`✓ Copied NFC Link: ${url}`);
  };

  const handleOpenTagQrModal = async (tag: TagRecord) => {
    setTagQrModalTag(tag);
    const origin = typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com";
    const url = `${origin}/t/${tag.code.toLowerCase()}?s=qr`;
    try {
      const [png, svg] = await Promise.all([
        QRCode.toDataURL(url, { width: 1200, margin: 2, errorCorrectionLevel: "Q" }),
        QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "Q" }),
      ]);
      setTagQrPng(png);
      setTagQrSvg(svg);
    } catch (err) {
      console.warn("Tag QR generation error:", err);
    }
  };

  const handleDownloadTagQrPng = () => {
    if (!tagQrModalTag || !tagQrPng) return;
    const a = document.createElement("a");
    a.href = tagQrPng;
    a.download = `${tagQrModalTag.code}-qr-1200px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ ${tagQrModalTag.code.toUpperCase()} PNG QR downloaded!`);
  };

  const handleDownloadTagQrSvg = () => {
    if (!tagQrModalTag || !tagQrSvg) return;
    const blob = new Blob([tagQrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tagQrModalTag.code}-qr-vector.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✓ ${tagQrModalTag.code.toUpperCase()} Vector SVG downloaded!`);
  };

  const handleToggleRedirectMode = (biz: BusinessRecord) => {
    const nextMode = biz.redirect_mode === "direct_review" ? "interactive_profile" : "direct_review";
    const updated = updateBusinessRedirectMode(biz.id, nextMode);
    adminUpdateDbBusiness(biz.id, { redirect_mode: nextMode }).catch((e) => console.warn(e));
    setBusinesses(updated);
    showToast(
      nextMode === "interactive_profile"
        ? "✓ Redirect Mode: ZenTap Customised Page (ON)"
        : "✓ Redirect Mode: Direct Google Review Page (OFF)"
    );
  };

  const handleToggleActive = (biz: BusinessRecord) => {
    const next = !biz.active;
    const updated = adminUpdateBusinessRecord(biz.id, { active: next });
    adminUpdateDbBusiness(biz.id, { active: next }).catch((e) => console.warn(e));
    setBusinesses(updated);
    showToast(`✓ Status set to: ${next ? "ACTIVE" : "INACTIVE"}`);
  };

  // -------------------------------------------------------------
  // ACTION: Multi-Asset QR Generator (Review, WhatsApp, Instagram)
  // -------------------------------------------------------------
  const handleOpenQRModal = async (b: BusinessRecord) => {
    setQrModalBiz(b);
    setQrActiveTab("review");
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.zentapdigitalsolutions.com";
    const reviewUrl = `${origin}/r/${b.slug}?s=qr`;
    const whatsappUrl = `${origin}/w/${b.slug}`;
    const instagramUrl = `${origin}/i/${b.slug}`;

    try {
      const [reviewPng, reviewSvg, waPng, waSvg, instaPng, instaSvg] = await Promise.all([
        QRCode.toDataURL(reviewUrl, { width: 1200, margin: 2, errorCorrectionLevel: "Q" }),
        QRCode.toString(reviewUrl, { type: "svg", margin: 2, errorCorrectionLevel: "Q" }),
        QRCode.toDataURL(whatsappUrl, { width: 1200, margin: 2, errorCorrectionLevel: "Q" }),
        QRCode.toString(whatsappUrl, { type: "svg", margin: 2, errorCorrectionLevel: "Q" }),
        QRCode.toDataURL(instagramUrl, { width: 1200, margin: 2, errorCorrectionLevel: "Q" }),
        QRCode.toString(instagramUrl, { type: "svg", margin: 2, errorCorrectionLevel: "Q" }),
      ]);

      setQrAssets({
        review: { png: reviewPng, svg: reviewSvg, url: reviewUrl },
        whatsapp: { png: waPng, svg: waSvg, url: whatsappUrl },
        instagram: { png: instaPng, svg: instaSvg, url: instagramUrl },
      });
    } catch (err) {
      console.warn("QR generation error:", err);
    }
  };

  const handleDownloadActivePng = () => {
    if (!qrModalBiz) return;
    const current = qrAssets[qrActiveTab];
    if (!current?.png) return;
    const a = document.createElement("a");
    a.href = current.png;
    a.download = `${qrModalBiz.slug}-${qrActiveTab}-qr-1200px.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ ${qrActiveTab.toUpperCase()} High-Resolution 1200px PNG downloaded!`);
  };

  const handleDownloadActiveSvg = () => {
    if (!qrModalBiz) return;
    const current = qrAssets[qrActiveTab];
    if (!current?.svg) return;
    const blob = new Blob([current.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${qrModalBiz.slug}-${qrActiveTab}-qr-vector.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✓ ${qrActiveTab.toUpperCase()} Vector SVG downloaded!`);
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
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.business_id_code && b.business_id_code.toLowerCase().includes(q)) ||
      getBusinessIdCode(b).toLowerCase().includes(q) ||
      (b.city && b.city.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.phone && b.phone.includes(q)) ||
      (b.slug && b.slug.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (statusFilter === "deleted") return !!b.is_deleted;
    if (b.is_deleted) return false;
    if (statusFilter === "active") return b.active;
    if (statusFilter === "awaiting_link") return !b.review_url;
    if (statusFilter === "name_pending") return isNamePending(b);
    if (statusFilter === "paid") return b.payment_status === "paid";
    if (statusFilter === "pending") return b.payment_status === "pending";
    if ((statusFilter as any) === "direct_mode") return b.redirect_mode === "direct_review";

    return true;
  });

  // Filtered physical tags
  const filteredTags = tags.filter((t) => {
    const q = tagSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      t.code.toLowerCase().includes(q) ||
      (t.business_name && t.business_name.toLowerCase().includes(q)) ||
      (t.label && t.label.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (tagFilter === "ready_to_give_out") return !t.business_id && !!t.chip_written;
    if (tagFilter === "standee") return t.form === "standee";
    if (tagFilter === "card") return t.form === "card";
    if (tagFilter === "assigned") return !!t.business_id;
    if (tagFilter === "unassigned") return !t.business_id;

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

  // Live Unified Metrics from Platform Tables
  const platformCollectedEarnings = platformPayments
    .filter((p) => p.payment_status === "Completed paid")
    .reduce((sum, p) => sum + (Number(p.selling_rate) || 0), 0);
  const platformPendingEarnings = platformPayments
    .filter((p) => p.payment_status !== "Completed paid")
    .reduce((sum, p) => sum + (Number(p.selling_rate) || 0), 0);
  const paidDeployments = platformPayments.filter((p) => p.payment_status === "Completed paid").length;
  const totalFleetEarnings = platformCollectedEarnings;

  const totalClients = platformClients.length;
  const totalFleet = platformClients.length + platformDeletedClients.length;
  const activeBusinesses = platformClients.length;
  const verifiedLinks = platformGoogleLinks.filter((g) => !!g.business_google_review_link).length;
  const pendingNamesCount = platformClients.filter((c) => !c.owner_phone || !c.city).length;

  // Aggregate taps and scans across live tags & links
  const totalTagScans = platformTags.reduce((sum, t) => sum + (Number(t.scans_count) || 0), 0);
  const totalGoogleScans = platformGoogleLinks.reduce((sum, g) => sum + (Number(g.total_scans) || 0), 0);
  const totalSocialScans = platformSocialLinks.reduce((sum, s) => sum + (Number(s.total_scans) || 0), 0);
  const totalTaps = Math.max(totalTagScans, totalGoogleScans + totalSocialScans);

  const totalNfcTaps = platformTags
    .filter((t) => t.product_type === "Business NFC Card")
    .reduce((sum, t) => sum + (Number(t.scans_count) || 0), 0) + Math.round(totalTaps * 0.45);
  const totalQrScans = Math.max(0, totalTaps - totalNfcTaps);

  const totalReviewClicks = platformGoogleLinks.reduce((sum, g) => sum + (Number(g.total_scans) || 0), 0);
  const connectedReviewLinks = platformGoogleLinks.filter(
    (g) => g.business_google_review_link && g.destination !== "not_assigned"
  ).length;
  const awaitingLinks = platformGoogleLinks.filter(
    (g) => !g.business_google_review_link || g.destination === "not_assigned"
  ).length;
  const pendingLinksCount = awaitingLinks;
  const totalDefusedFeedback = 0;

  // Order Pipeline Counts
  const ordersProcessing = orders.filter((o) => o.status === "processing" || o.status === "in_production").length;
  const ordersDispatched = orders.filter((o) => o.status === "shipped").length;
  const ordersDelivered = orders.filter((o) => o.status === "delivered").length;
  const pendingOrdersCount = ordersProcessing;

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

          {/* Navigation Menu (8 Core Webpages in Exact Requested Sequence) */}
          <nav className="py-4 px-3 space-y-1.5" aria-label="Admin Navigation">
            {/* 1. Overview */}
            <button
              onClick={() => { 
                handleSelectTab("overview");
                setAdminTab("analytics");
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                adminMenu === "overview"
                  ? "bg-zinc-900 text-white shadow-sm font-bold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Overview</span>
            </button>

            {/* 2. Clients */}
            <button
              onClick={() => handleSelectTab("clients")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                adminMenu === "clients"
                  ? "bg-zinc-900 text-white shadow-sm font-bold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
              }`}
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span>Clients</span>
            </button>

            {/* 3. Payments */}
            <button
              onClick={() => handleSelectTab("manual_payments")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                adminMenu === "manual_payments"
                  ? "bg-emerald-700 text-white shadow-sm font-bold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
              }`}
            >
              <DollarSign className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>Payments</span>
            </button>

            {/* 4. QR/NFC Generator */}
            <button
              onClick={() => handleSelectTab("tags")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                adminMenu === "tags"
                  ? "bg-zinc-900 text-white shadow-sm font-bold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
              }`}
            >
              <Radio className="w-4 h-4 flex-shrink-0" />
              <span>QR/NFC Generator</span>
            </button>

            {/* 5. Google Links & QR Sharing */}
            <button
              onClick={() => handleSelectTab("review_links")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                adminMenu === "review_links"
                  ? "bg-amber-600 text-white shadow-sm font-bold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
              }`}
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0 text-amber-500" />
              <span>Google Links &amp; QR Sharing</span>
            </button>

            {/* 6. Social Links & QR Setting */}
            <button
              onClick={() => handleSelectTab("social_links")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                adminMenu === "social_links"
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
              }`}
            >
              <Share2 className="w-4 h-4 flex-shrink-0 text-blue-500" />
              <span>Social Links &amp; QR Setting</span>
            </button>

            {/* 7. Page Editor */}
            <button
              onClick={() => handleSelectTab("page_designer")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                adminMenu === "page_designer"
                  ? "bg-purple-700 text-white shadow-sm font-bold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
              }`}
            >
              <Palette className="w-4 h-4 flex-shrink-0 text-purple-500" />
              <span>Page Editor</span>
            </button>

            {/* 8. Settings */}
            <button
              onClick={() => handleSelectTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                adminMenu === "settings"
                  ? "bg-zinc-900 text-white shadow-sm font-bold"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold"
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
            onClick={() => {
              if (onNavigate) {
                onNavigate("home");
              } else {
                window.location.href = "/";
              }
            }}
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
                {adminMenu === "manual_payments"
                  ? "Payments"
                  : adminMenu === "review_links" 
                  ? "Google Links & QR Sharing" 
                  : adminMenu === "social_links"
                  ? "Social Links & QR Setting"
                  : adminMenu === "tags"
                  ? "QR/NFC Generator"
                  : adminMenu === "page_designer"
                  ? "Page Editor"
                  : adminMenu === "clients"
                  ? "Clients"
                  : adminMenu === "overview"
                  ? "Overview"
                  : adminMenu === "settings"
                  ? "Settings"
                  : adminMenu}
              </h2>
              <span className="hidden sm:inline-block text-xs text-zinc-400 font-normal">|</span>
              <span className="hidden sm:inline-block text-xs font-semibold text-zinc-500">
                ZenTap Master Fleet ({platformClients.length} Clients)
              </span>
            </div>
          </div>

          {/* Right Action Icons: Notification Bell & Admin Avatar */}
          <div className="flex items-center gap-3 relative">
            
            {/* Quick Action: Add Business */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B91C1C] hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Business</span>
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={adminNotificationRef}>
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
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setAdminNotificationOpen(false)}
                  />
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

                      {getManualPaymentStats().pendingCount + getManualPaymentStats().partialCount > 0 && (
                        <div 
                          onClick={() => {
                            setAdminMenu("manual_payments");
                            setAdminNotificationOpen(false);
                          }}
                          className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 cursor-pointer hover:bg-amber-100/70"
                        >
                          <DollarSign className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-zinc-900">
                              {getManualPaymentStats().pendingCount + getManualPaymentStats().partialCount} Pending / Partial Payments
                            </p>
                            <p className="text-[11px] text-zinc-500">Click to open Manual Payments ledger.</p>
                          </div>
                        </div>
                      )}

                      {pendingLinksCount === 0 && getManualPaymentStats().pendingCount + getManualPaymentStats().partialCount === 0 && (
                        <p className="text-center text-zinc-400 py-3">All clear! Fleet operating smoothly.</p>
                      )}
                    </div>
                  </div>
                </>
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
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAdminDropdownOpen(false)}
                  />
                  <div
                    ref={adminDropdownRef}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-zinc-200 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
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

                      {onNavigate ? (
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
                      ) : (
                        <button
                          onClick={() => {
                            setAdminDropdownOpen(false);
                            window.location.href = "/";
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
                        onClick={handleExitAdminSession}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-[#B91C1C] hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Exit Admin Session</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] space-y-6">
          
          {/* 1. Clients Webpage */}
          {adminMenu === "clients" && (
            <ClientsWebpageTab onShowToast={showToast} />
          )}

          {/* 2. Payments Webpage */}
          {adminMenu === "manual_payments" && (
            <PaymentsWebpageTab onShowToast={showToast} />
          )}

          {/* 3. QR/NFC Generator Webpage */}
          {adminMenu === "tags" && (
            <QrNfcGeneratorWebpageTab onShowToast={showToast} />
          )}

          {/* 4. Google Links & QR Sharing Webpage */}
          {adminMenu === "review_links" && (
            <GoogleLinksWebpageTab
              onShowToast={showToast}
              onNavigateToPageEditor={() => handleSelectTab("page_designer")}
            />
          )}

          {/* 5. Social Links & QR Setting Webpage */}
          {adminMenu === "social_links" && (
            <SocialLinksWebpageTab onShowToast={showToast} />
          )}

          {/* 6. Page Editor Webpage */}
          {adminMenu === "page_designer" && (
            <PageEditorWebpageTab onShowToast={showToast} />
          )}

          {/* 7. Settings Webpage */}
          {adminMenu === "settings" && (
            <PlatformSettingsTab
              showToast={showToast}
              onOpenPasswordModal={() => setPasswordModalOpen(true)}
            />
          )}

          {/* 8. Overview Webpage — Business Owner Command Center */}
          {adminMenu === "overview" && (
            <OverviewWebpageTab
              platformClients={platformClients}
              platformTags={platformTags}
              platformGoogleLinks={platformGoogleLinks}
              platformSocialLinks={platformSocialLinks}
              businesses={businesses}
              overviewSelectedBizId={overviewSelectedBizId}
              setOverviewSelectedBizId={setOverviewSelectedBizId}
              onOpenChipsModal={handleOpenChipsModal}
              onShowToast={showToast}
            />
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
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span>Standee Customer URL Slug *</span>
                    {selectedBizForEdit.slug_locked && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </label>
                  {!selectedBizForEdit.slug_locked && (
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="text-[10px] font-bold text-secondary hover:underline cursor-pointer"
                    >
                      Auto-Generate from Name
                    </button>
                  )}
                </div>
                <div className={`flex items-center rounded-xl bg-surface-container border border-surface-variant px-3 py-2 ${
                  selectedBizForEdit.slug_locked ? "opacity-60 bg-zinc-100 cursor-not-allowed" : ""
                }`}>
                  <span className="text-xs text-on-surface-variant font-mono mr-1">/r/</span>
                  <input
                    type="text"
                    required
                    disabled={selectedBizForEdit.slug_locked}
                    value={customBizSlug}
                    onChange={(e) => setCustomBizSlug(e.target.value.toLowerCase().replace(/[\s_]+/g, "-"))}
                    className={`w-full bg-transparent text-xs font-mono text-on-surface focus:outline-none ${
                      selectedBizForEdit.slug_locked ? "cursor-not-allowed text-zinc-500" : ""
                    }`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  {selectedBizForEdit.slug_locked
                    ? "Slug is locked because it is physically encoded on hardware."
                    : "You can edit this slug once after onboarding. Once saved, it will lock permanently."}
                </span>
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
                {customReviewUrl.includes("maps.app.goo.gl") && (
                  <span className="text-[10px] text-amber-700 font-bold block mt-1 p-2 rounded-lg bg-amber-50 border border-amber-200">
                    ⚠️ Warning: maps.app.goo.gl links open the business Maps profile instead of the direct review dialog. We recommend using a g.page/r/ or placeid link.
                  </span>
                )}
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
                  <option value="pending">PENDING (Awaiting Activation)</option>
                  <option value="failed">FAILED (Payment Failed / Overdue)</option>
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
      {/* MODAL 4: ADD NEW BUSINESS (STREAMLINED REGISTRATION)                      */}
      {/* ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-secondary" />
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    Add New Business
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Registers client in backend &amp; records unpaid entry awaiting payment confirmation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewBusiness} className="space-y-4">
              {/* Auto-Assigned Unique Business ID */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="font-semibold text-emerald-800">Assigned Unique Business ID:</span>
                <span className="font-mono font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded border border-emerald-300 shadow-2xs">
                  {generateNextBusinessIdCode()}
                </span>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="e.g. Blue Tokai Coffee"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Owner Name & Owner Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={newBizEmail}
                    onChange={(e) => setNewBizEmail(e.target.value)}
                    placeholder="owner@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              {/* Owner Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Owner Phone / Contact</label>
                  <input
                    type="tel"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
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
              </div>

              {/* WhatsApp Number & Instagram Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={newBizWhatsapp}
                    onChange={(e) => setNewBizWhatsapp(e.target.value)}
                    placeholder="919876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Instagram Link
                  </label>
                  <input
                    type="text"
                    value={newBizInstagram}
                    onChange={(e) => setNewBizInstagram(e.target.value)}
                    placeholder="https://instagram.com/bluetokaicoffee"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                  />
                </div>
              </div>

              {/* Selected Plan (Current 4 options ONLY) */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Selected Plan *
                </label>
                <select
                  value={newBizPlan}
                  onChange={(e: any) => setNewBizPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface font-semibold focus:outline-none"
                >
                  <option value="business_review_standee">1. Business Review Standee (₹999 - Direct Google Review)</option>
                  <option value="zentap_smart_review_standee">2. ZenTap Smart Review Standee (₹1,499 - Review Assistant)</option>
                  <option value="zentap_smart_business_card">3. ZenTap Smart Business Card (₹699 - Digital Card)</option>
                  <option value="custom_solution">4. ZenTap Custom Solutions (Bespoke / Multi-Branch)</option>
                </select>
              </div>

              {/* Notice of Payment Gate */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Business will be registered as <strong>Unpaid</strong>. Hardware activation will be held until you confirm payment in Clients or Payments.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-variant/30">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-6 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#e56d00] text-black text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
                >
                  Register Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: 3-IN-1 QR DOWNLOADS (REVIEW, WHATSAPP, INSTAGRAM)                */}
      {/* ========================================================================= */}
      {qrModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-surface-variant/40 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant/30">
              <div className="text-left">
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Standee QR Asset Hub
                </h3>
                <span className="text-[11px] text-on-surface-variant">
                  {qrModalBiz.name} (/r/{qrModalBiz.slug})
                </span>
              </div>
              <button
                onClick={() => setQrModalBiz(null)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Tabs: Review QR vs WhatsApp QR vs Instagram QR */}
            <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setQrActiveTab("review")}
                className={`py-2 rounded-lg transition-colors cursor-pointer ${
                  qrActiveTab === "review"
                    ? "bg-[#ff7a00] text-black font-extrabold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Review QR
              </button>
              <button
                onClick={() => setQrActiveTab("whatsapp")}
                className={`py-2 rounded-lg transition-colors cursor-pointer ${
                  qrActiveTab === "whatsapp"
                    ? "bg-[#25D366] text-black font-extrabold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                WhatsApp QR
              </button>
              <button
                onClick={() => setQrActiveTab("instagram")}
                className={`py-2 rounded-lg transition-colors cursor-pointer ${
                  qrActiveTab === "instagram"
                    ? "bg-[#E1306C] text-white font-extrabold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Instagram QR
              </button>
            </div>

            {/* Encoded URL banner */}
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-[11px] font-mono text-secondary break-all flex items-center justify-between gap-2">
              <span className="truncate">{qrAssets[qrActiveTab]?.url}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrAssets[qrActiveTab]?.url || "");
                  showToast("✓ Link copied to clipboard!");
                }}
                className="p-1 rounded hover:bg-surface text-on-surface-variant"
                title="Copy link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* QR Image preview */}
            <div className="p-3 bg-white rounded-2xl shadow-inner border border-surface-variant/30 inline-block">
              {qrAssets[qrActiveTab]?.png && (
                <img src={qrAssets[qrActiveTab].png} alt="QR Code" className="w-48 h-48 rounded mx-auto" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleDownloadActivePng}
                className="tactile-btn py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG (1200px)</span>
              </button>

              <button
                onClick={handleDownloadActiveSvg}
                className="tactile-btn-subtle py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-surface-variant/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Vector SVG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5b: DELETE BUSINESS CONFIRMATION DIALOG                              */}
      {/* ========================================================================= */}
      {softDeleteModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-surface-variant/40 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-headline font-bold text-lg text-on-surface">
              Delete Business?
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to delete <strong>{softDeleteModalBiz.name}</strong>?
            </p>

            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-left text-xs text-on-surface space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Moves to the Deleted list (can be restored anytime).</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Frees up {tags.filter((t) => t.business_id === softDeleteModalBiz.id).length} standee/card(s) assigned.</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>The permanent slug <code className="font-mono font-bold">/r/{softDeleteModalBiz.slug}</code> will show 'Page Unavailable'.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSoftDeleteModalBiz(null)}
                className="px-4 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSoftDelete(softDeleteModalBiz)}
                className="tactile-btn px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Delete Business
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5c: PERMANENT DELETE WARNING DIALOG                                 */}
      {/* ========================================================================= */}
      {permDeleteModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-rose-500/40 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-headline font-bold text-lg text-rose-700">
              Permanently Delete Record?
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              This action <strong>cannot be undone</strong>. All records, scan logs, and configurations for <strong>{permDeleteModalBiz.name}</strong> will be permanently purged.
            </p>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs space-y-2">
              <p className="font-bold text-rose-900">
                Type <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-300">delete</span> or "{permDeleteModalBiz.name}" to confirm:
              </p>
              <input
                type="text"
                placeholder={`Type 'delete' or '${permDeleteModalBiz.name}'`}
                value={permDeleteConfirmInput}
                onChange={(e) => setPermDeleteConfirmInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-rose-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPermDeleteModalBiz(null);
                  setPermDeleteConfirmInput("");
                }}
                className="px-4 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  permDeleteConfirmInput.trim().toLowerCase() !== "delete" &&
                  permDeleteConfirmInput.trim().toLowerCase() !== permDeleteModalBiz.name.trim().toLowerCase()
                }
                onClick={() => handleExecutePermanentDelete(permDeleteModalBiz)}
                className="tactile-btn px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Bulk Assign Cards Modal */}
      <BulkAssignCardsModal
        isOpen={bulkAssignModalOpen}
        onClose={() => setBulkAssignModalOpen(false)}
        businesses={businesses}
        tags={tags}
        onTagsUpdated={(t) => setTags(t)}
        showToast={showToast}
      />

      {/* Quick Social Edit Modal */}
      <QuickSocialEditModal
        business={quickSocialBiz}
        onClose={() => setQuickSocialBiz(null)}
        onBusinessUpdated={(updatedBiz) => {
          setBusinesses(businesses.map((b) => (b.id === updatedBiz.id ? updatedBiz : b)));
        }}
        showToast={showToast}
      />

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

      {/* ========================================================================= */}
      {/* TAG MODAL 0: ADD SINGLE TAG                                               */}
      {/* ========================================================================= */}
      {singleTagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-zinc-900" />
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    Add Single Tag
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">
                    Create an individual standee or card with optional custom code
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSingleTagModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleTag} className="space-y-4">
              {/* Optional Custom Code */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Tag Code <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. zt-0105 or business slug (leave blank to auto-generate)"
                  value={singleTagCode}
                  onChange={(e) => setSingleTagCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface font-mono placeholder:text-zinc-400 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Lowercase letters, numbers, and hyphens. Matches the physical URL printed/written on the item.
                </p>
              </div>

              {/* Physical Item Format */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Physical Hardware Item *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleTagForm("standee")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      singleTagForm === "standee"
                        ? "border-[#ff7a00] bg-[#ff7a00]/10 font-bold text-zinc-900"
                        : "border-surface-variant/40 bg-surface-container text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">Counter Standee</span>
                    <span className="text-[10px] text-zinc-500">Tabletop acrylic / metal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleTagForm("card")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      singleTagForm === "card"
                        ? "border-blue-500 bg-blue-500/10 font-bold text-zinc-900"
                        : "border-surface-variant/40 bg-surface-container text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">NFC Card</span>
                    <span className="text-[10px] text-zinc-500">Wallet / pocket card</span>
                  </button>
                </div>
              </div>

              {/* Chip Written Verification Checkbox */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={singleTagChipWritten}
                    onChange={(e) => setSingleTagChipWritten(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-emerald-950">
                      NFC Chip written &amp; tested
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Tick this if you already programmed the NFC tag using NFC Tools and tested it with another phone.
                    </span>
                  </div>
                </label>
              </div>

              {/* Optional Assign to Business right away */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Give to Business right away? <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <select
                  value={singleTagBusinessId}
                  onChange={(e) => {
                    const bId = e.target.value;
                    setSingleTagBusinessId(bId);
                    const b = businesses.find((x) => x.id === bId);
                    if (b) {
                      setSingleTagWhatsappNumber(b.whatsapp_number || b.whatsapp || "");
                      setSingleTagInstagramHandle(b.instagram_url || b.instagram || "");
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                >
                  <option value="">-- Keep free in inventory (unassigned) --</option>
                  {businesses
                    .filter((b) => !b.is_deleted)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        [{b.business_id_code || getBusinessIdCode(b)}] {b.name} ({b.city || "India"})
                      </option>
                    ))}
                </select>
              </div>

              {/* If assigned to business: purpose & options */}
              {singleTagBusinessId && (
                <div className="space-y-3 p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/40">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Hardware Purpose *
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSingleTagType("review")}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                          singleTagType === "review"
                            ? "border-amber-500 bg-amber-500/10 font-bold text-zinc-900"
                            : "border-surface-variant/40 bg-surface text-zinc-600"
                        }`}
                      >
                        Google Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleTagType("whatsapp")}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                          singleTagType === "whatsapp"
                            ? "border-[#25D366] bg-[#25D366]/10 font-bold text-zinc-900"
                            : "border-surface-variant/40 bg-surface text-zinc-600"
                        }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleTagType("instagram")}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                          singleTagType === "instagram"
                            ? "border-pink-500 bg-pink-500/10 font-bold text-zinc-900"
                            : "border-surface-variant/40 bg-surface text-zinc-600"
                        }`}
                      >
                        Instagram
                      </button>
                    </div>
                  </div>

                  {singleTagType === "review" && (
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        Scan Destination
                      </label>
                      <select
                        value={singleTagDestination}
                        onChange={(e) => setSingleTagDestination(e.target.value as TagDestination)}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant text-xs text-on-surface focus:outline-none"
                      >
                        <option value="zentap_page">ZenTap Page (Smart Review Flow)</option>
                        <option value="direct">Direct Google Review</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Employee / Location Note <span className="text-zinc-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Front Reception Counter or Meet (Founder)"
                      value={singleTagLabel}
                      onChange={(e) => setSingleTagLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-variant text-xs text-on-surface focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/30">
                <button
                  type="button"
                  onClick={() => setSingleTagModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
                >
                  Create Single Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAG MODAL 1: GENERATE BATCH OF STANDEES & CARDS                           */}
      {/* ========================================================================= */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-secondary" />
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    Generate Batch of Codes
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">
                    Creates blank hardware codes ready for NFC writing and QR printing
                  </span>
                </div>
              </div>
              <button
                onClick={() => setBatchModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Physical Hardware Item *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchForm("standee")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      batchForm === "standee"
                        ? "border-[#ff7a00] bg-[#ff7a00]/10 font-bold text-zinc-900"
                        : "border-surface-variant/40 bg-surface-container text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">Counter Standee</span>
                    <span className="text-[10px] text-zinc-500">Tabletop acrylic / metal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchForm("card")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      batchForm === "card"
                        ? "border-blue-500 bg-blue-500/10 font-bold text-zinc-900"
                        : "border-surface-variant/40 bg-surface-container text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">NFC Smart Card</span>
                    <span className="text-[10px] text-zinc-500">Pocket PVC / employee card</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Batch Quantity (1 - 100 units) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={batchCount}
                  onChange={(e) => setBatchCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-sm font-bold text-on-surface focus:outline-none"
                />
                <div className="flex gap-1.5 mt-2">
                  {[5, 10, 25, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setBatchCount(qty)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                        batchCount === qty ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-200"
                      }`}
                    >
                      {qty} units
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-xs text-on-surface space-y-1">
                <p className="font-semibold text-zinc-900">Format Preview:</p>
                <p className="font-mono text-[11px] text-zinc-600">
                  Codes will be formatted sequentially as <code className="bg-white px-1.5 py-0.5 rounded border">zt-XXXX</code>
                </p>
                <p className="text-[10px] text-zinc-500">
                  NFC URL format: <code className="font-mono">https://zentapdigitalsolutions.com/t/zt-XXXX?s=nfc</code>
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/30">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#e56d00] text-black text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
                >
                  Generate {batchCount} {batchForm === "standee" ? "Standees" : "Cards"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAG MODAL 2: GIVE TO BUSINESS (ASSIGN HARDWARE)                            */}
      {/* ========================================================================= */}
      {assignModalOpen && selectedTagForAssign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-variant/40 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    Give to Business
                  </h3>
                  <span className="font-mono text-xs text-zinc-500 font-bold uppercase">
                    Hardware Item: {selectedTagForAssign.code} ({selectedTagForAssign.form})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAssign} className="space-y-4">
              {/* Business Select */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Select Business *
                </label>
                <select
                  value={assignBusinessId}
                  onChange={(e) => {
                    const bId = e.target.value;
                    setAssignBusinessId(bId);
                    const b = businesses.find((x) => x.id === bId);
                    if (b) {
                      setAssignWhatsappNumber(b.whatsapp_number || b.whatsapp || "");
                      setAssignInstagramHandle(b.instagram_url || b.instagram || "");
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                >
                  {businesses
                    .filter((b) => !b.is_deleted)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city || "India"}) — /r/{b.slug}
                      </option>
                    ))}
                </select>
              </div>

              {/* Purpose Selector */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Hardware Purpose *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignType("review")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      assignType === "review"
                        ? "border-amber-500 bg-amber-500/10 font-bold text-zinc-900"
                        : "border-surface-variant/40 bg-surface-container text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">Google Review</span>
                    <span className="text-[10px] text-zinc-500">Standee / review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignType("whatsapp")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      assignType === "whatsapp"
                        ? "border-[#25D366] bg-[#25D366]/10 font-bold text-zinc-900"
                        : "border-surface-variant/40 bg-surface-container text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">WhatsApp</span>
                    <span className="text-[10px] text-zinc-500">Direct chat card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignType("instagram")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      assignType === "instagram"
                        ? "border-pink-500 bg-pink-500/10 font-bold text-zinc-900"
                        : "border-surface-variant/40 bg-surface-container text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">Instagram</span>
                    <span className="text-[10px] text-zinc-500">Direct profile card</span>
                  </button>
                </div>
              </div>

              {/* Employee / Note */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Employee Name / Counter Location Note
                </label>
                <input
                  type="text"
                  value={assignLabel}
                  onChange={(e) => setAssignLabel(e.target.value)}
                  placeholder="e.g. Counter 1, Rahul (Sales), Front Desk..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-variant text-xs text-on-surface focus:outline-none"
                />
              </div>

              {/* WhatsApp details if WhatsApp selected */}
              {assignType === "whatsapp" && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/20">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Direct WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={assignWhatsappNumber}
                      onChange={(e) => setAssignWhatsappNumber(e.target.value)}
                      placeholder="919876543210 (with country code)"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant text-xs text-on-surface focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Prefilled Message
                    </label>
                    <input
                      type="text"
                      value={assignWhatsappMessage}
                      onChange={(e) => setAssignWhatsappMessage(e.target.value)}
                      placeholder="Hi! I tapped your card."
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant text-xs text-on-surface focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Instagram details if Instagram selected */}
              {assignType === "instagram" && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-pink-500/5 border border-pink-500/20">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Instagram Handle or Profile Link *
                    </label>
                    <input
                      type="text"
                      required
                      value={assignInstagramHandle}
                      onChange={(e) => setAssignInstagramHandle(e.target.value)}
                      placeholder="@yourbrand or https://instagram.com/yourbrand"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-variant text-xs text-on-surface focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/30">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Give to Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAG MODAL 3: TAKE BACK CONFIRMATION DIALOG                                */}
      {/* ========================================================================= */}
      {takeBackModalTag && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-surface-variant/40 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-headline font-bold text-lg text-on-surface">
              Take Back Standee / Card?
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to take back <strong>{takeBackModalTag.code.toUpperCase()}</strong> from <strong>{takeBackModalTag.business_name || "Business"}</strong>?
            </p>

            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-left text-xs text-on-surface space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>The item will be freed up and ready to assign to any new business.</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Old scan history and telemetry remain safely recorded in database history.</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Until reassigned, tapping this physical item will show a neutral "Page Unavailable" screen.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTakeBackModalTag(null)}
                className="px-4 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteTakeBack(takeBackModalTag)}
                className="tactile-btn px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Take Back (Free it up)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAG MODAL 4: DOWNLOAD TAG QR CODE                                         */}
      {/* ========================================================================= */}
      {tagQrModalTag && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-surface-variant/40 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-surface-variant/30">
              <div className="text-left">
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Hardware QR Code: {tagQrModalTag.code.toUpperCase()}
                </h3>
                <span className="text-[11px] text-on-surface-variant">
                  {tagQrModalTag.form === "standee" ? "Counter Standee" : "Smart Card"} • {tagQrModalTag.business_name || "Unassigned"}
                </span>
              </div>
              <button
                onClick={() => setTagQrModalTag(null)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Encoded URL */}
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-[11px] font-mono text-secondary break-all flex items-center justify-between gap-2">
              <span className="truncate">{typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com"}/t/{tagQrModalTag.code}?s=qr</span>
              <button
                onClick={() => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "https://zentapdigitalsolutions.com";
                  navigator.clipboard.writeText(`${origin}/t/${tagQrModalTag.code}?s=qr`);
                  showToast("✓ QR URL copied to clipboard!");
                }}
                className="p-1 rounded hover:bg-surface text-on-surface-variant cursor-pointer"
                title="Copy QR URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* QR Image Preview */}
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-surface-variant/30 inline-block">
              {tagQrPng ? (
                <img src={tagQrPng} alt={`QR Code ${tagQrModalTag.code}`} className="w-48 h-48 rounded mx-auto" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleDownloadTagQrPng}
                className="tactile-btn py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG (1200px)</span>
              </button>

              <button
                onClick={handleDownloadTagQrSvg}
                className="tactile-btn-subtle py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-surface-variant/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Vector SVG</span>
              </button>
            </div>

            <div className="pt-2 border-t border-surface-variant/30">
              <button
                onClick={() => handleCopyNfcLink(tagQrModalTag.code)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copy NFC Writing Link (/t/{tagQrModalTag.code}?s=nfc)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
