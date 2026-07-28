<?php
/**
 * Combined lead digest — email all undigested leads from the last N hours.
 *
 * Hostinger cron (every 12 hours), example:
 *   0 */12 * * * curl -fsS "https://YOUR-DOMAIN/api/lead-digest.php?token=YOUR_CRON_TOKEN"
 *
 * Or POST with header: X-Admin-Token: YOUR_CRON_TOKEN
 *
 * Set lead_notify_mode to digest_12h or both in api/config.php.
 */
require __DIR__ . "/bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  fg_json_out(["ok" => true]);
}

if (!in_array($_SERVER["REQUEST_METHOD"], ["GET", "POST"], true)) {
  fg_json_out(["error" => "Method not allowed"], 405);
}

fg_require_cron_or_admin($config);

$mode = strtolower((string) ($config["lead_notify_mode"] ?? "both"));
$hours = (int) ($config["lead_digest_hours"] ?? 12);
if ($hours < 1) {
  $hours = 12;
}
$since = time() - ($hours * 3600);

if ($mode === "off" || $mode === "instant") {
  fg_json_out([
    "ok" => true,
    "sent" => false,
    "reason" => $mode === "off" ? "lead_notify_mode=off" : "lead_notify_mode=instant (digest disabled)",
    "hours" => $hours,
  ]);
}

$rows = fg_load_submissions($storeFile);
$pending = [];
foreach ($rows as $row) {
  $created = (int) ($row["created_at"] ?? 0);
  $digested = $row["digested_at"] ?? null;
  if ($created >= $since && empty($digested)) {
    $pending[] = $row;
  }
}

// Oldest first in the digest email.
usort($pending, function ($a, $b) {
  return ((int) ($a["created_at"] ?? 0)) <=> ((int) ($b["created_at"] ?? 0));
});

if (!$pending) {
  fg_json_out([
    "ok" => true,
    "sent" => false,
    "reason" => "no_new_leads",
    "count" => 0,
    "hours" => $hours,
  ]);
}

$sent = fg_mail_digest($config, $pending, $hours);
if (!$sent) {
  fg_json_out([
    "ok" => false,
    "sent" => false,
    "error" => "mail() failed — check Hostinger mail / from address",
    "count" => count($pending),
  ], 500);
}

$now = time();
$ids = [];
foreach ($pending as $p) {
  $ids[$p["id"] ?? ""] = true;
}
foreach ($rows as &$row) {
  $id = $row["id"] ?? "";
  if ($id !== "" && isset($ids[$id])) {
    $row["digested_at"] = $now;
  }
}
unset($row);
fg_save_submissions($storeFile, $rows);

fg_json_out([
  "ok" => true,
  "sent" => true,
  "count" => count($pending),
  "hours" => $hours,
  "mode" => $mode,
  "engine" => "hostinger-php",
]);
