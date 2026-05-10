---
status: passed
phase: 03-student-exam-experience
verified_at: 2026-04-25
---

# Phase 03: Student Exam Experience — Verification

## Goal Check

> Setup the core tracking models for taking an exam and allow students to view, start, take, and submit exams with randomized question ordering, server-side timer enforcement, auto-save, and anti-cheat tab-blur tracking.

**Status: PASSED** — All core requirements implemented.

## Must-Have Verification

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| TAKE-01 | Student can see published exams | ✓ | `DashboardController` queries `status=published`, `Dashboard.tsx` renders grid |
| TAKE-02 | Server-side timer enforcement | ✓ | `ExamAttemptController::update()` checks `started_at + time_limit + 30s grace` |
| TAKE-03 | One question at a time | ✓ | `question_order` JSON array, `?q=N` index param, `ExamTake.tsx` single render |
| TAKE-04 | Auto-save on navigation | ✓ | `saveAndNavigate()` fires `router.put` with `action=save` on prev/next |
| TAKE-05 | Randomized question order | ✓ | `$questionIds->shuffle()` in `ExamAttemptController::store()` |
| TAKE-06 | Tab-blur tracking | ✓ | `visibilitychange` listener in `ExamTake.tsx`, `logTracking()` endpoint |
| TAKE-07 | Submit action | ✓ | `action=submit` in `update()`, confirm dialog on last question |

## Automated Checks

| Check | Result |
|-------|--------|
| Routes registered | ✓ 5 student routes via `php artisan route:list` |
| Vite build | ✓ Built in 9.28s, no TypeScript errors |
| Key files exist | ✓ All 8 key files present on disk |
| Git commits | ✓ 5 feat commits + 3 docs commits |

## Architecture Integrity

- **Models**: `ExamAttempt` and `ExamAttemptAnswer` follow existing patterns (HasFactory, casts, relationships)
- **Controller**: `ExamAttemptController` uses Form Request–style validation, `to_route()` redirects, `Inertia::flash()` toasts
- **Frontend**: `ExamTake.tsx` uses `StudentLayout`, Inertia's `router.put`, lucide icons — consistent with existing pages
- **Scheduler**: Uses `withSchedule()` in `bootstrap/app.php` — Laravel 13 standard pattern

## Human Verification Items

1. **Visual**: Log in as a student, verify the Dashboard shows published exams as cards with Start/Resume buttons
2. **Exam Flow**: Start an exam → navigate between questions → verify answers persist on navigation
3. **Timer**: Start a timed exam → verify countdown displays and auto-submits on expiry
4. **Anti-Cheat**: During an exam, switch tabs → return → verify warning overlay appears
5. **Expiry Job**: Run `php artisan app:submit-expired-exams` → verify it reports status

## Gaps

None identified.
