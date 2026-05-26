# Home Expenses

Monorepo for a cross-platform home expense tracker.

- **`apps/mobile`** — Expo (React Native + Web). Runs on Android, iOS, and the web from one codebase.
- **`apps/api`** — Cloudflare Worker (Hono) with D1 (SQLite) for data and R2 for receipt images.
- **`packages/shared`** — Shared TypeScript types and helpers.

Auth: [Better Auth](https://better-auth.com) with email + password and Google OAuth, stored in D1.

## Prerequisites

- Node 20+
- A Cloudflare account (`npx wrangler login`)
- A Google OAuth client (Web application) from https://console.cloud.google.com/apis/credentials

## First-time setup

```bash
npm install

# 1) Create the D1 database
cd apps/api
npx wrangler d1 create expense_db
# Copy the printed database_id into wrangler.toml

# 2) Create the R2 bucket
npx wrangler r2 bucket create home-expense-receipts

# 3) Apply migrations locally and remotely
npx wrangler d1 migrations apply expense_db --local
npx wrangler d1 migrations apply expense_db --remote

# 4) Set secrets (use .dev.vars for local; wrangler secret put for prod)
cp .dev.vars.example .dev.vars
# Edit .dev.vars and fill in:
#   BETTER_AUTH_SECRET=$(openssl rand -base64 32)
#   GOOGLE_CLIENT_ID=...
#   GOOGLE_CLIENT_SECRET=...

# For production:
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

In the Google OAuth console, add these authorized redirect URIs:

- `http://localhost:8787/api/auth/callback/google` (local dev)
- `https://<your-worker>.workers.dev/api/auth/callback/google` (prod)

## Run locally

In two terminals:

```bash
# Terminal 1 — API
npm run dev:api      # http://localhost:8787

# Terminal 2 — Mobile/Web
cp apps/mobile/.env.example apps/mobile/.env
npm run dev:web      # press w for web, a for Android, i for iOS
```

## Deploy

```bash
# API → Cloudflare Workers
cd apps/api && npx wrangler deploy

# Web → Cloudflare Pages
cd apps/mobile && npx expo export -p web
npx wrangler pages deploy dist

# Android → Google Play (via EAS Build)
cd apps/mobile && npx eas build -p android
```

After deploying the API, update `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=https://<your-worker>.workers.dev
```

And the Worker's `WEB_ORIGIN` in `wrangler.toml` to the web app's deployed URL.

## Project structure

```
apps/
  api/                 Cloudflare Worker (Hono + Better Auth + D1 + R2)
    migrations/        D1 SQL migrations
    src/
      auth.ts          Better Auth config
      index.ts         Hono routes
    wrangler.toml
  mobile/              Expo app (Android / iOS / Web)
    app/               expo-router screens
      (auth)/sign-in.tsx
      (app)/expenses.tsx
      (app)/add.tsx
    lib/
      auth-client.ts   Better Auth client
      api.ts           Typed API client
packages/
  shared/              Shared types
```
