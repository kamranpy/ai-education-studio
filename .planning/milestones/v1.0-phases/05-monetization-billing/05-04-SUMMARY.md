---
phase: "05"
plan: "04"
subsystem: billing-enforcement
tags: [billing, credit-deduction, access-control, middleware]
requires: [institute-credits, billing-routes]
provides: [exam-credit-gate, credits-shared-props]
affects: [ExamAttemptController, HandleInertiaRequests, Admin/Exams/Index]
tech-stack:
  added: []
  patterns: [pessimistic-locking, atomic-deduction, shared-inertia-props]
key-files:
  created: []
  modified:
    - app/Http/Controllers/Student/ExamAttemptController.php
    - app/Http/Middleware/HandleInertiaRequests.php
    - resources/js/pages/Admin/Exams/Index.tsx
key-decisions:
  - "lockForUpdate inside DB::transaction for atomic credit deduction"
  - "Resuming in-progress exams bypasses credit check entirely"
  - "loadMissing('institute') on user in HandleInertiaRequests for global access"
requirements-completed: [BILL-02, BILL-03]
duration: "5 min"
completed: "2026-05-01"
---

# Phase 05 Plan 04: Exam Start Credit Deduction & Blocking Summary

Core monetization enforcement — atomic credit deduction with pessimistic locking at exam start, hard block for zero-credit institutes, and admin warning banner on the Exams index page with direct link to Billing.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Atomic Credit Deduction at Exam Start | ✓ | `af99940` |
| 2 | Admin Zero Credits Warning Banner | ✓ | `0418f5b` |
| 3 | Share Institute Credits via Middleware | ✓ | `0418f5b` |

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next

Phase complete, ready for verification.
