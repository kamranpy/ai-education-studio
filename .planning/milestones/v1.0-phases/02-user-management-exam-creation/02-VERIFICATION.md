---
phase: 02-user-management-exam-creation
verified: 2026-04-24T18:30:00Z
status: gaps_found
score: 6/8 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Unit tests are written and pass for all phase features"
    status: failed
    reason: "ExamBuilderTest.php validExamPayload() uses 'tf' and 'written' as question type values, but StoreExamRequest/UpdateExamRequest validate against 'mcq,true_false,written_answer'. At least 5 tests would fail validation."
    artifacts:
      - path: "tests/Feature/Admin/ExamBuilderTest.php"
        issue: "Lines 56,63: question types 'tf' and 'written' do not match validation rule 'in:mcq,true_false,written_answer' in StoreExamRequest.php line 25"
    missing:
      - "Update ExamBuilderTest.php validExamPayload() to use 'true_false' instead of 'tf'"
      - "Update ExamBuilderTest.php validExamPayload() to use 'written_answer' instead of 'written'"
      - "Update test assertions querying by type (e.g. where('type', 'tf') → where('type', 'true_false'))"
  - truth: "INTEGRATION_GUIDE.md is updated with any new API contracts"
    status: partial
    reason: "INTEGRATION_GUIDE.md documents 'tf' and 'written' as question type values (lines 157,160,173), but actual validation and frontend use 'true_false' and 'written_answer'"
    artifacts:
      - path: "INTEGRATION_GUIDE.md"
        issue: "Question type values in payload example and type table are outdated — 'tf' should be 'true_false', 'written' should be 'written_answer'"
    missing:
      - "Update INTEGRATION_GUIDE.md payload example to use 'true_false' and 'written_answer'"
      - "Update Question Types table to use 'true_false' and 'written_answer'"
human_verification:
  - test: "Run full test suite (vendor/bin/phpunit) after fixing type mismatches to confirm all 25 tests pass"
    expected: "All tests pass with 0 failures"
    why_human: "Cannot run test suite programmatically in verification"
  - test: "Register a new account, navigate to /admin/exams/create, build an exam with 1 MCQ, 1 T/F, and 1 Written question, save as draft, edit it, then publish"
    expected: "Exam saves correctly with all question types, appears in list with Published badge"
    why_human: "End-to-end UI flow requires browser interaction"
---

# Phase 2: User Management & Exam Creation Verification Report

**Phase Goal:** Admins can manage their users and build complete exams
**Verified:** 2026-04-24T18:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin can invite and manage students within their institute | ✓ VERIFIED | UserController (38L) with paginated tenant-scoped listing; UserInviteController (45L) with role-restricted creation; Users/Index.tsx (283L) with table, search, filter, pagination; Users/Invite.tsx (174L) with useForm; 12 tests in UserManagementTest.php |
| 2 | Admin can create an exam with MCQ, T/F, and written questions | ✓ VERIFIED | ExamController::store (148L) with nested validation + syncQuestions; Builder.tsx (481L) with useForm and dynamic question management; question-card.tsx (438L) with MCQ/TF/Written type-specific inputs |
| 3 | Admin can publish an exam to make it available to students | ✓ VERIFIED | ExamController::publish/unpublish with isDraft/isPublished guards; Index.tsx confirmation dialogs; Show.tsx publish/unpublish buttons; 3 tests (publish, no-questions guard, unpublish) |
| 4 | Unit tests are written and pass for all phase features | ✗ FAILED | Tests exist (25 total, substantive) but ExamBuilderTest uses old type values `tf`/`written` that don't match validation `true_false`/`written_answer`. At least 5 tests would fail. |
| 5 | INTEGRATION_GUIDE.md is updated with any new API contracts | ✗ FAILED | Guide has comprehensive Exam API section (233L) but documents `tf`/`written` type values instead of `true_false`/`written_answer` |
| 6 | Admin can view a list of exams | ✓ VERIFIED | Exams/Index.tsx (390L) with table, search, status filter, pagination, row actions, empty state; ExamController::index returns paginated exams with withCount('questions') |
| 7 | Admin can view a read-only detail page of an exam | ✓ VERIFIED | Exams/Show.tsx (374L) with collapsible question cards, MCQ choices with correct answer highlighting, T/F answer display, written grading guidelines; ExamController::show eager-loads questions.choices |
| 8 | Admin can edit a draft exam | ✓ VERIFIED | Builder.tsx handles edit mode via optional `exam` prop with transformExamQuestions(); ExamController::edit loads questions.choices; ExamController::update deletes+recreates in transaction |

