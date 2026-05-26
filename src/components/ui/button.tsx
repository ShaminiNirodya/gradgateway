import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[20px] text-[15px] font-bold transition-all duration-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-primary/20 backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-[#6C5DD3]/90 via-[#6C5DD3] to-[#8a7cff]/90 text-white shadow-[0_8px_20px_-6px_rgba(108,93,211,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 hover:from-[#5b4eb8] hover:to-[#7a6aff] hover:shadow-[0_12px_25px_-4px_rgba(108,93,211,0.7),inset_0_1px_2px_rgba(255,255,255,0.5)]",
        destructive:
          "bg-gradient-to-br from-red-500/90 to-red-600/90 text-white border border-white/20 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:from-red-600 hover:to-red-700 hover:shadow-[0_12px_25px_-4px_rgba(239,68,68,0.6)]",
        outline:
          "border border-white/40 bg-white/20 text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:bg-white/40 hover:text-slate-900",
        secondary:
          "bg-indigo-50/50 text-[#6C5DD3] border border-white/80 shadow-[0_4px_12px_rgba(108,93,211,0.05)] hover:bg-indigo-100/60 hover:text-[#5b4eb8]",
        ghost:
          "text-slate-500 hover:bg-white/40 hover:text-slate-900 border border-transparent hover:border-white/20 shadow-none hover:shadow-sm",
        link: "text-[#6C5DD3] underline-offset-4 hover:underline p-0 h-auto self-center bg-transparent backdrop-blur-0",
      },
      size: {
        default: "h-12 px-8 py-2",
        sm: "h-10 rounded-[16px] gap-1.5 px-5 text-sm",
        lg: "h-14 rounded-[24px] px-10 text-base",
        icon: "size-12 flex items-center justify-center p-0 rounded-full",
        "icon-sm": "size-10 flex items-center justify-center p-0 rounded-full",
        "icon-lg": "size-[60px] flex items-center justify-center p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
