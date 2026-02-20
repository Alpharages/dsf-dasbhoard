import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success'
}

function Alert({ className, variant = 'default', ...props }: AlertProps) {
  const variantStyles = {
    default: "bg-background text-foreground border",
    destructive: "border-red-500/50 text-red-700 bg-red-50",
    warning: "border-yellow-500/50 text-yellow-700 bg-yellow-50",
    success: "border-green-500/50 text-green-700 bg-green-50",
  }

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg p-4",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
