---
phase: 02-user-management-exam-creation
reviewed: 2026-04-24T12:00:00Z
depth: standard
files_reviewed: 27
files_reviewed_list:
  - app/Http/Controllers/Admin/UserController.php
  - app/Http/Controllers/Admin/UserInviteController.php
  - app/Http/Controllers/Admin/ExamController.php
  - app/Http/Middleware/EnsureInstituteAdmin.php
  - app/Http/Requests/Admin/StoreUserInviteRequest.php
  - app/Http/Requests/Admin/StoreExamRequest.php
  - app/Http/Requests/Admin/UpdateExamRequest.php
  - app/Models/Exam.php
  - app/Models/Question.php
  - app/Models/QuestionChoice.php
  - app/Models/User.php
  - app/Traits/HasInstitute.php
  - database/migrations/2026_04_23_153501_add_status_to_users_table.php
  - database/migrations/2026_04_23_155400_create_exams_tables.php
  - database/factories/ExamFactory.php
  - database/factories/QuestionFactory.php
  - database/factories/QuestionChoiceFactory.php
  - tests/Feature/Admin/UserManagementTest.php
  - tests/Feature/Admin/ExamBuilderTest.php
  - routes/web.php
  - resources/js/pages/Admin/Users/Index.tsx
  - resources/js/pages/Admin/Users/Invite.tsx
  - resources/js/pages/Admin/Exams/Index.tsx
  - resources/js/pages/Admin/Exams/Builder.tsx
  - resources/js/pages/Admin/Exams/Show.tsx
  - resources/js/components/exam/exam-status-badge.tsx
  - resources/js/components/exam/question-card.tsx
  - resources/js/layouts/admin-layout.tsx
  - resources/js/pages/auth/register.tsx
findings:
  critical: 1
  warning: 5
  info: 3
  total: 9
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-24T12:00:00Z
**Depth:** standard
**Files Reviewed:** 27 (excluding shadcn UI components — generated code)
**Status:** issues_found

## Summary

Phase 02 implements user management (listing, invites) and exam CRUD (models, API, builder UI) with tenant isolation. The overall architecture is solid: tenant scoping via `HasInstitute`/`InstituteScope`, role-based middleware on admin routes, and proper Form Request validation. However, the review identified **1 critical bug** (question type mismatch between factories/tests and validation rules), **5 warnings** (missing MCQ correct-answer validation, stale-data risk on form submit, misleading email claim, UI allowing forbidden actions, duplicate database indexes), and **3 info items** (redundant cascade delete, unescaped LIKE wildcards, super_admin route access gap).

## Critical Issues

### CR-01: QuestionFactory and ExamBuilderTest use outdated question type values

**File:** `database/factories/QuestionFactory.php:18`, `tests/Feature/Admin/ExamBuilderTest.php:56,63`
**Issue:** The QuestionFactory default definition uses `randomElement(['mcq', 'tf', 'written'])` and the `trueFalse()` state uses `'tf'`. The `ExamBuilderTest::validExamPayload()` test helper also uses `'type' => 'tf'` (line 56) and `'type' => 'written'` (line 63). However, both `StoreExamRequest` and `UpdateExamRequest` validate with `'in:mcq,true_false,written_answer'`. The types `tf` and `written` fail this validation rule, meaning:

1. Any test using `validExamPayload()` with the default questions (e.g., `test_admin_can_create_exam_with_all_question_types`) will receive validation errors instead of the expected redirect.
2. Factory-created questions have types that won't match application logic (e.g., `after()` closures checking `$type === 'true_false'`).

This was introduced when Plan 02-04 aligned type values to `mcq`/`true_false`/`written_answer` but did not update the factory or test payloads.

**Fix:**

In `database/factories/QuestionFactory.php`:
```php
// Line 18: change
'type' => fake()->randomElement(['mcq', 'tf', 'written']),
// to
'type' => fake()->randomElement(['mcq', 'true_false', 'written_answer']),

// Line 34 (trueFalse state): change
'type' => 'tf',
// to
'type' => 'true_false',

// Line 42 (written state): change
'type' => 'written',
// to
'type' => 'written_answer',
```

In `tests/Feature/Admin/ExamBuilderTest.php`:
```php
// Line 56: change
'type' => 'tf',
// to
'type' => 'true_false',

// Line 63: change
'type' => 'written',
// to
'type' => 'written_answer',
```

## Warnings

### WR-01: MCQ validation does not require at least one correct answer

**File:** `app/Http/Requests/Admin/StoreExamRequest.php:43-45`, `app/Http/Requests/Admin/UpdateExamRequest.php:43-45`
**Issue:** The `after()` validator closures check that MCQ questions have at least 2 choices, but never verify that at least one choice has `is_correct = true`. An admin can submit an MCQ question where every choice is `false`, creating an unanswerable question. During AI/automated grading, no student answer would be marked correct.
**Fix:**
```php
if ($type === 'mcq' && (empty($question['choices']) || count($question['choices']) < 2)) {
    $validator->errors()->add("questions.{$i}.choices", 'Multiple choice questions must have at least 2 choices.');
}

if ($type === 'mcq' && !empty($question['choices'])) {
    $hasCorrect = collect($question['choices'])->contains('is_correct', true);
    if (!$hasCorrect) {
        $validator->errors()->add("questions.{$i}.choices", 'Multiple choice questions must have at least one correct answer.');
    }
}
```

### WR-02: ExamBuilder.tsx handleSubmit relies on synchronous setData before post/put

