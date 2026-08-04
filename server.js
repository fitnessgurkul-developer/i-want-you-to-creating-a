/**
 * Fitness Gurukul — simple SQLite form backend
 * Local: npm start  →  http://127.0.0.1:3000
 * Live:  Render web service (see README)
 */
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DB_PATH =
  process.env.DB_PATH || path.join(__dirname, "fitness_gurukul.sqlite3");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let db;
let mailer = null;

const LEAD_TABLES = new Set(["consultations", "challenge_leads", "corporate_events"]);

const TABLES = {
  consultations: {
    columns: ["name", "phone", "email", "program", "goal", "message", "coach", "source"],
    required: ["name", "phone"],
  },
  challenge_leads: {
    columns: ["name", "phone", "email", "location", "program", "goal", "message"],
    required: ["name", "phone"],
  },
  corporate_events: {
    columns: [
      "company",
      "contact_name",
      "email",
      "phone",
      "event_type",
      "attendees",
      "preferred_date",
      "budget",
      "location",
      "message",
    ],
    required: ["company", "contact_name", "phone"],
  },
  calculations: {
    columns: ["calculator", "title", "result", "unit", "rating", "details"],
    required: ["calculator"],
  },
};

function str(value) {
  return value == null ? "" : String(value).trim();
}

function saveDatabase() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function createTables() {
  Object.entries(TABLES).forEach(([table, meta]) => {
    const cols = meta.columns.map((c) => `${c} TEXT DEFAULT ''`).join(", ");
    db.run(
      `CREATE TABLE IF NOT EXISTS ${table} (
        id TEXT PRIMARY KEY,
        ${cols},
        created_at TEXT DEFAULT '',
        ip TEXT DEFAULT ''
      )`
    );
  });
}

function migrateLegacySubmissions() {
  const check = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='submissions'"
  );
  if (!check.length) return;

  const rows = db.exec("SELECT * FROM submissions");
  if (!rows.length) return;

  const cols = rows[0].columns;
  rows[0].values.forEach((values) => {
    const row = {};
    cols.forEach((col, i) => {
      row[col] = values[i];
    });
    const formType = str(row.form_type || "consultation");
    const table =
      formType === "corporate_event" || formType === "corporate_events"
        ? "corporate_events"
        : formType === "transformation_challenge" || formType === "challenge_leads"
          ? "challenge_leads"
          : "consultations";

    const id = str(row.id) || crypto.randomUUID();
    const exists = db.exec(`SELECT id FROM ${table} WHERE id = ?`, [id]);
    if (exists.length) return;

    if (table === "corporate_events") {
      db.run(
        `INSERT INTO corporate_events
          (id, company, contact_name, email, phone, event_type, attendees, preferred_date, budget, location, message, created_at, ip)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          str(row.company),
          str(row.contact_name || row.name),
          str(row.email),
          str(row.phone),
          str(row.event_type || row.program),
          str(row.attendees || row.goal),
          str(row.preferred_date),
          str(row.budget),
          str(row.location),
          str(row.message),
          str(row.timestamp) || new Date().toISOString(),
          str(row.ip),
        ]
      );
    } else if (table === "challenge_leads") {
      db.run(
        `INSERT INTO challenge_leads
          (id, name, phone, email, location, program, goal, message, created_at, ip)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          str(row.name),
          str(row.phone),
          str(row.email),
          str(row.location),
          str(row.program),
          str(row.goal),
          str(row.message),
          str(row.timestamp) || new Date().toISOString(),
          str(row.ip),
        ]
      );
    } else {
      db.run(
        `INSERT INTO consultations
          (id, name, phone, email, program, goal, message, coach, source, created_at, ip)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          str(row.name),
          str(row.phone),
          str(row.email),
          str(row.program),
          str(row.goal),
          str(row.message),
          str(row.coach),
          formType || "consultation",
          str(row.timestamp) || new Date().toISOString(),
          str(row.ip),
        ]
      );
    }
  });

  db.run("DROP TABLE IF EXISTS submissions");
  saveDatabase();
}

async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  createTables();
  migrateLegacySubmissions();
  saveDatabase();
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "";
}

function resolveTable(formType) {
  const type = str(formType).toLowerCase();
  if (type === "corporate_event" || type === "corporate_events" || type === "events") {
    return "corporate_events";
  }
  if (
    type === "transformation_challenge" ||
    type === "challenge" ||
    type === "challenge_leads"
  ) {
    return "challenge_leads";
  }
  if (type === "calculation" || type === "calculations") {
    return "calculations";
  }
  return "consultations";
}

function readTable(table) {
  const results = db.exec(`SELECT * FROM ${table} ORDER BY rowid DESC`);
  if (!results.length) return [];
  const cols = results[0].columns;
  return results[0].values.map((row) => {
    const obj = { _table: table };
    cols.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

function normalizePayload(table, payload) {
  const row = { ...(payload || {}) };

  if (table === "corporate_events") {
    row.company = row.company || row.company_name;
    row.contact_name = row.contact_name || row.name || row.contact;
    row.event_type = row.event_type || row.program;
  }

  if (table === "consultations") {
    row.source = row.source || row.form_type || "consultation";
  }

  if (table === "challenge_leads") {
    row.program = row.program || "4-Week Transformation Challenge";
    row.goal = row.goal || "Join the 4-week transformation challenge";
  }

  if (table === "calculations") {
    row.calculator = row.calculator || row.slug || row.title;
    row.title = row.title || row.calculator;
    if (row.details && typeof row.details === "object") {
      row.details = JSON.stringify(row.details);
    }
  }

  return row;
}

function insertRow(table, payload, ip) {
  const meta = TABLES[table];
  const row = normalizePayload(table, payload);
  const missing = meta.required.filter((key) => !str(row[key]));
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const values = meta.columns.map((col) => str(row[col]));
  const placeholders = meta.columns.map(() => "?").join(", ");
  db.run(
    `INSERT INTO ${table} (id, ${meta.columns.join(", ")}, created_at, ip)
     VALUES (?, ${placeholders}, ?, ?)`,
    [id, ...values, createdAt, ip]
  );
  saveDatabase();

  const saved = { id, table, created_at: createdAt };
  const record = {};
  meta.columns.forEach((col, i) => {
    record[col] = values[i];
  });
  notifyLeadEmail(table, record, saved).catch((err) => {
    console.error("Lead email failed:", err.message || err);
  });
  return saved;
}

function initMailer() {
  const host = str(process.env.SMTP_HOST);
  const user = str(process.env.SMTP_USER);
  const pass = str(process.env.SMTP_PASS);
  if (!host || !user || !pass) {
    console.log("Lead email: off (set SMTP_HOST, SMTP_USER, SMTP_PASS, LEAD_NOTIFY_EMAIL)");
    return;
  }
  mailer = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") !== "false",
    auth: { user, pass },
  });
  console.log("Lead email: on →", str(process.env.LEAD_NOTIFY_EMAIL || process.env.MAIL_TO || "(missing LEAD_NOTIFY_EMAIL)"));
}

async function notifyLeadEmail(table, record, meta) {
  if (!LEAD_TABLES.has(table) || !mailer) return;
  const to = str(process.env.LEAD_NOTIFY_EMAIL || process.env.MAIL_TO);
  if (!to) return;

  const labels = {
    consultations: "New consultation lead",
    challenge_leads: "New challenge lead",
    corporate_events: "New corporate event inquiry",
  };
  const subject = `[Fitness Gurukul] ${labels[table] || "New lead"}`;
  const lines = Object.entries(record)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`);
  lines.push(`table: ${table}`);
  lines.push(`id: ${meta.id}`);
  lines.push(`created_at: ${meta.created_at}`);

  const from =
    str(process.env.MAIL_FROM) ||
    str(process.env.SMTP_USER) ||
    "noreply@fitnessgurukul.co.in";

  await mailer.sendMail({
    from,
    to,
    subject,
    text: lines.join("\n"),
    html: `<h2>${subject}</h2><pre style="font-family:ui-monospace,monospace;font-size:14px">${lines
      .map((l) => l.replace(/</g, "&lt;"))
      .join("\n")}</pre>`,
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "fitness-gurukul-sqlite",
    tables: Object.keys(TABLES),
    db: path.basename(DB_PATH),
  });
});

