# Supabase setup

This project uses **Supabase PostgreSQL** as the database. You no longer need MongoDB or the Express backend for normal operation.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Open **SQL Editor** → **New query**
3. Paste and run the contents of [`supabase/schema.sql`](./schema.sql)

## 2. Get API keys

In **Project Settings → API**, copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 3. Configure `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ADMIN_EMAIL=adminofertas123@gmail.com
ADMIN_PASSWORD="Admin@$#123"
ADMIN_SECRET=una-cadena-larga-y-aleatoria
```

## 4. Run the app

```bash
npm install
npm run dev
```

Open http://localhost:3000

On first run, demo campings and offers are **auto-seeded** into Supabase when tables are empty.

## 5. Deploy on Vercel

Add the same environment variables in **Vercel → Settings → Environment Variables**.

You only need to deploy the Next.js app — no separate backend server.

## Fallback without Supabase

If Supabase env vars are missing, the app falls back to local JSON files in `data/` (development only).

## Auth signup / login history

After the base schema is applied, also run [`migration-auth-events.sql`](./migration-auth-events.sql) once (or use the updated `schema.sql` on a fresh project).

That adds:

- `customers.last_login_at` — last successful access
- `auth_events` — each signup/login (`email` or `google`)

View in admin: **Accesos** (`/admin/accesos`) and **Clientes**.

## Legacy Express backend

The `/backend` folder is kept for reference but is **not required** when Supabase is configured. Run it only with `npm run dev:legacy-api` if needed.
