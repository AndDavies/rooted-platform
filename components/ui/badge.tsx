import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-1.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] [&>svg]:shrink-0 leading-normal",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-green text-white [a&]:hover:bg-emerald-green/90",
        secondary:
          "border-transparent bg-misty-sage text-white [a&]:hover:bg-misty-sage/90",
        wellness:
          "border-transparent bg-maximum-yellow text-charcoal-ash [a&]:hover:bg-maximum-yellow/90",
        recovery:
          "border-transparent bg-herbal-olive text-white [a&]:hover:bg-herbal-olive/90",
        stress:
          "border-transparent bg-warm-clay text-white [a&]:hover:bg-warm-clay/90",
        destructive:
          "border-transparent bg-dark-pastel-red text-white [a&]:hover:bg-dark-pastel-red/90 focus-visible:ring-dark-pastel-red/20 dark:focus-visible:ring-dark-pastel-red/40",
        outline:
          "text-foreground border-emerald-green [a&]:hover:bg-emerald-green/10 [a&]:hover:text-emerald-green",
        success:
          "border-transparent bg-emerald-green/10 text-emerald-green border-emerald-green/20",
        warning:
          "border-transparent bg-maximum-yellow/10 text-charcoal-ash border-maximum-yellow/20",
        info:
          "border-transparent bg-misty-sage/10 text-dusky-plum border-misty-sage/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
