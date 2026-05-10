---
phase: 4
plan: 4
name: "Student UI: Results Page & Submitted Interstitial"
subsystem: student
tags: [student, results, interstitial, polling]
requires: [grading-service]
provides: [student-results-page, grading-interstitial]
affects: [exam-attempt-controller, routes-web]
key-files:
  created:
    - resources/js/pages/Student/Interstitial.tsx
    - resources/js/pages/Student/Results.tsx
  modified:
    - app/Http/Controllers/Student/ExamAttemptController.php
    - routes/web.php
key-decisions:
  - "D-P4-07: Submit redirect changed from dashboard to results page for immediate feedback"
  - "D-P4-08: AI explanation explicitly stripped server-side (D-25) — not relying on frontend omission"
requirements-completed: [AIEV-05]
duration: "~8 min"
completed: "2026-04-26"
---

# Phase 4 Plan 4: Student Results & Interstitial Summary

Built the student-facing results experience. Controller's `results()` method conditionally renders `Interstitial.tsx` (during grading) or `Results.tsx` (after grading). Interstitial uses 5-second polling with visibility API guard and auto-redirects when status changes. Results page shows per-question scores with correct/incorrect indicators for MC/TF, pending review banner, final score summary, and back link. AI explanation explicitly stripped server-side per D-25 — controller only sends `ai_score` (not `ai_explanation`, `ai_confidence`, `ai_axes`). Submit redirect updated from dashboard to results page for immediate feedback.

## Task Completion

| # | Task | Status |
|---|------|--------|
| 1 | Results routing & controller | ✅ |
| 2 | Interstitial (grading) UI | ✅ |
| 3 | Student results UI | ✅ |

## Deviations from Plan

**[Enhancement] Submit redirect** — Changed from `student.dashboard` to `student.attempts.results` so students get immediate feedback instead of landing on the dashboard with no context.

**Total deviations:** 1 enhancement. **Impact:** Improved UX.
