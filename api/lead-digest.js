/**
 * Vercel serverless — GET|POST /api/lead-digest
 * Combined email of undigested leads (cron every 12h).
 *
 * vercel.json cron example:
 *   path /api/lead-digest , schedule 0 every-12-hours
 */
const {
  applyCors,
  requireAdmin,
  loadSubmissions,
  saveSubmissions,
  sendEmailNotification,
  emailBodies,
  notifyEmails,
} = require("./lib/leads");

async function sendDigest(leads, hours) {
  if (!leads.length) return { sent: true, empty: true };

  // Reuse Resend/Mailgun/FormSubmit by sending one synthetic "lead" body.
  const count = leads.length;
  const subject = `[FG Digest] ${count} lead${count === 1 ? "" : "s"} in last ${hours}h`;
  const chunks = [
    "Fitness Gurukul combined lead digest",
    `Window: last ${hours} hours`,
    `Total: ${count}`,
    "-".repeat(40),
    "",
  ];
  leads.forEach((lead, i) => {
    chunks.push(`#${i + 1}`);
    const { text } = emailBodies(lead);
    chunks.push(text, "");
  });

  const synthetic = {
    form_type: "digest",
    name: `${count} leads`,
    phone: "—",
    email: notifyEmails()[0] || "",
    program: "digest",
    goal: `${hours}h window`,
    message: chunks.join("\n"),
    id: "digest-" + Date.now(),
  };

  // Override subject via message-only path using sendEmailNotification internals:
  // sendEmailNotification builds subject from form_type — force digest fields.
  const result = await sendEmailNotification(synthetic);
  return result;
}

module.exports = async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requireAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const hours = Math.max(
    1,
    parseInt(process.env.LEAD_DIGEST_HOURS || process.env.FG_LEAD_DIGEST_HOURS || "12", 10) || 12
  );
  const mode = (
    process.env.LEAD_NOTIFY_MODE ||
    process.env.FG_LEAD_NOTIFY_MODE ||
    "both"
  ).toLowerCase();

  if (mode === "off" || mode === "instant") {
    return res.status(200).json({
      ok: true,
      sent: false,
      reason:
        mode === "off"
          ? "lead_notify_mode=off"
          : "lead_notify_mode=instant (digest disabled)",
      hours,
    });
  }

  const since = Math.floor(Date.now() / 1000) - hours * 3600;
  const rows = await loadSubmissions();
  const pending = rows
    .filter((r) => (r.created_at || 0) >= since && !r.digested_at)
    .sort((a, b) => (a.created_at || 0) - (b.created_at || 0));

  if (!pending.length) {
    return res.status(200).json({
      ok: true,
      sent: false,
      reason: "no_new_leads",
      count: 0,
      hours,
    });
  }

  const mail = await sendDigest(pending, hours);
  if (!mail.sent) {
    return res.status(500).json({
      ok: false,
      sent: false,
      error: "email send failed",
      count: pending.length,
      hours,
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const ids = new Set(pending.map((p) => p.id));
  const updated = rows.map((r) =>
    ids.has(r.id) ? Object.assign({}, r, { digested_at: now }) : r
  );
  await saveSubmissions(updated);

  return res.status(200).json({
    ok: true,
    sent: true,
    count: pending.length,
    hours,
    mode,
    engine: "vercel-function",
  });
};
