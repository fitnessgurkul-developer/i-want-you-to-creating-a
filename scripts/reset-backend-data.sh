#!/usr/bin/env bash
# Wipe local backend databases / lead stores back to empty.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
rm -f fitness_gurukul.sqlite3 fitness_gurukul.sqlite3-* \
      data/fitness_gurukul.sqlite3 data/fitness_gurukul.sqlite3-* \
      data/submissions.json data/backend-store.json
printf '[]\n' > api/data/submissions.json
printf '%s\n' '{
  "leads": [],
  "newsletter": [],
  "checkins": [],
  "ai_scans": [],
  "calculator_results": [],
  "chat_messages": [],
  "submissions": []
}' > data/backend-store.json
echo "Backend data reset (PHP JSON + Node store). Restart node server.js if running."
