<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Institute;
use App\Models\Role;
use App\Models\StripeSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeSettingTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);

        $superAdminRole = Role::where('slug', Role::SUPER_ADMIN)->first();

        $this->superAdmin = User::factory()->create([
            'role_id' => $superAdminRole->id,
        ]);
    }

    public function test_super_admin_can_view_billing_page(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.billing.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('SuperAdmin/Billing/Index')
            ->has('stripe')
            ->has('transactions')
        );
    }

    public function test_billing_page_shows_no_keys_when_none_configured(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.billing.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stripe.has_secret_key', false)
            ->where('stripe.has_webhook_secret', false)
        );
    }

    public function test_billing_page_never_exposes_raw_keys(): void
    {
        StripeSetting::create([
            'secret_key' => 'sk_live_supersecretkey',
            'webhook_secret' => 'whsec_supersecretwebhook',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.billing.index'));

        $response->assertOk();

        // The raw key values must not appear anywhere in the response content
        $this->assertStringNotContainsString('sk_live_supersecretkey', $response->content());
        $this->assertStringNotContainsString('whsec_supersecretwebhook', $response->content());
    }

    public function test_super_admin_can_save_stripe_keys(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->post(route('super_admin.billing.store'), [
                'secret_key' => 'sk_live_newkey123',
                'webhook_secret' => 'whsec_newwebhook456',
            ]);

        $response->assertRedirect(route('super_admin.billing.index'));

        $setting = StripeSetting::where('is_active', true)->first();
        $this->assertNotNull($setting);
        $this->assertTrue($setting->is_active);
        $this->assertTrue($setting->hasSecretKey());
        $this->assertTrue($setting->hasWebhookSecret());
    }

    public function test_saving_keys_deactivates_previous_setting(): void
    {
        // Create an existing active setting
        StripeSetting::create([
            'secret_key' => 'sk_live_oldkey',
            'webhook_secret' => 'whsec_oldwebhook',
            'is_active' => true,
        ]);

        $this->actingAs($this->superAdmin)
            ->post(route('super_admin.billing.store'), [
                'secret_key' => 'sk_live_newkey',
                'webhook_secret' => 'whsec_newwebhook',
            ]);

        // The controller reuses the existing record (updates it in place).
        // There should still be exactly one record and it should be active with the new keys.
        $this->assertDatabaseCount('stripe_settings', 1);

        $setting = StripeSetting::first();
        $this->assertTrue($setting->is_active);
        $this->assertEquals('sk_live_newkey', $setting->secret_key);
        $this->assertEquals('whsec_newwebhook', $setting->webhook_secret);
    }

    public function test_re_saving_without_key_preserves_existing_key(): void
    {
        StripeSetting::create([
            'secret_key' => 'sk_live_existingkey',
            'webhook_secret' => 'whsec_existingwebhook',
            'is_active' => true,
        ]);

        // POST without providing secret_key — should preserve the existing one
        $this->actingAs($this->superAdmin)
            ->post(route('super_admin.billing.store'), [
                'webhook_secret' => 'whsec_updatedwebhook',
            ]);

        $setting = StripeSetting::where('is_active', true)->first();
        $this->assertNotNull($setting);
        $this->assertTrue($setting->hasSecretKey());
        // The original key must be preserved and correctly decryptable
        $this->assertEquals('sk_live_existingkey', $setting->secret_key);
        // The webhook secret must be updated
        $this->assertEquals('whsec_updatedwebhook', $setting->webhook_secret);
    }

    public function test_stripe_setting_masked_secret_key_accessor(): void
    {
        $setting = StripeSetting::create([
            'secret_key' => 'sk_live_abcd1234',
            'is_active' => true,
        ]);

        $this->assertEquals('sk_•••1234', $setting->masked_secret_key);
    }

    public function test_stripe_setting_masked_webhook_secret_accessor(): void
    {
        $setting = StripeSetting::create([
            'webhook_secret' => 'whsec_xyz9',
            'is_active' => true,
        ]);

        // The accessor takes the last 4 chars of the full decrypted string.
        // 'whsec_xyz9' → last 4 chars = 'xyz9' → masked = 'whsec_•••xyz9'
        $this->assertEquals('whsec_•••xyz9', $setting->masked_webhook_secret);
    }

    public function test_stripe_setting_has_secret_key_returns_false_when_empty(): void
    {
        $setting = new StripeSetting();

        $this->assertFalse($setting->hasSecretKey());
    }

    public function test_non_super_admin_cannot_access_billing(): void
    {
        $adminRole = Role::where('slug', Role::INSTITUTE_ADMIN)->first();
        $institute = Institute::factory()->create();
        $instituteAdmin = User::factory()->create([
            'institute_id' => $institute->id,
            'role_id' => $adminRole->id,
        ]);

        $response = $this->actingAs($instituteAdmin)
            ->get(route('super_admin.billing.index'));

        $response->assertForbidden();
    }
}
