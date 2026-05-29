<?php

namespace App\Services;

use App\Models\SiteSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class LicenseService
{
    private const CACHE_KEY = 'license_status';
    private const LOCK_FILE = '.install.lock';

    /**
     * Validate a license code with the CRM server.
     */
    public static function validate(string $code, ?string $domain = null): array
    {
        $url = config('license.check_url');

        if (empty($url)) {
            return ['status' => 'error', 'message' => 'License check URL is not configured.'];
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
            ])->post($url, [
                'license' => $code,
                'domain' => $domain,
            ]);

            return $response->json() ?? ['status' => 'error', 'message' => 'Invalid response from license server.'];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'message' => 'Could not connect to license server: '.$e->getMessage()];
        }
    }

    /**
     * Activate a license code with the CRM server (domain binding).
     */
    public static function activate(string $code, string $domain): array
    {
        $url = config('license.activate_url');

        if (empty($url)) {
            return ['status' => 'error', 'message' => 'License activate URL is not configured.'];
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
            ])->post($url, [
                'license' => $code,
                'domain' => $domain,
            ]);

            return $response->json() ?? ['status' => 'error', 'message' => 'Invalid response from license server.'];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'message' => 'Could not connect to license server: '.$e->getMessage()];
        }
    }

    /**
     * Get the cached license status (active/pending/invalid).
     * Falls back to DB, then defaults to 'pending'.
     */
    public static function getStatus(): string
    {
        try {
            $cached = Cache::get(self::CACHE_KEY);

            if ($cached !== null) {
                return $cached;
            }

            $status = SiteSetting::get('license_status', 'pending');
            Cache::put(self::CACHE_KEY, $status, now()->addHours(1));

            return $status;
        } catch (\Throwable $e) {
            // If DB/cache is unreachable (e.g., during install), return pending
            return 'pending';
        }
    }

    /**
     * Update the license status and metadata in DB.
     */
    public static function setStatus(string $status, ?string $licenseKey = null, ?string $domain = null): void
    {
        SiteSetting::set('license_status', $status, 'string');

        // Only update last_verified_at on successful active status
        // so grace period calculations are based on last SUCCESS
        if ($status === 'active') {
            SiteSetting::set('license_last_verified_at', now()->toDateTimeString(), 'string');
        }

        if ($licenseKey !== null) {
            SiteSetting::set('license_key', encrypt($licenseKey), 'string');
        }

        if ($domain !== null) {
            SiteSetting::set('license_domain', $domain, 'string');
        }

        Cache::forget(self::CACHE_KEY);
        Cache::put(self::CACHE_KEY, $status, now()->addHours(1));
    }

    /**
     * Get the stored (decrypted) license key.
     */
    public static function getLicenseKey(): ?string
    {
        try {
            $encrypted = SiteSetting::get('license_key');

            return $encrypted ? decrypt($encrypted) : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Get the domain the license is bound to.
     */
    public static function getDomain(): ?string
    {
        return SiteSetting::get('license_domain');
    }

    /**
     * Get the last verified timestamp.
     */
    public static function getLastVerifiedAt(): ?string
    {
        return SiteSetting::get('license_last_verified_at');
    }

    /**
     * Check if the install wizard has been completed.
     */
    public static function isLocked(): bool
    {
        return file_exists(base_path(self::LOCK_FILE));
    }

    /**
     * Mark the install as complete (create lock file).
     */
    public static function lock(): void
    {
        file_put_contents(base_path(self::LOCK_FILE), 'installed');
    }

    /**
     * Remove the install lock (for testing/debugging).
     */
    public static function unlock(): void
    {
        if (file_exists(base_path(self::LOCK_FILE))) {
            unlink(base_path(self::LOCK_FILE));
        }
    }

    /**
     * Verify the current license with the CRM server.
     * Returns the new status.
     */
    public static function verify(): string
    {
        $licenseKey = self::getLicenseKey();
        $domain = self::getDomain();

        if (! $licenseKey) {
            self::setStatus('invalid');

            return 'invalid';
        }

        $result = self::validate($licenseKey, $domain);

        if (($result['status'] ?? '') === 'success') {
            self::setStatus('active');

            return 'active';
        }

        // Network or server error → grace period
        $lastVerified = self::getLastVerifiedAt();
        $graceHours = 24;
        $pendingGraceDays = 7;

        if ($lastVerified) {
            $hoursSinceVerified = now()->diffInHours(Carbon::parse($lastVerified));

            if ($hoursSinceVerified < $graceHours) {
                // Still within grace period, keep current status
                return self::getStatus();
            }

            if ($hoursSinceVerified < ($graceHours + ($pendingGraceDays * 24))) {
                // Past 24h grace but within 7-day pending period
                self::setStatus('pending');

                return 'pending';
            }
        }

        self::setStatus('invalid');

        return 'invalid';
    }
}
