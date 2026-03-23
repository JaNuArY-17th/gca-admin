# GCA Admin Dashboard

A lightweight React + Vite dashboard for monitoring vote statistics, nominee performance, and voter participation.

## Quick start

1. Install dependencies inside the `gca-admin` folder:
   ```bash
   cd gca-admin
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the UI at the printed local address (default `http://localhost:5173`).
4. Use the login form in the top-right panel to authenticate. Enter the admin username/password configured in `gca-be/.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)—the app sends them to `POST /api/auth/login`, saves the returned access token in `localStorage`, and attaches it as `Authorization: Bearer <token>` to the protected endpoints.
5. Use the date range selector to filter statistics, then observe the dynamically updating stats cards, nominee list, and voted/not-voted tables.

## Environment

- The app calls the backend relative to `/api` by default. If the backend runs on a different host, set the URL before running the dev server:
  ```bash
  VITE_API_BASE_URL=https://your-domain.com/api npm run dev
  ```

## Backend APIs in use

| Purpose | Endpoint | Notes |
| --- | --- | --- |
| Vote stats | `GET /api/admin/votes/stats` | Query params: `startDate`, `endDate`. Requires `Authorization` header (Bearer token). Returns total records, inferred voter count, and the applied date range.
| Voter lists (voted / not voted) | `GET /api/admin/voters` | Query params: `hasVoted` (`true`/`false`), `page`, `pageSize`, `search`, `startDate`, `endDate`. Returns paginated voters matching the filters plus the number of votes in range.
| Nominee metadata | `GET /api/categories/:voteId/nominees` | Used to render nominee names, descriptions, and images.
| Nominee vote counts | `GET /api/votes/:voteId/results` | Query params: `startDate`, `endDate`. Provides vote counts per nominee for the selected category.

> Token note: use the backend `POST /api/auth/login` endpoint (with username/password configured in the BE `.env`) to obtain the `accessToken`. Paste that token into the dashboard to unlock the protected admin endpoints.

## Features

- Date range picker automatically refreshes all sections.
- Stats cards show raw vote record counts and the derived number of people who have voted (records ÷ 5).
- Nominee cards highlight the top performers with a progress bar and optional images.
- Search, pagination, and has-voted filtering for voter tables, all scoped to the chosen date window.
- Access token persistence so the dashboard can stay logged in between page reloads.
# gca-admin
