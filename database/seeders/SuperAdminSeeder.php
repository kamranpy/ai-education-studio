<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::where('slug', Role::SUPER_ADMIN)->firstOrFail();

        User::updateOrCreate(
            ['email' => 'admin@email.com'],
            [
                'name' => 'Super Admin',
                'password' => 'admin',
                'role_id' => $role->id,
                'institute_id' => null,
            ]
        );
    }
}
