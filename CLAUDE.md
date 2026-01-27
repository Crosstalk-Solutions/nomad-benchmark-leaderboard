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

## API Endpoints
- `POST /api/v1/submit` — Submit benchmark results (rate-limited)
- `GET /api/v1/leaderboard` — Get leaderboard data
- `GET /api/v1/stats` — Get statistics
- `GET /api/v1/submission/:id` — Get specific submission

## Development
```bash
npm install
node ace migration:run
npm run dev          # Starts on http://localhost:3333
```

## Deployment
Deployed on Render. Push to `master` triggers auto-deploy.
```bash
npm run build        # Compiles AdonisJS + React
```
