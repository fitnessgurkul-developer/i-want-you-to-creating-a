/**
 * Vercel serverless — POST /api/submit
 * Stores lead (Blob when configured) + emails owners.
 */
const {
  applyCors,
  readJsonBody,
  acceptLead,
} = require("./lib/leads");

module.exports = async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const result = await acceptLead(readJsonBody(req));
  return res.status(result.status).json(result.body);
};
