<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected function casts(): array
    {
        return [
            'answer_data' => 'array',
            'is_correct' => 'boolean',
            'points_awarded' => 'decimal:2',
            'ai_evaluation_data' => 'array',
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
}
