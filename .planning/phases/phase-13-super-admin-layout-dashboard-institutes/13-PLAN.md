# Phase 13 — Implementation Plan

> Super Admin Layout, Dashboard & Institutes

---

## Phase Summary

**Goal:** Redesign Super Admin portal shell and primary management pages with the new design system.

**Requirements:** SUP-01, SUP-02, SUP-03, DS-01, DS-02, DS-03

**Success Criteria:**
- [ ] Super Admin sidebar/topbar layout matches new design system
- [ ] Global analytics dashboard renders with new design
- [ ] Institutes management page renders with new design

---

## Visual References

**Design Files:**
- `/.planning/ui-designs/phase-13-superadmin-shell/super-admin-layout.html` — Layout shell
- `/.planning/ui-designs/phase-13-superadmin-shell/super-admin-dashboard.html` — Dashboard
- `/.planning/ui-designs/phase-13-superadmin-shell/super-admin-institutes.html` — Institutes table

**Design System:** `13-UI-SPEC.md`

---

## Plan: 13.1 — Super Admin Layout Shell

**Scope:** Update `resources/js/layouts/super-admin-layout.tsx`

### Visual Design (from HTML)
- Left sidebar: 280px fixed width, `bg-surface-container-low`, `border-r border-outline-variant`
- Header: "Admin Portal" title + "Super User" subtitle with primary branding
- Navigation items: Dashboard, Institutes, LLM Provider, Billing, Credit Packages
- Active state: `bg-primary-container text-on-primary-container`
- User footer: Profile, Logout
- Topbar: Breadcrumb, search, notifications, theme toggle, user avatar

### Implementation Tasks

1. **Update Sidebar Colors**
   - Change from zinc to Material Design 3 color tokens:
     - Background: `bg-surface-container-low` 
     - Border: `border-outline-variant`
     - Active nav: `bg-primary-container text-on-primary-container`
     - Inactive nav: `text-on-surface-variant hover:bg-surface-container-high`

2. **Update Header/Topbar**
   - Height: 64px (`h-16`)
   - Background: `bg-surface/80 backdrop-blur-xl`
   - Border: `border-b border-outline-variant`
   - Add breadcrumb: "Admin > [Page Name]"
   - Add search bar with `rounded-full border-outline-variant`
   - Add notification/settings/theme buttons

3. **Update Navigation Structure**
   - Keep same nav items but update styling
   - Add mobile hamburger menu (Sheet component)

### Acceptance Criteria
- [ ] Sidebar uses Material Design 3 color tokens (surface, primary-container, etc.)
- [ ] Active navigation has primary-container background
- [ ] Topbar has breadcrumb, search, and action buttons
- [ ] Mobile responsive with hamburger menu
- [ ] Theme switcher present

---

## Plan: 13.2 — Super Admin Dashboard

**Scope:** Update `resources/js/pages/SuperAdmin/Dashboard.tsx`

### Visual Design (from HTML)
- Page header: "Global Analytics" + period selector + Export button
- Stats row: 4 cards (Institutes, Exams, Revenue, Credits)
- Charts section: 2-column layout
  - Left: Exams Over Time (bar chart)
  - Right: Revenue Over Time (area chart)
- Recent table: Model usage table with status badges

### Implementation Tasks

1. **Update Page Header**
   - Title: "Global Analytics" with description
   - Period selector dropdown: Last 7 Days, 30 Days, 90 Days, 1 Year
   - Export Report button (primary)

2. **Update Stats Cards**
   - 4-column grid (responsive: 1 col mobile, 2 col tablet, 4 col desktop)
   - Card style: `bg-surface-container-lowest border-outline-variant rounded-xl`
   - Each card: icon (in colored container), title, value, trend indicator
   - Icons: school, description, payments, account_balance_wallet

3. **Update Charts Section**
   - Use existing Recharts implementation
   - Exams chart: purple/indigo color scheme
   - Revenue chart: orange/tertiary color scheme (matches HTML)
   - Height: 300px each
   - Card container with shadow-sm

4. **Add Recent Activity Table**
   - Table headers: Institute Name, Active Exams, Credits Used, Status, Last Active, Actions
   - Status badges: Healthy (green), Low Credits (red)
   - Progress bars for credit usage
   - Pagination at bottom

