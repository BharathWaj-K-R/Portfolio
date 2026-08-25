import { createRoot } from "react-dom/client"
import { ArrowUpRight, Code2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const profileUrl = "https://leetcode.com/u/Bharath_Waj_K_R/"
const statsUrl = "https://leetcard.jacoblin.cool/Bharath_Waj_K_R?theme=light&colors=fffdf9,fbf7f1,2b211b,6f6258,9a5f43,74442f,dfd2c4,2b211b&font=Inter&border=1&radius=2&animation=false&width=500&height=200"

function LeetCodeStatus() {
  return (
    <section className="leetcode-section">
      <div className="container-wide leetcode-shell">
        <div className="leetcode-copy">
          <div className="eyebrow">Problem solving</div>
          <div>
            <h2>LeetCode / DSA practice</h2>
            <p>Regular problem solving to strengthen algorithms, data structures, and interview fundamentals.</p>
          </div>
          <Button asChild size="sm" variant="outline" className="leetcode-link">
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              Open profile <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
        <a className="leetcode-card-link" href={profileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Bharath Waj K R LeetCode profile">
          <img
            src={statsUrl}
            alt="Bharath Waj K R LeetCode statistics"
            loading="lazy"
            decoding="async"
            width="500"
            height="200"
          />
          <span className="leetcode-card-hint"><Code2 className="size-4" />Live profile stats <ExternalLink className="size-3.5" /></span>
        </a>
      </div>
    </section>
  )
}

export function mountLeetCodeStatus() {
  if (document.getElementById("leetcode-status-mount")) return
  const stackSection = document.getElementById("stack")
  if (!stackSection) return
  const mount = document.createElement("div")
  mount.id = "leetcode-status-mount"
  stackSection.after(mount)
  createRoot(mount).render(<LeetCodeStatus />)
}
