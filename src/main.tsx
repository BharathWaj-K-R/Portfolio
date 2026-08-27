import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./App"
import { mountLeetCodeStatus } from "./leetcode-status"
import "./index.css"
import "./typography-overrides.css"
import "./creative-refinement.css"
import "./warm-theme.css"
import "./stunning-refinement.css"
import "./leetcode-fallback.css"
import "./field-notebook.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider delayDuration={120}>
      <App />
    </TooltipProvider>
  </StrictMode>,
)

requestAnimationFrame(() => mountLeetCodeStatus())
