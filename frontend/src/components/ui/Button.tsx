"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import * as React from "react";

const button = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        solid: "bg-emerald-600 text-white hover:bg-emerald-700",
        outline: "border border-neutral-300 hover:bg-neutral-100",
        ghost: "hover:bg-neutral-100",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={twMerge(button({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
