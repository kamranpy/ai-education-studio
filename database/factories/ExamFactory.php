<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Institute;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Exam>
 */
class ExamFactory extends Factory
{
    public function definition(): array
    {
        return [
            'institute_id' => Institute::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'time_limit_minutes' => fake()->randomElement([30, 45, 60, 90, 120]),
            'passing_score' => 50,
            'status' => 'draft',
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    public function locked(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'locked',
        ]);
    }
}
