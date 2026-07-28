#!/usr/bin/env bash
# Apply recommended env vars to the Render service via API.
# Usage:
#   export RENDER_API_KEY=rnd_...
#   export RENDER_SERVICE_ID=srv-...   # optional if name matches
#   bash scripts/configure-render-env.sh
set -euo pipefail

API="https://api.render.com/v1"
KEY="${RENDER_API_KEY:-}"
if [[ -z "$KEY" ]]; then
  echo "Set RENDER_API_KEY first (Render Dashboard → Account Settings → API Keys)."
  exit 1
fi

auth=(-H "Authorization: Bearer $KEY" -H "Accept: application/json" -H "Content-Type: application/json")

SERVICE_ID="${RENDER_SERVICE_ID:-}"
if [[ -z "$SERVICE_ID" ]]; then
  echo "Looking up service fitness-gurukul-api ..."
  SERVICE_ID=$(curl -fsS "${auth[@]}" "$API/services?limit=50" \
    | python3 -c '
import json,sys
rows=json.load(sys.stdin)
items=rows if isinstance(rows,list) else rows.get("services") or rows.get("items") or rows
for row in items:
    svc=row.get("service") or row
    if svc.get("name")=="fitness-gurukul-api" or "fitness-gurukul-api" in (svc.get("serviceDetails") or {}).get("url","") or svc.get("name","").startswith("fitness-gurukul"):
        print(svc.get("id",""))
        break
')
fi

if [[ -z "$SERVICE_ID" ]]; then
  echo "Could not find service id. Set RENDER_SERVICE_ID=srv-xxxx"
  exit 1
fi
echo "Using service: $SERVICE_ID"

put_env() {
  local key="$1" value="$2"
  echo "Upsert $key"
  curl -fsS -X PUT "${auth[@]}" \
    "$API/services/$SERVICE_ID/env-vars/$key" \
    -d "$(python3 -c 'import json,sys; print(json.dumps({"value":sys.argv[1]}))' "$value")" >/dev/null \
    || curl -fsS -X POST "${auth[@]}" \
      "$API/services/$SERVICE_ID/env-vars" \
      -d "$(python3 -c 'import json,sys; print(json.dumps({"key":sys.argv[1],"value":sys.argv[2]}))' "$key" "$value")" >/dev/null
}

put_env "LEAD_NOTIFY_EMAIL" "contact@fitnessgurukul.co.in,fitnessgurukul01@gmail.com"
put_env "LEAD_NOTIFY_MODE" "both"
put_env "DATA_DIR" "/var/data"
put_env "HOST" "0.0.0.0"
put_env "CORS_ORIGINS" "*"

echo "Triggering deploy..."
curl -fsS -X POST "${auth[@]}" "$API/services/$SERVICE_ID/deploys" -d '{"clearCache":"do_not_clear"}' >/dev/null \
  || curl -fsS -X POST "${auth[@]}" "$API/services/$SERVICE_ID/deploys" -d '{}' >/dev/null \
  || echo "Deploy trigger skipped (check dashboard Manual Deploy)."

echo "Done. Confirm FormSubmit activation email in the inbox if prompted."
