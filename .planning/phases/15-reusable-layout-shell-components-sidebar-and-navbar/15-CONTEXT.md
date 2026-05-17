# Phase 15 Context: Reusable Layout Shell Components (Sidebar & Navbar)

**Captured:** 2026-05-17
**Phase goal:** Standardise the sidebar and topbar across all three portals (Student, Admin, Super Admin) so they share identical structure, icon library, styling approach, and mobile behaviour — while keeping each layout file separate.

---

## Decisions

### 1. No shared component — separate layout files, identical UI pattern

Each portal keeps its own layout file (`student-layout.tsx`, `admin-layout.tsx`, `super-admin-layout.tsx`). The goal is NOT to create a single shared wrapper component. Instead, each file is refactored to follow the **exact same structure, markup pattern, and styling conventions** so the three portals look and behave identically at the shell level. Nav items remain portal-specific (different routes, different labels).

### 2. Icon library: install `react-material-symbols` (or `@material-design-icons/svg`)

**Decision:** Replace ALL icon implementations with a proper Material Icons React library. This means:
- Remove all custom inline SVG icon components from all layout files (`DashboardIcon`, `BellIcon`, `MenuIcon`, `CloseIcon`, `LogoutIcon`, etc. in `student-layout.tsx`)
- Remove the `<span className="material-symbols-outlined">` font-based icons from `admin-layout.tsx`
- Replace Lucide icons (`LayoutGrid`, `Building2`, `Bot`, etc.) in `super-admin-layout.tsx`
- All three layouts use the same library — icons imported as React components

**Library to install:** `react-material-symbols` (lightweight, tree-shakeable, no font dependency)
```
npm install react-material-symbols
```
Usage: `import { Dashboard, Quiz, Group } from 'react-material-symbols';`
Renders as inline SVG — no font loading, no flash of missing icons.

**Icon mapping per portal:**

| Portal | Nav item | Icon name |
|--------|----------|-----------|
| Student | Dashboard | `Dashboard` |
| Student | My Results | `BarChart` |
| Student | Settings | `Settings` |
| Student | Logout | `Logout` |
| Admin | Dashboard | `Dashboard` |
| Admin | Exams | `Quiz` |
| Admin | Users | `Group` |
| Admin | Billing | `Payments` |
| Admin | Settings | `Settings` |
| Admin | Logout | `Logout` |
| Super Admin | Dashboard | `Dashboard` |
| Super Admin | Institutes | `School` |
| Super Admin | LLM Provider | `SmartToy` |
| Super Admin | Billing | `CreditCard` |
| Super Admin | Credit Packages | `Inventory2` |
| Super Admin | Profile | `AccountCircle` |
| Super Admin | Logout | `Logout` |
| Topbar (all) | Bell / Notifications | `Notifications` |
| Topbar (all) | Hamburger open | `Menu` |
| Topbar (all) | Hamburger close | `Close` |

### 3. Styling: Pure Tailwind with CSS variables via arbitrary value syntax (Option A)

**Decision:** Keep the existing CSS variable system (`var(--portal-*)`, `var(--brand-*)`) as the design token source of truth. Reference them in Tailwind using arbitrary value syntax:

```tsx
// Instead of: style={{ backgroundColor: 'var(--portal-sidebar-bg)' }}
// Use Tailwind v4 shorthand: className="bg-(--portal-sidebar-bg)"

// Instead of: style={{ color: 'var(--portal-nav-text)' }}
// Use Tailwind v4 shorthand: className="text-(--portal-nav-text)"
```

**Tailwind v4 CSS variable shorthand:** `bg-(--var-name)` — works for ALL CSS vars (`:root`, `.dark`, `@theme`). This is the canonical v4 syntax, preferred over the v3 `bg-[var(--var-name)]` form.

This means:
- **No `style={{}}` props for colors, backgrounds, or borders** — all moved to `className` with Tailwind v4 shorthand
- **No hardcoded hex values** anywhere in layout files
- `dark:` variants are NOT needed — the CSS variables already handle light/dark switching
- Hover states: use Tailwind `hover:` utilities with shorthand
  ```tsx
  className="hover:bg-(--portal-nav-hover-bg)"
  ```
- Active nav state: use conditional classes, not inline `style`
  ```tsx
  className={isActive
    ? "bg-(--portal-nav-active-bg) text-(--portal-nav-active-text) border-r-2 border-(--portal-nav-active-border)"
    : "text-(--portal-nav-text) hover:bg-(--portal-nav-hover-bg)"
  }
  ```

