import { useEffect, useMemo, useState } from "react"
import { ArrowRight, ArrowUpRight, BrainCircuit, Check, ChevronDown, Code2, Database, Download, ExternalLink, Github, GitBranch, Layers3, Linkedin, Mail, Menu, Search, Server, ShieldCheck, Sparkles, Terminal, Workflow, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    status: "In progress",
    statusDetail: "Architecture built · evaluation in progress",
    github: "https://github.com/BharathWaj-K-R/VisionBridge",
    demo: "https://silentbridge-frontend.onrender.com",
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
  { title: "Languages", icon: Code2, items: ["Java", "Python", "JavaScript", "SQL"] },
  { title: "Backend", icon: Server, items: ["FastAPI", "Flask", "REST APIs"] },
  { title: "AI systems", icon: BrainCircuit, items: ["PyTorch", "Transformers", "LLM APIs", "Computer Vision"] },
  { title: "Frontend", icon: Layers3, items: ["React", "TypeScript", "HTML", "CSS"] },
  { title: "Data", icon: Database, items: ["MySQL", "MongoDB"] },
  { title: "Infrastructure", icon: Terminal, items: ["Git", "GitHub", "Docker", "Linux", "Render"] },
]

const nav = ["about", "now", "systems", "principles", "stack", "proof", "contact"] as const

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in"))
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" })
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}

function ProofStrip() {
  const proofs = [
    ["8.41", "CGPA / 10"],
    ["4", "Featured systems"],
    ["2", "Live deployments"],
    ["7", "Credentials"],
  ]
  return <section className="border-y border-neutral-200 bg-neutral-50"><div className="container-wide grid grid-cols-2 md:grid-cols-4">{proofs.map(([value, label]) => <div key={label} className="proof-number"><strong>{value}</strong><span>{label}</span></div>)}</div></section>
}

