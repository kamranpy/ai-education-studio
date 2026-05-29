<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    /**
     * Show the website settings page (Branding | Contact & Social | Feature Flags).
     */
    public function index(): Response
    {
        return Inertia::render('SuperAdmin/WebsiteSettings/Index', [
            'branding' => [
                'site_name'    => SiteSetting::get('site_name', config('app.name')),
                'site_tagline' => SiteSetting::get('site_tagline', ''),
                'logo_url'     => SiteSetting::getFileUrl('logo_path'),
                'favicon_url'  => SiteSetting::getFileUrl('favicon_path'),
            ],
            'contact' => [
                'support_email'    => SiteSetting::get('support_email', ''),
                'social_facebook'  => SiteSetting::get('social_facebook', ''),
                'social_twitter'   => SiteSetting::get('social_twitter', ''),
                'social_linkedin'  => SiteSetting::get('social_linkedin', ''),
                'social_instagram' => SiteSetting::get('social_instagram', ''),
                'footer_text'      => SiteSetting::get('footer_text', ''),
            ],
            'flags' => [
                'registration_open' => (bool) SiteSetting::get('registration_open', true),
                'maintenance_mode'  => (bool) SiteSetting::get('maintenance_mode', false),
            ],
        ]);
    }

    /**
     * Update branding text fields (site name, tagline).
     */
    public function updateBranding(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'site_name'    => ['nullable', 'string', 'max:255'],
            'site_tagline' => ['nullable', 'string', 'max:500'],
        ]);

        SiteSetting::set('site_name', $validated['site_name'] ?? '', 'string');
        SiteSetting::set('site_tagline', $validated['site_tagline'] ?? '', 'string');

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Branding settings saved.',
        ]);

        return back();
    }

    /**
     * Update contact and social fields.
     */
    public function updateContact(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'support_email'    => ['nullable', 'email', 'max:255'],
            'social_facebook'  => ['nullable', 'url', 'max:500'],
            'social_twitter'   => ['nullable', 'url', 'max:500'],
            'social_linkedin'  => ['nullable', 'url', 'max:500'],
            'social_instagram' => ['nullable', 'url', 'max:500'],
            'footer_text'      => ['nullable', 'string', 'max:1000'],
        ]);

        foreach ([
            'support_email',
            'social_facebook',
            'social_twitter',
            'social_linkedin',
            'social_instagram',
            'footer_text',
        ] as $key) {
            SiteSetting::set($key, $validated[$key] ?? '', 'string');
        }

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Contact & Social settings saved.',
        ]);

        return back();
    }

    /**
     * Update feature flags.
     */
    public function updateFlags(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'registration_open' => ['required', 'boolean'],
            'maintenance_mode'  => ['required', 'boolean'],
        ]);

        SiteSetting::set('registration_open', $validated['registration_open'], 'boolean');
        SiteSetting::set('maintenance_mode', $validated['maintenance_mode'], 'boolean');

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Feature flags saved.',
        ]);

        return back();
    }

    /**
     * Upload and resize the site logo (max 400px wide).
     */
    public function uploadLogo(Request $request): RedirectResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'mimes:png,jpg,jpeg,svg,ico,webp', 'max:2048'],
        ]);

        $this->deleteStoredFile('logo_path');

        $file      = $request->file('logo');
        $extension = strtolower($file->getClientOriginalExtension());
        $filename  = 'logo_'.time().'.'.$extension;
        $path      = 'site/'.$filename;

        // SVG and ICO bypass server-side resize (vector / favicon format).
        if (in_array($extension, ['svg', 'ico'], true)) {
            Storage::disk('public')->putFileAs('site', $file, $filename);
        } else {
            $image = Image::decodeSplFileInfo($file)->scaleDown(width: 400);
            Storage::disk('public')->put($path, (string) $image->encode());
        }

        SiteSetting::set('logo_path', $path, 'string');

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Logo uploaded.',
        ]);

        return back();
    }

    /**
     * Delete the current logo.
     */
    public function deleteLogo(): RedirectResponse
    {
        $this->deleteStoredFile('logo_path');
        SiteSetting::set('logo_path', null, 'string');

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Logo removed.',
        ]);

        return back();
    }

    /**
     * Upload and resize the favicon (64x64).
     */
    public function uploadFavicon(Request $request): RedirectResponse
    {
        $request->validate([
            'favicon' => ['required', 'image', 'mimes:png,jpg,jpeg,ico,webp', 'max:1024'],
        ]);

        $this->deleteStoredFile('favicon_path');

        $file      = $request->file('favicon');
        $extension = strtolower($file->getClientOriginalExtension());
        $filename  = 'favicon_'.time().'.'.$extension;
        $path      = 'site/'.$filename;

        if ($extension === 'ico') {
            Storage::disk('public')->putFileAs('site', $file, $filename);
        } else {
            $image = Image::decodeSplFileInfo($file)->cover(64, 64);
            Storage::disk('public')->put($path, (string) $image->encode());
        }

        SiteSetting::set('favicon_path', $path, 'string');

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Favicon uploaded.',
        ]);

        return back();
    }

    /**
     * Delete the current favicon.
     */
    public function deleteFavicon(): RedirectResponse
    {
        $this->deleteStoredFile('favicon_path');
        SiteSetting::set('favicon_path', null, 'string');

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Favicon removed.',
        ]);

        return back();
    }

    /**
     * Delete a stored file from the public disk.
     */
    protected function deleteStoredFile(string $key): void
    {
        $existing = SiteSetting::get($key);

        if ($existing && Storage::disk('public')->exists($existing)) {
            Storage::disk('public')->delete($existing);
        }
    }
}
