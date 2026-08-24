import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
export const Dialog=DialogPrimitive.Root
export const DialogTrigger=DialogPrimitive.Trigger
export function DialogContent({className,...props}:React.ComponentProps<typeof DialogPrimitive.Content>){return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40"/><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 border bg-white p-6 shadow-2xl outline-none",className)} {...props}><DialogPrimitive.Close className="absolute right-4 top-4 rounded-none p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-black"><X className="size-4"/><span className="sr-only">Close</span></DialogPrimitive.Close>{props.children}</DialogPrimitive.Content></DialogPrimitive.Portal>} 
export function DialogHeader({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn("flex flex-col gap-2",className)} {...props}/>} 
export function DialogTitle({className,...props}:React.ComponentProps<typeof DialogPrimitive.Title>){return <DialogPrimitive.Title className={cn("font-serif text-2xl font-semibold",className)} {...props}/>} 
export function DialogDescription({className,...props}:React.ComponentProps<typeof DialogPrimitive.Description>){return <DialogPrimitive.Description className={cn("text-sm text-neutral-600",className)} {...props}/>} 
