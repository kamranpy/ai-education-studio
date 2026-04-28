<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ResultsController extends Controller
{
    /**
     * Show the student's exam results history.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $attempts = ExamAttempt::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['graded', 'needs_review', 'reviewed'])
            ->with(['exam' => function ($q) {
                $q->select('id', 'title', 'class_name', 'subject_name', 'passing_score', 'evaluation_strategy', 'results_announced_at');
            }])
            ->withSum('answers as total_points_possible', 'question.points')
            ->latest('submitted_at')
            ->paginate(15)
            ->withQueryString();

        // Filter: only show results that the student is allowed to see
        $attempts->getCollection()->transform(function ($attempt) {
            $exam = $attempt->exam;
            $canSee = $exam && $exam->canStudentSeeResults();

            return [
                'id' => $attempt->id,
                'exam' => $exam ? [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'class_name' => $exam->class_name,
                    'subject_name' => $exam->subject_name,
                    'passing_score' => $exam->passing_score,
                    'evaluation_strategy' => $exam->evaluation_strategy,
                    'results_announced' => $exam->isResultsAnnounced(),
                ] : null,
                'status' => $attempt->status,
                'submitted_at' => $attempt->submitted_at,
                'can_see_results' => $canSee,
                'final_score' => $canSee ? $attempt->answers->sum('final_score') : null,
                'total_points' => $canSee ? $attempt->answers->sum(fn ($a) => $a->question?->points ?? 0) : null,
            ];
        });

        return Inertia::render('Student/ResultsHistory', [
            'attempts' => $attempts,
        ]);
    }
}
