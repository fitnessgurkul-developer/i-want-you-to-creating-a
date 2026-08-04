# Fitness Gurukul Website

Multi-page site + **SQLite** form backend. Each form writes to its own table. Deploy on **Render** so forms stay online when your laptop is off — and email you on every new lead.

## Form → SQLite tables

| Form | Table | Email alert |
|------|--------|-------------|
| Consultation / contact / book a coach | `consultations` | yes |
| 4-week transformation challenge | `challenge_leads` | yes |
| Corporate event inquiry | `corporate_events` | yes |
| Fitness calculators | `calculations` | no |

## Simple Render flow (always on + email)

### 1. Push this repo to GitHub
Use branch `main` (or merge the forms PR first).

### 2. Create the web service on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect the GitHub repo `i-want-you-to-creating-a`
3. Settings:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance:** Free (or Starter)
4. Click **Create Web Service** and wait for the deploy

Your site will be at something like:

```text
https://fitness-gurukul.onrender.com
```

Forms + admin work on that URL 24/7 (laptop can be off).

### 3. Add email env vars (Render → Environment)
| Key | Example | Notes |
|-----|---------|--------|
| `LEAD_NOTIFY_EMAIL` | `you@gmail.com` | Where lead emails go |
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP |
| `SMTP_PORT` | `465` | SSL |
| `SMTP_USER` | `you@gmail.com` | Same Gmail account |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | [App Password](https://myaccount.google.com/apppasswords) (not your normal password) |
| `MAIL_FROM` | `Fitness Gurukul <you@gmail.com>` | Optional From line |

After saving env vars, **Manual Deploy → Deploy latest commit**.

### 4. Test
1. Open `https://YOUR-APP.onrender.com/book-consultation.html`
2. Submit a test lead
3. Check `/admin` and your inbox

### Free plan tip
Render free instances sleep after ~15 minutes idle — first request can take ~30–60s to wake. Forms still work; paid Starter stays always awake.

## Run locally

```bash
npm install
npm start
```

```text
http://127.0.0.1:3000
http://127.0.0.1:3000/admin
```

For local email tests, put the same SMTP vars in a `.env` file is not auto-loaded — export them in your shell, or set them in Render only.

## Admin

`/admin` — tabs per table, delete, CSV export.
