<?php
require __DIR__ . "/bootstrap.php";
fg_cors_preflight();
fg_require_admin($config);

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
if (!in_array($method, ["POST", "DELETE"], true)) {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
$id = fg_clip($payload["id"] ?? ($_GET["id"] ?? ""), 64);
if ($id === "") {
  fg_json_out(["error" => "Missing id"], 400);
}

$rows = fg_load_submissions($storeFile);
$before = count($rows);
$rows = array_values(array_filter($rows, function ($row) use ($id) {
  return ($row["id"] ?? "") !== $id;
}));
if (count($rows) === $before) {
  fg_json_out(["error" => "Not found"], 404);
}
if (!fg_save_submissions($storeFile, $rows)) {
  fg_json_out(["error" => "Storage failed"], 500);
}
fg_json_out(["ok" => true]);
