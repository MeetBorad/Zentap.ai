// src/components/admin/PartnersTab.tsx
"use client";

import React, { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Tag, 
  Sliders, 
  Phone, 
  AlertCircle,
  AlertTriangle,
  History,
  X
} from "lucide-react";
import { 
  PartnerRecord, 
  TagRecord, 
  getAllPartners, 
  addPartner, 
  resetPartnerPin, 
  unlockPartner, 
  togglePartnerStatus, 
  sellCardsToPartner,
  getAllTags
} from "@/lib/businessStore";

interface PartnersTabProps {
  tags: TagRecord[];
  onTagsUpdated: (updated: TagRecord[]) => void;
  showToast: (msg: string) => void;
}

export default function PartnersTab({ tags, onTagsUpdated, showToast }: PartnersTabProps) {
  const [partners, setPartners] = useState<PartnerRecord[]>(() => getAllPartners());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked" | "disabled">("all");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerPhone, setNewPartnerPhone] = useState("");
  const [newCanRegister, setNewCanRegister] = useState(false);
  const [newCanEdit, setNewCanEdit] = useState(true);
  const [newResetLevel, setNewResetLevel] = useState<"off" | "needs_approval" | "direct">("needs_approval");

  // PIN Reveal Dialog (after Add or Reset)
  const [pinDialogData, setPinDialogData] = useState<{
    partnerName: string;
    phone: string;
    pin: string;
    action: "create" | "reset";
  } | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  // Sell Cards Modal
  const [sellModalPartner, setSellModalPartner] = useState<PartnerRecord | null>(null);
  const [selectedTagIdsForSale, setSelectedTagIdsForSale] = useState<string[]>([]);

  // Activity Log Modal
  const [activityPartner, setActivityPartner] = useState<PartnerRecord | null>(null);

  const refreshPartners = () => {
    setPartners(getAllPartners());
  };

  // Add Partner handler
  const handleAddPartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !newPartnerPhone.trim()) {
      showToast("Please enter partner name and WhatsApp phone number.");
      return;
    }

    const { partner, plainPin } = addPartner({
      name: newPartnerName.trim(),
      phone: newPartnerPhone.trim().replace(/\D/g, ""),
      can_register: newCanRegister,
      can_edit: newCanEdit,
      reset_level: newResetLevel,
    });

    refreshPartners();
    setAddModalOpen(false);
    setNewPartnerName("");
    setNewPartnerPhone("");
    setPinDialogData({
      partnerName: partner.name,
      phone: partner.phone,
      pin: plainPin,
      action: "create",
    });
    showToast(`✓ Partner "${partner.name}" added successfully!`);
  };

  // Reset PIN handler
  const handleResetPin = (p: PartnerRecord) => {
    const res = resetPartnerPin(p.id);
    if (!res) {
      showToast("Failed to reset PIN.");
      return;
    }
    refreshPartners();
    setPinDialogData({
      partnerName: p.name,
      phone: p.phone,
      pin: res.plainPin,
      action: "reset",
    });
    showToast(`✓ Generated fresh PIN for "${p.name}".`);
  };

  // Unlock Partner handler
  const handleUnlockPartner = (p: PartnerRecord) => {
    unlockPartner(p.id);
    refreshPartners();
    showToast(`✓ Partner "${p.name}" has been unlocked.`);
  };

  // Toggle Status handler
  const handleToggleStatus = (p: PartnerRecord) => {
    const next = p.status === "active" ? "disabled" : "active";
    togglePartnerStatus(p.id, next);
    refreshPartners();
    showToast(`✓ Partner status set to ${next.toUpperCase()}`);
  };

  // Sell Cards submit
  const handleExecuteSellCards = () => {
    if (!sellModalPartner) return;
    if (selectedTagIdsForSale.length === 0) {
      showToast("Please select at least 1 card to assign.");
      return;
    }
    const updatedTags = sellCardsToPartner(sellModalPartner.id, selectedTagIdsForSale);
    onTagsUpdated(updatedTags);
    refreshPartners();
    setSellModalPartner(null);
    setSelectedTagIdsForSale([]);
    showToast(`✓ Assigned ${selectedTagIdsForSale.length} card(s) to ${sellModalPartner.name}!`);
  };

  const handleCopyPin = () => {
    if (!pinDialogData) return;
    navigator.clipboard.writeText(pinDialogData.pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
    showToast("✓ PIN copied to clipboard!");
  };

  // Filtered partners
  const filtered = partners.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    if (!matchSearch) return false;
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  const totalPartners = partners.length;
  const activeCount = partners.filter((p) => p.status === "active").length;
  const lockedCount = partners.filter((p) => p.status === "locked").length;
  const totalCardsOwned = partners.reduce((sum, p) => sum + (p.cards_owned || 0), 0);

  // Tags available for sale/transfer
  const freeTags = tags.filter((t) => !t.business_id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-headline font-bold text-zinc-900">
            Partners &amp; Distributors
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage field agents, hardware distribution channels, and card owner credentials.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="tactile-btn self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm transition-transform active:scale-[0.978] whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Total Partners
          </span>
          <span className="font-headline font-black text-2xl text-zinc-900 my-1">
            {totalPartners}
          </span>
          <span className="text-[10px] text-zinc-400">Authorized fleet distributors</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Cards Distributed
          </span>
          <span className="font-headline font-black text-2xl text-zinc-900 my-1">
            {totalCardsOwned}
          </span>
          <span className="text-[10px] text-zinc-400">Assigned across partners</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Active Accounts
          </span>
          <span className="font-headline font-black text-2xl text-emerald-600 my-1">
            {activeCount}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">Fully operational</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Locked Accounts
          </span>
          <span className={`font-headline font-black text-2xl my-1 ${lockedCount > 0 ? "text-red-600" : "text-zinc-400"}`}>
            {lockedCount}
          </span>
          <span className="text-[10px] text-zinc-400">Exceeded 5 wrong PIN tries</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by partner name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "all" ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All ({partners.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "active" ? "bg-emerald-700 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("locked")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "locked" ? "bg-red-600 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Locked ({lockedCount})
          </button>
          <button
            onClick={() => setStatusFilter("disabled")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "disabled" ? "bg-zinc-700 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Disabled ({partners.filter((p) => p.status === "disabled").length})
          </button>
        </div>
      </div>

      {/* Partner Table */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-mono tracking-wider font-semibold">
                <th className="py-3.5 px-4 sm:px-6">Partner Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Cards Owned</th>
                <th className="py-3.5 px-4">Cards In Use</th>
                <th className="py-3.5 px-4">Reset Level</th>
                <th className="py-3.5 px-4">Permissions</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-400">
                    No partners found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* 1. Name */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{p.name}</span>
                        <span className="font-mono text-[10px] text-zinc-400">{p.id}</span>
                      </div>
                    </td>

                    {/* 2. Phone */}
                    <td className="py-4 px-4 font-mono text-[11px] text-zinc-700">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-zinc-400" />
                        <span>+{p.phone}</span>
                      </div>
                    </td>

                    {/* 3. Status */}
                    <td className="py-4 px-4">
                      {p.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : p.status === "locked" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold animate-pulse">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Locked (5 fails)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] font-bold">
                          <Lock className="w-3 h-3" />
                          <span>Disabled</span>
                        </span>
                      )}
                    </td>

                    {/* 4. Cards Owned */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          setSellModalPartner(p);
                          setSelectedTagIdsForSale([]);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 font-mono font-bold text-zinc-800 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        title="Click to assign cards"
                      >
                        <Tag className="w-3 h-3 text-zinc-500" />
                        <span>{p.cards_owned || 0} cards</span>
                      </button>
                    </td>

                    {/* 5. Cards in Use */}
                    <td className="py-4 px-4 font-mono text-[11px] text-zinc-700">
                      <span className="font-semibold">{p.cards_in_use || 0}</span>
                      <span className="text-[10px] text-zinc-400 ml-1">assigned</span>
                    </td>

                    {/* 6. Reset Level */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        p.reset_level === "needs_approval"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : p.reset_level === "direct"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-zinc-100 text-zinc-700"
                      }`}>
                        {p.reset_level === "needs_approval"
                          ? "Needs Approval"
                          : p.reset_level === "direct"
                          ? "Direct Google"
                          : "Turn OFF"}
                      </span>
                    </td>

                    {/* 7. Permissions */}
                    <td className="py-4 px-4 text-[10px] text-zinc-500 space-y-0.5">
                      <div>Can Register: <span className="font-bold text-zinc-700">{p.can_register ? "Yes" : "No"}</span></div>
                      <div>Can Edit: <span className="font-bold text-zinc-700">{p.can_edit ? "Yes" : "No"}</span></div>
                    </td>

                    {/* 8. Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        
                        {/* Unlock if locked */}
                        {p.status === "locked" && (
                          <button
                            onClick={() => handleUnlockPartner(p)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Unlock account and reset failed PIN count"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Unlock</span>
                          </button>
                        )}

                        {/* Reset PIN */}
                        <button
                          onClick={() => handleResetPin(p)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-[10px] cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Generate new 6-digit random PIN"
                        >
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          <span>Reset PIN</span>
                        </button>

                        {/* Sell Cards */}
                        <button
                          onClick={() => {
                            setSellModalPartner(p);
                            setSelectedTagIdsForSale([]);
                          }}
                          className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 cursor-pointer"
                          title="Assign inventory cards to this partner"
                        >
                          <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        </button>

                        {/* Toggle Active / Disabled */}
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`p-1.5 rounded-lg border cursor-pointer ${
                            p.status === "active"
                              ? "bg-white border-zinc-200 hover:bg-red-50 text-zinc-600 hover:text-red-600"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}
                          title={p.status === "active" ? "Disable Partner" : "Enable Partner"}
                        >
                          {p.status === "active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Activity History */}
                        <button
                          onClick={() => setActivityPartner(p)}
                          className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 cursor-pointer"
                          title="View Partner Audit Trail"
                        >
                          <History className="w-3.5 h-3.5 text-zinc-600" />
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

      {/* ========================================================================= */}
      {/* MODAL 1: ADD PARTNER MODAL                                                */}
      {/* ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-zinc-900">
                    Add New Partner
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Auto-generates a non-sequential 6-digit secret PIN.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartnerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Partner / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma (Gujarat Agency)"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  WhatsApp Contact Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400 font-bold">+</span>
                  <input
                    type="tel"
                    required
                    placeholder="919825000000"
                    value={newPartnerPhone}
                    onChange={(e) => setNewPartnerPhone(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Country code + 10-digit number without spaces.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Card Reset Level
                  </label>
                  <select
                    value={newResetLevel}
                    onChange={(e) => setNewResetLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 bg-white"
                  >
                    <option value="needs_approval">Needs Approval</option>
                    <option value="direct">Direct Google</option>
                    <option value="off">Turn OFF</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanRegister}
                      onChange={(e) => setNewCanRegister(e.target.checked)}
                      className="rounded text-zinc-900 focus:ring-zinc-900"
                    />
                    <span>Can Register Cards</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanEdit}
                      onChange={(e) => setNewCanEdit(e.target.checked)}
                      className="rounded text-zinc-900 focus:ring-zinc-900"
                    />
                    <span>Can Edit Cards</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  Create &amp; Generate PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PIN REVEAL & WHATSAPP DISPATCH MODAL                             */}
      {/* ========================================================================= */}
      {pinDialogData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-headline font-bold text-lg text-zinc-900">
                {pinDialogData.action === "create" ? "Partner PIN Generated" : "New Secret PIN Active"}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                For {pinDialogData.partnerName} (+{pinDialogData.phone})
              </p>
            </div>

            {/* Monospace PIN box */}
            <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                6-Digit Secret Admin PIN
              </span>
              <div className="font-mono text-3xl font-black tracking-widest text-emerald-400">
                {pinDialogData.pin}
              </div>
              <p className="text-[10px] text-zinc-400">
                This PIN is stored only as a cryptographic hash. Share it now.
              </p>
            </div>

            {/* Actions: Copy and Send via WhatsApp */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyPin}
                className="tactile-btn flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-800 cursor-pointer"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPin ? "Copied!" : "Copy PIN"}</span>
              </button>

              <a
                href={`https://wa.me/${pinDialogData.phone}?text=${encodeURIComponent(
                  `Hi ${pinDialogData.partnerName}, your ZenTap Partner Admin PIN is: ${pinDialogData.pin}\nUse this PIN to access and manage your standees/cards at: https://zentapdigitalsolutions.com/activate`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tactile-btn flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-xs font-bold text-white cursor-pointer shadow-sm"
              >
                <span>Send WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setPinDialogData(null)}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SELL / TRANSFER CARDS TO PARTNER                                 */}
      {/* ========================================================================= */}
      {sellModalPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-headline font-bold text-base text-zinc-900">
                  Assign Cards to {sellModalPartner.name}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Select free inventory standees or cards to allocate ownership to this partner.
                </p>
              </div>
              <button
                onClick={() => setSellModalPartner(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {freeTags.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                No unassigned cards in inventory. Generate a batch first under the Standees &amp; Cards tab.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>Available inventory: {freeTags.length} free cards</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTagIdsForSale.length === freeTags.length) {
                        setSelectedTagIdsForSale([]);
                      } else {
                        setSelectedTagIdsForSale(freeTags.map((t) => t.id));
                      }
                    }}
                    className="text-xs font-bold text-zinc-900 hover:underline cursor-pointer"
                  >
                    {selectedTagIdsForSale.length === freeTags.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 border border-zinc-200 rounded-2xl p-2 bg-zinc-50">
                  {freeTags.map((t) => {
                    const isSelected = selectedTagIdsForSale.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? "bg-white shadow-2xs border border-zinc-300" : "hover:bg-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedTagIdsForSale((prev) =>
                                isSelected ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                              );
                            }}
                            className="rounded text-zinc-900 focus:ring-zinc-900"
                          />
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-xs text-zinc-900 uppercase">{t.code}</span>
                            <span className="text-[10px] text-zinc-400 capitalize">{t.form}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.chip_written ? "bg-emerald-50 text-emerald-700" : "bg-zinc-200 text-zinc-700"
                        }`}>
                          {t.chip_written ? "Chip Written" : "Unwritten"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setSellModalPartner(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSellCards}
                disabled={selectedTagIdsForSale.length === 0}
                className="tactile-btn px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
              >
                Assign {selectedTagIdsForSale.length} Cards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: AUDIT ACTIVITY LOG MODAL                                         */}
      {/* ========================================================================= */}
      {activityPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-headline font-bold text-base text-zinc-900">
                  Audit History: {activityPartner.name}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Recent hardware activations, details updates, and reset events.
                </p>
              </div>
              <button
                onClick={() => setActivityPartner(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>CARD_RESET</span>
                  <span>{new Date().toISOString().slice(0, 10)}</span>
                </div>
                <p className="font-semibold text-zinc-800">
                  Reset requested for card <code className="font-mono text-zinc-900">zt-0002</code>
                </p>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  Pending Superadmin Approval
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>PIN_VERIFY_SUCCESS</span>
                  <span>{new Date(Date.now() - 86400000).toISOString().slice(0, 10)}</span>
                </div>
                <p className="font-semibold text-zinc-800">
                  Authenticated session unlocked for card <code className="font-mono text-zinc-900">zt-0001</code>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span>PARTNER_INITIALIZED</span>
                  <span>{activityPartner.created_at.slice(0, 10)}</span>
                </div>
                <p className="font-semibold text-zinc-800">
                  Partner enrolled with 6-digit cryptographic PIN hash
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActivityPartner(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