**Score:** 6/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/Http/Controllers/Admin/UserController.php` | User list controller | ✓ VERIFIED | 38L, paginated tenant-scoped index with search/role/status filters |
| `app/Http/Controllers/Admin/UserInviteController.php` | User invitation logic | ✓ VERIFIED | 45L, create/store with role restrictions, StoreUserInviteRequest validation |
| `app/Http/Middleware/EnsureInstituteAdmin.php` | Admin route protection | ✓ VERIFIED | Applied to all /admin routes in web.php |
| `app/Http/Requests/Admin/StoreUserInviteRequest.php` | Invite validation | ✓ VERIFIED | Role restriction (blocks super_admin), email validation |
| `resources/js/pages/Admin/Users/Index.tsx` | User list UI | ✓ VERIFIED | 283L, table with search, role/status filters, pagination, status badges |
| `resources/js/pages/Admin/Users/Invite.tsx` | Invite form UI | ✓ VERIFIED | 174L, useForm with name/email/role/send_email, Wayfinder route |
| `app/Models/Exam.php` | Exam Eloquent Model | ✓ VERIFIED | 55L, HasInstitute trait, status helpers, questions relationship |
| `app/Models/Question.php` | Question model | ✓ VERIFIED | 45L, exam/choices relationships, type/points/order fields |
| `app/Models/QuestionChoice.php` | Choice model | ✓ VERIFIED | 30L, question relationship, is_correct boolean cast |
| `app/Http/Controllers/Admin/ExamController.php` | Exam API endpoints | ✓ VERIFIED | 148L, 7 endpoints (index/create/store/show/edit/update/publish/unpublish), nested syncQuestions |
| `app/Http/Requests/Admin/StoreExamRequest.php` | Exam validation | ✓ VERIFIED | 58L, nested array rules with after() closures for type-conditional validation |
| `app/Http/Requests/Admin/UpdateExamRequest.php` | Exam update validation | ✓ VERIFIED | 59L, same rules + isDraft() authorization check |
| `resources/js/pages/Admin/Exams/Index.tsx` | Exam list UI | ✓ VERIFIED | 390L, table/search/filter/pagination/row actions/confirmation dialogs |
| `resources/js/pages/Admin/Exams/Show.tsx` | Exam read-only UI | ✓ VERIFIED | 374L, collapsible question cards, MCQ/TF/Written display, publish/unpublish |
| `resources/js/pages/Admin/Exams/Builder.tsx` | Exam Builder Form | ✓ VERIFIED | 481L, unified create/edit, useForm, dynamic question add/remove/reorder |
| `resources/js/components/exam/question-card.tsx` | Question card component | ✓ VERIFIED | 438L, MCQ choice editor, TF radio, Written textarea, error display |
| `resources/js/components/exam/exam-status-badge.tsx` | Status badge | ✓ VERIFIED | 44L, draft/published/locked color mapping |
| `tests/Feature/Admin/UserManagementTest.php` | User management tests | ✓ VERIFIED | 219L, 12 tests covering CRUD, tenant isolation, auth, validation |
| `tests/Feature/Admin/ExamBuilderTest.php` | Exam builder tests | ⚠️ HOLLOW | 299L, 13 test methods are substantive BUT use incorrect type values (`tf`/`written` instead of `true_false`/`written_answer`) — tests would fail |
| `INTEGRATION_GUIDE.md` | API documentation | ⚠️ PARTIAL | 233L, comprehensive exam API docs but type values are outdated |
| `database/migrations/2026_04_23_155400_create_exams_tables.php` | Exam tables | ✓ VERIFIED | 54L, exams/questions/question_choices with proper FKs, cascade deletes |
| `database/migrations/2026_04_23_153501_add_status_to_users_table.php` | User status column | ✓ VERIFIED | Adds status column to users table |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `resources/js/pages/Admin/Users/Invite.tsx` | `app/Http/Controllers/Admin/UserInviteController.php` | `post(usersInviteStore.url())` | ✓ WIRED | Invite.tsx L45 calls store URL via Wayfinder; controller store() creates user |
| `app/Http/Controllers/Admin/ExamController.php` | `app/Models/Exam.php` | `Exam::create` | ✓ WIRED | ExamController L45 calls Exam::create in DB transaction |
| `resources/js/pages/Admin/Exams/Index.tsx` | `resources/js/pages/Admin/Exams/Show.tsx` | `examsShow.url(exam.id)` | ✓ WIRED | Index.tsx L205,332 link to Show via Wayfinder route helper |
| `resources/js/pages/Admin/Exams/Builder.tsx` | `app/Http/Controllers/Admin/ExamController.php` | `post(examsStore.url())` / `put(examsUpdate.url())` | ✓ WIRED | Builder.tsx L217 posts to store; L215 puts to update |
| `routes/web.php` | All admin controllers | Route registration | ✓ WIRED | 10 admin routes registered under EnsureInstituteAdmin middleware |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `Users/Index.tsx` | `users` prop | `UserController::index` → Eloquent paginate | Yes — queries users table with tenant scope | ✓ FLOWING |
| `Users/Invite.tsx` | `roles` prop | `UserInviteController::create` → Role::whereIn query | Yes — queries roles table | ✓ FLOWING |
| `Exams/Index.tsx` | `exams` prop | `ExamController::index` → Exam::query with tenant scope | Yes — queries exams table with withCount | ✓ FLOWING |
| `Exams/Show.tsx` | `exam` prop | `ExamController::show` → load('questions.choices') | Yes — eager-loads nested relationships | ✓ FLOWING |
| `Exams/Builder.tsx` | `exam` prop (edit mode) | `ExamController::edit` → load('questions.choices') | Yes — loads full exam structure | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All phase features | `vendor/bin/phpunit --filter "UserManagementTest\|ExamBuilderTest"` | Cannot run — requires running server/DB | ? SKIP |

Step 7b: SKIPPED (requires database and server to run tests)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| TENT-03 | Plan 01 | Tenant admins can manage their own users | ✓ SATISFIED | UserController tenant-scoped listing, UserInviteController creation, EnsureInstituteAdmin middleware, 12 tests |
| EXAM-01 | Plans 02,03,04 | Admin can create a new exam with title, description, settings | ✓ SATISFIED | ExamController::store, Builder.tsx form, StoreExamRequest validation |
| EXAM-02 | Plans 02,04 | Admin can add MCQ questions | ✓ SATISFIED | question-card.tsx McqFields, after() validator for min 2 choices |
| EXAM-03 | Plans 02,04 | Admin can add T/F questions | ✓ SATISFIED | question-card.tsx TrueFalseFields with RadioGroup, choices persisted in syncQuestions |
| EXAM-04 | Plans 02,04 | Admin can add Written Answer questions | ✓ SATISFIED | question-card.tsx WrittenFields with grading guidelines, after() validator |
| EXAM-05 | Plans 02,03,04 | Admin can publish/unpublish an exam | ✓ SATISFIED | ExamController::publish/unpublish, Index.tsx/Show.tsx confirmation dialogs, 3 tests |
| TEST-01 | Plans 01,02 | Unit tests written and passing | ⚠️ BLOCKED | 25 tests exist and are substantive, but ExamBuilderTest type values mismatch would cause failures |
| DOCS-01 | Plan 02 | INTEGRATION_GUIDE.md maintained | ⚠️ BLOCKED | Comprehensive docs exist but question type values are outdated |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `tests/Feature/Admin/ExamBuilderTest.php` | 56 | Type value `tf` doesn't match validation `true_false` | 🛑 Blocker | Test would fail validation — exam never created |
| `tests/Feature/Admin/ExamBuilderTest.php` | 63 | Type value `written` doesn't match validation `written_answer` | 🛑 Blocker | Test would fail validation — written question never created |
| `INTEGRATION_GUIDE.md` | 157,160,173 | Type values `tf`/`written` outdated | ⚠️ Warning | API consumers would use wrong type values |

### Human Verification Required

### 1. Run Test Suite After Fixes

**Test:** Run `vendor/bin/phpunit --filter "UserManagementTest|ExamBuilderTest"` after updating type values in ExamBuilderTest.php
**Expected:** All 25 tests pass (12 user management + 13 exam builder)
**Why human:** Cannot run PHPUnit test suite during verification — requires database and application server

### 2. End-to-End Exam Builder Flow

**Test:** Register → navigate to /admin/exams/create → add 1 MCQ, 1 T/F, 1 Written question → Save Draft → Edit → modify a question → Save & Publish → verify Published badge in exam list
**Expected:** Exam saves with all question types, appears in list with Published badge, editable when draft, publishable
**Why human:** Full UI flow requires browser interaction and visual verification

### Gaps Summary

Two related gaps stem from the same root cause: **Plan 04 aligned validation type values from `tf`/`written` to `true_false`/`written_answer` but did not propagate the change to the test file (written in Plan 02) or INTEGRATION_GUIDE.md (also written in Plan 02).**

**Gap 1 (Blocker):** `ExamBuilderTest.php` `validExamPayload()` uses `'type' => 'tf'` and `'type' => 'written'`, but `StoreExamRequest` validates `'in:mcq,true_false,written_answer'`. This means at least 5 tests would fail:
- `test_admin_can_create_exam_with_all_question_types` — `tf` and `written` rejected by validation
- `test_exam_is_scoped_to_admin_institute` — same payload, same failure
- `test_admin_can_update_draft_exam` — same payload
- `test_update_deletes_old_questions_and_choices` — same payload
- `test_validation_requires_written_to_have_grading_guidelines` — type `written` rejected before grading_guidelines checked

**Gap 2 (Warning):** `INTEGRATION_GUIDE.md` documents `tf` and `written` in the payload example (line 157, 160) and question types table (line 173), but the actual validation accepts `true_false` and `written_answer`. API consumers following the guide would hit validation errors.

**Both gaps are a 2-line fix** — update `tf` → `true_false` and `written` → `written_answer` in both files.

---

_Verified: 2026-04-24T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
