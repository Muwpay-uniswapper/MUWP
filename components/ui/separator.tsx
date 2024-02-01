"use client";

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/core/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, children, ...props },
    ref
  ) => (
    <div className={cn("flex", orientation === "horizontal" ? "flex-row" : "flex-col", className)}>
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "flex-shrink-0 flex-grow bg-border",
          orientation === "horizontal" ? "h-[1px]" : "w-[1px]"
        )}
        {...props}
      />
      {children}
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "flex-shrink-0 flex-grow bg-border",
          orientation === "horizontal" ? "h-[1px]" : "w-[1px]"
        )}
        {...props}
      />
    </div>
  )
)

Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }


