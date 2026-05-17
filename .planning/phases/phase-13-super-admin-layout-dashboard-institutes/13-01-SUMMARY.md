---
plan: 13-01
phase: 13
status: complete
completed: "2026-05-17"
---

# Summary: Super Admin Layout, Dashboard & Institutes UI Implementation

**One-liner**: Redesigned the Super Admin portal shell (layout), global analytics dashboard, and institutes management page to match the v2.0 design system.

## What Was Built

### Super Admin Layout Shell (`super-admin-layout.tsx`)
- Left sidebar with Material Design 3 color tokens (`bg-surface-container-low`, `border-outline-variant`)
- Active navigation: `bg-primary-container text-on-primary-container`
- Topbar: breadcrumb, search, notifications, theme toggle, user avatar
- Mobile responsive with hamburger menu (Sheet component)

### `SuperAdmin/Dashboard.tsx` — Full redesign
- Page header: "Global Analytics" with period selector and Export Report button
- 4 stats cards (Institutes, Exams, Revenue, Credits) with icons and trend indicators
- Charts section: Exams Over Time (bar, purple/indigo) + Revenue Over Time (area, orange/tertiary)
- Recent activity table with institute data, status badges (Healthy/Low Credits), progress bars
- Responsive layout (stacks on mobile)

### `SuperAdmin/Institutes/Index.tsx` — Full redesign
- Page header with "Add Institute" button
- Stats overview: 3 cards (Revenue, Active Exams, Platform Status)
- Filter bar: search + Status dropdown + Sort dropdown
- Data table: Name & Email, Status, Created, Exams, Revenue, Actions columns
- Avatar initials in colored containers
- Status badges: Active (emerald), Suspended (red), Pending (zinc)
- Pagination with Previous/Next arrows

## Key Files

- `resources/js/layouts/super-admin-layout.tsx`
- `resources/js/pages/SuperAdmin/Dashboard.tsx`
- `resources/js/pages/SuperAdmin/Institutes/Index.tsx`

## Design Decisions

- Material Design 3 color token mapping to Tailwind classes
- Recharts used for chart visualizations (already installed)
- Consistent with v2.0 design system established in prior phases
