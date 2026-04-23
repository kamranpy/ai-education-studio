<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExamRequest;
use App\Http\Requests\Admin\UpdateExamRequest;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        $exams = Exam::query()
            ->withCount('questions')
            ->when($request->input('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->input('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Exams/Index', [
            'exams' => $exams,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Exams/Builder');
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        $exam = DB::transaction(function () use ($request) {
            $exam = Exam::create($request->safe()->only([
                'title', 'description', 'time_limit_minutes', 'passing_score',
            ]));

            $this->syncQuestions($exam, $request->validated('questions'));

            return $exam;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Exam created successfully.')]);

        return to_route('admin.exams.index');
    }

    public function edit(Exam $exam): Response
    {
        $exam->load('questions.choices');

        return Inertia::render('Admin/Exams/Builder', [
            'exam' => $exam,
        ]);
    }

    public function update(UpdateExamRequest $request, Exam $exam): RedirectResponse
    {
        DB::transaction(function () use ($request, $exam) {
            $exam->update($request->safe()->only([
                'title', 'description', 'time_limit_minutes', 'passing_score',
            ]));

            $exam->questions()->each(function ($question) {
                $question->choices()->delete();
            });
            $exam->questions()->delete();

            $this->syncQuestions($exam, $request->validated('questions'));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Exam updated successfully.')]);

        return to_route('admin.exams.index');
    }

    public function publish(Exam $exam): RedirectResponse
    {
        if (! $exam->isDraft()) {
            abort(422, __('Only draft exams can be published.'));
        }

        if ($exam->questions()->count() === 0) {
            abort(422, __('Cannot publish an exam with no questions.'));
        }

        $exam->update(['status' => 'published']);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Exam published successfully.')]);

        return to_route('admin.exams.index');
    }

    public function unpublish(Exam $exam): RedirectResponse
    {
        if (! $exam->isPublished()) {
            abort(422, __('Only published exams can be unpublished.'));
        }

        $exam->update(['status' => 'draft']);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Exam unpublished successfully.')]);

        return to_route('admin.exams.index');
    }

    private function syncQuestions(Exam $exam, array $questions): void
    {
        foreach ($questions as $index => $questionData) {
            $question = $exam->questions()->create([
                'type' => $questionData['type'],
                'text' => $questionData['text'],
                'points' => $questionData['points'],
                'grading_guidelines' => $questionData['grading_guidelines'] ?? null,
                'order' => $index,
            ]);

            if ($questionData['type'] === 'mcq' && ! empty($questionData['choices'])) {
                foreach ($questionData['choices'] as $choiceData) {
                    $question->choices()->create([
                        'text' => $choiceData['text'],
                        'is_correct' => $choiceData['is_correct'],
                    ]);
                }
            }
        }
    }
}
