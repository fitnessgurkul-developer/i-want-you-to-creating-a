# Render env checklist (`fitness-gurukul-api`)

Your service already has `ADMIN_TOKEN`, `CORS_ORIGINS=*`, `HOST`, `PYTHON_VERSION`.  
Add these so **forms + email never depend on localhost mail** (which does not exist on Render):

## Add now (Environment → Add Environment Variable)

| Key | Value | Why |
|-----|--------|-----|
| `LEAD_NOTIFY_EMAIL` | `contact@fitnessgurukul.co.in,fitnessgurukul01@gmail.com` | Where lead emails go |
| `LEAD_NOTIFY_MODE` | `both` | Instant email + 12h digest support |

Optional but better deliverability:

| Key | Value | Why |
|-----|--------|-----|
| `SMTP_HOST` | e.g. `smtp.resend.com` / Gmail / Zoho | Reliable SMTP |
| `SMTP_PORT` | `587` | TLS |
| `SMTP_USER` | provider username | Auth |
| `SMTP_PASS` | provider password/API key | Auth |
| `MAIL_FROM` | verified from-address | Avoid spam folder |

Without SMTP, the API uses **FormSubmit.co** automatically (full lead details in the email body). Confirm the first FormSubmit activation email in your inbox.

## Website → Render wiring

In `config.js` on the **Vercel/site** deploy:

```js
window.FG_API_BASE = "https://YOUR-SERVICE.onrender.com";
```

Then forms try Render first; if Render is cold/down, Vercel `/api/submit` + email still catch the lead.

## Forms will not fail for visitors

- API returns success even if email provider blips (lead is still saved in SQLite).
- If SQLite write fails, API still emails the lead and returns success.
- Frontend always shows “Thank you” (never a red backend error).

## Persist leads across Render redeploys

Free Render disks are ephemeral. For durable storage, add a **persistent disk** and set:

| Key | Value |
|-----|--------|
| `DATA_DIR` | `/var/data` |

Mount the disk at `/var/data`.

## Egress allowlist (if a firewall needs it)

```text
74.220.48.0/24
74.220.56.0/24
```

## Owner portal password

Use the same `ADMIN_TOKEN` value shown in Render when unlocking `/backend.html`.
