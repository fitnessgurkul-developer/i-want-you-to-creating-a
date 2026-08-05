# Fitness Gurukul Full-Stack Website

Multi-page Fitness Gurukul website with a responsive frontend, Node (or Python) backend, and SQLite database.

## What is included

- Frontend: HTML pages, `styles.css`, and `app.js` at the repo root
- Backend (pick one for local/API hosting):
  - **Node** — `server.js` (used by `npm start` and Render)
  - **Python** — `server.py` (dependency-free HTTP API alternative)
- Database: SQLite file created automatically (`fitness_gurukul.sqlite3` / sql.js for Node)
- Admin: `admin.html` (Node submissions) and `owner-data.html` (Python admin-data)
- Static deploys (Netlify/Vercel): frontend only via `scripts/prepare-static-dist.sh`

## Pages

- `index.html` — home
- `about.html` — about
- `services.html` — services, plans, pricing
- `events.html` — community and corporate events
- `coaches.html` — coaches (profiles open as overlays)
- `tools.html` — BMI and fitness tools
- `testimonials.html` — success stories
- `contact.html` — consultation form and FAQ
- `book-consultation.html` — booking form
- `transformation-challenge.html` — challenge signup
- `owner-data.html` / `admin.html` — owner-only data viewers (not in main nav)

## Brand system

The UI uses the Fitness Gurukul logo colors:

- Black/dark background
- Logo cyan and blue
- Fitness red
- White/ice text surfaces

Fonts: Montserrat for headings/buttons, Inter for body/UI text.

## Run locally

### Node (default)

```bash
npm install
npm start
```

Open `http://127.0.0.1:3000` (or the port logged by the server).

### Python alternative

```bash
python server.py
```

Open `http://127.0.0.1:8000`.

To collect form data from another laptop on the same Wi-Fi, share your main laptop's network link (not `127.0.0.1`).

## Where user data appears

Run a backend, submit a form, then open:

- Node: `admin.html` (`/api/submissions`)
- Python: `owner-data.html` (`/api/admin-data`)

Static hosting cannot run the backend, so forms save demo records in the browser only.

## AI chatbot (free by default)

The chat widget works **without any paid API**.

### Option A — Free FAQ assistant (zero setup)

Just run the server. The bot answers from Fitness Gurukul plan/coach facts.

```bash
npm start
# or: python server.py
```

### Option B — Free real AI with Ollama (recommended)

1. Install [Ollama](https://ollama.com)
2. Pull a small model:

```bash
ollama pull llama3.2
```

3. Restart the site server. It auto-detects Ollama at `http://127.0.0.1:11434`.

Optional `.env`:

```text
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
```

### Option C — Paid OpenAI (opt-in only)

OpenAI is **not** used by default, even if a key exists. To enable it:

```text
CHAT_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-5.6
```

Or keep `CHAT_PROVIDER=auto` and set `CHAT_ALLOW_OPENAI=true`.

Priority with `CHAT_PROVIDER=auto`: **Ollama → local FAQ** (OpenAI only when opted in).

## API endpoints

Shared / common:

- `GET /api/health`
- `GET /api/content`
- `GET /api/chat/status`
- `POST /api/chat`

Node (`server.js`):

- `POST /api/submit`
- `GET /api/submissions`
- `DELETE /api/submissions`

Python (`server.py`):

- `POST /api/leads`
- `POST /api/newsletter`
- `POST /api/checkins`
- `POST /api/calculations`
- `GET /api/stats`
- `GET /api/admin-data`
