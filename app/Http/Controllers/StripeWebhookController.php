<?php

namespace App\Http\Controllers;

use App\Models\Institute;
use App\Models\StripeSetting;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    /**
     * Handle incoming Stripe webhook events.
     *
     * Validates the webhook signature, processes checkout.session.completed
     * events idempotently, and atomically credits the institute's balance.
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $stripeSetting = StripeSetting::where('is_active', true)->first();
        $webhookSecret = $stripeSetting?->webhook_secret ?? config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe webhook signature verification failed.', [
                'error' => $e->getMessage(),
            ]);

            return response('Invalid signature.', 400);
        } catch (\UnexpectedValueException $e) {
            Log::warning('Stripe webhook payload invalid.', [
                'error' => $e->getMessage(),
            ]);

            return response('Invalid payload.', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;

            // Idempotency check — prevent double-crediting
            if (Transaction::where('stripe_session_id', $session->id)->exists()) {
                return response('Already processed.', 200);
            }

            $instituteId = $session->metadata->institute_id ?? null;
            $credits = (int) ($session->metadata->credits ?? 0);

            if (! $instituteId || $credits <= 0) {
                Log::error('Stripe webhook missing required metadata.', [
                    'session_id' => $session->id,
                    'metadata' => $session->metadata,
                ]);

                return response('Missing metadata.', 200);
            }

            DB::transaction(function () use ($session, $instituteId, $credits) {
                $institute = Institute::where('id', $instituteId)->lockForUpdate()->first();

                if (! $institute) {
                    Log::error('Stripe webhook: institute not found.', [
                        'institute_id' => $instituteId,
                    ]);

                    return;
                }

                $institute->increment('credits', $credits);

                Transaction::create([
                    'institute_id' => $institute->id,
                    'stripe_session_id' => $session->id,
                    'credits_added' => $credits,
                    'amount_cents' => $session->amount_total ?? 0,
                    'currency' => $session->currency ?? 'usd',
                    'status' => 'completed',
                ]);
            });

            Log::info('Stripe webhook: credits added.', [
                'institute_id' => $instituteId,
                'credits' => $credits,
                'session_id' => $session->id,
            ]);
        }

        return response('OK', 200);
    }
}
