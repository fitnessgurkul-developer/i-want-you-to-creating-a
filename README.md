# Fitness Gurukul Website

Multi-page Fitness Gurukul site with a simple **SQLite** form backend. Each form writes to its own table. No Render / Python API.

## Run locally (forms + admin)

```bash
npm install
npm start
```

Open:

```text
http://127.0.0.1:3000
http://127.0.0.1:3000/admin
```

The Node server serves the static site and saves every submission into `fitness_gurukul.sqlite3`.

## Form → SQLite tables

| Form | Table |
|------|--------|
| Consultation / contact / book a coach | `consultations` |
| 4-week transformation challenge | `challenge_leads` |
| Corporate event inquiry | `corporate_events` |
| Fitness calculators | `calculations` |

Forms POST JSON to `/api/forms/<table>` (also accepts `/api/submit` with `form_type`).

## Admin

`/admin` lists all four tables, with tabs, delete, and CSV export.

## Static hosting note

Pure static deploys (Vercel/Netlify `dist/`) do not run Node or SQLite. For live form capture, run this app with `npm start` on any always-on Node host and open the site from that URL.
