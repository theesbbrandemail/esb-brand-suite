# Cleanup, Firebase sign-in, and new internal AI tools

## 1. Remove pages and features
Delete these pages and every menu link, button, and shortcut pointing to them:
- Demo Tour (floating button + walkthrough, and Demo Mode toggle tied to it)
- Skin AI (`/skin-analysis`)
- WhatsApp concierge (`/whatsapp`)
- Mobile (`/mobile`)
- Global Skin Tech brand page
- Client AI Suite (`/ai/customer`)
- "AI Suite" tab: the CEO KPIs (revenue, profit, ratings, branch cards, booking stats) move to a new **CEO Dashboard** page (`/ceo`); `/suite` redirects there so old links keep working.

Links elsewhere (notifications bell, manager suggestions, home cards, sitemap) that pointed to removed pages get retargeted to the closest remaining page. The background WhatsApp follow-up sender stays (it's internal plumbing), only the chat page goes.

## 2. Delete the Lagos branch
Permanently remove the Lagos branch and all its bookings, ratings, follow-ups, stock and posts. Branch pickers will show Abuja and Port Harcourt only.

## 3. Link a real Firebase project for Google sign-in
- You'll paste your Firebase web app settings (API key, auth domain, project ID, app ID) — these are public values.
- "Continue with Google" will use Firebase. After Firebase confirms the person, the server checks the Firebase token and signs them into the app's own account with the same email, so roles, bookings, stock and CEO access keep working exactly as now.
- If Firebase isn't set up, the current Google sign-in stays as the fallback.
- You must add the app's published and preview addresses to Firebase's "Authorized domains".

## 4. New internal AI tools (staff only, new "AI Tools" menu group)
- **Treatment Plan & Aftercare** (`/tools/treatment`): pick a booking, AI writes a treatment plan + aftercare instructions; save to the booking notes, copy, or print.
- **Shift & Task Planner** (`/tools/shifts`): AI builds a staff rota and daily task list per branch from upcoming bookings; one click turns tasks into manager reminders.
- **Daily Ops Briefing** (`/tools/briefing`): AI morning summary per branch — today's bookings, no-show risk, low stock, revenue trend, top 3 actions. Also shown as a card on the CEO Dashboard.
- **Smart Restock Forecaster** (`/tools/restock`): estimates days until each item runs out from booking volume and stock levels; AI drafts a purchase order you can copy or mark as restocked.

## 5. Fix errors
- Fix the empty-data chart warning on Manager/CEO charts.
- Re-run checks on every page after removals; fix any broken links, type errors or console errors found.

## Technical details
- Delete route files: skin-analysis, whatsapp, mobile, brands.global-tech, ai.customer; delete DemoTour.tsx, skin.functions.ts, whatsapp.functions.ts; remove demo-mode `isStaff` override in auth.tsx. Rename suite.tsx -> ceo.tsx, add suite.tsx redirect. Update Shell.tsx tabs/menus, NotificationsBell, manager suggestion link types, sitemap.xml, MCP `whatsapp_deeplink` tool kept (link builder only).
- Lagos deletion via migration: delete dependent rows (feedback -> follow_ups -> appointments, inventory, content_posts) then the branch row.
- Firebase: `VITE_FIREBASE_*` in .env; remove the `accessToken` override from the Supabase client wiring (revert to normal sessions). New server fn `firebaseExchange` verifies the Firebase ID token against Google's public keys (jose, Worker-safe), then with the admin client finds/creates the user by email and returns a one-time magic-link token; the browser calls `verifyOtp` to get a normal session. New users still pass through `handle_new_user` (staff allowlist roles).
- AI tools: server functions under src/lib/tools.functions.ts with `requireSupabaseAuth` + staff/admin role check, Lovable AI Gateway `openai/gpt-6-astra` via Responses API, streamed, strict JSON schemas; gateway 402/429 errors shown in UI. Existing CEO assistant left on its current setup.
- Each new page gets its own head() metadata.
