# Fitness Gurukul

Multi-page static frontend (HTML/CSS/JS at repo root) served by a dependency-free Python stdlib backend (`server.py`) with SQLite storage. See `README.md` for the full page list and API reference.

## Cursor Cloud specific instructions

- No third-party dependencies. The backend uses only the Python standard library (Python 3.12 is available); there is nothing to `pip install`. `npm` scripts are just launchers for `python3`.
- Run the app (dev = prod here): `python3 server.py` (or `npm start` / `npm run dev`). It serves both the static site and the API on `http://127.0.0.1:8000`.
- Lint/test: `npm test` runs `python3 -m py_compile server.py` (syntax check only; there is no automated test suite).
- The SQLite DB (`fitness_gurukul.sqlite3`) is created automatically on first run and is gitignored.
- `.env` is required for admin features. Copy `.env.example` to `.env` and set `ADMIN_TOKEN` to a long random string. If `ADMIN_TOKEN` is unset, the server generates a temporary token per process and prints it on startup. `.env` is gitignored — recreate it each session (it is not committed).
- Protected endpoints (`/api/submissions`, `/api/admin-data`, `DELETE /api/submissions/:id`) require header `X-Admin-Token: <ADMIN_TOKEN>`.
- Without `OPENAI_API_KEY`, the chat widget/`/api/chat` answers from local website facts (`"source": "local"`); this is expected, not a failure.
- Lead form required fields (`/api/submit`, `/api/leads`): `name`, `phone`, `program`, `goal` (corporate-event forms use a different field set).
- Server binds to `127.0.0.1` by default; use `HOST=0.0.0.0 python3 server.py` for LAN access.
