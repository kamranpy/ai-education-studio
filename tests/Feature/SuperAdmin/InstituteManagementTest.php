<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Exam;
use App\Models\Institute;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstituteManagementTest extends TestCase
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

    public function test_super_admin_can_view_institutes_index(): void
    {
        Institute::factory()->count(3)->create();

        $response = $this->actingAs($this->superAdmin)->get(route('super_admin.institutes.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('SuperAdmin/Institutes/Index')
            ->has('institutes', 3)
        );
    }

    public function test_institutes_index_includes_user_and_exam_counts(): void
    {
        $institute = Institute::factory()->create();

        $studentRole = Role::where('slug', Role::STUDENT)->first();
        User::factory()->count(2)->create([
            'institute_id' => $institute->id,
            'role_id' => $studentRole->id,
        ]);
        Exam::factory()->count(3)->create(['institute_id' => $institute->id]);

        $response = $this->actingAs($this->superAdmin)->get(route('super_admin.institutes.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('SuperAdmin/Institutes/Index')
            ->where('institutes.0.user_count', 2)
            ->where('institutes.0.exam_count', 3)
        );
    }

    public function test_super_admin_can_activate_suspended_institute(): void
    {
        $institute = Institute::factory()->create(['status' => false]);

        $response = $this->actingAs($this->superAdmin)
            ->patch(route('super_admin.institutes.toggle-status', $institute));

        $response->assertRedirect(route('super_admin.institutes.index'));
        $this->assertDatabaseHas('institutes', [
            'id' => $institute->id,
            'status' => true,
        ]);
    }

    public function test_super_admin_can_suspend_active_institute(): void
    {
        $institute = Institute::factory()->create(['status' => true]);

        $response = $this->actingAs($this->superAdmin)
            ->patch(route('super_admin.institutes.toggle-status', $institute));

        $response->assertRedirect(route('super_admin.institutes.index'));
        $this->assertDatabaseHas('institutes', [
            'id' => $institute->id,
            'status' => false,
        ]);
    }

    public function test_super_admin_can_add_credits_to_institute(): void
    {
        $institute = Institute::factory()->create(['credits' => 50]);

        $response = $this->actingAs($this->superAdmin)
            ->post(route('super_admin.institutes.adjust-credits', $institute), [
                'amount' => 100,
            ]);

        $response->assertRedirect(route('super_admin.institutes.index'));
        $this->assertDatabaseHas('institutes', [
            'id' => $institute->id,
            'credits' => 150,
        ]);
        $this->assertDatabaseHas('transactions', [
            'institute_id' => $institute->id,
            'type' => 'manual_adjustment',
            'credits_added' => 100,
        ]);
    }

    public function test_super_admin_can_deduct_credits_from_institute(): void
    {
        $institute = Institute::factory()->create(['credits' => 100]);

        $response = $this->actingAs($this->superAdmin)
            ->post(route('super_admin.institutes.adjust-credits', $institute), [
                'amount' => -50,
            ]);

        $response->assertRedirect(route('super_admin.institutes.index'));
        $this->assertDatabaseHas('institutes', [
            'id' => $institute->id,
            'credits' => 50,
        ]);
    }

    public function test_adjust_credits_stores_notes_in_transaction(): void
    {
        $institute = Institute::factory()->create();

        $this->actingAs($this->superAdmin)
            ->post(route('super_admin.institutes.adjust-credits', $institute), [
                'amount' => 25,
                'notes' => 'Promotional bonus credits',
            ]);

        $this->assertDatabaseHas('transactions', [
            'institute_id' => $institute->id,
            'notes' => 'Promotional bonus credits',
        ]);
    }

    public function test_adjust_credits_rejects_zero_amount(): void
    {
        $institute = Institute::factory()->create();

        $response = $this->actingAs($this->superAdmin)
            ->post(route('super_admin.institutes.adjust-credits', $institute), [
                'amount' => 0,
            ]);

        $response->assertSessionHasErrors('amount');
    }

    public function test_adjust_credits_creates_transaction_record(): void
    {
        $institute = Institute::factory()->create();

        $this->actingAs($this->superAdmin)
            ->post(route('super_admin.institutes.adjust-credits', $institute), [
                'amount' => 10,
            ]);

        $this->assertDatabaseHas('transactions', [
            'institute_id' => $institute->id,
            'type' => 'manual_adjustment',
            'amount_cents' => 0,
            'status' => 'completed',
        ]);
    }

    public function test_super_admin_can_delete_institute(): void
    {
        $institute = Institute::factory()->create();

        $response = $this->actingAs($this->superAdmin)
            ->delete(route('super_admin.institutes.destroy', $institute));

        $response->assertRedirect(route('super_admin.institutes.index'));
        $this->assertDatabaseMissing('institutes', ['id' => $institute->id]);
    }

    public function test_non_super_admin_cannot_access_institutes(): void
    {
        $adminRole = Role::where('slug', Role::INSTITUTE_ADMIN)->first();
        $institute = Institute::factory()->create();
        $instituteAdmin = User::factory()->create([
            'institute_id' => $institute->id,
            'role_id' => $adminRole->id,
        ]);

        $response = $this->actingAs($instituteAdmin)
            ->get(route('super_admin.institutes.index'));

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_institutes(): void
    {
        $response = $this->get(route('super_admin.institutes.index'));

        $response->assertRedirect('/login');
    }
}
