import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, Check, Github, Linkedin, Mail, Menu, X, ExternalLink, Code2, Server, BrainCircuit, Database, Terminal, Sparkles, MapPin, Download, ChevronRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const photoUrl = new URL("../photo.png", import.meta.url).href
const resumeUrl = new URL("../resume.pdf", import.meta.url).href

const projects = [
  {
    id: "silentbridge", name: "SilentBridge", category: "AI / ML", tag: "Applied deep learning", headline: "Signer personalization with a lightweight adapter.",
    summary: "Real-time Indian Sign Language translation using a pose + facial-expression fusion transformer as a frozen base model, with a few-shot BridgeAdapter for signer-specific personalization.",
    stack: ["Python", "PyTorch", "Transformers", "FastAPI"],
    focus: "Freeze the base transformer and learn a small adapter from about five minutes of calibration video, targeting under 2% of the base model parameters.",
    problem: "Most ISL translation models are trained on one signer's style and degrade on other signers; retraining per signer is impractical.",
    approach: "Freeze the base transformer, extract pose and expression features, then adapt only a small signer-specific module.",
    state: "In progress — base model + adapter architecture built; training/evaluation ongoing.",
    targets: ["<5 min calibration", "<500ms inference target", "<2% adapter size", "10–20% accuracy gain target"],
    github: "https://github.com/BharathWaj-K-R/SilentBridge", demo: "https://silentbridge-frontend.onrender.com",
  },
  {
    id: "reforge", name: "ReForge", category: "AI / Backend", tag: "Multi-agent AI · FastAPI", headline: "AI code review with independent validation and deterministic scoring.",
    summary: "FastAPI backend on Groq's Llama 3.3 where analysis findings are re-checked by a separate validation agent before they reach the user.",
    stack: ["FastAPI", "Groq", "Llama 3.3", "Render"],
    focus: "Use an analysis agent, a separate validation agent, and fixed scoring logic so the model never self-assesses its own quality score.",
    problem: "Raw LLM code-review output can contain hallucinated or overstated findings.",
    approach: "Split analysis and validation into separate agent roles and keep the scoring system deterministic.",
    state: "Deployed on Render with health checks and graceful degradation if the LLM call fails.",
    targets: ["Independent validation", "Deterministic score", "Health checks", "Fallback path"],
    github: "https://github.com/BharathWaj-K-R/Re_Forge", demo: "https://re-forge.onrender.com/",
  },
  {
    id: "interview", name: "AI Interview Preparation", category: "Full Stack", tag: "Full-stack · LLM", headline: "Resume-aware interview practice with an offline scoring fallback.",
    summary: "Flask application that parses uploaded PDF/DOCX resumes, generates skills-specific questions, scores answers with an LLM, and falls back to heuristic evaluation when no key is configured.",
    stack: ["Flask", "Python", "LLM APIs", "Docker"],
    focus: "Combine resume parsing, authentication, rate-limited LLM routes, database migrations, Docker/compose, and a heuristic fallback.",
    problem: "Static question banks are generic, while many LLM-backed tools fail completely when an API key is unavailable.",
    approach: "Build the application around a resilient evaluation path so the product still works without an external model call.",
    state: "Ships with auth, migrations, Docker/compose setup, and CI running the test suite on pushes.",
    targets: ["Resume-aware prompts", "Auth", "Rate-limited routes", "LLM fallback"],
    github: "https://github.com/BharathWaj-K-R/Ai-Interview-preparation",
  },
  {
    id: "stress", name: "Stress Detection Using Handwriting", category: "AI / ML", tag: "Applied ML", headline: "Offline three-class handwriting classifier with quality checks.",
    summary: "Streamlit app using HOG features and a Random Forest classifier for Low / Medium / High stress classes on a 30-sample dataset.",
    stack: ["Python", "Streamlit", "HOG", "Random Forest"],
    focus: "Extract HOG features, validate image quality, classify with Random Forest, log predictions, and support corrected-sample retraining.",
    problem: "Explore whether handwriting carries a detectable stress signal using a non-clinical offline feature set.",
    approach: "Keep the entire inference path local and expose quality checks before classification.",
    state: "Educational scope only — not a diagnostic tool. Returns class probabilities and supports corrected-sample review.",
    targets: ["30-sample dataset", "3 output classes", "Offline inference", "Review loop"],
    github: "https://github.com/BharathWaj-K-R/Stress-level-Detection",
  },
] as const

