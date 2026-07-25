<?php
/**
 * Fitness Gurukul Hostinger API config
 *
 * Change admin_token before going live. This password unlocks backend.html
 * when the site is served from Hostinger (no Python / Render required).
 */
return [
  "admin_token" => getenv("FG_ADMIN_TOKEN") ?: "Rr6OrZTsbxJNfWcqFzyBQehb",
  "whatsapp" => "917207113310",
  "contact_email" => "contact@fitnessgurukul.co.in",
];
