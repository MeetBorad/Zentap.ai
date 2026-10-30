"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number; // duration in seconds
  className?: string;
  color?: string;
  shineColor?: string;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
  color = "#1C1B1A",
  shineColor = "rgba(217, 72, 38, 0.95)",
}: ShinyTextProps) {
  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`inline-block bg-clip-text text-transparent animate-shine ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, ${color} 0%, ${color} 38%, ${shineColor} 50%, ${color} 62%, ${color} 100%)`,
        backgroundSize: "200% auto",
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
