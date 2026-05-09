---
phase: 4
plan: 1
name: "Backend: DB Schema, Prism & Grading Service"
subsystem: ai-evaluation
tags: [llm, grading, queue, database]
requires: []
provides: [grading-service, grade-attempt-job, llm-settings-model]
affects: [exam-attempt-controller, submit-expired-exams-command]
tech-stack:
  added: [prism-php/prism@0.100.1]
  patterns: [structured-output, encrypted-cast, should-be-unique-job]
key-files:
  created:
    - app/Enums/LlmProvider.php
    - app/Models/LlmSetting.php
    - app/Models/ExamAttemptAnswerOverride.php
    - app/Services/Llm/GradingService.php
    - app/Services/Llm/GradingResult.php
    - app/Jobs/GradeAttemptJob.php
    - resources/views/llm/grading-system.blade.php
    - resources/views/llm/grading-user.blade.php
    - database/migrations/2026_04_26_000000_create_llm_settings_tables.php
    - database/migrations/2026_04_26_000001_add_ai_grading_to_exam_attempt_answers.php
  modified:
    - composer.json
    - composer.lock
    - app/Models/ExamAttempt.php
    - app/Models/ExamAttemptAnswer.php
    - app/Http/Controllers/Student/ExamAttemptController.php
    - app/Console/Commands/SubmitExpiredExams.php
key-decisions:
  - "D-P4-01: Use Prism v0.100.1 structured output API with ObjectSchema for typed grading responses"
  - "D-P4-02: Question field is 'points' not 'max_marks' — adapted all references accordingly"
requirements-completed: [AIEV-01]
duration: "~15 min"
completed: "2026-04-26"
---

# Phase 4 Plan 1: Backend Foundation & Grading Engine Summary

Installed `prism-php/prism` v0.100.1 for provider-agnostic LLM access with structured output. Created database schema for `llm_settings` (encrypted API keys via Laravel cast), audit trail, and extended `exam_attempt_answers` with AI grading + manual override columns. Built `GradingService` with Prism's `ObjectSchema` for typed JSON responses from any LLM, Blade-based prompt templates with OWASP-recommended prompt injection defenses, and `GradeAttemptJob` (ShouldBeUnique, 3 retries, exponential backoff). Wired into `ExamAttemptController` submit path: instant MC/TF grading in transaction, async AI grading for written answers via `afterCommit()`.

## Task Completion

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Install Prism PHP | ✅ | `cb7a6a4` |
| 2 | Create LlmProvider enum | ✅ | `de8c044` |
| 3 | Create DB migrations | ✅ | `e10d969` |
| 4 | Run schema migration | ✅ | (runtime) |
| 5 | Create models (LlmSetting, Overrides, extend ExamAttempt/Answer) | ✅ | `cd4d51c` |
| 6 | Create GradingService, GradingResult, prompts, GradeAttemptJob | ✅ | `0aab5ab` |
| 7 | Wire grading into controller + expired exams command | ✅ | `e658c27` |

## Deviations from Plan

**[Rule 2 - Missing Critical] SubmitExpiredExams command** — Found during: Task 7. The `app:submit-expired-exams` command also force-submits exams but was not listed in the plan. Without updating it, expired exams would be submitted without grading. Fix: Updated `SubmitExpiredExams` to include the same MC/TF instant grading + `GradeAttemptJob` dispatch flow. Files modified: `app/Console/Commands/SubmitExpiredExams.php`.

**[Rule 1 - Bug] Question field name** — The plan/research referenced `$question->max_marks` but the actual model uses `$question->points`. Adapted all references throughout the GradingService, prompts, and Job.

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug). **Impact:** Positive — all submission paths now consistently trigger grading.

## Next

Ready for Plan 04-02: Super-Admin LLM Configuration UI.
