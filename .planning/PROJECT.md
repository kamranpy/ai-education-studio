# AI Education Studio

## What This Is

A production-grade AI-powered exam platform (SaaS) for educational institutes. It enables institutes to create and manage exams, evaluate student performance, and automate grading (partially with AI). It is designed to be sold on marketplaces (like CodeCanyon), allowing buyers to host it and monetize via a pay-per-exam model.

## Core Value

A reliable digital assessment platform with AI-assisted evaluation that focuses on conceptual understanding rather than exact wording.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Multi-tenant architecture supporting multiple institutes from day one — Phase 1
- ✓ Role-based access control (Super Admin, Institute Admin, Student) — Phase 1

### Active

<!-- Current scope. Building toward these. -->
- [ ] Exam creation with Multiple Choice, True/False, and Written answer types
- [ ] Student exam experience with auto-save, countdown timers, resume capability, and question randomization
- [ ] Basic anti-cheat tracking (logging when students leave the tab/window)
- [ ] Asynchronous/batch AI evaluation of written answers (scoring based on concept, logic, and terminology)
- [ ] AI evaluation returns score, confidence level, and explanation
- [ ] Optional teacher override for AI-generated grades
- [ ] Dynamic AI model configuration via the admin panel (allowing buyers to set their own API keys)
- [ ] Pay-per-exam monetization system (institutes buy credits or pay per student/exam)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Strict lockdown proctoring (e.g., secure browser) — v1 relies on basic tracking to reduce friction and complexity.
- Synchronous/Instant AI evaluation — Deferred to ensure reliability and avoid timeouts during exam submission.
- Mobile app — Web-first SaaS for v1; mobile support is planned for the future.

## Context

- **Target Audience:** Schools (K-12), Universities, Corporate training platforms.
- **Market Strategy:** The platform will be sold as a script on a marketplace. The buyer will host it and charge institutes.
- **Tech Stack:** Backend-driven (Laravel) with a React frontend via Inertia.js.

## Constraints

- **Architecture**: Must be multi-tenant from day one to support the SaaS model.
- **AI Integration**: Must be provider-agnostic/configurable so buyers can use their preferred LLM (OpenAI, Anthropic, etc.).
- **Reliability**: Exam submission must be robust, hence the choice of asynchronous AI grading and auto-save functionality.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Multi-tenant v1 | Required for the SaaS marketplace business model | ✓ Good |
| Single-DB tenancy via global scope | Simpler than schema-per-tenant, works on shared hosting | ✓ Good |
| Separate roles table with FK | Extensible over string column; supports future role management UI | ✓ Good |
| UUID primary key for users | Prevents ID enumeration, safer for API exposure, globally unique | ✓ Good |
| Async AI Evaluation | Prevents user-facing timeouts and ensures reliable exam submission | — Pending |
| Optional Human Override | Builds trust in AI grading by keeping teachers in control | — Pending |
| Basic Anti-Cheat | Lowers barrier to entry and technical complexity for v1 | — Pending |
| Pay-Per-Exam Billing | Aligns platform costs (AI tokens) with revenue | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 after UUID primary key migration for users*
