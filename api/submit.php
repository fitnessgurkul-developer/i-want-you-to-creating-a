<?php
require __DIR__ . "/bootstrap.php";
fg_cors_preflight();

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
[$id, $missing] = fg_save_submission($storeFile, $payload);
if ($missing) {
  fg_json_out(["ok" => false, "error" => "Missing required fields", "fields" => $missing], 400);
}
fg_json_out(["ok" => true, "id" => $id, "message" => "Saved."], 201);
