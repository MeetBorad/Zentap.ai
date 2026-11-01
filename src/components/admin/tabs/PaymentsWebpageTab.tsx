"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Plus,
  Trash2,
  Lock,
  Calendar,
  X,
  Banknote,
  QrCode,
  AlertTriangle,
} from "lucide-react";
import {
  PaymentItemRecord,
  ClientRecord,
  getAllPayments,
  getAllClients,
  addPayment,
  deletePaymentWithPassword,
} from "@/lib/adminPlatformStore";

interface PaymentsWebpageTabProps {
  onShowToast: (msg: string) => void;
}

export default function PaymentsWebpageTab({ onShowToast }: PaymentsWebpageTabProps) {
  const [payments, setPayments] = useState<PaymentItemRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Delete with Password Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPayments(getAllPayments());
    setClients(getAllClients());
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

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBiz = clients.find((c) => c.business_id === selectedBusinessId);
    if (!targetBiz) {
      onShowToast("Please select a valid registered business");
      return;
    }

    const created = addPayment({
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

    onShowToast(`✓ Recorded payment of ₹${created.selling_rate} for ${created.business_name}!`);
    setIsRecordModalOpen(false);
    setPaymentNotes("");
    refreshData();
  };

  const handleDeleteWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTargetId) return;

    const res = deletePaymentWithPassword(deleteTargetId, adminPasswordInput);
    if (res.success) {
      onShowToast(`✓ ${res.message}`);
      setDeleteTargetId(null);
      setAdminPasswordInput("");
      setPasswordError("");
      refreshData();
    } else {
      setPasswordError(res.message);
    }
  };

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filteredPayments = payments.filter((p) => {
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

  // Calculate totals
  const totalReceived = payments.reduce((acc, p) => acc + (p.selling_rate || 0), 0);
  const totalAgreed = payments.reduce((acc, p) => acc + (p.product_price || 0), 0);

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
                Track payments, selling rates, and collection modes. Protected with admin credentials.
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

        {/* Search Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name, method, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* PAYMENTS TABLE */}
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
                <th className="py-3.5 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 font-medium">
                    No payment records found. Click &ldquo;Record Payment&rdquo; to add one.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const statusColors = {
                    "Completed paid": "bg-emerald-50 text-emerald-800 border-emerald-300",
                    "Partial Advance": "bg-amber-50 text-amber-800 border-amber-300",
                    "Pending Unpaid": "bg-rose-50 text-rose-800 border-rose-300",
                  };

                  return (
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

                      {/* Delete with Password */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setDeleteTargetId(p.id);
                            setPasswordError("");
                            setAdminPasswordInput("");
                          }}
                          title="Delete requires Admin Password"
                          className="tactile-btn inline-flex items-center gap-1 p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                        >
                          <Lock className="w-3 h-3 text-rose-400" />
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              {/* Select Business from Clients */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Select Registered Business *
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.business_id}>
                      [{c.business_id}] {c.business_name} ({c.city || "India"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Product *</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="Counter Standee">Counter Standee (₹1,499 standard)</option>
                  <option value="Business NFC Card">Business NFC Card (₹699 standard)</option>
                  <option value="ZenTap Custom Solutions">ZenTap Custom Solutions (₹2,499+)</option>
                </select>
              </div>

              {/* Price & Selling Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Product Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Selling Rate / Received (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={sellingRate}
                    onChange={(e) => setSellingRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-emerald-700 font-bold focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Date and Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Method *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        paymentMethod === "UPI"
                          ? "bg-blue-50 border-blue-400 text-blue-900"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      UPI / GPay
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

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Payment Status *</label>
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

              {/* Notes */}
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
      {/* MODAL: DELETE CONFIRMATION WITH ADMIN PASSWORD                            */}
      {/* ========================================================================= */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-zinc-900">Admin Authentication Required</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Payment records cannot be deleted without entering the Super Admin password.
              </p>
            </div>

            <form onSubmit={handleDeleteWithPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Enter Admin Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
                {passwordError && (
                  <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTargetId(null);
                    setAdminPasswordInput("");
                    setPasswordError("");
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Verify &amp; Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
