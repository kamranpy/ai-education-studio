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
| `User` | Yes (via `HasInstitute`) | Has `institute_id` and `role_id` |
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
├── id
├── institute_id (FK → institutes, nullable)
├── role_id (FK → roles)
├── name
├── email
├── password
└── timestamps
```

---

*This document is updated as new features are added. Check the git log for the latest version.*