function CaseStudy({ project, open, onOpenChange }: { project: typeof projects[number]; open: boolean; onOpenChange: (value: boolean) => void }) {
  const [step, setStep] = useState(0)
  useEffect(() => { if (!open) setStep(0) }, [open])
  const selected = project.architecture[step]
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="case-study max-w-4xl overflow-hidden p-0">
      <div className="border-b border-neutral-200 px-6 py-6 md:px-8">
        <div className="flex flex-wrap gap-2"><Badge>{project.category}</Badge><Badge variant="secondary">{project.status}</Badge></div>
        <DialogHeader className="mt-3"><DialogTitle className="text-3xl tracking-[-.035em] md:text-4xl">{project.name}</DialogTitle><DialogDescription className="max-w-3xl text-sm leading-6">{project.summary}</DialogDescription></DialogHeader>
      </div>
      <Tabs defaultValue="overview" className="px-6 pb-7 pt-2 md:px-8">
        <TabsList className="w-full justify-start overflow-x-auto"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="architecture">Architecture</TabsTrigger><TabsTrigger value="decisions">Decisions</TabsTrigger><TabsTrigger value="evidence">Evidence</TabsTrigger></TabsList>
        <TabsContent value="overview" className="mt-7"><div className="grid gap-4 md:grid-cols-3"><Info label="Role in portfolio" value={project.type} /><Info label="Current state" value={project.statusDetail} /><Info label="Stack" value={project.stack.join(" · ")} /></div></TabsContent>
        <TabsContent value="architecture" className="mt-7"><div className="grid gap-5 md:grid-cols-[.78fr_1.22fr]"><div className="space-y-2">{project.architecture.map(([name], index) => <button key={name} className={`architecture-step ${index === step ? "active" : ""}`} onClick={() => setStep(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{name}</b><ArrowRight className="ml-auto size-4 opacity-50" /></button>)}</div><Card className="bg-neutral-50 shadow-none"><CardHeader><CardTitle>{selected[0]}</CardTitle><CardDescription>{selected[1]}</CardDescription></CardHeader><CardContent><div className="flex items-center gap-2 text-xs text-neutral-500"><Workflow className="size-4" />System boundary</div></CardContent></Card></div></TabsContent>
        <TabsContent value="decisions" className="mt-7"><div className="grid gap-4 md:grid-cols-3">{project.decisions.map(([title, body]) => <Card key={title} className="shadow-none"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-neutral-600">{body}</p></CardContent></Card>)}</div></TabsContent>
        <TabsContent value="evidence" className="mt-7"><div className="grid gap-3">{project.evidence.map((item) => <div className="evidence-row" key={item}><Check className="size-4 shrink-0" />{item}</div>)}</div><div className="mt-5 border-l-2 border-black bg-neutral-50 px-4 py-3 text-sm leading-6"><strong>Next:</strong> {project.next?.join(" · ") ?? "Continue validation and benchmarking."}</div></TabsContent>
        <div className="mt-7 flex flex-wrap gap-2 border-t border-neutral-200 pt-6">{project.github && <Button asChild size="sm"><a href={project.github} target="_blank" rel="noopener noreferrer"><Github className="size-4" />Inspect source</a></Button>}{project.demo && <Button asChild size="sm" variant="outline"><a href={project.demo} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Open deployment</a></Button>}</div>
      </Tabs>
    </DialogContent>
  </Dialog>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="border border-neutral-200 p-4"><div className="eyebrow">{label}</div><p className="mt-2 text-sm leading-6">{value}</p></div> }

function ProjectCard({ project, featured, onOpen }: { project: typeof projects[number]; featured: boolean; onOpen: () => void }) {
  return <Card className={`project-card ${featured ? "featured" : ""}`}>
    <CardHeader><div className="flex items-start justify-between gap-4"><div><Badge variant="outline">{project.category}</Badge><CardTitle className="mt-4 text-2xl tracking-[-.03em] md:text-3xl">{project.name}</CardTitle><CardDescription className="mt-2 max-w-xl text-sm leading-6">{project.headline}</CardDescription></div><span className="project-number">{featured ? "01" : "→"}</span></div></CardHeader>
    <CardContent className="flex-1"><div className="flex flex-wrap gap-2">{project.stack.map((item) => <Badge key={item} variant="secondary" className="normal-case tracking-normal">{item}</Badge>)}</div><p className="mt-5 text-sm leading-6 text-neutral-600">{project.summary}</p><div className="mt-5 border-l-2 border-black bg-neutral-50 px-4 py-3 text-sm leading-6">{project.statusDetail}</div></CardContent>
    <CardFooter className="justify-between gap-3"><Button onClick={onOpen} size="sm" variant={featured ? "default" : "outline"}>Open case study <ArrowUpRight className="size-3.5" /></Button><div className="flex gap-1">{project.github && <Tooltip><TooltipTrigger asChild><a className="icon-link" href={project.github} target="_blank" rel="noopener noreferrer"><Github className="size-4" /></a></TooltipTrigger><TooltipContent>Inspect source</TooltipContent></Tooltip>}{project.demo && <Tooltip><TooltipTrigger asChild><a className="icon-link" href={project.demo} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /></a></TooltipTrigger><TooltipContent>Open deployment</TooltipContent></Tooltip>}</div></CardFooter>
  </Card>
}

export default function App() {
  useReveal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState<(typeof nav)[number]>("about")
  const [caseStudyId, setCaseStudyId] = useState<string | null>(null)
  const [systemFilter, setSystemFilter] = useState("All")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id as (typeof nav)[number])), { rootMargin: "-35% 0px -55% 0px" })
    nav.map((id) => document.getElementById(id)).filter(Boolean).forEach((element) => observer.observe(element!))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }) }
  const selectedProject = projects.find((project) => project.id === caseStudyId) ?? projects[0]
  const filters = ["All", "AI / ML", "AI / Backend", "Full Stack"]
  const filtered = useMemo(() => projects.filter((project) => { const q = search.trim().toLowerCase(); const categoryMatch = systemFilter === "All" || project.category === systemFilter; const searchMatch = !q || `${project.name} ${project.category} ${project.stack.join(" ")} ${project.summary}`.toLowerCase().includes(q); return categoryMatch && searchMatch }), [search, systemFilter])

  return <TooltipProvider>
    <div className="min-h-screen bg-white text-black">
      <header className="site-header"><div className="container-wide flex h-16 items-center justify-between gap-4"><button className="brand" onClick={() => scrollTo("about")}>Bharath Waj K R</button><nav className={`${menuOpen ? "mobile-open" : ""}`}><div className="nav-inner">{nav.map((id) => <button key={id} className={`nav-link ${active === id ? "active" : ""}`} onClick={() => scrollTo(id)}>{id[0].toUpperCase() + id.slice(1)}</button>)}<Button asChild size="sm"><a href={resumeUrl} target="_blank" rel="noopener noreferrer"><Download className="size-3.5" />Résumé</a></Button></div></nav><Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</Button></div></header>

      <main>
        <section id="about" className="hero-section"><div className="container-wide hero-layout"><div className="reveal"><div className="hero-kicker"><Badge variant="outline"><Sparkles className="size-3" />AI · Backend · Full Stack</Badge><span className="availability"><i />Building systems, not demos</span></div><h1>I build AI systems that work when the happy path ends.</h1><p className="hero-lead">Applied AI, backend systems, and full-stack products with explicit trade-offs, failure paths, and deployable architecture.</p><div className="hero-meta"><span>V.S.B. Engineering College</span><span>2023–2027</span><span>Dindigul, Tamil Nadu</span></div><div className="hero-actions"><Button asChild><a href="#systems">Inspect the systems <ArrowRight className="size-4" /></a></Button><Button asChild variant="outline"><a href={resumeUrl} target="_blank" rel="noopener noreferrer">Résumé <Download className="size-4" /></a></Button><Button asChild variant="outline"><a href="https://github.com/BharathWaj-K-R" target="_blank" rel="noopener noreferrer"><Github className="size-4" />GitHub</a></Button></div><div className="hero-proof"><span><ShieldCheck className="size-4" />Evidence-led projects</span><span><GitBranch className="size-4" />Public source code</span><span><Workflow className="size-4" />Deployed systems</span></div></div><div className="reveal hero-photo"><div className="photo-frame"><img src="/photo.webp" onError={(event) => { const image = event.currentTarget; if (image.dataset.fallback !== "true") { image.dataset.fallback = "true"; image.src = photoUrl } }} alt="Portrait of Bharath Waj K R" width="384" height="384" fetchPriority="high" decoding="async" /><div className="photo-note">Building things that survive contact with reality.</div></div></div></div></section>
        <ProofStrip />

        <section id="now" className="content-section"><div className="container-wide reveal"><div className="section-head"><div><div className="eyebrow">01 · Current focus</div><h2 className="section-title">What I’m building now</h2></div><Badge variant="outline">Active work</Badge></div><div className="now-grid"><Card className="focus-card focus-main"><CardHeader><div className="flex items-center justify-between gap-3"><Badge>VisionBridge</Badge><span className="text-xs font-semibold text-neutral-500">AI / ML</span></div><CardTitle className="mt-5 text-2xl">Signer-adaptive ISL translation</CardTitle><CardDescription className="max-w-xl text-sm leading-6">The flagship system: personalize a frozen model rather than retraining the whole thing.</CardDescription></CardHeader><CardContent><div className="mini-flow"><span>Video</span><ArrowRight /><span>Pose + Face</span><ArrowRight /><span>Adapter</span><ArrowRight /><span>Sentence</span></div><button className="inline-link" onClick={() => { scrollTo("systems"); setCaseStudyId("visionbridge") }}>Inspect architecture <ArrowRight className="size-3.5" /></button></CardContent></Card><Card className="focus-card"><CardHeader><Badge variant="secondary">AI / Backend</Badge><CardTitle className="mt-4 text-xl">ReForge</CardTitle><CardDescription>Analysis → validation → deterministic scoring.</CardDescription></CardHeader><CardContent><button className="inline-link" onClick={() => { scrollTo("systems"); setCaseStudyId("reforge") }}>Open case study <ArrowRight className="size-3.5" /></button></CardContent></Card><Card className="focus-card"><CardHeader><Badge variant="secondary">Foundations</Badge><CardTitle className="mt-4 text-xl">Java · DSA · SQL</CardTitle><CardDescription>Strengthening the fundamentals underneath the systems.</CardDescription></CardHeader><CardContent><button className="inline-link" onClick={() => scrollTo("contact")}>Talk about the work <ArrowRight className="size-3.5" /></button></CardContent></Card></div></div></section>

        <section id="principles" className="dark-section"><div className="container-wide reveal"><div className="eyebrow dark">02 · Engineering principles</div><h2 className="section-title dark-title">Demos are easy. Failure is hard.</h2><p className="section-intro dark-copy">I care less about whether an AI demo works once and more about what happens after the first unexpected input.</p><div className="principles-grid"><div><span className="principle-number">01</span><h3>Reliability</h3><p>Design the fallback before the outage. ReForge treats model failure as a normal system state.</p></div><div><span className="principle-number">02</span><h3>Adaptability</h3><p>Change the smallest possible surface. VisionBridge personalizes with an adapter instead of retraining the backbone.</p></div><div><span className="principle-number">03</span><h3>Determinism</h3><p>AI can generate candidates; system logic should decide what gets shipped.</p></div></div></div></section>

        <section id="systems" className="content-section systems-section"><div className="container-wide reveal"><div className="section-head"><div><div className="eyebrow">03 · Selected systems</div><h2 className="section-title">Work that shows how I think</h2><p className="section-intro">Not galleries. Technical stories: problem, architecture, decisions, evidence, and what comes next.</p></div><div className="project-search"><Search className="size-4 text-neutral-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search systems or stack" /></div></div><div className="filter-row">{filters.map((filter) => <button key={filter} onClick={() => setSystemFilter(filter)} className={`filter-pill ${systemFilter === filter ? "active" : ""}`}>{filter}</button>)}</div><div className="systems-grid">{filtered.map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0 && systemFilter === "All" && !search} onOpen={() => setCaseStudyId(project.id)} />)}</div>{filtered.length === 0 && <div className="empty-state">No system matches that query.</div>}</div></section>

        <section className="process-section"><div className="container-wide reveal"><div className="eyebrow">04 · How I build</div><h2 className="section-title">A small loop with hard checkpoints.</h2><div className="process-list">{[["01", "Understand", "Name the actual failure mode before choosing a technology."], ["02", "Architect", "Choose the smallest architecture that can survive the constraint."], ["03", "Implement", "Build the thinnest working path before polishing the edges."], ["04", "Validate", "Measure assumptions, test failure states, and challenge the result."], ["05", "Deploy", "Put the system somewhere a real person can touch it."], ["06", "Measure", "Turn unknowns into the next engineering decision."]].map(([num, title, body]) => <div className="process-row" key={num}><span>{num}</span><b>{title}</b><p>{body}</p></div>)}</div></div></section>

        <section id="stack" className="content-section"><div className="container-wide reveal"><div className="eyebrow">05 · Capability map</div><h2 className="section-title">The stack I reach for</h2><p className="section-intro">Tools are less interesting than where they are used. These are the technologies behind the systems above.</p><div className="stack-grid">{stack.map(({ title, icon: Icon, items }) => <Card className="stack-card" key={title}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-3 text-base"><span className="icon-box"><Icon className="size-4" /></span>{title}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} variant="secondary" className="normal-case tracking-normal">{item}</Badge>)}</CardContent></Card>)}</div></div></section>

        <section id="proof" className="proof-section"><div className="container-wide reveal"><div className="eyebrow">06 · Evidence before adjectives</div><h2 className="section-title">Inspect the implementation.</h2><p className="section-intro">The repository and deployment are part of the portfolio. Claims that are still assumptions are labeled as assumptions.</p><div className="evidence-grid">{projects.map((project) => <a className="evidence-card" key={project.id} href={project.github} target="_blank" rel="noopener noreferrer"><div><div className="text-sm font-semibold">{project.name}</div><div className="mt-1 text-xs text-neutral-500">{project.category} · public source</div></div><Github className="size-4" /></a>)}</div><div className="evidence-note"><ShieldCheck className="size-4" /><span><strong>Rule:</strong> targets stay targets until they are measured.</span></div></div></section>

        <section className="content-section"><div className="container-wide reveal"><div className="eyebrow">07 · Experience</div><h2 className="section-title">Where the engineering comes from</h2><div className="experience-card"><Accordion type="single" collapsible defaultValue="intern"><AccordionItem value="intern"><AccordionTrigger><span><b>Web Development Intern</b><span className="ml-2 text-neutral-500">· Appin Technology · 2024</span></span></AccordionTrigger><AccordionContent><p>Built responsive webpages with HTML, CSS, and JavaScript, with a focus on structured UI and accessibility.</p></AccordionContent></AccordionItem><AccordionItem value="hackathon"><AccordionTrigger><span><b>Team Leader · Smart India Hackathon</b><span className="ml-2 text-neutral-500">· V.S.B. Engineering College</span></span></AccordionTrigger><AccordionContent><p>Led a four-person team through a Smart Agriculture problem statement and advanced to the second round.</p></AccordionContent></AccordionItem><AccordionItem value="education"><AccordionTrigger><span><b>B.Tech Artificial Intelligence</b><span className="ml-2 text-neutral-500">· 2023–2027 · CGPA 8.41 / 10</span></span></AccordionTrigger><AccordionContent><p>Studying AI/ML, software development, data, and systems foundations at V.S.B. Engineering College.</p></AccordionContent></AccordionItem></Accordion></div></div></section>
      </main>

      <footer id="contact" className="footer-section"><div className="container-wide"><div className="reveal"><div className="eyebrow dark">08 · Contact</div><h2 className="footer-title">Looking for difficult problems.</h2><p className="footer-copy">I’m looking for a software engineering team where I can work on AI products, backend systems, and the engineering problems that appear after the demo works.</p><div className="footer-actions"><Button asChild className="bg-white text-black hover:bg-neutral-200"><a href={resumeUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4" />Résumé</a></Button><Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white hover:text-black"><a href="mailto:ravikap0063@gmail.com"><Mail className="size-4" />Email</a></Button><Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white hover:text-black"><a href="https://www.linkedin.com/in/bharath-waj-k-r/" target="_blank" rel="noopener noreferrer"><Linkedin className="size-4" />LinkedIn</a></Button><Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white hover:text-black"><a href="https://github.com/BharathWaj-K-R" target="_blank" rel="noopener noreferrer"><Github className="size-4" />GitHub</a></Button></div><div className="footer-meta"><span>© 2026 Bharath Waj K R</span><span>Java · Python · FastAPI · AI/ML · Docker</span></div></div></div></footer>

      {caseStudyId && <CaseStudy project={selectedProject} open={Boolean(caseStudyId)} onOpenChange={(value) => !value && setCaseStudyId(null)} />}
    </div>
  </TooltipProvider>
}
