<?php

namespace Tests\Feature;

use App\Models\Institute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiTenancyTest extends TestCase
{
    use RefreshDatabase;

    public function test_institute_admin_cannot_see_other_institutes_users(): void
    {
        $instituteA = Institute::factory()->create();
        $instituteB = Institute::factory()->create();

        $adminA = User::factory()->create([
            'institute_id' => $instituteA->id,
            'role' => 'institute_admin',
        ]);

        User::factory()->create([
            'institute_id' => $instituteB->id,
            'role' => 'institute_admin',
        ]);

        $this->actingAs($adminA);

        $this->assertCount(1, User::all());
    }

    public function test_super_admin_can_see_all_users(): void
    {
        $instituteA = Institute::factory()->create();
        $instituteB = Institute::factory()->create();

        User::factory()->create([
            'institute_id' => $instituteA->id,
            'role' => 'institute_admin',
        ]);

        User::factory()->create([
            'institute_id' => $instituteB->id,
            'role' => 'institute_admin',
        ]);

        $superAdmin = User::factory()->create([
            'institute_id' => null,
            'role' => 'super_admin',
        ]);

        $this->actingAs($superAdmin);

        $this->assertCount(3, User::all());
    }
}
