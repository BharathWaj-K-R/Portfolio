import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react"
import { ArrowRight, ArrowUpRight, BrainCircuit, Check, ChevronRight, CircleDot, Code2, Command, Database, Download, ExternalLink, Gauge, Github, GitBranch, Layers3, Linkedin, Mail, MapPin, Menu, Search, Server, ShieldCheck, Sparkles, Terminal, Workflow, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const photoUrl = new URL("../photo.png", import.meta.url).href
const resumeUrl = new URL("../resume.pdf", import.meta.url).href

const projects = [
  {
    id: "silentbridge",
    name: "SilentBridge",
    category: "AI / ML",
    tags: ["Computer Vision", "Transformers", "FastAPI"],
    headline: "Signer-adaptive Indian Sign Language translation.",
    summary: "A pose + facial-expression fusion pipeline that keeps a pretrained backbone frozen and learns a small signer-specific BridgeAdapter for personalization.",
    stack: ["Python", "PyTorch", "Transformers", "FastAPI"],
    status: "In progress",
    statusTone: "Architecture built · training/evaluation ongoing",
    target: "Targets: <5 min calibration · <500ms inference · <2% adapter size",
    evidence: ["Base model + adapter architecture built", "Signer-specific calibration workflow defined", "Live frontend/backend deployment exists"],
    github: "https://github.com/BharathWaj-K-R/SilentBridge",
    demo: "https://silentbridge-frontend.onrender.com",
    architecture: [
      ["Capture", "Video input provides the raw signer sequence."],
      ["Pose + face", "Extract pose and facial-expression features before sequence processing."],
      ["Preprocess", "Normalize and package the sequence into the model-ready representation."],
      ["BridgeAdapter", "Learn a small signer-specific module while the base transformer stays frozen."],
      ["Translator", "The adapted model produces the translated sentence."],
    ],
    decisions: [
      ["Why freeze the backbone?", "Signer adaptation should be cheap and practical rather than requiring a full model retrain."],
      ["Why an adapter?", "A compact trainable module localizes personalization while preserving the pretrained representation."],
      ["Why pose + face?", "The system needs both manual configuration and expression/context signals from the signer."],
    ],
  },
  {
    id: "reforge",
    name: "ReForge",
    category: "AI / Backend",
    tags: ["LLM", "Agents", "FastAPI", "Deployment"],
    headline: "AI code review with independent validation.",
    summary: "A FastAPI service that separates analysis from validation and keeps quality scoring deterministic instead of asking the model to grade itself.",
    stack: ["FastAPI", "Groq", "Llama 3.3", "Render"],
    status: "Deployed",
    statusTone: "Health checks + graceful degradation when the LLM call fails",
    target: "Design goal: validated findings and deterministic scoring",
    evidence: ["Independent analysis and validation roles", "Deterministic scoring logic", "Render deployment + health checks", "Fallback path when the model call fails"],
    github: "https://github.com/BharathWaj-K-R/Re_Forge",
    demo: "https://re-forge.onrender.com/",
    architecture: [
      ["Repository input", "Source code enters the review pipeline."],
      ["Analysis agent", "The model identifies likely defects, smells, and improvements."],
      ["Validation agent", "A separate role re-checks the findings instead of trusting the first model output."],
      ["Deterministic scoring", "Fixed logic turns validated findings into a stable quality score."],
      ["API response", "The backend returns the reviewed result with graceful fallback behavior."],
    ],
    decisions: [
      ["Why separate validation?", "A model should not be the sole judge of its own output when hallucination is a known failure mode."],
      ["Why deterministic scoring?", "Scores should be reproducible and explainable rather than sampled from model opinion."],
      ["Why graceful degradation?", "The product should fail predictably when an external LLM dependency is unavailable."],
    ],
  },
  {
    id: "interview",
    name: "AI Interview Preparation",
    category: "Full Stack",
    tags: ["Flask", "LLM", "Docker", "Auth"],
    headline: "Resume-aware interview practice with an offline fallback.",
    summary: "A Flask application that parses resumes, generates targeted questions, evaluates answers with an LLM, and keeps working with heuristic scoring when no model key is available.",
    stack: ["Flask", "Python", "LLM APIs", "Docker"],
    status: "Built",
    statusTone: "Auth · migrations · rate-limited routes · Docker/compose",
    target: "Design goal: useful interview practice even without a live model call",
    evidence: ["PDF/DOCX resume parsing", "Authentication and database migrations", "LLM evaluation route", "Heuristic fallback path"],
    github: "https://github.com/BharathWaj-K-R/Ai-Interview-preparation",
    architecture: [
      ["Resume", "A PDF/DOCX upload becomes structured candidate context."],
      ["Question generator", "The system creates skill-specific interview questions."],
      ["Answer evaluator", "The LLM scores the candidate answer when configured."],
      ["Heuristic fallback", "A local evaluation path keeps the product usable without an API key."],
      ["Web app", "Authentication, migrations, and rate limits surround the core workflow."],
    ],
    decisions: [
      ["Why a fallback?", "Availability matters; an AI product that dies without one external key is brittle."],
      ["Why resume-aware prompts?", "Generic questions tell less about a candidate than questions grounded in their actual experience."],
      ["Why rate-limit the model route?", "External model calls are a resource boundary that needs explicit control."],
    ],
  },
  {
    id: "stress",
    name: "Stress Detection Using Handwriting",
    category: "AI / ML",
    tags: ["Streamlit", "HOG", "Random Forest", "Offline"],
    headline: "Offline three-class handwriting classifier.",
    summary: "An educational Streamlit application using HOG features and a Random Forest classifier for Low / Medium / High stress classes on a 30-sample dataset.",
    stack: ["Python", "Streamlit", "HOG", "Random Forest"],
    status: "Educational",
    statusTone: "Non-clinical · offline inference · review loop",
    target: "Scope: exploratory signal detection, not diagnosis",
    evidence: ["30-sample dataset", "Three output classes", "Image-quality checks", "Corrected-sample review path"],
    github: "https://github.com/BharathWaj-K-R/Stress-level-Detection",
    architecture: [
      ["Image", "Handwriting sample enters the local inference path."],
      ["Quality check", "Input is checked before feature extraction."],
      ["HOG features", "Handwriting structure becomes a compact feature vector."],
      ["Random Forest", "The classifier predicts one of three exploratory classes."],
      ["Review loop", "Predictions can be logged and corrected samples revisited."],
    ],
    decisions: [
      ["Why HOG?", "The project explores a compact classical feature representation rather than requiring a large neural network."],
      ["Why offline?", "The complete inference path can run locally without an external model service."],
      ["Why label it educational?", "A small exploratory dataset cannot support clinical claims."],
    ],
  },
] as const

const categories = ["All", "AI / ML", "AI / Backend", "Full Stack"] as const
const navItems = ["about", "now", "projects", "skills", "experience", "certs", "contact"] as const

const certs = [
  ["Programming using Java", "Infosys Springboard", "Jun 2025", "certs/programming-java.pdf"],
  ["Java Foundation Certification", "Infosys Springboard", "Jul 2025", "certs/java-foundation.pdf"],
  ["Cloud Technologies", "Infosys Springboard", "Jan 2025", "certs/cloud-technologies.pdf"],
  ["Microsoft Excel for Data Analyst", "Infosys Springboard", "Jan 2025", "certs/excel-data-analyst.pdf"],
  ["Introduction to Generative AI Studio", "Google Cloud", "Feb 2026", "certs/generative-ai.pdf"],
  ["Introduction to IoT and Digital Transformation", "Cisco Networking Academy", "Feb 2026", "certs/iot-digital-transformation.pdf"],
  ["Web Development Training", "Appin Technology", "", ""],
] as const

const stackGroups: { title: string; icon: ElementType; items: string[]; detail: string }[] = [
  { title: "Languages", icon: Code2, items: ["Java", "Python", "JavaScript", "SQL"], detail: "Core languages used across coursework and projects." },
  { title: "Backend", icon: Server, items: ["FastAPI", "Flask", "REST APIs"], detail: "API design, service boundaries, and backend application work." },
  { title: "AI / ML", icon: BrainCircuit, items: ["PyTorch", "Transformers", "LLM APIs", "Computer Vision"], detail: "Applied AI systems, model integration, and computer-vision pipelines." },
  { title: "Frontend", icon: Layers3, items: ["HTML", "CSS", "JavaScript", "React"], detail: "Responsive web interfaces and React-based application work." },
  { title: "Data", icon: Database, items: ["MySQL", "MongoDB"], detail: "Relational and document-oriented application data." },
  { title: "Infrastructure", icon: Terminal, items: ["Git", "GitHub", "Docker", "Unix / Linux"], detail: "Version control, containerization, deployment, and command-line workflows." },
]

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in")
      })
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" })
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function Counter({ value, label }: { value: string; label: string }) {
  const [shown, setShown] = useState("0")
  useEffect(() => {
    const numeric = Number(value.replace(/[^0-9.]/g, ""))
    if (!Number.isFinite(numeric)) return
    let frame = 0
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / 700)
      const eased = 1 - Math.pow(1 - progress, 3)
      setShown(value.includes(".") ? (numeric * eased).toFixed(2) : Math.round(numeric * eased).toString())
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    const timer = window.setTimeout(() => { frame = requestAnimationFrame(animate) }, 120)
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame) }
  }, [value])
  return <div className="metric"><div className="font-serif text-3xl font-semibold tracking-tight">{shown}</div><div className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-neutral-500">{label}</div></div>
}

