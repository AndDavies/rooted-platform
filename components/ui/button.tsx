import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-green text-white shadow-xs hover:bg-emerald-green/90 focus-visible:ring-emerald-green/20",
        wellness:
          "bg-maximum-yellow text-charcoal-ash shadow-xs hover:bg-maximum-yellow/90 focus-visible:ring-maximum-yellow/20",
        recovery:
          "bg-herbal-olive text-white shadow-xs hover:bg-herbal-olive/90 focus-visible:ring-herbal-olive/20",
        stress:
          "bg-warm-clay text-white shadow-xs hover:bg-warm-clay/90 focus-visible:ring-warm-clay/20",
        destructive:
          "bg-dark-pastel-red text-white shadow-xs hover:bg-dark-pastel-red/90 focus-visible:ring-dark-pastel-red/20",
        outline:
          "border border-emerald-green bg-transparent text-emerald-green shadow-xs hover:bg-emerald-green/10 hover:text-emerald-green focus-visible:ring-emerald-green/20",
        secondary:
          "bg-misty-sage text-white shadow-xs hover:bg-misty-sage/90 focus-visible:ring-misty-sage/20",
        ghost:
          "hover:bg-papaya-whip hover:text-charcoal-ash focus-visible:ring-emerald-green/20",
        link: "text-emerald-green underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 gap-1.5 px-4",
        lg: "h-10 px-7",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }
