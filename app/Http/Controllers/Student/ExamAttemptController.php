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
            ->where('status', '!=', 'in_progress')
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
     * Also passes section submission status for sectional exam UI.
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

        // Load all questions grouped by type for sectional view
        $allQuestions = $exam->questions()->with('choices')
            ->orderBy('order')
            ->get();

        // Load all existing answers for this attempt
        $allAnswers = $attempt->answers()->get()->keyBy('question_id');

        // Group questions by type with existing answers
        $sectionQuestions = [];
        foreach (['true_false', 'mcq', 'written_answer'] as $type) {
            $sectionQuestions[$type] = $allQuestions
                ->where('type', $type)
                ->values()
                ->map(fn ($q) => [
                    'id' => $q->id,
                    'type' => $q->type,
                    'text' => $q->text,
                    'points' => $q->points,
                    'choices' => $q->choices->map(fn ($c) => [
                        'id' => $c->id,
                        'text' => $c->text,
                    ]),
                    'existing_answer' => $allAnswers->has($q->id)
                        ? $allAnswers[$q->id]->answer_data
                        : null,
                ]);
        }

        return Inertia::render('Student/ExamTake', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'time_limit_minutes' => $exam->time_limit_minutes,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'started_at' => $attempt->started_at->toISOString(),
                'tf_submitted_at' => $attempt->tf_submitted_at?->toISOString(),
                'mcqs_submitted_at' => $attempt->mcqs_submitted_at?->toISOString(),
                'written_submitted_at' => $attempt->written_submitted_at?->toISOString(),
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
            'sectionQuestions' => $sectionQuestions,
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
            ['answer_data' => $validated['answer_data'] ?? []],
        );

        // Submit exam (per TAKE-07) with instant grading for MC/TF
        if ($validated['action'] === 'submit') {
            // Eager-load answers with their questions for grading
            $attempt->load('answers.question.choices');

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

            // Dispatch async job for written answer AI grading
            GradeAttemptJob::dispatch($attempt->id)->afterCommit();

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Exam submitted successfully! Your answers are being graded.')]);

            return to_route('student.attempts.results', [$exam, $attempt]);
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
     * Show the student's results for a completed attempt.
     * If grading is in progress, show the interstitial loading page.
     * Per D-25: AI explanation is NOT shown to students.
     */
    public function results(Exam $exam, ExamAttempt $attempt): Response
    {
        abort_unless($attempt->exam_id === $exam->id, 404);
        $this->authorizeAttempt($attempt);

        // Must be submitted/graded — not in_progress
        if ($attempt->isInProgress()) {
            abort(403, __('This exam has not been submitted yet.'));
        }

        // Manual evaluation: block until results are announced
        if ($exam->isManualEvaluation() && ! $exam->isResultsAnnounced()) {
            return Inertia::render('Student/ResultsPending', [
                'exam' => $exam->only('id', 'title'),
                'attempt' => $attempt->only('id', 'status', 'submitted_at'),
            ]);
        }

        // Grading in progress — show interstitial
        if ($attempt->status === 'grading') {
            return Inertia::render('Student/Interstitial', [
                'exam' => $exam->only('id', 'title'),
                'attempt' => $attempt->only('id', 'status'),
            ]);
        }

        $attempt->load('answers.question');

        $totalPoints = $attempt->answers->sum(fn ($a) => $a->question->points);
        $finalScore = $attempt->answers->sum(fn ($a) => $a->final_score ?? 0);

        // Strip AI explanation — student must not see it (D-25)
        $answers = $attempt->answers->map(fn ($a) => [
            'id' => $a->id,
            'question' => [
                'id' => $a->question->id,
                'type' => $a->question->type,
                'text' => $a->question->text,
                'points' => $a->question->points,
            ],
            'answer_data' => $a->answer_data,
            'final_score' => $a->final_score,
            'status' => $a->status,
            'ai_score' => $a->ai_score,
        ]);

        return Inertia::render('Student/Results', [
            'exam' => $exam->only('id', 'title'),
            'attempt' => [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'submitted_at' => $attempt->submitted_at,
                'total_points' => $totalPoints,
                'final_score' => $finalScore,
                'answers' => $answers,
            ],
        ]);
    }

    /**
     * Submit a specific section (TF, MCQs, or Written) independently.
     * Once submitted, the section is locked via backend validation.
     */
    public function submitSection(Request $request, Exam $exam, ExamAttempt $attempt): RedirectResponse
    {
        $this->authorizeAttempt($attempt);

        if (! $attempt->isInProgress()) {
            abort(403, __('This exam has already been submitted.'));
        }

        $validated = $request->validate([
            'section' => 'required|string|in:true_false,mcq,written_answer',
            'answers' => 'nullable|array',
            'answers.*.question_id' => 'required|integer|exists:questions,id',
            'answers.*.answer_data' => 'nullable|array',
        ]);

        $section = $validated['section'];

        // Prevent re-submission of an already submitted section
        if ($attempt->isSectionSubmitted($section)) {
            abort(403, __('This section has already been submitted.'));
        }

        // Determine the timestamp field
        $timestampField = match ($section) {
            'true_false' => 'tf_submitted_at',
            'mcq' => 'mcqs_submitted_at',
            'written_answer' => 'written_submitted_at',
        };

        DB::transaction(function () use ($attempt, $exam, $validated, $section, $timestampField) {
            // Save/update all answers for this section
            foreach ($validated['answers'] ?? [] as $answerData) {
                // Validate question belongs to this exam and is of the correct type
                $question = $exam->questions()
                    ->where('id', $answerData['question_id'])
                    ->where('type', $section)
                    ->first();

                if (! $question) {
                    continue;
                }

                $attempt->answers()->updateOrCreate(
                    ['question_id' => $answerData['question_id']],
                    ['answer_data' => $answerData['answer_data'] ?? []],
                );
            }

            // Instantly grade objective questions (MC/TF)
            if (in_array($section, ['true_false', 'mcq'])) {
                $sectionAnswers = $attempt->answers()
                    ->whereHas('question', fn ($q) => $q->where('type', $section))
                    ->with('question.choices')
                    ->get();

                foreach ($sectionAnswers as $answer) {
                    $isCorrect = $answer->isObjectiveCorrect();
                    $answer->fill([
                        'ai_score' => $isCorrect ? $answer->question->points : 0,
                        'ai_confidence' => 1.0,
                        'status' => 'graded',
                    ])->save();
                }
            }

            // Mark section as submitted
            $attempt->update([$timestampField => now()]);
        });

        $sectionLabel = match ($section) {
            'true_false' => 'True/False',
            'mcq' => 'Multiple Choice',
            'written_answer' => 'Written Answers',
        };

        Inertia::flash('toast', ['type' => 'success', 'message' => __("{$sectionLabel} section submitted successfully.")]);

        // Check if all sections with questions are now submitted — auto-submit exam
        $hasWritten = $exam->questions()->where('type', 'written_answer')->exists();
        $hasTf = $exam->questions()->where('type', 'true_false')->exists();
        $hasMcq = $exam->questions()->where('type', 'mcq')->exists();

        $attempt->refresh();

        $allSubmitted = true;
        if ($hasTf && ! $attempt->tf_submitted_at) {
            $allSubmitted = false;
        }
        if ($hasMcq && ! $attempt->mcqs_submitted_at) {
            $allSubmitted = false;
        }
        if ($hasWritten && ! $attempt->written_submitted_at) {
            $allSubmitted = false;
        }

        if ($allSubmitted) {
            $attempt->update([
                'status' => 'grading',
                'submitted_at' => now(),
            ]);

            GradeAttemptJob::dispatch($attempt->id)->afterCommit();

            Inertia::flash('toast', ['type' => 'success', 'message' => __('All sections submitted! Your exam is being graded.')]);

            if ($exam->evaluation_strategy === 'instant') {
                return to_route('student.attempts.results', [$exam, $attempt]);
            }

            return to_route('student.dashboard');
        }

        return to_route('student.attempts.show', [
            'exam' => $exam->id,
            'attempt' => $attempt->id,
        ]);
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
