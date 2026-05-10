# Phase 3: Student Exam Experience - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Securing the student exam-taking interface, implementing server-side timers, continuous auto-save / resume logic, and basic tab-blur tracking.
</domain>

<decisions>
## Implementation Decisions

### Exam Layout
- **D-01:** Render one question at a time. This focuses the student and simplifies auto-saving the active question.

### Auto-Save Trigger
- **D-02:** Save on blur/navigation instead of strict polling intervals. This reduces unnecessary server load.

### Anti-Cheat Experience
- **D-03:** Show a brief warning overlay when the student returns to the tab after taking focus away. This ensures the student is aware their actions are tracked.

### Timer Expiry
- **D-04:** Auto-submit the last saved state server-side when time expires. This ensures the student gets partial credit even if they are disconnected.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Core phase 3 requirements (TAKE-01 to TAKE-07)
- `.planning/PROJECT.md` — Core value and architectural constraints

### Codebase and Tooling
- `.planning/codebase/ARCHITECTURE.md` — Architecture patterns, routing, and UI paradigms
- `.planning/phases/01-foundation-multi-tenancy/01-CONTEXT.md` — Prior phase decisions, notably distinct React layouts for students.
- `.planning/phases/02-user-management-exam-creation/02-CONTEXT.md` — Prior phase decisions, notably locking exams after first attempt starts.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadcn/ui` components: To be used for student interface.

### Established Patterns
- Multi-Tenancy Data Isolation.
- Distinct React layouts for different roles.
</code_context>

<specifics>
## Specific Ideas
- None additional.
</specifics>

<deferred>
## Deferred Ideas
- None.
</deferred>

---

*Phase: 03-student-exam-experience*
*Context gathered: 2026-04-24*
