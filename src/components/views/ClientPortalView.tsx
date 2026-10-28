"use client";

import React, { useState, useEffect } from "react";
import { 
  Store, 
  ArrowUpRight, 
  Star, 
  ShieldAlert, 
  Radio, 
  Send, 
  Check, 
  RefreshCw, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  Activity,
  Layers,
  MapPin,
  Clock,
  Wifi,
  Database
} from "lucide-react";
import { INITIAL_STANDEES, INITIAL_REVIEWS, StandeeItem, ReviewItem } from "@/data/mockData";
import { fetchMerchants, DbMerchant } from "@/lib/supabase/service";

interface ClientPortalViewProps {
  onTriggerTapSimulator?: () => void;
}

export default function ClientPortalView({ onTriggerTapSimulator }: ClientPortalViewProps) {
  const [standees, setStandees] = useState<StandeeItem[]>(INITIAL_STANDEES);
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [selectedDestination, setSelectedDestination] = useState<string>("google");
  const [updateToast, setUpdateToast] = useState("");
  const [activeLocation, setActiveLocation] = useState<string>("Virat Gold Palace");
  const [activePlan, setActivePlan] = useState<string>("Growth ₹2,999/mo");
  const [generatingReplyId, setGeneratingReplyId] = useState<string | null>(null);
  const [dbMerchants, setDbMerchants] = useState<DbMerchant[]>([]);

  useEffect(() => {
    fetchMerchants().then((data) => {
      if (data && data.length > 0) {
        setDbMerchants(data);
        setActiveLocation(data[0].name);
        if (data[0].plan) setActivePlan(data[0].plan);
      }
    });
  }, []);

  // Total taps calculated live
  const totalTapsToday = standees.reduce((acc, s) => acc + s.tapsToday, 0);

  // Handle Dynamic URL Routing Update
  const handlePushDestinationUpdate = () => {
    let destUrl = "https://g.page/r/urban-bistro/review";
    if (selectedDestination === "yelp") destUrl = "https://yelp.com/biz/urban-bistro";
    if (selectedDestination === "tripadvisor") destUrl = "https://tripadvisor.com/restaurant/urban-bistro";
    if (selectedDestination === "wifi") destUrl = "https://wifi.urbanbistro.com/login";

    setStandees((prev) =>
      prev.map((s) => ({
        ...s,
        destination: selectedDestination as any,
        destinationUrl: destUrl,
      }))
    );

    const destName = 
      selectedDestination === "google" ? "Google Business Profile" :
      selectedDestination === "yelp" ? "Yelp Page" :
      selectedDestination === "tripadvisor" ? "TripAdvisor" : "Guest WiFi Portal";

    setUpdateToast(`✓ Destination URL updated to ${destName} across all ${standees.length} active standees!`);
    setTimeout(() => setUpdateToast(""), 4500);
  };

  // Generate AI Review Reply
  const handleGenerateAiReply = (revId: string) => {
    setGeneratingReplyId(revId);
    setTimeout(() => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === revId) {
            return {
              ...r,
              aiSuggestedReply: `Hello ${r.author}! Thank you sincerely from all of us at ${activeLocation}. We are committed to craft hospitality and look forward to welcoming you back soon!`,
              status: "published",
            };
          }
          return r;
        })
      );
      setGeneratingReplyId(null);
    }, 800);
  };

  // Approve & Sync Reply
  const handleApproveReply = (revId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === revId) {
          return {
            ...r,
            ownerReply: replyText,
            status: "replied",
          };
        }
        return r;
      })
    );
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      
      {/* Top Profile Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-surface-container-low p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-surface-variant/40 shadow-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline font-bold text-2xl shadow-md flex-shrink-0">
            UB
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="font-headline font-bold text-xl sm:text-2xl text-on-surface">
                {activeLocation}
              </h1>
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                #ZT-8821
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                Active Store
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                742 Evergreen Terrace, Downtown
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Mon-Sun: 11:00 AM - 11:30 PM
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                NFC Sensors: 99.8% Online Telemetry
              </span>
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {onTriggerTapSimulator && (
            <button
              onClick={onTriggerTapSimulator}
              className="px-4 py-2 rounded-xl bg-secondary-container hover:bg-secondary-container/90 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Simulate Customer Tap</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveLocation(
                activeLocation.includes("Urban") ? "Cafe Milano Downtown" : "The Urban Bistro & Lounge"
              );
            }}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center gap-1.5 border border-surface-variant/40 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch Location</span>
          </button>
        </div>
      </div>

      {/* Update Toast */}
      {updateToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-between border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{updateToast}</span>
          </div>
          <span className="text-[10px] text-emerald-600 uppercase font-mono">Synced</span>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Total Taps (Today)
          </span>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              {totalTapsToday}
            </span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
              ↑ +24.6% vs yesterday
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-3 pt-3 border-t border-surface-variant/20">
            Peak hour: 8:15 PM
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Google Redirects
          </span>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
              {Math.round(totalTapsToday * 0.9)}
            </span>
            <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
              90.1% Conversion Rate
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-3 pt-3 border-t border-surface-variant/20">
            Direct to Maps Review popup
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Avg Google Rating
          </span>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface">
                4.92
              </span>
              <span className="text-xs text-on-surface-variant">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              ))}
              <span className="text-[11px] text-emerald-600 font-semibold ml-1">+1.1 gained</span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-400 mt-3 pt-3 border-t border-surface-variant/20">
            318 verified reviews
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            AI Intercepted Tickets
          </span>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-3xl sm:text-4xl text-secondary">
              3
            </span>
            <span className="block text-[11px] text-secondary font-semibold mt-1">
              Resolved Privately
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-3 pt-3 border-t border-surface-variant/20">
            100% negative feedback shielded
          </span>
        </div>
      </div>

      {/* Dynamic URL Destination Switcher */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container border border-surface-variant/40 shadow-sm mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-4 h-4 text-secondary-container" />
          <h3 className="font-headline font-bold text-lg text-on-surface">
            Dynamic URL Destination Switcher
          </h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-6 max-w-2xl leading-relaxed">
          Instantly update where customer NFC taps direct their phones. Change destination in real time without replacing, reprinting, or re-encoding hardware.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary-container cursor-pointer"
          >
            <option value="google">Google Business Profile Reviews (Default Recommended)</option>
            <option value="yelp">Yelp Business Listing Page</option>
            <option value="tripadvisor">TripAdvisor Traveler Reviews</option>
            <option value="wifi">Guest High-Speed WiFi Captive Portal</option>
          </select>

          <button
            onClick={handlePushDestinationUpdate}
            className="py-3 px-6 rounded-xl bg-secondary-container hover:bg-secondary-container/90 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Push Update to Standees</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-Time Reviews Ingestion Feed & AI Auto-Reply */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        <div className="lg:col-span-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  Real-Time Review Feed &amp; AI Reply Assistant
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Incoming reviews synced directly from Google Business Profile and internal NFC interceptor.
              </p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              Live Feed Connected • Auto-Sync ON
            </span>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-xs text-on-surface">
                      {rev.author[0]}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">
                        {rev.author}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                        <span>{rev.date}</span>
                        <span>•</span>
                        <span>{rev.standeeLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      ))}
                    </div>

                    {rev.source === "google" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Google Verified
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        Private Intercepted
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-on-surface leading-relaxed mb-4">
                  "{rev.comment}"
                </p>

                {/* AI Suggested Response Box */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-secondary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {rev.ownerReply ? "Synced Owner Reply" : "AI Suggested Response"}
                    </span>

                    {!rev.ownerReply && (
                      <button
                        onClick={() => handleGenerateAiReply(rev.id)}
                        disabled={generatingReplyId === rev.id}
                        className="text-[11px] text-secondary-container hover:underline font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${generatingReplyId === rev.id ? "animate-spin" : ""}`} />
                        <span>Regenerate with AI</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-zinc-700 italic">
                    {rev.ownerReply || rev.aiSuggestedReply}
                  </p>

                  {!rev.ownerReply && (
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-surface-variant/20">
                      <button
                        onClick={() => handleApproveReply(rev.id, rev.aiSuggestedReply)}
                        className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-zinc-800 text-white text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approve &amp; Publish to Google</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployed Hardware Standee Fleet Table */}
      <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border border-surface-variant/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface">
              Active Standee Hardware Fleet
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live telemetry pinging every 30 seconds via phone contactless resonance.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant self-start sm:self-auto">
            {standees.length} Units Provisioned
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-surface-variant/30">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Serial &amp; Model</th>
                <th className="py-3 px-4">Station Location</th>
                <th className="py-3 px-4">Today / Total Taps</th>
                <th className="py-3 px-4">Current Destination</th>
                <th className="py-3 px-4">Status &amp; Signal</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Last Interaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/20">
              {standees.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-on-surface">
                    {s.serial}
                    <span className="block text-[10px] text-zinc-400 font-sans font-normal">
                      {s.model}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface font-medium">
                    {s.location}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-secondary-container font-bold">{s.tapsToday}</span>
                    <span className="text-zinc-400"> / {s.tapsTotal}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-medium truncate max-w-[150px] inline-block">
                      {s.destination === "google" ? "Google Maps" : s.destination}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {s.signalStrength}% Signal
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-zinc-500 font-mono">
                    {s.lastTapAgo}
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
