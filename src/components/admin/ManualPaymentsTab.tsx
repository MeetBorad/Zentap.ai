"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Building2,
  CreditCard,
  MessageCircle,
  ArrowUpDown,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { 
  getAllManualPayments, 
  saveManualPayment, 
  deleteManualPayment, 
  ManualPaymentRecord, 
  PRODUCT_CATEGORIES,
  PaymentStatus,
  PaymentMethod,
  getManualPaymentStats
} from "@/lib/manualPaymentStore";
import { BusinessRecord } from "@/lib/businessStore";

interface ManualPaymentsTabProps {
  businesses: BusinessRecord[];
  onShowToast: (msg: string) => void;
  onPaymentConfirmed?: (bizId: string) => void;
}

export default function ManualPaymentsTab({ businesses, onShowToast, onPaymentConfirmed }: ManualPaymentsTabProps) {
  const [payments, setPayments] = useState<ManualPaymentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState<string>("all");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ManualPaymentRecord | null>(null);

  // Form state
  interface PaymentFormData {
    business_id: string;
    business_name: string;
    product_purchased: string;
    total_agreed_amount: number;
    amount_received: number;
    payment_date: string;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    admin_notes: string;
  }

  const [formData, setFormData] = useState<PaymentFormData>({
    business_id: "",
    business_name: "",
    product_purchased: PRODUCT_CATEGORIES[0].id,
    total_agreed_amount: PRODUCT_CATEGORIES[0].defaultPrice,
    amount_received: PRODUCT_CATEGORIES[0].defaultPrice,
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "upi",
    payment_status: "completed",
    admin_notes: "",
  });

  const reloadPayments = () => {
    const list = getAllManualPayments();
    setPayments([...list]);
  };

  useEffect(() => {
    reloadPayments();
  }, []);

  const stats = getManualPaymentStats();

  const handleOpenAddModal = () => {
    setEditingPayment(null);
    const defaultBiz = businesses[0];
    setFormData({
      business_id: defaultBiz?.id || "",
      business_name: defaultBiz?.name || "",
      product_purchased: PRODUCT_CATEGORIES[0].id,
      total_agreed_amount: PRODUCT_CATEGORIES[0].defaultPrice,
      amount_received: PRODUCT_CATEGORIES[0].defaultPrice,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "upi",
      payment_status: "completed",
      admin_notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (payment: ManualPaymentRecord) => {
    setEditingPayment(payment);
    setFormData({
      business_id: payment.business_id,
      business_name: payment.business_name,
      product_purchased: payment.product_purchased,
      total_agreed_amount: payment.total_agreed_amount,
      amount_received: payment.amount_received,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      payment_status: payment.payment_status,
      admin_notes: payment.admin_notes || "",
    });
    setIsModalOpen(true);
  };

  const handleBusinessChange = (bizId: string) => {
    const biz = businesses.find((b) => b.id === bizId);
    setFormData((prev) => ({
      ...prev,
      business_id: bizId,
      business_name: biz ? biz.name : prev.business_name,
    }));
  };

  const handleProductChange = (prodId: string) => {
    const prod = PRODUCT_CATEGORIES.find((p) => p.id === prodId);
    const price = prod?.defaultPrice || 999;
    setFormData((prev) => ({
      ...prev,
      product_purchased: prodId,
      total_agreed_amount: price,
      amount_received: price,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.business_name.trim()) {
      onShowToast("Please enter or select a business name.");
      return;
    }

    saveManualPayment({
      ...(editingPayment ? { id: editingPayment.id } : {}),
      business_id: formData.business_id,
      business_name: formData.business_name,
      product_purchased: formData.product_purchased,
      total_agreed_amount: Number(formData.total_agreed_amount) || 0,
      amount_received: Number(formData.amount_received) || 0,
      payment_date: formData.payment_date,
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      admin_notes: formData.admin_notes,
    });

    onShowToast(editingPayment ? "✓ Payment record updated" : "✓ New payment recorded");
    setIsModalOpen(false);
    reloadPayments();
  };

  const handleQuickConfirm = (payment: ManualPaymentRecord) => {
    saveManualPayment({
      ...payment,
      amount_received: payment.total_agreed_amount,
      payment_status: "completed",
      admin_notes: (payment.admin_notes ? payment.admin_notes + " • " : "") + "Payment Confirmed by Admin",
    });
    if (onPaymentConfirmed && payment.business_id) {
      onPaymentConfirmed(payment.business_id);
    }
    onShowToast(`✓ Payment confirmed for "${payment.business_name}"! Status updated to Paid.`);
    reloadPayments();
  };

  const handleDelete = (id: string, bizName: string) => {
    if (confirm(`Are you sure you want to delete payment record for "${bizName}"?`)) {
      deleteManualPayment(id);
      onShowToast("✓ Payment record deleted");
      reloadPayments();
    }
  };

  // Filtered payments list
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.admin_notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.payment_status === statusFilter;
    const matchesProduct = productFilter === "all" || p.product_purchased === productFilter;
    const matchesBiz = selectedBusinessFilter === "all" || p.business_id === selectedBusinessFilter;
    return matchesSearch && matchesStatus && matchesProduct && matchesBiz;
  });

  const getProductName = (id: string) => {
    const found = PRODUCT_CATEGORIES.find((p) => p.id === id);
    return found ? found.name : id;
  };

  const calculatedPending = Math.max(
    0,
    (Number(formData.total_agreed_amount) || 0) - (Number(formData.amount_received) || 0)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Manual Payment Recording &amp; Ledger</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track offline and WhatsApp manual client transactions, advances, and auto-calculated pending balances.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="tactile-btn self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Financial Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Agreed */}
        <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
            Total Revenue Agreed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              ₹{stats.totalAgreed.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-zinc-500 font-mono">{stats.totalCount} deals</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="p-4 rounded-2xl bg-[#141720] border border-emerald-500/30">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Total Amount Collected
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">
              ₹{stats.totalReceived.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-emerald-500 font-medium">
              {stats.totalAgreed > 0 ? Math.round((stats.totalReceived / stats.totalAgreed) * 100) : 0}% collected
            </span>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="p-4 rounded-2xl bg-[#141720] border border-amber-500/30">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pending Balance / Receivables
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400">
              ₹{stats.totalPending.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-amber-500 font-medium">{stats.partialCount + stats.pendingCount} unpaid</span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
            Settlement Status
          </span>
          <div className="flex items-center gap-3 text-xs mt-2 font-medium">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {stats.completedCount} Paid
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {stats.partialCount} Partial
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {stats.pendingCount} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#141720] border border-[#232734] flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business name or notes..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Payment Statuses</option>
            <option value="completed">Completed (Fully Paid)</option>
            <option value="partial">Partial (Advance Paid)</option>
            <option value="pending">Pending (Unpaid)</option>
          </select>
        </div>

        {/* Product Filter */}
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Products</option>
          {PRODUCT_CATEGORIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl bg-[#141720] border border-[#232734] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#0e1015] text-[11px] font-mono uppercase tracking-wider text-zinc-400 border-b border-[#232734]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Business Name</th>
                <th className="py-3.5 px-4 font-semibold">Product Purchased</th>
                <th className="py-3.5 px-4 font-semibold">Total Agreed</th>
                <th className="py-3.5 px-4 font-semibold">Amount Received</th>
                <th className="py-3.5 px-4 font-semibold">Pending Balance</th>
                <th className="py-3.5 px-4 font-semibold">Date &amp; Method</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Notes</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232734]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-zinc-500">
                    No payment records match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  return (
                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                      
                      {/* Business Name */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          <span>{payment.business_name}</span>
                        </div>
                      </td>

                      {/* Product Purchased */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#161a26] border border-[#2d3345] text-zinc-200 text-[11px] font-medium whitespace-nowrap">
                          {getProductName(payment.product_purchased)}
                        </span>
                      </td>

                      {/* Total Agreed */}
                      <td className="py-3.5 px-4 font-bold text-white font-mono">
                        ₹{payment.total_agreed_amount.toLocaleString("en-IN")}
                      </td>

                      {/* Amount Received */}
                      <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                        ₹{payment.amount_received.toLocaleString("en-IN")}
                      </td>

                      {/* Pending Balance */}
                      <td className="py-3.5 px-4 font-bold font-mono">
                        {payment.pending_balance > 0 ? (
                          <span className="text-amber-400">
                            ₹{payment.pending_balance.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-zinc-500">₹0 (Cleared)</span>
                        )}
                      </td>

                      {/* Date & Method */}
                      <td className="py-3.5 px-4 text-zinc-400">
                        <div className="flex flex-col text-[11px]">
                          <span className="text-zinc-200 font-mono">{payment.payment_date}</span>
                          <span className="uppercase text-[10px] text-zinc-500 font-semibold">
                            {payment.payment_method.replace("_", " ")}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {payment.payment_status === "completed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Paid</span>
                          </span>
                        )}
                        {payment.payment_status === "partial" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            <span>Partial</span>
                          </span>
                        )}
                        {payment.payment_status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-bold text-[10px] border border-rose-500/30">
                            <AlertCircle className="w-3 h-3" />
                            <span>Unpaid</span>
                          </span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-zinc-400 text-[11px]" title={payment.admin_notes || ""}>
                        {payment.admin_notes || "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {payment.payment_status !== "completed" && (
                            <button
                              onClick={() => handleQuickConfirm(payment)}
                              className="tactile-btn px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-[11px] font-bold cursor-pointer transition-transform active:scale-[0.978] shadow-xs flex items-center gap-1 whitespace-nowrap"
                              title="Confirm this payment and unlock hardware activation"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Confirm Paid</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(payment)}
                            className="p-1.5 rounded-lg bg-[#0e1015] hover:bg-[#232734] text-zinc-300 hover:text-white transition-colors cursor-pointer border border-[#232734]"
                            title="Edit Payment"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(payment.id, payment.business_name)}
                            className="p-1.5 rounded-lg bg-[#0e1015] hover:bg-rose-950/40 text-rose-400 transition-colors cursor-pointer border border-[#232734] hover:border-rose-900/50"
                            title="Delete Payment"
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

      {/* Add / Edit Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[#141720] border border-[#232734] p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#232734] pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>{editingPayment ? "Edit Payment Record" : "Record Manual Payment"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#232734] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Business Name *
                </label>
                {businesses.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={formData.business_id}
                      onChange={(e) => handleBusinessChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select Registered Business --</option>
                      {businesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.phone || b.city || "No contact"})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      placeholder="Or enter business / client name"
                      className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Enter business / client name"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                )}
              </div>

              {/* Product Purchased */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Product Purchased *
                </label>
                <select
                  value={formData.product_purchased}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {PRODUCT_CATEGORIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Default: ₹{p.defaultPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Total Agreed Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_agreed_amount}
                    onChange={(e) => setFormData({ ...formData, total_agreed_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.amount_received}
                    onChange={(e) => setFormData({ ...formData, amount_received: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Auto-Calculated Pending Balance Callout */}
              <div className="p-3 rounded-xl bg-[#0e1015] border border-[#232734] flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Pending Balance (Auto-Calculated):</span>
                <span className={`font-mono font-bold text-sm ${calculatedPending > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  ₹{calculatedPending.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Date, Method, Status Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e1015] border border-[#232734] text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e1015] border border-[#232734] text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="upi">UPI / GPay / PhonePe</option>
                    <option value="cash">Cash in Hand</option>
                    <option value="bank_transfer">NEFT / IMPS Bank</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card Swipe</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as PaymentStatus })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e1015] border border-[#232734] text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="completed">Completed (Paid)</option>
                    <option value="partial">Partial (Advance)</option>
                    <option value="pending">Pending (Unpaid)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  placeholder="e.g. Received via GPay from founder phone; 50% advance before standee dispatch."
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-[#232734] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#232734]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-[#232734] text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {editingPayment ? "Update Payment" : "Save Payment"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
