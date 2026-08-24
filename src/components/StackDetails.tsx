import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Code2, Server, BrainCircuit, Database, Terminal, LayoutTemplate } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stacks = [
  { icon: Code2, title: "Languages", items: ["Java", "Python", "JavaScript", "SQL"] },
  { icon: Server, title: "Backend", items: ["FastAPI", "Flask", "REST APIs"] },
  { icon: BrainCircuit, title: "AI / ML", items: ["PyTorch", "Transformers", "LLM APIs", "Computer Vision"] },
  { icon: LayoutTemplate, title: "Frontend", items: ["HTML", "CSS", "JavaScript", "React"] },
  { icon: Database, title: "Data", items: ["MySQL", "MongoDB"] },
  { icon: Terminal, title: "Infrastructure", items: ["Git", "GitHub", "Docker", "Unix / Linux"] },
] as const

export function StackDetails() {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setTarget(document.querySelector("#skills .container-wide"))
  }, [])

  if (!target) return null

  return createPortal(
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stacks.map(({ icon: Icon, title, items }) => (
        <Card key={title} className="h-full border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-black hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-sm">
              <span className="flex size-8 items-center justify-center border border-neutral-200 bg-neutral-50">
                <Icon className="size-4" />
              </span>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item} variant="secondary" className="normal-case tracking-normal">
                {item}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>,
    target,
  )
}
