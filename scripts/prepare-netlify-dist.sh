#!/usr/bin/env bash
# Build a static-only dist/ for Netlify, Vercel, Hostinger, etc.
# Never fails the deploy because of optional folders or missing node.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v node >/dev/null 2>&1 && [[ -f scripts/prepare-netlify-dist.js ]]; then
  if node scripts/prepare-netlify-dist.js; then
    exit 0
  fi
  echo "node prepare failed — falling back to shell copy" >&2
fi

echo "Preparing dist with shell copy"
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
    cp "$f" "$DIST/$f" || true
  fi
done

for d in assets coaches api TESTIMONIALS; do
  if [[ -d "$d" ]]; then
    cp -a "$d" "$DIST/" || true
  fi
done

if [[ ! -f "$DIST/index.html" ]]; then
  echo "ERROR: dist/index.html missing" >&2
  exit 1
fi

echo "Static dist ready: $DIST"
exit 0
