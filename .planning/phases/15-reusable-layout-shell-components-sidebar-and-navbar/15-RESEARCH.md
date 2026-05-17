# Phase 15 Research: Reusable Layout Shell Components

**Researched:** 2026-05-17
**Phase:** 15 — Reusable Layout Shell Components (Sidebar & Navbar)

---

## Standard Stack

### Icon Library: `react-material-symbols`

**Install:**
```bash
npm install react-material-symbols
```

**Root setup** (add once in `resources/js/app.tsx`):
```tsx
import 'react-material-symbols/rounded';
```

**Usage** (single `MaterialSymbol` component, prop-driven):
```tsx
import { MaterialSymbol } from 'react-material-symbols';

<MaterialSymbol icon="dashboard" size={20} />
<MaterialSymbol icon="quiz" size={20} fill />
```

**Key props:** `icon` (string name), `size` (number), `fill` (boolean), `weight` (100–700), `grade` (-25 to 200), `opticalSize` (20/24/40/48), `className`, `style`.

**Why this over alternatives:**
- `react-material-symbols` — single `<MaterialSymbol icon="name">` component, uses CSS font + `font-variation-settings` under the hood, extremely small package (~6kb), all 3000+ icons available without per-icon imports. **No tree-shaking needed — font is loaded once.**
- `@material-symbols-svg/react` — per-icon SVG React components, requires individual named imports, large package size
- `@project-lary/react-material-symbols` — similar to above, per-icon imports
- `@mui/icons-material` — pulls in the entire MUI ecosystem, not appropriate here
- **Decision: `react-material-symbols`** — zero per-icon imports, single component API, consistent with how the admin layout already uses Material Symbols font (just replaces the manual font loading + `<span>` approach with a proper React component)

