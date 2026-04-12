# Architecture

**Analysis Date:** 2026-04-12

## Pattern Overview

**Overall:** Monolithic MVC with Inertia.js (React) Frontend

**Key Characteristics:**
- Backend-driven routing and business logic (Laravel 13)
- Client-side rendering and state management via React and Inertia.js
- Typed routing between frontend and backend using Laravel Wayfinder
- Headless authentication handled by Laravel Fortify
- Utility-first CSS styling with Tailwind CSS v4 and Radix UI components

## Layers

**Frontend (React + Inertia):**
- Purpose: Renders UI, handles client-side interactions, and manages local state.
- Location: `resources/js/`
- Contains: React components, pages, layouts, hooks, and Wayfinder route definitions.
- Depends on: Inertia.js for page visits, Radix UI for accessible components, Tailwind CSS for styling.
- Used by: Laravel views (via Vite integration).

**Backend Controllers (Laravel):**
- Purpose: Handles HTTP requests, enforces authorization, and returns Inertia responses or JSON.
- Location: `app/Http/Controllers/`
- Contains: Controller classes and form requests.
- Depends on: Eloquent Models, Fortify Actions, and Laravel services.
- Used by: Defined routes in `routes/web.php` and `routes/settings.php`.

**Business Logic & Actions:**
- Purpose: Encapsulates reusable business operations (e.g., authentication flows).
- Location: `app/Actions/` (e.g., `app/Actions/Fortify/`)
- Contains: Single-responsibility action classes.
- Depends on: Models and database services.
- Used by: Controllers and Fortify service provider.

**Data Access (Eloquent ORM):**
- Purpose: Manages database interactions and entity relationships.
- Location: `app/Models/`
- Contains: Eloquent model classes.
- Depends on: Laravel Database component.
- Used by: Controllers, Actions, and background jobs.

## Data Flow

**Inertia Page Visit Flow:**

1. User navigates to a URL or clicks an Inertia `<Link>` in the React frontend.
2. Laravel router (`routes/web.php`) intercepts the request and directs it to a Controller.
3. Controller fetches data using Eloquent Models and returns an `Inertia::render('PageName', $data)` response.
4. Inertia.js on the client receives the JSON payload and seamlessly swaps the React page component (`resources/js/pages/`) without a full page reload.

**State Management:**
- Global state is minimal; server-side state is passed down as props via Inertia.
- Local UI state is managed using React hooks (`useState`, `useReducer`).
- Theme/Appearance state is managed via custom hooks (`resources/js/hooks/use-appearance.tsx`).

## Key Abstractions

**Wayfinder Routes:**
- Purpose: Provides strongly-typed, auto-generated route helpers for the frontend to call backend endpoints.
- Examples: `resources/js/wayfinder/`
- Pattern: Auto-generated TypeScript definitions based on Laravel routes.

**Fortify Authentication:**
- Purpose: Headless authentication backend that registers routes and controllers automatically.
- Examples: `app/Actions/Fortify/`
- Pattern: Action classes injected into Fortify's pipeline.

## Entry Points

**Web Application:**
- Location: `public/index.php` -> `bootstrap/app.php`
- Triggers: All incoming HTTP requests.
- Responsibilities: Bootstraps the Laravel framework, processes middleware, and dispatches the request to the router.

**Frontend Application:**
- Location: `resources/js/app.tsx`
- Triggers: Loaded by the browser via Vite script tags in the root Blade template.
- Responsibilities: Initializes the Inertia app, sets up the React root, configures layouts, and applies the theme.

## Error Handling

**Strategy:** Centralized Laravel exception handling with Inertia error sharing.

**Patterns:**
- Backend validation errors are automatically flashed to the session and passed to the Inertia frontend as `errors` props.
- Global exceptions are handled by Laravel's default exception handler (`bootstrap/app.php`).
- Frontend components display validation errors inline (e.g., below form inputs).

## Cross-Cutting Concerns

**Logging:** Handled by Laravel's Log facade, writing to `storage/logs/laravel.log`.
**Validation:** Performed via Laravel Form Requests (`app/Http/Requests/`) or inline in controllers.
**Authentication:** Managed by Laravel Fortify with session-based guards. Middleware (`auth`, `verified`) protects routes in `routes/web.php`.

---

*Architecture analysis: 2026-04-12*