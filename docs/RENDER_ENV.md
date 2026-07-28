# Render env checklist (`fitness-gurukul-api`)

## Applied in repo
- `config.js` → `FG_API_BASE = https://fitness-gurukul-api.onrender.com`
- Form fetch timeout 8s so cold/down Render fails over to Vercel `/api/submit`
- `render.yaml` sets `LEAD_NOTIFY_EMAIL`, `LEAD_NOTIFY_MODE`, `DATA_DIR`, keeps your `ADMIN_TOKEN`
- FormSubmit fallback emails full lead details when SMTP is unset

## Add in Render Dashboard (Environment) if not synced yet

| Key | Value |
|-----|--------|
| `LEAD_NOTIFY_EMAIL` | `contact@fitnessgurukul.co.in,fitnessgurukul01@gmail.com` |
| `LEAD_NOTIFY_MODE` | `both` |
| `DATA_DIR` | `/opt/render/project/src/data` |

Keep existing: `ADMIN_TOKEN`, `CORS_ORIGINS=*`, `HOST`, `PYTHON_VERSION`.

### One-command apply + redeploy (optional)
```bash
export RENDER_API_KEY=rnd_xxx   # Account Settings → API Keys
export RENDER_SERVICE_ID=srv-xxx  # from service URL
bash scripts/configure-render-env.sh
```

## FormSubmit activation (required once)
After the first lead email attempt, open **contact@fitnessgurukul.co.in** and click FormSubmit’s confirm link. Until then, FormSubmit holds mail.

## Persistent disk (paid Render)
1. Upgrade service off free (disk needs paid instance)
2. Add disk mounted at `/var/data`
3. Set `DATA_DIR=/var/data`
4. Manual Deploy

On free tier, each lead is still emailed (durable), SQLite may reset on redeploy.

## Egress allowlist
```text
74.220.48.0/24
74.220.56.0/24
```

## Owner portal
Unlock `/backend.html` with the same `ADMIN_TOKEN` shown in Render.
