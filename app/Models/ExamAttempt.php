<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'exam_id',
        'status',
        'question_order',
        'tracking_logs',
        'started_at',
        'submitted_at',
        'tf_submitted_at',
        'mcqs_submitted_at',
        'written_submitted_at',
    ];

    protected $attributes = [
        'status' => 'in_progress',
    ];

    protected function casts(): array
    {
        return [
            'question_order' => 'array',
            'tracking_logs' => 'array',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'tf_submitted_at' => 'datetime',
            'mcqs_submitted_at' => 'datetime',
            'written_submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ExamAttemptAnswer::class);
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function isExpired(): bool
    {
        if (! $this->exam || ! $this->exam->time_limit_minutes) {
            return false;
        }

        return now()->greaterThan(
            $this->started_at->addMinutes($this->exam->time_limit_minutes)
        );
    }

    /**
     * Finalize grading after all AI evaluations are complete.
     * Sets attempt status to 'needs_review' if any answer needs review, otherwise 'graded'.
     */
    public function finalizeGrading(): void
    {
        $this->load('answers');

        $hasNeedsReview = $this->answers->contains(fn ($ans) => $ans->status === 'needs_review');

        $this->update([
            'status' => $hasNeedsReview ? 'needs_review' : 'graded',
        ]);
    }

    /**
     * Check if a specific question-type section has been submitted.
     */
    public function isSectionSubmitted(string $section): bool
    {
        $field = match ($section) {
            'tf', 'true_false' => 'tf_submitted_at',
            'mcqs', 'mcq' => 'mcqs_submitted_at',
            'written', 'written_answer' => 'written_submitted_at',
            default => null,
        };

        return $field && $this->{$field} !== null;
    }

    /**
     * Check if all sections have been submitted.
     */
    public function allSectionsSubmitted(): bool
    {
        return $this->tf_submitted_at !== null
            && $this->mcqs_submitted_at !== null
            && $this->written_submitted_at !== null;
    }
}
