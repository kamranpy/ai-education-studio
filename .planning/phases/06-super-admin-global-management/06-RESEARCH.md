# Phase 06: Super Admin & Global Management — Research

## Summary

Phase 6 completes the Super Admin control center by adding three features on top of the existing shell: an institutes management table with inline actions (suspend/activate, credit adjustment, delete), a global analytics dashboard replacing the current placeholder, and a Stripe billing config UI with a global transaction log. The implementation follows established patterns — encrypted key storage mirrors `LlmSetting`, the `Transaction` model gets two new columns via migration, and all new controllers live in `app/Http/Controllers/SuperAdmin/`. The only new dependency is Recharts (with a `react-is` pnpm override for React 19 compatibility).

---

## 1. Charts Library

### Recommendation: Recharts

**Recharts** (`recharts`) is the right choice for this project. It is the most widely adopted React charting library (~25k GitHub stars), is built on D3 and SVG, and integrates naturally with Tailwind utility classes for layout/spacing. It requires no canvas setup and its declarative component API fits the existing React patterns in this codebase.

**React 19 compatibility caveat:** Recharts has a known issue with React 19 where `ResponsiveContainer` can render empty charts in production builds. The fix is straightforward — install `react-is` at the same version as React and add a pnpm override.

### Packages to install

```bash
pnpm add recharts
pnpm add react-is@19.2.0
```

Add to `package.json` (pnpm override to resolve the `react-is` peer dep conflict):

```json
"pnpm": {
  "overrides": {
    "react-is": "$react-is"
  }
}
```

### Key components used

