<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswer;
use App\Models\Question;
use App\Models\QuestionChoice;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExamAttemptSeeder extends Seeder
{
    public function run(): void
    {
        $publishedExams = Exam::whereIn('status', ['published', 'locked'])->get();
        $students = User::whereHas('role', fn ($q) => $q->where('slug', 'student'))->get();

        if ($publishedExams->isEmpty() || $students->isEmpty()) {
            return;
        }

        $aiProviders = ['openai', 'anthropic'];
        $aiModels = ['gpt-4o', 'claude-3-5-sonnet-20241022'];

        foreach ($publishedExams as $exam) {
            $attemptingStudents = $students->where('institute_id', $exam->institute_id)->random(min(4, $students->where('institute_id', $exam->institute_id)->count()));

            foreach ($attemptingStudents as $student) {
                $status = fake()->randomElement([
                    'in_progress',
                    'in_progress',
                    'submitted',
                    'submitted',
                    'submitted',
                    'graded',
                    'graded',
                    'needs_review',
                ]);

                $startedAt = fake()->dateTimeBetween('-7 days', 'now');
                $submittedAt = in_array($status, ['submitted', 'graded', 'needs_review'])
                    ? (clone $startedAt)->modify('+'.rand(20, $exam->time_limit_minutes ?? 60).' minutes')
                    : null;

                $questionOrder = $exam->questions->pluck('id')->shuffle()->values()->all();

                $attempt = ExamAttempt::create([
                    'user_id' => $student->id,
                    'exam_id' => $exam->id,
                    'status' => $status,
                    'question_order' => $questionOrder,
                    'tracking_logs' => [['event' => 'started', 'at' => $startedAt->format('c')]],
                    'started_at' => $startedAt,
                    'submitted_at' => $submittedAt,
                    'tf_submitted_at' => $submittedAt,
                    'mcqs_submitted_at' => $submittedAt,
                    'written_submitted_at' => $submittedAt,
                ]);

                // Skip answer creation for in-progress attempts sometimes
                if ($status === 'in_progress' && rand(0, 1) === 0) {
                    continue;
                }

                $this->createAnswers($attempt, $exam, $status, $aiProviders, $aiModels);
            }
        }
    }

    private function createAnswers(ExamAttempt $attempt, Exam $exam, string $status, array $aiProviders, array $aiModels): void
    {
        foreach ($exam->questions as $question) {
            $answerData = null;
            $isCorrect = null;
            $pointsAwarded = null;
            $aiScore = null;
            $aiConfidence = null;
            $aiExplanation = null;
            $aiAxes = null;
            $aiProvider = null;
            $aiModel = null;
            $tokensIn = null;
            $tokensOut = null;
            $answerStatus = 'pending';

            if ($question->type === 'mcq') {
                $choices = $question->choices;
                $selected = $choices->random();
                $answerData = ['selected_choice_id' => $selected->id];
                $isCorrect = $selected->is_correct;
                $pointsAwarded = $isCorrect ? $question->points : 0;
                $answerStatus = 'graded';
            } elseif ($question->type === 'true_false') {
                $choices = $question->choices;
                $selected = $choices->random();
                $answerData = ['selected_choice_id' => $selected->id];
                $isCorrect = $selected->is_correct;
                $pointsAwarded = $isCorrect ? $question->points : 0;
                $answerStatus = 'graded';
            } elseif ($question->type === 'written_answer') {
                $sampleAnswers = [
                    'Photosynthesis is the process by which plants convert light energy into chemical energy. It takes place in the chloroplasts and is essential for producing oxygen and glucose.',
                    'The Great Depression was caused by the stock market crash of 1929, leading to massive unemployment and bank failures. The New Deal helped recovery.',
                    'Mitosis produces two identical daughter cells with the same chromosome number, used for growth and repair. Meiosis produces four genetically diverse gametes with half the chromosome number.',
                    'OOP principles include encapsulation (hiding internals), inheritance (reusing code), polymorphism (many forms), and abstraction (simplifying complex systems).',
                    'Holden Caulfield struggles with identity throughout the novel, seeing adulthood as "phony" while desperately trying to protect childhood innocence.',
                ];
                $answerData = ['text' => $sampleAnswers[array_rand($sampleAnswers)] . ' ' . fake()->sentence(5)];

                if (in_array($status, ['graded', 'needs_review'])) {
                    $aiScore = round(rand(40, 95) / 100 * $question->points, 2);
                    $aiConfidence = round(rand(700, 980) / 1000, 3);
                    $aiExplanation = fake()->paragraph(2);
                    $aiAxes = [
                        ['axis' => 'Concept', 'score' => rand(60, 95), 'max' => 100],
                        ['axis' => 'Logic', 'score' => rand(50, 90), 'max' => 100],
                        ['axis' => 'Terminology', 'score' => rand(55, 92), 'max' => 100],
                    ];
                    $aiProvider = $aiProviders[array_rand($aiProviders)];
                    $aiModel = $aiModels[array_rand($aiModels)];
                    $tokensIn = rand(200, 800);
                    $tokensOut = rand(150, 600);
                    $pointsAwarded = $aiScore;
                    $answerStatus = $status === 'needs_review' && rand(0, 2) === 0 ? 'needs_review' : 'graded';
                }
            }

            ExamAttemptAnswer::create([
                'exam_attempt_id' => $attempt->id,
                'question_id' => $question->id,
                'answer_data' => $answerData,
                'is_correct' => $isCorrect,
                'points_awarded' => $pointsAwarded,
                'ai_evaluation_data' => $aiScore !== null ? [
                    'score' => $aiScore,
                    'confidence' => $aiConfidence,
                    'explanation' => $aiExplanation,
                ] : null,
                'ai_score' => $aiScore,
                'ai_confidence' => $aiConfidence,
                'ai_explanation' => $aiExplanation,
                'ai_axes' => $aiAxes,
                'ai_provider' => $aiProvider,
                'ai_model' => $aiModel,
                'tokens_in' => $tokensIn,
                'tokens_out' => $tokensOut,
                'status' => $answerStatus,
            ]);
        }

        // Finalize attempt grading status
        if (in_array($status, ['graded', 'needs_review'])) {
            $attempt->finalizeGrading();
        }
    }
}
