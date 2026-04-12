<!-- GSD:project-start source:PROJECT.md -->
## Project

**AI Education Studio**

A production-grade AI-powered exam platform (SaaS) for educational institutes. It enables institutes to create and manage exams, evaluate student performance, and automate grading (partially with AI). It is designed to be sold on marketplaces (like CodeCanyon), allowing buyers to host it and monetize via a pay-per-exam model.

**Core Value:** A reliable digital assessment platform with AI-assisted evaluation that focuses on conceptual understanding rather than exact wording.

### Constraints

- **Architecture**: Must be multi-tenant from day one to support the SaaS model.
- **AI Integration**: Must be provider-agnostic/configurable so buyers can use their preferred LLM (OpenAI, Anthropic, etc.).
- **Reliability**: Exam submission must be robust, hence the choice of asynchronous AI grading and auto-save functionality.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- PHP ^8.3 - Backend logic, APIs, and controllers
- TypeScript ^5.7.2 - Frontend components and logic
- JavaScript (ESNext) - Build configuration and tooling
## Runtime
- PHP ^8.3
- Node.js (types: ^22.13.5)
- Composer (PHP)
- npm (Node.js)
- Lockfile: Not explicitly verified, but typically `composer.lock` and `package-lock.json`
## Frameworks
- Laravel ^13.0 - Backend framework
- React ^19.2.0 - Frontend UI library
- Inertia.js ^3.0.0 - Monolith SPA routing and data binding
- Tailwind CSS ^4.0.0 - Utility-first CSS framework
- PHPUnit ^12.5.12 - Backend testing framework
- Vite ^8.0.0 - Frontend bundler
- Laravel Pint ^1.27 - PHP code style fixer
- ESLint ^9.17.0 - JavaScript/TypeScript linting
- Prettier ^3.4.2 - Code formatting
## Key Dependencies
- `laravel/fortify` (^1.34) - Headless authentication backend
- `laravel/wayfinder` (^0.1.14) - Auto-generates typed functions for Laravel controllers and routes
- `@radix-ui/react-*` - Unstyled, accessible UI components (dialogs, menus, forms, etc.)
- `lucide-react` (^0.475.0) - Icon library
- `zod` - TypeScript-first schema validation
- `laravel/sail` (^1.53) - Docker development environment
- `laravel/tinker` (^3.0) - Interactive REPL
## Configuration
- Configured via `.env` file (copied from `.env.example`)
- Key configs required: `APP_KEY`, `DB_CONNECTION`
- `vite.config.ts` - Vite configuration with React, Inertia, Tailwind, and Wayfinder plugins
- `tsconfig.json` - TypeScript configuration (strict mode, ESNext, path aliases `@/*`)
- `eslint.config.js` - ESLint configuration
## Platform Requirements
- PHP 8.3+
- Node.js
- Composer
- Standard PHP/Node.js hosting environment
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- PHP files: PascalCase (e.g., `app/Http/Controllers/Settings/ProfileController.php`)
- React components: kebab-case (e.g., `resources/js/components/app-header.tsx`)
- React actions/utilities: kebab-case or index.ts (e.g., `resources/js/actions/App/index.ts`)
- PHP functions: camelCase (e.g., `public function edit(Request $request)`)
- React components: PascalCase (e.g., `export function AppHeader()`)
- React hooks/helpers: camelCase (e.g., `useCurrentUrl()`)
- PHP variables: camelCase with `$` prefix (e.g., `$request`)
- JS/TS variables: camelCase (e.g., `mainNavItems`)
- TypeScript types/interfaces: PascalCase (e.g., `type Props = {}`)
## Code Style
- Prettier is used for JS/TS/CSS formatting.
- Key settings in `.prettierrc`: `semi: true`, `singleQuote: true`, `printWidth: 80`, `tabWidth: 4`.
- Tailwind plugin `prettier-plugin-tailwindcss` is active.
- Laravel Pint is used for PHP formatting (`pint.json` uses `laravel` preset).
- ESLint 9 (Flat Config) is used for JS/TS.
- Key rules in `eslint.config.js`:
## Import Organization
- `@/` is used for `resources/js/` (e.g., `import AppLogo from '@/components/app-logo';`)
## Error Handling
- PHP: Standard Laravel exception handling and form requests (e.g., `ProfileUpdateRequest`).
- React: Inertia.js error handling and flash messages (e.g., `Inertia::flash('toast', ...)`).
## Logging
- Standard Laravel logging patterns for backend.
## Comments
- DocBlocks are used for PHP methods (e.g., `/** Update the user's profile information. */`).
- Minimal usage in React components, mostly self-documenting code.
## Function Design
- PHP: Dependency injection and Form Requests (e.g., `public function update(ProfileUpdateRequest $request)`).
- React: Destructured props object (e.g., `export function AppHeader({ breadcrumbs = [] }: Props)`).
- PHP: Typed return values (e.g., `: RedirectResponse`, `: Response`).
- React: JSX Elements.
## Module Design
- React components use named exports (e.g., `export function AppHeader`).
- Types are exported using `export type`.
- Used extensively in `resources/js/actions/` (e.g., `resources/js/actions/App/index.ts`).
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Backend-driven routing and business logic (Laravel 13)
- Client-side rendering and state management via React and Inertia.js
- Typed routing between frontend and backend using Laravel Wayfinder
- Headless authentication handled by Laravel Fortify
- Utility-first CSS styling with Tailwind CSS v4 and Radix UI components
## Layers
- Purpose: Renders UI, handles client-side interactions, and manages local state.
- Location: `resources/js/`
- Contains: React components, pages, layouts, hooks, and Wayfinder route definitions.
- Depends on: Inertia.js for page visits, Radix UI for accessible components, Tailwind CSS for styling.
- Used by: Laravel views (via Vite integration).
- Purpose: Handles HTTP requests, enforces authorization, and returns Inertia responses or JSON.
- Location: `app/Http/Controllers/`
- Contains: Controller classes and form requests.
- Depends on: Eloquent Models, Fortify Actions, and Laravel services.
- Used by: Defined routes in `routes/web.php` and `routes/settings.php`.
- Purpose: Encapsulates reusable business operations (e.g., authentication flows).
- Location: `app/Actions/` (e.g., `app/Actions/Fortify/`)
- Contains: Single-responsibility action classes.
- Depends on: Models and database services.
- Used by: Controllers and Fortify service provider.
- Purpose: Manages database interactions and entity relationships.
- Location: `app/Models/`
- Contains: Eloquent model classes.
- Depends on: Laravel Database component.
- Used by: Controllers, Actions, and background jobs.
## Data Flow
- Global state is minimal; server-side state is passed down as props via Inertia.
- Local UI state is managed using React hooks (`useState`, `useReducer`).
- Theme/Appearance state is managed via custom hooks (`resources/js/hooks/use-appearance.tsx`).
## Key Abstractions
- Purpose: Provides strongly-typed, auto-generated route helpers for the frontend to call backend endpoints.
- Examples: `resources/js/wayfinder/`
- Pattern: Auto-generated TypeScript definitions based on Laravel routes.
- Purpose: Headless authentication backend that registers routes and controllers automatically.
- Examples: `app/Actions/Fortify/`
- Pattern: Action classes injected into Fortify's pipeline.
## Entry Points
- Location: `public/index.php` -> `bootstrap/app.php`
- Triggers: All incoming HTTP requests.
- Responsibilities: Bootstraps the Laravel framework, processes middleware, and dispatches the request to the router.
- Location: `resources/js/app.tsx`
- Triggers: Loaded by the browser via Vite script tags in the root Blade template.
- Responsibilities: Initializes the Inertia app, sets up the React root, configures layouts, and applies the theme.
## Error Handling
- Backend validation errors are automatically flashed to the session and passed to the Inertia frontend as `errors` props.
- Global exceptions are handled by Laravel's default exception handler (`bootstrap/app.php`).
- Frontend components display validation errors inline (e.g., below form inputs).
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| fortify-development | 'ACTIVATE when the user works on authentication in Laravel. This includes login, registration, password reset, email verification, two-factor authentication (2FA/TOTP/QR codes/recovery codes), profile updates, password confirmation, or any auth-related routes and controllers. Activate when the user mentions Fortify, auth, authentication, login, register, signup, forgot password, verify email, 2FA, or references app/Actions/Fortify/, CreateNewUser, UpdateUserProfileInformation, FortifyServiceProvider, config/fortify.php, or auth guards. Fortify is the frontend-agnostic authentication backend for Laravel that registers all auth routes and controllers. Also activate when building SPA or headless authentication, customizing login redirects, overriding response contracts like LoginResponse, or configuring login throttling. Do NOT activate for Laravel Passport (OAuth2 API tokens), Socialite (OAuth social login), or non-auth Laravel features.' | `.cursor/skills/fortify-development/SKILL.md` |
| inertia-react-development | "Develops Inertia.js v3 React client-side applications. Activates when creating React pages, forms, or navigation; using <Link>, <Form>, useForm, useHttp, setLayoutProps, or router; working with deferred props, prefetching, optimistic updates, instant visits, or polling; or when user mentions React with Inertia, React pages, React forms, or React navigation." | `.cursor/skills/inertia-react-development/SKILL.md` |
| laravel-best-practices | "Apply this skill whenever writing, reviewing, or refactoring Laravel PHP code. This includes creating or modifying controllers, models, migrations, form requests, policies, jobs, scheduled commands, service classes, and Eloquent queries. Triggers for N+1 and query performance issues, caching strategies, authorization and security patterns, validation, error handling, queue and job configuration, route definitions, and architectural decisions. Also use for Laravel code reviews and refactoring existing Laravel code to follow best practices. Covers any task involving Laravel backend PHP code patterns." | `.cursor/skills/laravel-best-practices/SKILL.md` |
| tailwindcss-development | "Always invoke when the user's message includes 'tailwind' in any form. Also invoke for: building responsive grid layouts (multi-column card grids, product grids), flex/grid page structures (dashboards with sidebars, fixed topbars, mobile-toggle navs), styling UI components (cards, tables, navbars, pricing sections, forms, inputs, badges), adding dark mode variants, fixing spacing or typography, and Tailwind v3/v4 work. The core use case: writing or fixing Tailwind utility classes in HTML templates (Blade, JSX, Vue). Skip for backend PHP logic, database queries, API routes, JavaScript with no HTML/CSS component, CSS file audits, build tool configuration, and vanilla CSS." | `.cursor/skills/tailwindcss-development/SKILL.md` |
| wayfinder-development | "Use this skill for Laravel Wayfinder which auto-generates typed functions for Laravel controllers and routes. ALWAYS use this skill when frontend code needs to call backend routes or controller actions. Trigger when: connecting any React/Vue/Svelte/Inertia frontend to Laravel controllers, routes, building end-to-end features with both frontend and backend, wiring up forms or links to backend endpoints, fixing route-related TypeScript errors, importing from @/actions or @/routes, or running wayfinder:generate. Use Wayfinder route functions instead of hardcoded URLs. Covers: wayfinder() vite plugin, .url()/.get()/.post()/.form(), query params, route model binding, tree-shaking. Do not use for backend-only task" | `.cursor/skills/wayfinder-development/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
