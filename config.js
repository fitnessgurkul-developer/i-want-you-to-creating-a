/**
 * Fitness Gurukul — API endpoint config (keep simple)
 *
 * Production default: Render Python API for SQLite + lead email.
 * Fallbacks (automatic): same-origin Vercel /api/* Node functions, then Hostinger PHP.
 *
 * Override anytime before this file loads, or edit the default below.
 */
window.FG_API_BASE =
  window.FG_API_BASE || "https://fitness-gurukul-api.onrender.com";

(function (w) {
  var PHP_MAP = {
    "/api/submit": "/api/submit.php",
    "/api/leads": "/api/submit.php",
    "/api/lead-mail": "/api/lead-mail.php",
    "/api/lead-digest": "/api/lead-digest.php",
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

    // Same-origin (Vercel Node / local server.py / Hostinger).
    if (list.indexOf(clean) === -1) list.push(clean);

    // Hostinger PHP fallback.
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
