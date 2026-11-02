"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Trash2,
  Calendar,
  X,
  Banknote,
  QrCode,
  Edit2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import {
  PaymentItemRecord,
  DeletedPaymentRecord,
  ClientRecord,
  getAllPayments,
  getAllDeletedPayments,
  getAllClients,
  addPaymentServer,
  updatePaymentServer,
  softDeletePaymentServer,
  restorePaymentServer,
  permanentDeletePaymentServer,
  serverFetchPlatformData,
} from "@/lib/adminPlatformStore";
import BusinessSearchSelect from "../BusinessSearchSelect";

interface PaymentsWebpageTabProps {
  onShowToast: (msg: string) => void;
}

export default function PaymentsWebpageTab({ onShowToast }: PaymentsWebpageTabProps) {
  const [payments, setPayments] = useState<PaymentItemRecord[]>([]);
  const [deletedPayments, setDeletedPayments] = useState<DeletedPaymentRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "paid" | "unpaid" | "deleted">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Record Payment Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("Counter Standee");
  const [productPrice, setProductPrice] = useState<number>(1499);
  const [sellingRate, setSellingRate] = useState<number>(1499);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Cash">("UPI");
  const [paymentStatus, setPaymentStatus] = useState<"Completed paid" | "Partial Advance" | "Pending Unpaid">("Completed paid");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Edit Payment Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [editBusinessId, setEditBusinessId] = useState("");
  const [editBusinessName, setEditBusinessName] = useState("");
  const [editProduct, setEditProduct] = useState("Counter Standee");
  const [editProductPrice, setEditProductPrice] = useState<number>(1499);
  const [editSellingRate, setEditSellingRate] = useState<number>(1499);
  const [editPaymentDate, setEditPaymentDate] = useState<string>("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<"UPI" | "Cash">("UPI");
  const [editPaymentStatus, setEditPaymentStatus] = useState<"Completed paid" | "Partial Advance" | "Pending Unpaid">("Completed paid");
  const [editPaymentNotes, setEditPaymentNotes] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<PaymentItemRecord | null>(null);

  // Permanent delete confirmation (Deleted tab only)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<DeletedPaymentRecord | null>(null);
  const [typedConfirmName, setTypedConfirmName] = useState("");

  useEffect(() => {
    // Preserve URL state on refresh (Requirement 4)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const st = params.get("status");
      if (st === "deleted" || st === "paid" || st === "unpaid") {
        setFilterTab(st as any);
      }
    }
    refreshData();
  }, []);

  const setFilterAndUrl = (status: "all" | "paid" | "unpaid" | "deleted") => {
    setFilterTab(status);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (status === "all") {
        url.searchParams.delete("status");
      } else {
        url.searchParams.set("status", status);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const refreshData = async () => {
    setPayments(getAllPayments());
    setDeletedPayments(getAllDeletedPayments());
    setClients(getAllClients());
    const res = await serverFetchPlatformData();
    if (res.success && res.data) {
      setPayments(res.data.payments || []);
      setDeletedPayments(res.data.deletedPayments || []);
      setClients(res.data.clients || []);
    }
  };

  const handleOpenRecordModal = () => {
    const all = getAllClients();
    if (all.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(all[0].business_id);
    }
    setIsRecordModalOpen(true);
  };

  const handleProductChange = (prod: string) => {
    setSelectedProduct(prod);
    if (prod === "Counter Standee") {
      setProductPrice(1499);
      setSellingRate(1499);
    } else if (prod === "Business NFC Card") {
      setProductPrice(699);
      setSellingRate(699);
    } else {
      setProductPrice(2499);
      setSellingRate(2499);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetBiz = clients.find((c) => c.business_id === selectedBusinessId);
    if (!targetBiz) {
      onShowToast("Please select a valid registered business");
      return;
    }

    setIsSubmitting(true);
    const res = await addPaymentServer({
      business_id: targetBiz.business_id,
      business_name: targetBiz.business_name,
      product: selectedProduct,
      product_price: Number(productPrice) || 0,
      selling_rate: Number(sellingRate) || 0,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      notes: paymentNotes.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      onShowToast(`✓ Recorded payment of ₹${res.data.selling_rate} for ${res.data.business_name}!`);
      setIsRecordModalOpen(false);
      setPaymentNotes("");
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to record payment in database");
    }
  };

  // Open Edit Modal with full entry prefilled
  const openEditModal = (p: PaymentItemRecord) => {
    setEditTargetId(p.id);
    setEditBusinessId(p.business_id);
    setEditBusinessName(p.business_name);
    setEditProduct(p.product);
    setEditProductPrice(p.product_price);
    setEditSellingRate(p.selling_rate);
    setEditPaymentDate(p.payment_date);
    setEditPaymentMethod(p.payment_method);
    setEditPaymentStatus(p.payment_status);
    setEditPaymentNotes(p.notes || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetId) return;

    setIsSubmitting(true);
    const res = await updatePaymentServer(editTargetId, {
      business_id: editBusinessId.trim(),
      business_name: editBusinessName.trim(),
      product: editProduct,
      product_price: Number(editProductPrice) || 0,
      selling_rate: Number(editSellingRate) || 0,
      payment_date: editPaymentDate,
      payment_method: editPaymentMethod,
      payment_status: editPaymentStatus,
      notes: editPaymentNotes.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      onShowToast(`✓ Payment record for "${res.data.business_name}" updated!`);
      setIsEditModalOpen(false);
      setEditTargetId(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to update payment record");
    }
  };

  // Soft delete payment (moves to Deleted tab)
  const handleConfirmSoftDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const res = await softDeletePaymentServer(deleteTarget.id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Payment for "${deleteTarget.business_name}" moved to Deleted section`);
      setDeleteTarget(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to delete payment record");
    }
  };

  // Restore deleted payment
  const handleRestore = async (item: DeletedPaymentRecord) => {
    setIsSubmitting(true);
    const res = await restorePaymentServer(item.id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Restored payment for "${item.business_name}"!`);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to restore payment");
    }
  };

  // Permanent delete payment (Deleted tab only with typed confirmation)
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    const confirmName = permanentDeleteTarget.business_name.trim();
    if (typedConfirmName.trim().toLowerCase() !== confirmName.toLowerCase()) {
      onShowToast("Typed business name does not match.");
      return;
    }
    setIsSubmitting(true);
    const res = await permanentDeletePaymentServer(permanentDeleteTarget.id, typedConfirmName.trim());
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Permanently deleted payment for "${permanentDeleteTarget.business_name}"`);
      setPermanentDeleteTarget(null);
      setTypedConfirmName("");
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to permanently delete payment");
    }
  };

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filterList = <T extends PaymentItemRecord>(items: T[]): T[] => {
    return items.filter((p) => {
      if (!q) return true;
      return (
        (p.business_id && p.business_id.toLowerCase().includes(q)) ||
        (p.business_name && p.business_name.toLowerCase().includes(q)) ||
        (p.product && p.product.toLowerCase().includes(q)) ||
        (p.payment_method && p.payment_method.toLowerCase().includes(q)) ||
        (p.payment_status && p.payment_status.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    });
  };

  // Category filter
  let displayedPayments = filterList(payments);
  if (filterTab === "paid") {
    displayedPayments = displayedPayments.filter((p) => p.payment_status === "Completed paid");
  } else if (filterTab === "unpaid") {
    displayedPayments = displayedPayments.filter(
      (p) => p.payment_status === "Pending Unpaid" || p.payment_status === "Partial Advance"
    );
  }

  const displayedDeleted = filterList(deletedPayments);

  // Calculate totals for active payments
  const totalReceived = payments.reduce((acc, p) => acc + (p.selling_rate || 0), 0);
  const totalAgreed = payments.reduce((acc, p) => acc + (p.product_price || 0), 0);

  const statusColors = {
    "Completed paid": "bg-emerald-50 text-emerald-800 border-emerald-300",
    "Partial Advance": "bg-amber-50 text-amber-800 border-amber-300",
    "Pending Unpaid": "bg-rose-50 text-rose-800 border-rose-300",
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Payments Ledger</h1>
              <p className="text-xs text-zinc-500">
                Track payments, selling rates, and collection modes with full edit and audit history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenRecordModal}
              className="tactile-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-zinc-100">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
            <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Amount Collected
            </span>
            <span className="text-xl font-extrabold text-emerald-600">
              ₹{totalReceived.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
            <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Product Value
            </span>
            <span className="text-xl font-extrabold text-zinc-900">
              ₹{totalAgreed.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
            <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Transactions Recorded
            </span>
            <span className="text-xl font-extrabold text-zinc-900">{payments.length}</span>
          </div>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-100">
          {/* 4 Tabs: All, Paid, Unpaid, Deleted */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl w-fit">
            <button
              onClick={() => setFilterAndUrl("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === "all"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All ({payments.length})
            </button>
            <button
              onClick={() => setFilterAndUrl("paid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === "paid"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Paid ({payments.filter((p) => p.payment_status === "Completed paid").length})
            </button>
            <button
              onClick={() => setFilterAndUrl("unpaid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === "unpaid"
                  ? "bg-white text-amber-700 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Unpaid ({payments.filter((p) => p.payment_status !== "Completed paid").length})
            </button>
            <button
              onClick={() => setFilterAndUrl("deleted")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === "deleted"
                  ? "bg-white text-rose-700 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Deleted ({deletedPayments.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name, method, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* ACTIVE PAYMENTS TABLE (All / Paid / Unpaid) */}
      {filterTab !== "deleted" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Product Price</th>
                  <th className="py-3.5 px-4">Selling Rate / Received</th>
                  <th className="py-3.5 px-4">Date &amp; Method</th>
                  <th className="py-3.5 px-4">Status of Payment</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {displayedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500 font-medium">
                      No payment records found. Click &ldquo;Record Payment&rdquo; to add one.
                    </td>
                  </tr>
                ) : (
                  displayedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Business ID */}
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[11px]">
                          {p.business_id}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-zinc-900">
                        {p.business_name}
                        <span className="block text-[10px] font-normal text-zinc-500">
                          {p.product}
                        </span>
                      </td>

                      {/* Product Price */}
                      <td className="py-3 px-4 text-zinc-700 whitespace-nowrap font-medium">
                        ₹{(p.product_price || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Selling Rate / Amount received */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-700">
                        ₹{(p.selling_rate || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Date and Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                          {p.payment_method === "UPI" ? (
                            <QrCode className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>{p.payment_method}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">{p.payment_date}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                            statusColors[p.payment_status] || "bg-zinc-100 text-zinc-700 border-zinc-200"
                          }`}
                        >
                          {p.payment_status}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 text-zinc-600 text-[11px] max-w-xs truncate">
                        {p.notes || <span className="text-zinc-400">—</span>}
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Whole Entry"
                            className="tactile-btn p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            title="Delete Payment"
                            className="tactile-btn p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELETED PAYMENTS TABLE */}
      {filterTab === "deleted" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold">Deleted Payments Registry</span>
            </div>
            <span className="text-[11px] text-rose-700">
              Archived payment details. Can be restored back to active ledger at any time.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date &amp; Method</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {displayedDeleted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500 font-medium">
                      No deleted payment records.
                    </td>
                  </tr>
                ) : (
                  displayedDeleted.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[11px]">
                          {item.business_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900">{item.business_name}</td>
                      <td className="py-3 px-4 text-zinc-700">{item.product}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        ₹{(item.selling_rate || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        {item.payment_date} ({item.payment_method})
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px]">
                        {new Date(item.deleted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px] max-w-xs truncate">
                        {item.notes || "—"}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(item)}
                            disabled={isSubmitting}
                            className="tactile-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => {
                              setPermanentDeleteTarget(item);
                              setTypedConfirmName("");
                            }}
                            disabled={isSubmitting}
                            className="tactile-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD PAYMENT                                                     */}
      {/* ========================================================================= */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Record Payment</h3>
                  <p className="text-[11px] text-zinc-500">Add payment details for a registered business</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4">
              <BusinessSearchSelect
                clients={clients}
                selectedBusinessId={selectedBusinessId}
                onSelect={(biz) => setSelectedBusinessId(biz ? biz.business_id : "")}
                label="Select Registered Business"
                required
                placeholder="Search by ID or Name as you type..."
              />

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white font-medium"
                >
                  <option value="Counter Standee">Counter Standee (Standard ₹1,499)</option>
                  <option value="Business NFC Card">Business NFC Card (Standard ₹699)</option>
                  <option value="Dual Combo (Standee + Card)">Dual Combo (Standee + Card) (₹2,499)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Product Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Selling Rate / Amount Received (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sellingRate}
                    onChange={(e) => setSellingRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-emerald-700 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        paymentMethod === "UPI"
                          ? "bg-blue-50 border-blue-400 text-blue-900"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash")}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        paymentMethod === "Cash"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      Cash
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("Completed paid")}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      paymentStatus === "Completed paid"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    Completed Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("Partial Advance")}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      paymentStatus === "Partial Advance"
                        ? "bg-amber-50 border-amber-400 text-amber-900"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    Partial Advance
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("Pending Unpaid")}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      paymentStatus === "Pending Unpaid"
                        ? "bg-rose-50 border-rose-400 text-rose-900"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    Pending Unpaid
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Received via GPay from founder. Standee dispatched via BlueDart."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
                >
                  Save Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PAYMENT (WHOLE ENTRY)                                         */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Edit Payment Entry</h3>
                  <p className="text-[11px] text-zinc-500">Modify payment amount, method, status, or notes</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <BusinessSearchSelect
                clients={clients}
                selectedBusinessId={editBusinessId}
                onSelect={(biz) => {
                  if (biz) {
                    setEditBusinessId(biz.business_id);
                    setEditBusinessName(biz.business_name);
                  } else {
                    setEditBusinessId("");
                    setEditBusinessName("");
                  }
                }}
                label="Registered Business"
                required
                placeholder="Search business to reassign..."
              />

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Product</label>
                <input
                  type="text"
                  value={editProduct}
                  onChange={(e) => setEditProduct(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Product Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editProductPrice}
                    onChange={(e) => setEditProductPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Selling Rate / Received (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editSellingRate}
                    onChange={(e) => setEditSellingRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-emerald-700 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={editPaymentDate}
                    onChange={(e) => setEditPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditPaymentMethod("UPI")}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        editPaymentMethod === "UPI"
                          ? "bg-blue-50 border-blue-400 text-blue-900"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPaymentMethod("Cash")}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        editPaymentMethod === "Cash"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      Cash
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPaymentStatus("Completed paid")}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      editPaymentStatus === "Completed paid"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    Completed Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPaymentStatus("Partial Advance")}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      editPaymentStatus === "Partial Advance"
                        ? "bg-amber-50 border-amber-400 text-amber-900"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    Partial Advance
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPaymentStatus("Pending Unpaid")}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      editPaymentStatus === "Pending Unpaid"
                        ? "bg-rose-50 border-rose-400 text-rose-900"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    Pending Unpaid
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={editPaymentNotes}
                  onChange={(e) => setEditPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SOFT DELETE CONFIRMATION                                            */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-zinc-900">Move Payment to Deleted Section?</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Are you sure you want to delete payment for <strong className="text-zinc-900 font-bold">{deleteTarget.business_name}</strong> (₹{deleteTarget.selling_rate})?
                This record will be moved to the <strong>Deleted</strong> section and can be restored at any time.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSoftDelete}
                disabled={isSubmitting}
                className="tactile-btn px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Yes, Move to Deleted"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PERMANENT DELETE WITH TYPED CONFIRMATION (Deleted Tab Only)          */}
      {/* ========================================================================= */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-rose-950">Delete Payment Permanently</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                This action is <strong>irreversible</strong>. The payment record for <strong>{permanentDeleteTarget.business_name}</strong> (₹{permanentDeleteTarget.selling_rate}) will be completely deleted from the database.
              </p>
            </div>

            <div className="space-y-2 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
              <label className="block text-[11px] font-bold text-zinc-800">
                To confirm permanent deletion, please type:
                <span className="block mt-1 font-mono text-xs text-rose-900 bg-white px-2 py-1 rounded border border-rose-200 select-all">
                  {permanentDeleteTarget.business_name}
                </span>
              </label>
              <input
                type="text"
                value={typedConfirmName}
                onChange={(e) => setTypedConfirmName(e.target.value)}
                placeholder="Type exact business name here"
                className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setPermanentDeleteTarget(null);
                  setTypedConfirmName("");
                }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={
                  isSubmitting ||
                  typedConfirmName.trim().toLowerCase() !== permanentDeleteTarget.business_name.trim().toLowerCase()
                }
                className="tactile-btn px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
