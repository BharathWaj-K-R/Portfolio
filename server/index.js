import express from "express";
import pg from "pg";
import crypto from "node:crypto";

const { Pool } = pg;

const app = express();
const PORT = Number(process.env.PORT || 10000);
const DATABASE_URL = process.env.DATABASE_URL;
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const DASHBOARD_USER = process.env.DASHBOARD_USER || "owner";
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

if (!DATABASE_URL) console.warn("DATABASE_URL is not configured.");
if (!OWNER_EMAIL) console.warn("OWNER_EMAIL is not configured.");
if (!RESEND_API_KEY) console.warn("RESEND_API_KEY is not configured; email delivery will be skipped.");
if (!DASHBOARD_PASSWORD) console.warn("DASHBOARD_PASSWORD is not configured; dashboard will return 503.");

const pool = DATABASE_URL ? new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
}) : null;

app.set("trust proxy", 1);
app.use(express.json({ limit: "32kb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Idempotency-Key");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const rateBuckets = new Map();
function rateLimit(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const limit = 20;
  const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > limit) {
    return res.status(429).json({ error: "Too many submissions. Please try again later." });
  }
  next();
}

function clean(value, max = 4000) {
  return String(value ?? "").trim().slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function fallbackClassification({ subject, message, company }) {
  const text = `${subject} ${message}`.toLowerCase();

  let intent = "General inquiry";
  if (/job|hiring|career|full[- ]?time|position|role/.test(text)) intent = "Job opportunity";
  else if (/intern|internship/.test(text)) intent = "Internship opportunity";
  else if (/freelance|client|website|automation|build|project/.test(text)) intent = "Project";
  else if (/collab|collaboration|partnership/.test(text)) intent = "Collaboration";

  const urgency = /urgent|asap|today|immediately|deadline|this week/.test(text) ? "high" : "normal";
  const hasCompany = Boolean(company);
  const priority = urgency === "high" ? 90 : intent === "Job opportunity" ? 85 : hasCompany ? 70 : 55;

  return {
    intent,
    urgency,
    priority,
    company: company || null,
    requested_service: intent === "Project" ? "Software / automation implementation" : null,
    summary: message.slice(0, 240),
    source: "heuristic-fallback",
  };
}

async function classifyLead(input) {
  if (!GROQ_API_KEY) return fallbackClassification(input);

  const prompt = [
    "Classify this portfolio contact. Return ONLY valid JSON.",
    JSON.stringify({
      name: input.name,
      email: input.email,
      company: input.company,
      subject: input.subject,
      message: input.message,
    }),
    "Schema:",
    '{"intent":"string","urgency":"low|normal|high","priority":0,"company":"string|null","requested_service":"string|null","summary":"string"}',
    "Priority is 0-100. Never invent facts. Keep summary under 240 characters."
  ].join("\n");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Groq returned ${response.status}`);
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(raw.replace(/^\`\`\`json\s*/i, "").replace(/\s*\`\`\`$/, ""));
    const priority = Math.max(0, Math.min(100, Number(parsed.priority) || 50));
    return {
      intent: clean(parsed.intent, 80) || "General inquiry",
      urgency: ["low", "normal", "high"].includes(parsed.urgency) ? parsed.urgency : "normal",
      priority,
      company: parsed.company ? clean(parsed.company, 160) : input.company || null,
      requested_service: parsed.requested_service ? clean(parsed.requested_service, 160) : null,
      summary: clean(parsed.summary, 240) || input.message.slice(0, 240),
      source: "groq",
    };
  } catch (error) {
    console.warn("AI classification failed; using heuristic fallback:", error.message);
    return fallbackClassification(input);
  }
}

async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY,
      idempotency_key TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      intent TEXT,
      urgency TEXT,
      priority INTEGER NOT NULL DEFAULT 50,
      requested_service TEXT,
      summary TEXT,
      classifier_source TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      task_status TEXT NOT NULL DEFAULT 'open',
      task_due_at TIMESTAMPTZ,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ,
      processing_ms INTEGER,
      owner_email_status TEXT NOT NULL DEFAULT 'pending',
      visitor_email_status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE INDEX IF NOT EXISTS leads_received_idx ON leads(received_at DESC);
    CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
  `);
}

async function sendEmail({ to, subject, html, replyTo }) {
  if (!RESEND_API_KEY || !to) return { ok: false, skipped: true };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [to],
      subject,
      html,
      reply_to: replyTo || undefined,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || `Resend returned ${response.status}`);
  return { ok: true, id: data?.id || null };
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function basicAuth(req, res, next) {
  if (!DASHBOARD_PASSWORD) return res.status(503).send("Dashboard credentials are not configured.");
  const header = req.headers.authorization || "";
  const encoded = header.startsWith("Basic ") ? header.slice(6) : "";
  let user = "", pass = "";
  try {
    [user, pass] = Buffer.from(encoded, "base64").toString("utf8").split(":");
  } catch {}
  if (user !== DASHBOARD_USER || pass !== DASHBOARD_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="Portfolio Leads"');
    return res.status(401).send("Authentication required.");
  }
  next();
}

app.get("/health", async (_req, res) => {
  try {
    if (pool) await pool.query("SELECT 1");
    res.json({ ok: true, database: Boolean(pool), email: Boolean(RESEND_API_KEY && OWNER_EMAIL) });
  } catch {
    res.status(503).json({ ok: false, database: false, email: Boolean(RESEND_API_KEY && OWNER_EMAIL) });
  }
});

app.post("/api/contact", rateLimit, async (req, res) => {
  const startedAt = Date.now();
  const input = {
    name: clean(req.body?.name, 120),
    email: clean(req.body?.email, 320).toLowerCase(),
    phone: clean(req.body?.phone, 40),
    company: clean(req.body?.company, 160),
    subject: clean(req.body?.subject, 120),
    message: clean(req.body?.message, 4000),
    botcheck: clean(req.body?.botcheck, 80),
  };

  if (input.botcheck) return res.status(400).json({ error: "Invalid submission." });
  if (!input.name || !input.subject || !input.message || !validEmail(input.email)) {
    return res.status(400).json({ error: "Please provide a valid name, email, subject, and message." });
  }
  if (!pool) return res.status(503).json({ error: "Contact storage is temporarily unavailable." });

  const idempotencyKey = clean(req.headers["idempotency-key"], 120) || crypto.randomUUID();

  try {
    const existing = await pool.query("SELECT id, status FROM leads WHERE idempotency_key = $1", [idempotencyKey]);
    if (existing.rowCount) return res.status(200).json({ ok: true, leadId: existing.rows[0].id, duplicate: true, status: existing.rows[0].status });

    const classification = await classifyLead(input);
    const leadId = crypto.randomUUID();
    const taskDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO leads
       (id, idempotency_key, name, email, phone, company, subject, message, intent, urgency, priority, requested_service, summary, classifier_source, task_due_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        leadId, idempotencyKey, input.name, input.email, input.phone || null, input.company || null,
        input.subject, input.message, classification.intent, classification.urgency, classification.priority,
        classification.requested_service, classification.summary, classification.source, taskDueAt
      ]
    );

    let ownerStatus = "skipped";
    let visitorStatus = "skipped";

    if (OWNER_EMAIL && RESEND_API_KEY) {
      try {
        await sendEmail({
          to: OWNER_EMAIL,
          replyTo: input.email,
          subject: `New portfolio lead · priority ${classification.priority}/100 · ${classification.intent}`,
          html: `
            <h2>New portfolio contact</h2>
            <p><strong>Priority:</strong> ${classification.priority}/100</p>
            <p><strong>Intent:</strong> ${esc(classification.intent)}</p>
            <p><strong>Urgency:</strong> ${esc(classification.urgency)}</p>
            <p><strong>Name:</strong> ${esc(input.name)}</p>
            <p><strong>Email:</strong> ${esc(input.email)}</p>
            <p><strong>Company:</strong> ${esc(input.company || "—")}</p>
            <p><strong>Subject:</strong> ${esc(input.subject)}</p>
            <p><strong>Summary:</strong> ${esc(classification.summary)}</p>
            <hr />
            <p style="white-space:pre-wrap">${esc(input.message)}</p>
            <p><small>Lead ID: ${esc(leadId)}</small></p>
          `,
        });
        ownerStatus = "sent";
      } catch (error) {
        ownerStatus = "failed";
        console.warn("Owner email failed:", error.message);
      }

      try {
        await sendEmail({
          to: input.email,
          subject: "Thanks for reaching out",
          html: `
            <h2>Message received.</h2>
            <p>Hi ${esc(input.name)},</p>
            <p>Your message reached my portfolio inbox. I’ll review it and respond directly.</p>
            <p><strong>Your request:</strong> ${esc(classification.intent)}</p>
          `,
        });
        visitorStatus = "sent";
      } catch (error) {
        visitorStatus = "failed";
        console.warn("Visitor email failed:", error.message);
      }
    }

    const processedAt = new Date();
    const processingMs = Date.now() - startedAt;
    const finalStatus = ownerStatus === "sent" ? "new" : "needs_attention";

    await pool.query(
      `UPDATE leads
       SET processed_at=$1, processing_ms=$2, owner_email_status=$3, visitor_email_status=$4, status=$5
       WHERE id=$6`,
      [processedAt, processingMs, ownerStatus, visitorStatus, finalStatus, leadId]
    );

    res.status(201).json({
      ok: true,
      leadId,
      status: finalStatus,
      classification,
      processingMs,
      taskDueAt,
      ownerEmail: ownerStatus,
      visitorEmail: visitorStatus,
    });
  } catch (error) {
    console.error("Contact submission failed:", error);
    res.status(500).json({ error: "Unable to process the message right now." });
  }
});

