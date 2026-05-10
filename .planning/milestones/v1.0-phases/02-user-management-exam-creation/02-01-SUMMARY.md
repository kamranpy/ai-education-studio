---
phase: 02-user-management-exam-creation
plan: "01"
subsystem: ui, api
tags: [laravel, inertia, react, tenant-scoping, user-management, shadcn, wayfinder]

requires:
  - phase: 01-foundation-multi-tenancy
    provides: "HasInstitute trait, InstituteScope, Role model, User model with UUIDs"
provides:
  - "UserController with paginated, filterable, tenant-scoped user listing"
  - "UserInviteController for admin user creation with role restrictions"
  - "EnsureInstituteAdmin middleware for admin route protection"
  - "Users Index page with search, filter, pagination, and status badges"
  - "User Invite form with Inertia useForm, role selection, and email toggle"
  - "Admin layout sidebar navigation with Wayfinder-typed links"
  - "User status column (active/invited/disabled) on users table"
affects: [02-exam-creation, 03-student-exam-experience]

tech-stack:
  added: [shadcn-table]
  patterns: [admin-middleware-guard, wayfinder-controller-actions, tenant-scoped-controllers]

key-files:
  created:
    - app/Http/Controllers/Admin/UserController.php
    - app/Http/Controllers/Admin/UserInviteController.php
    - app/Http/Middleware/EnsureInstituteAdmin.php
    - app/Http/Requests/Admin/StoreUserInviteRequest.php
    - database/migrations/2026_04_23_153501_add_status_to_users_table.php
    - tests/Feature/Admin/UserManagementTest.php
    - resources/js/pages/Admin/Users/Index.tsx
    - resources/js/pages/Admin/Users/Invite.tsx
    - resources/js/components/ui/table.tsx
  modified:
    - app/Models/User.php
    - routes/web.php
    - resources/js/layouts/admin-layout.tsx

key-decisions:
  - "EnsureInstituteAdmin middleware protects all /admin routes"
  - "User status column (active/invited/disabled) added to users table"
  - "Admin cannot assign super_admin role via invite form (validated server-side)"

patterns-established:
  - "Admin route protection: EnsureInstituteAdmin middleware on admin prefix group"
  - "Controller tenant scoping: HasInstitute global scope handles isolation automatically"
  - "Frontend navigation: Wayfinder typed route imports for type-safe navigation"

requirements-completed: [TENT-03, TEST-01]

duration: 13min
completed: 2026-04-23
---

# Phase 02 Plan 01: User Management & Invites Summary

**Tenant-scoped user listing with search/filter/pagination and admin invite form using Inertia useForm + EnsureInstituteAdmin middleware**

## Performance

- **Duration:** 13 min
- **Started:** 2026-04-23T15:34:38Z
- **Completed:** 2026-04-23T15:47:37Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Admin can view paginated, searchable user list scoped to their institute
- Admin can invite users with name, email, role, and email toggle — role restricted to non-super-admin
- Admin routes protected by EnsureInstituteAdmin middleware (403 for non-admins)
- Admin layout sidebar updated with Wayfinder-typed navigation links (Dashboard, Users, Exams, Settings)
- 12 feature tests pass covering CRUD, tenant isolation, authorization, and validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Backend Controllers and Tests** - `478a627` (feat)
2. **Task 2: Frontend UI Components** - `e561a32` (feat)

## Files Created/Modified
- `app/Http/Controllers/Admin/UserController.php` - Paginated user index with search, role, and status filters
- `app/Http/Controllers/Admin/UserInviteController.php` - Create/store for inviting users to institute
- `app/Http/Middleware/EnsureInstituteAdmin.php` - Role-based middleware for admin routes
- `app/Http/Requests/Admin/StoreUserInviteRequest.php` - Validation + authorization (blocks super_admin role)
- `database/migrations/2026_04_23_153501_add_status_to_users_table.php` - Adds status column to users
- `tests/Feature/Admin/UserManagementTest.php` - 12 tests for endpoints, isolation, auth, validation
- `resources/js/pages/Admin/Users/Index.tsx` - User table with search, filters, pagination, status badges
- `resources/js/pages/Admin/Users/Invite.tsx` - Invite form with useForm, role select, checkboxes
- `resources/js/components/ui/table.tsx` - shadcn table component (installed)
- `resources/js/layouts/admin-layout.tsx` - Updated with sidebar nav and Wayfinder routes
- `app/Models/User.php` - Added status to fillable attributes
- `routes/web.php` - Registered admin user management routes with middleware

## Decisions Made
- **EnsureInstituteAdmin middleware:** Created dedicated middleware instead of inline policy checks to protect all admin routes consistently. Applied to the entire `/admin` prefix group.
- **User status column:** Added `status` column (active/invited/disabled) with default `active` to enable UI status badges. Derived status from explicit field rather than email_verified_at inference for clarity.
- **Role restriction in FormRequest:** `StoreUserInviteRequest` validates `role_id` against only institute_admin and student roles, preventing privilege escalation (threat model T-02-02).
- **Wayfinder over hardcoded URLs:** Used Wayfinder-generated typed route helpers for all frontend navigation per project convention.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added EnsureInstituteAdmin middleware**
- **Found during:** Task 1 (Route registration)
- **Issue:** Plan mentions "tenant middleware" but no role-based access middleware existed. Threat model T-02-02 requires verifying the inviter is an Admin.
- **Fix:** Created EnsureInstituteAdmin middleware checking `isInstituteAdmin()`, applied to all `/admin` routes.
- **Files modified:** `app/Http/Middleware/EnsureInstituteAdmin.php`, `routes/web.php`
- **Verification:** test_non_admin_cannot_access_users_index and test_non_admin_cannot_invite_users both pass (assert 403)
- **Committed in:** 478a627

**2. [Rule 2 - Missing Critical] Added user status migration**
- **Found during:** Task 1 (UserInviteController implementation)
- **Issue:** UI-SPEC requires status badges (Active/Invited/Disabled) but users table had no status column.
- **Fix:** Created migration adding `status` column with default `active` and index. Updated User model fillable.
- **Files modified:** `database/migrations/2026_04_23_153501_add_status_to_users_table.php`, `app/Models/User.php`
- **Verification:** Invited users saved with status `invited`, migration runs cleanly.
- **Committed in:** 478a627

**3. [Rule 2 - Missing Critical] Added StoreUserInviteRequest form validation**
- **Found during:** Task 1 (UserInviteController implementation)
- **Issue:** Plan mentions accepting fields but didn't specify a Form Request. Laravel best practices and threat model T-02-02 require server-side validation and authorization.
- **Fix:** Created dedicated FormRequest with validation rules and `authorize()` checking admin role.
- **Files modified:** `app/Http/Requests/Admin/StoreUserInviteRequest.php`
- **Verification:** test_admin_cannot_assign_super_admin_role, test_invite_requires_valid_email, test_invite_rejects_duplicate_email all pass.
- **Committed in:** 478a627

---

**Total deviations:** 3 auto-fixed (3 missing critical)
**Impact on plan:** All auto-fixes necessary for security and correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Self-Check: PASSED

All 9 created files verified present. Both commit hashes (478a627, e561a32) verified in git log. TypeScript compiles cleanly. All 12 tests pass.

## Next Phase Readiness
- User management backend and frontend complete, ready for exam model creation (Plan 02-02)
- Admin layout sidebar includes Exams link (pointing to `/admin/exams` - will be wired in Plan 02-03)
- EnsureInstituteAdmin middleware established as pattern for all future admin routes

---
*Phase: 02-user-management-exam-creation*
*Completed: 2026-04-23*
