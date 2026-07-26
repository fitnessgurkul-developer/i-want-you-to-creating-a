<?php
require __DIR__ . "/bootstrap.php";
fg_require_admin($config);

$rows = fg_load_submissions($storeFile);
$leads = [];
foreach ($rows as $row) {
  $leads[] = [
    "name" => $row["name"] ?? "",
    "phone" => $row["phone"] ?? "",
    "goal" => $row["goal"] ?? "",
    "program" => $row["program"] ?? "",
    "message" => $row["message"] ?? "",
    "created_at" => $row["created_at"] ?? 0,
  ];
}

fg_json_out([
  "ok" => true,
  "database" => "api/data/submissions.json",
  "submissionCount" => count($rows),
  "viewer" => "backend.html",
  "engine" => "hostinger-php",
  "leads" => $leads,
  "checkins" => [],
  "newsletter" => [],
  "ai_scans" => [],
  "calculations" => [],
  "chat_messages" => [],
  "submissions" => $rows,
]);
