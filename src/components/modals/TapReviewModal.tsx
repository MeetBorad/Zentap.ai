"use client";

import React, { useState } from "react";
import { X, Star, CheckCircle, ArrowRight, Sparkles, MessageSquare } from "lucide-react";
import { ReviewItem } from "@/data/mockData";

interface TapReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (newReview: ReviewItem) => void;
}

export default function TapReviewModal({
  isOpen,
  onClose,
  onReviewSubmitted,
}: TapReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isPositive = rating >= 4;
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: authorName.trim() || "Guest Customer",
      rating,
      source: isPositive ? "google" : "private_intercept",
      date: "Just now",
      comment: comment.trim() || (isPositive ? "Super smooth NFC tap! Amazing experience and service." : "Took longer than expected, but appreciated the prompt resolution."),
      sentiment: isPositive ? "positive" : "negative",
      status: isPositive ? "published" : "intercepted",
      standeeLocation: "Front Checkout Station #1",
      aiSuggestedReply: isPositive
        ? `Thank you so much ${authorName || "for visiting us"}! Delighted to know you enjoyed your time at The Urban Bistro. See you again!`
        : `Hi ${authorName || "there"}, thank you for alerting management directly. We are actively reviewing this with our team today.`,
    };

    setSubmitted(true);
    setTimeout(() => {
      onReviewSubmitted(newRev);
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-variant/40 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary-container text-white flex items-center justify-center font-bold text-lg shadow-sm">
                ZT
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  The Urban Bistro &amp; Lounge
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  NFC Tap Detected • Leave a Review
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Star Rating Selector */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-low">
                <span className="text-xs font-semibold text-on-surface mb-2">
                  Rate your experience:
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating
                            ? "fill-amber-400 text-amber-500"
                            : "text-zinc-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 font-medium">
                  {rating >= 4 ? "Redirecting to Google Business Profile" : "AI Interceptor Shield Active"}
                </span>
              </div>

              {/* Author name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Rachel Green"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Review Details
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder={
                    rating >= 4
                      ? "What did you enjoy most about your visit?"
                      : "Tell the restaurant manager how we can improve..."
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {rating >= 4 ? "Publish to Google Maps" : "Send Private Feedback"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-headline font-bold text-lg text-on-surface">
              {rating >= 4 ? "Google Review Published!" : "Private Feedback Received!"}
            </h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
              {rating >= 4
                ? "Your review has been synced to Google and logged in the Merchant Telemetry Portal."
                : "Your message has been shielded and dispatched privately to the restaurant manager."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
