<?php
require __DIR__ . "/bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  fg_json_out(["error" => "Method not allowed"], 405);
}

$payload = fg_read_json_body();
$challengeId = fg_clip($payload["challengeId"] ?? ($payload["challenge"] ?? ""), 80);
$challengeName = $challengeId !== "" ? $challengeId : "90 Day Transformation Challenge";

$age = fg_clip($payload["age"] ?? "", 10);
$weight = fg_clip($payload["weight"] ?? "", 20);
$height = fg_clip($payload["height"] ?? "", 20);
$measurements = fg_clip($payload["measurements"] ?? "", 240);
$incomingMessage = fg_clip($payload["message"] ?? "", 700);

$parts = ["90 Day Transformation Challenge registration"];
if ($age !== "") {
  $parts[] = "Age: " . $age;
}
if ($weight !== "") {
  $parts[] = "Weight: " . $weight . " kg";
}
if ($height !== "") {
  $parts[] = "Height: " . $height . " cm";
}
if ($measurements !== "") {
  $parts[] = "Measurements: " . $measurements;
}
if ($incomingMessage !== "") {
  $parts[] = $incomingMessage;
}
$parts[] = "Mode: online · Platform: Fitness Gurukul App · Consent: yes";
$message = implode(" | ", $parts);

$join = [
  "form_type" => "challenge-join",
  "name" => $payload["name"] ?? "",
  "phone" => $payload["phone"] ?? "",
  "email" => $payload["email"] ?? "",
  "program" => $challengeName,
  "goal" => $payload["goal"] ?? "transformation",
  "message" => $message,
  "coach" => "",
];

list($id, $missing) = fg_save_submission($storeFile, $join);
if ($missing) {
  fg_json_out(["ok" => false, "error" => "Missing fields", "missing" => $missing], 400);
}

$rows = fg_load_submissions($storeFile);
$joined = 0;
foreach ($rows as $row) {
  if (($row["form_type"] ?? "") === "challenge-join") {
    $joined++;
  }
}

fg_json_out([
  "ok" => true,
  "message" => "You’re registered. Download the app, join the WhatsApp community, and send your baseline photos.",
  "id" => $id,
  "challenge" => ["id" => $challengeId, "name" => $challengeName],
  "stats" => ["totalJoined" => $joined],
  "engine" => "hostinger-php",
], 201);
