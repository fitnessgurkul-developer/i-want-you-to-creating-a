/**
 * Fitness Gurukul — API endpoint config
 *
 * Production: Render Python API (SQLite + lead email).
 * Automatic fallbacks: same-origin paths, then Hostinger PHP (/api/*.php).
 * If every API fails, forms still offer WhatsApp + silent FormSubmit email.
 *
 * Override before this file loads, or change the default below.
 */
window.FG_API_BASE =
  window.FG_API_BASE || "https://fitness-gurukul-api.onrender.com";

/** Inbox for FormSubmit fallback when cloud/PHP APIs are down. */
window.FG_LEAD_EMAIL =
  window.FG_LEAD_EMAIL || "contact@fitnessgurukul.co.in";

(function (w) {
  var PHP_MAP = {
    "/api/submit": "/api/submit.php",
    "/api/leads": "/api/submit.php",
    "/api/admin-data": "/api/admin-data.php",
    "/api/backend-info": "/api/backend-info.php",
    "/api/challenge-join": "/api/challenge-join.php",
  };

  w.fgApiUrl = function (path) {
    var base = String(w.FG_API_BASE || "").replace(/\/$/, "");
    if (!path) return base || "/";
    if (/^https?:\/\//i.test(path)) return path;
    if (!base) return path.charAt(0) === "/" ? path : "/" + path;
    return base + (path.charAt(0) === "/" ? path : "/" + path);
  };

  /** Ordered endpoints to try for a logical API path. */
  w.fgApiCandidates = function (path) {
    var clean = path.charAt(0) === "/" ? path : "/" + path;
    var list = [];
    var primary = w.fgApiUrl(clean);
    if (primary) list.push(primary);

    // Same-origin Python path (local server.py / same-host API).
    if (list.indexOf(clean) === -1) list.push(clean);

    // Hostinger PHP fallback — available if cloud API is down and PHP is synced.
    if (PHP_MAP[clean] && list.indexOf(PHP_MAP[clean]) === -1) {
      list.push(PHP_MAP[clean]);
    }
    return list;
  };

  w.fgWhatsAppLeadUrl = function (payload) {
    var p = payload || {};
    var lines = ["New Fitness Gurukul website lead"];
    var name = p.name || p.contact_name || "";
    if (name) lines.push("Name: " + name);
    if (p.phone) lines.push("Phone: " + p.phone);
    if (p.email) lines.push("Email: " + p.email);
    if (p.program) lines.push("Program: " + p.program);
    if (p.goal) lines.push("Goal: " + p.goal);
    if (p.coach) lines.push("Coach: " + p.coach);
    if (p.company) lines.push("Company: " + p.company);
    if (p.event_type) lines.push("Event: " + p.event_type);
    if (p.form_type) lines.push("Type: " + p.form_type);
    if (p.message) lines.push("Notes: " + p.message);
    return "https://wa.me/917207113310?text=" + encodeURIComponent(lines.join("\n"));
  };

  /** Silent email via FormSubmit when every API endpoint fails. */
  w.fgFormSubmitLead = function (payload) {
    var to = String(w.FG_LEAD_EMAIL || "contact@fitnessgurukul.co.in").trim();
    if (!to || typeof fetch !== "function") {
      return Promise.resolve(false);
    }
    var p = payload || {};
    var body = {
      _subject: "Fitness Gurukul website lead",
      _template: "table",
      _captcha: "false",
      name: p.name || p.contact_name || "Lead",
      phone: p.phone || "",
      email: p.email || "noreply@fitnessgurukul.co.in",
      _replyto: p.email || to,
      form_type: p.form_type || "consultation",
      program: p.program || "",
      goal: p.goal || "",
      coach: p.coach || "",
      company: p.company || "",
      event_type: p.event_type || "",
      message: p.message || "",
    };
    return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(to), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(function (res) {
        return res.ok;
      })
      .catch(function () {
        return false;
      });
  };
})(window);
