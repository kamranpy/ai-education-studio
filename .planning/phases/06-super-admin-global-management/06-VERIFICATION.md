---
phase: "06"
status: human_needed
automated_checks: 12
automated_passed: 11
automated_failed: 1
human_verification: 5
created: "2026-05-09"
---

# Phase 06: Super Admin & Global Management — Verification

## Phase Goal

Super Admin can oversee all institutes, manage global billing, and view global analytics.

## Success Criteria Coverage

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Super Admin can view a list of all registered institutes | ✓ Implemented |
| 2 | Super Admin can configure global billing keys and credit packages | ✓ Implemented |
| 3 | Super Admin can view global analytics across all institutes | ✓ Implemented |
| 4 | Unit tests written and pass for all phase features | ✗ No Phase 6 tests written |
| 5 | INTEGRATION_GUIDE.md updated with new API contracts | ? Needs human check |

---

## Automated Checks

| # | Check | Status |
|---|-------|--------|
| 1 | `InstituteController` exists with index/toggleStatus/adjustCredits/destroy | ✓ PASS |
| 2 | 4 institute routes registered (GET/PATCH/POST/DELETE) | ✓ PASS |
| 3 | `DashboardController` exists with range-filtered analytics queries | ✓ PASS |
| 4 | Dashboard route is controller-based (not Route::inertia) | ✓ PASS |
| 5 | `StripeSettingController` exists with index/store | ✓ PASS |
| 6 | 2 billing routes registered (GET/POST /super-admin/billing) | ✓ PASS |
| 7 | `StripeSetting` model with encrypted casts and masked accessors | ✓ PASS |
| 8 | `BillingController` reads Stripe key from DB with .env fallback | ✓ PASS |
| 9 | `StripeWebhookController` reads webhook secret from DB with .env fallback | ✓ PASS |
| 10 | `transactions` table has `type` and `notes` columns | ✓ PASS |
| 11 | `stripe_settings` table exists | ✓ PASS |
| 12 | Unit tests for Phase 6 features | ✗ FAIL — no tests written |

---

## Requirement Traceability

| Requirement | Description | Status |
|-------------|-------------|--------|
| SADM-01 | Super Admin can oversee and manage all registered institutes | ✓ Implemented |
| SADM-02 | Super Admin can manage global billing configurations | ✓ Implemented |
| SADM-03 | Super Admin can view global analytics across all institutes | ✓ Implemented |
| TEST-01 | Unit tests written and pass | ✗ Not done |
| DOCS-01 | INTEGRATION_GUIDE.md updated | ? Needs human check |

---

## Human Verification Needed

| # | Item | Steps | Expected |
|---|------|-------|----------|
| 1 | Institutes list renders correctly | Login as super admin → navigate to `/super-admin/institutes` → verify table shows all institutes with Name, Status, Credits, Exams, Users columns | Table renders with correct data |
| 2 | Suspend/Activate toggle works | Click Suspend on an active institute → verify status badge changes to Suspended → click Activate → verify it returns to Active | Status toggles and toast appears |
| 3 | Credit adjustment dialog works | Click "Adjust Credits" → enter amount (e.g. 50) and a note → submit → verify credits updated and transaction recorded | Credits change, manual_adjustment transaction created |
| 4 | Analytics dashboard renders with charts | Navigate to `/super-admin/dashboard` → verify 4 stat cards and 3 charts render → change time range filter → verify charts update | Charts render without errors, range filter works |
| 5 | Stripe billing config saves keys | Navigate to `/super-admin/billing` → enter a Stripe secret key → save → verify masked key shown → re-save without entering key → verify existing key preserved | Keys stored encrypted, not wiped on re-save |

---

## Known Gap: No Unit Tests (TEST-01)

Phase 6 did not include unit tests for the new controllers and models. This is a gap against the TEST-01 requirement that applies to every phase.

**What needs tests:**
- `InstituteController` — index, toggleStatus, adjustCredits, destroy
- `DashboardController` — range filtering, stat card queries, chart queries
- `StripeSettingController` — index (no raw key exposure), store (key preservation)
- `StripeSetting` model — encrypted casts, masked accessors

**Recommended:** Run `/gsd-add-tests 6` after human verification passes to add the missing test coverage.

---

## Must-Haves Verified

- [x] `GET /super-admin/institutes` renders institute list with counts
- [x] `PATCH /super-admin/institutes/{institute}/toggle-status` flips status
- [x] `POST /super-admin/institutes/{institute}/adjust-credits` validates, increments credits atomically, creates manual_adjustment transaction
- [x] `DELETE /super-admin/institutes/{institute}` deletes with cascade
- [x] `GET /super-admin/dashboard` served by DashboardController with range filtering
- [x] Analytics queries filter by 7d/30d/90d/all
- [x] `GET /super-admin/billing` shows Stripe config + transaction log (never raw keys)
- [x] `POST /super-admin/billing` stores keys encrypted, preserves existing on re-save
- [x] BillingController reads Stripe key from DB with .env fallback
- [x] StripeWebhookController reads webhook secret from DB with .env fallback
- [x] `stripe_settings` table with encrypted columns exists
- [x] `transactions.type` and `transactions.notes` columns exist
- [ ] Unit tests for Phase 6 features (TEST-01)
