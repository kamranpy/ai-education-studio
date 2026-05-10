# Phase 5: Monetization & Billing - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Credit-based billing and access control for institutes. Institutes purchase credits to allow their students to take exams. The system deducts credits and enforces access based on the institute's credit balance.

</domain>

<decisions>
## Implementation Decisions

### Credit Purchasing Flow
- Start with a "simulated top-up" for immediate development and testing of core deduction logic.
- Follow up by implementing a fully production-ready Stripe Checkout integration within this same phase.
- Stripe integration must handle webhook events to securely fulfill credit purchases.

### Low Credit Experience
- **Students:** Hard block preventing them from starting new exams if the institute has 0 credits (or insufficient credits).
- **Active Exams:** Students currently taking an exam when credits run out (e.g., another student started concurrently) will NOT be interrupted. They can finish and submit.
- **Admins:** Prominent warning banner displayed in the Institute Admin dashboard when credit balance is low or empty.

### Credit Deduction Timing
- Deduct 1 credit exactly when a student clicks "Start Exam".
- This reserves the attempt, prevents race conditions with concurrent exam takers, and prevents abuse of the AI grading system.

### Credit Packages & Configuration
- Super Admins define fixed tiers (e.g., 100 credits for $10, 500 for $40).
- These packages must be fully customizable (create, read, update, delete) from the database/Super Admin panel.
- *Note:* Since the Super Admin UI is officially Phase 6, we will implement the underlying models, migrations, and relationships now. If needed, a minimal CRUD or seeder will be provided to configure these tiers for Phase 5's Stripe integration, until Phase 6 builds the actual Super Admin UI.

</decisions>

<canonical_refs>
## Canonical References

### Billing Constraints
- `.planning/PROJECT.md` — Pay-per-exam billing aligns platform costs with revenue.
- `.planning/REQUIREMENTS.md` — BILL-01, BILL-02, BILL-03.

*(No external specifications exist for this phase — requirements are fully captured in the decisions above).*

</canonical_refs>

<code_context>
## Existing Code Insights

### Established Patterns
- **Multi-Tenancy:** All billing and credit balance tables must be isolated per tenant (institute), strictly utilizing the existing global scope where applicable.
- **Middleware:** `EnsureInstituteAdmin` middleware is available to protect the new billing/top-up routes.
- **UI:** The frontend heavily utilizes `@radix-ui` and Tailwind CSS. The warning banner should use the existing alert patterns or Radix UI Callout/Toast components.
- **Frontend Routing:** Use `laravel/wayfinder` for all new Stripe checkout and top-up endpoints.

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope. Full Super Admin dashboard UI for managing the packages will be formalized in Phase 6, but the data layer is handled here.

</deferred>

---

*Phase: 05-monetization-billing*
*Context gathered: 2026-05-01*
