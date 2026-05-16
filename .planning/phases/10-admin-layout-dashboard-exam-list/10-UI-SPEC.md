---
phase: 10
slug: admin-layout-dashboard-exam-list
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-16
---

# Phase 10 — UI Design Contract
## Admin Layout, Dashboard & Exam List

> Visual and interaction contract for the Institute Admin portal shell and primary pages.
> Generated from established v2.0 design system (Phase 7 homepage/auth + Phase 8 student layout).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (custom CSS variables + Tailwind inline) |
| Preset | not applicable |
| Component library | Radix UI (via existing `@/components/ui/*`) |
| Icon library | Material Symbols Outlined (CDN) + inline SVG fallback |
| Font | Inter (400/500/600/700) |
| CSS variable system | `var(--portal-*)` tokens in `resources/css/app.css` |

**Design token source:** All colors, surfaces, and nav states are defined in `resources/css/app.css` under `/* ── v2.0 Design Tokens */`. Use these tokens — do NOT hardcode hex values.

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, badge padding |
| sm | 8px | Compact element spacing, button padding |
| md | 16px | Default element spacing, card padding |
| lg | 24px | Section padding, sidebar padding |
| xl | 32px | Layout gaps, page section breaks |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level top padding |

Exceptions:
- Sidebar width: 280px (matches student layout)
- Topbar height: 64px (h-16, matches student layout)
- Nav item touch target: 44px min height

---

## Typography

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Page title | 24px | 600 | 1.2 | Dashboard/page headings |
| Section heading | 18px | 600 | 1.3 | Card titles, table headers |
| Body | 14px | 400 | 1.5 | Table rows, descriptions, labels |
| Label/badge | 12px | 500 | 1.2 | Status badges, nav labels, meta info |
| Stat value | 28px | 700 | 1.1 | Dashboard stat numbers |
| Stat label | 12px | 400 | 1.4 | Stat card subtitles |

Font: Inter. No other font families.

---

## Color

All values reference CSS variables. Dark mode values shown (primary target).

| Role | CSS Variable | Dark Value | Usage |
|------|-------------|------------|-------|
| Page background | `--portal-bg` | `#131313` | Main content area |
| Sidebar background | `--portal-sidebar-bg` | `#0e0d16` | Left sidebar |
| Topbar background | `--portal-topbar-bg` | `rgba(19,18,27,0.85)` + blur | Sticky topbar |
| Card background | `--portal-card-bg` | `#1c1b1b` | Stat cards, table rows |
| Card border | `--portal-card-border` | `rgba(70,69,85,0.3)` | All card/panel borders |
| Card border hover | `--portal-card-border-hover` | `rgba(70,69,85,0.6)` | Card hover state |
| Primary text | `--portal-text-primary` | `#e4e1ee` | Headings, values |
| Secondary text | `--portal-text-secondary` | `#c7c4d8` | Body, descriptions |
| Muted text | `--portal-text-muted` | `#918fa1` | Labels, meta, placeholders |
| Brand primary | `--brand-primary` | `#4f46e5` | Buttons, active accents |
| Brand primary text | `--brand-primary-text` | `#c3c0ff` | Active nav text, links |
| Brand secondary | `--brand-secondary` | `#4fdbc8` | Secondary accents, success states |
| Nav active bg | `--portal-nav-active-bg` | `rgba(79,70,229,0.2)` | Active nav item |
| Nav active border | `--portal-nav-active-border` | `#4f46e5` | Left border on active nav |
| Nav hover bg | `--portal-nav-hover-bg` | `rgba(53,52,62,0.5)` | Nav item hover |
| Nav text | `--portal-nav-text` | `#c7c4d8` | Inactive nav items |
| Error/destructive | `--brand-error` | `#ffb4ab` | Delete actions, error states |
| Badge bg | `--portal-badge-bg` | `#35343e` | Default badge background |

**Accent reserved for:** Primary CTA buttons, active nav item, stat card icon backgrounds, chart fills, "Create Exam" button. NOT for decorative elements or general borders.

**Status badge colors (exam status):**
- Published: `bg-[#4f46e5]/20 text-[#c3c0ff]`
- Draft: `bg-[#35343e] text-[#c7c4d8]`
- Closed/Ended: `bg-[#0d9488]/20 text-[#4fdbc8]`
- Grading: `bg-[#ffb695]/20 text-[#ffb695]`

---

## Component Inventory

### Admin Layout Shell

