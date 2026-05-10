---
phase: 4
plan: 3
name: "Institute-Admin UI: Attempt List & Override Drill-In"
subsystem: admin-grading
tags: [admin, attempts, override, csv, polling]
requires: [grading-service]
provides: [attempt-review-ui, csv-export, override-endpoint]
affects: [routes-web]
key-files:
  created:
    - app/Http/Controllers/Admin/ExamAttemptAdminController.php
    - resources/js/pages/Admin/Exams/AttemptsIndex.tsx
    - resources/js/pages/Admin/Exams/AttemptsShow.tsx
  modified:
    - routes/web.php
key-decisions:
  - "D-P4-05: CSV export uses StreamedResponse for memory efficiency on large result sets"
  - "D-P4-06: Collapsible questions auto-open when status is needs_review for immediate attention"
requirements-completed: [AIEV-04, AIEV-05]
duration: "~10 min"
completed: "2026-04-26"
---

# Phase 4 Plan 3: Institute-Admin Attempt Review & Override Summary

Built the full admin grading review workflow. `ExamAttemptAdminController` provides index (paginated, filterable by status), show (with full AI grading data), override (with audit trail via `ExamAttemptAnswerOverride`), mark-reviewed, and streamed CSV export. Frontend includes `AttemptsIndex.tsx` with status tabs/badges/pagination/empty state, and `AttemptsShow.tsx` with collapsible per-question blocks showing AI explanation, confidence indicators (with color+icon pairing per UI spec), axes scores, override form with 30% diff nudge, override history, and 5-second polling during grading status. All scoped through Exam's HasInstitute trait.

## Task Completion

| # | Task | Status |
|---|------|--------|
| 1 | Controller & routing | ✅ |
| 2 | CSV export endpoint | ✅ |
| 3 | Attempts list UI | ✅ |
| 4 | Attempt drill-in & override UI | ✅ |

## Deviations from Plan

None.

## Next

Ready for Plan 04-04: Student Results Page.
