# Codebase Concerns

**Analysis Date:** 2026-04-12

## Tech Debt

**Frontend UI Components:**
- Issue: Heavy reliance on utility libraries (`class-variance-authority`, `clsx`, `tailwind-merge`) for component styling.
- Files: `resources/js/components/ui/`
- Impact: Can lead to verbose component definitions and harder-to-read code if not abstracted properly.
- Fix approach: Ensure consistent patterns for component variants and avoid inline complex logic.

## Known Bugs

**Not detected**
- Symptoms: N/A
- Files: N/A
- Trigger: N/A
- Workaround: N/A

## Security Considerations

**Not detected**
- Risk: N/A
- Files: N/A
- Current mitigation: N/A
- Recommendations: N/A

## Performance Bottlenecks

**Frontend Build & SSR:**
- Problem: SSR build process might be slow or resource-intensive as the application grows.
- Files: `package.json`, `vite.config.ts`
- Cause: React Compiler and Vite SSR setup.
- Improvement path: Monitor build times and consider code-splitting or lazy loading for larger routes.

## Fragile Areas

**Wayfinder Route Generation:**
- Files: `resources/js/wayfinder/index.ts`, `resources/js/routes/`
- Why fragile: Frontend routes are tightly coupled to backend controllers via Wayfinder. Changes in backend controller names or namespaces will break frontend imports.
- Safe modification: Always run `php artisan wayfinder:generate` (or equivalent) after modifying backend routes/controllers.
- Test coverage: Frontend route generation is not explicitly tested.

## Scaling Limits

**Not detected**
- Current capacity: N/A
- Limit: N/A
- Scaling path: N/A

## Dependencies at Risk

**Not detected**
- Risk: N/A
- Impact: N/A
- Migration plan: N/A

## Missing Critical Features

**Core Business Logic:**
- Problem: The application is currently just a starter kit (Auth + Settings). It lacks the actual "AI Education Studio" features.
- Blocks: End-user value delivery.

## Test Coverage Gaps

**Frontend Testing:**
- What's not tested: React components, hooks, and Inertia pages.
- Files: `resources/js/**/*.tsx`, `resources/js/**/*.ts`
- Risk: UI regressions, broken interactions, and state management bugs could go unnoticed.
- Priority: High. Need to introduce Vitest/Jest for unit tests and Playwright/Cypress for E2E tests.
