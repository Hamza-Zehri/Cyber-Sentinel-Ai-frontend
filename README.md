# Cyber Sentinel AI — Frontend Dashboard

Dark-themed SOC (Security Operations Center) dashboard built with **React 19 + Vite + TypeScript + Tailwind CSS v4**.

## Features

- **Authentication** — Login, Register, Forgot/Reset Password, Email Verification with JWT auto-refresh
- **Dashboard** — Live system health, capture status, alert counts, recent alerts feed
- **Network Monitor** — Start/stop packet capture, live auto-refreshing packet table, protocol/DNS filtering, expandable rows with TCP flag explanations and MAC vendor lookup, Reset button
- **Alerts** — Severity/status filtering, resolve action, pagination
- **AI Security Tools** — Phishing URL checker, Malware file scanner with quarantine, Password strength analyzer
- **Admin Panel** — User management (toggle active), role/permission viewer, audit log browser with module filtering
- **Reports** — Generate CSV reports with type/period selection, download with JWT auth
- **Settings** — CRUD system key-value settings with inline editing and category filtering
- **Notifications** — Unread count badge, dropdown with mark-all-read
- **Interface Status** — Top bar shows Wi-Fi and USB dongle status (green/red dots), auto-refreshes every 5s
- **Protocol Guide** — Expandable reference for TCP/UDP/ICMP/ARP/DNS with security tips

## Quick Start

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173** — proxies `/api` to backend at `http://localhost:8000`.

## Build for Production

```bash
npm run build
# Output in dist/
```

## Environment

The Vite dev server proxies `/api` requests to the backend. For production, set `VITE_API_URL` or rebuild with the correct API origin in `vite.config.ts`.

## Tech Stack

- React 19, React Router v7
- TanStack React Query v5
- Tailwind CSS v4 (custom SOC theme)
- Lucide React (icons)
- TypeScript 6

## Backend API

The REST API is at [Cyber-Sentinel-Ai-backend](https://github.com/Hamza-Zehri/Cyber-Sentinel-Ai-backend).

## License

MIT
