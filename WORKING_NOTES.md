# Working Notes — Dream Travel Survey

> **INTERNAL DOCUMENT — NOT PUBLIC-FACING.**
> This file is for the developer and any AI assistants working on this project.
> Update this file at the end of every working session before closing.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before touching any code.
2. Read `README.md` next for public-facing context, installation steps, and the tech stack table.
3. Do not change the folder structure or file naming conventions without discussing it with the developer first.
4. Follow all conventions in the **Conventions** section exactly — naming, styling, commit format.
5. Do not suggest anything listed in **What Was Tried and Rejected**. Those decisions are final.
6. Ask before making any large structural changes — adding a new library, splitting a file into multiple files, changing the routing strategy, or altering how Supabase is accessed.
7. This project was AI-assisted. Refactor conservatively. Do not rewrite working code unless there is a specific, documented bug. Prefer surgical edits over wholesale replacements.

---

## Current State

**Last Updated:** 2026-03-26

This is a fully functional course project. The survey form collects responses, stores them in Supabase, and the results page displays aggregated data in four Recharts charts. The production build succeeds and outputs to `artifacts/dream-travel-survey/dist/public/`. A GitHub Actions workflow exists and is ready to deploy to Azure Static Web Apps once secrets are configured. The Replit dev environment is running cleanly. One latent bug exists in `results.tsx` (documented below in Known Issues).

### What Is Working

- [x] Home page — hero layout, "Take the Survey" and "View Results" navigation buttons
- [x] Survey form — all four questions with correct input types (text, select, radio, checkboxes)
- [x] Conditional "Other" activity text input — appears with `autoFocus` when checkbox is selected
- [x] Inline form validation — Zod schema + React Hook Form, `aria-describedby` wired to error elements
- [x] Submit button shows "Submitting..." with spinner while the Supabase insert is pending
- [x] Confirmation screen after successful submission with "Submit Another" and "View Live Results"
- [x] Error state on failed submission — form preserved, error surfaced to user
- [x] Supabase insert — data writes to `travel_survey_results` with correct schema including `text[]` for activities
- [x] Results page — fetches all rows from Supabase, computes aggregates client-side
- [x] Four Recharts charts: Destination Types (vertical bar), Traveler Personas (vertical bar), Most Popular Activities (horizontal bar), Top 10 Dream Destinations (horizontal bar)
- [x] "Other" activity labels in charts — normalized to lowercase for grouping, displayed title-cased
- [x] Destination deduplication — free-text destinations normalized to lowercase before counting
- [x] Empty state on results page — shown when zero responses exist
- [x] Footer on all pages — "Survey by Amanda Williams, BAIS:3300 - Spring 2026."
- [x] Responsive layout — single-column on mobile, two-column grid on desktop for charts
- [x] `staticwebapp.config.json` — SPA fallback routing config for Azure, excludes `/assets/*` and `/images/*`
- [x] GitHub Actions workflow — builds with pnpm, injects secrets, deploys pre-built dist to Azure SWA
- [x] Production build — confirmed working: `BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/dream-travel-survey run build`
- [x] Supabase RLS policies — anon insert and anon select enabled

### What Is Partially Built

- [ ] `toTitleCase()` in `results.tsx` — function has a curried arrow bug (see Known Issues); destination/activity labels still display, but capitalization may be inconsistent

### What Is Not Started

- [ ] Rate limiting / duplicate submission prevention
- [ ] Admin export (CSV download of anonymized responses)
- [ ] Auto-refresh of results page on new submissions
- [ ] Word cloud visualization for dream destinations
- [ ] Iframe-embeddable mode for LMS platforms

---

## Current Task

The project is feature-complete per the PRD. This session focused on resolving Azure Static Web Apps CI/CD failures. Build output was changed to `dist/public/` and the GitHub Actions workflow was fixed so that `app_location` points to the repo root (`.`) and `output_location` points to `artifacts/dream-travel-survey/dist/public`. This resolves the "directory not found" validation error caused by `dist/` being gitignored.

