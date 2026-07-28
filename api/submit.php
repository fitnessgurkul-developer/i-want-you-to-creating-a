<?php
require __DIR__ . "/bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  fg_json_out(["ok" => true]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
if (!is_array($payload) || !$payload) {
  fg_json_out(["error" => "Invalid JSON"], 400);
}

list($id, $missing, $meta) = fg_save_submission($storeFile, $payload);
if ($missing) {
  if ($missing === ["storage"]) {
    // Never fail the visitor — lead was emailed as fallback when possible.
    $mailed = !empty($meta["mailed"]);
    fg_json_out([
      "ok" => true,
      "id" => null,
      "savedToBackend" => false,
      "mailed" => $mailed,
      "message" => "Received. We'll be in touch shortly.",
      "engine" => "hostinger-php",
      "fallback" => "mail",
    ], 200);
  }
  fg_json_out(["ok" => false, "error" => "Missing required fields", "fields" => $missing], 400);
}

fg_json_out([
  "ok" => true,
  "id" => $id,
  "savedToBackend" => true,
  "mailed" => !empty($meta["mailed"]),
  "message" => "Saved.",
  "engine" => "hostinger-php",
], 201);
