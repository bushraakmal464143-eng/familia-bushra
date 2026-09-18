# Legacy Express API (not used in production)

This folder is **reference only**. Production runs on:

- **Vercel** → Next.js (UI + `/api` routes)
- **Supabase** → database

Vercel does **not** deploy this folder. `package.json` was renamed to `package.json.legacy` so Vercel does not detect Express as a second service.

To run locally (optional):

```bash
cd backend
mv package.json.legacy package.json
npm install
npm run dev
```