| Chart | Recharts Component |
|---|---|
| Exams run over time | `LineChart` + `Line` |
| Revenue over time | `LineChart` + `Line` |
| New institutes over time | `BarChart` + `Bar` |
| All charts | `ResponsiveContainer`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip` |

### Usage pattern

```tsx
import {
    ResponsiveContainer, LineChart, Line,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

// Wrap every chart in ResponsiveContainer for responsive sizing
<ResponsiveContainer width="100%" height={240}>
    <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
    </LineChart>
</ResponsiveContainer>
```

### Why not the alternatives

- **Chart.js / react-chartjs-2**: Canvas-based, heavier setup, less idiomatic in React.
- **Tremor**: Opinionated design system that conflicts with the existing Tailwind v4 + Radix UI setup; also adds significant bundle weight.
- **TanStack Charts**: Beta, no pie/bar support by design, not production-ready.

---

## 2. Analytics Queries

All analytics are served from a single `DashboardController@index` method. The controller accepts a `range` query parameter (`7d`, `30d`, `90d`, `all`) and returns both stat card totals and time-series datasets.

### Date range filtering helper

```php
use Illuminate\Support\Carbon;

private function dateRange(string $range): ?Carbon
{
    return match ($range) {
        '7d'  => now()->subDays(7),
        '30d' => now()->subDays(30),
        '90d' => now()->subDays(90),
        default => null, // 'all' — no filter
    };
}
```

### Stat card queries

```php
use App\Models\Institute;
use App\Models\ExamAttempt;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

// Total institutes (always all-time — not filtered by range)
$totalInstitutes = Institute::count();

// Total exams run (attempts with terminal status)
$examsQuery = ExamAttempt::whereIn('status', ['submitted', 'graded']);
if ($from) $examsQuery->where('submitted_at', '>=', $from);
$totalExams = $examsQuery->count();

// Total revenue (stripe purchases only, in cents → divide by 100 for display)
$revenueQuery = Transaction::where('status', 'completed')
    ->where('type', 'stripe_purchase');
if ($from) $revenueQuery->where('created_at', '>=', $from);
$totalRevenueCents = $revenueQuery->sum('amount_cents');

// Total credits sold (stripe purchases only)
$creditsQuery = Transaction::where('status', 'completed')
    ->where('type', 'stripe_purchase');
if ($from) $creditsQuery->where('created_at', '>=', $from);
$totalCreditsSold = $creditsQuery->sum('credits_added');
```

### Time-series chart queries

All time-series use `DB::raw` with `DATE()` to group by calendar day. The frontend receives arrays of `{ date: 'YYYY-MM-DD', count/revenue: number }`.

```php
// Exams run over time
$examsOverTime = ExamAttempt::selectRaw('DATE(submitted_at) as date, COUNT(*) as count')
    ->whereIn('status', ['submitted', 'graded'])
    ->when($from, fn($q) => $q->where('submitted_at', '>=', $from))
    ->groupBy('date')
    ->orderBy('date')
    ->get();

// Revenue over time
$revenueOverTime = Transaction::selectRaw('DATE(created_at) as date, SUM(amount_cents) as revenue')
    ->where('status', 'completed')
    ->where('type', 'stripe_purchase')
    ->when($from, fn($q) => $q->where('created_at', '>=', $from))
    ->groupBy('date')
    ->orderBy('date')
    ->get();

// New institutes over time
$institutesOverTime = Institute::selectRaw('DATE(created_at) as date, COUNT(*) as count')
    ->when($from, fn($q) => $q->where('created_at', '>=', $from))
    ->groupBy('date')
    ->orderBy('date')
    ->get();
```

### Inertia response shape

```php
return Inertia::render('SuperAdmin/Dashboard', [
    'stats' => [
        'total_institutes'   => $totalInstitutes,
        'total_exams'        => $totalExams,
        'total_revenue_cents'=> $totalRevenueCents,
        'total_credits_sold' => $totalCreditsSold,
    ],
    'charts' => [
        'exams_over_time'      => $examsOverTime,
        'revenue_over_time'    => $revenueOverTime,
        'institutes_over_time' => $institutesOverTime,
    ],
    'range' => $range, // echo back for the frontend filter UI
]);
```

### Time range filter on the frontend

The filter is a controlled `<Select>` that calls `router.get(route, { range: value }, { preserveState: true })` on change. No full page reload — Inertia partial reload is sufficient here.

### Performance note

These queries run across the full dataset. For v1 (marketplace product, single-tenant per install), this is fine without indexes. If the platform grows, add:
- `INDEX(submitted_at)` on `exam_attempts`
- `INDEX(created_at, status, type)` on `transactions`

---

## 3. Stripe Settings Storage

### Approach: dedicated `stripe_settings` table (mirrors `llm_settings`)

A dedicated table is cleaner than a generic key-value store. It matches the `llm_settings` pattern exactly, keeps the schema explicit, and makes the `StripeSettingController` straightforward to implement.

### Migration

```php
Schema::create('stripe_settings', function (Blueprint $table) {
    $table->id();
    $table->text('secret_key')->nullable();        // encrypted via Eloquent cast
    $table->text('webhook_secret')->nullable();    // encrypted via Eloquent cast
    $table->boolean('is_active')->default(false);
    $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamps();
});
```

Use `text` (not `string`) for encrypted columns — ciphertext is longer than 255 chars.

### Model: `app/Models/StripeSetting.php`

```php
class StripeSetting extends Model
{
    protected $fillable = ['secret_key', 'webhook_secret', 'is_active', 'updated_by'];

    protected $casts = [
        'secret_key'     => 'encrypted',
        'webhook_secret' => 'encrypted',
        'is_active'      => 'boolean',
    ];

    protected $hidden = ['secret_key', 'webhook_secret'];

    public function hasSecretKey(): bool
    {
        return !empty($this->attributes['secret_key']);
    }

    public function hasWebhookSecret(): bool
    {
        return !empty($this->attributes['webhook_secret']);
    }

    public function getMaskedSecretKeyAttribute(): ?string
    {
        if (!$this->hasSecretKey()) return null;
        return 'sk_•••' . substr($this->secret_key, -4);
    }

    public function getMaskedWebhookSecretAttribute(): ?string
    {
        if (!$this->hasWebhookSecret()) return null;
        return 'whsec_•••' . substr($this->webhook_secret, -4);
    }
}
```

### Controller pattern (mirrors `LlmSettingController`)

- `index()` — fetch active setting, pass `has_secret_key`, `masked_secret_key`, `has_webhook_secret`, `masked_webhook_secret` to Inertia. Never pass raw keys.
- `store()` — validate, only update key fields if a new value was provided (don't wipe on re-save).
- The "Replace key" UX from `Llm.tsx` is reused verbatim for both fields.

### Stripe key consumption

The existing `StripeWebhookController` and `BillingController` currently read keys from `config('services.stripe.*')` which reads from `.env`. After this phase, those controllers need to read from `StripeSetting::where('is_active', true)->first()` instead. This is a **breaking change** to the existing billing flow — document it clearly and update both controllers in the same plan.

---

## 4. Transaction Model Changes

### Migration

```php
// File: database/migrations/YYYY_MM_DD_add_type_and_notes_to_transactions_table.php
Schema::table('transactions', function (Blueprint $table) {
    $table->string('type')->default('stripe_purchase')->after('status');
    $table->text('notes')->nullable()->after('type');
    $table->index('type');
});
```

**Backfill:** All existing rows have `type = NULL` until the migration runs. The `default('stripe_purchase')` handles new rows. Existing rows need a data migration:

```php
// In the same migration's up() method, after altering the table:
DB::table('transactions')->whereNull('type')->update(['type' => 'stripe_purchase']);
```

### Updated model

```php
protected $fillable = [
    'institute_id',
    'stripe_session_id',
    'credits_added',
    'amount_cents',
    'currency',
    'status',
    'type',   // NEW: 'stripe_purchase' | 'manual_adjustment'
    'notes',  // NEW: nullable reason string
];

protected function casts(): array
{
    return [
        'credits_added' => 'integer',
        'amount_cents'  => 'integer',
    ];
}
```

### Impact on existing code

- `StripeWebhookController` creates transactions without `type` — after migration it will default to `'stripe_purchase'`, which is correct. No code change needed there.
- `BillingController` — same, no change needed.
- Analytics queries that filter `WHERE type = 'stripe_purchase'` will correctly exclude manual adjustments from revenue totals.

---

## 5. Institute Management Actions

### Suspend / Activate (toggle)

Simple `PATCH` route. The controller flips `status` and redirects back.

```php
// Route: PATCH /super-admin/institutes/{institute}/toggle-status
public function toggleStatus(Institute $institute): RedirectResponse
{
    $institute->update(['status' => !$institute->status]);
    $label = $institute->status ? 'activated' : 'suspended';
    Inertia::flash('toast', ['type' => 'success', 'message' => "Institute {$label}."]);
    return to_route('super_admin.institutes.index');
}
```

Frontend: a `router.patch(url, {}, { preserveScroll: true })` call from the table row action button. No dialog needed — the toggle is reversible.

### Credit Adjustment

Flow:
1. User clicks "Adjust Credits" → opens a Radix `<Dialog>` (already in `@radix-ui/react-dialog`).
2. Dialog has: amount input (integer, can be negative), optional notes textarea.
3. On submit: `POST /super-admin/institutes/{institute}/adjust-credits`.
4. Controller validates, wraps in a DB transaction:
   - Updates `institutes.credits` by the delta (use `DB::table(...)->increment/decrement` or `$institute->increment('credits', abs($amount))` with sign logic).
   - Creates a `Transaction` record: `type='manual_adjustment'`, `credits_added=$amount`, `amount_cents=0`, `stripe_session_id=null`, `notes=$reason`.

```php
public function adjustCredits(Request $request, Institute $institute): RedirectResponse
{
    $validated = $request->validate([
        'amount' => ['required', 'integer', 'not_in:0'],
        'notes'  => ['nullable', 'string', 'max:500'],
    ]);

    DB::transaction(function () use ($validated, $institute) {
        $institute->increment('credits', $validated['amount']);

        $institute->transactions()->create([
            'credits_added'    => $validated['amount'],
            'amount_cents'     => 0,
            'currency'         => 'usd',
            'status'           => 'completed',
            'type'             => 'manual_adjustment',
            'notes'            => $validated['notes'] ?? null,
            'stripe_session_id'=> null,
        ]);
    });

    Inertia::flash('toast', ['type' => 'success', 'message' => 'Credits adjusted.']);
    return to_route('super_admin.institutes.index');
}
```

**Edge case:** `increment()` with a negative value works in Laravel — `$institute->increment('credits', -50)` decrements by 50. No need for separate increment/decrement branches.

**Edge case:** Credits going negative. For v1, allow it (super admin is trusted). The `credits` column is `integer` with no unsigned constraint, so negative values are stored fine.

### Delete Institute

- Route: `DELETE /super-admin/institutes/{institute}`
- Frontend: confirmation dialog (use Radix `<AlertDialog>` or a simple `confirm()` — the existing `CreditPackages/Index.tsx` uses `confirm()`, so match that pattern for consistency).
- Cascade behavior: `institutes` table has `cascadeOnDelete` on all child FK constraints (`exams`, `transactions`, `users`). Deleting an institute cascades to all related records automatically — no soft deletes needed for v1.
- The `users` table has `institute_id` as a FK with cascade — deleting an institute deletes its users too. This is intentional and correct for a hard delete.

```php
public function destroy(Institute $institute): RedirectResponse
{
    $institute->delete(); // cascades to users, exams, exam_attempts, transactions
    Inertia::flash('toast', ['type' => 'success', 'message' => 'Institute deleted.']);
    return to_route('super_admin.institutes.index');
}
```

### Institutes index query (with counts)

Use `withCount` to avoid N+1:

```php
$institutes = Institute::withCount(['users', 'exams'])
    ->orderBy('name')
    ->get()
    ->map(fn($i) => [
        'id'           => $i->id,
        'name'         => $i->name,
        'status'       => $i->status,
        'credits'      => $i->credits,
        'user_count'   => $i->users_count,
        'exam_count'   => $i->exams_count,
    ]);
```

The `Institute` model needs an `exams()` HasMany relationship added (it currently only has `users()` and `transactions()`).

---

## 6. Implementation Plan

### Plan A — Data Layer (migrations + model updates)
Purely backend, no UI. Safe to do first.
- Migration: add `type` + `notes` to `transactions` (with backfill)
- Migration: create `stripe_settings` table
- New model: `StripeSetting`
- Update `Transaction` model: add `type`, `notes` to `$fillable`
- Add `exams()` HasMany to `Institute` model

### Plan B — Institutes Management (SADM-01)
- `InstituteController` with `index`, `toggleStatus`, `adjustCredits`, `destroy`
- Routes for all four actions
- `SuperAdmin/Institutes/Index.tsx` page with table + inline actions
- Credit adjustment dialog component
- Delete confirmation (using `confirm()` to match existing pattern)
- Update `SuperAdminLayout` nav to include Institutes link

### Plan C — Analytics Dashboard (SADM-03)
- Convert `super_admin.dashboard` from `Route::inertia()` to a proper controller route
- `DashboardController` with `index()` method + analytics queries
- Replace `SuperAdmin/Dashboard.tsx` placeholder with stat cards + charts
- Install Recharts + react-is, add pnpm override
- Time range filter UI

### Plan D — Stripe Billing Config + Transaction Log (SADM-02)
- `StripeSettingController` with `index` + `store`
- Routes
- `SuperAdmin/Billing/Index.tsx` — Stripe keys form + global transaction log table
- Update `StripeWebhookController` and `BillingController` to read keys from DB
- Update `SuperAdminLayout` nav: rename "Billing Config" link to point to new billing page (or add sub-nav)

---

## 7. Files to Create / Modify

### New migrations
- `database/migrations/YYYY_MM_DD_add_type_and_notes_to_transactions_table.php`
- `database/migrations/YYYY_MM_DD_create_stripe_settings_table.php`

### New models
- `app/Models/StripeSetting.php`

### Modified models
- `app/Models/Transaction.php` — add `type`, `notes` to `$fillable`
- `app/Models/Institute.php` — add `exams()` HasMany relationship

### New controllers
- `app/Http/Controllers/SuperAdmin/DashboardController.php`
- `app/Http/Controllers/SuperAdmin/InstituteController.php`
- `app/Http/Controllers/SuperAdmin/StripeSettingController.php`

### Modified controllers
- `app/Http/Controllers/Institute/BillingController.php` — read Stripe key from DB
- `app/Http/Controllers/StripeWebhookController.php` — read Stripe keys from DB

### Modified routes
- `routes/web.php` — add institute routes, stripe setting routes, convert dashboard to controller

### New frontend pages
- `resources/js/pages/SuperAdmin/Institutes/Index.tsx`
- `resources/js/pages/SuperAdmin/Billing/Index.tsx` (Stripe config + transaction log)

### Modified frontend pages
- `resources/js/pages/SuperAdmin/Dashboard.tsx` — replace placeholder with analytics UI

### Modified layouts
- `resources/js/layouts/super-admin-layout.tsx` — add Institutes nav item, update Billing nav

### Wayfinder (auto-generated, trigger with `php artisan wayfinder:generate`)
- `resources/js/actions/App/Http/Controllers/SuperAdmin/DashboardController.ts`
- `resources/js/actions/App/Http/Controllers/SuperAdmin/InstituteController.ts`
- `resources/js/actions/App/Http/Controllers/SuperAdmin/StripeSettingController.ts`

---

## 8. Risks & Gotchas

### Recharts + React 19 empty chart bug
`ResponsiveContainer` can silently render empty in React 19 production builds without the `react-is` override. The fix is documented in Section 1 — must be applied before any chart work.

### Dashboard route conversion
`super_admin.dashboard` is currently a `Route::inertia()` shortcut. Converting it to a controller route changes nothing for the frontend (same URL, same Inertia page name) but the route definition changes. Wayfinder must be regenerated after.

### Stripe keys migration from `.env` to DB
The existing `BillingController` and `StripeWebhookController` use `config('services.stripe.secret')` and `config('services.stripe.webhook_secret')`. After Plan D, these must read from `StripeSetting`. The `.env` values become the fallback for local dev. Suggested pattern:

```php
$setting = StripeSetting::where('is_active', true)->first();
$secretKey = $setting?->secret_key ?? config('services.stripe.secret');
```

This keeps local dev working without a DB record.

### `stripe_session_id` unique constraint on transactions
The `transactions` table has `->unique()` on `stripe_session_id`. Manual adjustment transactions have `stripe_session_id = null`. MySQL/PostgreSQL allow multiple `NULL` values in a unique column, so this is fine — no constraint change needed.

### Credit adjustment with negative delta
`$institute->increment('credits', $amount)` where `$amount` is negative works correctly in Laravel/Eloquent. However, validate `not_in:0` to prevent zero-amount adjustments that create noise in the transaction log.

### Institute deletion and active exam attempts
Deleting an institute cascades to `exam_attempts` via `exams → exam_attempts`. If a student is mid-exam when the institute is deleted, their attempt is silently deleted. For v1 this is acceptable (super admin action, not reversible). Consider adding a warning in the confirmation dialog: "This will permanently delete all users, exams, and exam attempts."

### `withCount` on Institute needs `exams()` relationship
`Institute::withCount('exams')` requires the `exams()` HasMany to exist on the model. It currently only has `users()` and `transactions()`. Add it in Plan A.

### Transaction log pagination
The global transaction log could grow large. Use `paginate(50)` rather than `get()` from day one. Inertia handles paginated responses natively via the `links` prop.

### Nav layout update
The current `super-admin-layout.tsx` has "Billing Config" pointing to `creditPackagesIndex.url()`. After Phase 6, the billing section expands to include Stripe config + transaction log. Options: (a) rename the nav item to "Billing" and point it to the new `Billing/Index` page which contains both the Stripe config and transaction log, with credit packages accessible via a tab or sub-section; (b) keep credit packages as a separate nav item. Option (a) is cleaner — consolidate everything billing-related under one nav item.
