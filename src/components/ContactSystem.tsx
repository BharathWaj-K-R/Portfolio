import { FormEvent, useState } from "react"
import { ArrowRight, Check, Clock3, Mail, Send, ShieldCheck, Workflow } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
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
    <section id="contact" className="content-section contact-system">
      <div className="container-wide reveal">
        <div className="section-head">
          <div>
            <div className="eyebrow">08 · Contact workflow</div>
            <h2 className="section-title">One form. A small automation system behind it.</h2>
            <p className="section-intro">
              This is a working demonstrator, not a decorative contact box. The submission is stored, classified,
              routed, acknowledged, and assigned a follow-up task.
            </p>
          </div>
          <Badge variant="outline"><Workflow className="size-3.5" /> Live workflow</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">Send a message</CardTitle>
              <p className="text-sm leading-6 text-neutral-600">Required fields are marked with *.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input aria-hidden="true" tabIndex={-1} autoComplete="off" name="botcheck" className="hidden" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    Name *
                    <input name="name" required maxLength={120} autoComplete="name" className="h-11 w-full rounded-none border border-neutral-300 bg-white px-3 outline-none focus:border-black" />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Email *
                    <input name="email" type="email" required maxLength={320} autoComplete="email" className="h-11 w-full rounded-none border border-neutral-300 bg-white px-3 outline-none focus:border-black" />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    Company
                    <input name="company" maxLength={160} autoComplete="organization" className="h-11 w-full rounded-none border border-neutral-300 bg-white px-3 outline-none focus:border-black" />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Subject *
                    <select name="subject" required className="h-11 w-full rounded-none border border-neutral-300 bg-white px-3">
                      <option value="">Choose one</option>
                      <option>Job opportunity</option>
                      <option>Internship opportunity</option>
                      <option>Project</option>
                      <option>Collaboration</option>
                      <option>General inquiry</option>
                    </select>
                  </label>
                </div>
                <label className="space-y-2 text-sm font-medium">
                  Message *
                  <textarea name="message" required maxLength={4000} rows={6} className="w-full rounded-none border border-neutral-300 bg-white p-3 outline-none focus:border-black" />
                </label>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
                    {status === "sending" ? <span className="spinner" aria-hidden="true" /> : <Send className="size-4" />}
                    {status === "sending" ? "Routing your message…" : "Send message"}
                  </Button>
                  <span className="text-xs text-neutral-500">No API key is exposed in the browser.</span>
                </div>

                {status === "success" && (
                  <div className="border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6">
                    <div className="flex items-center gap-2 font-semibold"><Check className="size-4" /> Message processed.</div>
                    <p className="mt-1 text-neutral-600">
                      The system stored it, classified it, and queued the follow-up path
                      {processingMs !== null ? ` in ${processingMs} ms` : ""}.
                    </p>
                  </div>
                )}

                {status === "error" && (
                  <div role="alert" className="error-state p-4 text-sm leading-6">
                    <div className="font-semibold">The message stayed here.</div>
                    <p className="mt-1">{error || "The contact service did not accept the request."} Nothing was silently discarded.</p>
                    <button type="button" className="filter-pill mt-3" onClick={() => setStatus("idle")}>Try again</button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {steps.map(([number, title, body]) => (
              <div key={number} className="border border-neutral-200 p-5">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs text-neutral-400">{number}</span>
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold"><ArrowRight className="size-4" />{title}</div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{body}</p>
                  </div>
                </div>
              </div>
            ))}
            <Card className="bg-neutral-950 text-white shadow-none">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
                <div><Clock3 className="size-4 opacity-70" /><div className="mt-2 text-xs uppercase tracking-wide opacity-60">Timestamp</div><div className="mt-1 text-sm">Recorded at intake</div></div>
                <div><ShieldCheck className="size-4 opacity-70" /><div className="mt-2 text-xs uppercase tracking-wide opacity-60">Safety</div><div className="mt-1 text-sm">Secret stays server-side</div></div>
                <div><Mail className="size-4 opacity-70" /><div className="mt-2 text-xs uppercase tracking-wide opacity-60">Routing</div><div className="mt-1 text-sm">Owner + visitor email</div></div>
              </CardContent>
            </Card>
            {DASHBOARD_URL && (
              <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer" className="inline-link">
                Open owner lead dashboard <ArrowRight className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
