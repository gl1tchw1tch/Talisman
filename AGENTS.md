# Talisman Engine

## Overview
Single-file React component (`talisman_engine_v8.jsx`) — an astrological/talisman engine UI. No backend, no database, no external services. Pure client-side.

## Setup
- The repo had no build tooling; a Vite + React wrapper was added (`package.json`, `vite.config.js`, `index.html`, `src/main.jsx`).
- Run via `docker compose -f docker-compose.base44.yml up -d`.
- Dev server: Vite on port 3000, bind 0.0.0.0, `allowedHosts: true`.
- No secrets required.

## Structure
- `talisman_engine_v8.jsx` — the entire app (default export `TalismanEngine`).
- `src/main.jsx` — mounts `TalismanEngine` into `#root`.
- `index.html` — Vite entry point.

## Verify
- `curl http://localhost:3000/` returns the HTML shell.
- `curl http://localhost:3000/src/main.jsx` returns transformed source (confirms live dev mode, not prebuilt).
