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
  Download,
  Copy,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import QRCode from "qrcode";
import {
  GoogleReviewLinkItemRecord,
  ClientRecord,
  getAllGoogleReviewLinks,
  getAllClients,
  updateGoogleReviewLink,
  addManualGoogleReviewLink,
  DOMAIN_BASE,
} from "@/lib/adminPlatformStore";

interface GoogleLinksWebpageTabProps {
  onShowToast: (msg: string) => void;
}

export default function GoogleLinksWebpageTab({ onShowToast }: GoogleLinksWebpageTabProps) {
  const [links, setLinks] = useState<GoogleReviewLinkItemRecord[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Link Modal
  const [editTarget, setEditTarget] = useState<GoogleReviewLinkItemRecord | null>(null);
  const [editGoogleUrl, setEditGoogleUrl] = useState("");
  const [editDestination, setEditDestination] = useState<"not_assigned" | "direct_google" | "zentap_google">("not_assigned");

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
    refreshData();
  }, []);

  const refreshData = () => {
    setLinks(getAllGoogleReviewLinks());
    setClients(getAllClients());
  };

  const handleOpenEdit = (item: GoogleReviewLinkItemRecord) => {
    setEditTarget(item);
    setEditGoogleUrl(item.business_google_review_link || "");
    setEditDestination(item.destination);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    const updated = updateGoogleReviewLink(editTarget.tag_id, {
      business_google_review_link: editGoogleUrl.trim(),
      destination: editDestination,
    });

    if (updated) {
      onShowToast(`✓ Updated Google settings for ${updated.business_name} (${updated.tag_id})!`);
      setEditTarget(null);
      refreshData();
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

    onShowToast(`✓ Added Google Review setup for ${created.business_name} (${created.tag_id})!`);
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
      console.warn("QR generation error", e);
    }
  };

  const handleDownloadQr = (item: GoogleReviewLinkItemRecord, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `google-review-qr-${item.tag_id.toLowerCase()}.png`;
    a.click();
    onShowToast(`✓ Downloaded QR code for ${item.tag_id}`);
  };

  const handleCopyNfc = (item: GoogleReviewLinkItemRecord) => {
    const nfcUrl = `${item.link_of_tag_id}?s=nfc`;
    navigator.clipboard.writeText(nfcUrl);
    setCopiedTagId(item.tag_id);
    onShowToast(`✓ Copied NFC writing link: ${nfcUrl}`);
    setTimeout(() => setCopiedTagId(null), 2500);
  };

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filteredLinks = links.filter((l) => {
    if (!q) return true;
    return (
      (l.business_id && l.business_id.toLowerCase().includes(q)) ||
      (l.business_name && l.business_name.toLowerCase().includes(q)) ||
      (l.tag_id && l.tag_id.toLowerCase().includes(q)) ||
      (l.destination && l.destination.toLowerCase().includes(q)) ||
      (l.setup_status && l.setup_status.toLowerCase().includes(q))
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
                Core backend routing for Counter Standees. Configure Direct Google Reviews vs ZenTap Pages.
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
              className="tactile-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Add Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="mt-5 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold text-zinc-900">Destination Routing Logic:</span>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-600 text-[11px]">
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

        {/* Search Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-100">
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

      {/* GOOGLE LINKS TABLE */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Business ID</th>
                <th className="py-3.5 px-4">Business Name</th>
                <th className="py-3.5 px-4">Tag ID</th>
                <th className="py-3.5 px-4">Link of Tag ID</th>
                <th className="py-3.5 px-4 text-center">QR Code</th>
                <th className="py-3.5 px-4 text-center">NFC Link</th>
                <th className="py-3.5 px-4">Setup Status</th>
                <th className="py-3.5 px-4 text-center">Scans/Taps</th>
                <th className="py-3.5 px-4">Destination of QR/NFC</th>
                <th className="py-3.5 px-4 text-right">Edit Google Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-500 font-medium">
                    No Standee entries found. Standees assigned in QR/NFC Generator automatically populate here.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((item) => {
                  const isCompleted = item.setup_status === "completed" || item.destination !== "not_assigned";

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

                      {/* Setup Status: Completed in Green, Pending in Red */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completed</span>
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

                      {/* Destination of QR/NFC */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.destination === "direct_google" && (
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-300">
                            Direct Google Review
                          </span>
                        )}
                        {item.destination === "zentap_google" && (
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            ZenTap Google Review
                          </span>
                        )}
                        {item.destination === "not_assigned" && (
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            Not Assigned
                          </span>
                        )}
                        {item.business_google_review_link && (
                          <span className="block text-[10px] text-zinc-500 font-mono truncate max-w-[150px] mt-0.5">
                            {item.business_google_review_link}
                          </span>
                        )}
                      </td>

                      {/* Edit Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="tactile-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 transition-all cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Edit</span>
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
      {/* MODAL: EDIT GOOGLE REVIEW PAGE LINK & DESTINATION                         */}
      {/* ========================================================================= */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">
                    Edit Destination: {editTarget.tag_id}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {editTarget.business_name} ({editTarget.business_id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Destination Dropdown */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Destination of QR / NFC *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                    <input
                      type="radio"
                      name="destination"
                      value="direct_google"
                      checked={editDestination === "direct_google"}
                      onChange={() => setEditDestination("direct_google")}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-orange-900">
                        Direct Google Review (Orange)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Instantly redirects phone to your official Google Review posting page.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                    <input
                      type="radio"
                      name="destination"
                      value="zentap_google"
                      checked={editDestination === "zentap_google"}
                      onChange={() => setEditDestination("zentap_google")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-emerald-900">
                        ZenTap Google Review (Green)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Redirects to interactive ZenTap Review Assistant with AI review drafting.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                    <input
                      type="radio"
                      name="destination"
                      value="not_assigned"
                      checked={editDestination === "not_assigned"}
                      onChange={() => setEditDestination("not_assigned")}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-rose-900">
                        Not Assigned (Red)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Setup is pending. QR/NFC remains temporarily unconfigured.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Business Google Review Page Link */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Business Google Review Page Link
                </label>
                <input
                  type="url"
                  placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=..."
                  value={editGoogleUrl}
                  onChange={(e) => setEditGoogleUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Obtained from Google Business Profile &gt; Ask for Reviews &gt; Review Link.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
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
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-zinc-900" />
                <h3 className="font-bold text-lg text-zinc-900">Add Manual Google Standee Link</h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Select Registered Client *
                </label>
                <select
                  value={manualBusinessId}
                  onChange={(e) => setManualBusinessId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.business_id}>
                      [{c.business_id}] {c.business_name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Tag ID (e.g. ST1, ST2...)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ST4"
                  value={manualTagId}
                  onChange={(e) => setManualTagId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Business Google Review Page Link
                </label>
                <input
                  type="url"
                  placeholder="https://g.page/r/.../review"
                  value={manualGoogleUrl}
                  onChange={(e) => setManualGoogleUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Destination of QR / NFC *
                </label>
                <select
                  value={manualDestination}
                  onChange={(e) => setManualDestination(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="not_assigned">Not Assigned (Red - Default)</option>
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
                  className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR PREVIEW                                                         */}
      {/* ========================================================================= */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-zinc-900 text-white">
                {qrModalItem.tag_id}
              </span>
              <button
                onClick={() => setQrModalItem(null)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-zinc-900 text-sm">{qrModalItem.business_name}</h4>
              <p className="text-[11px] text-zinc-500 font-mono truncate">{qrModalItem.link_of_tag_id}</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 inline-block">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${qrModalItem.tag_id}`}
                  className="w-48 h-48 mx-auto rounded-lg shadow-2xs"
                />
              )}
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => handleDownloadQr(qrModalItem, qrDataUrl)}
                className="tactile-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => handleCopyNfc(qrModalItem)}
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
