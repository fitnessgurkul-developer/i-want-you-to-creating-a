<?php
/**
 * Email-only lead capture — used when storage/API is unreachable from the browser.
 * Always returns ok for valid payloads so the visitor never sees a hard error.
 */
require __DIR__ . "/bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  fg_json_out(["ok" => true]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
if (!is_array($payload) || !$payload) {
  fg_json_out(["ok" => true, "mailed" => false, "message" => "Received."], 200);
}

$lead = fg_normalize_lead($payload);
$missing = fg_validate_lead($lead);
if ($missing) {
  // Soft-accept incomplete payloads from fallback paths — still try to mail what we have.
  if (($lead["name"] ?? "") === "" && ($lead["phone"] ?? "") === "") {
    fg_json_out(["ok" => true, "mailed" => false, "message" => "Received."], 200);
  }
}

$lead["id"] = $lead["id"] ?? ("mail-" . bin2hex(random_bytes(8)));
$lead["created_at"] = $lead["created_at"] ?? time();
$lead["source"] = "lead-mail-fallback";

// Best-effort: also append to submissions.json when writable.
$persisted = false;
$persistId = null;
$rows = fg_load_submissions($storeFile);
try {
  $persistId = bin2hex(random_bytes(16));
  $row = array_merge($lead, [
    "id" => $persistId,
    "status" => "new",
    "emailed_at" => null,
    "digested_at" => null,
  ]);
  array_unshift($rows, $row);
  $persisted = fg_save_submissions($storeFile, $rows);
  if ($persisted) {
    $lead = $row;
  }
} catch (Throwable $e) {
  $persisted = false;
}

$mailed = fg_mail_single_lead($config, $lead, "fallback");
if ($mailed && $persisted) {
  $rows = fg_load_submissions($storeFile);
  foreach ($rows as &$r) {
    if (($r["id"] ?? "") === $persistId) {
      $r["emailed_at"] = time();
      break;
    }
  }
  unset($r);
  fg_save_submissions($storeFile, $rows);
}

fg_json_out([
  "ok" => true,
  "id" => $persistId,
  "savedToBackend" => $persisted,
  "mailed" => (bool) $mailed,
  "message" => "Thank you! We'll be in touch shortly.",
  "engine" => "hostinger-php-mail",
], 200);
