/**
 * Fitness Gurukul — API endpoint config
 *
 * Production host: https://fitnessgurukul.app (Hostinger)
 *
 * Lead save order:
 *   1) Cloud API via FG_API_BASE (Render / Railway / Fly) — optional
 *   2) Same-origin /api/* (local node server.js / python server.py)
 *   3) Same-origin /api/*.php (Hostinger shared hosting)
 *   4) WhatsApp prefilled fallback in app.js
 *
 * On Hostinger, leave FG_API_BASE empty so forms use /api/*.php on this domain.
 * To use a cloud API instead, set FG_API_BASE to https://….onrender.com
 */
window.FG_API_BASE = window.FG_API_BASE || "";

(function (w) {
  var PHP_MAP = {
    "/api/health": "/api/health.php",
    "/api/submit": "/api/submit.php",
    "/api/leads": "/api/submit.php",
    "/api/admin-data": "/api/admin-data.php",
    "/api/backend-info": "/api/backend-info.php",
    "/api/challenge-join": "/api/challenge-join.php",
    "/api/quiz": "/api/quiz.php",
    "/api/match": "/api/match.php",
    "/api/live": "/api/live.php",
    "/api/challenges": "/api/challenges.php",
  };

  function clearStaleApiBase() {
    try {
      var host = String((w.location && w.location.hostname) || "").toLowerCase();
      if (host === "fitnessgurukul.app" || host === "www.fitnessgurukul.app") {
        w.FG_API_BASE = "";
        try { w.localStorage && w.localStorage.removeItem("fg_api_base"); } catch (e0) {}
      }
    } catch (e1) {}
  }

  w.fgApiUrl = function (path) {
    clearStaleApiBase();
    var base = String(w.FG_API_BASE || "").replace(/\/$/, "");
    if (!path) return base || "/";
    if (/^https?:\/\//i.test(path)) return path;
    if (!base) return path.charAt(0) === "/" ? path : "/" + path;
    return base + (path.charAt(0) === "/" ? path : "/" + path);
  };

  /** Ordered endpoints to try for a logical API path. */
  w.fgApiCandidates = function (path) {
    clearStaleApiBase();
    var clean = path.charAt(0) === "/" ? path : "/" + path;
    var list = [];
    var primary = w.fgApiUrl(clean);
    if (primary) list.push(primary);

    // Same-origin Node/Python path when a remote base was used first.
    if (list.indexOf(clean) === -1) list.push(clean);

    // Hostinger PHP fallback — always available if cloud/local API is down.
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
})(window);
