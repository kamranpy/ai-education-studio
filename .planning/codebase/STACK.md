# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- PHP ^8.3 - Backend logic, APIs, and controllers
- TypeScript ^5.7.2 - Frontend components and logic
- JavaScript (ESNext) - Build configuration and tooling

## Runtime

**Environment:**
- PHP ^8.3
- Node.js (types: ^22.13.5)

**Package Manager:**
- Composer (PHP)
- npm (Node.js)
- Lockfile: Not explicitly verified, but typically `composer.lock` and `package-lock.json`

## Frameworks

**Core:**
- Laravel ^13.0 - Backend framework
- React ^19.2.0 - Frontend UI library
- Inertia.js ^3.0.0 - Monolith SPA routing and data binding
- Tailwind CSS ^4.0.0 - Utility-first CSS framework

**Testing:**
- PHPUnit ^12.5.12 - Backend testing framework

**Build/Dev:**
- Vite ^8.0.0 - Frontend bundler
- Laravel Pint ^1.27 - PHP code style fixer
- ESLint ^9.17.0 - JavaScript/TypeScript linting
- Prettier ^3.4.2 - Code formatting

## Key Dependencies

**Critical:**
- `laravel/fortify` (^1.34) - Headless authentication backend
- `laravel/wayfinder` (^0.1.14) - Auto-generates typed functions for Laravel controllers and routes
- `@radix-ui/react-*` - Unstyled, accessible UI components (dialogs, menus, forms, etc.)
- `lucide-react` (^0.475.0) - Icon library
- `zod` - TypeScript-first schema validation

**Infrastructure:**
- `laravel/sail` (^1.53) - Docker development environment
- `laravel/tinker` (^3.0) - Interactive REPL

## Configuration

**Environment:**
- Configured via `.env` file (copied from `.env.example`)
- Key configs required: `APP_KEY`, `DB_CONNECTION`

**Build:**
- `vite.config.ts` - Vite configuration with React, Inertia, Tailwind, and Wayfinder plugins
- `tsconfig.json` - TypeScript configuration (strict mode, ESNext, path aliases `@/*`)
- `eslint.config.js` - ESLint configuration

## Platform Requirements

**Development:**
- PHP 8.3+
- Node.js
- Composer

**Production:**
- Standard PHP/Node.js hosting environment

---

*Stack analysis: 2026-04-12*