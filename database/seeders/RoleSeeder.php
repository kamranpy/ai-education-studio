<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Super Admin', 'slug' => Role::SUPER_ADMIN],
            ['name' => 'Institute Admin', 'slug' => Role::INSTITUTE_ADMIN],
            ['name' => 'Student', 'slug' => Role::STUDENT],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
