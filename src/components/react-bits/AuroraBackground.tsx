"use client";

import React from "react";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export default function AuroraBackground({ children, className = "" }: AuroraBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Aurora Ambient Fluid Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60">
        <div
          className="absolute -top-[40%] -left-[20%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-3xl animate-aurora"
          style={{
            background:
              "radial-gradient(circle, rgba(217, 72, 38, 0.12) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-[30%] -right-[20%] w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full blur-3xl animate-aurora"
          style={{
            background:
              "radial-gradient(circle, rgba(185, 28, 28, 0.10) 0%, rgba(245, 158, 11, 0.06) 50%, transparent 70%)",
            animationDelay: "-6s",
          }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
