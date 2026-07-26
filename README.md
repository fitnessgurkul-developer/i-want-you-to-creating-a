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

## Deploy: Hostinger (recommended simple path)

Keep `config.js` as `window.FG_API_BASE = ""`.

- Forms → `/api/submit.php` → `api/data/submissions.json`
- Challenge joins → `/api/challenge-join.php`
- Owner page → `backend.html` via `/api/admin-data.php`
- Password → `api/config.php`

If PHP is down, forms fall back to a prefilled WhatsApp message.

## Deploy: Hostinger site + always-on API (Render / Railway / Fly)

Optional upgrade if you want SQLite + AI chat on a cloud API:

1. **Website files** on Hostinger (HTML/CSS/JS + `/api/*.php`)
2. **Python API** (`server.py`) on Render, Railway, or Fly.io (always online)

### A) Deploy the API (pick one)

**Render (easiest)**
1. Go to [https://render.com](https://render.com) → New → Blueprint / Web Service
2. Connect this GitHub repo (`main`)
3. Runtime: Python · Start command: `python server.py`
4. Set env vars:
   - `HOST=0.0.0.0`
   - `ADMIN_TOKEN=` (choose a strong password)
   - `CORS_ORIGINS=*` (or your Hostinger domain)
5. Deploy → copy the URL, e.g. `https://fitness-gurukul-api.onrender.com`

**Railway**
1. [https://railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Uses the repo `Dockerfile` (`railway.toml`) — start command: `python server.py`
3. Add the same env vars as above
4. Generate a public domain and copy it

**Vercel (static site only)**
Vercel serves the front-end from `dist/` via `vercel.json` — **no Python serverless functions**. Backend stays on Hostinger PHP (`/api/*.php`) or Render/Railway/Fly (`server.py`). Do not point Vercel at `server.py`.

**Fly.io**
```bash
fly launch
fly secrets set ADMIN_TOKEN=your-strong-password CORS_ORIGINS=*
fly deploy
```

Health check: open `https://YOUR-API-URL/api/health` — should return `{"ok": true, ...}`.

### B) Point the Hostinger website at the API

Edit `config.js` on Hostinger (or in Git then redeploy):

```js
window.FG_API_BASE = "https://YOUR-API-URL";
```

Example:

```js
window.FG_API_BASE = "https://fitness-gurukul-api.onrender.com";
```

Leave it as `""` only when the site and API are on the same origin (local `server.py`).

**This one setting is what keeps leads in your backend:**
- Website forms → `POST {FG_API_BASE}/api/submit` → SQLite on the cloud API
- Challenge joins → `POST {FG_API_BASE}/api/challenge-join` → same SQLite
- Owner page `backend.html` → `GET {FG_API_BASE}/api/admin-data` → same SQLite

So Hostinger only hosts the pages; the cloud API owns the database.

### C) Redeploy Hostinger

Pull/upload the latest `main` (includes `config.js`) and make sure your edited API URL is live.

Then forms, quiz, live stats, chat, and `backend.html` keep working with your laptop off. Open `https://yoursite.com/backend.html` and unlock with the same `ADMIN_TOKEN` from Render/Railway/Fly — new leads appear there.

**Notes**
- Free Render apps may sleep after idle; first request can take ~30s to wake.
- SQLite on free tiers is usually ephemeral (resets on redeploy). For permanent leads, use a paid disk/volume or export regularly from the owner backend.

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
- `GET /api/admin-data.php` (owner password)
- `POST /api/submission-status.php` / `submission-delete.php`

Optional local/cloud Python (`server.py`) adds SQLite, chat, match/quiz, and the same lead APIs under `/api/*`.

## Security notes

- Do not commit `.env`, `*.sqlite3`, or `api/data/*.json`
- Do not share `backend.html` without the owner password
- Change the password in `api/config.php` after first Hostinger deploy
