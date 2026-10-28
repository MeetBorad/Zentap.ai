"use client";

import React, { useState } from "react";
import { Star, ShieldAlert, CheckCircle, ArrowRight, MessageSquare, ExternalLink } from "lucide-react";

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
    <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/40 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-variant/30 mb-6">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-secondary">
            Live AI Sentiment Interceptor
          </span>
          <h3 className="font-headline font-bold text-xl text-on-surface mt-0.5">
            Test The Dual-Channel Review Filter
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Select a star rating to see how ZenTap.ai dynamically routes feedback in real-time.
          </p>
        </div>

        {/* Dynamic Route Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isPositive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Public Google Review Pipeline
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Private Internal Resolution Ticket
            </span>
          )}
        </div>
      </div>

      {/* Star Selector */}
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-container-low mb-6 text-center">
        <p className="text-xs font-semibold text-on-surface mb-3">
          Simulate Customer Experience Rating:
        </p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              className="p-2 rounded-xl hover:scale-125 transition-transform cursor-pointer focus:outline-none"
              aria-label={`Select ${star} stars`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  selectedRating !== null && star <= selectedRating
                    ? star >= 4
                      ? "fill-amber-400 text-amber-500"
                      : "fill-amber-300 text-amber-400"
                    : "text-zinc-300 hover:text-zinc-400"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant mt-2 font-medium">
          {selectedRating === 5 && "⭐ 5 Stars: 'Outstanding dining experience!'"}
          {selectedRating === 4 && "⭐ 4 Stars: 'Great food, minor wait at table.'"}
          {selectedRating === 3 && "⚠️ 3 Stars: 'Average visit, soup was lukewarm.'"}
          {selectedRating === 2 && "⚠️ 2 Stars: 'Order mixup, slow refill.'"}
          {selectedRating === 1 && "⚠️ 1 Star: 'Dissatisfied with seating service.'"}
        </p>
      </div>

      {/* Route Outcome Display */}
      {isPositive ? (
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-950">
                Direct Google Business Review Route
              </h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                Because rating is 4 or 5 stars, customer is immediately redirected to your Google Maps listing with a pre-filled 5-star prompt and photo upload shortcut.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="#portal"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                >
                  <span>Open Google Maps Target</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Boosts local SEO rank &amp; 5-star count
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-950">
                AI Sentiment Interception (Negative Review Shield)
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Negative reviews (1-3 stars) never reach Google. Instead, an apology prompt immediately appears so the customer vents privately to the restaurant manager.
              </p>

              {!ticketSubmitted ? (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={privateFeedback}
                    onChange={(e) => setPrivateFeedback(e.target.value)}
                    placeholder="Customer writes: 'Staff took 25 minutes for bill...'"
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={2}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-amber-800">
                      Sent directly to manager SMS &amp; Portal
                    </span>
                    <button
                      onClick={() => setTicketSubmitted(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Simulate Submitting Complaint
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-3 rounded-xl bg-white border border-amber-200 text-xs text-emerald-700 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Private ticket logged in Client Portal! Public rating protected.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
