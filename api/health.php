<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");
$writable = is_dir(__DIR__ . "/data") && is_writable(__DIR__ . "/data");
echo json_encode([
  "ok" => true,
  "engine" => "hostinger-php",
  "site" => "https://fitnessgurukul.app",
  "deploy" => "2026-07-26-urgent",
  "dataWritable" => $writable,
]);
