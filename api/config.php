<?php
/**
 * Fitness Gurukul Hostinger API config
 *
 * Prefer FG_ADMIN_TOKEN / ADMIN_TOKEN in the hosting environment.
 * Fallback below is only for first boot — rotate after deploy.
 */
$token = getenv("FG_ADMIN_TOKEN") ?: getenv("ADMIN_TOKEN") ?: getenv("ADMIN_PASSWORD");
if (!$token) {
  $token = "Rr6OrZTsbxJNfWcqFzyBQehb";
}

return [
  "admin_token" => $token,
  "whatsapp" => "917207113310",
  "contact_email" => "contact@fitnessgurukul.co.in",
  "site" => "https://fitnessgurukul.app",
];
