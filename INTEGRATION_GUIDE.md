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

**Super Admin bypass:** Users with `role = 'super_admin'` bypass the `InstituteScope` entirely and can see all records across all institutes.

### User Roles

| Role | Scope | Description |
|------|-------|-------------|
| `super_admin` | Global | Platform owner. Sees all institutes and data. No `institute_id`. |
| `institute_admin` | Tenant | Manages their institute's exams, students, and settings. |
| `student` | Tenant | Takes exams and views results within their institute. |

### Authentication Flow

- **Registration:** Creates an `Institute` and `User` atomically via `DB::transaction`. The user is assigned `role = 'institute_admin'`.
- **Login redirect:** `LoginResponse` checks `auth()->user()->role` and redirects to the corresponding dashboard route:
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
| `User` | Yes (via `HasInstitute`) | Has `institute_id` and `role` |
| `Institute` | No | Top-level entity |

---

*This document is updated as new features are added. Check the git log for the latest version.*
