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
  AlertCircle
} from "lucide-react";
import { 
  BusinessRecord, 
  getAllBusinesses, 
  adminUpdateBusinessRecord, 
  validateGoogleReviewUrl,
  getBusinessAnalytics,
  generateRandomSlug
} from "@/lib/businessStore";
import { useAuth } from "@/context/AuthContext";
import { fetchDbAdminBusinesses, updateDbReviewUrl, upsertUserBusinessInDb, adminUpdateDbBusiness } from "@/lib/supabase/service";

interface AdminConsoleViewProps {
  onOpenAuthModal?: (tab: "signin" | "signup" | "admin") => void;
}

export default function AdminConsoleView({ onOpenAuthModal }: AdminConsoleViewProps) {
  const { user, isAdmin, loading, updateUserPassword, resetPasswordForEmail } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "awaiting_link" | "paid" | "pending">("all");
  const [editingBizId, setEditingBizId] = useState<string | null>(null);
  const [editReviewUrl, setEditReviewUrl] = useState("");
  const [validationWarning, setValidationWarning] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [toastMsg, setToastMsg] = useState("");

  // New Business Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizEmail, setNewBizEmail] = useState("");
  const [newBizPhone, setNewBizPhone] = useState("");
  const [newBizCity, setNewBizCity] = useState("");
  const [newBizPlan, setNewBizPlan] = useState<"card_500" | "standee_1500" | "standee_auto_2000">("standee_1500");
  const [newBizReviewUrl, setNewBizReviewUrl] = useState("");

  // QR Modal State
  const [qrModalBiz, setQrModalBiz] = useState<BusinessRecord | null>(null);
  const [qrPngUrl, setQrPngUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");

  // Admin Password Management State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [adminPasswordUpdating, setAdminPasswordUpdating] = useState(false);
  const [adminPasswordMsg, setAdminPasswordMsg] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");

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

  useEffect(() => {
    async function loadAdminData() {
      // 1. Initial local load
      const local = getAllBusinesses();
      setBusinesses(local);

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

          // Merge without losing local entries
          const merged = [...formatted];
          local.forEach((loc) => {
            if (!merged.some((m) => m.id === loc.id || m.slug === loc.slug)) {
              merged.push(loc);
            }
          });
          setBusinesses(merged);
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

  const handleStartEdit = (b: BusinessRecord) => {
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

  const handleTogglePaymentStatus = (b: BusinessRecord) => {
    const nextStatus = b.payment_status === "paid" ? "pending" : "paid";
    const updated = adminUpdateBusinessRecord(b.id, { payment_status: nextStatus });
    setBusinesses(updated);
    adminUpdateDbBusiness(b.id, {
      payment_status: nextStatus,
    }).catch((e) => console.warn(e));
    showToast(`✓ Payment status updated to: ${nextStatus.toUpperCase()}`);
  };

  const handleToggleActiveStatus = (b: BusinessRecord) => {
    const nextActive = !b.active;
    const updated = adminUpdateBusinessRecord(b.id, { active: nextActive });
    setBusinesses(updated);
    adminUpdateDbBusiness(b.id, {
      active: nextActive,
    }).catch((e) => console.warn(e));
    showToast(`✓ Business status: ${nextActive ? "ACTIVE" : "INACTIVE"}`);
  };

  const handleAddNewBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const slug = generateRandomSlug(newBizName.trim());
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
      slug,
      plan: newBizPlan,
      payment_status: "paid",
      review_url: newBizReviewUrl.trim() || null,
      active: true,
      category: "Commercial Client",
      created_at: new Date().toISOString(),
    };

    const updated = [newRecord, ...businesses];
    setBusinesses(updated);

    // Save to local index and Supabase
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
    if (statusFilter === "paid") return b.payment_status === "paid";
    if (statusFilter === "pending") return b.payment_status === "pending";

    return true;
  });

  // Metrics
  const totalFleet = businesses.length;
  const verifiedLinks = businesses.filter((b) => !!b.review_url).length;
  const awaitingLinks = businesses.filter((b) => !b.review_url).length;
  const paidDeployments = businesses.filter((b) => b.payment_status === "paid").length;

  // Strict Security Gate: Block unauthorized users from seeing the Admin Table
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-5 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-headline font-bold text-2xl text-[#1C1B1A] mb-2">
          Administrator Console Restricted
        </h2>
        <p className="text-xs text-[#615E5B] leading-relaxed mb-6 font-sans">
          This portal manages business integrations, Google review destinations, and standee production. Access is strictly limited to authorized ZenTap fleet administrators.
        </p>
        <button
          onClick={() => onOpenAuthModal && onOpenAuthModal("admin")}
          className="px-5 py-2.5 rounded-xl bg-[#1C1B1A] text-white text-xs font-semibold hover:bg-[#2C2B2A] transition-colors cursor-pointer shadow-sm"
        >
          Authenticate as Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Header Banner - Unlocked Supreme Authority */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-[#1C1B1A] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-[#2C2B2A] shadow-xl">
        <div className="flex flex-col gap-2 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-white/10 text-white rounded-full text-[11px] font-mono tracking-wider uppercase font-bold border border-white/10">
              Root Superadmin Console
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[11px] font-mono font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fleet Master Directory · Supreme Authority Active</span>
            </div>
          </div>
          
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-white">
            Fleet Master Directory &amp; Link Validation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
            Full root authority unlocked: Manage registered client businesses, update Google Review links in real-time, toggle billing &amp; deployment states, generate laser-printable Standee QR codes, and preview live customer review routing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10 flex-shrink-0">
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Admin Password &amp; Security</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#D94826] hover:bg-[#C23C1D] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Onboard New Business</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD8]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#615E5B]">Total Fleet</p>
          <p className="font-headline font-bold text-2xl text-[#1C1B1A] mt-1">{totalFleet}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Commercial Standees</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD8]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#615E5B]">Verified Google Links</p>
          <p className="font-headline font-bold text-2xl text-emerald-700 mt-1">{verifiedLinks}</p>
          <p className="text-[10px] text-[#615E5B] mt-0.5">Instant Redirect Ready</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD8]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#615E5B]">Awaiting Link</p>
          <p className="font-headline font-bold text-2xl text-amber-700 mt-1">{awaitingLinks}</p>
          <p className="text-[10px] text-amber-800 font-medium mt-0.5">Needs Link Insertion</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E2DFD8]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#615E5B]">Paid Deployments</p>
          <p className="font-headline font-bold text-2xl text-[#1C1B1A] mt-1">{paidDeployments}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Dispatched Orders</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#615E5B]" />
          <input
            type="text"
            placeholder="Search business name, city, email, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E2DFD8] text-xs text-[#1C1B1A] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#1C1B1A] shadow-sm font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F2F0EB] p-1 rounded-xl border border-[#E2DFD8] text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "all" ? "bg-[#1C1B1A] text-white font-semibold" : "text-[#615E5B] hover:text-[#1C1B1A]"
            }`}
          >
            All ({businesses.length})
          </button>
          <button
            onClick={() => setStatusFilter("awaiting_link")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "awaiting_link" ? "bg-amber-700 text-white font-semibold" : "text-[#615E5B] hover:text-[#1C1B1A]"
            }`}
          >
            Awaiting Link ({awaitingLinks})
          </button>
          <button
            onClick={() => setStatusFilter("paid")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "paid" ? "bg-emerald-700 text-white font-semibold" : "text-[#615E5B] hover:text-[#1C1B1A]"
            }`}
          >
            Paid ({paidDeployments})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "active" ? "bg-[#1C1B1A] text-white font-semibold" : "text-[#615E5B] hover:text-[#1C1B1A]"
            }`}
          >
            Active
          </button>
        </div>
      </div>

      {/* Table View of Fleet */}
      <div className="rounded-2xl bg-[#FAF9F6] border border-[#E2DFD8] shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F2F0EB] border-b border-[#E2DFD8] text-[#615E5B] uppercase text-[10px] font-mono tracking-wider font-semibold">
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
            <tbody className="divide-y divide-[#E2DFD8]">
              {filtered.map((b) => {
                const isEditing = editingBizId === b.id;
                const clientPageUrl = `${originUrl}/r/${b.slug}?s=nfc`;
                const analytics = getBusinessAnalytics(b.id);
                const hasLink = !!b.review_url;

                return (
                  <tr key={b.id} className={`hover:bg-[#F2F0EB]/60 transition-colors ${!hasLink ? "bg-amber-50/40" : ""}`}>
                    
                    {/* Business Name */}
                    <td className="py-3.5 px-4 sm:px-6 align-top">
                      <span className="font-bold text-xs text-[#1C1B1A] block font-headline">
                        {b.name}
                      </span>
                      <span className="text-[10px] text-[#615E5B] font-mono">
                        slug: {b.slug}
                      </span>
                    </td>

                    {/* Owner Email & Phone */}
                    <td className="py-3.5 px-4 align-top text-xs text-[#1C1B1A]">
                      <p className="font-medium truncate max-w-[150px]">{b.email}</p>
                      <p className="text-[10px] text-[#615E5B] font-mono">{b.phone || "—"}</p>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 align-top text-xs text-[#615E5B]">
                      {b.city || "India"}
                    </td>

                    {/* Customer Page URL */}
                    <td className="py-3.5 px-4 align-top max-w-[160px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] truncate block text-[#615E5B]">
                          /r/{b.slug}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(clientPageUrl);
                            showToast("✓ Client review URL copied!");
                          }}
                          className="p-1 rounded bg-[#F2F0EB] hover:bg-[#E2DFD8] text-[#1C1B1A] cursor-pointer"
                          title="Copy Tap URL"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono text-[11px] text-[#1C1B1A] block">
                        {b.plan === "card_500" ? "Card ₹500" : b.plan === "standee_auto_2000" ? "Standee+Auto ₹2k" : "Standee ₹1.5k"}
                      </span>
                    </td>

                    {/* Payment Status (Supreme 1-click toggle) */}
                    <td className="py-3.5 px-4 align-top">
                      <button
                        onClick={() => handleTogglePaymentStatus(b)}
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase cursor-pointer transition-all ${
                          b.payment_status === "paid" 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                            : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                        }`}
                        title="Click to toggle payment status"
                      >
                        {b.payment_status}
                      </button>
                    </td>

                    {/* Active State (Supreme 1-click toggle) */}
                    <td className="py-3.5 px-4 align-top">
                      <button
                        onClick={() => handleToggleActiveStatus(b)}
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase cursor-pointer transition-all ${
                          b.active 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                            : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                        }`}
                        title="Click to toggle active status"
                      >
                        {b.active ? "ONLINE" : "OFFLINE"}
                      </button>
                    </td>

                    {/* Scan Count */}
                    <td className="py-3.5 px-4 align-top font-mono font-bold text-xs text-[#1C1B1A]">
                      {analytics.totalScans}
                    </td>

                    {/* Google Review Link (Editable Inline) */}
                    <td className="py-3.5 px-4 align-top max-w-[220px]">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="url"
                            placeholder="https://g.page/r/..."
                            value={editReviewUrl}
                            onChange={(e) => setEditReviewUrl(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-white border border-[#D94826] text-xs text-[#1C1B1A] focus:outline-none font-mono"
                          />
                          {validationError && (
                            <span className="text-[10px] text-red-600 block leading-tight">{validationError}</span>
                          )}
                          {validationWarning && (
                            <span className="text-[10px] text-amber-700 block leading-tight">{validationWarning}</span>
                          )}
                          <div className="flex gap-1 pt-1">
                            <button
                              onClick={() => handleSaveReviewUrl(b.id)}
                              className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Save Link
                            </button>
                            <button
                              onClick={() => setEditingBizId(null)}
                              className="px-2 py-0.5 rounded bg-[#F2F0EB] text-[#615E5B] text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {b.review_url ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={b.review_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-mono text-[#D94826] hover:underline truncate block max-w-[150px]"
                                title={b.review_url}
                              >
                                {b.review_url}
                              </a>
                              <button
                                onClick={() => handleStartEdit(b)}
                                className="p-1 rounded text-[#615E5B] hover:text-[#1C1B1A] cursor-pointer"
                                title="Edit Link"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[9px] uppercase">
                                Awaiting link
                              </span>
                              <button
                                onClick={() => handleStartEdit(b)}
                                className="px-2 py-0.5 rounded bg-[#D94826] text-white text-[10px] font-bold cursor-pointer"
                                title="Add Google Review Link"
                              >
                                + Set Link
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Supreme Actions */}
                    <td className="py-3.5 px-4 sm:px-6 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* QR Code Button */}
                        <button
                          onClick={() => handleOpenQRModal(b)}
                          className="px-2.5 py-1 rounded bg-[#1C1B1A] text-white font-semibold text-[10px] hover:bg-[#2C2B2A] flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Generate Laser QR (SVG / PNG)"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>QR</span>
                        </button>

                        {/* Test tap preview without scan telemetry skew */}
                        <a
                          href={`${originUrl}/r/${b.slug}?preview=1`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-[#F2F0EB] hover:bg-[#E2DFD8] text-[#1C1B1A] transition-colors cursor-pointer"
                          title="Preview Review Assistant (No scan skew)"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {/* Delete Business Button */}
                        <button
                          onClick={() => handleDeleteBusiness(b.id, b.name)}
                          className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                          title="Supreme Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard New Business Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#FAF9F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2DFD8] animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#F2F0EB] hover:bg-[#E2DFD8] flex items-center justify-center text-[#615E5B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-[#D94826]" />
              <h3 className="font-headline font-bold text-lg text-[#1C1B1A]">
                Onboard New Client Business
              </h3>
            </div>
            <p className="text-xs text-[#615E5B] mb-5">
              Supreme Authority: Deploy a new client business immediately to the Standee fleet.
            </p>

            <form onSubmit={handleAddNewBusiness} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="e.g. Copper Kettle Roasters"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={newBizEmail}
                    onChange={(e) => setNewBizEmail(e.target.value)}
                    placeholder="owner@business.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    placeholder="+91 98980 00000"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newBizCity}
                    onChange={(e) => setNewBizCity(e.target.value)}
                    placeholder="Ahmedabad, Mumbai..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                    Hardware Package
                  </label>
                  <select
                    value={newBizPlan}
                    onChange={(e: any) => setNewBizPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
                  >
                    <option value="standee_1500">Auto Standee (₹1,500)</option>
                    <option value="standee_auto_2000">Standee + AI (₹2,000)</option>
                    <option value="card_500">Normal Card (₹500)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                  Google Review Link (Optional)
                </label>
                <input
                  type="url"
                  value={newBizReviewUrl}
                  onChange={(e) => setNewBizReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/... or https://maps.app.goo.gl/..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DFD8] text-xs font-mono text-[#1C1B1A] focus:outline-none focus:ring-1 focus:ring-[#1C1B1A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#1C1B1A] hover:bg-[#2C2B2A] text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                >
                  Confirm Fleet Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Standee Modal (SVG and PNG Downloads) */}
      {qrModalBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#FAF9F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E2DFD8] animate-in zoom-in-95 duration-150 flex flex-col items-center text-center">
            
            <button
              onClick={() => setQrModalBiz(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#F2F0EB] hover:bg-[#E2DFD8] flex items-center justify-center text-[#615E5B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#1C1B1A] text-white flex items-center justify-center mb-3 shadow-md">
              <QrCode className="w-6 h-6 text-[#D94826]" />
            </div>

            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#D94826] mb-1">
              Laser Engraving Production
            </span>
            <h3 className="font-headline font-bold text-xl text-[#1C1B1A] mb-1">
              {qrModalBiz.name}
            </h3>
            <p className="text-xs text-[#615E5B] mb-5 font-sans">
              Dynamic QR Code · Error Correction Level Q (25% Reed-Solomon)
            </p>

            <div className="p-4 bg-white rounded-2xl shadow-md border border-[#E2DFD8] mb-4">
              {qrPngUrl ? (
                <img src={qrPngUrl} alt="Standee QR" className="w-56 h-56 rounded-lg" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-gray-500">Generating QR...</div>
              )}
            </div>

            <div className="w-full p-2.5 rounded-xl bg-[#F2F0EB] border border-[#E2DFD8] text-xs font-mono text-[#1C1B1A] truncate mb-5">
              {originUrl}/r/{qrModalBiz.slug}?s=qr
            </div>

            {/* SVG & PNG Download Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={handleDownloadSvg}
                className="py-2.5 rounded-xl bg-[#D94826] text-white font-bold text-xs hover:bg-[#C23C1D] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Vector SVG</span>
              </button>

              <button
                onClick={handleDownloadPng}
                className="py-2.5 rounded-xl bg-[#1C1B1A] text-white font-bold text-xs hover:bg-[#2C2B2A] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>1200px PNG</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2DFD8] w-full text-center">
              <span className="text-[10px] text-[#615E5B] font-mono">
                NFC Target: {originUrl}/r/{qrModalBiz.slug}?s=nfc
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Admin Password & Security Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#1C1B1A] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2C2B2A] animate-in zoom-in-95 duration-150">
            
            <button
              onClick={() => {
                setPasswordModalOpen(false);
                setAdminPasswordError("");
                setAdminPasswordMsg("");
              }}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-[#D94826]" />
              <h3 className="font-headline font-bold text-lg text-white">
                Admin Password &amp; Security Key
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Update the master security key for administrator access, or dispatch a password recovery link to your inbox.
            </p>

            {adminPasswordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{adminPasswordError}</span>
              </div>
            )}

            {adminPasswordMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{adminPasswordMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangeAdminPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-300 mb-1 uppercase tracking-wider text-[10px]">
                  New Administrator Password
                </label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D94826] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-300 mb-1 uppercase tracking-wider text-[10px]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D94826] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={adminPasswordUpdating}
                className="w-full py-3 rounded-xl bg-[#D94826] hover:bg-[#C23C1D] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {adminPasswordUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Security Key...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Update Administrator Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendAdminResetEmail}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <Mail className="w-4 h-4 text-[#D94826]" />
                <span>Dispatch Recovery Instructions to Email</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
