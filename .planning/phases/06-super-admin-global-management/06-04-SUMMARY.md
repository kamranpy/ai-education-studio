---
phase: "06"
plan: "04"
name: "Stripe Billing Config and Transaction Log"
status: "completed"
---

# Phase 06 Plan 04: Stripe Billing Config and Transaction Log — Summary

## What Was Done

### Task 1: StripeSettingController
- Created `app/Http/Controllers/SuperAdmin/StripeSettingController.php`
- `index()` passes `has_secret_key`, `masked_secret_key`, `has_webhook_secret`, `masked_webhook_secret` — never raw keys
- `store()` uses `getRawOriginal()` to carry forward existing encrypted ciphertext when no new value provided
- `DB::transaction` wraps deactivate + update/create atomically (mirrors LlmSettingController pattern)
- Loads paginated transaction log (`Transaction::with('institute')->latest()->paginate(50)`)

### Task 2: Routes
- Added `StripeSettingController` import to `routes/web.php`
- Added `GET /super-admin/billing` → `super_admin.billing.index`
- Added `POST /super-admin/billing` → `super_admin.billing.store`
- Both inside `EnsureSuperAdmin` middleware group

### Task 3: Wayfinder
- `php artisan wayfinder:generate` ran successfully
- Generated `resources/js/actions/App/Http/Controllers/SuperAdmin/StripeSettingController.ts`

### Task 4: Billing/Index.tsx
- Created `resources/js/pages/SuperAdmin/Billing/Index.tsx`
- "Replace key" UX for both Stripe fields (mirrors Llm.tsx exactly)
- `TypeBadge` component: amber for `manual_adjustment`, blue for `stripe_purchase`
- Global transaction log table: Institute, Credits (+/-), Amount, Date, Status, Type, Notes
- Pagination via `transactions.links`

### Task 5: BillingController updated
- Added `use App\Models\StripeSetting;`
- `checkout()` reads secret key from DB with `.env` fallback

### Task 6: StripeWebhookController updated
- Added `use App\Models\StripeSetting;`
- `handle()` reads webhook secret from DB with `.env` fallback

### Task 7: super-admin-layout.tsx updated
- Added `billingIndex` Wayfinder import
- Added `Package` icon
- Split "Billing Config" into two nav items:
  - "Billing" (CreditCard icon → `/super-admin/billing`)
  - "Credit Packages" (Package icon → credit packages URL)
