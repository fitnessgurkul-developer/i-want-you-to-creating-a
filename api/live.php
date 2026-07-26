<?php
require __DIR__ . "/bootstrap.php";
require __DIR__ . "/catalog.php";
fg_cors_preflight();

if (($_SERVER["REQUEST_METHOD"] ?? "GET") !== "GET") {
  fg_json_out(["error" => "Method not allowed"], 405);
}

fg_json_out(fg_live_payload($storeFile));
