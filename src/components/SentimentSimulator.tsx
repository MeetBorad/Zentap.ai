"use client";

import React, { useState } from "react";
import { Star, ShieldAlert, CheckCircle, ArrowRight, ExternalLink } from "lucide-react";

export default function SentimentSimulator() {
  const [selectedRating, setSelectedRating] = useState<number | null>(5);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [privateFeedback, setPrivateFeedback] = useState("");

  const isPositive = selectedRating !== null && selectedRating >= 4;

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setTicketSubmitted(false);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#232734] mb-8">
        <div>
          <h3 className="font-headline font-bold text-xl sm:text-2xl text-white tracking-tight text-balance">
            Interactive Customer Review &amp; Feedback Experience
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Experience how customers receive instant AI review drafts or can reach store management directly with full transparency.
          </p>
        </div>

        {/* Dynamic Route Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isPositive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 text-xs font-semibold border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Public Google Maps Route
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/60 text-amber-300 text-xs font-semibold border border-amber-800/50">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Private Merchant Desk Route
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Star Selector Box */}
        <div className="lg:col-span-5 flex flex-col p-6 rounded-2xl bg-[#141720] border border-[#232734] shadow-sm">
          <p className="text-xs font-semibold text-white mb-3">
            Select Customer Rating:
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className="p-2 rounded-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-none"
                aria-label={`Select ${star} stars`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    selectedRating !== null && star <= selectedRating
                      ? star >= 4
                        ? "fill-amber-400 text-amber-500"
                        : "fill-amber-300 text-amber-400"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#232734] text-xs text-slate-300 font-mono">
            {selectedRating === 5 && "5 Stars · Outstanding experience"}
            {selectedRating === 4 && "4 Stars · Satisfied visit, minor feedback"}
            {selectedRating === 3 && "3 Stars · Neutral experience, needs attention"}
            {selectedRating === 2 && "2 Stars · Service delay encountered"}
            {selectedRating === 1 && "1 Star · Dissatisfied with service"}
          </div>
        </div>

        {/* Dynamic Live Result Display */}
        {isPositive ? (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#141720] border border-[#232734] shadow-sm animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-emerald-200 font-headline">
                  Direct Public Google Review Acceleration
                </h3>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  Customer taps the standee, selects 4 or 5 stars, and is instantly directed to your pre-filled 5-star Google Maps review sheet with photo upload shortcuts.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold">
                    <span>Google Profile Boosted</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-medium">
                    Latency: &lt; 0.6 seconds
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#141720] border border-[#232734] shadow-sm animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-black flex items-center justify-center flex-shrink-0 shadow-sm font-bold">
                <ShieldAlert className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-200 font-headline">
                  Direct Manager Resolution Desk
                </h3>
                <p className="text-xs text-amber-100 mt-1 leading-relaxed">
                  Customer has the option to alert the store manager directly to resolve any concerns on the spot, while always retaining full direct access to Google Maps.
                </p>
                  
                  {!ticketSubmitted ? (
                    <div className="mt-4 space-y-2.5">
                      <input
                        type="text"
                        value={privateFeedback}
                        onChange={(e) => setPrivateFeedback(e.target.value)}
                        placeholder="Simulate guest note: 'Soup was cold'..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-amber-700/50 bg-[#0e1015] text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                      <button
                        onClick={() => setTicketSubmitted(true)}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Dispatch Private Manager Alert</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 rounded-lg bg-[#0e1015] border border-amber-700/50 text-xs text-amber-300 font-medium">
                      Manager SMS/Email dispatched immediately. Public Google rating shielded.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
