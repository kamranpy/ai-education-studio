<?php

namespace App\Http\Controllers\Institute;

use App\Http\Controllers\Controller;
use App\Models\CreditPackage;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class BillingController extends Controller
{
    /**
     * Show the billing dashboard with current credits and available packages.
     */
    public function index(Request $request): Response
    {
        $institute = $request->user()->institute;

        $packages = CreditPackage::where('is_active', true)
            ->orderBy('credits')
            ->get();

        // Determine the current package based on the most recent completed transaction.
        $lastTransaction = Transaction::where('institute_id', $institute->id)
            ->where('status', 'completed')
            ->latest()
            ->first();

        $currentPackageId = null;
        if ($lastTransaction) {
            $match = $packages->firstWhere('credits', $lastTransaction->credits_added);
            $currentPackageId = $match?->id;
        }

        return Inertia::render('Admin/Billing/Index', [
            'credits' => $institute->credits,
            'packages' => $packages,
            'current_package_id' => $currentPackageId,
        ]);
    }

    /**
     * Create a Stripe Checkout Session for purchasing a credit package.
     */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:credit_packages,id',
        ]);

        $package = CreditPackage::findOrFail($validated['package_id']);
        $institute = $request->user()->institute;

        Stripe::setApiKey(config('services.stripe.secret'));

        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => $package->currency,
                    'product_data' => [
                        'name' => $package->name,
                        'description' => "{$package->credits} exam credits",
                    ],
                    'unit_amount' => $package->price_cents,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => route('admin.billing.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('admin.billing.cancel'),
            'metadata' => [
                'institute_id' => $institute->id,
                'package_id' => $package->id,
                'credits' => $package->credits,
            ],
        ]);

        return Inertia::location($session->url);
    }

    /**
     * Handle successful checkout return.
     */
    public function success(Request $request): Response
    {
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Payment successful! Credits will be added to your account shortly.'),
        ]);

        return Inertia::render('Admin/Billing/Index', $this->billingProps($request));
    }

    /**
     * Handle cancelled checkout return.
     */
    public function cancel(Request $request): Response
    {
        Inertia::flash('toast', [
            'type' => 'info',
            'message' => __('Payment was cancelled.'),
        ]);

        return Inertia::render('Admin/Billing/Index', $this->billingProps($request));
    }

    /**
     * Build shared billing page props.
     */
    private function billingProps(Request $request): array
    {
        $institute = $request->user()->institute;
        $packages = CreditPackage::where('is_active', true)->orderBy('credits')->get();

        $lastTransaction = Transaction::where('institute_id', $institute->id)
            ->where('status', 'completed')
            ->latest()
            ->first();

        $currentPackageId = null;
        if ($lastTransaction) {
            $match = $packages->firstWhere('credits', $lastTransaction->credits_added);
            $currentPackageId = $match?->id;
        }

        return [
            'credits' => $institute->credits,
            'packages' => $packages,
            'current_package_id' => $currentPackageId,
        ];
    }
}