app.get("/api/leads", basicAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database unavailable." });
  const { rows } = await pool.query(`
    SELECT id, name, email, company, subject, intent, urgency, priority, status,
           task_status, task_due_at, received_at, processed_at, processing_ms,
           owner_email_status, visitor_email_status
    FROM leads
    ORDER BY received_at DESC
    LIMIT 200
  `);
  res.json({ leads: rows });
});

app.patch("/api/leads/:id", basicAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: "Database unavailable." });
  const id = clean(req.params.id, 60);
  const status = req.body?.status ? clean(req.body.status, 40) : null;
  const taskStatus = req.body?.taskStatus ? clean(req.body.taskStatus, 40) : null;

  if (!status && !taskStatus) return res.status(400).json({ error: "No update supplied." });

  const values = [];
  const sets = [];
  if (status) {
    values.push(status);
    sets.push(`status=$${values.length}`);
  }
  if (taskStatus) {
    values.push(taskStatus);
    sets.push(`task_status=$${values.length}`);
  }
  values.push(id);

  const result = await pool.query(
    `UPDATE leads SET ${sets.join(", ")} WHERE id=$${values.length} RETURNING id,status,task_status`,
    values
  );
  if (!result.rowCount) return res.status(404).json({ error: "Lead not found." });
  res.json({ ok: true, lead: result.rows[0] });
});

