---
phase: 02-user-management-exam-creation
plan: "04"
subsystem: ui
tags: [react, inertia, useForm, radix-ui, exam-builder]

requires:
  - phase: 02-user-management-exam-creation/02-02
    provides: Exam, Question, QuestionChoice models and ExamController API
  - phase: 02-user-management-exam-creation/02-03
    provides: Exam index/show pages and exam-status-badge component
provides:
  - Exam Builder form (Create and Edit) with dynamic question management
  - QuestionCard component for MCQ, True/False, and Written Answer types
  - Save Draft and Save & Publish flows
affects: [student-exam-experience, ai-evaluation-grading]

tech-stack:
  added: []
  patterns: [unified-builder-page, dynamic-nested-form, question-type-switching]

key-files:
  created:
    - resources/js/components/exam/question-card.tsx
  modified:
    - resources/js/pages/Admin/Exams/Builder.tsx
    - app/Http/Controllers/Admin/ExamController.php
    - app/Http/Requests/Admin/StoreExamRequest.php
    - app/Http/Requests/Admin/UpdateExamRequest.php
    - resources/js/pages/auth/register.tsx
    - app/Traits/HasInstitute.php

key-decisions:
  - "Unified Builder.tsx instead of separate Create.tsx + Edit.tsx — controller already renders Admin/Exams/Builder for both"
  - "Added institute_name field to registration form — was missing, causing null institute_id on exam creation"
  - "Added RuntimeException guard in HasInstitute trait for non-User models created without institute_id"

patterns-established:
  - "Unified builder pattern: single page component handling both create and edit via optional prop"
  - "Dynamic nested form: useForm with array manipulation for add/remove/reorder child items"

requirements-completed: [EXAM-01, EXAM-02, EXAM-03, EXAM-04, EXAM-05]

duration: 18min
completed: 2026-04-23
---

# Phase 02, Plan 04: Exam Builder Form Summary

**Dynamic exam builder form with MCQ/True-False/Written question types, drag reorder, and Save Draft/Publish flows**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-23
- **Completed:** 2026-04-23
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Exam Builder form with dynamic question management (add, remove, reorder)
- QuestionCard component supporting MCQ (with choices), True/False (radio), and Written Answer (grading guidelines)
- Save Draft and Save & Publish submit actions
- Fixed registration form missing institute_name field
- Added HasInstitute safety guard preventing null institute_id

## Task Commits

1. **Task 1: Exam Builder Form Components** - `e879238` (feat)
2. **Task 2: Human Verification (Checkpoint)** - approved by user
3. **Fix: Registration form + HasInstitute guard** - `41665df` (fix)

## Files Created/Modified
- `resources/js/components/exam/question-card.tsx` - Reusable question card with type-specific inputs
- `resources/js/pages/Admin/Exams/Builder.tsx` - Unified create/edit exam form
- `app/Http/Controllers/Admin/ExamController.php` - Store/update with nested validation
- `app/Http/Requests/Admin/StoreExamRequest.php` - Exam creation validation rules
- `app/Http/Requests/Admin/UpdateExamRequest.php` - Exam update validation rules
- `resources/js/pages/auth/register.tsx` - Added institute_name field
- `app/Traits/HasInstitute.php` - Added null institute_id guard

## Decisions Made
- Unified Builder.tsx for both create and edit (controller already targeted this page)
- Fixed question type values to align backend and frontend (mcq, true_false, written_answer)
- Added T/F choice persistence in syncQuestions
- Added status field to store/update validation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Question type value mismatch**
- **Found during:** Task 1
- **Issue:** Backend used `tf` but frontend expected `true_false`
- **Fix:** Aligned all validation to use `mcq`, `true_false`, `written_answer`

**2. [Rule 1 - Bug] T/F choices not persisted**
- **Found during:** Task 1
- **Issue:** syncQuestions only created choices for MCQ, not True/False
- **Fix:** Updated condition to handle both mcq and true_false

**3. [Rule 2 - Missing] Registration form missing institute_name**
- **Found during:** Checkpoint verification
- **Issue:** Backend requires institute_name to create institute, but form didn't have the field
- **Fix:** Added institute_name input to register.tsx, added RuntimeException guard in HasInstitute

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing critical)
**Impact on plan:** All fixes necessary for correctness. Registration fix was a pre-existing gap from Phase 1.

## Issues Encountered
- User hit integrity constraint violation (null institute_id) during checkpoint testing — traced to missing registration form field

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full exam CRUD is operational (create, read, update, publish/unpublish)
- Student exam experience (Phase 3) can now reference published exams
- AI evaluation (Phase 4) can consume question/choice structures

---
*Phase: 02-user-management-exam-creation*
*Completed: 2026-04-23*
