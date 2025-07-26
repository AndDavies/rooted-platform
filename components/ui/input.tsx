import { cn } from "@/lib/utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-emerald-green/20 file:text-charcoal-ash placeholder-misty-sage/50 flex h-9 w-full min-w-0 rounded-md border bg-gradient-to-br from-papaya-whip to-cosmic-latte px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-emerald-green/40 focus-visible:ring-emerald-green/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-dark-pastel-red/20 aria-invalid:border-dark-pastel-red",
        type === "search" &&
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
        type === "file" &&
          "text-misty-sage/70 file:border-emerald-green/20 file:text-charcoal-ash p-0 pr-3 italic file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
