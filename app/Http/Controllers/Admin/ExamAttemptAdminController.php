<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswerOverride;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExamAttemptAdminController extends Controller
{
    /**
     * List all attempts for an exam (scoped to admin's institute via Exam model).
     */
    public function index(Request $request, Exam $exam): Response
    {
        $query = ExamAttempt::query()
            ->where('exam_id', $exam->id)
            ->with('user:id,name,email')
            ->latest('submitted_at');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $attempts = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Exams/AttemptsIndex', [
            'exam' => $exam->only('id', 'title', 'status'),
            'attempts' => $attempts,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show a single attempt with all answers, AI grading, and override forms.
     */
    public function show(Exam $exam, ExamAttempt $attempt): Response
    {
        abort_unless($attempt->exam_id === $exam->id, 404);

        $attempt->load([
            'user:id,name,email',
            'answers.question.choices',
            'answers.overrides.actor:id,name',
        ]);

        // Calculate totals
        $totalPoints = $attempt->answers->sum(fn ($a) => $a->question->points);
        $finalScore = $attempt->answers->sum(fn ($a) => $a->final_score ?? 0);

        return Inertia::render('Admin/Exams/AttemptsShow', [
            'exam' => $exam->only('id', 'title'),
            'attempt' => array_merge($attempt->toArray(), [
                'total_points' => $totalPoints,
                'final_score' => $finalScore,
            ]),
        ]);
    }

    /**
     * Apply a manual score override to an answer.
     */
    public function override(Request $request, Exam $exam, ExamAttempt $attempt): RedirectResponse
    {
        abort_unless($attempt->exam_id === $exam->id, 404);

        $validated = $request->validate([
            'answer_id' => ['required', 'integer'],
            'override_score' => ['required', 'numeric', 'min:0'],
            'override_comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $answer = $attempt->answers()->findOrFail($validated['answer_id']);

        // Clamp score to max points
        $score = min($validated['override_score'], $answer->question->points);

        // Create audit trail
        ExamAttemptAnswerOverride::create([
            'exam_attempt_answer_id' => $answer->id,
            'actor_id' => Auth::id(),
            'previous_score' => $answer->final_score,
            'new_score' => $score,
            'comment' => $validated['override_comment'],
        ]);

        $answer->update([
            'override_score' => $score,
            'override_comment' => $validated['override_comment'],
            'overridden_by' => Auth::id(),
            'overridden_at' => now(),
            'status' => 'graded',
        ]);

        // Recalculate attempt status
        $attempt->finalizeGrading();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Override saved. Final score updated.']);

        return back();
    }

    /**
     * Mark an answer as reviewed without changing the score.
     */
    public function markReviewed(Exam $exam, ExamAttempt $attempt): RedirectResponse
    {
        abort_unless($attempt->exam_id === $exam->id, 404);

        // Mark all needs_review answers as graded
        $attempt->answers()
            ->where('status', 'needs_review')
            ->update(['status' => 'graded']);

        $attempt->finalizeGrading();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'All answers marked as reviewed.']);

        return back();
    }

    /**
     * Stream CSV export of all attempt results.
     */
    public function export(Exam $exam): StreamedResponse
    {
        $attempts = ExamAttempt::query()
            ->where('exam_id', $exam->id)
            ->with(['user:id,name,email', 'answers.question'])
            ->whereIn('status', ['graded', 'needs_review', 'grading'])
            ->latest('submitted_at')
            ->get();

        return response()->streamDownload(function () use ($attempts) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Student Name', 'Email', 'Submitted At', 'Status', 'Final Score']);

            foreach ($attempts as $attempt) {
                $finalScore = $attempt->answers->sum(fn ($a) => $a->final_score ?? 0);
                $totalPoints = $attempt->answers->sum(fn ($a) => $a->question->points);

                fputcsv($handle, [
                    $attempt->user->name,
                    $attempt->user->email,
                    $attempt->submitted_at?->toDateTimeString() ?? 'N/A',
                    $attempt->status,
                    "{$finalScore}/{$totalPoints}",
                ]);
            }

            fclose($handle);
        }, "exam-results-{$exam->id}.csv", [
            'Content-Type' => 'text/csv',
        ]);
    }
}
