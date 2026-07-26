#!/usr/bin/env bash
# Wipe local backend databases / lead stores back to empty.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
rm -f fitness_gurukul.sqlite3 fitness_gurukul.sqlite3-* \
      data/fitness_gurukul.sqlite3 data/fitness_gurukul.sqlite3-* \
      data/submissions.json
printf '[]\n' > api/data/submissions.json
echo "Backend data reset. Restart python server.py if it is running."
