<?php
require __DIR__ . "/bootstrap.php";

fg_json_out([
  "ok" => true,
  "engine" => "hostinger-php",
  "mode" => "hostinger",
  "localDefaultPassword" => false,
  "hint" => "Unlock with the owner password from api/config.php / ADMIN_TOKEN. This page is noindex.",
  "database" => "api/data/submissions.json",
]);
