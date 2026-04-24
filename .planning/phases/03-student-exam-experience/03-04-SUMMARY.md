---
phase: 03-student-exam-experience
plan: 04
subsystem: student-exam-scheduler
tags: [scheduler, artisan, expiry, auto-submit]
requires: [ExamAttempt model, exams table]
provides: [SubmitExpiredExams artisan command, scheduler registration]
affects: [bootstrap/app.php]
tech-stack:
  added: []
  patterns: [Laravel Schedule via withSchedule(), per-row deadline check]
key-files:
  created:
    - app/Console/Commands/SubmitExpiredExams.php
  modified:
    - bootstrap/app.php
key-decisions:
  - 5-minute grace period beyond time_limit to account for network delays and auto-save lag
  - Runs every minute to minimize the window of unsubmitted expired attempts
  - Iterates per-attempt instead of bulk update because each exam has different time_limit_minutes
requirements-completed: []
duration: ~2 min
completed: 2026-04-25
---

# Phase 03 Plan 04: Expiry Enforcer Job Summary

Created SubmitExpiredExams artisan command that auto-submits abandoned exam attempts past their time limit + 5 min grace, registered in Laravel scheduler to run every minute.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | SubmitExpiredExams command + scheduler | 5c25468 | 2 |

## Deviations from Plan

None - plan executed exactly as written.

## Next

Phase complete, ready for verification.