function CaseStudyDialog({ project, open, onOpenChange }: { project: typeof projects[number]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(0)
  const selected = project.architecture[step]
  useEffect(() => { if (!open) setStep(0) }, [open])
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl overflow-hidden p-0">
      <div className="border-b border-neutral-200 px-6 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-2"><Badge>{project.category}</Badge><Badge variant="secondary">{project.status}</Badge></div>
        <DialogHeader className="mt-3"><DialogTitle className="font-serif text-3xl tracking-tight md:text-4xl">{project.name}</DialogTitle><DialogDescription className="max-w-3xl text-sm leading-6">{project.summary}</DialogDescription></DialogHeader>
      </div>
      <Tabs defaultValue="overview" className="px-6 pb-7 pt-2 md:px-8">
        <TabsList className="w-full justify-start overflow-x-auto"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="architecture">Architecture</TabsTrigger><TabsTrigger value="decisions">Decisions</TabsTrigger><TabsTrigger value="evidence">Evidence</TabsTrigger></TabsList>
        <TabsContent value="overview" className="mt-7">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoBlock label="Current state" value={project.statusTone} />
            <InfoBlock label="Engineering target" value={project.target} />
            <InfoBlock label="Stack" value={project.stack.join(" · ")} />
          </div>
          <div className="mt-7 flex flex-wrap gap-2">{project.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
        </TabsContent>
        <TabsContent value="architecture" className="mt-7">
          <div className="grid gap-6 md:grid-cols-[.8fr_1.2fr]">
            <div className="space-y-2">
              {project.architecture.map(([name], index) => <button key={name} onClick={() => setStep(index)} className={`architecture-step w-full text-left ${index === step ? "active" : ""}`}><span className="step-index">0{index + 1}</span><span>{name}</span><ArrowRight className="ml-auto size-4 opacity-50" /></button>)}
            </div>
            <Card className="bg-neutral-50 shadow-none"><CardHeader><CardTitle>{selected[0]}</CardTitle><CardDescription>{selected[1]}</CardDescription></CardHeader><CardContent><div className="flex items-center gap-3 text-xs text-neutral-500"><CircleDot className="size-4 text-black" />Interactive architecture step</div></CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="decisions" className="mt-7"><div className="grid gap-4 md:grid-cols-3">{project.decisions.map(([title, body]) => <Card key={title} className="shadow-none"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-neutral-600">{body}</p></CardContent></Card>)}</div></TabsContent>
        <TabsContent value="evidence" className="mt-7">
          <div className="grid gap-3">{project.evidence.map((item) => <div key={item} className="flex items-start gap-3 border border-neutral-200 px-4 py-3 text-sm"><Check className="mt-0.5 size-4 shrink-0" />{item}</div>)}</div>
          <div className="mt-4 border-l-2 border-black bg-neutral-50 px-4 py-3 text-sm leading-6">{project.target}</div>
        </TabsContent>
        <div className="mt-7 flex flex-wrap gap-2 border-t border-neutral-200 pt-6">{project.github && <Button asChild size="sm"><a href={project.github} target="_blank" rel="noopener noreferrer"><Github className="size-4" />Source</a></Button>}{project.demo && <Button asChild variant="outline" size="sm"><a href={project.demo} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Live demo</a></Button>}</div>
      </Tabs>
    </DialogContent>
  </Dialog>
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return <div className="border border-neutral-200 p-4"><div className="text-[10px] font-bold uppercase tracking-[.12em] text-neutral-500">{label}</div><p className="mt-2 text-sm leading-6">{value}</p></div>
}

function CommandMenu({ onJump, onProject }: { onJump: (id: string) => void; onProject: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(true) }
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
  const projectResults = useMemo(() => projects.filter((p) => `${p.name} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query])
  const close = () => { setOpen(false); setQuery("") }
  const jump = (id: string) => { close(); onJump(id) }
  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery("") }}>
    <button onClick={() => setOpen(true)} className="command-trigger hidden items-center gap-2 border border-neutral-200 px-3 py-1.5 text-[11px] font-medium text-neutral-500 transition hover:border-black hover:text-black md:flex"><Search className="size-3.5" />Search<span className="ml-1 flex items-center gap-1"><kbd>Ctrl</kbd><kbd>K</kbd></span></button>
    <DialogContent className="max-w-xl gap-0 p-0 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4"><Search className="size-4 text-neutral-400"/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Jump to a section or project..." className="h-14 flex-1 bg-transparent text-sm outline-none" /></div>
      <div className="max-h-[62vh] overflow-y-auto p-2">
        <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[.14em] text-neutral-400">Navigation</div>
        <div className="grid gap-1">{navItems.map((id) => <button key={id} onClick={() => jump(id)} className="command-item"><span>{id[0].toUpperCase()+id.slice(1)}</span><ArrowRight className="size-3.5 opacity-40" /></button>)}</div>
        <div className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[.14em] text-neutral-400">Projects</div>
        <div className="grid gap-1">{projectResults.length ? projectResults.map((project) => <button key={project.id} onClick={() => { close(); onProject(project.id) }} className="command-item"><span><b>{project.name}</b><span className="ml-2 text-neutral-400">{project.category}</span></span><ArrowUpRight className="size-3.5 opacity-40" /></button>) : <div className="px-3 py-4 text-sm text-neutral-500">No matching project.</div>}</div>
      </div>
    </DialogContent>
  </Dialog>
}

export default function App() {
  useReveal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState("about")
  const [category, setCategory] = useState<(typeof categories)[number]>("All")
  const [query, setQuery] = useState("")
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentSignal, setCurrentSignal] = useState(0)
  const [caseStudyId, setCaseStudyId] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)), { rootMargin: "-35% 0px -55% 0px" })
    navItems.map((id) => document.getElementById(id)).filter(Boolean).forEach((element) => observer.observe(element!))
    return () => { window.removeEventListener("scroll", onScroll); observer.disconnect() }
  }, [])

  useEffect(() => { const timer = window.setInterval(() => setCurrentSignal((value) => (value + 1) % 3), 2600); return () => window.clearInterval(timer) }, [])

  const scrollTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }) }
  const selectedProject = projects.find((project) => project.id === caseStudyId) ?? projects[0]
  const filteredProjects = useMemo(() => projects.filter((project) => {
    const categoryMatch = category === "All" || project.category === category
    const q = query.trim().toLowerCase()
    const searchMatch = !q || `${project.name} ${project.category} ${project.tags.join(" ")} ${project.stack.join(" ")} ${project.summary}`.toLowerCase().includes(q)
    return categoryMatch && searchMatch
  }), [category, query])

  const signals = ["Building", "Shipping", "Learning"]
  return <div className="min-h-screen bg-white text-black">
    <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
    <header className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white/90 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <button onClick={() => scrollTo("about")} className="font-serif text-lg font-semibold tracking-tight">Bharath Waj K R</button>
        <nav className={`${menuOpen ? "translate-y-0" : "-translate-y-[140%] md:translate-y-0"} absolute inset-x-0 top-16 border-b bg-white p-5 transition-transform md:static md:block md:border-0 md:p-0`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
            {navItems.map((id) => <button key={id} onClick={() => scrollTo(id)} className={`nav-link ${active === id ? "active" : ""}`}>{id[0].toUpperCase() + id.slice(1)}</button>)}
            <CommandMenu onJump={scrollTo} onProject={(id) => { scrollTo("projects"); window.setTimeout(() => setCaseStudyId(id), 350) }} />
            <Button asChild size="sm"><a href={resumeUrl} target="_blank" rel="noopener noreferrer"><Download className="size-3.5" />Résumé</a></Button>
          </div>
        </nav>
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</Button>
      </div>
    </header>

    <main>
      <section id="about" className="relative overflow-hidden scroll-mt-16 py-16 md:py-28">
        <div className="hero-grid absolute inset-0 -z-0" />
        <div className="container-wide relative z-10 grid items-center gap-12 lg:grid-cols-[1fr_.55fr]">
          <div className="reveal">
            <div className="mb-5 flex flex-wrap items-center gap-2"><Badge variant="outline" className="gap-2"><Sparkles className="size-3" />AI · Backend · Full Stack</Badge><span className="live-chip"><span className="live-dot" />{signals[currentSignal]}</span></div>
            <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[.95] tracking-[-.055em] sm:text-6xl lg:text-7xl">I build AI systems that survive beyond the demo.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">Software engineer focused on applied AI, backend systems, and full-stack products — with an emphasis on explicit trade-offs, failure paths, and deployable architecture.</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500"><span className="font-semibold text-black">Bharath Waj K R</span><span>V.S.B. Engineering College</span><span>2023–2027</span><span className="inline-flex items-center gap-1"><MapPin className="size-3" />Dindigul, Tamil Nadu</span></div>
            <div className="mt-7 flex flex-wrap gap-2"><Button asChild><a href="#projects">Explore projects <ChevronRight className="size-4" /></a></Button><Button asChild variant="outline"><a href={resumeUrl} target="_blank" rel="noopener noreferrer">Résumé <Download className="size-4" /></a></Button><Button asChild variant="outline"><a href="https://github.com/BharathWaj-K-R" target="_blank" rel="noopener noreferrer"><Github className="size-4" />GitHub</a></Button></div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-neutral-500"><span className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2"><ShieldCheck className="size-3.5 text-black" />Evidence-led project stories</span><span className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2"><GitBranch className="size-3.5 text-black" />Public source code</span></div>
          </div>
          <div className="reveal justify-self-center lg:justify-self-end">
            <div className="relative"><div className="absolute -inset-5 border border-solid border-black/10" /><img src={photoUrl} alt="Portrait of Bharath Waj K R" width="384" height="384" fetchPriority="high" decoding="async" className="relative h-72 w-72 object-cover object-center sm:h-80 sm:w-80 lg:h-96 lg:w-96" /><div className="absolute -bottom-5 -left-5 max-w-[250px] border border-black bg-white px-4 py-3 text-xs font-semibold leading-5 shadow-[10px_10px_0_#000]">Building things that survive contact with reality.</div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50"><div className="container-wide grid grid-cols-2 md:grid-cols-4"><Counter value="8.41" label="CGPA / 10" /><Counter value="2027" label="Expected graduation" /><Counter value="7" label="Certifications" /><Counter value="4" label="Featured systems" /></div></section>

      <section id="now" className="scroll-mt-16 py-16 md:py-20"><div className="container-wide reveal"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow">01 · What I’m building now</div><h2 className="section-title">Current focus</h2></div><Badge variant="outline">Updated with the portfolio</Badge></div><div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["SilentBridge", "Signer-adaptive ISL translation", "AI / ML", "Keep the backbone frozen; personalize the signer with a compact adapter.", "projects"],
          ["ReForge", "Validated AI code review", "AI / Backend", "Separate analysis from validation and keep scoring deterministic.", "projects"],
          ["Interview readiness", "Java · DSA · backend", "Career", "Strengthen the fundamentals underneath the systems I build.", "contact"],
        ].map(([title, sub, tag, body, target]) => <Card key={title} className="now-card"><CardHeader><div className="flex items-center justify-between gap-2"><Badge variant="secondary">{tag}</Badge><ArrowUpRight className="size-4 text-neutral-400" /></div><CardTitle className="mt-4 text-xl">{title}</CardTitle><CardDescription>{sub}</CardDescription></CardHeader><CardContent><p className="text-sm leading-6 text-neutral-600">{body}</p><button onClick={() => scrollTo(target)} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold">Explore <ArrowRight className="size-3.5" /></button></CardContent></Card>)}
      </div></div></section>

      <section id="projects" className="scroll-mt-16 border-y border-neutral-200 bg-neutral-50 py-16 md:py-24"><div className="container-wide reveal"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="eyebrow">02 · Selected work</div><h2 className="section-title">Projects that show how I think</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">Filter by domain, search by technology, and open a case study to inspect the architecture and engineering decisions.</p></div><div className="flex flex-wrap items-center gap-2"><div className="project-search"><Search className="size-3.5 text-neutral-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" aria-label="Search projects" /></div></div></div>
        <Tabs value={category} onValueChange={(value) => setCategory(value as (typeof categories)[number])} className="mt-6"><TabsList className="w-full justify-start overflow-x-auto md:w-auto">{categories.map((value) => <TabsTrigger key={value} value={value}>{value}</TabsTrigger>)}</TabsList><TabsContent value={category} className="mt-0" /></Tabs>
        <div className="mt-7 grid gap-4 lg:grid-cols-2">{filteredProjects.map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0 && category === "All"} onOpen={() => setCaseStudyId(project.id)} />)}</div>
        {!filteredProjects.length && <div className="border border-dashed border-neutral-300 bg-white py-12 text-center text-sm text-neutral-500">No project matches that search.</div>}
      </div></section>

      <section id="skills" className="scroll-mt-16 py-16 md:py-20"><div className="container-wide reveal"><div className="eyebrow">03 · Capability map</div><h2 className="section-title">The stack I reach for</h2><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{stackGroups.map(({ title, icon: Icon, items, detail }) => <Tooltip key={title}><TooltipTrigger asChild><Card className="stack-card"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-3 text-base"><span className="icon-box"><Icon className="size-4" /></span>{title}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} variant="secondary" className="normal-case tracking-normal">{item}</Badge>)}</CardContent></Card></TooltipTrigger><TooltipContent>{detail}</TooltipContent></Tooltip>)}</div></div></section>

      <section id="experience" className="scroll-mt-16 border-y border-neutral-200 bg-neutral-50 py-16 md:py-24"><div className="container-wide reveal"><div className="eyebrow">04 · Experience & education</div><h2 className="section-title">Where I’ve been building</h2><div className="mt-7 border-y border-neutral-200 bg-white"><Accordion type="single" collapsible defaultValue="exp-1"><AccordionItem value="exp-1"><AccordionTrigger><span><b>Web Development Intern</b><span className="ml-2 text-neutral-500">· Appin Technology · 2024</span></span></AccordionTrigger><AccordionContent><p className="pb-4 text-sm leading-6 text-neutral-600">Developed interactive and responsive webpages using HTML, CSS, and JavaScript; improved UI/UX with structured layout and accessible design.</p></AccordionContent></AccordionItem><AccordionItem value="exp-2"><AccordionTrigger><span><b>Team Leader, Smart India Hackathon</b><span className="ml-2 text-neutral-500">· V.S.B. Engineering College</span></span></AccordionTrigger><AccordionContent><p className="pb-4 text-sm leading-6 text-neutral-600">Led a 4-member team, advanced to the second round with a Smart Agriculture solution, before being eliminated.</p></AccordionContent></AccordionItem><AccordionItem value="exp-3"><AccordionTrigger><span><b>B.Tech Artificial Intelligence</b><span className="ml-2 text-neutral-500">· 2023–2027 · CGPA 8.41/10</span></span></AccordionTrigger><AccordionContent><p className="pb-4 text-sm leading-6 text-neutral-600">V.S.B. Engineering College. Prior Higher Secondary (2023) and Secondary (2021) at Akshaya Academy Higher Secondary School — both 80%+.</p></AccordionContent></AccordionItem></Accordion></div></div></section>

      <section id="certs" className="scroll-mt-16 py-16 md:py-20"><div className="container-wide reveal"><div className="flex items-end justify-between gap-4"><div><div className="eyebrow">05 · Credentials</div><h2 className="section-title">Certifications & proof</h2></div><Badge variant="outline">7 records</Badge></div><div className="mt-7 border border-neutral-200 bg-white">{certs.map(([name, org, date, path]) => <div key={name} className="flex flex-col gap-3 border-b border-neutral-200 p-4 last:border-0 md:flex-row md:items-center md:justify-between"><div><div className="text-sm font-semibold">{name}</div><div className="mt-1 text-xs text-neutral-500">{org}{date ? ` · ${date}` : ""}</div></div>{path ? <Button asChild size="sm" variant="outline"><a href={new URL(`../${path}`, import.meta.url).href} target="_blank" rel="noopener noreferrer">View certificate <ExternalLink className="size-3.5" /></a></Button> : <span className="text-[11px] text-neutral-400">Credential listed</span>}</div>)}</div></div></section>

      <section className="border-y border-neutral-200 bg-neutral-50 py-16 md:py-20"><div className="container-wide reveal"><div className="eyebrow">06 · Proof of work</div><h2 className="section-title">Evidence before adjectives</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">Public repositories are the source of truth for the engineering stories above. Open one, inspect the implementation, and judge the claims yourself.</p><div className="mt-7 grid gap-3 md:grid-cols-2">{projects.map((project) => <a key={project.id} href={project.github} target="_blank" rel="noopener noreferrer" className="proof-row"><div><div className="text-sm font-semibold">{project.name}</div><div className="mt-1 text-xs text-neutral-500">{project.category} · public repository</div></div><Github className="size-4" /></a>)}</div><div className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-neutral-200 bg-neutral-200 md:grid-cols-4"><div className="proof-metric"><GitBranch className="size-4" /><b>4</b><span>featured repos</span></div><div className="proof-metric"><ShieldCheck className="size-4" /><b>7</b><span>credentials</span></div><div className="proof-metric"><Gauge className="size-4" /><b>Targets</b><span>clearly labeled</span></div><div className="proof-metric"><Workflow className="size-4" /><b>Live</b><span>deployed systems</span></div></div></div></section>
    </main>

    <footer id="contact" className="scroll-mt-16 bg-black text-white"><div className="container-wide py-20 md:py-28"><div className="reveal"><div className="eyebrow dark">07 · Let’s talk</div><h2 className="mt-3 max-w-5xl font-serif text-5xl font-semibold tracking-[-.04em] md:text-7xl">Open to Software Engineer and Graduate Trainee roles.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400">I’m looking for a team where I can work on real software, contribute from day one, and keep getting better at the engineering underneath the product.</p><div className="mt-8 flex flex-wrap gap-2"><Button asChild className="bg-white text-black hover:bg-neutral-200"><a href="mailto:ravikap0063@gmail.com"><Mail className="size-4" />Email</a></Button><Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-black"><a href="https://www.linkedin.com/in/bharath-waj-k-r/" target="_blank" rel="noopener noreferrer"><Linkedin className="size-4" />LinkedIn</a></Button><Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-black"><a href="https://github.com/BharathWaj-K-R" target="_blank" rel="noopener noreferrer"><Github className="size-4" />GitHub</a></Button><Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-black"><a href={resumeUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4" />Résumé</a></Button></div><div className="mt-10 grid border-y border-white/15 sm:grid-cols-2 lg:grid-cols-4"><div className="border-b border-white/15 p-5 lg:border-b-0 lg:border-r"><div className="text-[10px] uppercase tracking-widest text-neutral-500">Email</div><div className="mt-2 break-all text-sm">ravikap0063@gmail.com</div></div><div className="border-b border-white/15 p-5 lg:border-b-0 lg:border-r"><div className="text-[10px] uppercase tracking-widest text-neutral-500">Phone</div><div className="mt-2 text-sm">+91 99527 53739</div></div><div className="border-b border-white/15 p-5 lg:border-b-0 lg:border-r"><div className="text-[10px] uppercase tracking-widest text-neutral-500">Location</div><div className="mt-2 text-sm">Dindigul, Tamil Nadu, India</div></div><div className="p-5"><div className="text-[10px] uppercase tracking-widest text-neutral-500">Availability</div><div className="mt-2 text-sm">Graduating 2027 · Open now</div></div></div><div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500"><span>© 2026 Bharath Waj K R</span><span>Java · Python · FastAPI · AI/ML · Docker</span></div></div></div></footer>

    {caseStudyId && <CaseStudyDialog project={selectedProject} open={Boolean(caseStudyId)} onOpenChange={(open) => !open && setCaseStudyId(null)} />}
  </div>
}

function ProjectCard({ project, featured, onOpen }: { project: typeof projects[number]; featured: boolean; onOpen: () => void }) {
  return <Card className={`project-card ${featured ? "featured" : ""}`}>
    <CardHeader><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><Badge variant="outline">{project.category}</Badge><Badge variant="secondary">{project.status}</Badge></div><CardTitle className="mt-4 text-2xl md:text-3xl">{project.name}</CardTitle><CardDescription className="mt-2 max-w-xl text-sm leading-6">{project.headline}</CardDescription></div><div className="project-index">{featured ? "01" : "→"}</div></div></CardHeader>
    <CardContent className="flex-1"><div className="flex flex-wrap gap-2">{project.stack.map((item) => <Badge key={item} variant="secondary" className="normal-case tracking-normal">{item}</Badge>)}</div><p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-600">{project.summary}</p><div className="mt-5 border-l-2 border-black bg-neutral-50 px-4 py-3 text-sm font-medium leading-6">{project.statusTone}</div><div className="mt-3 text-xs text-neutral-500">{project.target}</div></CardContent>
    <CardFooter className="justify-between gap-3"><Button onClick={onOpen} variant={featured ? "default" : "outline"} size="sm">Open case study <ArrowUpRight className="size-3.5" /></Button><div className="flex items-center gap-3">{project.github && <Tooltip><TooltipTrigger asChild><a href={project.github} target="_blank" rel="noopener noreferrer" className="icon-link"><Github className="size-4" /></a></TooltipTrigger><TooltipContent>Open source repository</TooltipContent></Tooltip>}{project.demo && <Tooltip><TooltipTrigger asChild><a href={project.demo} target="_blank" rel="noopener noreferrer" className="icon-link"><ExternalLink className="size-4" /></a></TooltipTrigger><TooltipContent>Open live demo</TooltipContent></Tooltip>}</div></CardFooter>
  </Card>
}
