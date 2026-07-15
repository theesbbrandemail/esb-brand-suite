# Deployment (Vercel + Supabase)

This repository is configured to run on Vercel (static/Vite build) and uses Supabase for authentication and database.

Important (security)
- A previous commit contained Supabase keys in `.env`. Those values have been removed from the repository — rotate any keys that were exposed immediately.
- Do NOT commit `.env` or other secret files. Use Vercel environment variables or your CI secrets store.

Required environment variables (set these in Vercel -> Project -> Settings -> Environment Variables):

- VITE_SUPABASE_URL (client) — e.g. https://<project-ref>.supabase.co
- VITE_SUPABASE_PUBLISHABLE_KEY (client anon key)
- SUPABASE_URL (server)
- SUPABASE_SERVICE_ROLE_KEY (server-only, secret)
- DATABASE_URL (if you run server-side DB operations)

Local development
1. Copy .env.example to .env.local and fill in values for local development (do not commit):

   cp .env.example .env.local

2. Start the dev server:

   npm install
   npm run dev

Vercel build
- Build command: npm run build
- Output directory: dist

Notes & recommendations
- Keep a single lockfile (package-lock.json or bun.lock). If you intend to use Bun, prefer bun.lock and Bun-based CI. Otherwise use npm (package-lock.json).
- Use the Supabase service role key only on the server. The client should use the publishable anonymous key.
- To analyze client bundles: generate a build and run a bundle analyzer (Vite plugin or rollup analyzer). Look for large entries from `routeTree.gen.ts` and heavy UI libraries (recharts, framer-motion, etc.).

Secret rotation (if your keys were exposed)
1. In the Supabase dashboard, go to Project Settings -> API, rotate the ANON and SERVICE_ROLE keys.
2. Update Vercel environment variables with the new values.
3. Redeploy your Vercel project.

