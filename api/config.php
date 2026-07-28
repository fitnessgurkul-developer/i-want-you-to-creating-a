<?php
/**
 * Fitness Gurukul Hostinger API config
 *
 * Owner password for backend.html (Hostinger PHP mode).
 * Override with FG_ADMIN_TOKEN or ADMIN_TOKEN env vars when available.
 *
 * Lead email notify modes:
 *   instant    — email each lead as it arrives
 *   digest_12h — batch all new leads into one email every ~12 hours (cron)
 *   both       — instant email + still include in 12h digest summary
 *   off        — store only (no outbound email)
 */
$token = getenv("FG_ADMIN_TOKEN") ?: getenv("ADMIN_TOKEN") ?: "Rr6OrZTsbxJNfWcqFzyBQehb";
$cron = getenv("FG_CRON_TOKEN") ?: getenv("CRON_TOKEN") ?: $token;
$notifyEmail = getenv("FG_LEAD_EMAIL") ?: getenv("LEAD_NOTIFY_EMAIL") ?: "contact@fitnessgurukul.co.in";
$notifyMode = getenv("FG_LEAD_NOTIFY_MODE") ?: getenv("LEAD_NOTIFY_MODE") ?: "both";

return [
  "admin_token" => $token,
  "cron_token" => $cron,
  "whatsapp" => "917207113310",
  "phone" => "+917207113310",
  "contact_email" => "contact@fitnessgurukul.co.in",
  "lead_notify_email" => $notifyEmail,
  // instant | digest_12h | both | off
  "lead_notify_mode" => $notifyMode,
  "lead_digest_hours" => 12,
  "mail_from" => getenv("FG_MAIL_FROM") ?: "noreply@fitnessgurukul.co.in",
  "mail_from_name" => "Fitness Gurukul Leads",
];
