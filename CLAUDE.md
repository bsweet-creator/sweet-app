# sweet-app

React + Vite web app hosted on Cloudflare Pages, backed by Supabase.

## Stack
- **Frontend**: React + Vite (`src/`)
- **Database/Auth**: Supabase — client at `src/lib/supabase.js`
- **Hosting**: Cloudflare Pages — auto-deploys on push to `main`
- **Production URL**: https://sweet.sweetbuilds.com
- **Repo**: https://github.com/bsweet-creator/sweet-app

## Development
```bash
npm run dev      # start local dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

Local env vars go in `.env` (gitignored). Copy `.env.example` to start.

## Deploying changes
Deployment is automatic — just push to GitHub:
```bash
git add <files>
git commit -m "your message"
git push
```
Cloudflare Pages detects the push and redeploys within ~1 minute. No manual deploy step needed.

## Database migrations (Supabase)
When schema changes are needed, Claude will create a `.sql` file in `supabase/migrations/`.

To run a migration:
1. Open the Supabase dashboard → your project → **SQL Editor**
2. Paste the contents of the migration file
3. Click **Run**

Migration files are named `YYYYMMDD_description.sql` and kept for history.

## Environment variables
| Variable | Where to set |
|---|---|
| `VITE_SUPABASE_URL` | `.env` locally + Cloudflare Pages dashboard |
| `VITE_SUPABASE_ANON_KEY` | `.env` locally + Cloudflare Pages dashboard |

## Project structure
```
src/
  lib/
    supabase.js     ← Supabase client (import { supabase } from '@/lib/supabase')
  App.jsx
  main.jsx
supabase/
  migrations/       ← SQL migration files
```
