---
phase: "06"
plan: "02"
name: "Institutes Management"
status: "completed"
---

# Phase 06 Plan 02: Institutes Management — Summary

## What Was Done

All 5 tasks completed successfully.

### Task 1 — InstituteController
Created `app/Http/Controllers/SuperAdmin/InstituteController.php` with four methods:
- `index()` — lists all institutes with `withCount(['users', 'exams'])`, maps to plain arrays, renders `SuperAdmin/Institutes/Index`
- `toggleStatus()` — flips `status` boolean, flashes toast, redirects
- `adjustCredits()` — validates `amount` (integer, not_in:0) and optional `notes`, wraps credit increment + transaction creation in `DB::transaction`, flashes toast, redirects
- `destroy()` — deletes institute (FK cascades handle related data), flashes toast, redirects

### Task 2 — Routes
Added to `routes/web.php` inside the `super-admin` prefix group with `EnsureSuperAdmin` middleware:
- `GET    super-admin/institutes` → `index` (name: `super_admin.institutes.index`)
- `PATCH  super-admin/institutes/{institute}/toggle-status` → `toggleStatus` (name: `super_admin.institutes.toggle-status`)
- `POST   super-admin/institutes/{institute}/adjust-credits` → `adjustCredits` (name: `super_admin.institutes.adjust-credits`)
- `DELETE super-admin/institutes/{institute}` → `destroy` (name: `super_admin.institutes.destroy`)

### Task 3 — Wayfinder
Ran `php artisan wayfinder:generate` (exit 0). Generated:
`resources/js/actions/App/Http/Controllers/SuperAdmin/InstituteController.ts`
with typed functions: `index`, `toggleStatus`, `adjustCredits`, `destroy`.

### Task 4 — Institutes/Index.tsx
Created `resources/js/pages/SuperAdmin/Institutes/Index.tsx`:
- Table listing all institutes with Name, Status badge (Active/Suspended), Credits, Exams, Users columns
- Inline actions: Suspend/Activate (router.patch), Adjust Credits (opens Dialog), Delete (confirm() + router.delete)
- Radix Dialog for credit adjustment with amount (number input) and notes (textarea) fields
- `useForm` for the adjustment form with processing state and inline error display
- `Institutes.layout` assigned to `SuperAdminLayout`

### Task 5 — super-admin-layout.tsx
Updated `resources/js/layouts/super-admin-layout.tsx`:
- Added `import { index as institutesIndex } from '@/actions/App/Http/Controllers/SuperAdmin/InstituteController'`
- Added `Building2` to the lucide-react import
- Added `{ title: 'Institutes', href: institutesIndex.url(), icon: Building2 }` between Dashboard and LLM Provider

## Verification Results

```
php artisan route:list --name=super_admin.institutes
  GET|HEAD   super-admin/institutes                              super_admin.institutes.index
  DELETE     super-admin/institutes/{institute}                  super_admin.institutes.destroy
  POST       super-admin/institutes/{institute}/adjust-credits   super_admin.institutes.adjust-credits
  PATCH      super-admin/institutes/{institute}/toggle-status    super_admin.institutes.toggle-status
  Showing [4] routes
```

- `getDiagnostics` on all 3 new/modified files: **No diagnostics found**
- Pre-existing TypeScript errors in 17 unrelated files (auth, settings, welcome) — not introduced by this plan

## Files Modified/Created

| File | Action |
|------|--------|
| `app/Http/Controllers/SuperAdmin/InstituteController.php` | Created |
| `routes/web.php` | Modified (import + 4 routes) |
| `resources/js/actions/App/Http/Controllers/SuperAdmin/InstituteController.ts` | Generated (Wayfinder) |
| `resources/js/pages/SuperAdmin/Institutes/Index.tsx` | Created |
| `resources/js/layouts/super-admin-layout.tsx` | Modified (import + Building2 + nav item) |