### 4. Super Admin layout: align to CSS variable system

The Super Admin layout currently uses hardcoded Tailwind `dark:` classes (`dark:bg-slate-900`, `dark:text-slate-400`, `bg-indigo-100 dark:bg-indigo-900/30`) instead of CSS variables. This phase replaces all of those with the CSS variable approach used by the Student and Admin layouts.

Specific replacements (using Tailwind v4 CSS var shorthand):
- `bg-white dark:bg-slate-900` → `bg-(--portal-sidebar-bg)`
- `bg-slate-50 dark:bg-slate-950` → `bg-(--portal-bg)`
- `border-slate-200 dark:border-slate-800` → `border-(--portal-card-border)`
- `text-slate-600 dark:text-slate-400` → `text-(--portal-nav-text)`
- `bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300` (active nav) → `bg-(--portal-nav-active-bg) text-(--portal-nav-active-text)`
- `hover:bg-slate-100 dark:hover:bg-slate-800/50` → `hover:bg-(--portal-nav-hover-bg)`
- `bg-white/80 dark:bg-slate-900/80` (topbar) → `bg-(--portal-topbar-bg)`

### 5. Mobile behaviour: unified custom drawer pattern (no Sheet)

**Decision:** Replace the Super Admin's shadcn `Sheet` component with the same custom drawer pattern used in Student and Admin layouts:
- `useState(false)` for `mobileOpen`
- Fixed overlay div (click to close) + slide-in `<aside>` with `transform: translateX()`
- Same Tailwind classes across all three: `fixed left-0 top-0 h-screen flex flex-col z-50 transition-transform duration-300`
- Breakpoint: `md:` (768px) — same as Student and Admin (Super Admin currently uses `lg:`)

### 6. Avatar: unified gradient initials component

**Decision:** All three portals use the same gradient initials avatar (no external image service):
- `getInitials(name)` helper function
- `w-9 h-9 rounded-xl` size
- `bg-gradient-to-br from-indigo-500 to-violet-600` (pure Tailwind, replaces inline `linear-gradient` style)
- White text, semi-transparent border: `ring-2 ring-white/20`
- Remove `ui-avatars.com` external image call from Super Admin layout (security + privacy + performance)

### 7. Nav item pattern: data-driven array (all three portals)

**Decision:** All three layouts use a typed `NavItem[]` array (as Admin already does) — no more hardcoded individual `<Link>` blocks per nav item:
```tsx
type NavItem = { title: string; href: string; icon: React.ComponentType<{ size?: number }>; matchPrefix: string; }
```
The array is defined inside the component (scoped, not module-level) so it has access to Wayfinder route functions.

### 8. Inertia best practices

- All navigation uses Inertia `<Link>` — no `<a>` tags, no `window.location`
- Logout uses `<Link href={logout()} method="post" as="button">` (already correct)
- No Blade partials or custom blade layouts involved — all routing is Inertia page-level
- No `window.*` calls in layout code
- `usePage()` for URL matching and auth props (already correct pattern)

### 9. Topbar: unified structure across all portals

All three topbars must have identical structure (left → right):
1. Hamburger button (mobile only, `md:hidden`)
2. Breadcrumb: `{portalLabel} / {pageLabel}` — portal label is muted, page label is primary
3. (right side) `ThemeDropdown` component (already shared)
4. Bell icon button (`Notifications` from react-material-symbols)
5. User avatar + name (desktop only shows name)

Remove the red dot notification badge from Admin topbar for now (no real notification system yet — cosmetic only, confusing).

---

## Canonical References

- `resources/js/layouts/student-layout.tsx` — canonical reference for sidebar/topbar structure
- `resources/js/layouts/admin-layout.tsx` — current best nav-item pattern (data-driven array)
- `resources/js/layouts/super-admin-layout.tsx` — needs most work (icons, styling, mobile)
- `resources/js/components/theme-dropdown.tsx` — shared component, keep as-is
- `package.json` — add `react-material-symbols` dependency

---

## Out of Scope (deferred)

- Settings/profile page layout (separate layout file `settings/layout.tsx`)
- `role-aware-layout.tsx` — routing wrapper, not a visual shell
- Bottom mobile nav bar (student-only feature — keeping as-is for now, student UX is different)
- Real notification system (bell icon stays, no dropdown or badge)
- Extracting a single shared `PortalLayout` wrapper component (explicitly decided against)
