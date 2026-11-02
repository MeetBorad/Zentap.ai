"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Search,
  Plus,
  QrCode,
  Radio,
  ExternalLink,
  Edit,
  Edit2,
  Trash2,
  RotateCcw,
  Download,
  Copy,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Palette,
} from "lucide-react";
import QRCode from "qrcode";
import {
  GoogleReviewLinkItemRecord,
  DeletedGoogleReviewLinkRecord,
  ClientRecord,
  getAllGoogleReviewLinks,
  getAllDeletedGoogleReviewLinks,
  getAllClients,
  updateGoogleReviewLinkServer,
  softDeleteGoogleLinkServer,
  restoreGoogleLinkServer,
  permanentDeleteGoogleLinkServer,
  serverFetchPlatformData,
  addManualGoogleReviewLink,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";
import BusinessSearchSelect from "../BusinessSearchSelect";

interface GoogleLinksWebpageTabProps {
  onShowToast: (msg: string) => void;
  onNavigateToPageEditor?: (tagId?: string) => void;
}

export default function GoogleLinksWebpageTab({ onShowToast, onNavigateToPageEditor }: GoogleLinksWebpageTabProps) {
  const [links, setLinks] = useState<GoogleReviewLinkItemRecord[]>([]);
  const [deletedLinks, setDeletedLinks] = useState<DeletedGoogleReviewLinkRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "deleted">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Edit Page Linked to Tag ID Modal
  const [quickEditTarget, setQuickEditTarget] = useState<GoogleReviewLinkItemRecord | null>(null);
  const [quickGoogleUrl, setQuickGoogleUrl] = useState("");

  // Delete Target (Soft delete)
  const [deleteTarget, setDeleteTarget] = useState<GoogleReviewLinkItemRecord | null>(null);

  // Permanent Delete Target (Deleted tab only)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<DeletedGoogleReviewLinkRecord | null>(null);
  const [typedConfirmName, setTypedConfirmName] = useState("");

  // Add Manual Entry Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualBusinessId, setManualBusinessId] = useState("");
  const [manualTagId, setManualTagId] = useState("");
  const [manualGoogleUrl, setManualGoogleUrl] = useState("");
  const [manualDestination, setManualDestination] = useState<"not_assigned" | "direct_google" | "zentap_google">("not_assigned");

  // QR Modal
  const [qrModalItem, setQrModalItem] = useState<GoogleReviewLinkItemRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copiedTagId, setCopiedTagId] = useState<string | null>(null);

  useEffect(() => {
    // Preserve URL state on refresh (Requirement 4)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const st = params.get("status");
      if (st === "deleted") {
        setActiveTab("deleted");
      }
    }
    refreshData();
  }, []);

  const setTabAndUrl = (status: "all" | "deleted") => {
    setActiveTab(status);
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
    setLinks(getAllGoogleReviewLinks());
    setDeletedLinks(getAllDeletedGoogleReviewLinks());
    setClients(getAllClients());
    const res = await serverFetchPlatformData();
    if (res.success && res.data) {
      setLinks(res.data.googleLinks || []);
      setDeletedLinks(res.data.deletedGoogleLinks || []);
      setClients(res.data.clients || []);
    }
  };

  // Quick edit Page Linked to Tag ID (Option to enter any link here)
  const openQuickEdit = (item: GoogleReviewLinkItemRecord) => {
    setQuickEditTarget(item);
    setQuickGoogleUrl(item.business_google_review_link || "");
  };

  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditTarget) return;

    let cleanUrl = quickGoogleUrl.trim();
    if (cleanUrl && !cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    setIsSubmitting(true);
    const res = await updateGoogleReviewLinkServer(quickEditTarget.tag_id, {
      business_google_review_link: cleanUrl,
      business_id: quickEditTarget.business_id,
      business_name: quickEditTarget.business_name,
    });
    setIsSubmitting(false);

    if (res.success) {
      onShowToast(`✓ Updated Page Linked to Tag ID for ${quickEditTarget.business_name} (${quickEditTarget.tag_id})! Setup Status: Active.`);
      setQuickEditTarget(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to update page link in database");
    }
  };

  // Change destination directly from the table dropdown
  const handleDestinationChange = async (
    item: GoogleReviewLinkItemRecord,
    newDest: "not_assigned" | "direct_google" | "zentap_google"
  ) => {
    // Optimistic UI state update
    setLinks((prev) =>
      prev.map((l) => (l.tag_id === item.tag_id ? { ...l, destination: newDest } : l))
    );

    const res = await updateGoogleReviewLinkServer(item.tag_id, {
      destination: newDest,
      business_id: item.business_id,
      business_name: item.business_name,
      business_google_review_link: item.business_google_review_link,
    });

    if (res.success) {
      const destLabel =
        newDest === "direct_google"
          ? "Direct Google Review"
          : newDest === "zentap_google"
          ? "ZenTap Google Review"
          : "Not Assigned";
      onShowToast(`✓ Destination for ${item.tag_id} updated to "${destLabel}"`);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to update destination in database");
      await refreshData();
    }
  };

  // Soft delete (moves to Deleted tab)
  const handleConfirmSoftDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const res = await softDeleteGoogleLinkServer(deleteTarget.tag_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Entry ${deleteTarget.tag_id} moved to Deleted section`);
      setDeleteTarget(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to delete entry");
    }
  };

  // Restore
  const handleRestore = async (item: DeletedGoogleReviewLinkRecord) => {
    setIsSubmitting(true);
    const res = await restoreGoogleLinkServer(item.tag_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Restored Google Review settings for ${item.tag_id}!`);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to restore entry");
    }
  };

  // Permanent Delete (Deleted tab only with typed Tag ID confirmation)
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    if (typedConfirmName.trim().toUpperCase() !== permanentDeleteTarget.tag_id.trim().toUpperCase()) {
      onShowToast(`Typed Tag ID does not match "${permanentDeleteTarget.tag_id}".`);
      return;
    }
    setIsSubmitting(true);
    const res = await permanentDeleteGoogleLinkServer(permanentDeleteTarget.tag_id, typedConfirmName.trim());
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Permanently deleted ${permanentDeleteTarget.tag_id} from database`);
      setPermanentDeleteTarget(null);
      setTypedConfirmName("");
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to permanently delete entry");
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBiz = clients.find((c) => c.business_id === manualBusinessId);
    if (!targetBiz) {
      onShowToast("Please select a registered client");
      return;
    }
    const cleanTagId = manualTagId.trim().toUpperCase() || `ST${links.length + 1}`;

    const created = addManualGoogleReviewLink({
      tag_id: cleanTagId,
      business_id: targetBiz.business_id,
      business_name: targetBiz.business_name,
      link_of_tag_id: `${DOMAIN_BASE}/t/${cleanTagId}`,
      business_google_review_link: manualGoogleUrl.trim(),
      destination: manualDestination,
      setup_status: manualDestination !== "not_assigned" ? "completed" : "pending",
      total_scans: 0,
    });

    onShowToast(`✓ Manually added Google setting for ${created.business_name} (${created.tag_id})!`);
    setIsManualModalOpen(false);
    setManualTagId("");
    setManualGoogleUrl("");
    setManualDestination("not_assigned");
    refreshData();
  };

  const handleOpenQr = async (item: GoogleReviewLinkItemRecord) => {
    setQrModalItem(item);
    try {
      const url = await QRCode.toDataURL(item.link_of_tag_id, {
        width: 320,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch (e) {
      console.warn("QR gen error", e);
    }
  };

  const handleCopyNfc = (item: GoogleReviewLinkItemRecord) => {
    const nfcUrl = `${item.link_of_tag_id}?s=nfc`;
    navigator.clipboard.writeText(nfcUrl);
    setCopiedTagId(item.tag_id);
    onShowToast(`✓ Copied NFC Link: ${nfcUrl}`);
    setTimeout(() => setCopiedTagId(null), 2500);
  };

  const handleDownloadQr = (item: GoogleReviewLinkItemRecord) => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `google-review-qr-${item.tag_id.toLowerCase()}.png`;
    a.click();
    onShowToast(`✓ Downloaded QR Code for ${item.tag_id}`);
  };

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filteredLinks = links.filter((item) => {
    if (!q) return true;
    return (
      (item.business_id && item.business_id.toLowerCase().includes(q)) ||
      (item.business_name && item.business_name.toLowerCase().includes(q)) ||
      (item.tag_id && item.tag_id.toLowerCase().includes(q)) ||
      (item.destination && item.destination.toLowerCase().includes(q)) ||
      (item.business_google_review_link && item.business_google_review_link.toLowerCase().includes(q))
    );
  });

  const filteredDeleted = deletedLinks.filter((item) => {
    if (!q) return true;
    return (
      (item.business_id && item.business_id.toLowerCase().includes(q)) ||
      (item.business_name && item.business_name.toLowerCase().includes(q)) ||
      (item.tag_id && item.tag_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                Google Links &amp; QR Sharing
              </h1>
              <p className="text-xs text-zinc-500">
                Exclusive backend routing hub for Counter Standees. Configure Google Review destinations and monitor scan traffic.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (clients.length > 0 && !manualBusinessId) {
                  setManualBusinessId(clients[0].business_id);
                }
                setIsManualModalOpen(true);
              }}
              className="tactile-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Manually</span>
            </button>
          </div>
        </div>

        {/* Informational Destination Banner */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 space-y-1">
            <p className="font-bold">Destination Logic &amp; Color Coding:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>
                <span className="font-bold text-rose-700">Not Assigned (Red):</span> Requires adding the business&apos;s Google Review Page Link. Setup status stays <strong>Pending</strong>.
              </li>
              <li>
                <span className="font-bold text-orange-700">Direct Google Review (Orange):</span> Standee QR/NFC directly redirects to the business&apos;s Google Review posting page.
              </li>
              <li>
                <span className="font-bold text-emerald-800">ZenTap Google Review (Green):</span> Redirects to the customized ZenTap Google Review Assistant with AI drafting.
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Filter Pills & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
            <button
              onClick={() => setTabAndUrl("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All Standees ({links.length})
            </button>
            <button
              onClick={() => setTabAndUrl("deleted")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "deleted" ? "bg-white text-rose-700 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Deleted ({deletedLinks.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Business ID, Name, Tag ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* ACTIVE GOOGLE LINKS TABLE */}
      {activeTab === "all" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Tag ID</th>
                  <th className="py-3.5 px-4">Link of Tag ID</th>
                  <th className="py-3.5 px-4">Page Linked to Tag ID</th>
                  <th className="py-3.5 px-4 text-center">QR Code</th>
                  <th className="py-3.5 px-4 text-center">NFC Link</th>
                  <th className="py-3.5 px-4">Setup Status</th>
                  <th className="py-3.5 px-4 text-center">Scans</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-zinc-500 font-medium">
                      No Standee entries found. Standees assigned in QR/NFC Generator automatically populate here.
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((item) => {
                    // Setup status is worked out, not stored:
                    // Default status is Pending (red). Once Page Linked to Tag ID is entered, status automatically changes to Active (green).
                    const link = (item.business_google_review_link || "").trim();
                    const isActive = link.length > 5 && (link.startsWith("http://") || link.startsWith("https://"));

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                        {/* Business ID */}
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[11px]">
                            {item.business_id}
                          </span>
                        </td>

                        {/* Business Name */}
                        <td className="py-3 px-4 whitespace-nowrap font-bold text-zinc-900">
                          {item.business_name}
                        </td>

                        {/* Tag ID */}
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-xs tracking-wider">
                            {item.tag_id}
                          </span>
                        </td>

                        {/* Link of Tag ID */}
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                          <a
                            href={item.link_of_tag_id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            <span>{item.link_of_tag_id}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </td>

                        {/* Column: Page Linked to Tag ID (Option to enter any link here) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.business_google_review_link ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={
                                  item.business_google_review_link.startsWith("http://") || item.business_google_review_link.startsWith("https://")
                                    ? item.business_google_review_link
                                    : `https://${item.business_google_review_link}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[11px] text-blue-600 hover:underline max-w-[150px] truncate block"
                                title={item.business_google_review_link}
                              >
                                {item.business_google_review_link}
                              </a>
                              <button
                                onClick={() => openQuickEdit(item)}
                                title="Edit Link"
                                className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openQuickEdit(item)}
                              className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all cursor-pointer shadow-2xs active:scale-[0.978]"
                            >
                              <Plus className="w-3 h-3 text-amber-700" />
                              <span>Enter Link</span>
                            </button>
                          )}
                        </td>

                        {/* Download QR */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenQr(item)}
                            className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-all cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-zinc-700" />
                            <span>QR</span>
                          </button>
                        </td>

                        {/* NFC Link Copy */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleCopyNfc(item)}
                            className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                          >
                            {copiedTagId === item.tag_id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Radio className="w-3.5 h-3.5 text-zinc-300" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Setup Status: Default Pending (Red), Active (Green) once link is entered */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        {/* Total Scans/Taps */}
                        <td className="py-3 px-4 text-center font-bold text-zinc-900 whitespace-nowrap">
                          {item.total_scans || 0}
                        </td>

                        {/* Destination of QR/NFC - Editable via Dropdown directly from table */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            value={item.destination || "not_assigned"}
                            onChange={(e) =>
                              handleDestinationChange(
                                item,
                                e.target.value as "not_assigned" | "direct_google" | "zentap_google"
                              )
                            }
                            className={`tactile-btn text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 ${
                              item.destination === "zentap_google"
                                ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-500"
                                : item.destination === "direct_google"
                                ? "bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100 focus:ring-orange-500"
                                : "bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100 focus:ring-rose-500"
                            }`}
                          >
                            <option value="not_assigned" className="bg-white text-rose-800 font-medium">
                              Not Assigned (Red)
                            </option>
                            <option value="direct_google" className="bg-white text-orange-800 font-medium">
                              Direct Google Review (Orange)
                            </option>
                            <option value="zentap_google" className="bg-white text-emerald-800 font-medium">
                              ZenTap Google Review (Green)
                            </option>
                          </select>
                        </td>

                        {/* Actions: Design Review Page, Edit Page Linked to Tag ID & Delete */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {onNavigateToPageEditor && (
                              <button
                                onClick={() => onNavigateToPageEditor(item.tag_id)}
                                title="Design Review Page (Page Editor)"
                                className="tactile-btn p-1.5 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all cursor-pointer"
                              >
                                <Palette className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openQuickEdit(item)}
                              title="Edit Page Linked to Tag ID"
                              className="tactile-btn p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              title="Delete Entry"
                              className="tactile-btn p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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
      )}

      {/* DELETED GOOGLE LINKS TABLE */}
      {activeTab === "deleted" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold">Deleted Google Review Standees Registry</span>
            </div>
            <span className="text-[11px] text-rose-700">
              Archived Standee configurations. Can be restored back to active table at any time.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Tag ID</th>
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Page Linked to Tag ID</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDeleted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500 font-medium">
                      No deleted Standee records.
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
                      <td className="py-3 px-4 font-mono font-bold text-zinc-700">
                        {item.business_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900">{item.business_name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 truncate max-w-xs">
                        {item.business_google_review_link || "—"}
                      </td>
                      <td className="py-3 px-4 text-zinc-700">{item.destination}</td>
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
      {/* MODAL: QUICK EDIT GOOGLE REVIEW LINK                                      */}
      {/* ========================================================================= */}
      {quickEditTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  Edit Page Linked to Tag ID
                </h3>
                <p className="text-[11px] text-zinc-500">{quickEditTarget.business_name} ({quickEditTarget.tag_id})</p>
              </div>
              <button
                onClick={() => setQuickEditTarget(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Page Linked to Tag ID <span className="text-zinc-400 font-normal">(Option to enter any link here)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://search.google.com/local/writereview?placeid=... or any web address"
                  value={quickGoogleUrl}
                  onChange={(e) => setQuickGoogleUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                  Enter any valid URL or Google Review link. Once entered, setup status automatically changes to <strong className="text-emerald-700 font-bold">Active</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setQuickEditTarget(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="tactile-btn px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
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
              <h3 className="font-bold text-lg text-zinc-900">Move Standee to Deleted Section?</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-900 font-bold">{deleteTarget.business_name}</strong> ({deleteTarget.tag_id})?
                This entry will be moved to the <strong>Deleted</strong> section and can be restored at any time.
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
              <h3 className="font-bold text-lg text-rose-950">Delete Standee Entry Permanently</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                This action is <strong>irreversible</strong>. Standee routing for <strong>{permanentDeleteTarget.business_name}</strong> ({permanentDeleteTarget.tag_id}) will be permanently removed from the database.
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
      {/* MODAL: ADD MANUAL ENTRY                                                   */}
      {/* ========================================================================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Add Standee Manually</h3>
                  <p className="text-[11px] text-zinc-500">Attach a Standee tag to a registered business</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="space-y-4">
              <BusinessSearchSelect
                clients={clients}
                selectedBusinessId={manualBusinessId}
                onSelect={(biz) => setManualBusinessId(biz ? biz.business_id : "")}
                label="Select Registered Business"
                required
                placeholder="Search by ID or Name as you type..."
              />

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Tag ID <span className="text-zinc-400 font-normal">(e.g. ST1, ST42 - auto-generated if blank)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ST1"
                  value={manualTagId}
                  onChange={(e) => setManualTagId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Page Linked to Tag ID <span className="text-zinc-400 font-normal">(Option to enter any link here)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://... (Enter any web URL or review link)"
                  value={manualGoogleUrl}
                  onChange={(e) => setManualGoogleUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Initial Destination</label>
                <select
                  value={manualDestination}
                  onChange={(e) => setManualDestination(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="not_assigned">Not Assigned (Red - Setup Pending)</option>
                  <option value="direct_google">Direct Google Review (Orange)</option>
                  <option value="zentap_google">ZenTap Google Review (Green)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Add Standee Setting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR CODE PREVIEW & DOWNLOAD                                         */}
      {/* ========================================================================= */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="text-left">
                <h3 className="font-bold text-base text-zinc-900">{qrModalItem.tag_id} Standee QR</h3>
                <p className="text-[11px] text-zinc-500">{qrModalItem.business_name}</p>
              </div>
              <button
                onClick={() => setQrModalItem(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR for ${qrModalItem.tag_id}`} className="w-56 h-56 rounded-lg shadow-xs" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-zinc-400">
                  Generating high-res QR...
                </div>
              )}
              <span className="font-mono text-xs font-bold text-zinc-700 mt-3">{qrModalItem.link_of_tag_id}</span>
            </div>

            <button
              onClick={() => handleDownloadQr(qrModalItem)}
              className="tactile-btn w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Standee QR PNG</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
