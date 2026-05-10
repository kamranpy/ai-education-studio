# Phase 2: User Management & Exam Creation - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Expanding the Admin Dashboard with student invitation workflows and an exam builder interface for creating/publishing assessments. Includes handling Exam drafting/publishing lifecycles.
</domain>

<decisions>
## Implementation Decisions

### Student Invitation Flow
- **D-01:** Implement manual account creation plus email invites. This ensures the admin retains full control over the tenant's user roster while minimizing student onboarding friction.

### Exam Builder UX
- **D-02:** Implement a single-page form with collapsible question cards. This approach minimizes complex multi-step state management overhead by keeping everything in a single manageable Inertia payload prior to submission.
- **D-03:** Rely extensively on `shadcn/ui` components (e.g., forms, buttons, cards, accordions) for the interface, maintaining consistency with Phase 1 decisions.

### Exam Lifecycle & Drafts
- **D-04:** Use a "soft publishing" approach. Exams can be edited freely during the drafting phase. However, once the first student attempt begins, the exam is locked from further structural editing to prevent grading mechanism corruption.

### AI Rubric Definition
- **D-05:** For written answer questions, provide a unified text area for "Grading Guidelines / Ideal Answer". The contents of this block will seamlessly pass to the LLM context prompt in Phase 4.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Core phase 2 requirements (TENT-03, EXAM-01 to EXAM-05)
- `.planning/PROJECT.md` — Architectural constraints

### Codebase and Tooling
- `.planning/codebase/CONVENTIONS.md` — Code style and component naming patterns
- `.planning/codebase/STRUCTURE.md` — Guidelines for controllers, actions, and Vue/React components
- `.planning/phases/01-foundation-multi-tenancy/01-CONTEXT.md` — Prior phase decisions, notably D-04 and D-05 regarding layout separation and UI library usage

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadcn/ui`: The designated ecosystem for the new Exam Builder UI.
- Inertia's `useForm`: Crucial for safely sending the complex exam question arrays backward to Laravel.

### Established Patterns
- Multi-tenancy Data Isolation: All models constructed in this phase (like `Student`, `Exam`, `Question`) MUST use the `HasInstitute` trait and be naturally isolated by the tenant scope built in Phase 1.

</code_context>

<specifics>
## Specific Ideas
- None additional

</specifics>

<deferred>
## Deferred Ideas
- None — discussion stayed entirely within the defined phase scope.

</deferred>

---

*Phase: 02-user-management-exam-creation*
*Context gathered: 2026-04-12*
