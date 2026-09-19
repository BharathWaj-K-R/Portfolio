import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
export const TooltipProvider=TooltipPrimitive.Provider
export const Tooltip=TooltipPrimitive.Root
export const TooltipTrigger=TooltipPrimitive.Trigger
export function TooltipContent({className,...props}:React.ComponentProps<typeof TooltipPrimitive.Content>){return <TooltipPrimitive.Portal><TooltipPrimitive.Content sideOffset={6} className={cn("z-50 max-w-xs border bg-black px-3 py-2 text-xs text-white shadow-xl",className)} {...props}/></TooltipPrimitive.Portal>} 
