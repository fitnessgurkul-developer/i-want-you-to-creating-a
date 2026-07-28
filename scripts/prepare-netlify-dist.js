#!/usr/bin/env node
/**
 * Copy only static site files into dist/ for Netlify.
 * Avoids publishing server, Docker, and backend files.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

const files = [
  "index.html",
  "index.php",
  ".htaccess",
  "about.html",
  "admin.html",
  "backend.html",
  "book-consultation.html",
  "coaches.html",
  "contact.html",
  "dashboard.html",
  "events.html",
  "office.html",
  "owner-data.html",
  "services.html",
  "testimonials.html",
  "tools.html",
  "transformation-challenge.html",
  "workouts.html",
  "app.js",
  "config.js",
  "styles.css",
  "robots.txt",
  "sitemap.xml",
];

const dirs = ["assets", "coaches", "api", "TESTIMONIALS"];

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest, opts) {
  if (!fs.existsSync(src)) return;
  const skipExt = (opts && opts.skipExt) || [];
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      // Skip Node/serverless source folders inside api/
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      copyDir(from, to, opts);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (skipExt.includes(ext)) continue;
      copyFile(from, to);
    }
  }
}

rmrf(dist);
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    try { copyFile(src, path.join(dist, file)); } catch (err) {
      console.warn("skip file", file, err.message);
    }
  }
}

for (const dir of dirs) {
  const src = path.join(root, dir);
  if (fs.existsSync(src)) {
    try {
      // Keep PHP for Hostinger uploads; do not copy Vercel/Netlify JS into static dist.
      const opts = dir === "api" ? { skipExt: [".js", ".mjs", ".cjs", ".ts", ".mts"] } : undefined;
      copyDir(src, path.join(dist, dir), opts);
    } catch (err) {
      console.warn("skip dir", dir, err.message);
    }
  }
}

if (!fs.existsSync(path.join(dist, "index.html"))) {
  console.error("ERROR: dist/index.html missing");
  process.exit(1);
}

console.log("Static dist ready:", dist);
