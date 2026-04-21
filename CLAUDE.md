# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server.
- `npm run dev:clean` — clear `.next` cache and start dev (use when chunks get stale).
- `npm run build` / `npm run start` — production build and serve.
- `npm run lint` — Next.js ESLint.

No test runner is configured.

### Required env vars

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public Supabase (SSR + middleware + anon portal).
- `SUPABASE_SERVICE_ROLE_KEY` — server-only. Without it, reserved/unavailable properties may not appear in portals and `client_name` fallback cannot resolve. Use `hasServiceRoleConfig()` before creating the service client.

## Architecture

Next.js 14 App Router + Supabase. Two surfaces share one Supabase project:

1. **Admin panel** (`/admin/**`) — authenticated CMS for properties, clients, and client links. Gated by [middleware.ts](middleware.ts) → [lib/supabase/middleware.ts](lib/supabase/middleware.ts), which refreshes the SSR session on every request and redirects `/admin/*` to `/admin/login` when logged out (and away from login when logged in). Server Actions live in [app/admin/clients/actions.ts](app/admin/clients/actions.ts) and [app/admin/properties/actions.ts](app/admin/properties/actions.ts). Route group `(panel)` holds the authenticated layout.
2. **Client portal** (`/p/[code]`) — unauthenticated, access-code gated view of properties a client is entitled to. Entry form at [app/p/AccessCodeForm.tsx](app/p/AccessCodeForm.tsx); data fetched via [lib/portal.ts](lib/portal.ts).

### Supabase client factories — pick the right one

Located in [lib/supabase/](lib/supabase/). Each has a single purpose; do not cross-use:

- `client.ts` — browser client (RLS as the signed-in user).
- `server.ts` — SSR client for admin Server Components/Actions (reads cookies).
- `middleware.ts` — edge middleware session refresher (see above).
- `portal-anon.ts` — anon client used only to call the portal RPC from the portal route.
- `service-role.ts` — privileged, server-only. Exposes `hasServiceRoleConfig()`; bypasses RLS.
- `admin-data.ts` — admin-panel data helpers layered on the SSR client.

### Portal access flow ([lib/portal.ts](lib/portal.ts))

1. `fetchPortalAccess(code)` calls Postgres RPC `get_portal_by_code(p_code)` via the anon client. The RPC returns a JSONB `{ status, properties, client_name? }` where `status ∈ {ok, not_found, inactive, expired}`.
2. On `ok`, results are merged with a service-role query for globally `reserved` / `unavailable` properties (RLS via the anon RPC may hide these). Merge + sort by status rank (available → reserved → unavailable), then `created_at` desc. This mirrors the RPC's intended ordering.
3. `client_name` comes from the RPC payload, or falls back to a service-role lookup in `client_links` joined to `clients`.
4. `devDebug` strings are only populated when `NODE_ENV=development` and surface SQL hints for RPC/permission failures — keep them dev-only.

Note the comment in `PORTAL_RPC`: the live DB uses `get_portal_by_code`, while the in-repo migration once named it `portal_access`. When editing migrations, keep the RPC name consistent with what `lib/portal.ts` calls.

### Database

Migrations under [supabase/migrations/](supabase/migrations/). Core tables: `properties`, `clients`, `client_links` (access codes with `is_active` + `expires_at`). Domain types exported from [lib/types.ts](lib/types.ts) — prefer these over redefining row shapes.

### Types and money fields

`total_investment`, `purchase_price`, `yield_percent` are typed `string | number | null` because Supabase may return `numeric` as string. Handle both; do not coerce blindly at the boundary. Formatting helpers live in [lib/utils/format.ts](lib/utils/format.ts).

### Styling

Tailwind (see [tailwind.config.ts](tailwind.config.ts)). Brand visuals follow the Fórmula Hogar identity — use the `formula-hogar-brand` skill for any new UI.
