import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const badgeVariants=cva("inline-flex items-center rounded-none border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",{variants:{variant:{default:"border-black bg-black text-white",outline:"border-neutral-300 bg-white text-neutral-700",secondary:"border-neutral-200 bg-neutral-100 text-neutral-700"}},defaultVariants:{variant:"outline"}})
export function Badge({className,variant,...props}:React.HTMLAttributes<HTMLDivElement>&VariantProps<typeof badgeVariants>){return <div className={cn(badgeVariants({variant}),className)} {...props}/>} 
