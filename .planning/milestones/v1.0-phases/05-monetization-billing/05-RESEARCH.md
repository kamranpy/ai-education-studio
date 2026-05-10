# Phase 5: Monetization & Billing - Research

**Objective:** Research implementation approach for Phase 5: Monetization & Billing
**Mode:** ecosystem
**Gathered:** 2026-05-01

## Standard Stack

- **`stripe/stripe-php`:** Use the raw Stripe SDK instead of Laravel Cashier. Cashier is optimized for recurring subscriptions and predefined Stripe Price IDs, which conflicts with the requirement for fully custom, database-driven credit packages defined by the Super Admin.
- **Stripe Checkout:** Use Stripe's hosted Checkout Sessions to avoid building custom payment UIs and handling PCI compliance.
- **Radix UI (`@radix-ui/react-alert-dialog` / `Callout`):** For displaying the low-credit warning banner and the hard block modal to students.

## Architecture Patterns

### 1. Dynamic Checkout Sessions
Instead of syncing `CreditPackage` models to Stripe Products, generate Stripe Checkout Sessions dynamically using `price_data`. Pass the contextual information (`institute_id`, `credits`) into the `metadata` property.

### 2. Idempotent Webhook Handlers
Stripe webhooks (`checkout.session.completed`) must be idempotent. The handler must:
1. Verify the Stripe signature.
2. Check if a `Transaction` record already exists for the `stripe_session_id`.
3. If not, create the `Transaction` and atomically increment the `Institute`'s `credits`.

### 3. Atomic Credit Deductions
Credit deduction happens at the exact moment a student clicks "Start Exam" (creates the `ExamAttempt`). This must be wrapped in a database transaction using pessimistic locking (`lockForUpdate`) or atomic decrements (`decrement('credits', 1)`) to prevent overdrafting if multiple students start exams concurrently.

## Don't Hand-Roll

- **DO NOT hand-roll payment forms.** Use Stripe Checkout.
- **DO NOT hand-roll webhook signature verification.** Use `\Stripe\Webhook::constructEvent()` to guarantee the payload originated from Stripe.
- **DO NOT hand-roll a full subscription engine.** Do not install Laravel Cashier or create complex recurring billing tables. This is a one-off "top-up" system for virtual credits.
- **DO NOT rely on frontend logic for access control.** The backend must explicitly verify `$institute->credits > 0` before allowing an `ExamAttempt` to be created.

## Common Pitfalls

- **CSRF Tokens on Webhooks:** Laravel's CSRF middleware will block Stripe webhooks. You MUST exclude the webhook URI in `bootstrap/app.php` using `$middleware->validateCsrfTokens(except: ['stripe/webhook']);`.
- **Race Conditions:** If an institute has 1 credit left, and 2 students click "Start Exam" at the exact same millisecond, simple `if ($credits > 0)` checks will fail. Use `lockForUpdate()` during the check and deduction.
- **Missing Webhook Metadata:** If you forget to pass `institute_id` in the Checkout Session `metadata`, the webhook will not know which institute to credit.

## Code Examples

### Creating a Dynamic Checkout Session
```php
$session = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => [[
        'price_data' => [
            'currency' => 'usd',
            'product_data' => [
                'name' => $package->name,
            ],
            'unit_amount' => $package->price_cents, // e.g., 1000 for $10.00
        ],
        'quantity' => 1,
    ]],
    'mode' => 'payment',
    'success_url' => route('billing.success'),
    'cancel_url' => route('billing.cancel'),
    'metadata' => [
        'institute_id' => $institute->id,
        'package_id' => $package->id,
        'credits' => $package->credits,
    ],
]);
```

### Webhook Idempotency & Validation
```php
try {
    $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
} catch (\Exception $e) {
    return response('Invalid payload or signature', 400);
}

if ($event->type === 'checkout.session.completed') {
    $session = $event->data->object;
    
    // Check idempotency
    if (Transaction::where('stripe_session_id', $session->id)->exists()) {
        return response('Already processed', 200);
    }
    
    // Grant credits
    DB::transaction(function () use ($session) {
        $institute = Institute::findOrFail($session->metadata->institute_id);
        $institute->increment('credits', $session->metadata->credits);
        
        Transaction::create([
            'institute_id' => $institute->id,
            'stripe_session_id' => $session->id,
            'credits_added' => $session->metadata->credits,
            'amount_cents' => $session->amount_total,
        ]);
    });
}
```

### Atomic Deduction (Exam Start)
```php
DB::transaction(function () use ($institute, $student) {
    // Pessimistic lock
    $lockedInstitute = Institute::where('id', $institute->id)->lockForUpdate()->first();
    
    if ($lockedInstitute->credits < 1) {
        abort(403, 'Institute has insufficient credits.');
    }
    
    $lockedInstitute->decrement('credits', 1);
    
    // Create ExamAttempt...
});
```
