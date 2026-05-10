# Phase 02: User Management & Exam Creation - Research

**Researched:** 2026-04-23
**Domain:** Laravel CRUD, React/Inertia Forms, shadcn/ui
**Confidence:** HIGH

## Summary

This phase focuses on expanding the Admin Dashboard to include user management (invitations) and a robust single-page exam builder. The exam builder will use a complex Inertia form with collapsible question cards (shadcn/ui). A soft-publishing lifecycle will be implemented to lock exams once students begin taking them.

**Primary recommendation:** Use Inertia's `useForm` for the single-page exam builder, leveraging React state for dynamic question arrays before submission, and standard Laravel validation for the complex nested payload.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Implement manual account creation plus email invites. This ensures the admin retains full control over the tenant's user roster while minimizing student onboarding friction.
- **D-02:** Implement a single-page form with collapsible question cards. This approach minimizes complex multi-step state management overhead by keeping everything in a single manageable Inertia payload prior to submission.
- **D-03:** Rely extensively on `shadcn/ui` components (e.g., forms, buttons, cards, accordions) for the interface, maintaining consistency with Phase 1 decisions.
- **D-04:** Use a "soft publishing" approach. Exams can be edited freely during the drafting phase. However, once the first student attempt begins, the exam is locked from further structural editing to prevent grading mechanism corruption.
- **D-05:** For written answer questions, provide a unified text area for "Grading Guidelines / Ideal Answer". The contents of this block will seamlessly pass to the LLM context prompt in Phase 4.

### Claude's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed entirely within the defined phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TENT-03 | Tenant admins can manage their own users (students/teachers) | Standard Laravel CRUD with Fortify/Mailable for invites |
| EXAM-01 | Admin can create a new exam with a title, description, and settings | Inertia useForm with shadcn/ui inputs |
| EXAM-02 | Admin can add Multiple Choice questions | Dynamic array in React state, nested Laravel validation |
| EXAM-03 | Admin can add True/False questions | Dynamic array in React state, nested Laravel validation |
| EXAM-04 | Admin can add Written Answer questions | Dynamic array in React state, text area for grading guidelines |
| EXAM-05 | Admin can publish or unpublish an exam | Soft publishing status toggle, validation on publish |
| TEST-01 | Write and run unit tests at the end of every phase | PHPUnit tests for nested form validation and publish logic |
| DOCS-01 | Maintain an INTEGRATION_GUIDE.md (API contract) | Document the complex JSON payload for exam creation |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Laravel | ^13.0 | Backend | Project standard |
| React | ^19.2.0 | Frontend | Project standard |
| Inertia.js | ^3.0.0 | SPA Routing/Forms | Project standard |
| shadcn/ui | latest | UI Components | Project standard (D-03) |
| lucide-react | ^0.475.0 | Icons | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dnd-kit / @hello-pangea/dnd | latest | Drag and drop | If reordering questions is needed (optional but common) |
| zod | latest | Schema validation | Frontend validation of the complex exam payload before Inertia submit |

## Architecture Patterns

### Recommended Project Structure
```
app/
├── Http/Controllers/Admin/
│   ├── UserController.php       # TENT-03
│   ├── UserInviteController.php # TENT-03
│   └── ExamController.php       # EXAM-01 to EXAM-05
├── Models/
│   ├── Exam.php                 # HasInstitute trait
│   ├── Question.php             # BelongsTo Exam
│   └── QuestionChoice.php       # BelongsTo Question (for MCQs)
resources/js/Pages/Admin/
├── Users/
│   ├── Index.tsx
│   └── InviteModal.tsx
└── Exams/
    ├── Index.tsx
    └── Builder.tsx              # Single-page form (D-02)
```

### Pattern 1: Nested Array Validation in Laravel
**What:** Validating the complex single-page exam payload.
**When to use:** When submitting the Exam Builder form.
**Example:**
```php
$request->validate([
    'title' => 'required|string|max:255',
    'questions' => 'required|array',
    'questions.*.type' => 'required|in:mcq,tf,written',
    'questions.*.text' => 'required|string',
    'questions.*.choices' => 'required_if:questions.*.type,mcq|array',
    'questions.*.choices.*.text' => 'required_with:questions.*.choices|string',
    'questions.*.choices.*.is_correct' => 'required_with:questions.*.choices|boolean',
    'questions.*.grading_guidelines' => 'required_if:questions.*.type,written|string',
]);
```

