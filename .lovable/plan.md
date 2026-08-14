## Goal

Bring your old GitHub project (`architechtos/architechtos.github.io`) into this Lovable project: a stray-animal welfare community app with auth, user profiles/roles, a forum, animal registries, reports, news, donations, and image uploads.

## Important context (please read)

Your old app and this project use **different stacks**:

| | Old repo | This project |
|---|---|---|
| Routing | `react-router-dom` + `src/pages/` | TanStack Start file routes in `src/routes/` |
| App shell | `BrowserRouter` in `App.tsx` | `__root.tsx` + file-based routes |
| Auth | custom `AuthContext` | managed `_authenticated` gate + Supabase integration |
| Backend | external Supabase (now inactive) | Lovable Cloud (fresh) |

So this is a **port**, not a copy. The good news: your components, styling, business logic, and SQL migrations are reusable. The work is rewiring routing + auth and recreating the backend. The old database **data** is gone (backend went inactive) — only the **schema** comes back from your migration files. Storage files (uploaded images) are also gone; the buckets get recreated empty.

Because this is large (14 pages, ~60 components, 54 migrations, 4 storage buckets), I recommend doing it in phases and verifying each before moving on.

## Plan

### Phase 1 — Backend foundation (Lovable Cloud)
- Enable Lovable Cloud.
- Consolidate the repo's 54 migrations into clean migrations applied here: tables, enums, `user_roles` + `has_role` pattern, RLS policies, triggers (e.g. auto-create profile on signup), and functions.
- Recreate the 4 public storage buckets (`reports`, `strays`, `thread-images`, `activity-images`) with their size/mime limits and storage RLS policies.
- Configure auth: email/password + Google sign-in (your old app had phone verification — I'll confirm how you want to handle that, see open question).

### Phase 2 — Shared foundation
- Copy reusable, framework-agnostic code: `src/components/ui/*`, `src/lib/utils`, `src/utils/*` (validation/sanitization), `src/hooks/*`, design tokens from `index.css`/`tailwind.config.ts`, and `public/` assets (logo, uploads).
- Wire the Supabase browser client + types via the project's existing integration.

### Phase 3 — Routing + auth rewire
- Convert `AuthContext` to the project's managed auth pattern.
- Recreate each old route as a TanStack file route under `src/routes/`:
  - Public: `/`, `/login`, `/register`, `/community-info`, `/news`, `/news/$articleId`, `/forum`, `/forum/thread/$threadId`.
  - Authenticated (under `_authenticated/`): `/profile`, `/report`, `/stray-registration`, `/stray-activities`, `/stray-adoptions`, `/chat`.
- Recreate the shared `Layout` (Navbar/Footer) as the root/layout route.
- Replace `react-router-dom` APIs (`Link`, `useNavigate`, `useParams`, `<Outlet/>`) with TanStack equivalents.

### Phase 4 — Feature pages & components
- Bring over feature components (forum, stray/report/profile/news/donations) and convert any Supabase data fetching to the project's loader/`useQuery` + server-function patterns where needed.
- Per-route `head()` metadata (title/description) for SEO on public pages.

### Phase 5 — Verify
- Build passes, key flows work in preview: sign up/login, view forum, create a thread, register a stray, upload an image, view profile.

## Technical notes
- Maps use `leaflet` — compatible, will be added.
- `@capacitor/*` (iOS wrapper) from the old repo will be **dropped** unless you specifically need a native mobile build — this project targets web.
- `toast.tsx`/`toaster.tsx` (Radix toast) from the old repo coexist with this project's `sonner`; I'll standardize on one.
- 54 incremental migrations will be squashed into a coherent schema rather than replayed one-by-one.

## Open questions before/while building
1. **Phone verification**: your old app had SMS phone verification (`PhoneVerificationForm`, Twilio-style). Lovable Cloud supports phone auth, but it needs SMS provider setup. Keep it, or drop phone verification and go email + Google only?
2. **Google Maps vs Leaflet**: some components reference `GoogleMapPreview` and Google Maps; others use Leaflet. Standardize on Leaflet (no API key) — OK?
3. **Scope confirmation**: proceed with the full app, or start with a core slice first (auth + forum + stray registry) and add the rest after?
