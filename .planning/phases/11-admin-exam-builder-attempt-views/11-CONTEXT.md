# Phase 11: Admin Exam Builder & Attempt Views - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning
**Source:** User provided UI designs (.planning/ui-designs/phase-11-admin-exam-builder)

<domain>
## Phase Boundary

The exam builder and attempt management pages are redesigned using the provided HTML templates.
</domain>

<decisions>
## Implementation Decisions

### UI Designs
- The implementation MUST strictly follow the HTML templates provided in `.planning/ui-designs/phase-11-admin-exam-builder/`:
  - `empty-exam.html`
  - `exam-attempts.html`
  - `exam-builder.html`
  - `exam-detail.html`
- These files are the exact design contract. The styling, structure, and interactions should be ported directly to our React/Inertia frontend using TailwindCSS and our existing UI components where applicable.

### Claude's Discretion
- State management for the exam builder (e.g. adding questions, reordering)
- Component extraction and reusability
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI Templates
- `.planning/ui-designs/phase-11-admin-exam-builder/empty-exam.html`
- `.planning/ui-designs/phase-11-admin-exam-builder/exam-attempts.html`
- `.planning/ui-designs/phase-11-admin-exam-builder/exam-builder.html`
- `.planning/ui-designs/phase-11-admin-exam-builder/exam-detail.html`

</canonical_refs>

<specifics>
## Specific Ideas
- Ensure all Tailwind classes from the HTML files are preserved.
- Ensure Wayfinder routes are correctly hooked up to these new views.
</specifics>

<deferred>
## Deferred Ideas
None
</deferred>

---
*Phase: 11-admin-exam-builder-attempt-views*
*Context gathered: 2026-05-16 via UI Designs*
