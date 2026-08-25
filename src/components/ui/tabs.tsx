import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
export function Tabs({className,...props}:React.ComponentProps<typeof TabsPrimitive.Root>){return <TabsPrimitive.Root className={cn("flex flex-col gap-3",className)} {...props}/>} 
export function TabsList({className,...props}:React.ComponentProps<typeof TabsPrimitive.List>){return <TabsPrimitive.List className={cn("inline-flex h-10 items-center gap-1 border border-neutral-200 bg-white p-1",className)} {...props}/>} 
export function TabsTrigger({className,...props}:React.ComponentProps<typeof TabsPrimitive.Trigger>){return <TabsPrimitive.Trigger className={cn("inline-flex h-8 items-center justify-center px-3 text-xs font-medium text-neutral-600 transition-colors data-[state=active]:bg-black data-[state=active]:text-white",className)} {...props}/>} 
export function TabsContent({className,...props}:React.ComponentProps<typeof TabsPrimitive.Content>){return <TabsPrimitive.Content className={cn("outline-none",className)} {...props}/>} 
