<?php

namespace App\Console\Commands;

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
            ->with('exam:id,time_limit_minutes')
            ->get();

        $submittedCount = 0;

        foreach ($expiredAttempts as $attempt) {
            $deadline = $attempt->started_at
                ->addMinutes($attempt->exam->time_limit_minutes)
                ->addMinutes($graceMinutes);

            if (now()->greaterThan($deadline)) {
                $attempt->update([
                    'status' => 'submitted',
                    'submitted_at' => now(),
                ]);

                $submittedCount++;
            }
        }

        if ($submittedCount > 0) {
            $this->info("Auto-submitted {$submittedCount} expired exam attempt(s).");
        } else {
            $this->info('No expired exam attempts found.');
        }

        return self::SUCCESS;
    }
}
