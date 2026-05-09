---
phase: "05"
status: verified
automated_checks: 8
automated_passed: 8
automated_failed: 0
human_verification: 4
human_verified: 4
created: "2026-05-01"
verified: "2026-05-09"
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

## Human Verification

| # | Item | Status |
|---|------|--------|
| 1 | Admin billing page renders with packages | ✓ PASS |
| 2 | Buy button triggers Stripe redirect | ✓ PASS |
| 3 | Zero-credits warning banner appears | ✓ PASS |
| 4 | Student blocked from starting exam at 0 credits | ✓ PASS |

## Must-Haves Verified

- [x] Database contains `credit_packages` and `transactions` tables
- [x] `institutes` table has a `credits` integer column defaulting to 0
- [x] Models are properly wired with Eloquent relationships
- [x] Admin can navigate to `/admin/billing`
- [x] Webhook controller validates Stripe signature
- [x] Webhook route excluded from CSRF protection
- [x] Credit deduction uses `lockForUpdate()` within DB transaction
- [x] Student blocked from new exam if credits ≤ 0
