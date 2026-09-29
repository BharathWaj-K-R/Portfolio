import { useState } from "react"
import type { FormEvent } from "react"
import { ArrowRight, Check, Clock3, Github, Linkedin, Mail, Send, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE = (import.meta.env.VITE_CONTACT_API_URL || "").replace(/\/$/, "")
const DASHBOARD_URL = import.meta.env.VITE_CONTACT_DASHBOARD_URL || (API_BASE ? `${API_BASE}/dashboard` : "")

type Status = "idle" | "sending" | "success" | "error"

const steps = [
  ["01", "Capture", "A structured contact request arrives with the context needed for triage."],
  ["02", "Classify", "Intent, urgency, and priority are extracted before the owner sees it."],
  ["03", "Notify", "The owner gets a focused notification; the visitor gets an acknowledgement."],
  ["04", "Follow up", "A follow-up task is created with a 24-hour due date."],
]

export function ContactSystem() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const [processingMs, setProcessingMs] = useState<number | null>(null)

  const endpoint = API_BASE ? `${API_BASE}/api/contact` : "/api/contact"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    setError("")

    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      company: String(form.get("company") || "").trim(),
      subject: String(form.get("subject") || "").trim(),
      message: String(form.get("message") || "").trim(),
      botcheck: String(form.get("botcheck") || ""),
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Unable to send your message.")
      setProcessingMs(typeof data.processingMs === "number" ? data.processingMs : null)
      setStatus("success")
      formElement.reset()
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to send your message.")
      setStatus("error")
    }
  }

  return (
    <section id="contact" className="ink-section contact-system">
      <div className="ink-container">
        <header className="section-header contact-system__intro" data-reveal>
          <div>
            <span className="section-number">03 · CONTACT</span>
            <h2>Looking for difficult problems.</h2>
            <p>One form. A small automation system behind it.</p>
          </div>
          <div className="contact-system__links">
            <a href="#contact"><Mail size={15} />Email via contact workflow</a>
            <a href="https://www.linkedin.com/in/bharath-waj-k-r/" target="_blank" rel="noreferrer"><Linkedin size={15} />LinkedIn</a>
            <a href="https://github.com/BharathWaj-K-R" target="_blank" rel="noreferrer"><Github size={15} />GitHub</a>
          </div>
        </header>

        <div className="contact-system__workflow" data-reveal>
          <header className="section-header section-header--sub">
            <div>
              <span className="section-number">CONTACT WORKFLOW</span>
              <h2>One form. A small automation system behind it.</h2>
              <p>This is a working demonstrator, not a decorative contact box. The submission is stored, classified, routed, acknowledged, and assigned a follow-up task.</p>
            </div>
            <span className="contact-stamp">LIVE WORKFLOW</span>
          </header>

          <div className="contact-system__grid">
            <Card className="contact-card">
              <CardHeader>
                <CardTitle>Send a message</CardTitle>
                <p>Required fields are marked with *.</p>
              </CardHeader>
              <CardContent>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <input aria-hidden="true" tabIndex={-1} autoComplete="off" name="botcheck" className="hidden" />
                  <div className="contact-form__row">
                    <label>Name *<input name="name" required maxLength={120} autoComplete="name" /></label>
                    <label>Email *<input name="email" type="email" required maxLength={320} autoComplete="email" /></label>
                  </div>
                  <div className="contact-form__row">
                    <label>Company<input name="company" maxLength={160} autoComplete="organization" /></label>
                    <label>Subject *
                      <select name="subject" required>
                        <option value="">Choose one</option>
                        <option>Job opportunity</option>
                        <option>Internship opportunity</option>
                        <option>Project</option>
                        <option>Collaboration</option>
                        <option>General inquiry</option>
                      </select>
                    </label>
                  </div>
                  <label>Message *<textarea name="message" required maxLength={4000} rows={6} /></label>
                  <div className="contact-form__actions">
                    <Button type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
                      {status === "sending" ? <span className="spinner" aria-hidden="true" /> : <Send className="size-4" />}
                      {status === "sending" ? "Routing your message…" : "Send message"}
                    </Button>
                    <span>No API key is exposed in the browser.</span>
                  </div>
                  {status === "success" && (
                    <div className="contact-result">
                      <div><Check size={15} /> Message processed.</div>
                      <p>The system stored it, classified it, and queued the follow-up path{processingMs !== null ? ` in ${processingMs} ms` : ""}.</p>
                    </div>
                  )}
                  {status === "error" && (
                    <div role="alert" className="contact-error">
                      <div>The message stayed here.</div>
                      <p>{error || "The contact service did not accept the request."} Nothing was silently discarded.</p>
                      <button type="button" onClick={() => setStatus("idle")}>Try again</button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <div className="contact-system__steps">
              {steps.map(([number, title, body]) => (
                <div key={number} className="contact-step">
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </div>
              ))}
              <div className="contact-proof">
                <div><Clock3 /><span>Timestamp</span><b>Recorded at intake</b></div>
                <div><ShieldCheck /><span>Safety</span><b>Secret stays server-side</b></div>
                <div><Mail /><span>Routing</span><b>Owner + visitor email</b></div>
              </div>
              {DASHBOARD_URL && <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer" className="contact-dashboard">Open owner lead dashboard <ArrowRight size={14} /></a>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
