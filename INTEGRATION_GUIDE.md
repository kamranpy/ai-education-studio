# AI Education Studio — Integration Guide

This document is maintained throughout development to serve as a reference for future frontend projects and mobile app integrations.

## Multi-Tenancy Rules

### Data Isolation

All tenant-specific data is isolated using a global Eloquent scope. The `HasInstitute` trait **must** be applied to any model that contains tenant-specific data.

```php
use App\Traits\HasInstitute;

class Exam extends Model
{
    use HasInstitute;
}
```

**What `HasInstitute` does:**
- Applies `InstituteScope` globally — all queries are automatically filtered by `institute_id`
- On `creating`, auto-assigns the current user's `institute_id` if not already set
- Provides the `institute()` BelongsTo relationship

**Super Admin bypass:** Users with the `super_admin` role bypass the `InstituteScope` entirely and can see all records across all institutes. This is checked via `$user->isSuperAdmin()`.

### Roles

Roles are stored in a dedicated `roles` table and connected to users via a `role_id` foreign key.

**Schema:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `name` | string | Human-readable name (e.g., "Super Admin") |
| `slug` | string | Machine-readable identifier (e.g., "super_admin") |

**Default roles (seeded via `RoleSeeder`):**

| Slug | Name | Scope | Description |
|------|------|-------|-------------|
| `super_admin` | Super Admin | Global | Platform owner. Sees all institutes and data. No `institute_id`. |
| `institute_admin` | Institute Admin | Tenant | Manages their institute's exams, students, and settings. |
| `student` | Student | Tenant | Takes exams and views results within their institute. |

**Constants:** Use `Role::SUPER_ADMIN`, `Role::INSTITUTE_ADMIN`, `Role::STUDENT` instead of raw strings.

**User helper methods:**
- `$user->hasRole('super_admin')` — check by slug
- `$user->isSuperAdmin()` — shorthand
- `$user->isInstituteAdmin()` — shorthand
- `$user->isStudent()` — shorthand
- `$user->role` — returns the related `Role` model

### Authentication Flow

- **Registration:** Creates an `Institute` and `User` atomically via `DB::transaction`. The user is assigned the `institute_admin` role via `role_id`.
- **Login redirect:** `LoginResponse` checks `auth()->user()->role->slug` and redirects to the corresponding dashboard route:
  - `super_admin` → `/super-admin/dashboard`
  - `institute_admin` → `/admin/dashboard`
  - `student` → `/student/dashboard`

### Route Structure

| Prefix | Role | Example |
|--------|------|---------|
| `/super-admin/*` | Super Admin | `/super-admin/dashboard` |
| `/admin/*` | Institute Admin | `/admin/dashboard` |
| `/student/*` | Student | `/student/dashboard` |

### Key Models

| Model | Tenant-scoped | Notes |
|-------|--------------|-------|
| `User` | Yes (via `HasInstitute`) | UUID primary key. Has `institute_id` and `role_id` |
| `Role` | No | Lookup table for user roles |
| `Institute` | No | Top-level tenant entity |

### Database Schema (Phase 1)

```
institutes
├── id
├── name
├── status (boolean)
└── timestamps

roles
├── id
├── name (unique)
├── slug (unique)
└── timestamps

users
├── id (UUID, primary key)
├── institute_id (FK → institutes, nullable)
├── role_id (FK → roles)
├── name
├── email
├── password
└── timestamps
```

## Exam API (Phase 2)

### Endpoints

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| GET | `/admin/exams` | `admin.exams.index` | List exams (paginated, filterable) |
| GET | `/admin/exams/create` | `admin.exams.create` | Show exam builder form |
| POST | `/admin/exams` | `admin.exams.store` | Create a new exam |
| GET | `/admin/exams/{exam}/edit` | `admin.exams.edit` | Edit an existing draft exam |
| PUT | `/admin/exams/{exam}` | `admin.exams.update` | Update a draft exam |
| POST | `/admin/exams/{exam}/publish` | `admin.exams.publish` | Publish a draft exam |
| POST | `/admin/exams/{exam}/unpublish` | `admin.exams.unpublish` | Unpublish a published exam |

All endpoints require `auth` + `verified` middleware and the `EnsureInstituteAdmin` middleware.

### Exam Lifecycle

```
draft → published → locked (once students begin)
  ↑         ↓
  └── unpublish
```

- **Draft:** Fully editable. Questions and choices can be added, modified, or deleted.
- **Published:** Visible to students. Cannot be structurally edited. Can be unpublished.
- **Locked:** Cannot be modified or unpublished. Set when first student attempt begins (future phase).

### Create/Update Payload

```json
{
  "title": "Midterm Exam",
  "description": "A comprehensive midterm covering chapters 1-5.",
  "time_limit_minutes": 60,
  "passing_score": 50,
  "questions": [
    {
      "type": "mcq",
      "text": "What is 2+2?",
      "points": 5,
      "choices": [
        { "text": "3", "is_correct": false },
        { "text": "4", "is_correct": true },
        { "text": "5", "is_correct": false }
      ]
    },
    {
      "type": "true_false",
      "text": "The earth is flat.",
      "points": 2,
      "choices": [
        { "text": "True", "is_correct": false },
        { "text": "False", "is_correct": true }
      ]
    },
    {
      "type": "written_answer",
      "text": "Explain photosynthesis.",
      "points": 10,
      "grading_guidelines": "Should mention light, CO2, water, glucose, and chlorophyll."
    }
  ]
}
```

### Question Types

| Type | `type` value | Choices Required | Grading Guidelines |
|------|-------------|------------------|--------------------|
| Multiple Choice | `mcq` | Yes (min 2) | No |
| True/False | `true_false` | Yes (exactly 2) | No |
| Written Answer | `written_answer` | No | Yes (required) |

### Validation Rules

- `title`: required, string, max 255
- `passing_score`: required, integer, 0-100
- `time_limit_minutes`: optional, integer, 1-480
- `questions`: required, array, min 1
- MCQ questions must have at least 2 choices with `text` and `is_correct` fields
- Written questions must have `grading_guidelines`
- Each question requires `type` (mcq/true_false/written_answer), `text`, and `points` (1-100)
- True/False questions must have exactly 2 choices

### Update Behavior

When updating a draft exam, **all existing questions and choices are deleted and recreated** from the submitted payload. This is safe during the draft phase and avoids orphaned records. Once an exam is published or locked, structural edits are blocked.

### Database Schema (Phase 2)

```
exams
├── id
├── institute_id (FK → institutes)
├── title
├── description (nullable)
├── time_limit_minutes (nullable)
├── passing_score (default: 50)
├── status (draft/published/locked)
└── timestamps

questions
├── id
├── exam_id (FK → exams, cascade delete)
├── type (mcq/true_false/written_answer)
├── text
├── points (default: 1)
├── grading_guidelines (nullable)
├── order
└── timestamps

question_choices
├── id
├── question_id (FK → questions, cascade delete)
├── text
├── is_correct (default: false)
└── timestamps
```

### Key Models

| Model | Tenant-scoped | Notes |
|-------|--------------|-------|
| `User` | Yes (via `HasInstitute`) | UUID primary key. Has `institute_id` and `role_id` |
| `Role` | No | Lookup table for user roles |
| `Institute` | No | Top-level tenant entity |
| `Exam` | Yes (via `HasInstitute`) | Belongs to an institute, has many questions |
| `Question` | No (scoped via Exam) | Belongs to an exam, has many choices |
| `QuestionChoice` | No (scoped via Question) | Belongs to a question |

---

*This document is updated as new features are added. Check the git log for the latest version.*
