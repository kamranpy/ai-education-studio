<?php

namespace Database\Seeders;

use App\Models\CreditPackage;
use Illuminate\Database\Seeder;

class CreditPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Starter',
                'description' => 'Perfect for small institutes just getting started with AI grading.',
                'features' => ['100 AI gradings', 'Email support', 'Basic analytics'],
                'credits' => 100,
                'price_cents' => 1000,
                'currency' => 'usd',
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'description' => 'Ideal for growing institutes with moderate exam volumes.',
                'features' => ['500 AI gradings', 'Priority support', 'Advanced analytics', 'Custom branding'],
                'credits' => 500,
                'price_cents' => 4000,
                'currency' => 'usd',
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'description' => 'Unlimited power for large educational organizations.',
                'features' => ['2,000 AI gradings', '24/7 dedicated support', 'Full analytics suite', 'White-label options', 'API access'],
                'credits' => 2000,
                'price_cents' => 15000,
                'currency' => 'usd',
                'is_active' => true,
            ],
            [
                'name' => 'Trial Pack',
                'description' => 'Try before you buy. Limited time offer.',
                'features' => ['20 AI gradings', 'Community support'],
                'credits' => 20,
                'price_cents' => 199,
                'currency' => 'usd',
                'is_active' => false,
            ],
        ];

        foreach ($packages as $package) {
            CreditPackage::updateOrCreate(
                ['name' => $package['name']],
                $package
            );
        }
    }
}
