import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
export function Accordion({className,...props}:React.ComponentProps<typeof AccordionPrimitive.Root>){return <AccordionPrimitive.Root className={cn("w-full",className)} {...props}/>} 
export function AccordionItem({className,...props}:React.ComponentProps<typeof AccordionPrimitive.Item>){return <AccordionPrimitive.Item className={cn("border-b",className)} {...props}/>} 
export function AccordionTrigger({className,children,...props}:React.ComponentProps<typeof AccordionPrimitive.Trigger>){return <AccordionPrimitive.Header><AccordionPrimitive.Trigger className={cn("flex w-full items-center justify-between py-4 text-left text-sm font-semibold transition-all [&[data-state=open]>svg]:rotate-180",className)} {...props}>{children}<ChevronDown className="size-4 shrink-0 transition-transform"/></AccordionPrimitive.Trigger></AccordionPrimitive.Header>} 
export function AccordionContent({className,...props}:React.ComponentProps<typeof AccordionPrimitive.Content>){return <AccordionPrimitive.Content className={cn("overflow-hidden text-sm text-neutral-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",className)} {...props}/>} 
