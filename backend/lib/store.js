"use strict";

const fs = require("fs");
const path = require("path");
const config = require("./config");
const { clip, now, id } = require("./util");

const EMPTY = () => ({
  leads: [],
  newsletter: [],
  checkins: [],
  ai_scans: [],
  calculator_results: [],
  chat_messages: [],
  submissions: [],
});

function load() {
  const file = config.storePath();
  try {
    if (!fs.existsSync(file)) return EMPTY();
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    const base = EMPTY();
    for (const key of Object.keys(base)) {
      if (Array.isArray(raw[key])) base[key] = raw[key];
    }
    return base;
  } catch {
    return EMPTY();
  }
}

function save(data) {
  const file = config.storePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function withStore(mutator) {
  const data = load();
  const result = mutator(data);
  save(data);
  return result;
}

function rowToSubmission(row) {
  const item = { ...row };
  item.timestamp = new Date((item.created_at || 0) * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  item.status = item.status || "new";
  return item;
}

function validateSubmission(payload) {
  const formType = clip(payload.form_type || "consultation", 64) || "consultation";
  const name = clip(payload.name || payload.contact_name, 120);
  const phone = clip(payload.phone, 40);
  const email = clip(payload.email, 160);
  const program = clip(payload.program, 120);
  const goal = clip(payload.goal, 200);
  const message = clip(payload.message, 2000);
  const coach = clip(payload.coach, 120);
  const company = clip(payload.company, 160);
  const eventType = clip(payload.event_type, 120);
  const attendees = clip(payload.attendees, 80);
  const preferredDate = clip(payload.preferred_date, 80);
  const budget = clip(payload.budget, 80);
  const location = clip(payload.location, 160);

  let missing = [];
  if (formType === "corporate_event") {
    for (const [field, value] of [
      ["company", company],
      ["contact_name", name],
      ["email", email],
      ["phone", phone],
      ["event_type", eventType],
      ["attendees", attendees],
    ]) {
      if (!value) missing.push(field);
    }
  } else {
    for (const [field, value] of [
      ["name", name],
      ["phone", phone],
      ["program", program],
      ["goal", goal],
    ]) {
      if (!value) missing.push(field);
    }
  }
  if (missing.length) return { missing };

  const createdAt = now();
  const submission = {
    id: id(),
    form_type: formType,
    name,
    phone,
    email,
    program,
    goal,
    message,
    coach,
    company,
    event_type: eventType,
    attendees,
    preferred_date: preferredDate,
    budget,
    location,
    status: "new",
    created_at: createdAt,
    source: "node-server",
  };

  const lead = {
    id: id(),
    name,
    phone,
    goal: goal || eventType || "consultation",
    program: program || company || eventType || "general",
    message: message || (attendees ? `${attendees} attendees` : ""),
    created_at: createdAt,
  };

  return { submission, lead };
}

function saveSubmission(payload) {
  const built = validateSubmission(payload);
  if (built.missing) return { missing: built.missing };
  return withStore((data) => {
    data.submissions.unshift(built.submission);
    data.leads.unshift(built.lead);
    data.submissions = data.submissions.slice(0, 2000);
    data.leads = data.leads.slice(0, 2000);
    return { id: built.submission.id };
  });
}

function listSubmissions(limit = 300) {
  return load().submissions.slice(0, limit).map(rowToSubmission);
}

function updateStatus(submissionId, status) {
  return withStore((data) => {
    const row = data.submissions.find((s) => s.id === submissionId);
    if (!row) return null;
    row.status = status;
    return rowToSubmission(row);
  });
}

function deleteSubmission(submissionId) {
  return withStore((data) => {
    const before = data.submissions.length;
    data.submissions = data.submissions.filter((s) => s.id !== submissionId);
    return data.submissions.length < before;
  });
}

function adminData() {
  const data = load();
  return {
    ok: true,
    database: path.basename(config.storePath()),
    submissionCount: data.submissions.length,
    viewer: "backend.html",
    leads: data.leads.slice(0, 100),
    checkins: data.checkins.slice(0, 100),
    newsletter: data.newsletter.slice(0, 100),
    ai_scans: data.ai_scans.slice(0, 100),
    calculations: data.calculator_results.slice(0, 100),
    chat_messages: data.chat_messages.slice(0, 100),
    submissions: data.submissions.slice(0, 300).map(rowToSubmission),
  };
}

function officeStats() {
  const data = load();
  const dayAgo = now() - 86400;
  return {
    ok: true,
    total: data.submissions.length,
    today: data.submissions.filter((s) => (s.created_at || 0) >= dayAgo).length,
    new: data.submissions.filter((s) => (s.status || "new") === "new").length,
    corporate: data.submissions.filter((s) => s.form_type === "corporate_event").length,
    calculations: data.calculator_results.length,
  };
}

function saveCalculation(payload) {
  return withStore((data) => {
    data.calculator_results.unshift({
      id: id(),
      calculator: clip(payload.calculator, 80),
      title: clip(payload.title, 160),
      result: clip(payload.result, 160),
      unit: clip(payload.unit, 40),
      rating: clip(payload.rating, 80),
      created_at: now(),
    });
    data.calculator_results = data.calculator_results.slice(0, 500);
    return true;
  });
}

function saveChat(sessionId, userMessage, assistantMessage, source) {
  return withStore((data) => {
    const t = now();
    const sid = clip(sessionId, 80) || "anonymous";
    data.chat_messages.push(
      { id: id(), session_id: sid, role: "user", content: userMessage, source, created_at: t },
      { id: id(), session_id: sid, role: "assistant", content: assistantMessage, source, created_at: t }
    );
    data.chat_messages = data.chat_messages.slice(-1000);
    return true;
  });
}

function counts() {
  const data = load();
  const dayAgo = now() - 86400;
  return {
    submissions: data.submissions.length,
    today: data.submissions.filter((s) => (s.created_at || 0) >= dayAgo).length,
    challengeJoins: data.submissions.filter((s) => s.form_type === "challenge-join").length,
    calculations: data.calculator_results.length,
    chats: data.chat_messages.filter((m) => m.role === "user").length,
  };
}

module.exports = {
  load,
  saveSubmission,
  listSubmissions,
  updateStatus,
  deleteSubmission,
  adminData,
  officeStats,
  saveCalculation,
  saveChat,
  counts,
  rowToSubmission,
  storeFile: () => config.storePath(),
};
