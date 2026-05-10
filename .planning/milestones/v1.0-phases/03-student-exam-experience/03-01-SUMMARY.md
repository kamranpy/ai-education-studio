---
phase: 03-student-exam-experience
plan: 01
subsystem: student-exam
tags: [models, migrations, routing, dashboard]
requires: [Exam, Question, User models]
provides: [ExamAttempt, ExamAttemptAnswer models, Student Dashboard, ExamAttemptController]
affects: [routes/web.php, app/Models/Exam.php]
tech-stack:
  added: []
  patterns: [JSON columns for flexible data, question_order shuffle]
key-files:
  created:
    - app/Models/ExamAttempt.php
    - app/Models/ExamAttemptAnswer.php
    - database/migrations/2026_04_25_000000_create_exam_attempts_tables.php
    - app/Http/Controllers/Student/DashboardController.php
    - app/Http/Controllers/Student/ExamAttemptController.php
  modified:
    - routes/web.php
    - resources/js/pages/Student/Dashboard.tsx
    - app/Models/Exam.php
key-decisions:
  - Used foreignUuid for user_id since User model uses HasUuids
  - Combined all attempt routes (store, show, update, logTracking) in one controller for cohesion
  - Built ExamAttemptController with all 4 methods upfront to avoid splitting across plans
requirements-completed: [TAKE-01, TAKE-05]
duration: ~8 min
completed: 2026-04-25
---

# Phase 03 Plan 01: Core Models & List Exams Summary

ExamAttempt and ExamAttemptAnswer models with migrations, Student Dashboard showing published exams, and ExamAttemptController handling start/resume with randomized question order.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Core Models & Migrations | a2e6dba | 4 |
| 2 | Student Dashboard & Available Exams | 23ecab3 | 3 |
| 3 | Starting the Exam (ExamAttemptController) | 7b70e7f | 1 |

## Deviations from Plan

- **[Rule 2 - Missing Critical]** Added all four ExamAttemptController methods (store, show, update, logTracking) in Task 3 instead of just store. This was done because the routes were already registered in Task 2, and the controller skeleton needed all methods to avoid runtime errors. The show/update/logTracking logic will be refined in Plans 02 and 03.

## Next

Ready for Plan 03-02 (Exam Take UI & AutoSave).
