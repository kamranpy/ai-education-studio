# Phase 1: Foundation & Multi-Tenancy - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 1-Foundation & Multi-Tenancy
**Areas discussed:** Multi-Tenancy Architecture, Tenant Routing Strategy, Registration Flow, Layout Structure

---

## Multi-Tenancy Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Single DB with `tenant_id` | Global Scopes vs Separate databases per tenant? | ✓ |

**User's choice:** single db
**Notes:** Decided to use the typical single DB setup which is much easier to manage for buyers and SaaS products.

---

## Tenant Routing Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Invisible/Inferred | Tenant inferred largely by logged-in user | ✓ |

**User's choice:** go with recommended approach
**Notes:** Chosen over subdomains or path-based strategies.

---

## Registration Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Open self-registration | Open self-registration for new Institutes vs Super Admin invite only? | ✓ |

**User's choice:** open self registration with support access to super admin
**Notes:** Explicitly demanded "support access to super admin" alongside open registration.

---

## Layout Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Distinct layouts per role | Shared React layout with conditional sidebar vs Completely distinct layouts per role? | ✓ |

**User's choice:** each role will have their own layout, use shadcn ui as preference.
**Notes:** Chose distinct layouts and specified the use of shadcn ui.

---
