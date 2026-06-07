<?php

namespace Database\Seeders;

use App\Models\Institute;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::where('slug', Role::STUDENT)->firstOrFail();
        $institutes = Institute::where('status', true)->get();
        $firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tina'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

        $studentIndex = 1;
        foreach ($institutes as $institute) {
            $count = $institute->id % 2 === 0 ? 8 : 5;

            for ($i = 0; $i < $count; $i++) {
                $firstName = $firstNames[array_rand($firstNames)];
                $lastName = $lastNames[array_rand($lastNames)];

                User::updateOrCreate(
                    ['email' => "student{$studentIndex}@demo.test"],
                    [
                        'name' => "{$firstName} {$lastName}",
                        'password' => Hash::make('password'),
                        'role_id' => $role->id,
                        'institute_id' => $institute->id,
                        'status' => 'active',
                    ]
                );

                $studentIndex++;
            }
        }
    }
}
