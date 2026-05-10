# Phase 1: Foundation & Multi-Tenancy - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Establishing the core multi-tenant data architecture, primary authentication flows, and initial role-based access structure (Super Admin, Institute Admin, Student).

</domain>

<decisions>
## Implementation Decisions

### Multi-Tenancy Architecture
- **D-01:** Use a single database with a `tenant_id` column (Global Scopes). This is easier for marketplace buyers to self-host and maintain without complex multi-database setups.

### Tenant Routing Strategy
- **D-02:** Use an "Invisible/Inferred" routing strategy. The tenant context will be determined by the logged-in user rather than relying on subdomains or paths, ensuring stability for self-hosted installations lacking wildcard DNS.

### Registration Flow
- **D-03:** Open self-registration for new Institute admins to reduce onboarding friction, but Super Admins will maintain "support access" into their environment (e.g. impersonation or direct scope bypass).

### Layout Structure
- **D-04:** Each role (Super Admin, Institute Admin, Student) will have completely distinct React layouts to prevent bloated logic, avoiding shared sidebars.
- **D-05:** Use `shadcn/ui` components as the primary UI library preference.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Core phase 1 requirements (TENT-01 to TENT-03, AUTH-01 to AUTH-04)
- `.planning/PROJECT.md` — Core value and architectural constraints

### Codebase and Tooling
- `.planning/codebase/ARCHITECTURE.md` — Architecture patterns, routing, and UI paradigms
- `.planning/codebase/STACK.md` — Laravel 13, React/Inertia, Fortify, and Tailwind configuration

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Laravel Fortify`: Use for headless authentication backend configuration.
- `Laravel Wayfinder`: Use for typed routing between frontend and backend.
- `shadcn/ui` (accessible through Radix UI and Tailwind CSS): Use for component construction.

### Established Patterns
- Server-side state passed as Inertia props structure.
- Global scope for Eloquent models enforcing single-DB multi-tenancy based on user roles.

</code_context>

<specifics>
## Specific Ideas

- Open registration flow should seamlessly capture the first user as the Institute Admin and set up their isolated tenant environment.
- Implement a "support access" capability allowing the Super Admin to oversee or view institute dashboards.
- Use `shadcn/ui` explicitly for building the separate layouts and componentry.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation-multi-tenancy*
*Context gathered: 2026-04-12*
