/**
 * Vercel serverless — GET /api/admin-data
 * Owner portal data from Vercel Blob (when BLOB_READ_WRITE_TOKEN is set).
 */
const {
  applyCors,
  requireAdmin,
  loadSubmissions,
} = require("./lib/leads");

module.exports = async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requireAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const submissions = await loadSubmissions();
  const leads = submissions.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    goal: row.goal,
    program: row.program,
    message: row.message,
    created_at: row.created_at,
  }));

  return res.status(200).json({
    ok: true,
    engine: "vercel-function",
    submissions,
    submissionCount: submissions.length,
    leads,
    checkins: [],
    newsletter: [],
    aiScans: [],
    calculations: [],
    chatMessages: [],
  });
};
