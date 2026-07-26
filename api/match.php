<?php
require __DIR__ . "/bootstrap.php";
require __DIR__ . "/catalog.php";
fg_cors_preflight();

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
fg_json_out(fg_match_goal($payload));
