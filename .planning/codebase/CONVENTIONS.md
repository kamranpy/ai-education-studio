# Coding Conventions

**Analysis Date:** 2026-04-12

## Naming Patterns

**Files:**
- PHP files: PascalCase (e.g., `app/Http/Controllers/Settings/ProfileController.php`)
- React components: kebab-case (e.g., `resources/js/components/app-header.tsx`)
- React actions/utilities: kebab-case or index.ts (e.g., `resources/js/actions/App/index.ts`)

**Functions:**
- PHP functions: camelCase (e.g., `public function edit(Request $request)`)
- React components: PascalCase (e.g., `export function AppHeader()`)
- React hooks/helpers: camelCase (e.g., `useCurrentUrl()`)

**Variables:**
- PHP variables: camelCase with `$` prefix (e.g., `$request`)
- JS/TS variables: camelCase (e.g., `mainNavItems`)

**Types:**
- TypeScript types/interfaces: PascalCase (e.g., `type Props = {}`)

## Code Style

**Formatting:**
- Prettier is used for JS/TS/CSS formatting.
- Key settings in `.prettierrc`: `semi: true`, `singleQuote: true`, `printWidth: 80`, `tabWidth: 4`.
- Tailwind plugin `prettier-plugin-tailwindcss` is active.
- Laravel Pint is used for PHP formatting (`pint.json` uses `laravel` preset).

**Linting:**
- ESLint 9 (Flat Config) is used for JS/TS.
- Key rules in `eslint.config.js`:
  - `@typescript-eslint/consistent-type-imports` enforced
  - `import/order` enforced (builtin, external, internal, parent, sibling, index)
  - `@stylistic/padding-line-between-statements` enforced around control statements

## Import Organization

**Order:**
1. Built-in modules
2. External packages (e.g., `react`, `@inertiajs/react`)
3. Internal aliases (e.g., `@/components/...`)
4. Parent directories
5. Sibling files
6. Index files

**Path Aliases:**
- `@/` is used for `resources/js/` (e.g., `import AppLogo from '@/components/app-logo';`)

## Error Handling

**Patterns:**
- PHP: Standard Laravel exception handling and form requests (e.g., `ProfileUpdateRequest`).
- React: Inertia.js error handling and flash messages (e.g., `Inertia::flash('toast', ...)`).

## Logging

**Framework:** Laravel Log facade or `console` in JS.

**Patterns:**
- Standard Laravel logging patterns for backend.

## Comments

**When to Comment:**
- DocBlocks are used for PHP methods (e.g., `/** Update the user's profile information. */`).

**JSDoc/TSDoc:**
- Minimal usage in React components, mostly self-documenting code.

## Function Design

**Size:** Small, focused functions and controllers.

**Parameters:** 
- PHP: Dependency injection and Form Requests (e.g., `public function update(ProfileUpdateRequest $request)`).
- React: Destructured props object (e.g., `export function AppHeader({ breadcrumbs = [] }: Props)`).

**Return Values:** 
- PHP: Typed return values (e.g., `: RedirectResponse`, `: Response`).
- React: JSX Elements.

## Module Design

**Exports:** 
- React components use named exports (e.g., `export function AppHeader`).
- Types are exported using `export type`.

**Barrel Files:** 
- Used extensively in `resources/js/actions/` (e.g., `resources/js/actions/App/index.ts`).

---

*Convention analysis: 2026-04-12*