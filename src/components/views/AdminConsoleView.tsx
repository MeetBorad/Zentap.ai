"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Radio, 
  Star, 
  DollarSign, 
  PlusCircle, 
  Check, 
  Cpu, 
  RefreshCw,
  Search,
  Filter,
  Layers,
  ArrowRight
} from "lucide-react";
import { FLEET_METRICS } from "@/data/mockData";

export default function AdminConsoleView() {
  const [businessName, setBusinessName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [standeeModel, setStandeeModel] = useState("Matte Obsidian Acrylic (Standard)");
  const [destRoute, setDestRoute] = useState("https://g.page/r/new-venue/review");
  const [provisionSuccess, setProvisionSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [fleetList, setFleetList] = useState([
    { id: "FL-901", business: "Cafe Milano", serial: "ZT-9412-A", model: "Brushed Brass", status: "Active", taps: 2140, batch: "Batch #46" },
    { id: "FL-902", business: "The Urban Bistro", serial: "ZT-8821-A", model: "Matte Obsidian", status: "Active", taps: 1428, batch: "Batch #46" },
    { id: "FL-903", business: "Iron Works Fitness", serial: "ZT-7719-B", model: "Matte Obsidian", status: "Active", taps: 890, batch: "Batch #47" },
    { id: "FL-904", business: "Nirvana Salon & Spa", serial: "ZT-6651-A", model: "Minimalist Ceramic", status: "Active", taps: 642, batch: "Batch #47" },
    { id: "FL-905", business: "Dr. Rao Dental Care", serial: "ZT-5520-A", model: "Minimalist Ceramic", status: "Active", taps: 419, batch: "Batch #47" },
  ]);

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !serialNumber.trim()) return;

    const newUnit = {
      id: `FL-${Date.now().toString().slice(-3)}`,
      business: businessName.trim(),
      serial: serialNumber.trim().toUpperCase(),
      model: standeeModel,
      status: "Active",
      taps: 0,
      batch: "Batch #48-A (Live Encoded)",
    };

    setFleetList([newUnit, ...fleetList]);
    setProvisionSuccess(`✓ Standee ${newUnit.serial} successfully encoded and assigned to "${newUnit.business}"!`);
    setBusinessName("");
    setSerialNumber("");

    setTimeout(() => {
      setProvisionSuccess("");
    }, 4500);
  };

  const filteredFleet = fleetList.filter(
    (item) =>
      item.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      
      {/* Superadmin Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-surface-container-low p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-surface-variant/40 shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-surface-container-high/60 to-transparent pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-[11px] font-mono tracking-wider uppercase font-bold">
              Root Superadmin Console
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full text-on-surface-variant text-[11px] font-medium border border-surface-variant/40">
              <Lock className="w-3 h-3" />
              <span>256-Bit TLS Hardware Handshake</span>
            </div>
          </div>
          
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface">
            ZenTap.ai Global Infrastructure &amp; Fleet
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Manage physical NFC hardware deployments, tenant routing pipelines, and real-time review ingestion feeds across all provisioned client merchant accounts.
          </p>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-surface p-2.5 rounded-2xl shadow-sm border border-surface-variant/40 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm shadow">
            AR
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-xs font-bold text-on-surface">Alex Rivers</span>
            <span className="text-[10px] text-on-surface-variant">Site Owner / Root</span>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Active Client Venues
          </span>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              {FLEET_METRICS.activeVenues}
            </span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
              +14 onboarded this week
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-secondary h-full rounded-full" style={{ width: "84%" }} />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Deployed NFC Hardware
          </span>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              {fleetList.length + 1837}
            </span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
              {FLEET_METRICS.onlineTelemetry} Online Telemetry
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "99%" }} />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Sitewide Reviews
          </span>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              68,490
            </span>
            <span className="block text-[11px] text-secondary font-semibold mt-1">
              99.2% Sync Rate
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-secondary h-full rounded-full" style={{ width: "92%" }} />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Hardware &amp; SaaS ARR
          </span>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              $42.8k
            </span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
              Recurring Merchant ARR
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-primary h-full rounded-full" style={{ width: "78%" }} />
          </div>
        </div>
      </div>

      {/* Provisioning Tool & Batch Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Provisioning Tool Form */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <PlusCircle className="w-5 h-5 text-secondary" />
            <h3 className="font-headline font-bold text-xl text-on-surface">
              Provision New Standee Unit
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mb-6">
            Encode a blank NTAG216 chip, bind it to a venue merchant profile, and configure initial redirection destination.
          </p>

          {provisionSuccess && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{provisionSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProvisionSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Business / Store Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Joe's Italian Diner"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Assigned NTAG ID / Hardware Serial
                </label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. ZT-9904-B"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Standee Finish &amp; Model
                </label>
                <select
                  value={standeeModel}
                  onChange={(e) => setStandeeModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option>Matte Obsidian Acrylic (Standard)</option>
                  <option>Brushed Brass / Gold Metallic</option>
                  <option>Minimalist Ceramic White</option>
                  <option>Custom Corporate Pantone Inlay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Initial Redirect URL Target
                </label>
                <input
                  type="url"
                  required
                  value={destRoute}
                  onChange={(e) => setDestRoute(e.target.value)}
                  placeholder="https://g.page/r/venue/review"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="self-start mt-2 py-3 px-6 rounded-xl bg-secondary-container hover:bg-secondary-container/90 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Encode &amp; Provision Unit</span>
              <Cpu className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Batch Status Sidebar */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-primary text-on-primary shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono text-secondary-fixed uppercase font-bold">
                Batch Pipeline
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                ENCODING READY
              </span>
            </div>

            <h4 className="font-headline font-bold text-lg text-white mb-2">
              NFC Chip Batch #48-A
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              5,000 blank NTAG216 semiconductors loaded in firmware flashing hopper. Ready for customer laser etching.
            </p>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span>EEPROM Memory:</span>
                <span className="font-mono text-white">888 Bytes</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span>Firmware Lock:</span>
                <span className="font-mono text-emerald-400">Pass-Locked v3.2</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/10">
                <span>ISO Standard:</span>
                <span className="font-mono text-white">14443-A NFC</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
            <span>Hardware ARR</span>
            <span className="text-white font-bold font-mono">$42,800 / mo</span>
          </div>
        </div>
      </div>

      {/* Live Provisioned Fleet Table */}
      <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border border-surface-variant/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface">
              Live Provisioned Units ({fleetList.length})
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Filter by venue name or hardware serial to verify remote telemetry pings.
            </p>
          </div>

          {/* Search filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venue or serial..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-surface-variant/30">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Unit ID</th>
                <th className="py-3 px-4">Business Client</th>
                <th className="py-3 px-4">NFC Serial</th>
                <th className="py-3 px-4">Standee Finish</th>
                <th className="py-3 px-4">Batch Source</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/20">
              {filteredFleet.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-zinc-500 font-bold">
                    {u.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-on-surface">
                    {u.business}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-secondary-container font-semibold">
                    {u.serial}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">
                    {u.model}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                    {u.batch}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
