<?php

namespace Database\Seeders;

use App\Models\Institute;
use Illuminate\Database\Seeder;

class InstituteSeeder extends Seeder
{
    public function run(): void
    {
        $institutes = [
            ['name' => 'Cambridge Academy', 'status' => true, 'credits' => 250],
            ['name' => 'Oxford Prep School', 'status' => true, 'credits' => 500],
            ['name' => 'Tech Institute of Science', 'status' => true, 'credits' => 120],
            ['name' => 'Global Language Center', 'status' => false, 'credits' => 0],
            ['name' => 'Future Leaders Academy', 'status' => true, 'credits' => 1000],
        ];

        foreach ($institutes as $institute) {
            $createdAt = now()->subDays(rand(0, 7));

            Institute::updateOrCreate(
                ['name' => $institute['name']],
                array_merge($institute, [
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ])
            );
        }
    }
}
