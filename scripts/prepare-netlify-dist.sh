#!/usr/bin/env bash
# Pure-shell fallback for Netlify/Hostinger when npm install is skipped/failed.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v node >/dev/null 2>&1; then
  node scripts/prepare-netlify-dist.js
  exit 0
fi

echo "node not found — using shell copy fallback"
DIST="$ROOT/dist"
rm -rf "$DIST"
mkdir -p "$DIST"

files=(
  index.html index.php .htaccess
  about.html admin.html backend.html book-consultation.html
  coaches.html contact.html dashboard.html events.html office.html
  owner-data.html services.html testimonials.html tools.html
  transformation-challenge.html workouts.html
  app.js config.js styles.css robots.txt sitemap.xml
)

for f in "${files[@]}"; do
  if [[ -f "$f" ]]; then
    cp "$f" "$DIST/$f"
  fi
done

for d in assets coaches api TESTIMONIALS; do
  if [[ -d "$d" ]]; then
    cp -a "$d" "$DIST/"
  fi
done

echo "Netlify dist ready (shell): $DIST"
