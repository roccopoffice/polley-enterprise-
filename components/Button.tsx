"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gold";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-enterprise-blue bg-gradient-to-r from-enterprise-blue to-enterprise-bright text-white shadow-[0_10px_28px_rgba(21,63,134,0.22)] hover:from-enterprise-navy hover:to-enterprise-blue",
  secondary:
    "border border-enterprise-navy bg-white/85 text-enterprise-navy hover:bg-enterprise-light",
  ghost: "bg-transparent text-enterprise-blue hover:bg-enterprise-light",
  gold: "border border-enterprise-gold/60 bg-gradient-to-r from-enterprise-gold via-[#f8e49a] to-[#e3bb45] text-enterprise-navy shadow-[0_10px_30px_rgba(245,215,110,0.35)] hover:shadow-[0_14px_38px_rgba(245,215,110,0.5)] hover:brightness-105",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-enterprise-bright focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
