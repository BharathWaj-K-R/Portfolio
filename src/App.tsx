import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { ArrowUpRight, Check, Download, ExternalLink, Github, Linkedin, Mail, Menu, X } from "lucide-react"
import { ContactSystem } from "./components/ContactSystem"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const photoUrl = new URL("../photo.png", import.meta.url).href
const resumeUrl = new URL("../resume.pdf", import.meta.url).href

const projects = [
  {
    id: "visionbridge",
    name: "VisionBridge",
    type: "Flagship system",
    category: "AI / ML",
    headline: "Signer-adaptive Indian Sign Language translation.",
    summary: "A pose + facial-expression pipeline that keeps a pretrained backbone frozen and learns a compact signer-specific adapter for personalization.",
    stack: ["Python", "PyTorch", "Transformers", "FastAPI"],
    status: "Deployed",
    statusDetail: "Frontend + backend live · end-to-end verification in progress",
    github: "https://github.com/BharathWaj-K-R/VisionBridge",
    demo: "https://visionbridge-2c7h.onrender.com",
    evidence: ["Base model + adapter architecture built", "Signer-specific calibration workflow defined", "Frontend and backend deployment exists"],
    next: ["Benchmark signer-to-signer consistency", "Measure calibration time", "Measure inference latency on the deployed path"],
    architecture: [
      ["Capture", "Video becomes the raw signer sequence."],
      ["Pose + face", "Extract manual and expression/context signals."],
      ["Preprocess", "Normalize and package the sequence for inference."],
      ["BridgeAdapter", "Personalize with a small trainable module while the backbone stays frozen."],
      ["Translation", "The adapted model produces the sentence."],
    ],
    decisions: [
      ["Freeze the backbone", "Personalization should not require a full-model retrain."],
      ["Use an adapter", "A small trainable surface keeps adaptation cheaper and easier to reason about."],
      ["Fuse pose + face", "Sign meaning can depend on both manual configuration and expression/context."],
    ],
  },
  {
    id: "reforge",
    name: "ReForge",
    type: "Deployed system",
    category: "AI / Backend",
    headline: "AI code review with independent validation.",
    summary: "A FastAPI service that separates analysis from validation and keeps quality scoring deterministic instead of asking the model to grade itself.",
    stack: ["FastAPI", "Groq", "Llama 3.3", "Render"],
    status: "Deployed",
    statusDetail: "Health checks · graceful degradation · deterministic scoring",
    github: "https://github.com/BharathWaj-K-R/Re_Forge",
    demo: "https://re-forge.onrender.com/",
    evidence: ["Independent analysis and validation roles", "Deterministic scoring logic", "Deployment + health checks", "Fallback path when the model call fails"],
    next: ["Expand regression coverage", "Add benchmark fixtures", "Track failure classes over time"],
    architecture: [
      ["Repository input", "Source code enters the review pipeline."],
      ["Analysis agent", "The model identifies likely defects and improvements."],
      ["Validation agent", "A separate role re-checks findings."],
      ["Deterministic scoring", "Fixed logic turns validated findings into a stable score."],
      ["API response", "The backend returns a predictable result with fallback behavior."],
    ],
    decisions: [
      ["Separate validation", "A model should not be the sole judge of its own output."],
      ["Deterministic scoring", "A score should be reproducible and explainable."],
      ["Graceful degradation", "External model failures should be handled as a normal system state."],
    ],
  },
  {
    id: "interview",
    name: "AI Interview Preparation",
    type: "Application",
    category: "Full Stack",
    headline: "Resume-aware interview practice with an offline fallback.",
    summary: "A Flask application that parses resumes, generates targeted questions, evaluates answers with an LLM, and keeps working with heuristic scoring when no model key is available.",
    stack: ["Flask", "Python", "LLM APIs", "Docker"],
    status: "Built",
    demo: undefined,
    statusDetail: "Auth · migrations · rate-limited routes · fallback path",
    github: "https://github.com/BharathWaj-K-R/Ai-Interview-preparation",
    evidence: ["PDF/DOCX resume parsing", "Authentication and database migrations", "LLM evaluation route", "Heuristic fallback path"],
    architecture: [
      ["Resume", "Candidate context becomes structured input."],
      ["Question generator", "The system creates skill-specific interview questions."],
      ["Answer evaluator", "The model evaluates answers when configured."],
      ["Heuristic fallback", "A local evaluation path keeps the product useful without the API."],
      ["Web app", "Authentication, migrations, and rate limits surround the workflow."],
    ],
    decisions: [
      ["Resume-aware prompts", "Questions grounded in the actual candidate reveal more than generic prompts."],
      ["Fallback path", "The application remains useful when an external model is unavailable."],
      ["Rate limiting", "External model calls are a resource boundary that needs explicit control."],
    ],
  },
  {
    id: "stress",
    name: "Stress Detection Using Handwriting",
    type: "Exploratory system",
    category: "AI / ML",
    headline: "Offline three-class handwriting classifier.",
    summary: "An educational Streamlit application using HOG features and a Random Forest classifier for Low / Medium / High exploratory stress classes on a small dataset.",
    stack: ["Python", "Streamlit", "HOG", "Random Forest"],
    status: "Educational",
    demo: undefined,
    statusDetail: "Offline inference · non-clinical scope",
    github: "https://github.com/BharathWaj-K-R/Stress-level-Detection",
    evidence: ["30-sample dataset", "Three output classes", "Image-quality checks", "Corrected-sample review path"],
    architecture: [
      ["Image", "Handwriting sample enters the local pipeline."],
      ["Quality check", "Input quality is checked before feature extraction."],
      ["HOG features", "Visual structure becomes a compact representation."],
      ["Random Forest", "The classifier predicts one exploratory class."],
      ["Review loop", "Predictions can be logged and corrected."],
    ],
    decisions: [
      ["Use HOG", "A compact classical representation keeps the experiment lightweight."],
      ["Run offline", "No external model service is required for inference."],
      ["Keep the scope educational", "A small dataset cannot justify clinical claims."],
    ],
  },
] as const

