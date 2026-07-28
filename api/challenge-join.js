/**
 * Vercel serverless — POST /api/challenge-join
 */
const {
  applyCors,
  readJsonBody,
  acceptLead,
  clip,
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
  const challengeId = clip(payload.challengeId || payload.challenge, 80);
  const challengeName = challengeId || "Transformation Challenge";

  const result = await acceptLead({
    form_type: "challenge-join",
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    program: challengeName,
    goal: payload.goal || "transformation",
    message: payload.message || ("Joined challenge: " + challengeName),
  });

  if (result.status >= 400) {
    return res.status(result.status).json(result.body);
  }

  return res.status(result.status).json({
    ...result.body,
    message: "You are in. A coach will reach out soon.",
    challenge: { id: challengeId, name: challengeName },
  });
};