**CSS already in `app.css`:**
```css
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```
The `react-material-symbols/rounded` import handles its own CSS. Remove the manual `.material-symbols-outlined` rule from `app.css` after migration, or keep it harmlessly (it won't conflict).

---

## Architecture Patterns

### CSS Variable + Tailwind v4 Integration

**Critical finding from `app.css`:** The project uses a **dual-layer CSS variable system**:

1. **Tailwind `@theme` layer** — `--color-brand-*` variables registered as Tailwind color tokens. These ARE available as standard Tailwind utilities: `bg-brand-primary`, `text-brand-primary-text`, etc.

2. **`:root` / `.dark` layer** — `--portal-*` and `--brand-*` (without `color-` prefix) defined as raw CSS vars. These are NOT in `@theme`, so they need Tailwind arbitrary value syntax.

**Tailwind v4 syntax for the portal vars (Option A confirmed):**
```tsx
// Backgrounds
className="bg-[var(--portal-sidebar-bg)]"
className="bg-[var(--portal-topbar-bg)]"
className="bg-[var(--portal-bg)]"

// Text
className="text-[var(--portal-text-primary)]"
className="text-[var(--portal-nav-text)]"

// Borders
className="border-[var(--portal-card-border)]"

// Hover (Tailwind v4 fully supports arbitrary values with hover:)
className="hover:bg-[var(--portal-nav-hover-bg)]"
```

**Tailwind v4 shorthand `bg-(--var)` syntax** — This is available but only works reliably for vars registered in `@theme`. For raw `:root` vars like `--portal-*`, the `bg-[var(--portal-*)]` form is safer and more explicit. **Use the explicit `var()` form throughout.**

**Brand colors in `@theme` — use as standard Tailwind:**
```tsx
// These ARE registered in @theme as --color-brand-*:
className="bg-brand-primary-container"  // #4f46e5
className="text-brand-primary-text"     // #c3c0ff
className="text-brand-error"            // #ffb4ab
```

### Nav Item Active State Pattern

```tsx
// Conditional className — no style={{}} props
const navLinkClass = (isActive: boolean) =>
    isActive
        ? 'bg-[var(--portal-nav-active-bg)] text-[var(--portal-nav-active-text)] border-r-2 border-[var(--portal-nav-active-border)] font-bold'
        : 'text-[var(--portal-nav-text)] hover:bg-[var(--portal-nav-hover-bg)]';
```

### Avatar Pattern (pure Tailwind)

```tsx
function getInitials(name: string) {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function UserAvatar({ user }: { user: User }) {
    return (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 text-white bg-gradient-to-br from-indigo-500 to-violet-600 ring-2 ring-white/20">
            {getInitials(user.name)}
        </div>
    );
}
```
Replaces: inline `linear-gradient` style, `ui-avatars.com` external image, and the `size` prop variant.

### Mobile Drawer Pattern (unified)

```tsx
// State
const [mobileOpen, setMobileOpen] = useState(false);

// Overlay
{mobileOpen && (
    <div
        className="md:hidden fixed inset-0 z-40 bg-black/60"
        onClick={() => setMobileOpen(false)}
    />
)}

// Drawer
<aside className={`md:hidden fixed left-0 top-0 h-screen flex flex-col py-6 z-50 transition-transform duration-300 w-[280px] bg-[var(--portal-sidebar-bg)] border-r border-[var(--portal-card-border)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    {sidebarContent}
</aside>
```

Key: use Tailwind `translate-x-0` / `-translate-x-full` instead of inline `transform: translateX()` style. `bg-black/60` for overlay instead of `rgba(0,0,0,0.6)` style.

### Topbar Structure (all portals)
```tsx
<header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-[var(--portal-topbar-bg)] backdrop-blur-xl border-b border-[var(--portal-card-border)]">
    {/* Left */}
    <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-full text-[var(--portal-text-secondary)]" onClick={...}>
            <MaterialSymbol icon={mobileOpen ? 'close' : 'menu'} size={24} />
        </button>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm">
            <span className="text-[var(--portal-text-muted)]">{portalLabel} /</span>
            <span className="font-semibold text-[var(--portal-text-primary)]">{pageLabel}</span>
        </nav>
    </div>
    {/* Right */}
    <div className="flex items-center gap-2">
        <ThemeDropdown />
        <button className="p-2 rounded-full text-[var(--portal-text-secondary)] hover:text-[var(--portal-text-primary)]">
            <MaterialSymbol icon="notifications" size={20} />
        </button>
        {user && <UserAvatar user={user} />}
    </div>
</header>
```

### Data-Driven NavItem Pattern
```tsx
type NavItem = {
    title: string;
    href: string;
    icon: string; // MaterialSymbol icon name string
    matchPrefix: string;
};

// Inside component body (access to Wayfinder route fns):
const navItems: NavItem[] = [
    { title: 'Dashboard', href: adminDashboard.url(), icon: 'dashboard', matchPrefix: '/admin/dashboard' },
    { title: 'Exams', href: examsIndex.url(), icon: 'quiz', matchPrefix: '/admin/exams' },
    // ...
];
```

---

## Don't Hand-Roll

- **Icon rendering** — Don't write custom SVG components. Don't use `<span className="material-symbols-outlined">`. Use `<MaterialSymbol icon="name" size={N} />` from `react-material-symbols`.
- **Mobile drawer** — Don't use shadcn `Sheet` for this. Don't use Radix Dialog. The custom `useState` + CSS transition drawer is correct, lightweight, and already proven in student/admin layouts.
- **Theme switching** — Don't implement theme toggle logic in layouts. `ThemeDropdown` is the shared component for this — import and use it as-is.
- **Gradient avatar** — Don't use `ui-avatars.com` (external dependency, privacy issue, network latency). Use the initials gradient component.
- **Hardcoded colors** — Don't use hex values or `rgb()` in `style={{}}` or `className`. All colors come from CSS variables or Tailwind `@theme` tokens.
- **`onMouseEnter`/`onMouseLeave` for hover** — Don't use JS hover handlers. Use Tailwind `hover:` utilities instead.

---

## Common Pitfalls

### 1. `react-material-symbols` CSS import placement
The `import 'react-material-symbols/rounded'` must be in the **root app file** (`resources/js/app.tsx`), not in individual layout files. If placed in a layout, the font loads multiple times or flashes on navigation. Add it once, globally.

### 2. Tailwind v4 arbitrary values with `backdrop-blur`
```tsx
// WRONG — backdrop-filter doesn't accept var() in all browsers without the Tailwind class
style={{ backdropFilter: 'blur(20px)' }}

// CORRECT — use Tailwind utility
className="backdrop-blur-xl"
```
`backdrop-blur-xl` = `backdrop-filter: blur(24px)` in Tailwind v4. Already works perfectly.

### 3. `WebkitBackdropFilter` — not needed
Tailwind's `backdrop-blur-*` utilities automatically include the `-webkit-` prefixed version via PostCSS/autoprefixer. Remove manual `WebkitBackdropFilter` style props.

### 4. Super Admin `Sheet` removal
When removing the shadcn `Sheet` from `super-admin-layout.tsx`, also remove the floating `<button>` with `fixed left-4 top-4 z-50` — the hamburger button moves into the topbar (same as student/admin patterns).

### 5. Tailwind v4 `@custom-variant dark`
`app.css` defines `@custom-variant dark (&:is(.dark *))` — this means dark mode activates when a `.dark` class exists on a parent. Tailwind's `dark:` utilities work via this variant. However, **the `--portal-*` CSS vars handle dark mode natively** (they're defined in `:root` and `.dark` blocks). So for portal shell components, `dark:` Tailwind variants are redundant — the CSS vars already switch values. Do NOT add `dark:` classes to layout files for portal shell colors.

### 6. `NavItem` type — icon as string, not component
Use `icon: string` (the Material Symbol name) in the `NavItem` type, not `icon: React.ComponentType`. The `MaterialSymbol` component takes an `icon` string prop — this keeps the array definition clean without JSX and avoids import-per-icon overhead.

### 7. Super Admin breakpoint: `lg:` → `md:`
Current super-admin uses `lg:` (1024px) for sidebar visibility. Student and admin use `md:` (768px). Unify to `md:`. Check `super-admin-layout.tsx` for all `lg:` occurrences and replace with `md:`.

---

## Code Examples

### Full NavItem render loop
```tsx
{navItems.map((item) => {
    const isActive = url.startsWith(item.matchPrefix);
    return (
        <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-xs font-medium tracking-wide ${
                isActive
                    ? 'bg-[var(--portal-nav-active-bg)] text-[var(--portal-nav-active-text)] border-r-2 border-[var(--portal-nav-active-border)] font-bold'
                    : 'text-[var(--portal-nav-text)] hover:bg-[var(--portal-nav-hover-bg)]'
            }`}
        >
            <MaterialSymbol icon={item.icon} size={20} />
            <span>{item.title}</span>
        </Link>
    );
})}
```

### Sidebar wrapper (desktop + mobile)
```tsx
// Desktop
<aside className="hidden md:flex fixed left-0 top-0 h-screen w-[280px] flex-col py-6 z-50 bg-[var(--portal-sidebar-bg)] border-r border-[var(--portal-card-border)]">
    {sidebarContent}
</aside>

// Mobile overlay
{mobileOpen && (
    <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
)}

// Mobile drawer
<aside className={`md:hidden fixed left-0 top-0 h-screen w-[280px] flex flex-col py-6 z-50 transition-transform duration-300 bg-[var(--portal-sidebar-bg)] border-r border-[var(--portal-card-border)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    {sidebarContent}
</aside>

// Main content offset
<div className="md:ml-[280px] flex flex-col min-h-screen">
```

### Logout link (Inertia POST)
```tsx
<Link
    href={logout()}
    method="post"
    as="button"
    className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-xs font-medium text-brand-error hover:bg-red-500/10"
>
    <MaterialSymbol icon="logout" size={20} />
    <span>Logout</span>
</Link>
```
Note: `text-brand-error` works because `--color-brand-error` is registered in `@theme`. `hover:bg-red-500/10` is standard Tailwind.

---

## Installation Steps

1. Install package:
   ```bash
   npm install react-material-symbols
   ```

2. Add CSS import to `resources/js/app.tsx`:
   ```tsx
   import 'react-material-symbols/rounded';
   ```

3. Remove from `resources/css/app.css`:
   ```css
   /* DELETE this rule after migration: */
   .material-symbols-outlined {
       font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
   }
   ```
   (Only after all `<span className="material-symbols-outlined">` usages are removed from all files)

4. Remove Google Fonts Material Symbols link from Blade template (if present — check `resources/views/app.blade.php`).

---

## Files to Modify

| File | Change |
|------|--------|
| `resources/js/app.tsx` | Add `import 'react-material-symbols/rounded'` |
| `resources/js/layouts/student-layout.tsx` | Replace custom SVG components with `MaterialSymbol`, move all `style={{}}` to Tailwind classes |
| `resources/js/layouts/admin-layout.tsx` | Replace `<span className="material-symbols-outlined">` with `MaterialSymbol`, move all `style={{}}` to Tailwind classes |
| `resources/js/layouts/super-admin-layout.tsx` | Replace Lucide icons with `MaterialSymbol`, migrate `dark:` classes to CSS var Tailwind, unify mobile drawer, unify breakpoint `lg:` → `md:`, drop `Sheet` |
| `resources/css/app.css` | Remove `.material-symbols-outlined` rule (after all usages removed) |
| `resources/views/app.blade.php` | Remove Google Fonts Material Symbols `<link>` tag if present |
| `package.json` | `react-material-symbols` added as dependency |

## RESEARCH COMPLETE
