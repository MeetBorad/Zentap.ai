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
  Edit2,
  Trash2,
  RotateCcw,
  ExternalLink,
  X,
  Radio,
  CheckCircle2,
  SlidersHorizontal,
  Building2,
  ShieldAlert,
} from "lucide-react";
import QRCode from "qrcode";
import {
  QrNfcTagItemRecord,
  DeletedQrNfcTagRecord,
  ClientRecord,
  getAllQrNfcTags,
  getAllDeletedQrNfcTags,
  getAllClients,
  createSingleTag,
  generateBatchTags,
  assignTagBusiness,
  updateQrNfcTag,
  softDeleteTagServer,
  restoreTagServer,
  permanentDeleteTagServer,
  serverFetchPlatformData,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";

interface QrNfcGeneratorWebpageTabProps {
  onShowToast: (msg: string) => void;
}

export default function QrNfcGeneratorWebpageTab({ onShowToast }: QrNfcGeneratorWebpageTabProps) {
  const [tags, setTags] = useState<QrNfcTagItemRecord[]>([]);
  const [deletedTags, setDeletedTags] = useState<DeletedQrNfcTagRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default filter on this page: Unassigned as requested!
  const [statusFilter, setStatusFilter] = useState<"all" | "unassigned" | "assigned" | "deleted">("unassigned");
  const [productFilter, setProductFilter] = useState<"all" | "Counter Standee" | "Business NFC Card">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals: Create Single Tag
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [singleProductType, setSingleProductType] = useState<"Counter Standee" | "Business NFC Card">("Counter Standee");
  const [singleBusinessId, setSingleBusinessId] = useState("");
  const [singleBizSearch, setSingleBizSearch] = useState("");

  // Modals: Generate Batch
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchProductType, setBatchProductType] = useState<"Counter Standee" | "Business NFC Card">("Counter Standee");
  const [batchQuantity, setBatchQuantity] = useState<number>(10);

  // Modals: Assign Business ID
  const [editTargetTag, setEditTargetTag] = useState<QrNfcTagItemRecord | null>(null);
  const [assignBizId, setAssignBizId] = useState("");
  const [assignBizSearch, setAssignBizSearch] = useState("");

  // Modals: Edit Whole Entry
  const [isEditWholeOpen, setIsEditWholeOpen] = useState(false);
  const [editWholeTagId, setEditWholeTagId] = useState("");
  const [editWholeProductType, setEditWholeProductType] = useState<"Counter Standee" | "Business NFC Card">("Counter Standee");
  const [editWholeBusinessId, setEditWholeBusinessId] = useState("");
  const [editWholeBusinessName, setEditWholeBusinessName] = useState("");
  const [editWholeLink, setEditWholeLink] = useState("");
  const [editWholeScans, setEditWholeScans] = useState<number>(0);
  const [editWholeSearch, setEditWholeSearch] = useState("");

  // Delete target (Soft delete)
  const [deleteTarget, setDeleteTarget] = useState<QrNfcTagItemRecord | null>(null);

  // Permanent delete (Deleted tab only)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<DeletedQrNfcTagRecord | null>(null);
  const [typedConfirmName, setTypedConfirmName] = useState("");

  // QR Preview Modal
  const [qrModalTag, setQrModalTag] = useState<QrNfcTagItemRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Preserve URL state on refresh (Requirement 4)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const st = params.get("status");
      if (st === "deleted" || st === "assigned" || st === "unassigned" || st === "all") {
        setStatusFilter(st as any);
      }
    }
    refreshData();
  }, []);

  const setStatusAndUrl = (status: "all" | "unassigned" | "assigned" | "deleted") => {
    setStatusFilter(status);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (status === "unassigned") {
        url.searchParams.delete("status");
      } else {
        url.searchParams.set("status", status);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const refreshData = async () => {
    setTags(getAllQrNfcTags());
    setDeletedTags(getAllDeletedQrNfcTags());
    setClients(getAllClients());
    const res = await serverFetchPlatformData();
    if (res.success && res.data) {
      setTags(res.data.tags || []);
      setDeletedTags(res.data.deletedTags || []);
      setClients(res.data.clients || []);
    }
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
    setSingleBizSearch("");
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
      setAssignBizSearch("");
      refreshData();
    }
  };

  // Open Edit Whole Entry Modal
  const openEditWholeModal = (tag: QrNfcTagItemRecord) => {
    setEditWholeTagId(tag.tag_id);
    setEditWholeProductType(tag.product_type);
    setEditWholeBusinessId(tag.business_id || "");
    setEditWholeBusinessName(tag.business_name || "");
    setEditWholeLink(tag.link);
    setEditWholeScans(tag.scans_count || 0);
    setEditWholeSearch("");
    setIsEditWholeOpen(true);
  };

  const handleEditWholeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let bizName = editWholeBusinessName.trim();
    if (editWholeBusinessId) {
      const match = clients.find((c) => c.business_id === editWholeBusinessId);
      if (match) bizName = match.business_name;
    }

    const updated = updateQrNfcTag(editWholeTagId, {
      product_type: editWholeProductType,
      business_id: editWholeBusinessId || null,
      business_name: editWholeBusinessId ? bizName : null,
      link: editWholeLink.trim(),
      scans_count: Number(editWholeScans) || 0,
    });

    if (updated) {
      onShowToast(`✓ Tag ${updated.tag_id} entry updated successfully!`);
      setIsEditWholeOpen(false);
      refreshData();
    }
  };

  // Soft delete tag
  const handleConfirmSoftDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const res = await softDeleteTagServer(deleteTarget.tag_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Tag ${deleteTarget.tag_id} moved to Deleted section`);
      setDeleteTarget(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to delete tag");
    }
  };

  // Restore deleted tag
  const handleRestore = async (item: DeletedQrNfcTagRecord) => {
    setIsSubmitting(true);
    const res = await restoreTagServer(item.tag_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Restored tag ${item.tag_id}!`);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to restore tag");
    }
  };

  // Permanent delete tag (Deleted tab only with typed Tag ID confirmation)
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    if (typedConfirmName.trim().toUpperCase() !== permanentDeleteTarget.tag_id.trim().toUpperCase()) {
      onShowToast(`Typed Tag ID does not match "${permanentDeleteTarget.tag_id}".`);
      return;
    }
    setIsSubmitting(true);
    const res = await permanentDeleteTagServer(permanentDeleteTarget.tag_id, typedConfirmName.trim());
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Permanently deleted tag ${permanentDeleteTarget.tag_id}`);
      setPermanentDeleteTarget(null);
      setTypedConfirmName("");
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to permanently delete tag");
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

  const filteredDeleted = deletedTags.filter((t) => {
    if (!q) return true;
    return (
      (t.tag_id && t.tag_id.toLowerCase().includes(q)) ||
      (t.business_id && t.business_id.toLowerCase().includes(q)) ||
      (t.business_name && t.business_name.toLowerCase().includes(q)) ||
      (t.product_type && t.product_type.toLowerCase().includes(q))
    );
  });

  // Filtered clients for single modal search
  const filteredClientsForSingle = clients.filter((c) => {
    const sq = singleBizSearch.toLowerCase().trim();
    if (!sq) return true;
    return (
      c.business_id.toLowerCase().includes(sq) ||
      c.business_name.toLowerCase().includes(sq) ||
      (c.owner_name && c.owner_name.toLowerCase().includes(sq)) ||
      (c.city && c.city.toLowerCase().includes(sq))
    );
  });

  // Filtered clients for assign modal search
  const filteredClientsForAssign = clients.filter((c) => {
    const sq = assignBizSearch.toLowerCase().trim();
    if (!sq) return true;
    return (
      c.business_id.toLowerCase().includes(sq) ||
      c.business_name.toLowerCase().includes(sq) ||
      (c.owner_name && c.owner_name.toLowerCase().includes(sq)) ||
      (c.city && c.city.toLowerCase().includes(sq))
    );
  });

  // Filtered clients for edit whole modal search
  const filteredClientsForEdit = clients.filter((c) => {
    const sq = editWholeSearch.toLowerCase().trim();
    if (!sq) return true;
    return (
      c.business_id.toLowerCase().includes(sq) ||
      c.business_name.toLowerCase().includes(sq) ||
      (c.owner_name && c.owner_name.toLowerCase().includes(sq)) ||
      (c.city && c.city.toLowerCase().includes(sq))
    );
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
              onClick={() => {
                setSingleBizSearch("");
                setSingleBusinessId("");
                setIsSingleModalOpen(true);
              }}
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
                onClick={() => setStatusAndUrl("unassigned")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "unassigned"
                    ? "bg-rose-50 text-rose-700 shadow-xs border border-rose-200"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Unassigned ({tags.filter((t) => !t.business_id).length})
              </button>
              <button
                onClick={() => setStatusAndUrl("assigned")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "assigned"
                    ? "bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Assigned ({tags.filter((t) => !!t.business_id).length})
              </button>
              <button
                onClick={() => setStatusAndUrl("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                All ({tags.length})
              </button>
              <button
                onClick={() => setStatusAndUrl("deleted")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "deleted"
                    ? "bg-white text-rose-700 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Deleted ({deletedTags.length})
              </button>
            </div>

            {/* Product Type Filter */}
            {statusFilter !== "deleted" && (
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
                    productFilter === "Counter Standee"
                      ? "bg-white text-orange-950 font-bold shadow-xs"
                      : "text-zinc-600"
                  }`}
                >
                  Standees (ST)
                </button>
                <button
                  onClick={() => setProductFilter("Business NFC Card")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    productFilter === "Business NFC Card"
                      ? "bg-white text-blue-950 font-bold shadow-xs"
                      : "text-zinc-600"
                  }`}
                >
                  Cards (CRD)
                </button>
              </div>
            )}
          </div>

          {/* Search Input */}
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

      {/* ACTIVE TAGS TABLE */}
      {statusFilter !== "deleted" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Product Type</th>
                  <th className="py-3.5 px-4">Tag ID</th>
                  <th className="py-3.5 px-4">Status of Standee/Card</th>
                  <th className="py-3.5 px-4">Generated Link</th>
                  <th className="py-3.5 px-4 text-center">Download QR</th>
                  <th className="py-3.5 px-4 text-center">NFC Link</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTags.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500 font-medium">
                      No tags match the current filter. Click &ldquo;Create Single Tag&rdquo; or &ldquo;Generate Batch&rdquo; to add tags.
                    </td>
                  </tr>
                ) : (
                  filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Business ID */}
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                        {tag.business_id ? (
                          <div>
                            <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-[11px] font-bold">
                              {tag.business_id}
                            </span>
                            <span className="block text-[11px] font-sans font-semibold text-zinc-800 mt-1">
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

                      {/* Status */}
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

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign/Reassign button */}
                          <button
                            onClick={() => {
                              setEditTargetTag(tag);
                              setAssignBizId(tag.business_id || (clients[0]?.business_id || ""));
                              setAssignBizSearch("");
                            }}
                            title="Assign Business ID"
                            className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <Edit className="w-3 h-3 text-zinc-500" />
                            <span>{tag.business_id ? "Reassign" : "Assign"}</span>
                          </button>

                          {/* Edit Whole Entry */}
                          <button
                            onClick={() => openEditWholeModal(tag)}
                            title="Edit Whole Entry"
                            className="tactile-btn p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(tag)}
                            title="Delete Tag"
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

      {/* DELETED TAGS TABLE */}
      {statusFilter === "deleted" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold">Deleted QR/NFC Tags Registry</span>
            </div>
            <span className="text-[11px] text-rose-700">
              Archived tags. Can be restored back to active inventory at any time.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Tag ID</th>
                  <th className="py-3.5 px-4">Product Type</th>
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDeleted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500 font-medium">
                      No deleted tags in registry.
                    </td>
                  </tr>
                ) : (
                  filteredDeleted.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-xs">
                          {item.tag_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-800">{item.product_type}</td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-700">
                        {item.business_id || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900">{item.business_name || "—"}</td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px]">
                        {new Date(item.deleted_at).toLocaleDateString()}
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
      {/* MODAL: CREATE SINGLE TAG WITH BUSINESS SEARCH                             */}
      {/* ========================================================================= */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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

              {/* Business Search & Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Assign to Business? <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                
                {/* Search Bar for Businesses */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Business ID or Name..."
                    value={singleBizSearch}
                    onChange={(e) => setSingleBizSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>

                <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-zinc-100">
                  <div
                    onClick={() => setSingleBusinessId("")}
                    className={`p-2.5 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                      !singleBusinessId ? "bg-zinc-900 text-white font-bold" : "hover:bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    <span>-- Keep in inventory (Not Assigned) --</span>
                    {!singleBusinessId && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>

                  {filteredClientsForSingle.length === 0 ? (
                    <div className="p-3 text-xs text-zinc-400 text-center">
                      No businesses found matching &ldquo;{singleBizSearch}&rdquo;
                    </div>
                  ) : (
                    filteredClientsForSingle.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSingleBusinessId(c.business_id)}
                        className={`p-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          singleBusinessId === c.business_id
                            ? "bg-zinc-900 text-white font-bold"
                            : "hover:bg-zinc-50 text-zinc-800"
                        }`}
                      >
                        <div>
                          <span className={`font-mono font-bold mr-2 ${singleBusinessId === c.business_id ? "text-orange-300" : "text-zinc-900"}`}>
                            [{c.business_id}]
                          </span>
                          <span>{c.business_name}</span>
                          <span className={`text-[10px] ml-2 ${singleBusinessId === c.business_id ? "text-zinc-300" : "text-zinc-400"}`}>
                            ({c.city})
                          </span>
                        </div>
                        {singleBusinessId === c.business_id && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    ))
                  )}
                </div>
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
      {/* MODAL: ASSIGN / REASSIGN BUSINESS ID WITH LIVE SEARCH                     */}
      {/* ========================================================================= */}
      {editTargetTag && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-zinc-900" />
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
                  Search &amp; Select Registered Business *
                </label>
                
                {/* Search Input */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Business ID, Name, City..."
                    value={assignBizSearch}
                    onChange={(e) => setAssignBizSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>

                {/* Filtered List */}
                <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-zinc-100">
                  {filteredClientsForAssign.length === 0 ? (
                    <div className="p-4 text-xs text-zinc-400 text-center">
                      No businesses found matching &ldquo;{assignBizSearch}&rdquo;
                    </div>
                  ) : (
                    filteredClientsForAssign.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setAssignBizId(c.business_id)}
                        className={`p-3 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                          assignBizId === c.business_id
                            ? "bg-zinc-900 text-white font-bold"
                            : "hover:bg-zinc-50 text-zinc-800"
                        }`}
                      >
                        <div>
                          <span className={`font-mono font-bold mr-2 ${assignBizId === c.business_id ? "text-orange-300" : "text-zinc-900"}`}>
                            [{c.business_id}]
                          </span>
                          <span>{c.business_name}</span>
                          <span className={`text-[11px] block mt-0.5 ${assignBizId === c.business_id ? "text-zinc-300" : "text-zinc-500"}`}>
                            Owner: {c.owner_name || "—"} • City: {c.city || "—"}
                          </span>
                        </div>
                        {assignBizId === c.business_id && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
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
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT WHOLE TAG ENTRY                                               */}
      {/* ========================================================================= */}
      {isEditWholeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Edit Tag Entry</h3>
                  <p className="text-[11px] text-zinc-500">Edit hardware tag, product type, or assignment</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditWholeOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditWholeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Tag ID</label>
                  <input
                    type="text"
                    disabled
                    value={editWholeTagId}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-mono font-bold text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Product Type</label>
                  <select
                    value={editWholeProductType}
                    onChange={(e) => setEditWholeProductType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  >
                    <option value="Counter Standee">Counter Standee</option>
                    <option value="Business NFC Card">Business NFC Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Assigned Business ID</label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by ID, name..."
                    value={editWholeSearch}
                    onChange={(e) => setEditWholeSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>

                <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto divide-y divide-zinc-100">
                  <div
                    onClick={() => {
                      setEditWholeBusinessId("");
                      setEditWholeBusinessName("");
                    }}
                    className={`p-2 text-xs cursor-pointer flex items-center justify-between ${
                      !editWholeBusinessId ? "bg-zinc-900 text-white font-bold" : "hover:bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    <span>Unassigned (Keep in inventory)</span>
                    {!editWholeBusinessId && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>

                  {filteredClientsForEdit.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setEditWholeBusinessId(c.business_id);
                        setEditWholeBusinessName(c.business_name);
                      }}
                      className={`p-2 text-xs cursor-pointer flex items-center justify-between ${
                        editWholeBusinessId === c.business_id
                          ? "bg-zinc-900 text-white font-bold"
                          : "hover:bg-zinc-50 text-zinc-800"
                      }`}
                    >
                      <div>
                        <span className={`font-mono font-bold mr-1.5 ${editWholeBusinessId === c.business_id ? "text-orange-300" : "text-zinc-900"}`}>
                          [{c.business_id}]
                        </span>
                        <span>{c.business_name}</span>
                      </div>
                      {editWholeBusinessId === c.business_id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Generated Link</label>
                <input
                  type="text"
                  value={editWholeLink}
                  onChange={(e) => setEditWholeLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Total Scans Count</label>
                <input
                  type="number"
                  min="0"
                  value={editWholeScans}
                  onChange={(e) => setEditWholeScans(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditWholeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
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
              <h3 className="font-bold text-lg text-zinc-900">Move Tag to Deleted Section?</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Are you sure you want to delete tag <strong className="text-zinc-900 font-bold">{deleteTarget.tag_id}</strong> ({deleteTarget.product_type})?
                This tag will be moved to the <strong>Deleted</strong> section and can be restored at any time.
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
              <h3 className="font-bold text-lg text-rose-950">Delete Tag Permanently</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                This action is <strong>irreversible</strong>. The hardware tag <strong>{permanentDeleteTarget.tag_id}</strong> will be permanently removed from the database.
              </p>
            </div>

            <div className="space-y-2 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
              <label className="block text-[11px] font-bold text-zinc-800">
                To confirm permanent deletion, please type:
                <span className="block mt-1 font-mono text-xs text-rose-900 bg-white px-2 py-1 rounded border border-rose-200 select-all">
                  {permanentDeleteTarget.tag_id}
                </span>
              </label>
              <input
                type="text"
                value={typedConfirmName}
                onChange={(e) => setTypedConfirmName(e.target.value)}
                placeholder="Type exact Tag ID here"
                className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono uppercase"
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
                  typedConfirmName.trim().toUpperCase() !== permanentDeleteTarget.tag_id.trim().toUpperCase()
                }
                className="tactile-btn px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR CODE PREVIEW & DOWNLOAD                                         */}
      {/* ========================================================================= */}
      {qrModalTag && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="text-left">
                <h3 className="font-bold text-base text-zinc-900">{qrModalTag.tag_id} Dynamic QR</h3>
                <p className="text-[11px] text-zinc-500">{qrModalTag.product_type}</p>
              </div>
              <button
                onClick={() => setQrModalTag(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR for ${qrModalTag.tag_id}`} className="w-56 h-56 rounded-lg shadow-xs" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-zinc-400">
                  Generating high-res QR...
                </div>
              )}
              <span className="font-mono text-xs font-bold text-zinc-700 mt-3">{qrModalTag.link}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadQr(qrModalTag, qrDataUrl)}
                className="tactile-btn flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => {
                  handleCopyNfcLink(qrModalTag);
                }}
                className="tactile-btn flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>NFC</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