const categories = ["All", "AI / ML", "AI / Backend", "Full Stack"] as const

const certs = [
  ["Programming using Java", "Infosys Springboard", "Jun 2025", "certs/programming-java.pdf"],
  ["Java Foundation Certification", "Infosys Springboard", "Jul 2025", "certs/java-foundation.pdf"],
  ["Cloud Technologies", "Infosys Springboard", "Jan 2025", "certs/cloud-technologies.pdf"],
  ["Microsoft Excel for Data Analyst", "Infosys Springboard", "Jan 2025", "certs/excel-data-analyst.pdf"],
  ["Introduction to Generative AI Studio", "Google Cloud", "Feb 2026", "certs/generative-ai.pdf"],
  ["Introduction to IoT and Digital Transformation", "Cisco Networking Academy", "Feb 2026", "certs/iot-digital-transformation.pdf"],
  ["Web Development Training", "Appin Technology", "", ""],
] as const

const sectionIds = ["about", "projects", "skills", "experience", "certs", "contact"]

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in"))
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" })
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function Stat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(value.includes(".") ? "0.00" : "0")
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const n = Number(value.replace(/[^0-9.]/g, ""))
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || !Number.isFinite(n)) return
      const start = performance.now(); const duration = 850
      const decimals = value.includes(".") ? value.split(".")[1].length : 0
      const tick = (now:number) => {
        const p = Math.min(1, (now-start)/duration); const eased = 1-Math.pow(1-p,3)
        setDisplay(n < 20 ? n.toFixed(decimals) : Math.round(n*eased).toString())
        if (p < 1) requestAnimationFrame(tick); else setDisplay(value)
      }
      requestAnimationFrame(tick); observer.disconnect()
    }, {threshold:.6})
    observer.observe(el); return () => observer.disconnect()
  }, [value])
  return <div ref={ref} className="border-r border-neutral-200 p-5 last:border-r-0"><div className="font-serif text-3xl font-semibold">{display}</div><div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</div></div>
}

function ProjectDialog({ project }: { project: typeof projects[number] }) {
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" size="sm" className="group">Explore case study <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Button></DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <div className="mb-3 flex flex-wrap gap-2"><Badge>{project.category}</Badge><Badge variant="secondary">{project.tag}</Badge></div>
        <DialogTitle>{project.name}</DialogTitle>
        <DialogDescription>{project.summary}</DialogDescription>
      </DialogHeader>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">Problem</div><p className="text-sm leading-6">{project.problem}</p></div>
        <div><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">Approach</div><p className="text-sm leading-6">{project.approach}</p></div>
        <div><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">Current state</div><p className="text-sm leading-6">{project.state}</p></div>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-wrap gap-2">{project.targets.map((target) => <Badge key={target} variant="outline"><Check className="mr-1 size-3" />{target}</Badge>)}</div>
      <div className="mt-7 flex flex-wrap gap-2">
        {project.github && <Button asChild size="sm"><a href={project.github} target="_blank" rel="noopener noreferrer"><Github className="size-4" />GitHub</a></Button>}
        {project.demo && <Button asChild variant="outline" size="sm"><a href={project.demo} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Live demo</a></Button>}
      </div>
    </DialogContent>
  </Dialog>
}

function Tech({ icon: Icon, name, detail }: { icon: React.ElementType; name: string; detail: string }) {
  return <Tooltip><TooltipTrigger asChild><div className="flex cursor-default items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-xs font-medium transition hover:border-black hover:-translate-y-0.5"><Icon className="size-3.5" />{name}</div></TooltipTrigger><TooltipContent>{detail}</TooltipContent></Tooltip>
}

