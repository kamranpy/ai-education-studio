<?php

namespace App\Console\Commands;

use App\Jobs\GradeAttemptJob;
use App\Models\ExamAttempt;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SubmitExpiredExams extends Command
{
    protected $signature = 'app:submit-expired-exams';

    protected $description = 'Auto-submit exam attempts that have exceeded their time limit (per D-04)';

    public function handle(): int
    {
        $graceMinutes = 5;

        $expiredAttempts = ExamAttempt::query()
            ->where('status', 'in_progress')
            ->whereHas('exam', function ($query) {
                $query->whereNotNull('time_limit_minutes');
            })
            ->with(['exam:id,time_limit_minutes', 'answers.question.choices'])
            ->get();

        $submittedCount = 0;

        foreach ($expiredAttempts as $attempt) {
            $deadline = $attempt->started_at
                ->addMinutes($attempt->exam->time_limit_minutes)
                ->addMinutes($graceMinutes);

            if (now()->greaterThan($deadline)) {
                DB::transaction(function () use ($attempt) {
                    // Instantly grade all objective questions (MC/TF)
                    foreach ($attempt->answers as $answer) {
                        if ($answer->question->type !== 'written_answer') {
                            $isCorrect = $answer->isObjectiveCorrect();
                            $answer->fill([
                                'ai_score' => $isCorrect ? $answer->question->points : 0,
                                'ai_confidence' => 1.0,
                                'status' => 'graded',
                            ])->save();
                        }
                    }

                    $attempt->update([
                        'status' => 'grading',
                        'submitted_at' => now(),
                    ]);
                });

                // Dispatch async AI grading for written answers
                GradeAttemptJob::dispatch($attempt->id)->afterCommit();

                $submittedCount++;
            }
        }

        if ($submittedCount > 0) {
            $this->info("Auto-submitted and queued grading for {$submittedCount} expired exam attempt(s).");
        } else {
            $this->info('No expired exam attempts found.');
        }

        return self::SUCCESS;
    }
}
