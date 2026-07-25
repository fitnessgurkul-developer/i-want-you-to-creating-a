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

const dirs = ["assets", "coaches", "api"];

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else copyFile(from, to);
  }
}

rmrf(dist);
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) copyFile(src, path.join(dist, file));
}

for (const dir of dirs) {
  const src = path.join(root, dir);
  if (fs.existsSync(src)) copyDir(src, path.join(dist, dir));
}

console.log("Netlify dist ready:", dist);
