<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Jobs\GradeAttemptJob;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExamAttemptController extends Controller
{
    /**
     * Start a new exam attempt or resume an existing one.
     */
    public function store(Request $request, Exam $exam): RedirectResponse
    {
        $user = Auth::user();

        // Ensure exam is published
        if (! $exam->isPublished()) {
            abort(403, __('This exam is not available.'));
        }

        // Check for existing in-progress attempt — resume it
        $existingAttempt = ExamAttempt::query()
            ->where('user_id', $user->id)
            ->where('exam_id', $exam->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return to_route('student.attempts.show', [
                'exam' => $exam->id,
                'attempt' => $existingAttempt->id,
            ]);
        }

        // Block if already submitted (one attempt per exam)
        $alreadySubmitted = ExamAttempt::query()
            ->where('user_id', $user->id)
            ->where('exam_id', $exam->id)
            ->where('status', 'submitted')
            ->exists();

        if ($alreadySubmitted) {
            Inertia::flash('toast', ['type' => 'info', 'message' => __('You have already completed this exam.')]);

            return to_route('student.dashboard');
        }

        // Shuffle question IDs for randomized order (per D-05 / TAKE-05)
        $questionIds = $exam->questions()->pluck('id')->shuffle()->values()->toArray();

        if (empty($questionIds)) {
            abort(422, __('This exam has no questions.'));
        }

        $attempt = ExamAttempt::create([
            'user_id' => $user->id,
            'exam_id' => $exam->id,
            'status' => 'in_progress',
            'question_order' => $questionIds,
            'started_at' => now(),
        ]);

        return to_route('student.attempts.show', [
            'exam' => $exam->id,
            'attempt' => $attempt->id,
        ]);
    }

    /**
     * Show a single question from the exam attempt (per D-01: one question at a time).
     */
    public function show(Request $request, Exam $exam, ExamAttempt $attempt): Response|RedirectResponse
    {
        $this->authorizeAttempt($attempt);

        if (! $attempt->isInProgress()) {
            Inertia::flash('toast', ['type' => 'info', 'message' => __('This exam has already been submitted.')]);

            return to_route('student.dashboard');
        }

        $questionIndex = (int) $request->input('q', 0);
        $questionOrder = $attempt->question_order;
        $totalQuestions = count($questionOrder);

        // Clamp index
        $questionIndex = max(0, min($questionIndex, $totalQuestions - 1));

        $questionId = $questionOrder[$questionIndex];
        $question = $exam->questions()->with('choices')->findOrFail($questionId);

        // Load existing answer if any
        $existingAnswer = $attempt->answers()
            ->where('question_id', $questionId)
            ->first();

        return Inertia::render('Student/ExamTake', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'time_limit_minutes' => $exam->time_limit_minutes,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'started_at' => $attempt->started_at->toISOString(),
            ],
            'question' => [
                'id' => $question->id,
                'type' => $question->type,
                'text' => $question->text,
                'points' => $question->points,
                'choices' => $question->choices->map(fn ($c) => [
                    'id' => $c->id,
                    'text' => $c->text,
                ]),
            ],
            'questionIndex' => $questionIndex,
            'totalQuestions' => $totalQuestions,
            'existingAnswer' => $existingAnswer?->answer_data,
        ]);
    }

    /**
     * Save an answer and optionally submit the exam.
     */
    public function update(Request $request, Exam $exam, ExamAttempt $attempt): RedirectResponse
    {
        $this->authorizeAttempt($attempt);

        if (! $attempt->isInProgress()) {
            abort(403, __('This exam has already been submitted.'));
        }

        // Server-side timer check (per D-04 / TAKE-02) — 30s grace period
        if ($exam->time_limit_minutes) {
            $deadline = $attempt->started_at->addMinutes($exam->time_limit_minutes)->addSeconds(30);
            if (now()->greaterThan($deadline)) {
                $attempt->load('answers.question.choices');

                DB::transaction(function () use ($attempt) {
                    foreach ($attempt->answers as $answer) {
                        if ($answer->question->type !== 'written') {
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

                GradeAttemptJob::dispatch($attempt->id)->afterCommit();

                Inertia::flash('toast', ['type' => 'warning', 'message' => __('Time expired. Your exam has been submitted automatically.')]);

                return to_route('student.dashboard');
            }
        }

        $validated = $request->validate([
            'question_id' => 'required|integer|exists:questions,id',
            'answer_data' => 'nullable|array',
            'action' => 'required|in:save,submit',
        ]);

        // Validate question belongs to this exam
        $questionBelongsToExam = $exam->questions()->where('id', $validated['question_id'])->exists();
        if (! $questionBelongsToExam) {
            abort(422, __('This question does not belong to the exam.'));
        }

        // Upsert the answer
        $attempt->answers()->updateOrCreate(
            ['question_id' => $validated['question_id']],
            ['answer_data' => $validated['answer_data']],
        );

        // Submit exam (per TAKE-07) with instant grading for MC/TF
        if ($validated['action'] === 'submit') {
            // Eager-load answers with their questions for grading
            $attempt->load('answers.question.choices');

            DB::transaction(function () use ($attempt) {
                // Instantly grade all objective questions (MC/TF)
                foreach ($attempt->answers as $answer) {
                    if ($answer->question->type !== 'written') {
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

            // Dispatch async job for written answer AI grading
            GradeAttemptJob::dispatch($attempt->id)->afterCommit();

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Exam submitted successfully! Your answers are being graded.')]);

            return to_route('student.dashboard');
        }

        // Redirect to the next question index
        $nextIndex = $request->input('next_index', 0);

        return to_route('student.attempts.show', [
            'exam' => $exam->id,
            'attempt' => $attempt->id,
            'q' => $nextIndex,
        ]);
    }

    /**
     * Log a tracking event (tab blur, etc.) — per D-03 / TAKE-06.
     */
    public function logTracking(Request $request, Exam $exam, ExamAttempt $attempt): \Illuminate\Http\JsonResponse
    {
        $this->authorizeAttempt($attempt);

        $validated = $request->validate([
            'event' => 'required|string|in:blur,focus',
            'timestamp' => 'required|string',
        ]);

        $logs = $attempt->tracking_logs ?? [];
        $logs[] = [
            'event' => $validated['event'],
            'client_timestamp' => $validated['timestamp'],
            'server_timestamp' => now()->toISOString(),
        ];

        $attempt->update(['tracking_logs' => $logs]);

        return response()->json(['status' => 'ok']);
    }

    /**
     * Ensure the attempt belongs to the authenticated user.
     */
    private function authorizeAttempt(ExamAttempt $attempt): void
    {
        if ($attempt->user_id !== Auth::id()) {
            abort(403, __('Unauthorized.'));
        }
    }
}
