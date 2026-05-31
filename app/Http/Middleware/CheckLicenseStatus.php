<?php

namespace App\Http\Middleware;

use App\Services\LicenseService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLicenseStatus
{
    /**
     * Allow these paths through even when the license is not active.
     */
    protected array $exemptPaths = [
        'install',
        'login',
        'logout',
        'maintenance',
        'two-factor-challenge',
        'two-factor-challenge/*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // Skip if install wizard hasn't been completed yet
        if (! LicenseService::isLocked()) {
            if (! $request->is('install', 'install/*')) {
                return redirect()->route('install');
            }

            return $next($request);
        }

        $status = LicenseService::getStatus();

        // Active license — allow all traffic
        if ($status === 'active') {
            return $next($request);
        }

        // Exempt paths (auth, maintenance, public pages)
        foreach ($this->exemptPaths as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        // Public welcome page remains accessible
        if ($request->is('/')) {
            return $next($request);
        }

        // Redirect authenticated users to login (since license management page is removed)
        if ($request->user()) {
            return redirect()->route('login');
        }

        // Redirect guests to login (which is exempt)
        return redirect()->route('login');
    }
}
