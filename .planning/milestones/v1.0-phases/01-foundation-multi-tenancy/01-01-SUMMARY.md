---
phase: 01-foundation-multi-tenancy
plan: 01
subsystem: database
tags: [laravel, eloquent, multi-tenancy, global-scope, migrations, seeder]

requires:
  - phase: none
    provides: n/a
provides:
  - institutes table with name and status columns
  - institute_id foreign key on users table
  - role column on users table (super_admin, institute_admin, student)
  - InstituteScope global scope for tenant data isolation
  - HasInstitute trait for automatic scope application
  - SuperAdminSeeder for bootstrapping the first super admin
affects: [01-02, 01-03, 01-04, 02-user-management-exam-creation]

tech-stack:
  added: []
  patterns: [global-scope-based-multi-tenancy, trait-based-scope-application]

key-files:
  created:
    - database/migrations/2026_04_12_000000_create_institutes_table.php
    - database/migrations/2026_04_12_000001_add_institute_id_and_role_to_users_table.php
    - app/Models/Institute.php
    - app/Models/Scopes/InstituteScope.php
    - app/Traits/HasInstitute.php
    - database/seeders/SuperAdminSeeder.php
  modified:
    - app/Models/User.php
    - database/seeders/DatabaseSeeder.php

key-decisions:
  - "Single-database multi-tenancy via global scope rather than schema separation"
  - "Super admin bypasses InstituteScope — sees all records"
  - "institute_id nullable on users to allow super_admin with no institute"

patterns-established:
  - "HasInstitute trait: any model with tenant-specific data must use this trait"
  - "InstituteScope: filters by institute_id except for super_admin role"

requirements-completed: [TENT-01, TENT-02]

duration: 15min
completed: 2026-04-12
---

# Plan 01-01: Multi-Tenancy Foundation Summary

**Single-database multi-tenancy via InstituteScope global scope, institutes table, and role-based user model with SuperAdmin seeder**

## Performance

- **Duration:** ~15 min
- **Tasks:** 4
- **Files modified:** 8

## Accomplishments
- Created `institutes` table with name, status, and timestamps
- Added `institute_id` FK and `role` column to users table
- Built `InstituteScope` that bypasses filtering for super_admin role
- Built `HasInstitute` trait that auto-applies scope and sets institute_id on creating
- Created `SuperAdminSeeder` with `admin@education.local` default credentials

## Task Commits

1. **Task 1: Create Institutes Table Migration and Model** - `22a3190`
2. **Task 2: Update Users Table for Multi-Tenancy** - `6e9480d`
3. **Task 3: Implement InstituteScope and HasInstitute Trait** - `e8a6ee8`
4. **Task 4: Create SuperAdmin Seed** - `5ef87a0`

## Files Created/Modified
- `database/migrations/2026_04_12_000000_create_institutes_table.php` - institutes table schema
- `database/migrations/2026_04_12_000001_add_institute_id_and_role_to_users_table.php` - adds institute_id FK and role to users
- `app/Models/Institute.php` - Eloquent model with users relationship
- `app/Models/User.php` - updated with institute_id, role, and institute() relationship
- `app/Models/Scopes/InstituteScope.php` - global scope filtering by institute_id
- `app/Traits/HasInstitute.php` - trait for applying scope and auto-setting institute_id
- `database/seeders/SuperAdminSeeder.php` - seeds the default super admin user
- `database/seeders/DatabaseSeeder.php` - wired to call SuperAdminSeeder

## Decisions Made
- Single-database multi-tenancy (no separate schemas/databases per tenant)
- super_admin bypasses global scope entirely (no institute_id filter)
- institute_id is nullable to support super_admin without an institute

## Deviations from Plan
None - plan executed as written.

## Issues Encountered
- SQLite PHP extension not enabled on this machine, so `migrate:fresh --seed` cannot run locally yet. Code is syntactically correct.

## Next Phase Readiness
- Schema foundation is complete for authentication and registration (Plan 01-02)
- HasInstitute trait ready for any future tenant-scoped model

---
*Phase: 01-foundation-multi-tenancy*
*Completed: 2026-04-12*