export default function App() {
  useReveal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState("about")
  const [category, setCategory] = useState<(typeof categories)[number]>("All")
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? window.scrollY/max*100 : 0)
    }
    update(); window.addEventListener("scroll", update, {passive:true})
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)), { rootMargin:"-35% 0px -55% 0px", threshold:0 })
    sectionIds.map((id) => document.getElementById(id)).filter(Boolean).forEach((el) => io.observe(el!))
    return () => { window.removeEventListener("scroll", update); io.disconnect() }
  }, [])

  const filtered = useMemo(() => category === "All" ? projects : projects.filter((p) => p.category === category), [category])

  const scrollTo = (id:string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}) }

  return <div className="min-h-screen bg-white text-black">
    <div className="fixed left-0 top-0 z-[100] h-[2px] bg-black transition-[width] duration-100" style={{width:`${scrollProgress}%`}} />

    <header className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white/90 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between">
        <button onClick={() => scrollTo("about")} className="font-serif text-lg font-semibold tracking-tight">Bharath Waj K R</button>
        <nav className={`${menuOpen ? "translate-y-0" : "-translate-y-[140%] md:translate-y-0"} absolute inset-x-0 top-16 border-b bg-white p-5 transition-transform md:static md:flex md:translate-y-0 md:border-0 md:p-0`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-7">
            {sectionIds.map((id) => <button key={id} onClick={() => scrollTo(id)} className={`text-left text-xs font-medium transition-colors hover:text-black md:text-center ${active===id?"text-black":"text-neutral-500"}`}>{id[0].toUpperCase()+id.slice(1)}</button>)}
            <Button asChild size="sm"><a href={resumeUrl} target="_blank" rel="noopener noreferrer"><Download className="size-3.5" />Résumé</a></Button>
          </div>
        </nav>
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen?<X/>:<Menu/>}</Button>
      </div>
    </header>

    <main>
      <section id="about" className="relative overflow-hidden py-16 md:py-28">
        <div className="hero-grid absolute inset-0 -z-0" />
        <div className="container-wide relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr_.6fr]">
          <div className="reveal">
            <Badge variant="outline" className="mb-5 gap-2"><Sparkles className="size-3" />AI · Backend · Full Stack</Badge>
            <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">AI-focused software engineer building practical systems.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">I turn ideas into deployable software, intelligent systems, and reliable backend services — with an emphasis on clear engineering decisions and graceful failure.</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500"><span className="font-semibold text-black">Bharath Waj K R</span><span>V.S.B. Engineering College</span><span>2023–2027</span><span className="inline-flex items-center gap-1"><MapPin className="size-3"/>Dindigul, Tamil Nadu</span></div>
            <div className="mt-7 flex flex-wrap gap-2"><Button asChild><a href="#projects">View projects <ChevronRight className="size-4"/></a></Button><Button asChild variant="outline"><a href={resumeUrl} target="_blank" rel="noopener noreferrer">View résumé <Download className="size-4"/></a></Button><Button asChild variant="outline"><a href="https://github.com/BharathWaj-K-R" target="_blank" rel="noopener noreferrer"><Github className="size-4"/>GitHub</a></Button></div>
          </div>
          <div className="reveal justify-self-center lg:justify-self-end">
            <div className="relative"><div className="absolute -inset-5 border border-dashed border-neutral-300"/><img src={photoUrl} alt="Portrait of Bharath Waj K R" className="relative h-72 w-72 object-cover object-center grayscale sm:h-80 sm:w-80 lg:h-96 lg:w-96"/><div className="absolute -bottom-4 -left-4 border bg-white px-4 py-3 text-xs font-semibold shadow-sm">Building things that survive contact with reality.</div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 py-0">
        <div className="container-wide grid grid-cols-2 md:grid-cols-4"><Stat value="8.41" label="CGPA / 10"/><Stat value="2027" label="Expected graduation"/><Stat value="7" label="Certifications"/><Stat value="4" label="Featured projects"/></div>
      </section>

      <section className="py-16 md:py-20"><div className="container-wide reveal"><div className="mb-6 flex items-baseline gap-3"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-neutral-500">01 · Engineering mindset</span><h2 className="font-serif text-3xl font-semibold">How I build</h2></div><div className="grid border border-neutral-200 md:grid-cols-3">
        {[['Build systems, not demos.','Design around real inputs, failures, deployment, and change.'],['Make AI behavior explicit.','Prefer validation, fixed logic, fallbacks, and measurable targets over vague model claims.'],['Keep the system explainable.','Architecture, failure paths, and trade-offs should make sense to the next engineer.']].map(([title,body])=><Card key={title} className="border-0 border-b md:border-b-0 md:border-r last:border-0 transition-transform hover:-translate-y-1 hover:shadow-lg"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><CardDescription>{body}</CardDescription></CardContent></Card>)}
      </div></div></section>

      <Separator />

      <section id="projects" className="scroll-mt-16 py-16 md:py-24"><div className="container-wide reveal"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-[10px] font-bold uppercase tracking-[.12em] text-neutral-500">02 · Selected work</div><h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Projects that show how I think</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">Filter the work by engineering domain, then open a case study for the deeper technical story.</p></div><Tabs value={category} onValueChange={(v)=>setCategory(v as (typeof categories)[number])}><TabsList>{categories.map((c)=><TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}</TabsList><TabsContent value={category}/></Tabs></div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">{filtered.map((project)=><Card key={project.id} className="group flex h-full flex-col transition-all hover:-translate-y-1 hover:shadow-xl"><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-2xl">{project.name}</CardTitle><CardDescription className="mt-2">{project.headline}</CardDescription></div><Badge variant="outline">{project.category}</Badge></div></CardHeader><CardContent className="flex-1"><div className="flex flex-wrap gap-2">{project.stack.map((item)=><Badge key={item} variant="secondary">{item}</Badge>)}</div><p className="mt-5 text-sm leading-6 text-neutral-700">{project.summary}</p><div className="mt-5 border-l-2 border-black pl-4 text-sm font-medium leading-6">{project.focus}</div></CardContent><CardFooter className="justify-between gap-3"><ProjectDialog project={project}/><div className="flex gap-3">{project.github&&<Tooltip><TooltipTrigger asChild><a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-black"><Github className="size-4"/>GitHub</a></TooltipTrigger><TooltipContent>Open source repository</TooltipContent></Tooltip>}{project.demo&&<Tooltip><TooltipTrigger asChild><a href={project.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-black"><ExternalLink className="size-4"/>Demo</a></TooltipTrigger><TooltipContent>Open deployed demo</TooltipContent></Tooltip>}</div></CardFooter></Card>)}</div>
      </div></section>

      <section id="skills" className="scroll-mt-16 border-y border-neutral-200 bg-neutral-50 py-16 md:py-20"><div className="container-wide reveal"><div className="text-[10px] font-bold uppercase tracking-[.12em] text-neutral-500">03 · Capability map</div><h2 className="mt-2 font-serif text-4xl font-semibold">The stack I reach for</h2><div className="mt-8 grid gap-3 md:grid-cols-3"><Tech icon={Code2} name="Languages" detail="Java, Python, JavaScript, SQL"/><Tech icon={Server} name="Backend" detail="FastAPI, Flask, REST APIs"/><Tech icon={BrainCircuit} name="AI / ML" detail="PyTorch, transformers, LLM API integration, computer vision"/><Tech icon={Code2} name="Frontend" detail="HTML, CSS, JavaScript, React ecosystem"/><Tech icon={Database} name="Data" detail="MySQL, MongoDB"/><Tech icon={Terminal} name="Infrastructure" detail="Git, GitHub, Docker, Unix/Linux"/></div></div></section>

      <section id="experience" className="scroll-mt-16 py-16 md:py-24"><div className="container-wide reveal"><div className="text-[10px] font-bold uppercase tracking-[.12em] text-neutral-500">04 · Experience & education</div><h2 className="mt-2 font-serif text-4xl font-semibold">Where I’ve been building</h2><div className="mt-7 border-y border-neutral-200"><Accordion type="single" collapsible defaultValue="exp-1"><AccordionItem value="exp-1"><AccordionTrigger><span><b>Web Development Intern</b><span className="ml-2 text-neutral-500">· Appin Technology · 2024</span></span></AccordionTrigger><AccordionContent><p className="pb-4 text-sm leading-6">Developed interactive and responsive webpages using HTML, CSS, and JavaScript; improved UI/UX with structured layout and accessible design.</p></AccordionContent></AccordionItem><AccordionItem value="exp-2"><AccordionTrigger><span><b>Team Leader, Smart India Hackathon</b><span className="ml-2 text-neutral-500">· V.S.B. Engineering College</span></span></AccordionTrigger><AccordionContent><p className="pb-4 text-sm leading-6">Led a 4-member team, advanced to the second round with a Smart Agriculture solution, before being eliminated.</p></AccordionContent></AccordionItem><AccordionItem value="exp-3"><AccordionTrigger><span><b>B.Tech Artificial Intelligence</b><span className="ml-2 text-neutral-500">· 2023–2027 · CGPA 8.41/10</span></span></AccordionTrigger><AccordionContent><p className="pb-4 text-sm leading-6">V.S.B. Engineering College. Prior Higher Secondary (2023) and Secondary (2021) at Akshaya Academy Higher Secondary School — both 80%+.</p></AccordionContent></AccordionItem></Accordion></div></div></section>

      <section id="certs" className="scroll-mt-16 border-y border-neutral-200 bg-neutral-50 py-16 md:py-20"><div className="container-wide reveal"><div className="flex items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[.12em] text-neutral-500">05 · Credentials</div><h2 className="mt-2 font-serif text-4xl font-semibold">Certifications</h2></div><Badge variant="outline">7 records</Badge></div><div className="mt-7 border-y border-neutral-200 bg-white">{certs.map(([name,org,date,path])=><div key={name} className="grid gap-3 border-b border-neutral-200 p-4 last:border-0 md:grid-cols-[1fr_auto] md:items-center"><div><div className="text-sm font-medium">{name}</div><div className="mt-1 text-xs text-neutral-500">{org}</div></div><div className="flex items-center gap-4">{date&&<span className="text-[11px] text-neutral-500">{date}</span>}{path&&<Button asChild size="sm" variant="outline"><a href={new URL(`../${path}`, import.meta.url).href} target="_blank" rel="noopener noreferrer">View</a></Button>}</div></div>)}</div></div></section>

      <section className="py-16 md:py-20"><div className="container-wide reveal"><div className="text-[10px] font-bold uppercase tracking-[.12em] text-neutral-500">06 · Proof of work</div><h2 className="mt-2 font-serif text-4xl font-semibold">Evidence before adjectives</h2><div className="mt-7 grid border border-neutral-200 sm:grid-cols-2 lg:grid-cols-4"><div className="p-6"><Code2 className="mb-5 size-5"/><div className="font-serif text-3xl">4</div><div className="mt-1 text-xs text-neutral-500">Featured projects</div></div><div className="border-t border-neutral-200 p-6 sm:border-l"><BrainCircuit className="mb-5 size-5"/><div className="font-serif text-3xl">AI</div><div className="mt-1 text-xs text-neutral-500">Primary focus</div></div><div className="border-t border-neutral-200 p-6 lg:border-l"><Server className="mb-5 size-5"/><div className="font-serif text-3xl">API</div><div className="mt-1 text-xs text-neutral-500">Backend systems</div></div><div className="border-t border-neutral-200 p-6 lg:border-l"><Github className="mb-5 size-5"/><div className="font-serif text-3xl">Open</div><div className="mt-1 text-xs text-neutral-500">Source on GitHub</div></div></div></div></section>
    </main>

    <footer id="contact" className="scroll-mt-16 bg-black text-white">
      <div className="container-wide py-20 md:py-28"><div className="reveal"><div className="text-[10px] font-bold uppercase tracking-[.12em] text-neutral-400">07 · Let’s talk</div><h2 className="mt-3 max-w-4xl font-serif text-5xl font-semibold tracking-[-.03em] md:text-7xl">Open to Software Engineer and Graduate Trainee roles.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400">I’m looking for a team where I can work on real software, contribute from day one, and keep getting better at the engineering underneath the product.</p><div className="mt-8 flex flex-wrap gap-2"><Button asChild className="bg-white text-black hover:bg-neutral-200"><a href="mailto:ravikap0063@gmail.com"><Mail className="size-4"/>Email</a></Button><Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-black"><a href="https://www.linkedin.com/in/bharath-waj-k-r/" target="_blank" rel="noopener noreferrer"><Linkedin className="size-4"/>LinkedIn</a></Button><Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-black"><a href="https://github.com/BharathWaj-K-R" target="_blank" rel="noopener noreferrer"><Github className="size-4"/>GitHub</a></Button><Button asChild variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-black"><a href={resumeUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4"/>Résumé</a></Button></div><div className="mt-10 grid border-y border-white/15 sm:grid-cols-2 lg:grid-cols-4"><div className="border-b border-white/15 p-5 lg:border-b-0 lg:border-r"><div className="text-[10px] uppercase tracking-widest text-neutral-500">Email</div><div className="mt-2 break-all text-sm">ravikap0063@gmail.com</div></div><div className="border-b border-white/15 p-5 lg:border-b-0 lg:border-r"><div className="text-[10px] uppercase tracking-widest text-neutral-500">Phone</div><div className="mt-2 text-sm">+91 99527 53739</div></div><div className="border-b border-white/15 p-5 lg:border-b-0 lg:border-r"><div className="text-[10px] uppercase tracking-widest text-neutral-500">Location</div><div className="mt-2 text-sm">Dindigul, Tamil Nadu, India</div></div><div className="p-5"><div className="text-[10px] uppercase tracking-widest text-neutral-500">Availability</div><div className="mt-2 text-sm">Graduating 2027 · Open now</div></div></div><div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500"><span>© 2026 Bharath Waj K R</span><span>Java · Python · FastAPI · AI/ML · Docker</span></div></div></div>
    </footer>
  </div>
}
