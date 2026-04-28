<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamAttemptAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_attempt_id',
        'question_id',
        'answer_data',
        'is_correct',
        'points_awarded',
        'ai_evaluation_data',
        'ai_score',
        'ai_confidence',
        'ai_explanation',
        'ai_axes',
        'ai_provider',
        'ai_model',
        'tokens_in',
        'tokens_out',
        'override_score',
        'override_comment',
        'overridden_by',
        'overridden_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'answer_data' => 'array',
            'is_correct' => 'boolean',
            'points_awarded' => 'decimal:2',
            'ai_evaluation_data' => 'array',
            'ai_score' => 'decimal:2',
            'ai_confidence' => 'decimal:3',
            'ai_axes' => 'array',
            'override_score' => 'decimal:2',
            'overridden_at' => 'datetime',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function overrides(): HasMany
    {
        return $this->hasMany(ExamAttemptAnswerOverride::class);
    }

    /**
     * Final score: manual override takes precedence over AI score.
     */
    protected function finalScore(): Attribute
    {
        return Attribute::get(fn () => $this->override_score ?? $this->ai_score);
    }

    /**
     * Check if the student's answer is objectively correct (MC/TF questions).
     * Looks at the answer_data for the selected choice and checks against the correct choice.
     */
    public function isObjectiveCorrect(): bool
    {
        $question = $this->question;

        if ($question->type === 'written_answer') {
            return false;
        }

        // answer_data stores the selected choice ID (key: selected_choice_id)
        $selectedChoiceId = $this->answer_data['selected_choice_id'] ?? null;

        if (! $selectedChoiceId) {
            return false;
        }

        // Check if the selected choice is the correct one
        return $question->choices()
            ->where('id', $selectedChoiceId)
            ->where('is_correct', true)
            ->exists();
    }
}
