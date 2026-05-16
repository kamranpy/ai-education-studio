---
plan: 10-01
phase: 10
status: complete
completed: "2026-05-16"
---

# Summary: Admin Layout, Dashboard & Exam List UI Implementation

**One-liner**: Redesigned the Institute Admin portal shell, dashboard, and exam list to match the v2.0 design system using CSS variables throughout.

## What Was Built

### `admin-layout.tsx` — Full redesign
- Fixed 280px sidebar with `var(--portal-sidebar-bg)` background
- Logo: "AI Education Studio" with `school` Material Symbol icon in rounded square
- Institute name badge with animated teal pulse dot (from `props.auth.user.institute.name`)
- 5 nav items (Dashboard, Exams, Users, Billing, Settings) with Material Symbols icons
- Active nav: right-border accent + tinted bg via `var(--portal-nav-active-*)` tokens
- Topbar: breadcrumb "Admin / [Page]" + notification bell with red dot + user avatar (initials) + name
- Mobile: hamburger + slide-in drawer with overlay, no bottom nav bar
- All colors via CSS variables — zero hardcoded hex

### `Admin/Dashboard.tsx` — Full redesign
- Page header: "Dashboard" + "Welcome back, [name]" + "Invite Student" + "Create Exam" buttons
- 4 stat cards (glass-card): Total Exams, Active Students, Avg Score, Credits Remaining
- Bar chart "Exam Attempts — Last 8 Weeks" (div-based, 8-col bento span)
- AI Utilization card (4-col bento span) with circular progress mock
- Recent Exams table with status badges (PUBLISHED/DRAFT/CLOSED) and actions
- `DashboardProps` interface with optional `stats` and `recentExams` (fallback values)

### `Admin/Exams/Index.tsx` — Table → Card grid redesign
- Replaced `<Table>` with `grid grid-cols-1 xl:grid-cols-2` card grid
- Each card: `glass-card p-8 rounded-2xl` with hover glow effect
- Status badges: animated pulse dot for ACTIVE, error color for COMPLETED, muted for DRAFT
- Filter bar: `glass-card` with status select + search input + sort buttons
- Empty state: dashed border card with `post_add` icon
- Numbered pagination with `buildPageNumbers()` helper
- Zero-credits warning banner restyled to `glass-card` with `var(--brand-tertiary)`
- All existing logic preserved: Wayfinder routes, router.get filters, publish/unpublish dialogs

## Key Files

- `resources/js/layouts/admin-layout.tsx`
- `resources/js/pages/Admin/Dashboard.tsx`
- `resources/js/pages/Admin/Exams/Index.tsx`

## Design Decisions

- CSS variables only — no hardcoded hex in any component file
- `glass-card` utility class used for all card surfaces
- Structural pattern mirrors `student-layout.tsx` (fixed sidebar, mobile drawer, sticky topbar)
- Bar chart uses div-based bars (no external chart library)
- TypeScript: zero diagnostics on all 3 files
