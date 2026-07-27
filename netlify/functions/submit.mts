import type { Context, Config } from "@netlify/functions";

const NOTIFY_EMAILS = [
  "contact@fitnessgurukul.co.in",
  "fitnessgurukul01@gmail.com",
];

const REQUIRED_CONSULT = ["name", "phone", "program", "goal"] as const;
const REQUIRED_CORPORATE = [
  "company",
  "contact_name",
  "email",
  "phone",
  "event_type",
  "attendees",
] as const;

function clip(val: unknown, max: number): string {
  return String(val ?? "").trim().slice(0, max);
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendEmailNotification(lead: Record<string, string>) {
  const mailgunKey = Netlify.env.get("MAILGUN_API_KEY");
  const mailgunDomain = Netlify.env.get("MAILGUN_DOMAIN");

  if (!mailgunKey || !mailgunDomain) {
    console.warn("Mailgun not configured — skipping email notification.");
    return;
  }

  const name = lead.name || lead.contact_name || "Unknown";
  const phone = lead.phone || "—";
  const email = lead.email || "—";
  const program = lead.program || "—";
  const goal = lead.goal || "—";
  const coach = lead.coach || "—";
  const formType = lead.form_type || "consultation";
  const message = lead.message || "";

  const subject = `New ${formType} lead: ${name}`;
  const textBody = [
    `New lead from the Fitness Gurukul website`,
    ``,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Program: ${program}`,
    `Goal: ${goal}`,
    `Coach: ${coach}`,
    `Form: ${formType}`,
    lead.company ? `Company: ${lead.company}` : "",
    lead.event_type ? `Event: ${lead.event_type}` : "",
    lead.attendees ? `Attendees: ${lead.attendees}` : "",
    lead.preferred_date ? `Preferred date: ${lead.preferred_date}` : "",
    lead.budget ? `Budget: ${lead.budget}` : "",
    lead.location ? `Location: ${lead.location}` : "",
    message ? `\nMessage:\n${message}` : "",
    ``,
    `— Fitness Gurukul Website`,
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#111;margin:0 0 16px">New ${formType} lead</h2>
      <table style="border-collapse:collapse;width:100%">
        ${[
          ["Name", name],
          ["Phone", phone],
          ["Email", email],
          ["Program", program],
          ["Goal", goal],
          ["Coach", coach],
          ["Form type", formType],
          lead.company ? ["Company", lead.company] : null,
          lead.event_type ? ["Event type", lead.event_type] : null,
          lead.attendees ? ["Attendees", lead.attendees] : null,
          lead.preferred_date ? ["Preferred date", lead.preferred_date] : null,
          lead.budget ? ["Budget", lead.budget] : null,
          lead.location ? ["Location", lead.location] : null,
        ]
          .filter(Boolean)
          .map(
            ([label, val]) =>
              `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#555;width:140px">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111">${val}</td></tr>`
          )
          .join("")}
      </table>
      ${message ? `<div style="margin-top:16px;padding:12px;background:#f9f9f9;border-radius:8px"><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</div>` : ""}
      <p style="margin-top:24px;color:#888;font-size:13px">— Fitness Gurukul Website</p>
    </div>`;

  const form = new URLSearchParams();
  form.set("from", `Fitness Gurukul <leads@${mailgunDomain}>`);
  NOTIFY_EMAILS.forEach((to) => form.append("to", to));
  form.set("subject", subject);
  form.set("text", textBody);
  form.set("html", htmlBody);

  try {
    const res = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`api:${mailgunKey}`),
        },
        body: form,
      }
    );
    if (!res.ok) {
      const body = await res.text();
      console.error("Mailgun error:", res.status, body);
    } else {
      console.log("Email notification sent to", NOTIFY_EMAILS.join(", "));
    }
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Accept" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formType = clip(payload.form_type, 64) || "consultation";
  const lead: Record<string, string> = {
    form_type: formType,
    name: clip(payload.name ?? payload.contact_name, 120),
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

  const required =
    formType === "corporate_event" ? REQUIRED_CORPORATE : REQUIRED_CONSULT;
  const missing = required.filter((f) => {
    const key = f === "contact_name" ? "name" : f;
    return !lead[key];
  });

  if (missing.length) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing required fields", fields: missing }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = generateId();

  await sendEmailNotification(lead);

  return new Response(
    JSON.stringify({ ok: true, success: true, id, message: "Saved.", engine: "netlify-function" }),
    { status: 201, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
  );
};

export const config: Config = {
  path: "/api/submit",
  method: ["POST", "OPTIONS"],
};