### Anti-Patterns to Avoid
- **Anti-pattern:** Creating questions one-by-one via separate API calls during drafting.
  - *Why it's bad:* Violates D-02 (single-page form), leads to orphaned records if the user abandons the draft.
  - *Instead:* Keep all state in React until the user clicks "Save Draft" or "Publish", then send the entire payload.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Complex form state | Custom state reducers | `useForm` from Inertia + simple React state | Inertia handles progress, errors, and submission lifecycle automatically |
| UI Components | Custom accordions/cards | `shadcn/ui` Accordion, Card | Accessibility and consistency (D-03) |
| Email sending | Custom SMTP wrappers | Laravel Mailables / Notifications | Built-in queuing and templating |

## Common Pitfalls

### Pitfall 1: Orphaned Choices on Update
**What goes wrong:** When updating an existing exam, old choices are left in the database when a question is modified or deleted.
**Why it happens:** The frontend sends a new array of choices without IDs, and the backend just creates new ones without deleting the old ones.
**How to avoid:** Sync relationships properly. Either delete all choices for a question and recreate them on update (simplest for drafts), or carefully track IDs in the frontend payload. Since exams are locked after the first attempt (D-04), deleting and recreating during the draft phase is safe and easiest.

### Pitfall 2: Inertia Payload Size Limits
**What goes wrong:** Very large exams fail to save.
**Why it happens:** PHP's `max_input_vars` or `post_max_size` limits are exceeded by massive nested arrays.
**How to avoid:** Keep the exam builder reasonable (e.g., max 100 questions). If necessary, send the payload as a JSON string and decode it in the controller, though standard limits usually support typical exams.

## Code Examples

### Dynamic Form State in React
```tsx
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export function ExamBuilder() {
    const { data, setData, post, errors } = useForm({
        title: '',
        description: '',
        questions: [],
    });

    const addQuestion = (type) => {
        setData('questions', [
            ...data.questions,
            { id: Date.now(), type, text: '', choices: [], grading_guidelines: '' }
        ]);
    };

    // ... render using shadcn/ui Accordion for questions
}
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | PHPUnit 12.5.12 |
| Config file | `phpunit.xml` |
| Quick run command | `vendor/bin/phpunit --filter {name}` |
| Full suite command | `vendor/bin/phpunit` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TENT-03 | Admin can invite users to their institute | unit | `vendor/bin/phpunit --filter test_admin_can_invite_users` | ❌ Wave 0 |
| EXAM-01 | Admin can create exam | unit | `vendor/bin/phpunit --filter test_admin_can_create_exam` | ❌ Wave 0 |
| EXAM-02 | Admin can add MCQ | unit | `vendor/bin/phpunit --filter test_exam_can_have_mcq` | ❌ Wave 0 |
| EXAM-03 | Admin can add T/F | unit | `vendor/bin/phpunit --filter test_exam_can_have_tf` | ❌ Wave 0 |
| EXAM-04 | Admin can add Written | unit | `vendor/bin/phpunit --filter test_exam_can_have_written` | ❌ Wave 0 |
| EXAM-05 | Admin can publish/unpublish | unit | `vendor/bin/phpunit --filter test_admin_can_publish_exam` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `vendor/bin/phpunit --filter {name}`
- **Per wave merge:** `vendor/bin/phpunit`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/Feature/Admin/UserManagementTest.php` — covers TENT-03
- [ ] `tests/Feature/Admin/ExamBuilderTest.php` — covers EXAM-01 to EXAM-05

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Laravel Fortify |
| V3 Session Management | yes | Laravel Session |
| V4 Access Control | yes | Laravel Policies / Gates (Tenant Isolation) |
| V5 Input Validation | yes | Laravel Form Requests |
| V6 Cryptography | no | — |

### Known Threat Patterns for Laravel/React

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-Tenant Data Access | Information Disclosure | Global Scopes (`HasInstitute` trait) and Route Model Binding scoped to tenant |
| Mass Assignment | Tampering | `$fillable` or `$guarded` on Eloquent models |
| XSS in Exam Content | Spoofing | React automatically escapes output; avoid `dangerouslySetInnerHTML` |

## Sources

### Primary (HIGH confidence)
- Project CONTEXT.md and REQUIREMENTS.md
- Laravel Documentation - Validation (Nested Arrays)
- Inertia.js Documentation - Forms

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Dictated by project architecture
- Architecture: HIGH - Standard Laravel/Inertia patterns
- Pitfalls: HIGH - Known issues with nested form submissions in Laravel

**Research date:** 2026-04-23
**Valid until:** 2026-05-23
