<?php
require __DIR__ . "/bootstrap.php";

fg_json_out([
  "ok" => true,
  "engine" => "hostinger-php",
  "mode" => "hostinger",
  // Never expose the real password over the public API.
  "localDefaultPassword" => false,
  "hint" => "Enter the owner password from api/config.php (or FG_ADMIN_TOKEN env).",
  "database" => "api/data/submissions.json",
  "site" => "https://fitnessgurukul.app",
]);
