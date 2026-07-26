<?php
require __DIR__ . "/bootstrap.php";
fg_cors_preflight();
fg_require_admin($config);

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
if (!in_array($method, ["POST", "PATCH"], true)) {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
$id = fg_clip($payload["id"] ?? ($_GET["id"] ?? ""), 64);
$status = strtolower(fg_clip($payload["status"] ?? "", 32));
if ($id === "" || !in_array($status, ["new", "contacted", "qualified", "closed"], true)) {
  fg_json_out(["error" => "Invalid id or status"], 400);
}

$rows = fg_load_submissions($storeFile);
$found = false;
foreach ($rows as &$row) {
  if (($row["id"] ?? "") === $id) {
    $row["status"] = $status;
    $found = true;
    break;
  }
}
unset($row);

if (!$found) {
  fg_json_out(["error" => "Not found"], 404);
}
if (!fg_save_submissions($storeFile, $rows)) {
  fg_json_out(["error" => "Storage failed"], 500);
}
fg_json_out(["ok" => true, "id" => $id, "status" => $status]);
