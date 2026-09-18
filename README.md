# Ofertas de Camping — Next.js + Supabase

Live architecture (**Path A**):

- **Frontend + app APIs** → [Vercel](https://vercel.com) (Next.js)
- **Database / data backend** → [Supabase](https://supabase.com) (PostgreSQL)
- **Legacy Express** (`/backend`) → **not used** in production and **not deployed** to Vercel

```text
Browser → Vercel (Next.js UI + /api routes) → Supabase (Postgres)
```

You do **not** need a separate Node/Express server.

## Local development

1. Copy env file:

```bash
cp .env.local.example .env.local
```

2. Fill Supabase + admin values (see [supabase/README.md](./supabase/README.md)).

3. Run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Supabase (one-time)

If tables are not created yet:

1. Supabase → **SQL Editor**
2. Run [`supabase/schema.sql`](./supabase/schema.sql) (**Run without RLS**)
3. Run [`supabase/migration-auth-events.sql`](./supabase/migration-auth-events.sql)

If you already ran these successfully, **do not run again**.

## Deploy on Vercel (step by step)

### 1. Push code to GitHub

Repo example: `bushraakmal464143-eng/familia-bushra` on branch `main`.

### 2. Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Import **familia-bushra**
4. Framework: **Next.js** (auto)
5. Root directory: `.` (default)
6. Leave build settings as defaults (`npm install` / `npm run build`)

`vercel.json` and `.vercelignore` ensure only the Next.js app is built; the Express `/backend` folder is excluded.

### 3. Environment variables

In **Vercel → Project → Settings → Environment Variables**, add for **Production**:

| Name | Where to get it |
|------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → `service_role` (secret!) |
| `ADMIN_EMAIL` | Your admin login email |
| `ADMIN_PASSWORD` | Your admin password |
| `ADMIN_SECRET` | Long random string for signing cookies |

Optional:

| Name | Purpose |
|------|---------|
| `NEXT_PUBLIC_SITE_URL` | Your live URL, e.g. `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google login |
| `SMTP_*` | Contact form email |

Use the same values as local `.env.local` (never commit `.env.local`).

### 4. Deploy

Click **Deploy**. When the build finishes, open the `.vercel.app` URL.

### 5. Smoke test

- Home: `/`
- Admin: `/cuenta/login?from=/admin`
- Camping panel: `/camping/login`
- Customer: `/cuenta/login`

Demo camping: `vidra@demo.campolibres` / `camping123` (after seed).

### 6. Later updates

Push to `main` on GitHub → Vercel auto-redeploys (if the project stays connected).

## What runs where

| Piece | Host |
|-------|------|
| Pages (UI) | Vercel |
| Next.js `/api/*` (login, bookings, admin actions) | Vercel (serverless) |
| Tables / data | Supabase |
| Express `/backend` | Not deployed |

## Scripts

```bash
npm run dev          # Next.js only (production path)
npm run build        # Production build
npm run start        # Run production build locally
npm run dev:legacy-api  # Optional old Express API — not for Vercel
```
