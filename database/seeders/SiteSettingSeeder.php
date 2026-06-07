<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'AI Education Studio', 'type' => 'string'],
            ['key' => 'tagline', 'value' => 'AI-Powered Exam & Assessment Platform', 'type' => 'string'],
            ['key' => 'contact_email', 'value' => 'support@aieducationstudio.com', 'type' => 'string'],
            ['key' => 'contact_phone', 'value' => '+1 (555) 123-4567', 'type' => 'string'],
            ['key' => 'logo_path', 'value' => null, 'type' => 'string'],
            ['key' => 'favicon_path', 'value' => null, 'type' => 'string'],
            ['key' => 'primary_color', 'value' => '#6366f1', 'type' => 'string'],
            ['key' => 'footer_text', 'value' => '© 2026 AI Education Studio. All rights reserved.', 'type' => 'string'],
            ['key' => 'maintenance_mode', 'value' => '0', 'type' => 'boolean'],
            ['key' => 'registration_enabled', 'value' => '1', 'type' => 'boolean'],
            ['key' => 'social_twitter', 'value' => 'https://twitter.com/aiedstudio', 'type' => 'string'],
            ['key' => 'social_linkedin', 'value' => 'https://linkedin.com/company/aiedstudio', 'type' => 'string'],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value'], 'type' => $setting['type']]
            );
        }
    }
}
