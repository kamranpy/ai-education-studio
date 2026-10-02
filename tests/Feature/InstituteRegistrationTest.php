<?php

namespace Tests\Feature;

use App\Models\Institute;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstituteRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_registration_creates_institute_and_user_atomically(): void
    {
        $response = $this->post('/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'institute_name' => 'Acme University',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseCount('institutes', 1);
        $this->assertDatabaseCount('users', 1);

        $institute = Institute::first();
        $user = User::withoutGlobalScopes()->first();
        $adminRole = Role::where('slug', Role::INSTITUTE_ADMIN)->first();

        $this->assertEquals('Acme University', $institute->name);
        $this->assertEquals($institute->id, $user->institute_id);
        $this->assertEquals($adminRole->id, $user->role_id);
    }

    public function test_registration_fails_without_institute_name(): void
    {
        $response = $this->post('/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors('institute_name');
        $this->assertDatabaseCount('institutes', 0);
        $this->assertDatabaseCount('users', 0);
    }
}
