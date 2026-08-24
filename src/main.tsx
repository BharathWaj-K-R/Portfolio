import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { TooltipProvider } from "@/components/ui/tooltip"
import App from "./App"
import { StackDetails } from "./components/StackDetails"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider delayDuration={120}>
      <App />
      <StackDetails />
    </TooltipProvider>
  </StrictMode>,
)