const stack = [
  { title: "Languages", items: ["Java", "Python", "JavaScript", "SQL"] },
  { title: "Backend", items: ["FastAPI", "Flask", "REST APIs"] },
  { title: "AI systems", items: ["PyTorch", "Transformers", "LLM APIs", "Computer Vision"] },
  { title: "Frontend", items: ["React", "TypeScript", "HTML", "CSS"] },
  { title: "Data", items: ["MySQL", "MongoDB"] },
  { title: "Infrastructure", items: ["Git", "GitHub", "Docker", "Linux", "Render"] },
]

const nav = ["about", "work", "contact"] as const
type Project = typeof projects[number]

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]")
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.dataset.revealed = "true")
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ;(entry.target as HTMLElement).dataset.revealed = "true"
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}

function Button({ href, children, secondary = false, onClick, type = "button" }: { href?: string; children: ReactNode; secondary?: boolean; onClick?: () => void; type?: "button" | "submit" }) {
  const className = \`ink-button\${secondary ? " ink-button--secondary" : ""}\`
  if (href) return <a className={className} href={href} onClick={onClick}>{children}</a>
  return <button className={className} onClick={onClick} type={type}>{children}</button>
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="ink-tag">{children}</span>
}

function SectionHeader({ number, title, intro }: { number: string; title: string; intro?: string }) {
  return <header className="section-header" data-reveal>
    <span className="section-number">{number}</span>
    <div>
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  </header>
}

function NavLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button className={\`nav-link\${active ? " is-active" : ""}\`} aria-current={active ? "location" : undefined} onClick={onClick}>{label}</button>
}

function CaseFile({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  return <article className={\`case-file\${index === 0 ? " case-file--lead" : ""}\`} data-reveal>
    <div className="case-file__top">
      <span className="case-file__number">FILE {String(index + 1).padStart(2, "0")}</span>
      <span className="case-file__status">{project.status}</span>
    </div>
    <div className="case-file__body">
      <div>
        <Tag>{project.category}</Tag>
        <h3>{project.name}</h3>
        <p className="case-file__problem">{project.headline}</p>
        <p className="case-file__summary">{project.summary}</p>
      </div>
      <dl className="case-file__facts">
        <div><dt>Role</dt><dd>{project.type}</dd></div>
        <div><dt>Result</dt><dd>{project.statusDetail}</dd></div>
        <div><dt>Stack</dt><dd><span className="tag-list">{project.stack.map((item) => <Tag key={item}>{item}</Tag>)}</span></dd></div>
      </dl>
    </div>
    <div className="case-file__footer">
      <Button onClick={onOpen}>Open case file <ArrowUpRight size={15} /></Button>
      <div className="case-file__links">
        {project.github && <a href={project.github} target="_blank" rel="noreferrer">Source <Github size={14} /></a>}
        {project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Live <ExternalLink size={14} /></a>}
      </div>
    </div>
    <span className="halftone" aria-hidden="true" />
  </article>
}

function CaseStudy({ project, open, onOpenChange }: { project: Project; open: boolean; onOpenChange: (value: boolean) => void }) {
  const [step, setStep] = useState(0)
  useEffect(() => { if (!open) setStep(0) }, [open])
  const selected = project.architecture[step]
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="noir-dialog">
      <DialogHeader>
        <span className="section-number">FILE {project.id.toUpperCase()}</span>
        <DialogTitle>{project.name}</DialogTitle>
        <DialogDescription>{project.summary}</DialogDescription>
      </DialogHeader>
      <div className="case-study-grid">
        <div className="case-study-steps">
          {project.architecture.map(([name], index) => <button key={name} className={index === step ? "is-active" : ""} onClick={() => setStep(index)}><span>{String(index + 1).padStart(2, "0")}</span>{name}</button>)}
        </div>
        <div className="case-study-detail"><span>ARCHITECTURE NODE</span><h3>{selected[0]}</h3><p>{selected[1]}</p></div>
      </div>
      <div className="case-study-lists">
        <div><span>DECISIONS</span>{project.decisions.map(([title, body]) => <p key={title}><Check size={14} /> <b>{title}</b> {body}</p>)}</div>
        <div><span>EVIDENCE</span>{project.evidence.map((item) => <p key={item}><Check size={14} />{item}</p>)}</div>
      </div>
    </DialogContent>
  </Dialog>
}

export default function App() {
  useReveal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState<(typeof nav)[number]>("about")
  const [caseStudyId, setCaseStudyId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id as (typeof nav)[number])
    }), { rootMargin: "-35% 0px -55% 0px" })
    nav.map((id) => document.getElementById(id)).filter(Boolean).forEach((node) => observer.observe(node!))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  const selectedProject = projects.find((project) => project.id === caseStudyId) ?? projects[0]

  return <div className="ink-page">
    <header className="ink-nav">
      <div className="ink-container ink-nav__inner">
        <button className="monogram" onClick={() => scrollTo("about")} aria-label="Back to top">BW</button>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
          <div className="ink-nav__links">
            {nav.map((id) => <NavLink key={id} label={id === "about" ? "About" : id === "work" ? "Selected Work" : "Contact"} active={active === id} onClick={() => scrollTo(id)} />)}
          </div>
          <a className="nav-resume" href={resumeUrl} target="_blank" rel="noreferrer"><Download size={13} /> Résumé</a>
        </nav>
        <button className="nav-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>

    <main>
      <section id="about" className="ink-hero">
        <div className="ink-container ink-hero__grid">
          <div className="ink-hero__copy" data-reveal>
            <span className="case-label">CASE FILE · BHARATH WAJ K R</span>
            <h1>I build AI systems that work when the happy path ends.</h1>
            <p>Applied AI, backend systems, and full-stack products with explicit trade-offs, failure paths, and deployable architecture.</p>
            <div className="ink-hero__actions">
              <Button href="#work">Inspect the systems <ArrowUpRight size={15} /></Button>
              <a className="ink-text-link" href={resumeUrl} target="_blank" rel="noreferrer">Résumé <Download size={14} /></a>
            </div>
          </div>
          <figure className="ink-portrait" data-reveal>
            <div className="ink-portrait__image"><img src="/photo.webp" onError={(event) => { const image = event.currentTarget; if (image.dataset.fallback !== "true") { image.dataset.fallback = "true"; image.src = photoUrl } }} alt="Portrait of Bharath Waj K R" width="384" height="384" fetchPriority="high" decoding="async" /></div>
            <figcaption>V.S.B. Engineering College · 2023–2027 · Dindigul, Tamil Nadu</figcaption>
          </figure>
        </div>
      </section>

      <section id="work" className="ink-section ink-work">
        <div className="ink-container">
          <SectionHeader number="01 · SELECTED WORK" title="Systems, not a gallery." intro="Not galleries. Technical stories: problem, architecture, decisions, evidence, and what comes next." />
          <div className="case-files">{projects.map((project, index) => <CaseFile key={project.id} project={project} index={index} onOpen={() => setCaseStudyId(project.id)} />)}</div>
        </div>
      </section>

      <section className="ink-section ink-about">
        <div className="ink-container">
          <SectionHeader number="02 · ABOUT" title="Evidence before adjectives." intro="The repository and deployment are part of the portfolio. Claims that are still assumptions are labeled as assumptions." />
          <div className="about-grid">
            <div className="about-copy" data-reveal>
              <p>Demos are easy. Failure is hard.</p>
              <p>I care less about whether an AI demo works once and more about what happens after the first unexpected input.</p>
              <div className="about-principles">
                <div><span>01</span><b>Reliability</b><p>Design the fallback before the outage. ReForge treats model failure as a normal system state.</p></div>
                <div><span>02</span><b>Adaptability</b><p>Change the smallest possible surface. VisionBridge personalizes with an adapter instead of retraining the backbone.</p></div>
                <div><span>03</span><b>Determinism</b><p>AI can generate candidates; system logic should decide what gets shipped.</p></div>
              </div>
            </div>
            <div className="skills" data-reveal>
              <span className="case-label">CAPABILITY MAP</span>
              {stack.slice(0, 4).map((group) => <div className="skill-group" key={group.title}><h3>{group.title}</h3><div className="tag-list">{group.items.slice(0, 5).map((item) => <Tag key={item}>{item}</Tag>)}</div></div>)}
            </div>
          </div>
        </div>
      </section>

      <ContactSystem />

      <section className="ink-section ink-contact" aria-labelledby="contact-note">
        <div className="ink-container ink-contact__grid" data-reveal>
          <div><span className="case-label">03 · CONTACT</span><h2 id="contact-note">Looking for difficult problems.</h2></div>
          <div className="contact-links"><a href="#contact"><Mail size={16} />Email via contact workflow</a><a href="https://www.linkedin.com/in/bharath-waj-k-r/" target="_blank" rel="noreferrer"><Linkedin size={16} />LinkedIn</a><a href="https://github.com/BharathWaj-K-R" target="_blank" rel="noreferrer"><Github size={16} />GitHub</a></div>
        </div>
      </section>
    </main>

    <footer className="ink-footer"><div className="ink-container"><span>© 2026 Bharath Waj K R</span><span>Java · Python · FastAPI · AI/ML · Docker</span></div></footer>
    {caseStudyId && <CaseStudy project={selectedProject} open={Boolean(caseStudyId)} onOpenChange={(value) => !value && setCaseStudyId(null)} />}
  </div>
}