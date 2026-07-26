<?php
require __DIR__ . "/bootstrap.php";
require __DIR__ . "/catalog.php";
fg_cors_preflight();

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
$challengeId = fg_clip($payload["challengeId"] ?? ($payload["challenge"] ?? ""), 80);
$challenge = $challengeId !== "" ? fg_find_challenge($challengeId) : null;
$challengeName = $challenge
  ? ($challenge["name"] ?? "Transformation Challenge")
  : fg_clip($payload["challengeName"] ?? ($payload["challenge"] ?? "Transformation Challenge"), 120);

$join = [
  "form_type" => "challenge-join",
  "name" => $payload["name"] ?? "",
  "phone" => $payload["phone"] ?? "",
  "email" => $payload["email"] ?? "",
  "program" => $challengeName,
  "goal" => ($challenge["goal"] ?? null) ?: ($payload["goal"] ?? "transformation"),
  "message" => $payload["message"] ?? ("Joined challenge" . ($challengeId ? " " . $challengeId : "") . " from transformation-challenge page"),
  "location" => $challengeId,
];
[$id, $missing] = fg_save_submission($storeFile, $join);
if ($missing) {
  fg_json_out(["ok" => false, "error" => "Missing fields", "missing" => $missing], 400);
}
fg_json_out([
  "ok" => true,
  "message" => "You are in. A coach will reach out soon.",
  "challenge" => $challenge,
  "id" => $id,
  "stats" => fg_challenges_payload($storeFile),
], 201);
