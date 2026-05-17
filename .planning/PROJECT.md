# AI Education Studio

## Current State

**v2.0 UI Revamp — shipped 2026-05-17**

Full UI redesign complete across all surfaces. The platform now has a polished, branded design on the public homepage, auth pages, and all three role portals (Student, Admin, Super Admin), with a unified layout shell and consistent design system.

**Next Milestone:** v3.0 — Feature Expansion (analytics, question banks, exports, OAuth)

<details>
<summary>v2.0 Milestone Goal (archived)</summary>

Replace the entire UI with a polished, brand-new design across all surfaces — homepage, auth pages, and all three role portals.

**Shipped features:**
- Public branded homepage with hero, features, pricing, testimonials, FAQ
- Custom login, register, and all auth pages
- Student portal — full redesign (layout + all pages)
- Institute Admin portal — full redesign (layout + all pages)
- Super Admin portal — full redesign (layout + all pages)
- Unified layout shell (sidebar/navbar) across all portals

</details>



A production-grade AI-powered exam platform (SaaS) for educational institutes. It enables institutes to create and manage exams, evaluate student performance, and automate grading (partially with AI). It is designed to be sold on marketplaces (like CodeCanyon), allowing buyers to host it and monetize via a pay-per-exam model.

## Core Value

A reliable digital assessment platform with AI-assisted evaluation that focuses on conceptual understanding rather than exact wording.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Multi-tenant architecture supporting multiple institutes from day one — v1.0
- ✓ Role-based access control (Super Admin, Institute Admin, Student) — v1.0
- ✓ Exam creation with Multiple Choice, True/False, and Written answer types — v1.0
- ✓ Student exam experience with auto-save, countdown timers, resume capability, and question randomization — v1.0
- ✓ Basic anti-cheat tracking (logging when students leave the tab/window) — v1.0
- ✓ Asynchronous AI evaluation of written answers (scoring based on concept, logic, and terminology) — v1.0
- ✓ AI evaluation returns score, confidence level, and explanation — v1.0
- ✓ Optional teacher override for AI-generated grades — v1.0
- ✓ Dynamic AI model configuration via the admin panel (provider-agnostic: OpenAI, Anthropic, Google, OpenAI-compatible) — v1.0
- ✓ Pay-per-exam monetization system (institutes buy credits, deducted per exam attempt) — v1.0
- ✓ Super Admin oversight of all institutes (suspend/activate/delete/adjust credits) — v1.0
- ✓ Super Admin global billing configuration (Stripe keys, credit packages) — v1.0
- ✓ Super Admin global analytics dashboard with range filtering — v1.0

### Active

<!-- Next milestone scope. -->

- ✓ Full UI revamp — homepage, auth pages, student/admin/super-admin portals — v2.0
- [ ] Detailed analytics dashboard for student performance trends
- [ ] Question banks/pools for reusing questions across exams
- [ ] Export exam results to CSV/PDF
- [ ] OAuth login (Google, Microsoft)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Strict lockdown proctoring (e.g., secure browser) — v1 relies on basic tracking to reduce friction and complexity.
- Synchronous/Instant AI evaluation — Deferred to ensure reliability and avoid timeouts during exam submission.
- Mobile app — Web-first SaaS for v1; mobile support is planned for the future.

## Context

- **Target Audience:** Schools (K-12), Universities, Corporate training platforms.
- **Market Strategy:** The platform will be sold as a script on a marketplace. The buyer will host it and charge institutes.
- **Tech Stack:** Laravel 13 + React 19 + Inertia.js v3 + Tailwind CSS v4. PHP 8.3+.
- **Current State:** v2.0 shipped. Full UI revamp complete — branded homepage, auth pages, and all three role portals redesigned with unified layout shell and consistent design system.

## Constraints

- **Architecture**: Must be multi-tenant from day one to support the SaaS model.
- **AI Integration**: Must be provider-agnostic/configurable so buyers can use their preferred LLM (OpenAI, Anthropic, etc.).
- **Reliability**: Exam submission must be robust, hence the choice of asynchronous AI grading and auto-save functionality.

## Key Decisions

<!-- Decisions that constrain future work. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Multi-tenant v1 | Required for the SaaS marketplace business model | ✓ Good |
| Single-DB tenancy via global scope | Simpler than schema-per-tenant, works on shared hosting | ✓ Good |
| Separate roles table with FK | Extensible over string column; supports future role management UI | ✓ Good |
| UUID primary key for users | Prevents ID enumeration, safer for API exposure, globally unique | ✓ Good |
| Async AI Evaluation | Prevents user-facing timeouts and ensures reliable exam submission | ✓ Good |
| Optional Human Override | Builds trust in AI grading by keeping teachers in control | ✓ Good |
| Basic Anti-Cheat | Lowers barrier to entry and technical complexity for v1 | ✓ Good |
| Pay-Per-Exam Billing | Aligns platform costs (AI tokens) with revenue | ✓ Good |
| LLM config is Super-Admin global, not per-institute | Simplifies key management; buyer controls the AI provider | ✓ Good |
| LLM API keys encrypted in DB (not .env) | Keys survive deployments; configurable via UI without server access | ✓ Good |
| Provider abstraction via driver layer | openai / anthropic / google / openai-compatible covers all major providers | ✓ Good |
| ai_* columns immutable; override_* separate | Preserves audit trail; final_score = override_score ?? ai_score | ✓ Good |
| Confidence < 0.7 auto-flags for review | Surfaces uncertain AI grades without blocking the workflow | ✓ Good |
| Delete-and-recreate for draft exam updates | Avoids orphaned question/choice records on complex nested updates | ✓ Good |
| Stripe key stored encrypted in DB with .env fallback | Allows UI-based key rotation; .env fallback for initial setup | ✓ Good |
| Pessimistic locking for credit deduction | Prevents race conditions when multiple students start exams simultaneously | ✓ Good |

## Evolution

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
*Last updated: 2026-05-17 after v2.0 milestone*
