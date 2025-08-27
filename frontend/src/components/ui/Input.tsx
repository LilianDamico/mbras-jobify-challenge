import * as React from "react";
import { twMerge } from "tailwind-merge";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={twMerge(
        "h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none ring-emerald-500/0 focus:ring-2",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
