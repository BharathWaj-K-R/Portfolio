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
const DEMO_MODE = process.env.DEMO_MODE === "true";
const CLEAR_LEADS_TOKEN = process.env.CLEAR_LEADS_TOKEN;
const CLEAR_LEADS_ON_BOOT = process.env.CLEAR_LEADS_ON_BOOT === "true";
const memoryLeads = [];

if (!DATABASE_URL && !DEMO_MODE) console.warn("DATABASE_URL is not configured.");
if (!OWNER_EMAIL) console.warn("OWNER_EMAIL is not configured.");
if (!RESEND_API_KEY) console.warn("RESEND_API_KEY is not configured; email delivery will be skipped.");
if (!DASHBOARD_PASSWORD) console.warn("DASHBOARD_PASSWORD is not configured; dashboard will return 503.");
if (DEMO_MODE) console.warn("DEMO_MODE=true: lead storage is in-memory and will reset on restart/deploy.");

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
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, "").replace(/\s*```$/, ""));
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
  if (!pool || DEMO_MODE) return;
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
    res.json({ ok: true, database: Boolean(pool) || DEMO_MODE, demoMode: DEMO_MODE, email: Boolean(RESEND_API_KEY && OWNER_EMAIL) });
  } catch {
    res.status(503).json({ ok: false, database: false, demoMode: DEMO_MODE, email: Boolean(RESEND_API_KEY && OWNER_EMAIL) });
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
  if (!pool && !DEMO_MODE) return res.status(503).json({ error: "Contact storage is temporarily unavailable." });

  const idempotencyKey = clean(req.headers["idempotency-key"], 120) || crypto.randomUUID();

  try {
    if (DEMO_MODE) {
      const existing = memoryLeads.find((lead) => lead.idempotency_key === idempotencyKey);
      if (existing) return res.status(200).json({ ok: true, leadId: existing.id, duplicate: true, status: existing.status });
    } else {
      const existing = await pool.query("SELECT id, status FROM leads WHERE idempotency_key = $1", [idempotencyKey]);
      if (existing.rowCount) return res.status(200).json({ ok: true, leadId: existing.rows[0].id, duplicate: true, status: existing.rows[0].status });
    }

    const classification = await classifyLead(input);
    const leadId = crypto.randomUUID();
    const taskDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const receivedAt = new Date();
    const baseLead = {
      id: leadId, idempotency_key: idempotencyKey, name: input.name, email: input.email, phone: input.phone || null,
      company: input.company || null, subject: input.subject, message: input.message, intent: classification.intent,
      urgency: classification.urgency, priority: classification.priority, requested_service: classification.requested_service,
      summary: classification.summary, classifier_source: classification.source, status: "new", task_status: "open",
      task_due_at: taskDueAt.toISOString(), received_at: receivedAt.toISOString(), processed_at: null, processing_ms: null,
      owner_email_status: "pending", visitor_email_status: "pending"
    };

    if (DEMO_MODE) {
      memoryLeads.unshift(baseLead);
    } else {
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
    }

    let ownerStatus = "skipped";
    let visitorStatus = "skipped";

    if (OWNER_EMAIL && RESEND_API_KEY) {
      try {
        await sendEmail({
          to: OWNER_EMAIL,
          replyTo: input.email,
          subject: `${input.name} reached out · ${classification.intent}`,
          html: `
            <div style="margin:0;padding:28px 12px;background:#eef1f6;font-family:Arial,Helvetica,sans-serif;color:#20243a">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:660px;margin:0 auto;background:#ffffff;border:1px solid #d8dce6">
                <tr><td style="padding:0"><div style="height:7px;background:#20243a"></div>
                  <div style="padding:28px 30px 22px;border-bottom:1px solid #d3d1c6">
                    <p style="margin:0 0 9px;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#6b6c64">Bharath Waj K R · Portfolio</p>
                    <h1 style="margin:0;font-size:28px;line-height:1.15;letter-spacing:-.6px;color:#ffffff">Someone reached out.</h1>
                    <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#dfe4f2">A new conversation came through the contact form.</p>
                  </div>
                  <div style="padding:26px 30px">
                    <p style="margin:0 0 18px;font-size:16px;line-height:1.55">Hi Bharath, <strong>${esc(input.name)}</strong> is reaching out about <strong>${esc(classification.intent.toLowerCase())}</strong>.</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d8dce6;background:#f3f5fa"><tr><td style="padding:18px 20px;border-left:4px solid #ff7a66;background:#fff6f3">
                      <p style="margin:0 0 8px;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#ff6b55">Their message</p>
                      <p style="margin:0;font-size:15px;line-height:1.75;white-space:pre-wrap">${esc(input.message)}</p>
                    </td></tr></table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;font-size:13px;line-height:1.5">
                      <tr><td width="110" style="padding:7px 0;color:#687087">From</td><td style="padding:7px 0"><strong>${esc(input.name)}</strong> · ${esc(input.email)}</td></tr>
                      <tr><td style="padding:7px 0;color:#687087">Company</td><td style="padding:7px 0">${esc(input.company || 'Not provided')}</td></tr>
                      <tr><td style="padding:7px 0;color:#687087">Subject</td><td style="padding:7px 0">${esc(input.subject)}</td></tr>
                      <tr><td style="padding:7px 0;color:#687087">Priority</td><td style="padding:7px 0"><strong>${classification.priority}/100</strong> · ${esc(classification.urgency)} urgency</td></tr>
                    </table>
                    <p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #d3d1c6;color:#596176;font-size:13px;line-height:1.6">Reply directly to this email to continue the conversation with ${esc(input.name)}.</p>
                  </div>
                  <div style="padding:14px 30px;border-top:1px solid #d3d1c6;color:#7b8397;font-size:10px">Lead ${esc(leadId)} · Contact workflow</div>
                </td></tr>
              </table>
            </div>
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
          subject: `Got your message, ${input.name}`,
          html: `
            <div style="margin:0;padding:28px 12px;background:#eef1f6;font-family:Arial,Helvetica,sans-serif;color:#20243a">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:660px;margin:0 auto;background:#ffffff;border:1px solid #d8dce6">
                <tr><td style="padding:0"><div style="height:7px;background:#20243a"></div>
                  <div style="padding:28px 30px 22px;border-bottom:1px solid #d3d1c6">
                    <p style="margin:0 0 9px;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#6b6c64">Bharath Waj K R</p>
                    <h1 style="margin:0;font-size:28px;line-height:1.15;letter-spacing:-.6px;color:#ffffff">Thanks for reaching out.</h1>
                  </div>
                  <div style="padding:26px 30px">
                    <p style="margin:0 0 14px;font-size:16px;line-height:1.55">Hi ${esc(input.name)},</p>
                    <p style="margin:0;font-size:15px;line-height:1.75">I’ve received your message about <strong>${esc(classification.intent.toLowerCase())}</strong>. It’s safely in my inbox, and I’ll take a look and get back to you directly.</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border:1px solid #d8dce6;background:#f3f5fa"><tr><td style="padding:16px 18px;border-left:4px solid #5b7cfa;background:#f3f6ff">
                      <p style="margin:0 0 7px;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#5b7cfa">You wrote</p>
                      <p style="margin:0;color:#596176;font-size:14px;line-height:1.7;white-space:pre-wrap">${esc(input.message)}</p>
                    </td></tr></table>
                    <p style="margin:20px 0 0;color:#596176;font-size:13px;line-height:1.7">No need to resend anything. Your original message is already attached to the contact request.</p>
                    <p style="margin:24px 0 0;font-size:14px;line-height:1.6">Thanks,<br /><strong>Bharath</strong></p>
                  </div>
                  <div style="padding:14px 30px;border-top:1px solid #d3d1c6;color:#7b8397;font-size:10px">Automatic acknowledgement from Bharath’s portfolio contact form.</div>
                </td></tr>
              </table>
            </div>
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

    if (DEMO_MODE) {
      const lead = memoryLeads.find((item) => item.id === leadId);
      if (lead) Object.assign(lead, { processed_at: processedAt.toISOString(), processing_ms: processingMs, owner_email_status: ownerStatus, visitor_email_status: visitorStatus, status: finalStatus });
    } else {
      await pool.query(
        `UPDATE leads
         SET processed_at=$1, processing_ms=$2, owner_email_status=$3, visitor_email_status=$4, status=$5
         WHERE id=$6`,
        [processedAt, processingMs, ownerStatus, visitorStatus, finalStatus, leadId]
      );
    }

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

app.post("/api/admin/clear-leads", async (req, res) => {
  if (!CLEAR_LEADS_TOKEN || req.headers["x-clear-leads-token"] !== CLEAR_LEADS_TOKEN) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    if (DEMO_MODE) {
      const deleted = memoryLeads.length;
      memoryLeads.length = 0;
      return res.json({ ok: true, deleted });
    }
    if (!pool) return res.status(503).json({ error: "Database unavailable." });
    const result = await pool.query("DELETE FROM leads");
    res.json({ ok: true, deleted: result.rowCount });
  } catch (error) {
    console.error("Lead purge failed:", error);
    res.status(500).json({ error: "Unable to clear leads." });
  }
});

app.get("/api/leads", basicAuth, async (req, res) => {
  if (!pool && !DEMO_MODE) return res.status(503).json({ error: "Database unavailable." });
  if (DEMO_MODE) return res.json({ leads: memoryLeads.slice(0, 200) });
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
  if (!pool && !DEMO_MODE) return res.status(503).json({ error: "Database unavailable." });
  if (DEMO_MODE) {
    const lead = memoryLeads.find((item) => item.id === req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found." });
    if (req.body?.status) lead.status = clean(req.body.status, 40);
    if (req.body?.taskStatus) lead.task_status = clean(req.body.taskStatus, 40);
    return res.json({ ok: true, lead: { id: lead.id, status: lead.status, task_status: lead.task_status } });
  }
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
  if (!pool && !DEMO_MODE) return res.status(503).send("Database unavailable.");
  const rows = DEMO_MODE ? memoryLeads.slice(0, 200) : (await pool.query(`
    SELECT id,name,email,company,subject,intent,urgency,priority,status,task_status,
           task_due_at,received_at,processing_ms,owner_email_status,visitor_email_status
    FROM leads ORDER BY received_at DESC LIMIT 200
  `)).rows;

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
    if (CLEAR_LEADS_ON_BOOT && pool && !DEMO_MODE) {
      const result = await pool.query("DELETE FROM leads");
      console.log(`One-time lead purge completed: ${result.rowCount} rows deleted.`);
    }
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Portfolio contact API listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
})();
