/**
 * Vercel serverless — GET /api/backend-info
 * Non-sensitive owner-portal helper (no password exposed).
 */
const { applyCors } = require("./lib/leads");

module.exports = async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminConfigured = Boolean(
    process.env.ADMIN_TOKEN ||
      process.env.FG_ADMIN_TOKEN ||
      process.env.ADMIN_PASSWORD
  );

  return res.status(200).json({
    ok: true,
    engine: "vercel-function",
    backendUrl: "/backend",
    dashboardUrl: "/backend",
    ownerUrl: "/backend",
    browseUrl: "/",
    adminConfigured,
    mode: adminConfigured ? "configured" : "unconfigured",
    hint: adminConfigured
      ? "Enter the owner password from Vercel env (ADMIN_TOKEN)."
      : "Set ADMIN_TOKEN in the Vercel project environment variables.",
  });
};
