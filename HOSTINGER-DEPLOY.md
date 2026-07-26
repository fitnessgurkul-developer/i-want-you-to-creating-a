# Hostinger deploy — fitnessgurukul.app (urgent)

## Why the site still looked the same

1. `https://fitnessgurukul.app` was returning Hostinger **503** (files not being served yet).
2. `https://fitnessgurukul.co.in` is still the **old Nowfloats** website — not this repo.

Use **https://fitnessgurukul.app** after upload. Redirect `.co.in` in Hostinger DNS / domain aliases when ready.

## Upload (File Manager) — do this now

1. Download `fitness-gurukul-hostinger-public_html.zip` from the agent artifacts (or build below).
2. Hostinger hPanel → **Files → File Manager → `public_html`**
3. **Delete old contents** of `public_html` (or move them to a backup folder).
4. Upload the zip → **Extract** so these sit directly in `public_html`:
   - `index.html`, `index.php`, `.htaccess`
   - `styles.css`, `app.js`, `config.js`
   - `assets/`, `api/`, `coaches/`, all `*.html`
5. Set permissions on `api/data` to **755** (writable).
6. Purge Hostinger / browser cache.
7. Verify:
   - `https://fitnessgurukul.app/` shows Fitness Gurukul (view source for `data-fg-deploy="2026-07-26-urgent"`)
   - `https://fitnessgurukul.app/styles.css` → 200
   - `https://fitnessgurukul.app/api/health.php` → `{"ok":true,...}`
   - `https://fitnessgurukul.app/config.js` contains `FG_API_BASE = ""`
   - `https://fitnessgurukul.app/backend.html` unlocks with password in `api/config.php`

## Build the zip yourself

```bash
node scripts/prepare-netlify-dist.js
cd dist && zip -r ../fitness-gurukul-hostinger-public_html.zip .
```

## Git deployment (optional)

If hPanel → Git is connected to this repo, deploy branch **`main`**, publish directory = repo root (or `dist` after build). Then clear cache.

## Netlify note

If Netlify fails at **Install dependencies**, ensure latest `main` is deployed (root `package.json` removed so install is a no-op).
