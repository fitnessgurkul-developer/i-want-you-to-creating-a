<?php
require __DIR__ . "/bootstrap.php";
fg_cors_preflight();

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
$challengeName = fg_clip($payload["challengeName"] ?? ($payload["challenge"] ?? "Transformation Challenge"), 120);
$join = [
  "form_type" => "challenge-join",
  "name" => $payload["name"] ?? "",
  "phone" => $payload["phone"] ?? "",
  "email" => $payload["email"] ?? "",
  "program" => $challengeName,
  "goal" => $payload["goal"] ?? "transformation",
  "message" => $payload["message"] ?? "Joined from transformation-challenge page",
];
[$id, $missing] = fg_save_submission($storeFile, $join);
if ($missing) {
  fg_json_out(["ok" => false, "error" => "Missing fields", "missing" => $missing], 400);
}
fg_json_out([
  "ok" => true,
  "message" => "You are in. A coach will reach out soon.",
  "id" => $id,
], 201);
