/**
 * Vercel serverless function — POST /api/submit
 * Accepts lead form payloads and emails both owners.
 *
 * Env vars (set in Vercel dashboard):
 *   RESEND_API_KEY   — preferred (https://resend.com)
 *   MAILGUN_API_KEY  — optional fallback
 *   MAILGUN_DOMAIN   — optional fallback
 *   LEAD_FROM_EMAIL  — optional verified sender (default: onboarding@resend.dev for Resend tests)
 */

const NOTIFY_EMAILS = [
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
  return ["name", "phone", "program", "goal"].filter((k) => !lead[k]);
}

function emailBodies(lead) {
  const name = lead.name || "Unknown";
  const subject = `New ${lead.form_type} lead: ${name}`;
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
  if (lead.message) {
    lines.push("", "Message:", lead.message);
  }
  lines.push("", "— Fitness Gurukul Website");
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
  ].filter(Boolean);

  const html =
    `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">` +
    `<h2 style="color:#111;margin:0 0 16px">New ${lead.form_type} lead</h2>` +
    `<table style="border-collapse:collapse;width:100%">` +
    rows
      .map(
        ([label, val]) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#555;width:140px">${label}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111">${String(val)
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</td></tr>`
      )
      .join("") +
    `</table>` +
    (lead.message
      ? `<div style="margin-top:16px;padding:12px;background:#f9f9f9;border-radius:8px"><strong>Message:</strong><br/>${String(
          lead.message
        )
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>")}</div>`
      : "") +
    `<p style="margin-top:24px;color:#888;font-size:13px">— Fitness Gurukul Website</p></div>`;

  return { subject, text, html };
}

async function sendViaResend(lead) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, provider: null };

  const from =
    process.env.LEAD_FROM_EMAIL || "Fitness Gurukul <onboarding@resend.dev>";
  const { subject, text, html } = emailBodies(lead);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: NOTIFY_EMAILS,
      subject,
      text,
      html,
    }),
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
    process.env.LEAD_FROM_EMAIL || `Fitness Gurukul <leads@${domain}>`;
  const { subject, text, html } = emailBodies(lead);
  const form = new URLSearchParams();
  form.set("from", from);
  NOTIFY_EMAILS.forEach((to) => form.append("to", to));
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

async function sendEmailNotification(lead) {
  try {
    const resend = await sendViaResend(lead);
    if (resend.sent) return resend;
    const mailgun = await sendViaMailgun(lead);
    if (mailgun.sent) return mailgun;
    if (!process.env.RESEND_API_KEY && !process.env.MAILGUN_API_KEY) {
      console.warn(
        "No RESEND_API_KEY or MAILGUN_API_KEY set — lead accepted but email not sent."
      );
    }
    return { sent: false, provider: null };
  } catch (err) {
    console.error("Email send failed:", err);
    return { sent: false, provider: null, error: String(err && err.message) };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body && typeof req.body === "object" ? req.body : {};
  const lead = buildLead(payload);
  const missing = missingFields(lead);

  if (missing.length) {
    return res.status(400).json({
      ok: false,
      error: "Missing required fields",
      fields: missing,
    });
  }

  const id = generateId();
  const emailResult = await sendEmailNotification(lead);

  console.log("Lead accepted", {
    id,
    name: lead.name,
    phone: lead.phone,
    form_type: lead.form_type,
    emailSent: emailResult.sent,
    provider: emailResult.provider,
  });

  return res.status(201).json({
    ok: true,
    success: true,
    id,
    message: "Saved.",
    engine: "vercel-function",
    emailSent: !!emailResult.sent,
  });
};
