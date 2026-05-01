---
phase: "05"
status: human_needed
automated_checks: 8
automated_passed: 8
automated_failed: 0
human_verification: 4
created: "2026-05-01"
---

# Phase 05: Monetization & Billing — Verification

## Automated Checks

| # | Check | Status |
|---|-------|--------|
| 1 | `CreditPackage` model exists with fillable and casts | ✓ PASS |
| 2 | `Transaction` model exists with institute relationship | ✓ PASS |
| 3 | `institutes` migration adds `credits` column | ✓ PASS |
| 4 | Stripe SDK v20.1.0 installed and loadable | ✓ PASS |
| 5 | `BillingController` exists with checkout (dynamic Stripe Session) | ✓ PASS |
| 6 | `lockForUpdate()` used in both ExamAttemptController and StripeWebhookController | ✓ PASS |
| 7 | Webhook signature verification via `Webhook::constructEvent` | ✓ PASS |
| 8 | CSRF exclusion for `stripe/webhook` in bootstrap/app.php | ✓ PASS |

## Requirement Traceability

| Requirement | Description | Plan | Status |
|-------------|-------------|------|--------|
| BILL-01 | Institute Admin can purchase exam credits | 05-02 | ✓ Implemented |
| BILL-02 | System deducts credits per student exam attempt | 05-04 | ✓ Implemented |
| BILL-03 | System prevents exam starts if insufficient credits | 05-04 | ✓ Implemented |

## Human Verification Needed

| # | Item | Steps |
|---|------|-------|
| 1 | Admin billing page renders with packages | Login as admin → navigate to Billing → verify balance and package cards |
| 2 | Buy button triggers Stripe redirect | Click Buy on a package (with Stripe key configured) → verify redirect |
| 3 | Zero-credits warning banner appears | Set credits to 0 → go to Exams index → verify amber banner + link |
| 4 | Student blocked from starting exam at 0 credits | Set institute credits to 0 → try starting exam as student → verify error |

## Must-Haves Verified

- [x] Database contains `credit_packages` and `transactions` tables
- [x] `institutes` table has a `credits` integer column defaulting to 0
- [x] Models are properly wired with Eloquent relationships
- [x] Admin can navigate to `/admin/billing`
- [x] Webhook controller validates Stripe signature
- [x] Webhook route excluded from CSRF protection
- [x] Credit deduction uses `lockForUpdate()` within DB transaction
- [x] Student blocked from new exam if credits ≤ 0
