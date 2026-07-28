#!/usr/bin/env bash
# Build Vercel Build Output API layout: static site + Node lead functions.
# Ensures /api/submit etc. run as serverless even with a static publish dir.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash "$ROOT/scripts/prepare-netlify-dist.sh"

OUT="$ROOT/.vercel/output"
STATIC="$OUT/static"
FUNCS="$OUT/functions"

rm -rf "$OUT"
mkdir -p "$STATIC" "$FUNCS"

# Static site
cp -a "$ROOT/dist/." "$STATIC/"

# Do not expose PHP sources as downloadable static files on Vercel.
rm -rf "$STATIC/api"

RUNTIME_NODE="${VERCEL_NODE_RUNTIME:-nodejs20.x}"

write_func() {
  local name="$1"   # e.g. submit
  local src="$2"    # e.g. api/submit.js
  local dir="$FUNCS/api/${name}.func"
  mkdir -p "$dir/lib"
  cp "$ROOT/$src" "$dir/index.js"
  cp "$ROOT/api/lib/leads.js" "$dir/lib/leads.js"
  cat > "$dir/.vc-config.json" <<EOF
{
  "runtime": "${RUNTIME_NODE}",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "shouldAddHelpers": true
}
EOF
}

write_func "submit" "api/submit.js"
write_func "leads" "api/submit.js"
write_func "challenge-join" "api/challenge-join.js"
write_func "lead-mail" "api/lead-mail.js"
write_func "lead-digest" "api/lead-digest.js"
write_func "admin-data" "api/admin-data.js"
write_func "backend-info" "api/backend-info.js"

cat > "$OUT/config.json" <<'EOF'
{
  "version": 3,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/api/submit", "dest": "/api/submit" },
    { "src": "/api/leads", "dest": "/api/leads" },
    { "src": "/api/challenge-join", "dest": "/api/challenge-join" },
    { "src": "/api/lead-mail", "dest": "/api/lead-mail" },
    { "src": "/api/lead-digest", "dest": "/api/lead-digest" },
    { "src": "/api/admin-data", "dest": "/api/admin-data" },
    { "src": "/api/backend-info", "dest": "/api/backend-info" },
    { "src": "/backend", "status": 308, "headers": { "Location": "/backend.html" } },
    { "src": "/office", "status": 308, "headers": { "Location": "/backend.html" } },
    { "src": "/owner", "status": 308, "headers": { "Location": "/backend.html" } },
    { "src": "/admin", "status": 308, "headers": { "Location": "/backend.html" } }
  ]
}
EOF

echo "Vercel Build Output ready: $OUT"
ls -la "$FUNCS/api"
