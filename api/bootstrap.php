<?php
header("X-Content-Type-Options: nosniff");

$config = require __DIR__ . "/config.php";
$dataDir = __DIR__ . "/data";
$storeFile = $dataDir . "/submissions.json";

if (!is_dir($dataDir)) {
  mkdir($dataDir, 0755, true);
}
if (!is_file($storeFile)) {
  file_put_contents($storeFile, "[]", LOCK_EX);
}

function fg_json_out($payload, $status = 200) {
  http_response_code($status);
  header("Content-Type: application/json; charset=utf-8");
  header("Cache-Control: no-store");
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function fg_read_json_body() {
  $raw = file_get_contents("php://input");
  if ($raw === false || $raw === "") {
    return $_POST ?: [];
  }
  $decoded = json_decode($raw, true);
  if (is_array($decoded)) {
    return $decoded;
  }
  // FormData / x-www-form-urlencoded fallback
  if (!empty($_POST)) {
    return $_POST;
  }
  $parsed = [];
  parse_str($raw, $parsed);
  return is_array($parsed) ? $parsed : [];
}

function fg_clip($value, $max) {
  $text = trim((string) $value);
  if (function_exists("mb_substr")) {
    return mb_substr($text, 0, $max);
  }
  return substr($text, 0, $max);
}

function fg_load_submissions($storeFile) {
  $raw = @file_get_contents($storeFile);
  $rows = json_decode($raw !== false ? $raw : "[]", true);
  return is_array($rows) ? $rows : [];
}

function fg_save_submissions($storeFile, $rows) {
  $ok = file_put_contents(
    $storeFile,
    json_encode(array_values($rows), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    LOCK_EX
  );
  return $ok !== false;
}

function fg_admin_token_from_request() {
  $header = $_SERVER["HTTP_X_ADMIN_TOKEN"] ?? "";
  if ($header) {
    return trim($header);
  }
  $auth = $_SERVER["HTTP_AUTHORIZATION"] ?? ($_SERVER["REDIRECT_HTTP_AUTHORIZATION"] ?? "");
  if (stripos($auth, "Bearer ") === 0) {
    return trim(substr($auth, 7));
  }
  return trim((string) ($_GET["token"] ?? ""));
}

function fg_require_admin($config) {
  $provided = fg_admin_token_from_request();
  $expected = (string) ($config["admin_token"] ?? "");
  if ($expected === "" || !hash_equals($expected, $provided)) {
    fg_json_out(["error" => "Unauthorized"], 401);
  }
}

function fg_normalize_lead($payload) {
  $formType = fg_clip($payload["form_type"] ?? "consultation", 64) ?: "consultation";
  return [
    "form_type" => $formType,
    "name" => fg_clip($payload["name"] ?? ($payload["contact_name"] ?? ""), 120),
    "phone" => fg_clip($payload["phone"] ?? "", 40),
    "email" => fg_clip($payload["email"] ?? "", 160),
    "program" => fg_clip($payload["program"] ?? "", 120),
    "goal" => fg_clip($payload["goal"] ?? "", 200),
    "message" => fg_clip($payload["message"] ?? "", 2000),
    "coach" => fg_clip($payload["coach"] ?? "", 120),
    "company" => fg_clip($payload["company"] ?? "", 160),
    "event_type" => fg_clip($payload["event_type"] ?? "", 120),
    "attendees" => fg_clip($payload["attendees"] ?? "", 80),
    "preferred_date" => fg_clip($payload["preferred_date"] ?? "", 80),
    "budget" => fg_clip($payload["budget"] ?? "", 80),
    "location" => fg_clip($payload["location"] ?? "", 160),
  ];
}

function fg_validate_lead($lead) {
  $formType = $lead["form_type"] ?? "consultation";
  if ($formType === "corporate_event") {
    $missing = [];
    foreach ([
      "company" => $lead["company"] ?? "",
      "contact_name" => $lead["name"] ?? "",
      "email" => $lead["email"] ?? "",
      "phone" => $lead["phone"] ?? "",
      "event_type" => $lead["event_type"] ?? "",
      "attendees" => $lead["attendees"] ?? "",
    ] as $field => $value) {
      if ($value === "") {
        $missing[] = $field;
      }
    }
    return $missing;
  }
  $missing = [];
  foreach ([
    "name" => $lead["name"] ?? "",
    "phone" => $lead["phone"] ?? "",
    "program" => $lead["program"] ?? "",
    "goal" => $lead["goal"] ?? "",
  ] as $field => $value) {
    if ($value === "") {
      $missing[] = $field;
    }
  }
  return $missing;
}

function fg_format_lead_lines($lead) {
  $lines = [];
  $map = [
    "Type" => $lead["form_type"] ?? "",
    "Name" => $lead["name"] ?? "",
    "Phone" => $lead["phone"] ?? "",
    "Email" => $lead["email"] ?? "",
    "Program" => $lead["program"] ?? "",
    "Goal" => $lead["goal"] ?? "",
    "Coach" => $lead["coach"] ?? "",
    "Company" => $lead["company"] ?? "",
    "Event" => $lead["event_type"] ?? "",
    "Attendees" => $lead["attendees"] ?? "",
    "Preferred date" => $lead["preferred_date"] ?? "",
    "Budget" => $lead["budget"] ?? "",
    "Location" => $lead["location"] ?? "",
    "Message" => $lead["message"] ?? "",
  ];
  foreach ($map as $label => $value) {
    $lines[] = $label . ": " . ($value !== "" && $value !== null ? $value : "—");
  }
  if (!empty($lead["created_at"])) {
    $lines[] = "Received: " . gmdate("Y-m-d H:i:s", (int) $lead["created_at"]) . " UTC";
  }
  if (!empty($lead["id"])) {
    $lines[] = "Lead ID: " . $lead["id"];
  }
  $phone = trim((string) ($lead["phone"] ?? ""));
  if ($phone !== "") {
    $lines[] = "Call/WhatsApp: " . $phone;
  }
  return $lines;
}

function fg_send_mail($config, $subject, $body) {
  $to = trim((string) ($config["lead_notify_email"] ?? $config["contact_email"] ?? ""));
  if ($to === "") {
    return false;
  }
  $from = trim((string) ($config["mail_from"] ?? "noreply@fitnessgurukul.co.in"));
  $fromName = trim((string) ($config["mail_from_name"] ?? "Fitness Gurukul Leads"));
  $headers = [
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "From: " . sprintf('%s <%s>', $fromName, $from),
    "Reply-To: " . ($config["contact_email"] ?? $from),
    "X-Mailer: FitnessGurukul-PHP",
  ];
  $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
  return @mail($to, $encodedSubject, $body, implode("\r\n", $headers));
}

function fg_mail_single_lead($config, $lead, $reason = "new") {
  $mode = strtolower((string) ($config["lead_notify_mode"] ?? "both"));
  if ($mode === "off" && $reason !== "fallback") {
    return false;
  }
  // Instant mail for: instant/both modes, or any storage/API fallback.
  if ($reason !== "fallback" && $mode === "digest_12h") {
    return false;
  }
  $name = $lead["name"] ?? "Lead";
  $type = $lead["form_type"] ?? "consultation";
  $phone = $lead["phone"] ?? "";
  $program = $lead["program"] ?? ($lead["event_type"] ?? "");
  $parts = ["New FG lead", $name];
  if ($phone !== "") {
    $parts[] = $phone;
  }
  if ($program !== "") {
    $parts[] = $program;
  }
  if ($reason === "fallback") {
    array_unshift($parts, "FALLBACK");
  }
  $subject = implode(" · ", $parts);
  $lines = [
    "Fitness Gurukul — new website lead",
    "================================",
    "",
  ];
  foreach (fg_format_lead_lines($lead) as $line) {
    $lines[] = $line;
  }
  $lines[] = "";
  $lines[] = "Open backend.html on the website to manage leads.";
  return fg_send_mail($config, $subject, implode("\n", $lines));
}

function fg_mail_digest($config, $leads, $hours = 12) {
  $count = count($leads);
  if ($count === 0) {
    return true;
  }
  $subject = "[FG Digest] " . $count . " lead" . ($count === 1 ? "" : "s") . " in last " . $hours . "h";
  $chunks = [
    "Fitness Gurukul combined lead digest",
    "Window: last " . $hours . " hours",
    "Total: " . $count,
    str_repeat("-", 40),
    "",
  ];
  $i = 1;
  foreach ($leads as $lead) {
    $chunks[] = "#" . $i;
    foreach (fg_format_lead_lines($lead) as $line) {
      $chunks[] = "  " . $line;
    }
    $chunks[] = "";
    $i++;
  }
  $chunks[] = "Open backend.html to update statuses.";
  return fg_send_mail($config, $subject, implode("\n", $chunks));
}

function fg_require_cron_or_admin($config) {
  $provided = fg_admin_token_from_request();
  $cron = (string) ($config["cron_token"] ?? "");
  $admin = (string) ($config["admin_token"] ?? "");
  if ($provided !== "" && (
    ($cron !== "" && hash_equals($cron, $provided)) ||
    ($admin !== "" && hash_equals($admin, $provided))
  )) {
    return;
  }
  fg_json_out(["error" => "Unauthorized"], 401);
}

function fg_save_submission($storeFile, $payload) {
  global $config;
  $lead = fg_normalize_lead($payload);
  $missing = fg_validate_lead($lead);
  if ($missing) {
    return [null, $missing, null];
  }

  $id = bin2hex(random_bytes(16));
  $row = array_merge($lead, [
    "id" => $id,
    "status" => "new",
    "created_at" => time(),
    "source" => "hostinger-php",
    "emailed_at" => null,
    "digested_at" => null,
  ]);

  $rows = fg_load_submissions($storeFile);
  array_unshift($rows, $row);
  $saved = fg_save_submissions($storeFile, $rows);
  if (!$saved) {
    // Storage failed — still try to email so the lead is not lost.
    $mailed = fg_mail_single_lead($config, $row, "fallback");
    return [null, ["storage"], ["mailed" => $mailed, "lead" => $row]];
  }

  $mode = strtolower((string) ($config["lead_notify_mode"] ?? "both"));
  $mailed = false;
  if ($mode === "instant" || $mode === "both") {
    $mailed = fg_mail_single_lead($config, $row, "new");
    if ($mailed) {
      $row["emailed_at"] = time();
      $rows[0] = $row;
      fg_save_submissions($storeFile, $rows);
    }
  }
  return [$id, null, ["mailed" => $mailed, "lead" => $row]];
}
