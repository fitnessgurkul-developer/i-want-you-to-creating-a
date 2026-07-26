<?php
require __DIR__ . "/bootstrap.php";

fg_json_out([
  "ok" => true,
  "engine" => "hostinger-php",
  "mode" => "hostinger",
  "localDefaultPassword" => false,
  "hint" => "Enter the owner password from api/config.php (or FG_ADMIN_TOKEN env).",
  "database" => "api/data/submissions.json",
  "site" => $config["site"] ?? "https://fitnessgurukul.app",
  "ownerUrl" => "/backend.html",
]);
