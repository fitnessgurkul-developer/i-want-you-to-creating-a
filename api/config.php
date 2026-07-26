<?php
/**
 * Fitness Gurukul Hostinger API config
 *
 * Owner password for backend.html (Hostinger PHP mode).
 * Override with FG_ADMIN_TOKEN or ADMIN_TOKEN env vars when available.
 */
$token = getenv("FG_ADMIN_TOKEN") ?: getenv("ADMIN_TOKEN") ?: "Rr6OrZTsbxJNfWcqFzyBQehb";
return [
  "admin_token" => $token,
  "whatsapp" => "917207113310",
  "phone" => "+917207113310",
  "contact_email" => "contact@fitnessgurukul.co.in",
];
