<?php

namespace Tests\Feature;

use App\Models\Institute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstituteRegistrationTest extends TestCase
{
    use RefreshDatabase;

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

        $this->assertEquals('Acme University', $institute->name);
        $this->assertEquals($institute->id, $user->institute_id);
        $this->assertEquals('institute_admin', $user->role);
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
