# Fitness Gurukul Website

Static multi-page site with a **simple** owner backend.

## Stack (keep it simple)

- **Website:** HTML / CSS / JS at the repo root (Hostinger / any static host)
- **Production leads API:** Render Python (`server.py` + SQLite) — always-on cloud
- **Owner portal:** `backend.html` (password = Render `ADMIN_TOKEN`)
- **Fallbacks:** Hostinger PHP in `/api/` → silent FormSubmit email → WhatsApp
- **Local optional:** `python3 server.py` on port **8000**

`office.html`, `owner-data.html`, `admin.html`, and `dashboard.html` all redirect to `backend.html`.

## Run locally (optional Python)

```bash
cp .env.example .env
python3 server.py   # Windows: py server.py
```

Open:

```text
http://127.0.0.1:8000/                 # website
http://127.0.0.1:8000/backend.html     # owner leads
```

Password: `ADMIN_TOKEN` from `.env`, or the value in `api/config.php` on Hostinger.

## Environment

Copy `.env.example` to `.env`:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6
ADMIN_TOKEN=fitnessgurukul
HOST=127.0.0.1
PORT=8000
LEAD_NOTIFY_EMAIL=contact@fitnessgurukul.co.in,fitnessgurukul01@gmail.com
```

- Without `OPENAI_API_KEY`, the chat widget answers from local website facts.
- Change `ADMIN_TOKEN` before sharing the server beyond your machine.

## After merge — 3 clicks to make production work

Code alone cannot finish the deploy. Do these once:

1. **Merge this PR into `main`**, then on [Render](https://dashboard.render.com) open `fitness-gurukul-api` → **Manual Deploy → Clear build cache & deploy**.  
   (Fixes the Git LFS budget clone failure.)
2. Confirm health: open `https://fitness-gurukul-api.onrender.com/api/health` — should return `{"ok": true, ...}`.  
   Copy the Render **ADMIN_TOKEN** (Environment) — that is the `/backend.html` password when using the cloud API.
3. **Activate FormSubmit** — check `contact@fitnessgurukul.co.in` (and `fitnessgurukul01@gmail.com` if listed) for a one-time FormSubmit confirmation email and click Activate.  
   Optional but important: in Hostinger/SafeLine WAF, **whitelist** `/api/*.php` so the PHP fallback is not 403-blocked.

Site `config.js` already points `FG_API_BASE` at the Render URL. After Hostinger picks up that file, forms hit Render first.

## One-click cloud API (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/saikrishnacoder/i-want-you-to-creating-a)

After deploy:

```bash
./scripts/verify-api.sh https://fitness-gurukul-api.onrender.com
```

## Deploy the website (static)

The repo root is a **static site**. There is no `requirements.txt` / `package.json`, so Vercel, Netlify, and Hostinger will not try to install Python or Node deps.

| Host | How |
|------|-----|
| **Hostinger** | Upload site files + `/api/*.php`. Owner → `backend.html`. |
| **Vercel** | Connect GitHub. Uses `vercel.json` → builds `dist/` (static only). |
| **Netlify** | Connect GitHub. Uses `netlify.toml` → publishes `dist/`. |
| **Any static host** | Run `bash scripts/prepare-netlify-dist.sh` and upload the `dist/` folder. |

Leads prefer Render (`FG_API_BASE`). If Render sleeps or fails: PHP → FormSubmit email → WhatsApp.
