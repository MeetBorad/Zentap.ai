"use client";

import React, { HTMLAttributes } from "react";

export type OpenDesignCardVariant = "paper" | "acrylic" | "bento" | "metal";

export interface OpenDesignCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: OpenDesignCardVariant;
  interactive?: boolean;
}

const cardVariantStyles: Record<OpenDesignCardVariant, string> = {
  paper: "bg-[#141720] border-[#232734] text-[#f5f5f7]",
  acrylic: "bg-[#0e1015] border-[#232734] text-white",
  bento: "bg-[#141720] border-[#232734] text-[#f5f5f7]",
  metal: "bg-[#141720] border-[#D4AF37] text-white shadow-xl",
};

export function OpenDesignCard({
  children,
  className = "",
  variant = "paper",
  interactive = true,
  ...props
}: OpenDesignCardProps) {
  return (
    <div
      className={`rounded-3xl border shadow-sm p-6 sm:p-7 ${
        interactive ? "tactile-card hover:border-[#ff7a00]/40 hover:shadow-lg cursor-pointer transition-colors" : ""
      } ${cardVariantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