Mirrors `student-layout.tsx` structure exactly. Key differences:
- Sidebar width: 280px (same)
- Nav items: Dashboard, Exams, Users, Billing, Settings (5 items vs student's 3)
- Institute name badge below logo (pill showing institute name from `props.auth.user.institute_name`)
- No mobile bottom nav (admin portal is desktop-primary; mobile drawer only)
- Topbar right: breadcrumb + notification bell + user avatar + name

**Active nav pattern** (carry forward from student layout):
```tsx
style={isActive ? {
  background: 'var(--portal-nav-active-bg)',
  color: 'var(--portal-nav-active-text)',
  borderLeft: '4px solid var(--portal-nav-active-border)',
} : { color: 'var(--portal-nav-text)' }}
```

Nav item icons (Material Symbols or inline SVG):
- Dashboard → `dashboard`
- Exams → `quiz`
- Users → `group`
- Billing → `credit_card`
- Settings → `settings`

### Stat Cards (Dashboard)

4-column grid on desktop, 2-column on tablet, 1-column on mobile.

Each card:
- `portal-card` class (bg + border + border-radius)
- Icon: 40×40 rounded-lg with `bg-[var]/10` tinted background
- Stat value: 28px/700 in `--portal-text-primary`
- Label: 12px/400 in `--portal-text-muted`
- Optional trend indicator: `+12%` in `--brand-secondary` or `--brand-error`

Stat cards for dashboard:
1. Total Exams — icon: `quiz`, accent: `--brand-primary-text`
2. Active Students — icon: `group`, accent: `--brand-secondary`
3. Avg Score — icon: `bar_chart`, accent: `--brand-primary-text`
4. Credits Remaining — icon: `credit_card`, accent: `--brand-tertiary`

### Bar Chart (Dashboard)

Inline div-based bars (no external chart library). Same pattern as homepage mockup:
- Container: `bg-[#131313] rounded-lg p-4 border border-[var(--portal-card-border)]`
- Bars: gradient fills `linear-gradient(to top, #4f46e5, #c3c0ff)` and `linear-gradient(to top, #0d9488, #4fdbc8)`
- Height: 160px chart area
- X-axis labels: week labels in `--portal-text-muted`
- Legend: two colored squares + labels

### Recent Exams Table (Dashboard)

Columns: Exam Name | Status | Students | Avg Score | Date | Actions

- Table container: `portal-card` with `overflow-hidden`
- Header row: `bg-[var(--portal-card-bg-alt)]`, text `--portal-text-muted`, 12px/500 uppercase
- Body rows: `bg-[var(--portal-card-bg)]`, hover `bg-[var(--portal-card-bg-alt)]`
- Row border: `border-b border-[var(--portal-divider)]`
- Actions: "View" text link in `--brand-primary-text`, "Edit" text link in `--portal-text-secondary`

### Exam List Page

**Header row:** "Exams" h1 (24px/600) + "Create Exam" primary button (right-aligned)

**Filter bar:** Search input + Status dropdown + Date filter
- Inputs: `bg-[var(--portal-input-bg)] border border-[var(--portal-input-border)]`
- Focus: `border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20`

**Exam cards grid:** 2 columns desktop, 1 column mobile
- Each card: `portal-card` + hover border glow
- Card content: title (16px/600), subject tag pill, status badge, `N students` meta, date meta
- Card footer: "View" + "Edit" buttons (text style, separated by divider)

**Empty state:**
- Centered layout, `quiz` icon (48px, `--portal-text-muted`)
- Heading: "No exams yet" (18px/600, `--portal-text-primary`)
- Body: "Create your first exam to get started." (14px, `--portal-text-muted`)
- CTA: "Create Exam" primary button

**Pagination:** Simple prev/next with page numbers, `portal-card` style

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | "Create Exam" |
| Dashboard page title | "Dashboard" |
| Dashboard subtitle | "Welcome back, [Name]" |
| Exam list page title | "Exams" |
| Exam list empty heading | "No exams yet" |
| Exam list empty body | "Create your first exam to get started." |
| Exam list empty CTA | "Create Exam" |
| Delete exam confirmation | "Delete Exam: This will permanently delete the exam and all student attempts. This cannot be undone." |
| Sidebar institute badge | Institute name from auth (truncated at 24 chars with ellipsis) |
| Topbar breadcrumb | "Admin / [Page Name]" |
| Credits low warning | "Low credits — [N] remaining. Top up to continue grading." |

---

## Interaction Patterns

### Navigation
- Active state: left border accent + tinted background (no full-width highlight)
- Hover: subtle background tint, no border
- Mobile: slide-in drawer from left, overlay backdrop, close on nav click

### Exam Cards
- Hover: `border-[var(--portal-card-border-hover)]` transition 200ms
- No scale transform (admin portal is data-dense, avoid playful transforms)

### Buttons
- Primary: `bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] active:scale-[0.98]`
- Secondary/outlined: `border border-[var(--portal-card-border)] text-[var(--portal-text-secondary)] hover:border-[var(--portal-card-border-hover)]`
- Destructive: `bg-[var(--brand-error)]/10 text-[var(--brand-error)] hover:bg-[var(--brand-error)]/20`

### Responsive Breakpoints
- Desktop (lg+): full sidebar visible, 2-col exam grid
- Tablet (md): sidebar hidden, hamburger topbar, 2-col exam grid
- Mobile (sm): 1-col exam grid, mobile drawer nav

---

## Implementation Notes

1. **Reuse `student-layout.tsx` as the structural template** — copy the pattern, update nav items, add institute badge, remove mobile bottom nav.
2. **CSS variables only** — no hardcoded hex in component files. All colors via `var(--portal-*)` or `var(--brand-*)`.
3. **`portal-card` utility class** — use for all card surfaces (defined in `app.css`).
4. **Wayfinder routes** — use `adminDashboard.url()`, `examsIndex.url()`, `usersIndex.url()`, `billingIndex.url()` from existing Wayfinder actions.
5. **Institute name** — available at `props.auth.user.institute?.name` via Inertia shared props.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | None (existing components only) | not required |
| Third-party | None | not required |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