app.get("/dashboard", basicAuth, async (_req, res) => {
  if (!pool) return res.status(503).send("Database unavailable.");
  const { rows } = await pool.query(`
    SELECT id,name,email,company,subject,intent,urgency,priority,status,task_status,
           task_due_at,received_at,processing_ms,owner_email_status,visitor_email_status
    FROM leads ORDER BY received_at DESC LIMIT 200
  `);

  const rowsHtml = rows.length
    ? rows.map((lead) => `
      <tr>
        <td><strong>${esc(lead.name)}</strong><br><small>${esc(lead.company || "")}</small></td>
        <td>${esc(lead.email)}</td>
        <td>${esc(lead.intent || lead.subject)}<br><small>priority ${esc(lead.priority)}/100 · ${esc(lead.urgency)}</small></td>
        <td><span class="pill">${esc(lead.status)}</span><br><small>task: ${esc(lead.task_status)}</small></td>
        <td>${esc(new Date(lead.received_at).toLocaleString("en-IN"))}<br><small>${lead.processing_ms ?? "—"} ms</small></td>
      </tr>
    `).join("")
    : '<tr><td colspan="5">No leads yet.</td></tr>';

  res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portfolio Lead Dashboard</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#f7f7f5;color:#161616;margin:0}
main{max-width:1200px;margin:0 auto;padding:32px 20px}
h1{letter-spacing:-.03em;margin:0 0 6px}
p{color:#666}
.card{background:#fff;border:1px solid #e5e5e5;border-radius:16px;padding:18px;margin:20px 0}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{padding:12px;border-bottom:1px solid #eee;text-align:left;vertical-align:top}
th{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#777}
.pill{display:inline-block;padding:3px 8px;border:1px solid #ddd;border-radius:999px;background:#fafafa}
small{color:#777}
</style></head>
<body><main>
<h1>Portfolio Lead Dashboard</h1>
<p>Every submission is timestamped, classified, notified, and assigned a follow-up task.</p>
<div class="card">
<table><thead><tr><th>Lead</th><th>Contact</th><th>Intent</th><th>Status</th><th>Received</th></tr></thead>
<tbody>${rowsHtml}</tbody></table>
</div>
</main></body></html>`);
});

(async () => {
  try {
    await ensureSchema();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Portfolio contact API listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
})();
