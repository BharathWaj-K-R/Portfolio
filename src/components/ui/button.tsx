import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50", {
  variants:{variant:{default:"bg-black text-white hover:bg-neutral-800", outline:"border border-black bg-white text-black hover:bg-black hover:text-white", ghost:"hover:bg-neutral-100"},size:{default:"h-10 px-4",sm:"h-9 px-3 text-xs",lg:"h-11 px-5"}},
  defaultVariants:{variant:"default",size:"default"}
})

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({className,variant,size,asChild=false,...props}:ButtonProps){
  const Comp=asChild?Slot:"button"
  return <Comp data-slot="button" className={cn(buttonVariants({variant,size,className}))} {...props}/>
}