/** Simple form submit — body.form_type picks the SQLite table. */
app.post("/api/submit", (req, res) => {
  try {
    const body = req.body || {};
    const table = resolveTable(body.form_type || body.formType || body.type);
    const result = insertRow(table, body, clientIp(req));
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, error: err.message || "Save failed" });
  }
});

app.post("/api/forms/:table", (req, res) => {
  try {
    const table = resolveTable(req.params.table);
    if (!TABLES[table]) {
      return res.status(404).json({ ok: false, error: "Unknown form table" });
    }
    const result = insertRow(table, req.body || {}, clientIp(req));
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, error: err.message || "Save failed" });
  }
});

/** Calculator results → calculations table */
app.post("/api/calculations", (req, res) => {
  try {
    const result = insertRow("calculations", req.body || {}, clientIp(req));
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, error: err.message || "Save failed" });
  }
});

app.get("/api/submissions", (req, res) => {
  const wanted = str(req.query.table || "all").toLowerCase();
  if (wanted === "all") {
    const data = Object.keys(TABLES).flatMap((table) => readTable(table));
    data.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return res.json({ ok: true, data, tables: Object.keys(TABLES) });
  }
  const table = resolveTable(wanted);
  if (!TABLES[table]) {
    return res.status(404).json({ ok: false, error: "Unknown table" });
  }
  res.json({ ok: true, data: readTable(table), table });
});

app.delete("/api/submissions/:table/:id", (req, res) => {
  const table = resolveTable(req.params.table);
  if (!TABLES[table]) {
    return res.status(404).json({ ok: false, error: "Unknown table" });
  }
  db.run(`DELETE FROM ${table} WHERE id = ?`, [str(req.params.id)]);
  saveDatabase();
  res.json({ ok: true });
});

/** Back-compat delete from old single-table admin. */
app.delete("/api/submissions/:id", (req, res) => {
  const id = str(req.params.id);
  Object.keys(TABLES).forEach((table) => {
    db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
  });
  saveDatabase();
  res.json({ ok: true });
});

app.get(["/admin", "/admin.html"], (_req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

initDatabase()
  .then(() => {
    initMailer();
    app.listen(PORT, HOST, () => {
      console.log(`Fitness Gurukul SQLite forms running at http://${HOST}:${PORT}`);
      console.log(`Admin: /admin`);
      console.log(`Tables: ${Object.keys(TABLES).join(", ")}`);
      console.log(`DB: ${DB_PATH}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start SQLite backend:", err);
    process.exit(1);
  });
