import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-pulsate rounded-md bg-gray-200", className)}
      style={{
        backgroundColor: '#e5e7eb',
        ...props.style
      }}
      {...props}
    />
  )
}

export { Skeleton }
