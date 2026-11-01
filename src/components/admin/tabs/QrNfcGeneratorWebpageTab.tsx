"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Search,
  Plus,
  Layers,
  Download,
  Copy,
  Check,
  Edit,
  ExternalLink,
  X,
  Radio,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import QRCode from "qrcode";
import {
  QrNfcTagItemRecord,
  ClientRecord,
  getAllQrNfcTags,
  getAllClients,
  createSingleTag,
  generateBatchTags,
  assignTagBusiness,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";

interface QrNfcGeneratorWebpageTabProps {
  onShowToast: (msg: string) => void;
}

export default function QrNfcGeneratorWebpageTab({ onShowToast }: QrNfcGeneratorWebpageTabProps) {
  const [tags, setTags] = useState<QrNfcTagItemRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  
  // Default filter on this page: Unassigned as requested!
  const [statusFilter, setStatusFilter] = useState<"all" | "unassigned" | "assigned">("unassigned");
  const [productFilter, setProductFilter] = useState<"all" | "Counter Standee" | "Business NFC Card">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [singleProductType, setSingleProductType] = useState<"Counter Standee" | "Business NFC Card">("Counter Standee");
  const [singleBusinessId, setSingleBusinessId] = useState("");

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchProductType, setBatchProductType] = useState<"Counter Standee" | "Business NFC Card">("Counter Standee");
  const [batchQuantity, setBatchQuantity] = useState<number>(10);

  // Edit Business ID Modal
  const [editTargetTag, setEditTargetTag] = useState<QrNfcTagItemRecord | null>(null);
  const [assignBizId, setAssignBizId] = useState("");

  // QR Preview Modal
  const [qrModalTag, setQrModalTag] = useState<QrNfcTagItemRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setTags(getAllQrNfcTags());
    setClients(getAllClients());
  };

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBiz = singleBusinessId ? clients.find((c) => c.business_id === singleBusinessId) : null;
    const created = createSingleTag({
      product_type: singleProductType,
      business_id: targetBiz ? targetBiz.business_id : null,
      business_name: targetBiz ? targetBiz.business_name : null,
    });

    onShowToast(`✓ Created ${created.product_type} with unique ID ${created.tag_id}!`);
    setIsSingleModalOpen(false);
    setSingleBusinessId("");
    refreshData();
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, Math.min(100, Number(batchQuantity) || 1));
    const created = generateBatchTags({
      product_type: batchProductType,
      quantity: qty,
    });

    onShowToast(`✓ Generated batch of ${created.length} ${batchProductType} tags (${created[0]?.tag_id} - ${created[created.length - 1]?.tag_id})!`);
    setIsBatchModalOpen(false);
    refreshData();
  };

  const handleAssignBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetTag) return;
    const targetBiz = clients.find((c) => c.business_id === assignBizId);
    if (!targetBiz) {
      onShowToast("Please select a registered business");
      return;
    }

    const updated = assignTagBusiness(editTargetTag.tag_id, targetBiz.business_id, targetBiz.business_name);
    if (updated) {
      onShowToast(`✓ Assigned ${targetBiz.business_name} (${targetBiz.business_id}) to ${updated.tag_id}!`);
      setEditTargetTag(null);
      refreshData();
    }
  };

  const handleOpenQrModal = async (tag: QrNfcTagItemRecord) => {
    setQrModalTag(tag);
    try {
      const url = await QRCode.toDataURL(tag.link, {
        width: 320,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.warn("QR generation error", err);
    }
  };

  const handleDownloadQr = (tag: QrNfcTagItemRecord, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `zentap-qr-${tag.tag_id.toLowerCase()}.png`;
    a.click();
    onShowToast(`✓ Downloaded dynamic QR code for ${tag.tag_id}`);
  };

  const handleCopyNfcLink = (tag: QrNfcTagItemRecord) => {
    const nfcUrl = `${tag.link}?s=nfc`;
    navigator.clipboard.writeText(nfcUrl);
    setCopiedId(tag.tag_id);
    onShowToast(`✓ Copied NFC writing link: ${nfcUrl}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter Logic
  const q = searchQuery.toLowerCase().trim();
  const filteredTags = tags.filter((t) => {
    // 1. Status Filter (Default: unassigned)
    if (statusFilter === "unassigned" && t.business_id) return false;
    if (statusFilter === "assigned" && !t.business_id) return false;

    // 2. Product Filter
    if (productFilter !== "all" && t.product_type !== productFilter) return false;

    // 3. Search query
    if (q) {
      const matchTag = t.tag_id && t.tag_id.toLowerCase().includes(q);
      const matchBizId = t.business_id && t.business_id.toLowerCase().includes(q);
      const matchBizName = t.business_name && t.business_name.toLowerCase().includes(q);
      const matchProduct = t.product_type && t.product_type.toLowerCase().includes(q);
      if (!matchTag && !matchBizId && !matchBizName && !matchProduct) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">QR / NFC Generator</h1>
              <p className="text-xs text-zinc-500">
                Generate single or batch QR &amp; NFC links for Counter Standees (ST) and Smart Cards (CRD)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsSingleModalOpen(true)}
              className="tactile-btn flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create Single Tag</span>
            </button>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="tactile-btn flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
            >
              <Layers className="w-4 h-4 text-white" />
              <span>Generate Batch (1-100)</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Default Unassigned */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-zinc-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200/60">
              <button
                onClick={() => setStatusFilter("unassigned")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "unassigned"
                    ? "bg-rose-50 text-rose-700 shadow-xs border border-rose-200"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Unassigned ({tags.filter((t) => !t.business_id).length})
              </button>
              <button
                onClick={() => setStatusFilter("assigned")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "assigned"
                    ? "bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Assigned ({tags.filter((t) => !!t.business_id).length})
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                All ({tags.length})
              </button>
            </div>

            {/* Product Type Filter */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl border border-zinc-200/60">
              <button
                onClick={() => setProductFilter("all")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  productFilter === "all" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600"
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setProductFilter("Counter Standee")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  productFilter === "Counter Standee" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600"
                }`}
              >
                Standees (ST)
              </button>
              <button
                onClick={() => setProductFilter("Business NFC Card")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  productFilter === "Business NFC Card" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600"
                }`}
              >
                Cards (CRD)
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Tag ID, Business ID, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* GENERATOR TAGS TABLE */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Business ID</th>
                <th className="py-3.5 px-4">Product Type</th>
                <th className="py-3.5 px-4">Tag ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Generated Link</th>
                <th className="py-3.5 px-4 text-center">QR Code</th>
                <th className="py-3.5 px-4 text-center">NFC Link</th>
                <th className="py-3.5 px-4 text-right">Assign Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 font-medium">
                    No hardware tags found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Business ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tag.business_id ? (
                        <div>
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-200 text-[11px]">
                            {tag.business_id}
                          </span>
                          <span className="block font-bold text-zinc-900 mt-0.5">
                            {tag.business_name}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-500 border border-zinc-200">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Product Type */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-zinc-800">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          tag.product_type === "Counter Standee"
                            ? "bg-orange-50 text-orange-900 border border-orange-200"
                            : "bg-blue-50 text-blue-900 border border-blue-200"
                        }`}
                      >
                        {tag.product_type}
                      </span>
                    </td>

                    {/* Tag ID */}
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-xs tracking-wider">
                        {tag.tag_id}
                      </span>
                    </td>

                    {/* Status of the Standee/Card: Assigned (Green) or Not Assigned (Red) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tag.business_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Assigned</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold">
                          <X className="w-3 h-3 text-rose-600" />
                          <span>Not Assigned</span>
                        </span>
                      )}
                    </td>

                    {/* Link */}
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 whitespace-nowrap">
                      <a
                        href={tag.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <span>{tag.link}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </td>

                    {/* Download QR */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenQrModal(tag)}
                        className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-zinc-700" />
                        <span>Download QR</span>
                      </button>
                    </td>

                    {/* NFC Link Copy */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleCopyNfcLink(tag)}
                        className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        {copiedId === tag.tag_id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-3.5 h-3.5 text-zinc-300" />
                            <span>Copy NFC</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Edit Business ID */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditTargetTag(tag);
                          setAssignBizId(tag.business_id || (clients[0]?.business_id || ""));
                        }}
                        className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Edit className="w-3 h-3 text-zinc-500" />
                        <span>{tag.business_id ? "Reassign" : "Assign ID"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE SINGLE TAG                                                  */}
      {/* ========================================================================= */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Create Single Tag</h3>
                  <p className="text-[11px] text-zinc-500">Auto-assigns next sequential Tag ID</p>
                </div>
              </div>
              <button
                onClick={() => setIsSingleModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Product Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleProductType("Counter Standee")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      singleProductType === "Counter Standee"
                        ? "border-orange-500 bg-orange-50 text-orange-950 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">Counter Standee</span>
                    <span className="text-[10px] text-zinc-500">Tag Prefix: ST</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleProductType("Business NFC Card")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      singleProductType === "Business NFC Card"
                        ? "border-blue-500 bg-blue-50 text-blue-950 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">NFC Card</span>
                    <span className="text-[10px] text-zinc-500">Tag Prefix: CRD</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Assign to Business? <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <select
                  value={singleBusinessId}
                  onChange={(e) => setSingleBusinessId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="">-- Keep in inventory (Not Assigned) --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.business_id}>
                      [{c.business_id}] {c.business_name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Generate Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GENERATE BATCH                                                     */}
      {/* ========================================================================= */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Generate Batch of QR &amp; NFC</h3>
                  <p className="text-[11px] text-zinc-500">Only product type and quantity required</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Product Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchProductType("Counter Standee")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      batchProductType === "Counter Standee"
                        ? "border-orange-500 bg-orange-50 text-orange-950 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">Counter Standee</span>
                    <span className="text-[10px] text-zinc-500">IDs: ST1, ST2...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchProductType("Business NFC Card")}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      batchProductType === "Business NFC Card"
                        ? "border-blue-500 bg-blue-50 text-blue-950 font-bold"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    <span className="block text-xs font-bold">NFC Card</span>
                    <span className="text-[10px] text-zinc-500">IDs: CRD1, CRD2...</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Quantity (Minimum 1 to Maximum 100 units) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={batchQuantity}
                  onChange={(e) => setBatchQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-extrabold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Enter number of hardware units to generate (1 - 100).
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Generate Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN / REASSIGN BUSINESS ID                                      */}
      {/* ========================================================================= */}
      {editTargetTag && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-zinc-900" />
                <h3 className="font-bold text-lg text-zinc-900">
                  Assign Business to {editTargetTag.tag_id}
                </h3>
              </div>
              <button
                onClick={() => setEditTargetTag(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Select Registered Client *
                </label>
                <select
                  value={assignBizId}
                  onChange={(e) => setAssignBizId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.business_id}>
                      [{c.business_id}] {c.business_name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditTargetTag(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR CODE PREVIEW & DOWNLOAD                                         */}
      {/* ========================================================================= */}
      {qrModalTag && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-zinc-900 text-white">
                {qrModalTag.tag_id}
              </span>
              <button
                onClick={() => setQrModalTag(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-zinc-900 text-sm">
                {qrModalTag.business_name || "Unassigned Tag"}
              </h4>
              <p className="text-[11px] text-zinc-500 font-mono truncate">{qrModalTag.link}</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 inline-block">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${qrModalTag.tag_id}`}
                  className="w-48 h-48 mx-auto rounded-lg shadow-2xs"
                />
              )}
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => handleDownloadQr(qrModalTag, qrDataUrl)}
                className="tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => handleCopyNfcLink(qrModalTag)}
                className="tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-200 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
