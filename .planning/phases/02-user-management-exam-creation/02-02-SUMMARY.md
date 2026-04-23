---
phase: 02-user-management-exam-creation
plan: "02"
subsystem: api
tags: [laravel, eloquent, exam-builder, nested-validation, multi-tenant]

requires:
  - phase: 01-foundation-multi-tenancy
    provides: HasInstitute trait, InstituteScope, Role model, EnsureInstituteAdmin middleware
provides:
  - Exam, Question, QuestionChoice Eloquent models
  - ExamController with CRUD, publish/unpublish endpoints
  - Nested array validation for exam payloads
  - Exam API documentation in INTEGRATION_GUIDE.md
affects: [02-03, 02-04, student-exam-experience, ai-evaluation]

tech-stack:
  added: []
  patterns: [after() validator for nested conditional rules, delete-and-recreate for draft sync]

key-files:
  created:
    - app/Models/Exam.php
    - app/Models/Question.php
    - app/Models/QuestionChoice.php
    - app/Http/Controllers/Admin/ExamController.php
    - app/Http/Requests/Admin/StoreExamRequest.php
    - app/Http/Requests/Admin/UpdateExamRequest.php
    - database/migrations/2026_04_23_155400_create_exams_tables.php
    - database/factories/ExamFactory.php
    - database/factories/QuestionFactory.php
    - database/factories/QuestionChoiceFactory.php
    - tests/Feature/Admin/ExamBuilderTest.php
    - resources/js/pages/Admin/Exams/Index.tsx
    - resources/js/pages/Admin/Exams/Builder.tsx
  modified:
    - routes/web.php
    - INTEGRATION_GUIDE.md

key-decisions:
  - "Used after() validator closures instead of required_if wildcards for reliable nested conditional validation"
  - "Delete-and-recreate strategy for draft exam updates to avoid orphaned questions/choices"
  - "Placeholder Inertia pages created for Exams/Index and Builder to unblock testing"

patterns-established:
  - "after() validator pattern: Use closure-based after() validation for nested array conditional rules instead of required_if with wildcards"
  - "Draft sync pattern: Delete all child records and recreate from payload during draft updates"

requirements-completed: [EXAM-01, EXAM-02, EXAM-03, EXAM-04, EXAM-05, DOCS-01, TEST-01]

duration: 9min
completed: 2026-04-23
---

# Phase 02 Plan 02: Exam Models & API Summary

**Exam CRUD API with nested MCQ/TF/Written question validation, tenant-isolated models, and delete-recreate draft sync**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-23T15:54:25Z
- **Completed:** 2026-04-23T16:03:01Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments
- Exam, Question, QuestionChoice models with full relationships, factories, and HasInstitute tenant isolation
- ExamController with 7 endpoints (index, create, store, edit, update, publish, unpublish)
- Strict nested array validation using after() closures for MCQ choices and Written grading guidelines
- 13 passing feature tests covering create, update, publish/unpublish, validation, tenant isolation, and authorization
- INTEGRATION_GUIDE.md updated with full exam API documentation including payload structure and lifecycle

## Task Commits

Each task was committed atomically:

1. **Task 1: Models and Migrations** - `392c59a` (feat)
2. **Task 2: Controller and Validation** - `c592c26` (feat)
3. **Task 3: Tests and Documentation** - `e8974b9` (test)

## Files Created/Modified
- `app/Models/Exam.php` - Exam model with HasInstitute trait, status helpers
- `app/Models/Question.php` - Question model (mcq/tf/written types)
- `app/Models/QuestionChoice.php` - Choice model for MCQ questions
- `database/migrations/2026_04_23_155400_create_exams_tables.php` - exams, questions, question_choices tables
- `database/factories/ExamFactory.php` - Factory with published/locked states
- `database/factories/QuestionFactory.php` - Factory with mcq/trueFalse/written states
- `database/factories/QuestionChoiceFactory.php` - Factory with correct state
- `app/Http/Controllers/Admin/ExamController.php` - Full CRUD + publish/unpublish
- `app/Http/Requests/Admin/StoreExamRequest.php` - Nested validation with after() closures
- `app/Http/Requests/Admin/UpdateExamRequest.php` - Same validation, blocks non-draft edits
- `routes/web.php` - 7 exam routes under admin prefix
- `tests/Feature/Admin/ExamBuilderTest.php` - 13 tests, 43 assertions
- `resources/js/pages/Admin/Exams/Index.tsx` - Placeholder page for exam listing
- `resources/js/pages/Admin/Exams/Builder.tsx` - Placeholder page for exam builder
- `INTEGRATION_GUIDE.md` - Full exam API contract documentation

## Decisions Made
- Used `after()` validator closures instead of `required_if` wildcards — `required_if:questions.*.type,mcq` doesn't reliably match same-index in nested arrays, causing false validation failures across question types
- Delete-and-recreate strategy for draft updates — safe during draft phase (D-04) and avoids orphaned records without complex ID tracking
- Created placeholder Inertia pages (Exams/Index, Builder) — needed for Inertia assertion framework which validates page component files exist

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed nested conditional validation using after() closures**
- **Found during:** Task 3 (Test execution)
- **Issue:** `required_if:questions.*.type,mcq` with wildcard matching caused false validation failures — the `min:2` rule on choices applied to all question types, not just MCQ
- **Fix:** Replaced `required_if` and `min:2` with `after()` closure that checks conditions per-question-index
- **Files modified:** app/Http/Requests/Admin/StoreExamRequest.php, app/Http/Requests/Admin/UpdateExamRequest.php
- **Verification:** All 13 ExamBuilderTest tests pass
- **Committed in:** e8974b9 (Task 3 commit)

**2. [Rule 2 - Missing Critical] Created placeholder Inertia page components**
- **Found during:** Task 3 (Test execution)
- **Issue:** Inertia testing framework validates that page component files exist on disk, causing test failures
- **Fix:** Created minimal Admin/Exams/Index.tsx and Builder.tsx placeholder pages
- **Files modified:** resources/js/pages/Admin/Exams/Index.tsx, resources/js/pages/Admin/Exams/Builder.tsx
- **Verification:** All Inertia assertions pass
- **Committed in:** e8974b9 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both fixes necessary for test correctness. No scope creep.

## Issues Encountered
- Pre-existing test failures in Settings/Security and Auth tests (NOT NULL constraint on users.role_id) — unrelated to this plan, out of scope

## Threat Mitigation Verification
- **T-02-03 (Tampering):** Strict nested array validation via Form Requests with after() closures — enforces type constraints, choice minimums, and grading guidelines requirements
- **T-02-04 (Information Disclosure):** Exam model uses HasInstitute trait with InstituteScope — tenant isolation verified by test_admin_cannot_see_other_institute_exams test

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Exam models and API ready for frontend Exam Builder UI (Plans 02-03 and 02-04)
- Placeholder pages ready to be replaced with full implementations
- Factories available for seeding and testing

---
*Phase: 02-user-management-exam-creation*
*Completed: 2026-04-23*
