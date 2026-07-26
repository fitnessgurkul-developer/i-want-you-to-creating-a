<?php
require __DIR__ . "/bootstrap.php";

$writable = is_dir(__DIR__ . "/data") && is_writable(__DIR__ . "/data");
fg_json_out([
  "ok" => true,
  "engine" => "hostinger-php",
  "site" => $config["site"] ?? "https://fitnessgurukul.app",
  "deploy" => "backend-redo",
  "dataWritable" => $writable,
  "adminConfigured" => !empty($config["admin_token"]),
]);
