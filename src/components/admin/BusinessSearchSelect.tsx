"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Building2, Check, X, User, Phone, Ban } from "lucide-react";
import { ClientRecord } from "@/lib/adminPlatformStore";

interface BusinessSearchSelectProps {
  clients: ClientRecord[];
  selectedBusinessId: string | null;
  onSelect: (business: ClientRecord | null) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  allowUnassign?: boolean;
  unassignLabel?: string;
  className?: string;
}

export default function BusinessSearchSelect({
  clients,
  selectedBusinessId,
  onSelect,
  label = "Assign Business",
  required = false,
  placeholder = "Search by Business ID or Name...",
  allowUnassign = false,
  unassignLabel = "Unassign (Return to inventory)",
  className = "",
}: BusinessSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out soft-deleted businesses (hide deleted businesses)
  const activeClients = clients.filter((c: any) => !c.deleted_at);

  // Find currently selected business
  const currentSelected = activeClients.find((c) => c.business_id === selectedBusinessId) || null;

  // Real-time search by ID, Name, or Owner as you type
  const filteredClients = activeClients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const idMatch = c.business_id.toLowerCase().includes(q);
    const nameMatch = c.business_name.toLowerCase().includes(q);
    const ownerMatch = (c.owner_name || "").toLowerCase().includes(q);
    const phoneMatch = (c.owner_phone || "").includes(q);
    return idMatch || nameMatch || ownerMatch || phoneMatch;
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-zinc-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Selected Card or Search Trigger */}
      {currentSelected && !isOpen ? (
        <div className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-zinc-900 text-white font-mono text-[11px] font-bold">
              {currentSelected.business_id}
            </span>
            <div className="min-w-0 truncate">
              <p className="text-xs font-bold text-zinc-900 truncate">{currentSelected.business_name}</p>
              <p className="text-[11px] text-zinc-500 truncate">
                {currentSelected.owner_name ? `${currentSelected.owner_name} • ` : ""}
                {currentSelected.owner_phone || currentSelected.city || "Client"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setSearchQuery("");
              }}
              className="tactile-btn text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-zinc-300 shadow-2xs transition-transform active:scale-[0.978] cursor-pointer"
            >
              Change
            </button>
            {allowUnassign && (
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="tactile-btn text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 shadow-2xs transition-transform active:scale-[0.978] cursor-pointer"
                title="Unassign this business"
              >
                Unassign
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Floating Dropdown Results */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150">
              {/* Unassign option if permitted */}
              {allowUnassign && (
                <button
                  type="button"
                  onClick={() => {
                    onSelect(null);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3.5 py-2.5 border-b border-zinc-100 flex items-center gap-2.5 hover:bg-rose-50/80 transition-colors group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Ban className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-700 group-hover:text-rose-800">
                      {unassignLabel}
                    </p>
                    <p className="text-[10px] text-zinc-500">Leaves this tag in the unassigned pool</p>
                  </div>
                </button>
              )}

              {filteredClients.length === 0 ? (
                <div className="py-6 px-4 text-center text-zinc-500 text-xs font-medium">
                  {searchQuery ? `No active business found for "${searchQuery}"` : "No active businesses registered"}
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {filteredClients.map((c) => {
                    const isSelected = c.business_id === selectedBusinessId;
                    return (
                      <button
                        key={c.business_id}
                        type="button"
                        onClick={() => {
                          onSelect(c);
                          setIsOpen(false);
                          setSearchQuery("");
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer ${
                          isSelected ? "bg-amber-50/60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="shrink-0 px-2 py-0.5 rounded-md bg-zinc-900 text-white font-mono text-[10px] font-bold">
                            {c.business_id}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate">{c.business_name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 truncate">
                              {c.owner_name && (
                                <span className="flex items-center gap-1">
                                  <User className="w-2.5 h-2.5" />
                                  {c.owner_name}
                                </span>
                              )}
                              {c.owner_phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" />
                                  {c.owner_phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
