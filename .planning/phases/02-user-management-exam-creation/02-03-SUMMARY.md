---
phase: 02-user-management-exam-creation
plan: "03"
subsystem: ui
tags: [react, inertia, shadcn, tailwind, collapsible, table, badge]

requires:
  - phase: 02-user-management-exam-creation/02
    provides: Exam model, ExamController CRUD, question/choice models
provides:
  - Exam list page with search, status filtering, pagination
  - Exam detail page with read-only collapsible question cards
  - ExamStatusBadge reusable component
  - shadcn textarea, radio-group, accordion components
affects: [02-04-exam-builder-form, student-exam-experience]

tech-stack:
  added: [shadcn/textarea, shadcn/radio-group, shadcn/accordion]
  patterns: [collapsible question cards, exam status badge mapping, Wayfinder imports for navigation]

key-files:
  created:
    - resources/js/pages/Admin/Exams/Show.tsx
    - resources/js/components/exam/exam-status-badge.tsx
    - resources/js/components/ui/textarea.tsx
    - resources/js/components/ui/radio-group.tsx
    - resources/js/components/ui/accordion.tsx
  modified:
    - resources/js/pages/Admin/Exams/Index.tsx
    - app/Http/Controllers/Admin/ExamController.php
    - routes/web.php
    - resources/js/layouts/admin-layout.tsx

key-decisions:
  - "Used Collapsible (not Accordion) for question cards to allow multiple open at once"
  - "ExamController show method eager-loads questions.choices and loadCount for questions_count"

patterns-established:
  - "ExamStatusBadge: reusable status badge with draft/published/locked color mapping"
  - "Collapsible question cards: expand/collapse per question with type icon, label, and points in header"
  - "Confirmation dialogs: Dialog with DialogFooter for publish/unpublish actions"

requirements-completed: [EXAM-01, EXAM-05]

duration: 14min
completed: 2026-04-23
---

# Phase 02 Plan 03: Exam Builder UI Shell & Index Summary

**Exam list page with search/filter/actions and read-only detail page with collapsible question cards using Wayfinder-typed routes**

## Performance

- **Duration:** 14 min
- **Started:** 2026-04-23T21:08:32Z
- **Completed:** 2026-04-23T21:22:26Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Installed shadcn textarea, radio-group, and accordion components for the exam builder
- Implemented full Exams Index page with data table, search, status filter, pagination, empty state, and row actions (view, edit, publish/unpublish with confirmation dialogs)
- Implemented Exam Show page with read-only detail view: status/metadata bar, description, and collapsible question cards showing MCQ choices, T/F answers, and written answer grading guidelines
- Created reusable ExamStatusBadge component with draft/published/locked visual variants
- Added ExamController show method and admin.exams.show route
- Fixed admin layout to use Wayfinder route helper instead of hardcoded URL

## Task Commits

Each task was committed atomically:

1. **Task 1: Install UI Components** - `d2c8d8f` (feat)
2. **Task 2: Exams Index and Show Pages** - `03e6254` (feat)

## Files Created/Modified
- `resources/js/components/ui/textarea.tsx` - shadcn Textarea component
- `resources/js/components/ui/radio-group.tsx` - shadcn RadioGroup component
- `resources/js/components/ui/accordion.tsx` - shadcn Accordion component
- `resources/js/components/exam/exam-status-badge.tsx` - Reusable exam status badge with color mapping
- `resources/js/pages/Admin/Exams/Index.tsx` - Full exam list page with table, filters, actions
- `resources/js/pages/Admin/Exams/Show.tsx` - Read-only exam detail with collapsible questions
- `app/Http/Controllers/Admin/ExamController.php` - Added show method
- `routes/web.php` - Added admin.exams.show route
- `resources/js/layouts/admin-layout.tsx` - Fixed exams nav to use Wayfinder

## Decisions Made
- Used Collapsible instead of Accordion for question cards — allows multiple questions to be expanded simultaneously for easier comparison
- ExamController show method uses both `load('questions.choices')` and `loadCount('questions')` to provide both nested data and count
- Confirmation dialogs (publish/unpublish) use Dialog with controlled open state rather than AlertDialog for consistency with the existing pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added show route and controller method**
- **Found during:** Task 2 (implementing Show.tsx)
- **Issue:** Plan specified Show.tsx but no show route existed in web.php
- **Fix:** Added `ExamController::show()` method and `admin.exams.show` GET route
- **Files modified:** app/Http/Controllers/Admin/ExamController.php, routes/web.php
- **Verification:** `php artisan route:list` shows the route, Wayfinder regenerated
- **Committed in:** 03e6254

**2. [Rule 2 - Missing Critical] Fixed admin layout hardcoded URL**
- **Found during:** Task 2 (reviewing navigation)
- **Issue:** Admin layout used hardcoded `/admin/exams` instead of Wayfinder route helper
- **Fix:** Imported `index as examsIndex` from ExamController Wayfinder actions
- **Files modified:** resources/js/layouts/admin-layout.tsx
- **Committed in:** 03e6254

---

**Total deviations:** 2 auto-fixed (2 missing critical)
**Impact on plan:** Both necessary for the feature to work. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Exam list and detail views complete; ready for the dynamic exam builder form (Plan 02-04)
- ExamStatusBadge and Collapsible question card patterns are established for reuse in the builder
- shadcn textarea and radio-group components installed and ready for the create/edit form

## Self-Check: PASSED

---
*Phase: 02-user-management-exam-creation*
*Completed: 2026-04-23*
