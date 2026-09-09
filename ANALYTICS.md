# 📊 Analytics Guide

## Privacy-First Defaults

- Analytics are **disabled by default**
- Do-Not-Track is respected automatically
- No cookies are set by this repository code
- Supported providers: **Plausible** and **Fathom**

## Events Tracked

- Page view
- Pillar card expansion
- Document link clicks
- Scroll depth milestones
- Reading-time estimates from document previews
- Time on page
- Exit intent when a visitor leaves early

## Setup

1. Copy `.env.example` to `.env`
2. Set:

   ```bash
   ANALYTICS_ENABLED=true
   ANALYTICS_PROVIDER=plausible
   ANALYTICS_DOMAIN=your-domain.example
   ANALYTICS_API_HOST=
   ```

3. For Fathom, set:

   ```bash
   ANALYTICS_PROVIDER=fathom
   ANALYTICS_SITE_ID=YOUR_SITE_ID
   ```

4. Run `make build` for production output or `make serve` for local verification.

## Dashboard Notes

- `analytics.json` contains placeholder credentials and the event map.
- Plausible users can keep the default script URL or point `ANALYTICS_SCRIPT_SRC` to a self-hosted script.
- Fathom users should add the site ID from their dashboard and optionally map event codes in `site-config.js` / generated output.

## API Keys

This repository does **not** commit real credentials. Keep any live keys or host values in `.env` or GitHub repository secrets only.

## No-Reload Behavior

The analytics bootstrap runs independently from page rendering and uses `pagehide` / `visibilitychange` so timing events still fire without requiring full page reloads.

Shalom ❤️
