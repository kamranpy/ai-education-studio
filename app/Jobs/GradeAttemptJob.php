<?php

namespace App\Jobs;

use App\Models\ExamAttempt;
use App\Services\Llm\GradingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class GradeAttemptJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var int[] */
    public array $backoff = [10, 30, 90];

    public int $timeout = 600;

    public function __construct(public int $attemptId) {}

    public function uniqueId(): string
    {
        return (string) $this->attemptId;
    }

    public function handle(GradingService $svc): void
    {
        $attempt = ExamAttempt::with('answers.question')->findOrFail($this->attemptId);

        foreach ($attempt->answers as $answer) {
            if ($answer->question->type !== 'written') {
                continue;
            }

            // Idempotent: skip answers already graded (handles retry scenarios)
            if ($answer->ai_score !== null) {
                continue;
            }

            try {
                $result = $svc->gradeWrittenAnswer($answer->question, (string) $answer->answer_data['text'] ?? '');

                $answer->fill([
                    'ai_score' => max(0, min($result->score, $answer->question->points)),
                    'ai_confidence' => max(0, min($result->confidence, 1)),
                    'ai_explanation' => $result->explanation,
                    'ai_axes' => $result->axes,
                    'ai_provider' => $result->providerLabel,
                    'ai_model' => $result->model,
                    'tokens_in' => $result->usage->promptTokens ?? null,
                    'tokens_out' => $result->usage->completionTokens ?? null,
                    'status' => $result->confidence < 0.7 ? 'needs_review' : 'graded',
                ])->save();
            } catch (Throwable $e) {
                report($e);
                $answer->update(['status' => 'needs_review']);
            }
        }

        $attempt->finalizeGrading();
    }
}