### Color Mapping (from HTML to Tailwind)
| HTML Token | Tailwind Class |
|------------|----------------|
| bg-surface-container-lowest | `bg-white dark:bg-zinc-900` |
| bg-primary-container | `bg-indigo-100 dark:bg-indigo-900/30` |
| text-on-primary-container | `text-indigo-700 dark:text-indigo-300` |
| text-on-surface | `text-zinc-900 dark:text-zinc-100` |
| text-on-surface-variant | `text-zinc-600 dark:text-zinc-400` |
| border-outline-variant | `border-zinc-200 dark:border-zinc-800` |
| bg-emerald-100/text-emerald-700 | Status: healthy |
| bg-red-100/text-red-700 | Status: low credits |

### Acceptance Criteria
- [ ] Stats cards match design with icons and trend indicators
- [ ] Charts render with correct color scheme
- [ ] Recent activity table displays institute data
- [ ] Status badges use correct colors (emerald for healthy, red for low)
- [ ] Responsive layout (stack on mobile)

---

## Plan: 13.3 — Institutes Management Page

**Scope:** Update `resources/js/pages/SuperAdmin/Institutes/Index.tsx`

### Visual Design (from HTML)
- Page header: "Institutes" + description + "Add Institute" button
- Stats overview: 3 cards (Revenue, Active Exams, Platform Status)
- Filter bar: Search input + Status filter + Sort dropdown
- Data table: 6 columns with pagination

### Implementation Tasks

1. **Update Page Header**
   - Title: "Institutes" with description text
   - "Add Institute" button: `bg-primary text-on-primary rounded-xl`

2. **Add Stats Overview**
   - 3-column asymmetric layout
   - Card 1: Total Revenue ($48,900) with trend
   - Card 2: Active Exams (173) with subtitle
   - Card 3: Platform Status card (colored background) with pulse indicator

3. **Update Filter Bar**
   - Search: "Search by name or email..." with icon
   - Status dropdown: All, Active, Suspended, Pending
   - Sort dropdown: Newest, Name (A-Z), Revenue (High), Exams (High)
   - Container: `bg-surface-container-low p-4 rounded-xl`

4. **Update Data Table**
   - Columns: Name & Email, Status, Created, Exams, Revenue, Actions
   - Avatar initials in colored containers (institute initials)
   - Status badges:
     - Active: `bg-emerald-100 text-emerald-700`
     - Suspended: `bg-red-100 text-red-700`  
     - Pending: `bg-zinc-100 text-zinc-700`
   - Hover: `hover:bg-surface-container-low/50`
   - Actions: 3-dot menu button

5. **Add Pagination**
   - "Showing X of Y" text
   - Page number buttons with active state
   - Previous/Next arrows

### Acceptance Criteria
- [ ] Header matches design with Add Institute button
- [ ] Stats cards display correctly (including colored Platform Status card)
- [ ] Filter bar with search, status, and sort
- [ ] Table displays all columns with proper styling
- [ ] Status badges use correct colors
- [ ] Pagination works correctly
- [ ] Responsive layout

---

## Implementation Order

1. **13.1** — Layout Shell (foundation for all other pages)
2. **13.2** — Dashboard (uses layout, adds charts)
3. **13.3** — Institutes (uses layout, adds data table)

---

## Dependencies

**From Project:**
- `recharts` — Already installed for charts
- `lucide-react` — Icons (already installed)
- shadcn/ui components — Button, Card, Table, Select, Badge, Input

**Install if needed:**
```bash
# shadcn components
npx shadcn add table badge select card input button
```

---

## Testing Checklist

- [ ] Layout renders correctly in light mode
- [ ] Layout renders correctly in dark mode
- [ ] Mobile navigation works (hamburger menu)
- [ ] Dashboard charts display data
- [ ] Institutes table shows all columns
- [ ] Status badges have correct colors
- [ ] Pagination functions correctly
- [ ] Theme toggle works across all pages

---

## Plan Check

- [x] Visual references identified (HTML files + UI-SPEC.md)
- [x] Color tokens mapped from design to Tailwind
- [x] Component inventory checked
- [x] Implementation order logical
- [x] Acceptance criteria defined

---

## UAT Criteria

**Layout:**
- Navigate to /super-admin/dashboard — layout should match design
- Test mobile view — sidebar should collapse to hamburger menu
- Toggle theme — colors should adapt

**Dashboard:**
- Stats cards show correct metrics with trends
- Charts render without errors
- Period selector triggers data refresh

**Institutes:**
- Search filters table results
- Status filter works correctly
- Sort options reorder table
- Pagination navigates through results
