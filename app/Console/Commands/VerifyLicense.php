<?php

namespace App\Console\Commands;

use App\Services\LicenseService;
use Illuminate\Console\Command;

class VerifyLicense extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'license:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Re-verify the active license with the CRM server.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! LicenseService::isLocked()) {
            $this->warn('Install wizard has not been completed yet. Skipping license verification.');

            return self::SUCCESS;
        }

        $status = LicenseService::verify();

        if ($status === 'active') {
            $this->info('License verified: active.');

            return self::SUCCESS;
        }

        if ($status === 'pending') {
            $this->warn('License verification failed. Status remains pending (grace period may be active).');

            return self::SUCCESS;
        }

        $this->error('License is invalid. Access will be restricted until a valid license is activated.');

        return self::FAILURE;
    }
}
