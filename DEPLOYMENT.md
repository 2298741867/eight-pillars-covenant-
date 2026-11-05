# 🌐 Deployment Guide

## Quick Start

| Method | Fast path |
| --- | --- |
| GitHub Preview | Open `index.html` in the GitHub repository preview |
| GitHub Pages | Push to `main` and let `.github/workflows/github-pages.yml` publish to `gh-pages` |
| Local Development | Run `make serve` or `docker-compose up` |
| Analytics | Configure `.env`, then rebuild |

## Delivery Methods

### 1. GitHub Preview

- Preview URL: `https://github.com/2298741867/eight-pillars-covenant-/blob/main/index.html`
- Relative document links stay repository-safe.
- The front-end preview loader fetches markdown from `raw.githubusercontent.com` when it detects a GitHub preview context.

### 2. GitHub Pages

- Live URL: `https://2298741867.github.io/eight-pillars-covenant-/`
- Deployment workflow: `.github/workflows/github-pages.yml`
- Output branch: `gh-pages`
- Output includes:
  - `index.html`
  - `status.html`
  - `styles.css`
  - `script.js`
  - `analytics.js`
  - `site-config.js`
  - `robots.txt`
  - `sitemap.xml`
  - `_headers`
  - `healthz.json`
  - `deployment-certificate.json`

### 3. Local Development

- `make serve`
- `docker-compose up`
- Health endpoint: `http://localhost:8000/healthz`

### 4. Analytics

- Optional and disabled by default
- Configured from `.env`
- Documented in [ANALYTICS.md](ANALYTICS.md)

## Before / After

| Before | After |
| --- | --- |
| Static landing page only | Preview-safe site plus GitHub Pages deployment workflow |
| No deployment metadata | Version manifest, health JSON, status page, certificate |
| No local tooling | Make targets, Docker Compose, and hot reload |
| No analytics hook | Plausible/Fathom-ready privacy-first module |

## Security Notes

- HTTPS is provided by GitHub Pages at the live URL.
- A strict CSP is embedded in the HTML files.
- `_headers` is generated for custom-domain/CDN deployments that can honor `X-Frame-Options`, HSTS, and related headers.
- GitHub Pages itself does not let this repository directly force every response header, so the workflow prepares the files needed for hosts that do.

## Custom Domain Readiness

Set `CUSTOM_DOMAIN=your.domain.example` before `make build`. The build writes a `CNAME` file into `dist/`.

## Monitoring

- `status.html`
- `status.json`
- `healthz.json`
- `deployment-certificate.json`

## Feedback

Use the deployment feedback template:

`https://github.com/2298741867/eight-pillars-covenant-/issues/new?template=deployment-feedback.md`

Shalom ❤️