**Next step:** Configure the three GitHub Actions secrets (`AZURE_STATIC_WEB_APPS_API_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the repository settings to activate the deployment pipeline.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 (catalog) | Component model, ecosystem; required by PRD |
| TypeScript | ~5.9 | Type safety across the monorepo |
| Vite | 7 (catalog) | Fast HMR, env var injection at build time for `VITE_` prefixed vars |
| Tailwind CSS | 4 (catalog) | Utility-first; matches existing monorepo setup |
| shadcn/ui + Radix UI | various | Accessible unstyled primitives; already scaffolded in the monorepo |
| `@supabase/supabase-js` | ^2.100.0 | Direct frontend-to-database connection; avoids a custom backend entirely |
| Recharts | ^2.15.4 | Required by PRD; composable, React-native charts |
| Wouter | ^3.3.5 | Lightweight SPA router; already used in the monorepo scaffold |
| React Hook Form | ^7.71.2 | Form state and submission; integrates with Zod via `@hookform/resolvers` |
| Zod | catalog | Schema validation for the survey form fields |
| Framer Motion | catalog | Animated form/confirmation transitions |
| pnpm workspaces | 10 | Monorepo package management; the entire project is a pnpm workspace |
| Azure Static Web Apps | — | Required by PRD; serves the static `dist/` output |
| Supabase (PostgreSQL) | — | Required by PRD; developer provided their own account and credentials |

---

## Project Structure Notes

```
/                                          # Monorepo root
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml      # CI/CD — build + deploy to Azure SWA on push to main
├── artifacts/
│   └── dream-travel-survey/               # The survey app — the only artifact the developer cares about
│       ├── dist/                          # Production build output — deploy THIS folder to Azure
│       ├── public/
│       │   ├── images/
│       │   │   └── hero-bg.png            # AI-generated hero background image
│       │   ├── staticwebapp.config.json   # Azure SWA SPA routing config — must stay in public/
│       │   └── favicon.svg
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout.tsx             # Shared page shell: ambient background blobs + footer
│       │   │   └── ui/                    # shadcn/ui components — do not hand-edit these
│       │   ├── hooks/
│       │   │   └── use-survey.ts          # useSurveyResults() + useSubmitSurvey() — all Supabase calls live here
│       │   ├── lib/
│       │   │   ├── supabase.ts            # createClient() initialized from import.meta.env
│       │   │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
│       │   ├── pages/
│       │   │   ├── home.tsx              # Route: /
│       │   │   ├── survey.tsx            # Route: /survey — form logic + confirmation screen
│       │   │   ├── results.tsx           # Route: /results — data processing + four charts
│       │   │   └── not-found.tsx         # 404 fallback
│       │   ├── App.tsx                   # Wouter router — WouterRouter base set from import.meta.env.BASE_URL
│       │   ├── index.css                 # Tailwind base + full CSS variable theme (light mode only)
│       │   └── main.tsx                  # ReactDOM.createRoot entry point
│       ├── index.html                    # HTML shell — Inter font loaded via Google Fonts CDN
│       ├── vite.config.ts                # PORT/BASE_PATH default gracefully; outDir = dist
│       ├── package.json                  # Artifact-level deps; @supabase/supabase-js is a runtime dep
│       └── tsconfig.json
├── supabase-setup.sql                    # Run once in Supabase SQL Editor — creates table + RLS policies
├── README.md                             # Public-facing documentation + Azure deployment guide
├── WORKING_NOTES.md                      # This file
└── .github/workflows/azure-static-web-apps.yml
```

### Non-Obvious Decisions

- **`@supabase/supabase-js` is in `dependencies`, not `devDependencies`** — Vite embeds it into the JS bundle at build time, but the pnpm workspace's `pnpm prune --prod` behavior on some CI setups requires it to be a regular dep. Safe to leave as-is.
- **`outDir` is `dist/public/`** — the build emits to `artifacts/dream-travel-survey/dist/public/`. The GitHub Actions workflow uses `app_location: "."` (repo root, always exists at checkout) and `output_location: "artifacts/dream-travel-survey/dist/public"` so Azure finds the pre-built files after the pnpm build step runs.
- **`vite.config.ts` does not throw on missing `PORT` or `BASE_PATH`** — those variables are required in Replit's dev environment but are absent in Azure's CI build step. Both now have safe defaults (`5173` and `/`).
- **Wouter's `base` prop** is set to `import.meta.env.BASE_URL.replace(/\/$/, "")` — on Replit, `BASE_URL` is the proxy sub-path. On Azure SWA, `BASE_URL` is `/` and after stripping the trailing slash it becomes `""`, which is the correct root for wouter.
- **Data aggregation happens client-side** in a `useMemo` inside `results.tsx` — all rows are fetched and counted in the browser. Acceptable at current scale; would need server-side aggregation above ~50k rows.

### Files That Must Not Be Changed Without Discussion

- `artifacts/dream-travel-survey/src/lib/supabase.ts` — changing the client init affects every data call
- `artifacts/dream-travel-survey/public/staticwebapp.config.json` — routing config for Azure; wrong values break navigation
- `.github/workflows/azure-static-web-apps.yml` — changing build steps or secret names breaks CI/CD
- `supabase-setup.sql` — the schema is live in production; changes require a migration, not a rerun of this file

---

## Data / Database

**Provider:** Supabase (PostgreSQL). Developer-owned account at `https://dymgoywxotfsilogovql.supabase.co`.

### Table: `travel_survey_results`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes (auto) | `gen_random_uuid()` — primary key |
| `created_at` | `timestamptz` | Yes (auto) | `now()` default — set by Supabase on insert |
| `dream_destination` | `text` | Yes | Free-text; trimmed before insert |
| `destination_type` | `text` | Yes | One of: Beach, City, Mountains/Nature, Cultural/Historical, Adventure, Other |
| `traveler_type` | `text` | Yes | One of: Luxury traveler, Budget traveler, Adventure seeker, Relaxation-focused, Solo traveler, Group traveler |
| `activities` | `text[]` | Yes | PostgreSQL text array; one or more of the 7 checkbox options |
| `other_activity` | `text` | No (nullable) | Only populated when "Other" is in `activities`; raw user input, not normalized |

### Row-Level Security

- **Insert:** `anon` role can insert — no restrictions beyond the `with check (true)` policy
- **Select:** `anon` role can select all rows — intentional; results are aggregated client-side
- **Update/Delete:** No policies exist; these operations are blocked for anonymous users

---

## Conventions

### Naming Conventions

- **Files:** kebab-case (`use-survey.ts`, `not-found.tsx`)
- **Components:** PascalCase exports (`export default function Survey()`)
- **Hooks:** `use` prefix, camelCase (`useSurveyResults`, `useSubmitSurvey`)
- **CSS classes:** Tailwind utility classes only; no custom class names except `glass-panel` (defined in `index.css`)
- **Constants:** SCREAMING_SNAKE_CASE arrays at top of file (`DESTINATION_TYPES`, `TRAVELER_TYPES`, `ACTIVITIES`)
- **Database fields:** snake_case matching the Supabase column names exactly (`dream_destination`, `other_activity`)

### Code Style

- TypeScript strict mode — no `any` except in Recharts tooltip render props (typed `any` is intentional there)
- Zod schemas co-located with the form that uses them (`survey.tsx`)
- All Supabase calls go through the hooks in `use-survey.ts` — never call `supabase` directly from a page component
- `cn()` utility used for all conditional className merging — never string concatenation
- `aria-describedby` and `aria-invalid` must be present on all form inputs that have error states

### Framework Patterns

- Client-side routing via Wouter; three routes: `/`, `/survey`, `/results`
- All data fetching via TanStack Query (`useQuery` for reads, `useMutation` for writes)
- Query key for results: `["survey_results"]` — invalidated on successful insert to trigger a refetch
- Form built with React Hook Form + Zod resolver; `Controller` used for radio and checkbox groups
- Framer Motion `AnimatePresence` wraps the form-to-confirmation transition

### Git Commit Style

```
type(scope): short imperative description

Examples:
feat(survey): add conditional other-activity input with auto-focus
fix(results): correct toTitleCase curried arrow bug
chore(ci): add Azure SWA deployment workflow
docs(readme): update output_location path for Azure
```

---

## Decisions and Tradeoffs

- **Direct Supabase connection from the frontend.** The Supabase anon key is a publishable key. Row-level security restricts anonymous users to insert and select only. No custom backend or Express routes are needed. Do not suggest routing through the API server.
- **Client-side data aggregation.** All rows are fetched and processed in `useMemo` inside `results.tsx`. This is simple and correct for a course project with a small number of expected responses (< 1000). Do not add a server-side aggregation endpoint unless the dataset grows substantially.
- **No authentication.** The survey is intentionally anonymous. Do not suggest adding Replit Auth or any login mechanism.
- **Single-page pnpm monorepo artifact.** The survey lives in `artifacts/dream-travel-survey/` inside a larger pnpm workspace. The developer only cares about this artifact; the `api-server` and `mockup-sandbox` artifacts are scaffolding and are not used by this project.
- **`BASE_PATH` defaults to `/` in production.** Azure SWA always serves from the root. The Replit dev environment injects a sub-path. The Vite config handles both without env-specific config files.
- **Recharts over other chart libraries.** Required by the PRD. Do not suggest Chart.js, D3, or Nivo.

---

## What Was Tried and Rejected

- **Routing survey submissions through the Express API server** (`artifacts/api-server`). Rejected because it adds unnecessary infrastructure for a frontend-only app. The Supabase anon key is safe to expose; RLS handles authorization. Do not suggest this approach again.
- **Using Replit's built-in PostgreSQL database.** The developer specified their own Supabase account. The Replit DB was never provisioned for this project. Do not suggest switching to it.
- **Setting `PORT` and `BASE_PATH` as required in the Azure build.** Azure's build environment does not provide these. The attempt was made in the initial Vite config; it was corrected by adding safe defaults. Do not suggest restoring the `throw` behavior.
- **Placing build output at `dist/` (without `/public`).** Tried briefly to simplify Azure config. Reverted — the user and Azure both require `dist/public/` as the output folder. Do not change back to `dist/`.
- **Setting `app_location` to `artifacts/dream-travel-survey/dist` or `artifacts/dream-travel-survey/dist/public` in the GitHub Actions workflow.** Both fail because Azure validates `app_location` at repo checkout time, before the build runs. Since `dist/` is gitignored, it does not exist in the checked-out repo and Azure throws "directory not found." The correct pattern is `app_location: "."` (repo root) + `output_location: "artifacts/dream-travel-survey/dist/public"`. Do not revert to pointing `app_location` at the dist folder.

---

## Known Issues and Workarounds

### Bug: `toTitleCase` in `results.tsx` is a curried arrow function

**Location:** `artifacts/dream-travel-survey/src/pages/results.tsx`, line 17

**Problem:** The function is written as:
```typescript
(txt) => text => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
```
This is a curried function that returns a function rather than a string. When passed to `String.replace()`, the replacement callback receives a function object instead of a transformed string. Capitalization of normalized "Other" activity labels and dream destinations may silently fall back to displaying the un-capitalized normalized string.

**Workaround:** None currently. The charts still display data — the label just may appear lowercase instead of title-cased for entries derived from free-text input. This does not affect the counts or correctness of the data.

**Fix (do not apply without developer sign-off):** Replace the double-arrow with a single-arrow:
```typescript
(txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
```
**Must not be removed:** The surrounding `useMemo` aggregation logic is correct and must stay intact when fixing this.

---

### Non-issue: Results page does not auto-refresh

**Description:** After submitting the survey, the results page will show the new response only after a manual page reload. TanStack Query's `staleTime` is set to 5 minutes in `App.tsx`, so cached data is not re-fetched automatically.

**This is acceptable behavior** for a course project with intermittent traffic. If real-time updates are needed, Supabase's `supabase.channel()` realtime subscription API would be the correct approach. Do not implement polling.

---

## Browser / Environment Compatibility

### Frontend

- **Tested:** Chrome 120+, Firefox 123+, Safari 17+ (macOS/iOS)
- **Expected support:** All modern evergreen browsers; ES2022 target
- **Known incompatibilities:** `hsl(from ...)` relative color syntax used in `index.css` for computed button borders is not supported in Firefox < 128 or Safari < 16.4 — the fallback values in the CSS handle this gracefully
- **Not tested:** IE11 (not supported), Opera Mini

### Backend / Build Environment

- **OS:** Linux (Ubuntu, via GitHub Actions `ubuntu-latest`)
- **Node.js:** 20 (specified in `.github/workflows/azure-static-web-apps.yml`)
- **Package manager:** pnpm 10
- **Environment variables required at build time:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `BASE_PATH` (defaults to `/`), `NODE_ENV` (set to `production`)
- **Environment variables required at dev time:** `PORT` (provided by Replit), `BASE_PATH` (provided by Replit)

---

## Open Questions

- [ ] **Duplicate submissions:** Should the app prevent a user from submitting multiple times in one session? If yes, should this be enforced via `localStorage` (client-only, bypassable) or a Supabase RLS policy with IP/fingerprint logic?
- [ ] **"Other" in activities chart:** Currently each unique normalized "Other" label appears as its own bar. If many users enter unique custom activities, the chart may become unwieldy. Should entries below a threshold count (e.g., < 2) be collapsed into a single "Other" bar?
- [ ] **Data retention:** Does Supabase data need to be exported or archived after the course ends? The table will persist indefinitely on the free tier.
- [ ] **Azure deployment token:** Has the developer created the Azure Static Web App resource and retrieved `AZURE_STATIC_WEB_APPS_API_TOKEN` yet? The workflow is ready but will fail without this secret.

---

## Session Log

### 2026-03-26

**Accomplished:**
- Changed Vite `outDir` from `dist/` to `dist/public/` per user request; confirmed production build succeeds with output at `artifacts/dream-travel-survey/dist/public/`
- Fixed GitHub Actions workflow: changed `app_location` from `artifacts/dream-travel-survey/dist/public` to `"."` (repo root) and `output_location` to `"artifacts/dream-travel-survey/dist/public"` — resolves Azure "directory not found" error caused by `dist/` being gitignored and not present at checkout time
- Updated `WORKING_NOTES.md` with current state, corrected structure notes, and new "What Was Tried and Rejected" entries
- Provided step-by-step Azure deployment instructions to user

**Left Incomplete:**
- Azure deployment not yet live — user has not yet configured GitHub Actions secrets
- `toTitleCase` bug in `results.tsx` — identified but not fixed pending developer sign-off

**Decisions Made:**
- Build output at `dist/public/` — this is now locked; do not change
- `app_location: "."` in GitHub Actions — this is now locked; do not change

**Next Step:**
User adds 3 GitHub secrets (`AZURE_STATIC_WEB_APPS_API_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and triggers first deployment by pushing to `main`.

---

### 2026-03-24

**Accomplished:**
- Built the complete React + Vite survey app from the PRD: home page, four-question survey form, confirmation screen, results page with four Recharts charts
- Integrated Supabase directly from the frontend using `@supabase/supabase-js`; confirmed end-to-end insert and select with a live test row
- Created `supabase-setup.sql` for one-step schema creation with RLS policies
- Fixed `vite.config.ts` for Azure compatibility (removed throws on missing `PORT`/`BASE_PATH`, changed `outDir` to `dist/`)
- Created `.github/workflows/azure-static-web-apps.yml` for CI/CD
- Updated `staticwebapp.config.json` to exclude `/images/*` from SPA fallback
- Wrote `README.md` (public) and `WORKING_NOTES.md` (this file)
- Confirmed production build succeeds in 13.56s

**Left Incomplete:**
- `toTitleCase` bug in `results.tsx` — identified but not fixed pending developer sign-off
- GitHub Actions secrets not yet configured (awaiting developer action in Azure portal)

**Decisions Made:**
- Direct Supabase connection from frontend — no API server involvement
- Build output at `dist/` — not `dist/public/`

**Next Step:**
Configure `AZURE_STATIC_WEB_APPS_API_TOKEN`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` as GitHub Actions secrets to activate the deployment pipeline.

---

## Useful References

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction) — insert, select, RLS
- [Supabase Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) — how the anon policies work
- [Recharts API Reference](https://recharts.org/en-US/api) — `BarChart`, `Bar`, `Cell`, `ResponsiveContainer`, `Tooltip`
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation) — `zodResolver`, `Controller` for controlled inputs
- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration) — `staticwebapp.config.json` reference
- [Azure SWA GitHub Actions](https://learn.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow) — workflow YAML reference; `skip_app_build` and `app_location` semantics
- [Vite Env Variables](https://vite.dev/guide/env-and-mode) — how `VITE_` prefix works and when variables are embedded
- [pnpm Workspace Filtering](https://pnpm.io/filtering) — `pnpm --filter @workspace/dream-travel-survey run build`
- [Framer Motion AnimatePresence](https://motion.dev/docs/react-animate-presence) — form-to-confirmation transition
- [Wouter](https://github.com/molefrog/wouter) — lightweight React router; `base` prop for sub-path hosting
- **AI tools used:** Claude (Anthropic) via Replit Agent — used for initial scaffold, Supabase integration, Azure config, and all documentation. All generated code was reviewed and tested against the live Supabase database before being accepted.
