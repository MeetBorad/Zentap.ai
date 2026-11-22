"use client";

import React, { HTMLAttributes } from "react";

export type OpenDesignBadgeVariant = "neutral" | "emerald" | "accent" | "metal";

export interface OpenDesignBadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: OpenDesignBadgeVariant;
  pulse?: boolean;
}

const badgeVariantStyles: Record<OpenDesignBadgeVariant, string> = {
  neutral: "bg-[#1e2230] border-[#3a4154] text-white",
  emerald: "bg-emerald-950/70 border-emerald-500/50 text-emerald-300",
  accent: "bg-[#ff7a00]/20 border-[#ff7a00]/40 text-[#ff7a00]",
  metal: "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#F7E7A9]",
};

const dotStyles: Record<OpenDesignBadgeVariant, string> = {
  neutral: "bg-emerald-400",
  emerald: "bg-emerald-400",
  accent: "bg-[#ff7a00]",
  metal: "bg-[#D4AF37]",
};

export function OpenDesignBadge({
  children,
  className = "",
  variant = "neutral",
  pulse = true,
  ...props
}: OpenDesignBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-sm text-[11px] font-mono font-semibold select-none ${badgeVariantStyles[variant]} ${className}`}
      {...props}
    >
      <span className={`w-2 h-2 rounded-full ${dotStyles[variant]} ${pulse ? "animate-pulse" : ""}`} />
      <span>{children}</span>
    </div>
  );
}
