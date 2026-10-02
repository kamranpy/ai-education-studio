<?php

namespace Tests\Feature\Admin;

use App\Models\Institute;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private Institute $institute;

    private User $admin;

    private Role $adminRole;

    private Role $studentRole;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);

        $this->institute = Institute::factory()->create();
        $this->adminRole = Role::where('slug', Role::INSTITUTE_ADMIN)->first();
        $this->studentRole = Role::where('slug', Role::STUDENT)->first();

        $this->admin = User::factory()->create([
            'institute_id' => $this->institute->id,
            'role_id' => $this->adminRole->id,
        ]);
    }

    public function test_admin_can_view_users_index(): void
    {
        User::factory()->create([
            'institute_id' => $this->institute->id,
            'role_id' => $this->studentRole->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 2)
        );
    }

    public function test_admin_only_sees_own_institute_users(): void
    {
        $otherInstitute = Institute::factory()->create();
        User::factory()->create([
            'institute_id' => $otherInstitute->id,
            'role_id' => $this->studentRole->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('users.data', 1)
        );
    }

    public function test_admin_can_search_users(): void
    {
        User::factory()->create([
            'name' => 'Jane Student',
            'institute_id' => $this->institute->id,
            'role_id' => $this->studentRole->id,
        ]);

        User::factory()->create([
            'name' => 'Bob Learner',
            'institute_id' => $this->institute->id,
            'role_id' => $this->studentRole->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.users.index', ['search' => 'Jane']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('users.data', 1)
        );
    }

    public function test_admin_can_view_invite_form(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.invite'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Invite')
            ->has('roles')
        );
    }

    public function test_admin_can_invite_user(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.users.invite.store'), [
            'name' => 'New Student',
            'email' => 'student@example.com',
            'role_id' => $this->studentRole->id,
            'send_email' => false,
        ]);

        $response->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'New Student',
            'email' => 'student@example.com',
            'institute_id' => $this->institute->id,
            'role_id' => $this->studentRole->id,
            'status' => 'invited',
        ]);
    }

    public function test_invited_user_is_scoped_to_admin_institute(): void
    {
        $this->actingAs($this->admin)->post(route('admin.users.invite.store'), [
            'name' => 'New Student',
            'email' => 'student@example.com',
            'role_id' => $this->studentRole->id,
            'send_email' => false,
        ]);

        $invited = User::where('email', 'student@example.com')->first();

        $this->assertNotNull($invited);
        $this->assertEquals($this->institute->id, $invited->institute_id);
    }

    public function test_admin_cannot_assign_super_admin_role(): void
    {
        $superAdminRole = Role::where('slug', Role::SUPER_ADMIN)->first();

        $response = $this->actingAs($this->admin)->post(route('admin.users.invite.store'), [
            'name' => 'Hacker',
            'email' => 'hacker@example.com',
            'role_id' => $superAdminRole->id,
            'send_email' => false,
        ]);

        $response->assertSessionHasErrors('role_id');
        $this->assertDatabaseMissing('users', ['email' => 'hacker@example.com']);
    }

    public function test_invite_requires_valid_email(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.users.invite.store'), [
            'name' => 'Student',
            'email' => 'not-an-email',
            'role_id' => $this->studentRole->id,
            'send_email' => false,
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_invite_rejects_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'taken@example.com',
            'institute_id' => $this->institute->id,
            'role_id' => $this->studentRole->id,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.users.invite.store'), [
            'name' => 'Duplicate',
            'email' => 'taken@example.com',
            'role_id' => $this->studentRole->id,
            'send_email' => false,
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_non_admin_cannot_access_users_index(): void
    {
        $student = User::factory()->create([
            'institute_id' => $this->institute->id,
            'role_id' => $this->studentRole->id,
        ]);

        $response = $this->actingAs($student)->get(route('admin.users.index'));

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_invite_users(): void
    {
        $student = User::factory()->create([
            'institute_id' => $this->institute->id,
            'role_id' => $this->studentRole->id,
        ]);

        $response = $this->actingAs($student)->post(route('admin.users.invite.store'), [
            'name' => 'Test',
            'email' => 'test@example.com',
            'role_id' => $this->studentRole->id,
            'send_email' => false,
        ]);

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_users(): void
    {
        $response = $this->get(route('admin.users.index'));

        $response->assertRedirect('/login');
    }
}
