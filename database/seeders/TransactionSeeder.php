<?php

namespace Database\Seeders;

use App\Models\CreditPackage;
use App\Models\Institute;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $institutes = Institute::where('status', true)->get();
        $packages = CreditPackage::where('is_active', true)->get();

        foreach ($institutes as $institute) {
            $transactionCount = rand(2, 5);

            for ($i = 0; $i < $transactionCount; $i++) {
                $package = $packages->random();
                $statuses = ['completed', 'completed', 'completed', 'pending', 'failed'];
                $status = $statuses[array_rand($statuses)];

                $createdAt = now()->subDays(rand(0, 7));

                Transaction::create([
                    'institute_id' => $institute->id,
                    'stripe_session_id' => 'cs_test_' . str_replace('-', '', bin2hex(random_bytes(16))),
                    'credits_added' => $status === 'completed' ? $package->credits : 0,
                    'amount_cents' => $package->price_cents,
                    'currency' => $package->currency,
                    'status' => $status,
                    'type' => 'stripe_purchase',
                    'notes' => $status === 'failed' ? 'Payment declined by issuer.' : null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }
    }
}
