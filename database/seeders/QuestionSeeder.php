<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\Question;
use App\Models\QuestionChoice;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $exams = Exam::all();

        $mcqBanks = [
            [
                'text' => 'What is the derivative of x² with respect to x?',
                'choices' => [
                    ['text' => '2x', 'is_correct' => true],
                    ['text' => 'x²', 'is_correct' => false],
                    ['text' => 'x', 'is_correct' => false],
                    ['text' => '2', 'is_correct' => false],
                ],
            ],
            [
                'text' => 'Which planet is known as the Red Planet?',
                'choices' => [
                    ['text' => 'Venus', 'is_correct' => false],
                    ['text' => 'Mars', 'is_correct' => true],
                    ['text' => 'Jupiter', 'is_correct' => false],
                    ['text' => 'Saturn', 'is_correct' => false],
                ],
            ],
            [
                'text' => 'What is the chemical symbol for Gold?',
                'choices' => [
                    ['text' => 'Ag', 'is_correct' => false],
                    ['text' => 'Fe', 'is_correct' => false],
                    ['text' => 'Au', 'is_correct' => true],
                    ['text' => 'Cu', 'is_correct' => false],
                ],
            ],
            [
                'text' => 'In which year did World War II end?',
                'choices' => [
                    ['text' => '1943', 'is_correct' => false],
                    ['text' => '1944', 'is_correct' => false],
                    ['text' => '1945', 'is_correct' => true],
                    ['text' => '1946', 'is_correct' => false],
                ],
            ],
            [
                'text' => 'What is the time complexity of binary search?',
                'choices' => [
                    ['text' => 'O(n)', 'is_correct' => false],
                    ['text' => 'O(log n)', 'is_correct' => true],
                    ['text' => 'O(n²)', 'is_correct' => false],
                    ['text' => 'O(1)', 'is_correct' => false],
                ],
            ],
        ];

        $tfBanks = [
            ['text' => 'Water boils at 100°C at sea level.', 'is_correct' => true],
            ['text' => 'The Earth is flat.', 'is_correct' => false],
            ['text' => 'Photosynthesis occurs in the mitochondria.', 'is_correct' => false],
            ['text' => 'The speed of light is approximately 300,000 km/s.', 'is_correct' => true],
            ['text' => 'Shakespeare wrote "To Kill a Mockingbird".', 'is_correct' => false],
        ];

        $writtenBanks = [
            [
                'text' => 'Explain the process of photosynthesis and its importance to life on Earth.',
                'guidelines' => 'Expect mention of chlorophyll, sunlight, CO2, water, glucose, and oxygen. Score based on completeness and accuracy.',
                'points' => 10,
            ],
            [
                'text' => 'Describe the causes and consequences of the Great Depression.',
                'guidelines' => 'Should cover stock market crash, bank failures, unemployment, New Deal. Evaluate depth and historical accuracy.',
                'points' => 10,
            ],
            [
                'text' => 'Compare and contrast mitosis and meiosis.',
                'guidelines' => 'Differences in chromosome number, crossing over, number of divisions, purpose. Similarities in stages.',
                'points' => 8,
            ],
            [
                'text' => 'What are the key principles of Object-Oriented Programming? Explain with examples.',
                'guidelines' => 'Expect: encapsulation, inheritance, polymorphism, abstraction. Each principle should have a clear example.',
                'points' => 10,
            ],
            [
                'text' => 'Analyze the theme of identity in "The Catcher in the Rye".',
                'guidelines' => 'Look for references to Holden\'s alienation, phoniness, innocence, and self-discovery. Depth of analysis matters.',
                'points' => 12,
            ],
        ];

        foreach ($exams as $exam) {
            $order = 0;

            // Add 3-5 MCQs
            $mcqCount = rand(3, 5);
            $shuffledMcq = collect($mcqBanks)->shuffle()->take($mcqCount);
            foreach ($shuffledMcq as $bank) {
                $question = Question::create([
                    'exam_id' => $exam->id,
                    'type' => 'mcq',
                    'text' => $bank['text'],
                    'points' => rand(1, 3),
                    'order' => $order++,
                ]);

                foreach ($bank['choices'] as $choice) {
                    QuestionChoice::create([
                        'question_id' => $question->id,
                        'text' => $choice['text'],
                        'is_correct' => $choice['is_correct'],
                    ]);
                }
            }

            // Add 2-3 True/False
            $tfCount = rand(2, 3);
            $shuffledTf = collect($tfBanks)->shuffle()->take($tfCount);
            foreach ($shuffledTf as $bank) {
                $question = Question::create([
                    'exam_id' => $exam->id,
                    'type' => 'true_false',
                    'text' => $bank['text'],
                    'points' => 1,
                    'order' => $order++,
                ]);

                QuestionChoice::create([
                    'question_id' => $question->id,
                    'text' => 'True',
                    'is_correct' => $bank['is_correct'],
                ]);

                QuestionChoice::create([
                    'question_id' => $question->id,
                    'text' => 'False',
                    'is_correct' => ! $bank['is_correct'],
                ]);
            }

            // Add 2-4 Written
            $writtenCount = rand(2, 4);
            $shuffledWritten = collect($writtenBanks)->shuffle()->take($writtenCount);
            foreach ($shuffledWritten as $bank) {
                Question::create([
                    'exam_id' => $exam->id,
                    'type' => 'written_answer',
                    'text' => $bank['text'],
                    'points' => $bank['points'],
                    'grading_guidelines' => $bank['guidelines'],
                    'order' => $order++,
                ]);
            }
        }
    }
}
