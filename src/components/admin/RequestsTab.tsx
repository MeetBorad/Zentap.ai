// src/components/admin/RequestsTab.tsx
"use client";

import React, { useState } from "react";
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Tag, 
  Building2, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertTriangle,
  KeyRound
} from "lucide-react";
import { 
  ResetRequestRecord, 
  TagRecord,
  getAllResetRequests, 
  approveResetRequest, 
  rejectResetRequest,
  getAllTags
} from "@/lib/businessStore";

interface RequestsTabProps {
  onTagsUpdated: (tags: TagRecord[]) => void;
  showToast: (msg: string) => void;
}

export default function RequestsTab({ onTagsUpdated, showToast }: RequestsTabProps) {
  const [requests, setRequests] = useState<ResetRequestRecord[]>(() => getAllResetRequests());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const refreshRequests = () => {
    setRequests(getAllResetRequests());
  };

  const handleApprove = (req: ResetRequestRecord) => {
    const updated = approveResetRequest(req.id);
    setRequests(updated);
    onTagsUpdated(getAllTags());
    showToast(`✓ Request approved. Tag "${req.tag_code}" has been freed and released!`);
  };

  const handleReject = (req: ResetRequestRecord) => {
    const updated = rejectResetRequest(req.id);
    setRequests(updated);
    showToast(`✕ Request for tag "${req.tag_code}" rejected.`);
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.tag_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.business_name && r.business_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.partner_name && r.partner_name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchSearch) return false;
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Help Text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-headline font-bold text-zinc-900 flex items-center gap-2">
            <span>Reset &amp; Recovery Requests</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold font-mono animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Partner and merchant requests requiring Super Admin authorization to release physical hardware.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by code (e.g. zt-0002), business, or partner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 text-xs">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white font-semibold shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "all" ? "bg-zinc-900 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "approved" ? "bg-emerald-700 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Approved ({requests.filter((r) => r.status === "approved").length})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              statusFilter === "rejected" ? "bg-zinc-700 text-white font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Rejected ({requests.filter((r) => r.status === "rejected").length})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[10px] font-mono tracking-wider font-semibold">
                <th className="py-3.5 px-4 sm:px-6">Request ID &amp; Time</th>
                <th className="py-3.5 px-4">Hardware Code</th>
                <th className="py-3.5 px-4">Request Type</th>
                <th className="py-3.5 px-4">Business / Partner</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-400">
                    No requests found in this filter view.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* 1. Request ID & Time */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-zinc-800">{req.id}</span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(req.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* 2. Tag Code */}
                    <td className="py-4 px-4 font-mono font-bold text-sm text-zinc-900">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 uppercase">
                        {req.tag_code}
                      </span>
                    </td>

                    {/* 3. Request Type */}
                    <td className="py-4 px-4">
                      {req.type === "card_reset" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                          <RotateCcw className="w-3 h-3" />
                          <span>Card Release</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          <KeyRound className="w-3 h-3" />
                          <span>PIN Reset</span>
                        </span>
                      )}
                    </td>

                    {/* 4. Business / Partner */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col text-[11px] max-w-[180px]">
                        <span className="font-bold text-zinc-900 truncate">
                          {req.business_name || req.business_id || "Unassigned"}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate">
                          Partner: {req.partner_name || req.partner_id || "Direct Founder"}
                        </span>
                      </div>
                    </td>

                    {/* 5. Notes */}
                    <td className="py-4 px-4 max-w-[220px]">
                      <p className="text-zinc-600 text-[11px] line-clamp-2" title={req.notes || ""}>
                        {req.notes || "No additional comments provided."}
                      </p>
                    </td>

                    {/* 6. Status */}
                    <td className="py-4 px-4">
                      {req.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Pending Approval</span>
                        </span>
                      ) : req.status === "approved" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    {/* 7. Decision Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      {req.status === "pending" ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleApprove(req)}
                            className="tactile-btn flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-2xs"
                            title="Approve release and free card back to inventory"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve &amp; Free</span>
                          </button>

                          <button
                            onClick={() => handleReject(req)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 text-xs font-bold cursor-pointer border border-zinc-200"
                            title="Reject reset request"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {req.decided_by || "Admin"} • {req.decided_at ? req.decided_at.slice(0, 10) : "Decided"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
