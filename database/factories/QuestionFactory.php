<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'exam_id' => Exam::factory(),
            'type' => fake()->randomElement(['mcq', 'tf', 'written']),
            'text' => fake()->sentence(),
            'points' => fake()->numberBetween(1, 10),
            'order' => 0,
        ];
    }

    public function mcq(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'mcq',
        ]);
    }

    public function trueFalse(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'tf',
        ]);
    }

    public function written(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'written',
            'grading_guidelines' => fake()->paragraph(),
        ]);
    }
}
