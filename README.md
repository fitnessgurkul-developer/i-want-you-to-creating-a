# Fitness Gurukul Website

Static multi-page site with a **simple** owner backend.

## Stack (keep it simple)

- **Website:** HTML / CSS / JS at the repo root
- **Production leads API:** Hostinger PHP in `/api/` → `api/data/submissions.json`
- **Owner portal:** one page — `backend.html` (password in `api/config.php`)
- **Local optional:** `python3 server.py` for full site + SQLite on port **8000**

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
```

- Without `OPENAI_API_KEY`, the chat widget answers from local website facts.
- Change `ADMIN_TOKEN` (or `ADMIN_PASSWORD`) before sharing the server beyond your machine.

## One-click cloud API (Render)

Deploy the Python API from this repo (free tier, no credit card):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/saikrishnacoder/i-want-you-to-creating-a)

After deploy:
1. Copy the service URL (`https://….onrender.com`)
2. Set it in `config.js`: `window.FG_API_BASE = "https://….onrender.com";`
3. Push/redeploy Hostinger
4. Run `./scripts/verify-api.sh https://….onrender.com`
5. Open `/backend.html` with password `fitnessgurukul` (or your `ADMIN_TOKEN`)

## Deploy the website (no errors)

The repo root is a **static site**. There is no `requirements.txt` / `package.json`, so Vercel, Netlify, and Hostinger will not try to install Python or Node deps.

Keep `config.js` as:

```js
window.FG_API_BASE = "";
```

| Host | How |
|------|-----|
| **Hostinger** | Upload site files + `/api/*.php`. Forms → `submit.php`. Owner → `backend.html`. |
| **Vercel** | Connect GitHub. Uses `vercel.json` → builds `dist/` (static only). |
| **Netlify** | Connect GitHub. Uses `netlify.toml` → publishes `dist/`. |
| **Any static host** | Run `bash scripts/prepare-netlify-dist.sh` and upload the `dist/` folder. |

Leads on Hostinger: `/api/submit.php` → `api/data/submissions.json`. Password in `api/config.php`. If PHP is down, forms fall back to WhatsApp.

## Optional: cloud Python API

Only if you want SQLite + AI chat on a separate service. Site stays static; set `FG_API_BASE` to the API URL after deploy.

- **Render:** blueprint `render.yaml` · start `python server.py`
- **Railway / Fly:** `Dockerfile` · start `python server.py`

Do **not** deploy `server.py` as a Vercel/Netlify serverless function.

## Pages

- `index.html` — home
- `about.html` — brand story
- `services.html` — plans and services
- `coaches.html` — coach directory
- `events.html` — corporate and community events
- `testimonials.html` — client stories
- `tools.html` — fitness calculators
- `contact.html` / `book-consultation.html` — lead forms
- `backend.html` — **only** owner portal (leads table)
- `admin.html` / `dashboard.html` / `office.html` / `owner-data.html` — redirects to `backend.html`

## Simple Hostinger API

- `POST /api/submit.php`
- `POST /api/challenge-join.php`
- `POST /api/lead-mail.php` — email/storage fallback (visitor never sees a failure)
- `GET|POST /api/lead-digest.php?token=…` — combined lead email for the last 12 hours
- `GET /api/admin-data.php` (owner password)
- `POST /api/submission-status.php` / `submission-delete.php`

### Lead email + 12-hour digest

Configure in `api/config.php` (or env vars):

| Setting | Values | Default |
|---------|--------|---------|
| `lead_notify_mode` | `instant`, `digest_12h`, `both`, `off` | `both` |
| `lead_notify_email` | inbox for lead mail | `contact@fitnessgurukul.co.in` |
| `lead_digest_hours` | window size | `12` |

- **instant / both** — each new lead emails the inbox as it arrives
- **digest_12h / both** — cron sends one combined email of all undigested leads in the window
- If the database write fails, the API still emails the lead and returns success to the visitor

Hostinger cron (every 12 hours):

```bash
0 */12 * * * curl -fsS "https://YOUR-DOMAIN/api/lead-digest.php?token=YOUR_ADMIN_OR_CRON_TOKEN"
```

Python cloud API uses the same paths (`/api/lead-mail`, `/api/lead-digest`) with optional `SMTP_*` env vars.

Optional local/cloud Python (`server.py`) adds SQLite, chat, match/quiz, and the same lead APIs under `/api/*`.

## Security notes

- Do not commit `.env`, `*.sqlite3`, or `api/data/*.json`
- Do not share `backend.html` without the owner password
- Change the password in `api/config.php` after first Hostinger deploy
