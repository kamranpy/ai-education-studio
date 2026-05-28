<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Services\LicenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LicenseController extends Controller
{
    /**
     * Show the license management page.
     */
    public function index(): Response
    {
        return Inertia::render('SuperAdmin/License/Index', [
            'license' => [
                'status' => LicenseService::getStatus(),
                'domain' => LicenseService::getDomain(),
                'activated_at' => SiteSetting::get('license_activated_at'),
                'last_verified_at' => LicenseService::getLastVerifiedAt(),
            ],
        ]);
    }

    /**
     * Activate or re-activate a license key.
     */
    public function activate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'license_key' => ['required', 'string'],
        ]);

        $domain = $request->getHost();
        $result = LicenseService::activate($validated['license_key'], $domain);

        if (($result['status'] ?? '') === 'success') {
            LicenseService::setStatus('active', $validated['license_key'], $domain);
            SiteSetting::set('license_activated_at', now()->toDateTimeString(), 'string');

            Inertia::flash('toast', ['type' => 'success', 'message' => 'License activated successfully.']);
        } else {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $result['message'] ?? 'License activation failed. Please check your license key.',
            ]);
        }

        return to_route('super_admin.license.index');
    }

    /**
     * Manually re-verify the current license with the CRM server.
     */
    public function verify(): RedirectResponse
    {
        $status = LicenseService::verify();

        if ($status === 'active') {
            Inertia::flash('toast', ['type' => 'success', 'message' => 'License verified: active.']);
        } elseif ($status === 'pending') {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'License verification failed. Status is pending — please check your license server.',
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'License is invalid. Please enter a valid license key.',
            ]);
        }

        return to_route('super_admin.license.index');
    }
}
