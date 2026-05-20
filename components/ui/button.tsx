import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

export function Button({
  className,
  asChild,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button"

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "border-teal-700 bg-teal-700 text-white hover:bg-teal-800",
        variant === "secondary" &&
          "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        variant === "ghost" &&
          "border-transparent bg-transparent text-slate-700 hover:bg-slate-100",
        variant === "danger" &&
          "border-red-600 bg-red-600 text-white hover:bg-red-700",
        size === "sm" && "h-8 px-3",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-11 px-5",
        className,
      )}
      {...props}
    />
  )
}
