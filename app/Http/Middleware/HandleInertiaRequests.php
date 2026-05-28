<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $siteName = SiteSetting::get('site_name') ?: config('app.name');

        return [
            ...parent::share($request),
            'name' => $siteName,
            'site' => [
                'name'             => $siteName,
                'tagline'          => SiteSetting::get('site_tagline', ''),
                'logo_url'         => SiteSetting::getFileUrl('logo_path'),
                'favicon_url'      => SiteSetting::getFileUrl('favicon_path'),
                'support_email'    => SiteSetting::get('support_email', ''),
                'social_facebook'  => SiteSetting::get('social_facebook', ''),
                'social_twitter'   => SiteSetting::get('social_twitter', ''),
                'social_linkedin'  => SiteSetting::get('social_linkedin', ''),
                'social_instagram' => SiteSetting::get('social_instagram', ''),
                'footer_text'      => SiteSetting::get('footer_text', ''),
            ],
            'auth' => [
                'user' => $request->user()?->loadMissing(['institute', 'role']),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'canRegister' => (bool) SiteSetting::get('registration_open', true),
        ];
    }
}
