"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 shadow-[inset_0_1px_2px_rgb(8_59_55/0.12)] transition-colors duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-pine/15 hover:data-[state=unchecked]:bg-pine/25",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-[0_1px_3px_rgb(8_59_55/0.35)] ring-0 transition-transform duration-200 ease-out group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4 data-[state=unchecked]:translate-x-0 ltr:group-data-[size=default]/switch:data-[state=checked]:translate-x-5 ltr:group-data-[size=sm]/switch:data-[state=checked]:translate-x-4 rtl:group-data-[size=default]/switch:data-[state=checked]:-translate-x-5 rtl:group-data-[size=sm]/switch:data-[state=checked]:-translate-x-4"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
