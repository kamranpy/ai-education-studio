<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $exams = Exam::query()
            ->where('status', 'published')
            ->withCount('questions')
            ->latest()
            ->paginate(12);

        // Fetch in-progress attempts for the current user
        $inProgressAttemptIds = ExamAttempt::query()
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->pluck('exam_id')
            ->toArray();

        return Inertia::render('Student/Dashboard', [
            'exams' => $exams,
            'inProgressExamIds' => $inProgressAttemptIds,
        ]);
    }
}
