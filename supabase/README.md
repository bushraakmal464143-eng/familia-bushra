# Supabase setup

This project uses **Supabase PostgreSQL** as the **data backend**.  
The website and app APIs run on **Vercel (Next.js)**. You do **not** need MongoDB or the Express `/backend` folder for production.

## Architecture (Path A)

- **Vercel** → Next.js UI + `/api` routes  
- **Supabase** → all tables / data  
- **Express `/backend`** → legacy only, ignored by Vercel (see `.vercelignore`)

## 1. Create a Supabase project (once)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Open **SQL Editor** → **New query**
3. Paste and run the contents of [`supabase/schema.sql`](./schema.sql) (**Run without RLS**)
4. Then run [`migration-auth-events.sql`](./migration-auth-events.sql) once

If tables already exist in Table Editor, **skip this step**.

## 2. Get API keys

In **Project Settings → API**, copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 3. Configure `.env.local` (local) / Vercel env (production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ADMIN_EMAIL=adminofertas123@gmail.com
ADMIN_PASSWORD="Admin@$#123"
ADMIN_SECRET=una-cadena-larga-y-aleatoria

# Production (Vercel):
# NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

## 4. Run the app locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

On first run, demo campings and offers are **auto-seeded** into Supabase when tables are empty.

## 5. Deploy on Vercel

See the root [README.md](../README.md) for full steps.

Add the **same environment variables** in **Vercel → Settings → Environment Variables**, then deploy.

You only deploy the Next.js app — **no separate backend server**.

## Auth signup / login history

After the base schema is applied, also run [`migration-auth-events.sql`](./migration-auth-events.sql) once (or use the updated `schema.sql` on a fresh project).

That adds:

- `customers.last_login_at` — last successful access
- `auth_events` — each signup/login (`email` or `google`)

View in admin: **Accesos** (`/admin/accesos`) and **Clientes**.

## Fallback without Supabase

If Supabase env vars are missing, the app falls back to local JSON files in `data/` (**development only** — not for Vercel production).

## Legacy Express backend

The `/backend` folder is kept for reference but is **not required** and is **excluded from Vercel** via `.vercelignore`.  
Run it only locally with `npm run dev:legacy-api` if needed.
