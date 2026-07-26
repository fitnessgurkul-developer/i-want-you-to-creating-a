#!/usr/bin/env node
"use strict";

/**
 * Fitness Gurukul — Node.js API + static site server (zero npm dependencies).
 *
 * Start:
 *   node server.js
 *   ./start.sh
 *
 * Env: HOST, PORT, ADMIN_TOKEN, CORS_ORIGINS, DATA_DIR, OPENAI_API_KEY
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const config = require("./backend/lib/config");
const store = require("./backend/lib/store");
const catalog = require("./backend/lib/catalog");
const chat = require("./backend/lib/chat");
const { clip, timingSafeEqualStr, readJsonBody } = require("./backend/lib/util");

const RATE_LIMITS = {
  "/api/chat": 20,
  "/api/submit": 30,
  "/api/leads": 30,
  "/api/calculations": 40,
  "/api/match": 40,
  "/api/quiz": 40,
  "/api/challenge-join": 20,
};
const rateBuckets = new Map();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".php": "text/plain; charset=utf-8",
};

const BLOCKED_PREFIXES = ["/.env", "/.git", "/data/", "/node_modules/", "/backend/lib"];
const BLOCKED_SUFFIXES = [".sqlite3", ".pyc", ".py", ".bak", ".env"];
const BLOCKED_NAMES = new Set([
  "/server.py",
  "/server.js",
  "/package.json",
  "/package-lock.json",
  "/.gitignore",
  "/.gitattributes",
  "/.env.example",
  "/render.yaml",
  "/Dockerfile",
]);

function corsOrigin(req) {
  const origins = config.corsOrigins();
  const requestOrigin = req.headers.origin || "";
  if (origins.includes("*") || origins.length === 0) return "*";
  if (requestOrigin && origins.includes(requestOrigin)) return requestOrigin;
  return origins[0];
}

function applyCors(req, res) {
  const origin = corsOrigin(req);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Cache-Control", "no-store");
  if (origin !== "*") res.setHeader("Vary", "Origin");
}

function sendJson(req, res, payload, status = 200) {
  applyCors(req, res);
  const body = JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function checkRateLimit(req, route) {
  const limit = RATE_LIMITS[route];
  if (!limit) return true;
  const key = `${clientIp(req)}:${route}`;
  const now = Date.now();
  const windowMs = 60_000;
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

function adminFromRequest(req) {
  const header = req.headers["x-admin-token"];
  if (header) return String(header).trim();
  const auth = req.headers.authorization || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return "";
}

function requireAdmin(req, res) {
  const expected = config.adminToken();
  if (!expected) {
    sendJson(req, res, { error: "Admin access is disabled. Set ADMIN_TOKEN in .env." }, 503);
    return false;
  }
  if (!timingSafeEqualStr(expected, adminFromRequest(req))) {
    sendJson(req, res, { error: "Unauthorized. Use the staff password from .env (ADMIN_TOKEN)." }, 401);
    return false;
  }
  return true;
}

function isBlocked(urlPath) {
  if (BLOCKED_NAMES.has(urlPath)) return true;
  if (BLOCKED_PREFIXES.some((p) => urlPath === p || urlPath.startsWith(p))) return true;
  if (BLOCKED_SUFFIXES.some((s) => urlPath.endsWith(s))) return true;
  return false;
}

function safeJoinPublic(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded === "/" ? "/index.html" : decoded;
  const full = path.normalize(path.join(config.PUBLIC, rel));
  if (!full.startsWith(config.PUBLIC)) return null;
  return full;
}

function serveStatic(req, res, urlPath) {
  if (isBlocked(urlPath)) {
    return sendJson(req, res, { error: "Not found" }, 404);
  }
  let filePath = safeJoinPublic(urlPath);
  if (!filePath) return sendJson(req, res, { error: "Not found" }, 404);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = safeJoinPublic("/index.html");
  }
  if (!filePath || !fs.existsSync(filePath)) {
    return sendJson(req, res, { error: "Not found" }, 404);
  }
  applyCors(req, res);
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res, urlPath) {
  const method = req.method || "GET";

  if (method === "OPTIONS") {
    applyCors(req, res);
    res.writeHead(204);
    return res.end();
  }

  if (method === "GET") {
    if (urlPath === "/api/health") {
      return sendJson(req, res, {
        ok: true,
        engine: "node",
        databaseExists: fs.existsSync(store.storeFile()),
        adminConfigured: Boolean(config.adminToken()),
        backendUrl: "/backend",
        aiEnabled: Boolean(config.openaiKey()),
        cors: config.corsOrigins().join(","),
        cloudReady: true,
      });
    }
    if (urlPath === "/api/backend-info") {
      return sendJson(req, res, {
        ok: true,
        engine: "node",
        mode: "node",
        localDefaultPassword: false,
        hint: "Enter the owner password from ADMIN_TOKEN / .env.",
        database: path.basename(store.storeFile()),
        ownerUrl: "/backend.html",
        site: "https://fitnessgurukul.app",
      });
    }
    if (urlPath === "/api/content") return sendJson(req, res, catalog.contentPayload());
    if (urlPath === "/api/live") return sendJson(req, res, catalog.livePayload());
    if (urlPath === "/api/challenges") return sendJson(req, res, catalog.challengesPayload());
    if (urlPath === "/api/goals") {
      return sendJson(req, res, { ok: true, goals: Object.values(catalog.GOAL_MATCHES) });
    }
    if (urlPath === "/api/chat/status") {
      const ai = Boolean(config.openaiKey());
      return sendJson(req, res, {
        ok: true,
        aiEnabled: ai,
        engine: ai ? "openai" : "local",
        model: config.openaiModel(),
        suggestions: catalog.CHAT_SUGGESTIONS,
      });
    }
    if (urlPath === "/api/admin-data") {
      if (!requireAdmin(req, res)) return;
      return sendJson(req, res, store.adminData());
    }
    if (urlPath === "/api/submissions") {
      if (!requireAdmin(req, res)) return;
      const data = store.listSubmissions();
      return sendJson(req, res, { ok: true, count: data.length, data });
    }
    if (urlPath === "/api/office-stats") {
      if (!requireAdmin(req, res)) return;
      return sendJson(req, res, store.officeStats());
    }
    return sendJson(req, res, { error: "Not found" }, 404);
  }

  if (method === "PATCH" && urlPath.startsWith("/api/submissions/") && urlPath.endsWith("/status")) {
    if (!requireAdmin(req, res)) return;
    let payload;
    try {
      payload = await readJsonBody(req, config.maxJsonBytes);
    } catch (e) {
      return sendJson(req, res, { error: e.message }, e.status || 400);
    }
    const submissionId = clip(decodeURIComponent(urlPath.slice("/api/submissions/".length, -"/status".length)), 64);
    const status = clip(payload.status, 32).toLowerCase();
    if (!["new", "contacted", "qualified", "closed"].includes(status)) {
      return sendJson(req, res, { error: "Invalid status" }, 400);
    }
    const updated = store.updateStatus(submissionId, status);
    if (!updated) return sendJson(req, res, { error: "Not found" }, 404);
    return sendJson(req, res, { ok: true, id: submissionId, status });
  }

  if (method === "DELETE" && urlPath.startsWith("/api/submissions/")) {
    if (!requireAdmin(req, res)) return;
    const submissionId = clip(decodeURIComponent(urlPath.slice("/api/submissions/".length)), 64);
    if (!submissionId || submissionId.includes("/")) {
      return sendJson(req, res, { error: "Not found" }, 404);
    }
    if (!store.deleteSubmission(submissionId)) {
      return sendJson(req, res, { error: "Not found" }, 404);
    }
    return sendJson(req, res, { ok: true });
  }

  if (method === "POST") {
    if (RATE_LIMITS[urlPath] && !checkRateLimit(req, urlPath)) {
      return sendJson(req, res, { error: "Too many requests. Please wait a minute." }, 429);
    }
    let payload;
    try {
      payload = await readJsonBody(req, config.maxJsonBytes);
    } catch (e) {
      return sendJson(req, res, { error: e.message }, e.status || 400);
    }

    if (urlPath === "/api/submit" || urlPath === "/api/leads") {
      if (urlPath === "/api/leads" && !payload.form_type) {
        payload = {
          form_type: "consultation",
          name: payload.name,
          phone: payload.phone,
          goal: payload.goal,
          program: payload.program,
          message: payload.message,
          email: payload.email,
          coach: payload.coach,
        };
      }
      const result = store.saveSubmission(payload);
      if (result.missing) {
        return sendJson(req, res, { ok: false, error: "Missing required fields", fields: result.missing }, 400);
      }
      return sendJson(req, res, { ok: true, id: result.id, message: "Saved." }, 201);
    }

    if (urlPath === "/api/calculations") {
      const missing = ["calculator", "title", "result"].filter((f) => !String(payload[f] || "").trim());
      if (missing.length) return sendJson(req, res, { error: "Missing required fields", fields: missing }, 400);
      store.saveCalculation(payload);
      return sendJson(req, res, { ok: true, message: "Saved." }, 201);
    }

    if (urlPath === "/api/match") return sendJson(req, res, catalog.matchGoal(payload));
    if (urlPath === "/api/quiz") return sendJson(req, res, catalog.quizRecommend(payload));

    if (urlPath === "/api/challenge-join") {
      const challenge = catalog.findChallenge(payload.challengeId || payload.challenge);
      const joinPayload = {
        form_type: "challenge-join",
        name: clip(payload.name, 80),
        phone: clip(payload.phone, 40),
        email: clip(payload.email, 120),
        program: (challenge && challenge.name) || "Transformation Challenge",
        goal: (challenge && challenge.goal) || clip(payload.goal, 80) || "transformation",
        message: clip(payload.message || "Joined from transformation-challenge page", 500),
      };
      const result = store.saveSubmission(joinPayload);
      if (result.missing) {
        return sendJson(req, res, { ok: false, error: "Missing fields", missing: result.missing }, 400);
      }
      return sendJson(
        req,
        res,
        {
          ok: true,
          message: "You are in. A coach will reach out soon.",
          challenge,
          id: result.id,
          stats: catalog.challengesPayload(),
        },
        201
      );
    }

    if (urlPath === "/api/chat") {
      const message = clip(payload.message, 2000);
      if (!message) return sendJson(req, res, { error: "Message is required" }, 400);
      const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];
      const sessionId = clip(payload.sessionId, 80) || "anonymous";
      const { reply, source } = await chat.generateReply(message, history);
      try {
        store.saveChat(sessionId, message, reply, source);
      } catch (e) {
        console.error("Chat save error:", e.message);
      }
      return sendJson(req, res, {
        ok: true,
        reply,
        source,
        aiEnabled: source === "openai",
        suggestions: catalog.CHAT_SUGGESTIONS,
      });
    }

    return sendJson(req, res, { error: "Not found" }, 404);
  }

  return sendJson(req, res, { error: "Method not allowed" }, 405);
}

function aliases(urlPath) {
  if (urlPath === "/backend") return "/backend.html";
  if (urlPath === "/office") return "/office.html";
  return urlPath;
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || `localhost:${config.port()}`;
    const u = new URL(req.url || "/", `http://${host}`);
    let urlPath = aliases(u.pathname || "/");

    if (urlPath.startsWith("/api/")) {
      return await handleApi(req, res, urlPath);
    }
    return serveStatic(req, res, urlPath);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJson(req, res, { error: "Server error" }, 500);
  }
});

function ensureAdminToken() {
  if (config.adminToken()) return "env";
  // Local only: generate an ephemeral token and print it (never a public default password).
  const generated = require("crypto").randomBytes(16).toString("hex");
  process.env.ADMIN_TOKEN = generated;
  return "generated";
}

if (require.main === module) {
  const mode = ensureAdminToken();
  const host = config.host();
  const port = config.port();
  server.listen(port, host, () => {
    console.log("");
    console.log("=".repeat(56));
    console.log(" Fitness Gurukul API (Node)");
    console.log("=".repeat(56));
    console.log(` Listening: ${host}:${port}`);
    console.log(" Health:    /api/health");
    console.log(` Website:   http://127.0.0.1:${port}/`);
    console.log(` Backend:   http://127.0.0.1:${port}/backend.html`);
    console.log(` Database:  ${store.storeFile()}`);
    console.log(` CORS:      ${config.corsOrigins().join(",")}`);
    if (mode === "generated") {
      console.log(` Owner password (generated): ${config.adminToken()}`);
      console.log(" Tip: set ADMIN_TOKEN in .env so it stays stable.");
    } else {
      console.log(" Owner password: loaded from env (ADMIN_TOKEN)");
    }
    console.log("");
  });
}

module.exports = { server };
