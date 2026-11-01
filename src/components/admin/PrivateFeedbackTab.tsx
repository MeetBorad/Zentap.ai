// src/components/admin/PrivateFeedbackTab.tsx
"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  Star, 
  Search, 
  Filter, 
  Phone, 
  Calendar, 
  User, 
  Tag, 
  Building2 
} from "lucide-react";
import { 
  PrivateFeedbackRecord, 
  getAllPrivateFeedback 
} from "@/lib/reviewAssistantStore";
import { BusinessRecord } from "@/lib/businessStore";

interface PrivateFeedbackTabProps {
  businesses: BusinessRecord[];
}

export default function PrivateFeedbackTab({ businesses }: PrivateFeedbackTabProps) {
  const [feedbackList, setFeedbackList] = useState<PrivateFeedbackRecord[]>(() =>
    getAllPrivateFeedback()
  );
  const [selectedBizFilter, setSelectedBizFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<number | "all">("all");

  const filtered = feedbackList.filter((fb) => {
    if (selectedBizFilter !== "all" && fb.business_id !== selectedBizFilter) return false;
    if (starFilter !== "all" && fb.stars !== starFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      fb.feedback_text.toLowerCase().includes(q) ||
      (fb.customer_name && fb.customer_name.toLowerCase().includes(q)) ||
      (fb.customer_phone && fb.customer_phone.includes(q)) ||
      (fb.business_name && fb.business_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-headline font-bold text-zinc-900">
            Private Owner Feedback
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Internal feedback submitted by customers with 1-3 star ratings (discreetly shared without blocking Google).
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-zinc-200 text-zinc-800 self-start sm:self-auto">
          {feedbackList.length} Total Submissions
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Business Select */}
          <select
            value={selectedBizFilter}
            onChange={(e) => setSelectedBizFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800 bg-white shadow-xs focus:outline-none"
          >
            <option value="all">All Businesses ({businesses.length})</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search feedback text, customer name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-xs"
            />
          </div>
        </div>

        {/* Star Rating Pills */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setStarFilter("all")}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              starFilter === "all" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All
          </button>
          {[1, 2, 3].map((star) => (
            <button
              key={star}
              onClick={() => setStarFilter(star)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
                starFilter === star ? "bg-amber-600 text-white" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400 bg-white rounded-3xl border border-zinc-200/80 shadow-xs">
            No private feedback messages received matching filters.
          </div>
        ) : (
          filtered.map((fb) => (
            <div
              key={fb.id}
              className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs space-y-3 hover:border-zinc-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900">
                    {fb.business_name || "Business"}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: fb.stars }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-500">
                    ({fb.stars} Star Rating)
                  </span>
                </div>

                <span className="text-[10px] text-zinc-400 font-mono">
                  {new Date(fb.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Feedback text */}
              <p className="text-xs text-zinc-800 leading-relaxed font-sans whitespace-pre-wrap">
                "{fb.feedback_text}"
              </p>

              {/* Customer Contact metadata */}
              {(fb.customer_name || fb.customer_phone || fb.tag_code) && (
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-zinc-500 font-mono border-t border-zinc-50">
                  {fb.customer_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span className="font-semibold text-zinc-700">{fb.customer_name}</span>
                    </div>
                  )}

                  {fb.customer_phone && (
                    <a
                      href={`https://wa.me/${fb.customer_phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>+{fb.customer_phone}</span>
                    </a>
                  )}

                  {fb.tag_code && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-zinc-400" />
                      <span className="uppercase">{fb.tag_code}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
