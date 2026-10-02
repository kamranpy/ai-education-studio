<?php

namespace Tests\Feature;

use App\Models\Institute;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiTenancyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_institute_admin_cannot_see_other_institutes_users(): void
    {
        $instituteA = Institute::factory()->create();
        $instituteB = Institute::factory()->create();
        $adminRole = Role::where('slug', Role::INSTITUTE_ADMIN)->first();

        $adminA = User::factory()->create([
            'institute_id' => $instituteA->id,
            'role_id' => $adminRole->id,
        ]);

        User::factory()->create([
            'institute_id' => $instituteB->id,
            'role_id' => $adminRole->id,
        ]);

        $this->actingAs($adminA);

        $this->assertCount(1, User::all());
    }

    public function test_super_admin_can_see_all_users(): void
    {
        $instituteA = Institute::factory()->create();
        $instituteB = Institute::factory()->create();
        $adminRole = Role::where('slug', Role::INSTITUTE_ADMIN)->first();
        $superAdminRole = Role::where('slug', Role::SUPER_ADMIN)->first();

        User::factory()->create([
            'institute_id' => $instituteA->id,
            'role_id' => $adminRole->id,
        ]);

        User::factory()->create([
            'institute_id' => $instituteB->id,
            'role_id' => $adminRole->id,
        ]);

        $superAdmin = User::factory()->create([
            'institute_id' => null,
            'role_id' => $superAdminRole->id,
        ]);

        $this->actingAs($superAdmin);

        $this->assertCount(3, User::all());
    }
}
