"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gold" | "outline-light";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-enterprise-gold text-enterprise-navy hover:bg-[#ffe39a]",
  gold: "bg-enterprise-gold text-enterprise-navy hover:bg-[#ffe39a]",
  secondary:
    "border border-enterprise-charcoal/25 bg-transparent text-enterprise-charcoal hover:border-enterprise-charcoal hover:bg-enterprise-charcoal hover:text-white",
  "outline-light":
    "border border-white/45 bg-transparent text-white hover:border-white hover:bg-white/10",
  ghost: "bg-transparent text-enterprise-blue hover:bg-enterprise-light",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sharp px-8 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-enterprise-bright focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