**File:** `resources/js/pages/Admin/Exams/Builder.tsx:211-218`
**Issue:** `handleSubmit` calls `setData('status', status)` then immediately calls `put()` or `post()`. Since `setData` triggers a React state update, the submitted data may still contain the old `status` value (`'draft'`). Inertia v3's `useForm` uses internal refs that are updated synchronously, which makes this work in practice — but it is a fragile pattern that relies on Inertia internals and could break in future versions.
**Fix:** Restructure to avoid the race by using `transform()` or including status in the URL/options:
```tsx
function handleSubmit(submitStatus: 'draft' | 'published') {
    const payload = { ...data, status: submitStatus };

    if (isEditing && exam) {
        put(examsUpdate.url(exam.id), {
            preserveScroll: true,
            data: payload,
        });
    } else {
        post(examsStore.url(), {
            preserveScroll: true,
            data: payload,
        });
    }
}
```
Alternatively, use Inertia's `router.post`/`router.put` directly with explicit data instead of `useForm`'s methods.

### WR-03: Show.tsx renders Edit button for published exams

**File:** `resources/js/pages/Admin/Exams/Show.tsx:165-171`
**Issue:** The Show page renders an "Edit" button when `exam.status === 'published'`. However, `UpdateExamRequest::authorize()` returns `false` for non-draft exams, so saving any changes returns 403. The user can click Edit, load the Builder, modify content, and only then discover they cannot save. This is a UX bug that wastes user effort and creates confusion.
**Fix:** Only show the Edit button for draft exams:
```tsx
{exam.status === 'draft' && (
    <>
        <Button variant="outline" asChild>
            <Link href={examsEdit.url(exam.id)}>Edit</Link>
        </Button>
        <Button onClick={() => openConfirm('publish')}>Publish</Button>
    </>
)}
{exam.status === 'published' && (
    <Button variant="destructive" onClick={() => openConfirm('unpublish')}>
        Unpublish
    </Button>
)}
```

### WR-04: UserInviteController claims email sent without sending

**File:** `app/Http/Controllers/Admin/UserInviteController.php:37-39`
**Issue:** When `send_email` is `true`, the flash message says `"User invited and email sent."` — but no email dispatch logic exists. No `Mail::send()`, no notification, no queued job. The user sees a success message implying an email was delivered when nothing was sent. This misleads admins into thinking invitees were notified.
**Fix:** Either implement email sending or change the message to be honest about what happened:
```php
// Option A: Remove the misleading conditional message for now
$message = __('User created successfully. Email invitations are not yet configured.');

// Option B: Implement actual email sending (preferred long-term)
if ($request->validated('send_email', false)) {
    $user->notify(new InviteUserNotification());
    $message = __('User invited and email sent.');
} else {
    $message = __('User created successfully.');
}
```

### WR-05: Exam migration creates duplicate indexes on foreign key columns

**File:** `database/migrations/2026_04_23_155400_create_exams_tables.php:13,21,26,34,39,43`
**Issue:** `foreignId()->constrained()` automatically creates an index on the column via the foreign key constraint. The migration then adds explicit `$table->index()` calls on the same columns, creating redundant duplicate indexes. Affected columns:
- `exams.institute_id` (line 13 + line 21)
- `questions.exam_id` (line 26 + line 34)
- `question_choices.question_id` (line 39 + line 43)

Duplicate indexes waste disk space, slow down INSERT/UPDATE operations (two indexes to maintain), and provide no query benefit.
**Fix:** Remove the explicit `$table->index()` lines (21, 34, 43) since the foreign key constraints already create indexes:
```php
Schema::create('exams', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
    // ... other columns ...
    // Remove: $table->index('institute_id');
});
```

## Info

### IN-01: ExamController update() redundantly deletes choices before cascade

**File:** `app/Http/Controllers/Admin/ExamController.php:84-87`
**Issue:** Lines 84-86 iterate each question to delete its choices individually (`$question->choices()->delete()`), then line 87 deletes all questions (`$exam->questions()->delete()`). Since the `question_choices` foreign key has `cascadeOnDelete` (migration line 39), deleting questions automatically deletes their choices. The manual choice deletion is unnecessary and adds N extra DELETE queries (one per question).
**Fix:** Remove lines 84-86 and rely on cascade:
```php
$exam->questions()->delete();
$this->syncQuestions($exam, $request->validated('questions'));
```

### IN-02: LIKE search wildcards not escaped in user input

**File:** `app/Http/Controllers/Admin/UserController.php:19`, `app/Http/Controllers/Admin/ExamController.php:22`
**Issue:** User search input is interpolated into LIKE patterns as `"%{$search}%"` without escaping `%` and `_` wildcard characters. This is NOT a SQL injection risk (Laravel uses parameterized queries), but a user typing `%` or `_` in the search box could match unintended rows. For example, searching `%` would match all records.
**Fix:** Escape LIKE wildcards in the search term:
```php
->when($request->input('search'), function ($query, $search) {
    $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $search);
    $query->where(function ($q) use ($escaped) {
        $q->where('name', 'like', "%{$escaped}%")
            ->orWhere('email', 'like', "%{$escaped}%");
    });
})
```

### IN-03: EnsureInstituteAdmin blocks super_admin from admin routes

**File:** `app/Http/Middleware/EnsureInstituteAdmin.php:13`
**Issue:** The middleware checks `$request->user()?->isInstituteAdmin()` which only returns `true` for users with the `institute_admin` role. A `super_admin` user attempting to access `/admin/*` routes receives 403. This is by design (super_admin has a separate `/super-admin` prefix), but worth documenting for future developers who might expect super_admin to have access to all routes.
**Fix:** If super_admin should access admin routes (common pattern):
```php
if (! $request->user()?->isInstituteAdmin() && ! $request->user()?->isSuperAdmin()) {
    abort(403);
}
```
If the current behavior is intentional, add a comment documenting the decision.

---

_Reviewed: 2026-04-24T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
