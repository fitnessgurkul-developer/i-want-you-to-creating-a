"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

function dataDir() {
  const fromEnv = String(process.env.DATA_DIR || "").trim();
  if (fromEnv) {
    fs.mkdirSync(fromEnv, { recursive: true });
    return path.resolve(fromEnv);
  }
  const dir = path.join(ROOT, "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function adminToken() {
  return (
    String(process.env.ADMIN_TOKEN || "").trim() ||
    String(process.env.ADMIN_PASSWORD || "").trim() ||
    String(process.env.FG_ADMIN_TOKEN || "").trim()
  );
}

function corsOrigins() {
  return String(process.env.CORS_ORIGINS || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = {
  ROOT,
  PUBLIC: ROOT,
  dataDir,
  storePath: () => path.join(dataDir(), "backend-store.json"),
  adminToken,
  corsOrigins,
  host: () => {
    const portSet = Boolean(process.env.PORT);
    return String(process.env.HOST || (portSet ? "0.0.0.0" : "127.0.0.1")).trim();
  },
  port: () => Number(process.env.PORT || 8000),
  openaiKey: () => String(process.env.OPENAI_API_KEY || "").trim(),
  openaiModel: () => String(process.env.OPENAI_MODEL || "gpt-5.6").trim() || "gpt-5.6",
  maxJsonBytes: 64 * 1024,
};
