<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user      = $request->user();
        $institute = $user->institute;

        // ── Total exams for this institute ────────────────────────────────────
        // InstituteScope on Exam automatically filters by institute_id
        $totalExams = Exam::count();

        // ── Active students (users in this institute with student role) ───────
        $activeStudents = User::where('institute_id', $user->institute_id)
            ->whereHas('role', fn ($q) => $q->where('slug', Role::STUDENT))
            ->count();

        // ── Average score across all graded attempts for this institute ───────
        // Score per attempt = sum(points_awarded) / sum(question.points) * 100
        // We compute this in SQL for efficiency.
        $avgScore = DB::table('exam_attempts as ea')
            ->join('exams as e', 'e.id', '=', 'ea.exam_id')
            ->join('exam_attempt_answers as eaa', 'eaa.exam_attempt_id', '=', 'ea.id')
            ->join('questions as q', 'q.id', '=', 'eaa.question_id')
            ->where('e.institute_id', $user->institute_id)
            ->whereIn('ea.status', ['graded', 'needs_review', 'reviewed'])
            ->selectRaw('
                SUM(COALESCE(eaa.override_score, eaa.ai_score, 0)) /
                NULLIF(SUM(q.points), 0) * 100 as avg_pct
            ')
            ->value('avg_pct');

        // ── Credits remaining ─────────────────────────────────────────────────
        $creditsRemaining = $institute?->credits ?? 0;

        // ── Recent exams (last 5) with attempt count and avg score ────────────
        $recentExams = Exam::withCount('attempts')
            ->with(['attempts' => function ($q) {
                $q->whereIn('status', ['graded', 'needs_review', 'reviewed'])
                  ->with('answers.question');
            }])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($exam) {
                // Compute avg score for this exam from graded attempts
                $gradedAttempts = $exam->attempts;
                $avgScore       = null;

                if ($gradedAttempts->isNotEmpty()) {
                    $scores = $gradedAttempts->map(function ($attempt) {
                        $earned = $attempt->answers->sum(fn ($a) => (float) ($a->override_score ?? $a->ai_score ?? 0));
                        $total  = $attempt->answers->sum(fn ($a) => (float) ($a->question?->points ?? 0));

                        return $total > 0 ? ($earned / $total) * 100 : null;
                    })->filter()->values();

                    $avgScore = $scores->isNotEmpty()
                        ? round($scores->avg(), 1)
                        : null;
                }

                return [
                    'id'             => $exam->id,
                    'title'          => $exam->title,
                    'status'         => $exam->status,
                    'students_count' => $exam->attempts_count,
                    'avg_score'      => $avgScore,
                    'created_at'     => $exam->created_at->toISOString(),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalExams'       => $totalExams,
                'activeStudents'   => $activeStudents,
                'avgScore'         => round((float) ($avgScore ?? 0), 1),
                'creditsRemaining' => $creditsRemaining,
            ],
            'recentExams' => $recentExams,
        ]);
    }
}
