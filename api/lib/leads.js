/**
 * Shared lead helpers for Vercel serverless functions (no npm deps).
 *
 * Email providers (first success wins):
 *   1. RESEND_API_KEY
 *   2. MAILGUN_API_KEY + MAILGUN_DOMAIN
 *   3. FormSubmit.co (no key — uses LEAD_NOTIFY_EMAIL / contact inbox)
 *
 * Optional durable store:
 *   BLOB_READ_WRITE_TOKEN → Vercel Blob JSON list at LEAD_BLOB_PATH
 */

const DEFAULT_NOTIFY = [
  "contact@fitnessgurukul.co.in",
  "fitnessgurukul01@gmail.com",
];

function clip(val, max) {
  return String(val == null ? "" : val).trim().slice(0, max);
}

function generateId() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function notifyEmails() {
  const raw =
    process.env.LEAD_NOTIFY_EMAIL ||
    process.env.FG_LEAD_EMAIL ||
    "";
  if (!raw.trim()) return DEFAULT_NOTIFY.slice();
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildLead(payload) {
  const formType = clip(payload.form_type, 64) || "consultation";
  return {
    form_type: formType,
    name: clip(payload.name || payload.contact_name, 120),
    phone: clip(payload.phone, 40),
    email: clip(payload.email, 160),
    program: clip(payload.program, 120),
    goal: clip(payload.goal, 200),
    message: clip(payload.message, 2000),
    coach: clip(payload.coach, 120),
    company: clip(payload.company, 160),
    event_type: clip(payload.event_type, 120),
    attendees: clip(payload.attendees, 80),
    preferred_date: clip(payload.preferred_date, 80),
    budget: clip(payload.budget, 80),
    location: clip(payload.location, 160),
  };
}

function missingFields(lead) {
  if (lead.form_type === "corporate_event") {
    return ["company", "name", "email", "phone", "event_type", "attendees"].filter(
      (k) => !lead[k]
    );
  }
  if (lead.form_type === "challenge-join") {
    return ["name", "phone"].filter((k) => !lead[k]);
  }
  // Soft forms (event_rsvp etc.): require name + phone at minimum
  if (lead.form_type === "event_rsvp") {
    return ["name", "phone"].filter((k) => !lead[k]);
  }
  return ["name", "phone", "program", "goal"].filter((k) => !lead[k]);
}

function emailBodies(lead) {
  const name = lead.name || "Unknown";
  const subject = `[FG Lead] ${lead.form_type}: ${name}`;
  const lines = [
    "New lead from the Fitness Gurukul website",
    "",
    `Name: ${name}`,
    `Phone: ${lead.phone || "—"}`,
    `Email: ${lead.email || "—"}`,
    `Program: ${lead.program || "—"}`,
    `Goal: ${lead.goal || "—"}`,
    `Coach: ${lead.coach || "—"}`,
    `Form: ${lead.form_type}`,
  ];
  if (lead.company) lines.push(`Company: ${lead.company}`);
  if (lead.event_type) lines.push(`Event: ${lead.event_type}`);
  if (lead.attendees) lines.push(`Attendees: ${lead.attendees}`);
  if (lead.preferred_date) lines.push(`Preferred date: ${lead.preferred_date}`);
  if (lead.budget) lines.push(`Budget: ${lead.budget}`);
  if (lead.location) lines.push(`Location: ${lead.location}`);
  if (lead.id) lines.push(`ID: ${lead.id}`);
  if (lead.message) {
    lines.push("", "Message:", lead.message);
  }
  lines.push("", "— Fitness Gurukul Website (Vercel)");
  const text = lines.join("\n");

  const rows = [
    ["Name", name],
    ["Phone", lead.phone || "—"],
    ["Email", lead.email || "—"],
    ["Program", lead.program || "—"],
    ["Goal", lead.goal || "—"],
    ["Coach", lead.coach || "—"],
    ["Form type", lead.form_type],
    lead.company ? ["Company", lead.company] : null,
    lead.event_type ? ["Event type", lead.event_type] : null,
    lead.attendees ? ["Attendees", lead.attendees] : null,
    lead.preferred_date ? ["Preferred date", lead.preferred_date] : null,
    lead.budget ? ["Budget", lead.budget] : null,
    lead.location ? ["Location", lead.location] : null,
    lead.id ? ["ID", lead.id] : null,
  ].filter(Boolean);

  const esc = (v) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const html =
    `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">` +
    `<h2 style="color:#111;margin:0 0 16px">New ${esc(lead.form_type)} lead</h2>` +
    `<table style="border-collapse:collapse;width:100%">` +
    rows
      .map(
        ([label, val]) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#555;width:140px">${esc(
            label
          )}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111">${esc(
            val
          )}</td></tr>`
      )
      .join("") +
    `</table>` +
    (lead.message
      ? `<div style="margin-top:16px;padding:12px;background:#f9f9f9;border-radius:8px"><strong>Message:</strong><br/>${esc(
          lead.message
        ).replace(/\n/g, "<br/>")}</div>`
      : "") +
    `<p style="margin-top:24px;color:#888;font-size:13px">— Fitness Gurukul Website</p></div>`;

  return { subject, text, html };
}

async function sendViaResend(lead) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, provider: null };

  const from =
    process.env.LEAD_FROM_EMAIL ||
    process.env.FG_MAIL_FROM ||
    "Fitness Gurukul <onboarding@resend.dev>";
  const { subject, text, html } = emailBodies(lead);
  const to = notifyEmails();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error:", res.status, body);
    return { sent: false, provider: "resend", error: body };
  }
  return { sent: true, provider: "resend" };
}

async function sendViaMailgun(lead) {
  const key = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  if (!key || !domain) return { sent: false, provider: null };

  const from =
    process.env.LEAD_FROM_EMAIL ||
    process.env.FG_MAIL_FROM ||
    `Fitness Gurukul <leads@${domain}>`;
  const { subject, text, html } = emailBodies(lead);
  const form = new URLSearchParams();
  form.set("from", from);
  notifyEmails().forEach((to) => form.append("to", to));
  form.set("subject", subject);
  form.set("text", text);
  form.set("html", html);

  const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`api:${key}`).toString("base64"),
    },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Mailgun error:", res.status, body);
    return { sent: false, provider: "mailgun", error: body };
  }
  return { sent: true, provider: "mailgun" };
}

/** Keyless fallback — first use requires inbox confirmation from FormSubmit. */
async function sendViaFormSubmit(lead) {
  if (process.env.FORMSUBMIT_DISABLE === "1") {
    return { sent: false, provider: null };
  }
  const to = notifyEmails()[0];
  if (!to) return { sent: false, provider: null };

  const { subject, text } = emailBodies(lead);
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: subject,
      _template: "table",
      _captcha: "false",
      name: lead.name || "Lead",
      phone: lead.phone || "",
      email: lead.email || "noreply@fitnessgurukul.co.in",
      program: lead.program || "",
      goal: lead.goal || "",
      coach: lead.coach || "",
      form_type: lead.form_type || "",
      company: lead.company || "",
      event_type: lead.event_type || "",
      message: lead.message || text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("FormSubmit error:", res.status, body);
    return { sent: false, provider: "formsubmit", error: body };
  }
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  // FormSubmit returns success even when awaiting email confirmation.
  return {
    sent: true,
    provider: "formsubmit",
    note: data.message || "queued",
  };
}

async function sendEmailNotification(lead) {
  try {
    const resend = await sendViaResend(lead);
    if (resend.sent) return resend;
    const mailgun = await sendViaMailgun(lead);
    if (mailgun.sent) return mailgun;
    const formsubmit = await sendViaFormSubmit(lead);
    if (formsubmit.sent) return formsubmit;
    console.warn(
      "No email provider succeeded (set RESEND_API_KEY for reliable delivery)."
    );
    return { sent: false, provider: null };
  } catch (err) {
    console.error("Email send failed:", err);
    return { sent: false, provider: null, error: String(err && err.message) };
  }
}

function blobPath() {
  return (
    process.env.LEAD_BLOB_PATH ||
    process.env.FG_LEAD_BLOB_PATH ||
    "fitness-gurukul/leads/submissions.json"
  );
}

async function blobListUrl(pathname) {
  // Resolve existing blob URL via list API when possible.
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  const url =
    "https://blob.vercel-storage.com?" +
    new URLSearchParams({ prefix: pathname, limit: "1" }).toString();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const blobs = data.blobs || [];
  return blobs[0] && blobs[0].url ? blobs[0].url : null;
}

async function loadSubmissions() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];
  try {
    const existing = await blobListUrl(blobPath());
    if (!existing) return [];
    const res = await fetch(existing, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("loadSubmissions failed:", err);
    return [];
  }
}

async function saveSubmissions(rows) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return { saved: false, reason: "no_blob_token" };
  try {
    const pathname = blobPath();
    const body = JSON.stringify(rows.slice(0, 2000), null, 2);
    const res = await fetch(
      "https://blob.vercel-storage.com?pathname=" +
        encodeURIComponent(pathname) +
        "&contentType=" +
        encodeURIComponent("application/json") +
        "&addRandomSuffix=false&allowOverwrite=true",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-api-version": "7",
        },
        body,
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("Blob save failed:", res.status, text);
      return { saved: false, reason: text };
    }
    return { saved: true };
  } catch (err) {
    console.error("saveSubmissions failed:", err);
    return { saved: false, reason: String(err && err.message) };
  }
}

async function persistLead(lead) {
  const rows = await loadSubmissions();
  const row = Object.assign({}, lead, {
    status: lead.status || "new",
    created_at: lead.created_at || Math.floor(Date.now() / 1000),
    source: lead.source || "vercel-function",
    emailed_at: lead.emailed_at || null,
    digested_at: lead.digested_at || null,
  });
  rows.unshift(row);
  const result = await saveSubmissions(rows);
  return { ...result, row, count: rows.length };
}

function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, X-Admin-Token, Authorization"
  );
  res.setHeader("Cache-Control", "no-store");
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  return {};
}

async function acceptLead(payload, extras) {
  const lead = buildLead(payload || {});
  if (extras) Object.assign(lead, extras);
  const missing = missingFields(lead);
  if (missing.length) {
    return {
      status: 400,
      body: { ok: false, error: "Missing required fields", fields: missing },
    };
  }

  const id = generateId();
  lead.id = id;
  lead.created_at = Math.floor(Date.now() / 1000);
  lead.source = "vercel-function";

  const emailResult = await sendEmailNotification(lead);
  if (emailResult.sent) {
    lead.emailed_at = Math.floor(Date.now() / 1000);
  }

  const store = await persistLead(lead);

  console.log("Lead accepted", {
    id,
    name: lead.name,
    phone: lead.phone,
    form_type: lead.form_type,
    emailSent: emailResult.sent,
    provider: emailResult.provider,
    stored: !!store.saved,
  });

  return {
    status: 201,
    body: {
      ok: true,
      success: true,
      id,
      message: "Thank you! We'll be in touch shortly.",
      engine: "vercel-function",
      emailed: !!emailResult.sent,
      emailProvider: emailResult.provider || null,
      savedToBackend: !!store.saved,
    },
  };
}

function isVercelCron(req) {
  const headers = req.headers || {};
  return (
    headers["x-vercel-cron"] === "1" ||
    headers["X-Vercel-Cron"] === "1"
  );
}

function requireAdmin(req) {
  // Vercel Cron invocations (schedule in vercel.json).
  if (isVercelCron(req)) {
    const cronSecret = process.env.CRON_SECRET || "";
    if (!cronSecret) return true;
    const auth = (req.headers.authorization || req.headers.Authorization || "") + "";
    if (auth === `Bearer ${cronSecret}`) return true;
    // Allow x-vercel-cron without bearer when CRON_SECRET unset/mismatched only if no secret configured.
    return false;
  }

  const expected =
    process.env.ADMIN_TOKEN ||
    process.env.FG_ADMIN_TOKEN ||
    process.env.CRON_TOKEN ||
    process.env.CRON_SECRET ||
    "";
  if (!expected) return false;
  const header =
    (req.headers["x-admin-token"] ||
      req.headers["X-Admin-Token"] ||
      "") + "";
  let provided = header.trim();
  const auth = (req.headers.authorization || req.headers.Authorization || "") + "";
  if (!provided && auth.toLowerCase().startsWith("bearer ")) {
    provided = auth.slice(7).trim();
  }
  if (!provided && req.query && req.query.token) {
    provided = String(req.query.token);
  }
  return provided && provided === expected;
}

module.exports = {
  clip,
  generateId,
  buildLead,
  missingFields,
  sendEmailNotification,
  loadSubmissions,
  saveSubmissions,
  persistLead,
  applyCors,
  readJsonBody,
  acceptLead,
  requireAdmin,
  isVercelCron,
  notifyEmails,
  emailBodies,
};
