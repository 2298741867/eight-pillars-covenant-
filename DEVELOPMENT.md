# 🖥️ Development Guide

## Quick Start

1. Copy `.env.example` to `.env` if you want custom settings.
2. Start the hot-reload server:

   ```bash
   make serve
   ```

3. Open `http://localhost:8000/`.
4. To test on your phone, connect your phone to the same network and open `http://YOUR_COMPUTER_IP:8000/`.

## Commands

- `make serve` — start the Node.js development server with hot reload
- `make build` — create a production-ready `dist/` folder
- `make test` — validate links, manifests, and deployment files
- `make deploy` — build the deployable output and print the GitHub Pages trigger reminder

## Docker Compose

```bash
docker-compose up
```

This starts the same hot-reload server on port `8000`.

## Health Checks

- Browser status page: `http://localhost:8000/status.html`
- JSON health endpoint: `http://localhost:8000/healthz`

## Notes

- The local server injects a small reload script into HTML pages so CSS/JS/content changes refresh automatically.
- `site-config.js` is served dynamically in local development so analytics and URL settings can follow `.env`.
- Shalom ❤️
