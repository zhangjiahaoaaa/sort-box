import * as React from "react"
import { cn } from "@/lib/utils"

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "muted" | "success" | "warning" | "danger"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "default" && "bg-teal-50 text-teal-700",
        variant === "muted" && "bg-slate-100 text-slate-600",
        variant === "success" && "bg-emerald-50 text-emerald-700",
        variant === "warning" && "bg-amber-50 text-amber-700",
        variant === "danger" && "bg-red-50 text-red-700",
        className,
      )}
      {...props}
    />
  )
}
