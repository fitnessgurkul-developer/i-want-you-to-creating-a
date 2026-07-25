<?php
/**
 * Hostinger fallback entry — some accounts prefer index.php.
 * Serves the static homepage so the new site is never blank.
 */
$path = __DIR__ . "/index.html";
if (!is_file($path)) {
  http_response_code(503);
  header("Content-Type: text/plain; charset=utf-8");
  echo "Fitness Gurukul site files are missing from public_html. Upload the latest deploy package.";
  exit;
}
header("Content-Type: text/html; charset=utf-8");
header("X-FG-Deploy: hostinger-php-entry");
readfile($path);
