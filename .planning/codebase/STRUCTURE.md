# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```
ai-education-studio-backend/
├── app/            # Application code (Controllers, Models, Actions)
├── bootstrap/      # Framework startup scripts
├── config/         # Configuration files
├── database/       # Migrations, factories, seeders
├── public/         # Web server root, compiled assets
├── resources/      # Frontend assets (React, CSS, views)
├── routes/         # Route definitions
├── storage/        # Logs, compiled templates, file uploads
└── tests/          # Automated tests
```

## Directory Purposes

**`app/`:**
- Purpose: Contains the core logic of the application.
- Contains: PHP classes, controllers, models, actions, middleware, and providers.
- Key files: `app/Http/Controllers/Controller.php`, `app/Models/User.php`.

**`resources/js/`:**
- Purpose: Houses the frontend React application and its components.
- Contains: React components, pages, layouts, hooks, and types.
- Key files: `resources/js/app.tsx`, `resources/js/pages/`, `resources/js/components/`.

**`routes/`:**
- Purpose: Defines all application endpoints.
- Contains: Web routes, API routes, and console commands.
- Key files: `routes/web.php`, `routes/settings.php`, `routes/console.php`.

**`database/`:**
- Purpose: Manages the database schema and initial data.
- Contains: Migrations, factories, and seeders.
- Key files: `database/migrations/`, `database/seeders/DatabaseSeeder.php`.

## Key File Locations

**Entry Points:**
- `public/index.php`: The main entry point for all HTTP requests to the Laravel application.
- `resources/js/app.tsx`: The main entry point for the frontend React application.

**Configuration:**
- `config/app.php`: Global application configuration.
- `config/fortify.php`: Configuration for the headless authentication backend.
- `vite.config.ts`: Configuration for the Vite build tool.
- `tailwind.config.js` (or inline in CSS): Configuration for Tailwind CSS v4.

**Core Logic:**
- `app/Http/Controllers/`: Where request handling logic resides.
- `app/Actions/`: Where reusable business logic (e.g., Fortify actions) is placed.

**Testing:**
- `tests/Feature/`: Feature tests for application endpoints.
- `tests/Unit/`: Unit tests for isolated classes.

## Naming Conventions

**Files:**
- PHP Classes: `PascalCase.php` (e.g., `UserController.php`).
- React Components: `kebab-case.tsx` or `kebab-case.ts` (e.g., `app-layout.tsx`, `use-appearance.ts`).

**Directories:**
- PHP Namespaces: `PascalCase` (e.g., `app/Http/Controllers/`).
- Frontend Folders: `kebab-case` (e.g., `resources/js/components/ui/`).

## Where to Add New Code

**New Feature:**
- Primary code: Create a new controller in `app/Http/Controllers/` and define routes in `routes/web.php`.
- Tests: Create a new feature test in `tests/Feature/`.

**New Component/Module:**
- Implementation: Add React components to `resources/js/components/` or pages to `resources/js/pages/`.

**Utilities:**
- Shared helpers: Add PHP helpers to `app/Support/` or JavaScript helpers to `resources/js/lib/`.

## Special Directories

**`resources/js/wayfinder/`:**
- Purpose: Contains auto-generated TypeScript definitions for Laravel routes.
- Generated: Yes (via `php artisan wayfinder:generate`).
- Committed: Yes.

**`resources/js/components/ui/`:**
- Purpose: Contains reusable Radix UI components styled with Tailwind CSS.
- Generated: No.
- Committed: Yes.

---

*Structure analysis: 2026-04-12*