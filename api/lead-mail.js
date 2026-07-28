/**
 * Vercel serverless — POST /api/lead-mail
 * Soft email/storage fallback. Always returns ok when possible.
 */
const {
  applyCors,
  readJsonBody,
  acceptLead,
  buildLead,
  sendEmailNotification,
  persistLead,
  generateId,
} = require("./lib/leads");

module.exports = async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = readJsonBody(req);
  const result = await acceptLead(payload);

  if (result.status < 400) {
    return res.status(200).json({
      ...result.body,
      message: "Thank you! We'll be in touch shortly.",
    });
  }

  // Soft path: mail whatever we have even if validation failed.
  const lead = buildLead(payload || {});
  if (!lead.name && !lead.phone) {
    return res.status(200).json({
      ok: true,
      mailed: false,
      savedToBackend: false,
      message: "Received.",
      engine: "vercel-function",
    });
  }

  lead.id = generateId();
  lead.created_at = Math.floor(Date.now() / 1000);
  lead.source = "vercel-lead-mail";
  const emailResult = await sendEmailNotification(lead);
  if (emailResult.sent) lead.emailed_at = Math.floor(Date.now() / 1000);
  const store = await persistLead(lead);

  return res.status(200).json({
    ok: true,
    id: lead.id,
    mailed: !!emailResult.sent,
    savedToBackend: !!store.saved,
    message: "Thank you! We'll be in touch shortly.",
    engine: "vercel-function",
  });
};
