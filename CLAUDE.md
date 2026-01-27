# NOMAD Benchmark Leaderboard

## Project Overview
Community benchmark leaderboard for Project N.O.M.A.D. (Node for Offline Media, Archives, and Data). Allows users to submit hardware benchmark results from their NOMAD installations and compare scores on a public leaderboard.

**Live site:** https://benchmark.projectnomad.us
**Hosted on:** Render (web service)
**Database:** SQLite (via AdonisJS Lucid ORM)

## Tech Stack
- **Backend:** AdonisJS 6 (Node.js)
- **Frontend:** React 19 + Inertia.js (server-rendered SPA)
- **Styling:** Tailwind CSS 4 (with custom `@theme` tokens)
- **Charts:** Recharts
- **Build:** Vite 6
- **Language:** TypeScript throughout

## Design System — NOMAD Theme

The benchmark site uses a custom color palette extracted from the main NOMAD Command Center dashboard to maintain visual consistency across the product family.

### Color Tokens (defined in `inertia/css/app.css`)

| Token | Hex | Usage |
|-------|-----|-------|
| `nomad-cream` | `#F7EEDC` | Page background |
| `nomad-surface` | `#F6F6F4` | Card/panel backgrounds |
| `nomad-olive` | `#424420` | Primary text, buttons, table headers |
| `nomad-olive-dark` | `#353518` | Hover states on primary elements |
| `nomad-olive-mid` | `#6D7042` | Secondary text, muted labels, borders |
| `nomad-olive-light` | `#E8E9D4` | Info section backgrounds |
| `nomad-olive-faint` | `#F0F1E4` | Hover rows, subtle highlights |
| `nomad-rust` | `#A84A12` | Accent color (top scores, CTAs, links) |
| `nomad-rust-dark` | `#8B3D0F` | Hover on rust elements |
| `nomad-rust-light` | `#D4874A` | Light rust accent |
| `nomad-gray` | `#AFAFA5` | Disabled/placeholder text |
| `nomad-text` | `#424420` | Primary body text |
| `nomad-text-muted` | `#6D7042` | Secondary body text |

