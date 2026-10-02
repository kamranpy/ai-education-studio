<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Allow these paths through even when maintenance mode is on.
     * Super Admin needs to log in and toggle maintenance off.
     */
    protected array $exemptPaths = [
        'maintenance',
        'login',
        'logout',
        'super-admin/*',
        'two-factor-challenge',
        'two-factor-challenge/*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $maintenanceMode = (bool) SiteSetting::get('maintenance_mode', false);
        } catch (\Throwable $e) {
            // During install (DB not configured), assume maintenance mode is off
            $maintenanceMode = false;
        }

        if (! $maintenanceMode) {
            return $next($request);
        }

        // Super Admin bypasses maintenance mode entirely.
        if ($request->user()?->isSuperAdmin()) {
            return $next($request);
        }

        foreach ($this->exemptPaths as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        return redirect()->route('maintenance');
    }
}
