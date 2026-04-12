<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@education.local'],
            [
                'name' => 'Super Admin',
                'password' => 'password',
                'role' => 'super_admin',
                'institute_id' => null,
            ]
        );
    }
}