### Design Patterns
- **Section headers:** Use a left vertical accent bar (`w-1 h-7 bg-nomad-olive rounded-full`) before the heading text
- **Cards:** `bg-nomad-surface` with `border border-nomad-olive-mid/20 rounded-xl` (no shadows)
- **Table headers:** Dark olive background with light text (`bg-nomad-olive text-nomad-surface` + uppercase tracking)
- **Card sub-headers:** Dark olive bar matching the NOMAD dashboard's "OPERATING SYSTEM" / "PROCESSOR" card header style
- **Score colors:** olive (80+), olive-mid (60-80), yellow (40-60), orange (20-40), red (0-20)
- **Rank badges:** Gold (#FFD700 range), silver (gray-400), bronze (amber-700) with white text
- **View toggle:** Olive active state (`bg-nomad-olive text-nomad-surface`)
- **Links/CTAs:** Rust color for action links, olive for navigation

### Key Design Rules
- Do NOT use emerald/green Tailwind defaults — use the `nomad-*` tokens instead
- Do NOT use `shadow-lg` on cards — use olive borders
- Do NOT use cool gray backgrounds — use `nomad-cream`
- Footer uses the Crosstalk Solutions logo (`/crosstalk-solutions-logo.png`), NOT Rogue Support
- The aesthetic should always match the main NOMAD Command Center dashboard (warm earth tones, tactical/military feel)

## Project Structure
```
inertia/
  app/app.tsx           — Inertia entry point
  css/app.css           — Tailwind config + NOMAD theme tokens
  pages/
    home.tsx            — Landing page (hero, stats, recent submissions)
    leaderboard.tsx     — Leaderboard page (rankings/statistics toggle)
  components/
    LeaderboardTable.tsx — Ranked submissions table
    StatsCharts.tsx      — Score distribution charts, top hardware
    ViewToggle.tsx       — Rankings/Statistics pill toggle
app/
  controllers/          — AdonisJS route handlers
  models/               — Database models (Submission)
  services/             — Business logic (StatsService)
  validators/           — Request validation
resources/views/        — Edge templates (inertia_layout.edge)
database/migrations/    — SQLite schema migrations
public/                 — Static assets (logos, favicons)
```

## Database

### Migrations
Two migration files in `database/migrations/`:
1. `1737500000000_create_submissions_table.ts` — Creates the `submissions` table with all columns including `builder_tag`
2. `1769400000000_add_fingerprint_and_ip.ts` — Adds `hardware_fingerprint` and `submitter_ip` columns

**Important:** The `builder_tag` column is defined directly in the create table migration. A separate migration for it was removed after causing a production deploy failure (duplicate column error). Do not create separate migrations for columns that already exist in the base migration.

### Schema (submissions table)
- `id` (auto-increment primary key)
- `repository_id` (unique, not null)
- `cpu_model`, `cpu_cores`, `cpu_threads`, `ram_gb`, `disk_type` (hardware info)
- `gpu_model` (nullable)
- `cpu_score`, `memory_score`, `disk_read_score`, `disk_write_score` (benchmark scores)
- `ai_tokens_per_second`, `ai_time_to_first_token` (nullable AI metrics)
- `nomad_score`, `nomad_version`, `benchmark_version` (benchmark metadata)
- `builder_tag` (nullable, max 100 chars — community display name)
- `hardware_fingerprint` (nullable, indexed — hash of cpu_model|gpu_model|ram_gb|builder_tag for duplicate detection)
- `submitter_ip` (nullable, max 45 chars for IPv6 — **never expose publicly**)
- `created_at` (timestamp)
- Index: `idx_submissions_nomad_score` on `nomad_score DESC`

## API Endpoints
- `POST /api/v1/submit` — Submit benchmark results (requires HMAC verification + rate limiting)
- `GET /api/v1/leaderboard` — Get leaderboard data
- `GET /api/v1/stats` — Get statistics
- `GET /api/v1/submission/:id` — Get specific submission
- `GET /api/health` — Health check (returns `{ status: 'ok' }`)

## Security

### HMAC Submission Authentication
- Submissions require HMAC-SHA256 signature via `X-NOMAD-Signature` and `X-NOMAD-Timestamp` headers
- The shared secret (`nomad-benchmark-v1-2026`) is hardcoded in the open-source NOMAD client (`admin/app/services/benchmark_service.ts`). **Do not change** the default secret — it would break all NOMAD installations in the field. This is a casual abuse deterrent, not true authentication.
- Verification uses raw request body bytes (`ctx.request.raw()`) for reliable signature matching
- Timestamps must be within 5 minutes to prevent replay attacks
- Constant-time comparison (`crypto.timingSafeEqual`) prevents timing attacks

### CORS
- Origin restricted to `https://benchmark.projectnomad.us` only (no wildcard)
- NOMAD servers submit via Node.js axios (server-to-server), so CORS does not apply to benchmark submissions
- Credentials disabled since auth uses HMAC headers, not cookies

### Security Headers Middleware (`app/middleware/security_headers.ts`)
Applied globally via `start/kernel.ts` (runs before all other middleware):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — restricts sources to `'self'` with `'unsafe-inline'` for scripts/styles (required by Vite/Inertia)

### Duplicate Detection
- Uses database transactions to prevent race conditions during fingerprint check + insert/update
- Hardware fingerprint: SHA256 hash of `cpu_model|gpu_model|ram_gb|builder_tag`
- Only higher scores replace existing entries for the same fingerprint

### Validation
- `builder_tag` max length: 100 chars (matches both validator and DB schema)
- `submitter_ip` is stored but never serialized to API responses (`serializeAs: null` on model)

## Development
```bash
npm install
node ace migration:run
npm run dev          # Starts on http://localhost:3333
```
Local database: `tmp/database.sqlite` (auto-created)

## Deployment
Deployed on Render. Push to `master` triggers auto-deploy.

- **Build command:** `npm ci && npm run build`
- **Pre-deploy:** `cd build && node ace migration:run --force`
- **Persistent disk:** 1 GB at `/data` (SQLite database lives at `/data/database.sqlite`)
- **Port:** 10000 (Render default)
