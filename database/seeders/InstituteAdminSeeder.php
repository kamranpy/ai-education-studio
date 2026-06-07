<?php

namespace Database\Seeders;

use App\Models\Institute;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InstituteAdminSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::where('slug', Role::INSTITUTE_ADMIN)->firstOrFail();
        $institutes = Institute::all();

        foreach ($institutes as $index => $institute) {
            if (! $institute->status) {
                continue;
            }

            User::updateOrCreate(
                ['email' => "admin{$index}@{$this->slugify($institute->name)}.test"],
                [
                    'name' => "Admin — {$institute->name}",
                    'password' => Hash::make('password'),
                    'role_id' => $role->id,
                    'institute_id' => $institute->id,
                    'status' => 'active',
                ]
            );
        }
    }

    private function slugify(string $name): string
    {
        return strtolower(str_replace(' ', '-', $name));
    }
}
