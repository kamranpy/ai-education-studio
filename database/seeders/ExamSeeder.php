<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\Institute;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $institutes = Institute::where('status', true)->get();

        $examTemplates = [
            ['title' => 'Advanced Mathematics Final', 'class' => 'Grade 12', 'subject' => 'Mathematics', 'time' => 120, 'passing' => 60],
            ['title' => 'Physics: Mechanics & Waves', 'class' => 'Grade 11', 'subject' => 'Physics', 'time' => 90, 'passing' => 50],
            ['title' => 'English Literature Assessment', 'class' => 'Grade 10', 'subject' => 'English', 'time' => 60, 'passing' => 50],
            ['title' => 'Chemistry: Organic Compounds', 'class' => 'Grade 12', 'subject' => 'Chemistry', 'time' => 90, 'passing' => 55],
            ['title' => 'History: World War II', 'class' => 'Grade 11', 'subject' => 'History', 'time' => 45, 'passing' => 50],
            ['title' => 'Computer Science: Data Structures', 'class' => 'Grade 12', 'subject' => 'Computer Science', 'time' => 120, 'passing' => 60],
            ['title' => 'Biology: Cell Division', 'class' => 'Grade 10', 'subject' => 'Biology', 'time' => 60, 'passing' => 50],
            ['title' => 'Economics: Micro & Macro', 'class' => 'Grade 11', 'subject' => 'Economics', 'time' => 90, 'passing' => 50],
        ];

        foreach ($institutes as $institute) {
            $count = $institute->id % 2 === 0 ? 4 : 3;
            $shuffled = collect($examTemplates)->shuffle()->take($count);

            foreach ($shuffled as $template) {
                $status = fake()->randomElement(['draft', 'published', 'published', 'locked']);
                $evaluation = fake()->randomElement(['instant', 'instant', 'manual']);
                $resultsAt = ($status === 'locked' && $evaluation === 'manual')
                    ? fake()->dateTimeBetween('-30 days', '-1 day')
                    : null;

                Exam::create([
                    'institute_id' => $institute->id,
                    'title' => $template['title'],
                    'description' => fake()->paragraph(3),
                    'class_name' => $template['class'],
                    'subject_name' => $template['subject'],
                    'time_limit_minutes' => $template['time'],
                    'passing_score' => $template['passing'],
                    'status' => $status,
                    'evaluation_strategy' => $evaluation,
                    'results_announced_at' => $resultsAt,
                ]);
            }
        }
    }
}
