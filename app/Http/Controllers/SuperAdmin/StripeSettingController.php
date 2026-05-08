<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\StripeSetting;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StripeSettingController extends Controller
{
    /**
     * Show the Stripe billing configuration page with the global transaction log.
     */
    public function index(): Response
    {
        $setting = StripeSetting::where('is_active', true)->first();

        $transactions = Transaction::with('institute')
            ->latest()
            ->paginate(50);

        return Inertia::render('SuperAdmin/Billing/Index', [
            'stripe' => [
                'has_secret_key'        => $setting?->hasSecretKey() ?? false,
                'masked_secret_key'     => $setting?->masked_secret_key,
                'has_webhook_secret'    => $setting?->hasWebhookSecret() ?? false,
                'masked_webhook_secret' => $setting?->masked_webhook_secret,
            ],
            'transactions' => $transactions,
        ]);
    }

    /**
     * Save or update the active Stripe settings.
     * Never wipes an existing key if no new value is provided.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'secret_key'     => ['nullable', 'string', 'max:512'],
            'webhook_secret' => ['nullable', 'string', 'max:512'],
        ]);

        DB::transaction(function () use ($validated) {
            // Deactivate any existing active settings
            StripeSetting::where('is_active', true)->update(['is_active' => false]);

            $existing = StripeSetting::where('is_active', false)->latest()->first();

            $data = [
                'is_active'  => true,
                'updated_by' => Auth::id(),
            ];

            // Only update key fields if a new value was provided
            if (! empty($validated['secret_key'])) {
                $data['secret_key'] = $validated['secret_key'];
            }

            if (! empty($validated['webhook_secret'])) {
                $data['webhook_secret'] = $validated['webhook_secret'];
            }

            if ($existing) {
                // Carry forward existing encrypted values for fields not being replaced
                if (empty($validated['secret_key']) && $existing->hasSecretKey()) {
                    $data['secret_key'] = $existing->getRawOriginal('secret_key');
                }

                if (empty($validated['webhook_secret']) && $existing->hasWebhookSecret()) {
                    $data['webhook_secret'] = $existing->getRawOriginal('webhook_secret');
                }

                $existing->update($data);
            } else {
                StripeSetting::create($data);
            }
        });

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Stripe settings saved.',
        ]);

        return to_route('super_admin.billing.index');
    }
}
