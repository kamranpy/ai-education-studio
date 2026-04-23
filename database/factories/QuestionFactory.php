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
            'type' => fake()->randomElement(['mcq', 'true_false', 'written_answer']),
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
            'type' => 'true_false',
        ]);
    }

    public function written(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'written_answer',
            'grading_guidelines' => fake()->paragraph(),
        ]);
    }
}
