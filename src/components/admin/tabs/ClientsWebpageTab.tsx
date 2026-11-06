"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  ExternalLink,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  ShieldAlert,
  X,
  CheckCircle2,
  Edit2,
  Sliders,
  Settings,
  Tag,
  Star,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  ClientRecord,
  DeletedBusinessRecord,
  CustomFieldDefinition,
  QrNfcTagItemRecord,
  getAllClients,
  getAllDeletedBusinesses,
  getAllQrNfcTags,
  getCustomFieldDefinitions,
  addCustomFieldDefinition,
  addClientServer,
  updateClientServer,
  generateNextBusinessIdCode,
  softDeleteClientServer,
  restoreClientServer,
  permanentDeleteClientServer,
  serverFetchPlatformData,
} from "@/lib/adminPlatformStore";

interface ClientsWebpageTabProps {
  onShowToast: (msg: string) => void;
  onNavigateToSettings?: () => void;
}

export default function ClientsWebpageTab({ onShowToast, onNavigateToSettings }: ClientsWebpageTabProps) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [deletedBusinesses, setDeletedBusinesses] = useState<DeletedBusinessRecord[]>([]);
  const [tags, setTags] = useState<QrNfcTagItemRecord[]>([]);
  const [viewFilter, setViewFilter] = useState<"all" | "deleted">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Fields from Settings
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDefinition[]>([]);
  const [showAddCustomFieldInline, setShowAddCustomFieldInline] = useState(false);
  const [inlineFieldLabel, setInlineFieldLabel] = useState("");
  const [inlineFieldType, setInlineFieldType] = useState<"text" | "url" | "tel" | "email" | "number">("text");

  // Add Business Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newGoogleReviewLink, setNewGoogleReviewLink] = useState("");
  const [newInstagram, setNewInstagram] = useState("");
  const [newFacebook, setNewFacebook] = useState("");
  const [newCity, setNewCity] = useState("Ahmedabad");
  const [newCustomFields, setNewCustomFields] = useState<Record<string, string>>({});

  // Edit Business Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ClientRecord | null>(null);
  const [editBusinessId, setEditBusinessId] = useState("");
  const [editBizName, setEditBizName] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editOwnerPhone, setEditOwnerPhone] = useState("");
  const [editOwnerEmail, setEditOwnerEmail] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editGoogleReviewLink, setEditGoogleReviewLink] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editCity, setEditCity] = useState("Ahmedabad");
  const [editCustomFields, setEditCustomFields] = useState<Record<string, string>>({});

  // Soft delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ClientRecord | null>(null);

  // Permanent delete confirmation (Deleted tab only)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<DeletedBusinessRecord | null>(null);
  const [typedConfirmName, setTypedConfirmName] = useState("");

  useEffect(() => {
    // Preserve URL state on refresh (Requirement 4)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const st = params.get("status");
      if (st === "deleted") {
        setViewFilter("deleted");
      }
    }
    refreshData();

    // Load custom fields definitions
    const loadFields = () => {
      setCustomFieldDefs(getCustomFieldDefinitions());
    };
    loadFields();

    window.addEventListener("zentap_custom_fields_updated", loadFields);
    window.addEventListener("zentap_platform_updated", refreshData);
    return () => {
      window.removeEventListener("zentap_custom_fields_updated", loadFields);
      window.removeEventListener("zentap_platform_updated", refreshData);
    };
  }, []);

  const setFilterAndUrl = (status: "all" | "deleted") => {
    setViewFilter(status);
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
    setClients(getAllClients());
    setDeletedBusinesses(getAllDeletedBusinesses());
    setTags(getAllQrNfcTags());
    const res = await serverFetchPlatformData();
    if (res.success && res.data) {
      setClients(res.data.clients || []);
      setDeletedBusinesses(res.data.deletedBusinesses || []);
      if (res.data.tags) {
        setTags(res.data.tags || []);
      }
    }
  };

  const nextIdPreview = generateNextBusinessIdCode(clients);

  const activeCustomFields = customFieldDefs.filter((f) => f.is_active);

  const handleSaveInlineField = () => {
    if (!inlineFieldLabel.trim()) {
      onShowToast("Please enter a field label");
      return;
    }
    const updated = addCustomFieldDefinition({
      label: inlineFieldLabel.trim(),
      type: inlineFieldType,
      is_active: true,
    });
    setCustomFieldDefs(updated);
    const added = updated.find((f) => f.label.toLowerCase() === inlineFieldLabel.trim().toLowerCase());
    const fieldId = added?.id || inlineFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    
    // Automatically focus or initialize this field for active modal
    if (isAddModalOpen) {
      setNewCustomFields((prev) => ({ ...prev, [fieldId]: "" }));
    }
    if (isEditModalOpen) {
      setEditCustomFields((prev) => ({ ...prev, [fieldId]: "" }));
    }

    setInlineFieldLabel("");
    setShowAddCustomFieldInline(false);
    onShowToast(`✓ Added custom field "${inlineFieldLabel.trim()}" to forms!`);
  };

  const openEditModal = (client: ClientRecord) => {
    setEditTarget(client);
    setEditBusinessId(client.business_id);
    setEditBizName(client.business_name || "");
    setEditOwnerName(client.owner_name || "");
    setEditOwnerPhone(client.owner_phone || "");
    setEditOwnerEmail(client.owner_email || "");
    setEditWhatsapp(client.whatsapp || "");
    setEditGoogleReviewLink(client.google_review_link || "");
    setEditInstagram(client.instagram_link || "");
    setEditFacebook(client.facebook_link || "");
    setEditCity(client.city || "Ahmedabad");
    setEditCustomFields(client.custom_fields || {});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editBizName.trim()) {
      onShowToast("Please enter a business name");
      return;
    }

    setIsSubmitting(true);
    const res = await updateClientServer(editTarget.business_id, {
      id: editTarget.id,
      business_id: editBusinessId.trim() || editTarget.business_id,
      business_name: editBizName.trim(),
      owner_name: editOwnerName.trim() || undefined,
      owner_phone: editOwnerPhone.trim() || undefined,
      owner_email: editOwnerEmail.trim() || undefined,
      whatsapp: editWhatsapp.trim() || undefined,
      google_review_link: editGoogleReviewLink.trim() || undefined,
      instagram_link: editInstagram.trim() || undefined,
      facebook_link: editFacebook.trim() || undefined,
      city: editCity.trim() || "India",
      custom_fields: editCustomFields,
    });
    setIsSubmitting(false);

    if (res.success) {
      onShowToast(`✓ Updated "${editBizName.trim()}" (${editTarget.business_id}) successfully!`);
      setIsEditModalOpen(false);
      setEditTarget(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to update business in database");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) {
      onShowToast("Please enter a business name");
      return;
    }

    setIsSubmitting(true);
    const res = await addClientServer({
      business_name: newBizName.trim(),
      owner_name: newOwnerName.trim() || undefined,
      owner_phone: newOwnerPhone.trim() || undefined,
      owner_email: newOwnerEmail.trim() || undefined,
      whatsapp: newWhatsapp.trim() || newOwnerPhone.trim() || undefined,
      google_review_link: newGoogleReviewLink.trim() || undefined,
      instagram_link: newInstagram.trim() || undefined,
      facebook_link: newFacebook.trim() || undefined,
      city: newCity.trim() || "India",
      custom_fields: newCustomFields,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      onShowToast(`✓ Registered "${res.data.business_name}" with ID ${res.data.business_id}!`);
      setIsAddModalOpen(false);
      // Reset form
      setNewBizName("");
      setNewOwnerName("");
      setNewOwnerPhone("");
      setNewOwnerEmail("");
      setNewWhatsapp("");
      setNewGoogleReviewLink("");
      setNewInstagram("");
      setNewFacebook("");
      setNewCity("Ahmedabad");
      setNewCustomFields({});
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to register business in database");
    }
  };

  // Soft delete client (Requirement 2, 3, 7)
  const handleConfirmSoftDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const res = await softDeleteClientServer(deleteTarget.business_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ "${deleteTarget.business_name}" (${deleteTarget.business_id}) moved to Deleted section.`);
      setDeleteTarget(null);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to delete client");
    }
  };

  // Restore deleted client with clash warning (Requirement 3, 5)
  const handleRestore = async (item: DeletedBusinessRecord) => {
    setIsSubmitting(true);
    const res = await restoreClientServer(item.business_id);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Restored "${item.business_name}" (${item.business_id}) back to active clients!`);
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to restore client");
    }
  };

  // Permanent delete (Requirement 6: Deleted tab only with typed confirmation)
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    if (typedConfirmName.trim().toLowerCase() !== permanentDeleteTarget.business_name.trim().toLowerCase()) {
      onShowToast("Confirmation name does not match.");
      return;
    }
    setIsSubmitting(true);
    const res = await permanentDeleteClientServer(permanentDeleteTarget.business_id, typedConfirmName.trim());
    setIsSubmitting(false);
    if (res.success) {
      onShowToast(`✓ Permanently deleted "${permanentDeleteTarget.business_name}" from database.`);
      setPermanentDeleteTarget(null);
      setTypedConfirmName("");
      await refreshData();
    } else {
      onShowToast(res.error || "Failed to permanently delete client");
    }
  };

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const filteredClients = clients.filter((c) => {
    if (!q) return true;
    return (
      (c.business_id && c.business_id.toLowerCase().includes(q)) ||
      (c.business_name && c.business_name.toLowerCase().includes(q)) ||
      (c.owner_phone && c.owner_phone.toLowerCase().includes(q)) ||
      (c.owner_email && c.owner_email.toLowerCase().includes(q)) ||
      (c.whatsapp && c.whatsapp.toLowerCase().includes(q))
    );
  });

  const filteredDeleted = deletedBusinesses.filter((d) => {
    if (!q) return true;
    return (
      (d.business_id && d.business_id.toLowerCase().includes(q)) ||
      (d.business_name && d.business_name.toLowerCase().includes(q)) ||
      (d.owner_phone && d.owner_phone.toLowerCase().includes(q)) ||
      (d.owner_email && d.owner_email.toLowerCase().includes(q)) ||
      (d.whatsapp && d.whatsapp.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Clients Directory</h1>
                <p className="text-xs text-zinc-500">
                  Manage registered businesses, owner contact points, and social profiles
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="tactile-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-transform active:scale-[0.978] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add New Business</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-zinc-100">
          {/* Two options only: All or Deleted */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/60 w-fit">
            <button
              onClick={() => setFilterAndUrl("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewFilter === "all"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All Clients ({clients.length})
            </button>
            <button
              onClick={() => setFilterAndUrl("deleted")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewFilter === "deleted"
                  ? "bg-rose-50 text-rose-700 shadow-xs border border-rose-200/60"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Deleted ({deletedBusinesses.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, name, phone, email, whatsapp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* VIEW: ALL CLIENTS TABLE */}
      {viewFilter === "all" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold tracking-wider uppercase text-[10px]">
                  <th className="py-3.5 px-4 whitespace-nowrap">Business ID</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Business Name</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">City / Location</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Owner Name</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Owner Phone</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Owner Email</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">WhatsApp</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Google Review Link</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Instagram Link</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Facebook Link</th>
                  {/* Dynamic Custom Field Columns configured from Settings */}
                  {activeCustomFields.map((f) => (
                    <th key={f.id} className="py-3.5 px-4 whitespace-nowrap text-blue-900 bg-blue-50/60 border-l border-r border-blue-100">
                      {f.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 whitespace-nowrap">Hardware / Tags</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Registered Date</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-zinc-50 shadow-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={13 + activeCustomFields.length} className="py-12 text-center text-zinc-500 font-medium">
                      No clients found matching &ldquo;{searchQuery}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* 1. Business ID */}
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[11px] font-bold">
                          {client.business_id}
                        </span>
                      </td>

                      {/* 2. Business Name */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-zinc-900">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{client.business_name}</span>
                        </div>
                      </td>

                      {/* 3. City / Location */}
                      <td className="py-3 px-4 text-zinc-800 whitespace-nowrap font-medium">
                        {client.city ? (
                          <span className="inline-flex items-center gap-1 text-zinc-700 bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 rounded text-[11px]">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            <span>{client.city}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* 4. Owner Name */}
                      <td className="py-3 px-4 text-zinc-800 whitespace-nowrap font-medium">
                        {client.owner_name || <span className="text-zinc-400">—</span>}
                      </td>

                      {/* 5. Owner Phone */}
                      <td className="py-3 px-4 text-zinc-800 whitespace-nowrap">
                        {client.owner_phone ? (
                          <a
                            href={`tel:${client.owner_phone}`}
                            className="flex items-center gap-1.5 text-zinc-800 hover:text-black font-medium"
                          >
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{client.owner_phone}</span>
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* 6. Owner Email */}
                      <td className="py-3 px-4 text-zinc-800 whitespace-nowrap">
                        {client.owner_email ? (
                          <a
                            href={`mailto:${client.owner_email}`}
                            className="flex items-center gap-1.5 text-zinc-800 hover:text-black font-medium"
                          >
                            <Mail className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{client.owner_email}</span>
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* 7. WhatsApp */}
                      <td className="py-3 px-4 text-zinc-800 whitespace-nowrap">
                        {client.whatsapp ? (
                          <a
                            href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold hover:bg-emerald-100"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>{client.whatsapp}</span>
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* 8. Google Review Link */}
                      <td className="py-3 px-4 text-zinc-800 whitespace-nowrap">
                        {client.google_review_link ? (
                          <a
                            href={client.google_review_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold hover:bg-amber-100"
                            title={client.google_review_link}
                          >
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>Review Link</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* 9. Instagram Link */}
                      <td className="py-3 px-4 text-zinc-800 whitespace-nowrap">
                        {client.instagram_link ? (
                          <a
                            href={client.instagram_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-pink-700 hover:text-pink-900 font-semibold"
                          >
                            <Instagram className="w-3.5 h-3.5 text-pink-600" />
                            <span className="truncate max-w-[120px]">Profile</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* 10. Facebook Link */}
                      <td className="py-3 px-4 text-zinc-800 whitespace-nowrap">
                        {client.facebook_link ? (
                          <a
                            href={client.facebook_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold"
                          >
                            <Facebook className="w-3.5 h-3.5 text-blue-600" />
                            <span className="truncate max-w-[120px]">Page</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* 11. Dynamic Custom Field Values */}
                      {activeCustomFields.map((field) => {
                        const val = client.custom_fields?.[field.id];
                        if (!val || !String(val).trim()) {
                          return (
                            <td key={field.id} className="py-3 px-4 whitespace-nowrap text-zinc-400 border-l border-r border-zinc-100/60">
                              —
                            </td>
                          );
                        }
                        const isLink = field.type === "url" || String(val).startsWith("http");
                        return (
                          <td key={field.id} className="py-3 px-4 whitespace-nowrap text-zinc-800 font-medium border-l border-r border-zinc-100/60">
                            {isLink ? (
                              <a
                                href={String(val)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold max-w-[160px] truncate"
                                title={String(val)}
                              >
                                <span className="truncate">{String(val).replace(/^https?:\/\//, "")}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                              </a>
                            ) : (
                              <span className="truncate max-w-[160px] inline-block" title={String(val)}>
                                {String(val)}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* 12. Hardware / Tags Assigned */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {(() => {
                          const bizTags = tags.filter((t) => t.business_id === client.business_id);
                          if (bizTags.length === 0) {
                            return <span className="text-zinc-400 text-[11px]">—</span>;
                          }
                          return (
                            <div className="flex flex-wrap items-center gap-1 max-w-[190px]">
                              {bizTags.map((t) => (
                                <a
                                  key={t.tag_id}
                                  href={t.link || `/t/${t.tag_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 font-mono text-[10px] font-bold"
                                  title={`${t.product_type} • ${t.destination || "Not Assigned"}`}
                                >
                                  <Tag className="w-2.5 h-2.5 text-zinc-500" />
                                  <span>{t.tag_id}</span>
                                </a>
                              ))}
                            </div>
                          );
                        })()}
                      </td>

                      {/* 13. Registered Date */}
                      <td className="py-3 px-4 text-zinc-600 whitespace-nowrap font-mono text-[11px]">
                        {client.created_at ? (
                          <span className="inline-flex items-center gap-1 text-zinc-600">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <span>
                              {new Date(client.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      {/* 14. Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-white/95 backdrop-blur-xs shadow-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(client)}
                            title="Edit Whole Entry"
                            className="tactile-btn p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(client)}
                            title="Delete Business Permanently"
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

      {/* VIEW: DELETED BUSINESSES AUDIT TABLE */}
      {viewFilter === "deleted" && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold">Permanently Deleted Businesses Registry</span>
            </div>
            <span className="text-[11px] text-rose-700">
              Archived from active fleet. Can be restored back to clients at any time.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Business ID</th>
                  <th className="py-3.5 px-4">Business Name</th>
                  <th className="py-3.5 px-4">Owner Contact</th>
                  <th className="py-3.5 px-4">WhatsApp</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredDeleted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500 font-medium">
                      No deleted businesses in registry.
                    </td>
                  </tr>
                ) : (
                  filteredDeleted.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-700">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 border text-[11px]">
                          {item.business_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900">{item.business_name}</td>
                      <td className="py-3 px-4 text-zinc-700">
                        <div>{item.owner_name || "—"}</div>
                        <div className="text-[11px] text-zinc-500">{item.owner_phone || item.owner_email || ""}</div>
                      </td>
                      <td className="py-3 px-4 text-zinc-700">{item.whatsapp || "—"}</td>
                      <td className="py-3 px-4 text-zinc-700">{item.city || "—"}</td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px]">
                        {new Date(item.deleted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px] max-w-xs truncate">
                        {item.notes || "Deleted by admin"}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(item)}
                            disabled={isSubmitting}
                            title="Restore back to active clients"
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
                            title="Delete Permanently (Irreversible)"
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
      {/* MODAL: ADD NEW BUSINESS                                                   */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Add New Business</h3>
                  <p className="text-[11px] text-zinc-500">Register business details and social contact channels</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto ID Badge */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">Auto-Assigned Unique Business ID:</span>
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-zinc-900 text-white">
                {nextIdPreview}
              </span>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Chai & Cafe"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Meet Borad"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Owner Phone / Contact</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98250 12345"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Owner Email</label>
                  <input
                    type="email"
                    placeholder="e.g. owner@gmail.com"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98250 12345"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Instagram Link</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={newInstagram}
                    onChange={(e) => setNewInstagram(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Facebook Link</label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={newFacebook}
                    onChange={(e) => setNewFacebook(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmedabad, Gujarat"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Google Review Link</label>
                  <input
                    type="url"
                    placeholder="https://search.google.com/... or g.page/r/..."
                    value={newGoogleReviewLink}
                    onChange={(e) => setNewGoogleReviewLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Custom Business Details & Extended Options */}
              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-xs font-bold text-zinc-900">Custom Business Details</span>
                    {activeCustomFields.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        {activeCustomFields.length} active
                      </span>
                    )}
                  </div>
                  
                  {onNavigateToSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        onNavigateToSettings();
                      }}
                      className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
                      title="Manage custom fields in Settings tab"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Manage Fields in Settings</span>
                    </button>
                  )}
                </div>

                {/* Active Custom Fields Inputs */}
                {activeCustomFields.length === 0 && (
                  <div className="p-3 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>No custom fields configured yet. Add them in Settings tab.</span>
                    {onNavigateToSettings && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddModalOpen(false);
                          onNavigateToSettings();
                        }}
                        className="font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Configure in Settings &rarr;
                      </button>
                    )}
                  </div>
                )}

                {activeCustomFields.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCustomFields.map((field) => (
                      <div key={field.id} className={field.type === "url" || field.id.includes("address") ? "sm:col-span-2" : ""}>
                        <label className="block text-xs font-bold text-zinc-800 mb-1 flex items-center justify-between">
                          <span>{field.label}</span>
                          <span className="text-[10px] font-mono text-zinc-400">({field.type})</span>
                        </label>
                        <input
                          type={field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : field.type === "number" ? "number" : "text"}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          value={newCustomFields[field.id] || ""}
                          onChange={(e) => setNewCustomFields({ ...newCustomFields, [field.id]: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978]"
                >
                  Save Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT BUSINESS (WHOLE ENTRY)                                        */}
      {/* ========================================================================= */}
      {isEditModalOpen && editTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">Edit Business Entry</h3>
                  <p className="text-[11px] text-zinc-500">Update business details, contacts, and social channels</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Business ID
                  </label>
                  <input
                    type="text"
                    value={editBusinessId}
                    onChange={(e) => setEditBusinessId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editBizName}
                    onChange={(e) => setEditBizName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Owner Phone</label>
                  <input
                    type="tel"
                    value={editOwnerPhone}
                    onChange={(e) => setEditOwnerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Instagram Link</label>
                  <input
                    type="url"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Facebook Link</label>
                  <input
                    type="url"
                    value={editFacebook}
                    onChange={(e) => setEditFacebook(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">Google Review Link</label>
                  <input
                    type="url"
                    placeholder="https://search.google.com/... or g.page/r/..."
                    value={editGoogleReviewLink}
                    onChange={(e) => setEditGoogleReviewLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Custom Business Details & Extended Options */}
              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-zinc-900">Custom Business Details</span>
                    {activeCustomFields.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        {activeCustomFields.length} active
                      </span>
                    )}
                  </div>
                  
                  {onNavigateToSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        onNavigateToSettings();
                      }}
                      className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
                      title="Manage custom fields in Settings tab"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Manage Fields in Settings</span>
                    </button>
                  )}
                </div>

                {/* Active Custom Fields Inputs */}
                {activeCustomFields.length === 0 && (
                  <div className="p-3 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>No custom fields configured yet. Add them in Settings tab.</span>
                    {onNavigateToSettings && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditModalOpen(false);
                          onNavigateToSettings();
                        }}
                        className="font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Configure in Settings &rarr;
                      </button>
                    )}
                  </div>
                )}

                {activeCustomFields.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCustomFields.map((field) => (
                      <div key={field.id} className={field.type === "url" || field.id.includes("address") ? "sm:col-span-2" : ""}>
                        <label className="block text-xs font-bold text-zinc-800 mb-1 flex items-center justify-between">
                          <span>{field.label}</span>
                          <span className="text-[10px] font-mono text-zinc-400">({field.type})</span>
                        </label>
                        <input
                          type={field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : field.type === "number" ? "number" : "text"}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          value={editCustomFields[field.id] || ""}
                          onChange={(e) => setEditCustomFields({ ...editCustomFields, [field.id]: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
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
      {/* MODAL: SOFT DELETE CONFIRMATION (All Tab)                                  */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-zinc-900">Move to Deleted Section?</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-900 font-bold">{deleteTarget.business_name}</strong> ({deleteTarget.business_id})?
                This will move it to the <strong>Deleted</strong> tab, release any linked QR/NFC tags back to unassigned inventory, and archive linked records.
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
              <h3 className="font-bold text-lg text-rose-950">Delete Client Permanently</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                This action is <strong>irreversible</strong>. The record for <strong>{permanentDeleteTarget.business_name}</strong> ({permanentDeleteTarget.business_id}) will be completely deleted from the database.
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
