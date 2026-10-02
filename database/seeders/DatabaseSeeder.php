<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Auth & roles
            RoleSeeder::class,
            SuperAdminSeeder::class,

            // Institutes & users
            InstituteSeeder::class,
            InstituteAdminSeeder::class,
            StudentSeeder::class,

            // Business & billing
            CreditPackageSeeder::class,
            SiteSettingSeeder::class,
            TransactionSeeder::class,

            // Exams & content
            ExamSeeder::class,
            QuestionSeeder::class,

            // Student activity
            ExamAttemptSeeder::class,
        ]);
    }
}
