import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./App"
import { mountLeetCodeStatus } from "./leetcode-status"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider delayDuration={120}>
      <App />
    </TooltipProvider>
  </StrictMode>,
)

requestAnimationFrame(() => mountLeetCodeStatus())
