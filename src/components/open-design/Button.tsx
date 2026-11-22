"use client";

import React, { forwardRef, ButtonHTMLAttributes } from "react";

export type OpenDesignButtonVariant = 
  | "primary" 
  | "accent" 
  | "secondary" 
  | "ghost" 
  | "subtle" 
  | "metal";

export type OpenDesignButtonSize = "sm" | "md" | "lg" | "icon";

export interface OpenDesignButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: OpenDesignButtonVariant;
  size?: OpenDesignButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  shine?: boolean;
}

const variantStyles: Record<OpenDesignButtonVariant, string> = {
  primary: "bg-[#ff7a00] text-black hover:bg-[#e56d00] border border-[#ff7a00] shadow-md hover:shadow-lg font-bold",
  accent: "bg-[#ff7a00] text-black hover:bg-[#e56d00] border border-[#ff7a00] shadow-md hover:shadow-lg font-bold",
  secondary: "bg-[#1e2230] text-white hover:bg-[#252b3d] border border-[#3a4154] shadow-sm hover:border-[#ff7a00]/40",
  ghost: "bg-transparent text-zinc-200 hover:text-white hover:bg-white/10 border border-transparent",
  subtle: "bg-[#1e2230] text-white hover:bg-[#252b3d] border border-[#3a4154]",
  metal: "bg-gradient-to-r from-[#F7E7A9] via-[#D4AF37] to-[#9A7B1C] text-black border border-[#D4AF37] font-extrabold shadow-md hover:brightness-105",
};

const sizeStyles: Record<OpenDesignButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs rounded-full gap-1.5",
  md: "min-h-[44px] px-5 py-2.5 text-xs rounded-xl gap-2",
  lg: "min-h-[48px] px-6 py-3.5 text-sm rounded-xl gap-2.5",
  icon: "w-9 h-9 p-0 rounded-full justify-center",
};

export const OpenDesignButton = forwardRef<HTMLButtonElement, OpenDesignButtonProps>(
  function OpenDesignButton(
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "right",
      type = "button",
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`tactile-btn inline-flex items-center justify-center font-bold font-sans cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {icon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);
