---
plan: 15-01
phase: 15
status: complete
completed: 2026-05-17
---

# Plan 15-01 Summary — Layout Shell Unification

## What Was Built

Unified the sidebar and topbar shell across all three portals (Student, Admin, Super Admin)
so they share identical structure, icon library, styling approach, and mobile behaviour —
while remaining separate layout files.

## Changes Made

### New dependency
- Installed `@material-symbols-svg/react` (React 19-compatible, inline SVG, tree-shakeable).
  Replaces both the font-based `material-symbols-outlined` spans (Admin layout) and the
  custom hand-rolled SVG icon components (Student layout).

### `resources/views/app.blade.php`
- Removed the Google Fonts Material Symbols `<link>` tag — no longer needed since icons
  are now inline SVG components, not a web font.

### `resources/js/layouts/student-layout.tsx`
- Removed 7 custom SVG wrapper functions (`DashboardIcon`, `AnalyticsIcon`, `SettingsIcon`,
  `LogoutIcon`, `BellIcon`, `MenuIcon`, `CloseIcon`).
- Imported `Dashboard`, `BarChart`, `Settings`, `Logout`, `Notifications`, `Menu`, `Close`
  from `@material-symbols-svg/react`.
- Replaced all `style={{ color/background: 'var(--...)' }}` inline props with Tailwind v4
  CSS-var shorthand (`text-(--portal-text-primary)`, `bg-(--portal-sidebar-bg)`, etc.).
- Removed all `onMouseEnter`/`onMouseLeave` JS hover handlers — replaced with
  `hover:bg-(--portal-nav-hover-bg)` Tailwind utilities.
- `UserAvatar`: replaced inline `style={{ background: ... }}` with
  `bg-linear-to-br from-indigo-500 to-violet-600 ring-2 ring-white/20`.
- Mobile drawer: replaced `style={{ transform }}` with Tailwind `translate-x-0` /
  `-translate-x-full` conditional classes.
- Mobile overlay: replaced `style={{ backgroundColor }}` with `bg-black/60`.
- Root `<div>`: replaced `style={{ backgroundColor, fontFamily }}` with
  `bg-(--portal-bg) font-sans`.
- Topbar: replaced `style={{ backgroundColor, backdropFilter, borderBottom }}` with
  `bg-(--portal-topbar-bg) backdrop-blur-xl border-b border-(--portal-card-border)`.

### `resources/js/layouts/admin-layout.tsx`
- Removed 4 custom SVG wrapper functions (`MenuIcon`, `CloseIcon`, `BellIcon`,
  `ChevronRightIcon`).
- Removed `<style>` tag containing `@keyframes institutePulse` — replaced with Tailwind
  `animate-pulse` on the institute badge dot.
- Removed all `material-symbols-outlined` font `<span>` elements.
- Imported 13 icons from `@material-symbols-svg/react` and wired them into the
  data-driven `NavItem[]` array (icon field changed from `string` to component type).
- Replaced all `style={{}}` color/background props with Tailwind v4 CSS-var shorthand.
- Removed all `onMouseEnter`/`onMouseLeave` JS hover handlers.
- Removed bell notification red-dot badge — simplified to plain bell button.
- Institute badge: switched from `style={{ background, border }}` to
  `bg-brand-secondary/8 border border-brand-secondary/25`.
- Topbar, sidebar, drawer, overlay: all converted to CSS-var Tailwind classes.

### `resources/js/layouts/super-admin-layout.tsx`
- Removed all Lucide React icon imports (`Bot`, `Building2`, `CreditCard`, `LayoutGrid`,
  `LogOut`, `Menu`, `Package`, `School`, `Settings`).
- Removed `Sheet`, `SheetContent`, `SheetTrigger` imports and usage.
- Removed `UserInfo` component import and usage.
- Added `useState` for `mobileOpen` state.
- Imported `Close`, `CreditCard`, `Dashboard`, `Logout`, `Menu`, `Notifications`,
  `School`, `Settings`, `SmartToy` from `@material-symbols-svg/react`.
- Added `UserAvatar` gradient initials component (replaces `ui-avatars.com` `<img>`).
- Replaced all `dark:` Tailwind classes with CSS-variable-based classes.
- Changed desktop sidebar breakpoint from `lg:` to `md:` (matches Student/Admin).
- Changed main content margin from `lg:ml-[280px]` to `md:ml-[280px]`.
- Implemented unified custom slide-in mobile drawer (matching Student/Admin pattern).
- Unified topbar: hamburger → breadcrumb → ThemeDropdown → bell → avatar+name.
- Nav: data-driven `NavItem[]` array with typed icon components.
- Sidebar footer: shows user name/role + Profile link + Logout link.
- All styling via CSS-var Tailwind shorthand — zero `dark:` classes remain.

### `resources/css/app.css`
- Removed `.material-symbols-outlined { font-variation-settings: ... }` rule — the font
  class is no longer used anywhere in the codebase.

## Verification

- `npm run build` — exit code 0, ✓ built in ~15s
- `npx tsc --noEmit` — exit code 0, zero type errors
