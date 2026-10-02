<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAttemptAnswerOverride extends Model
{
    protected $fillable = [
        'exam_attempt_answer_id',
        'from_score',
        'to_score',
        'comment',
        'actor_id',
    ];

    protected function casts(): array
    {
        return [
            'from_score' => 'decimal:2',
            'to_score' => 'decimal:2',
        ];
    }

    public function answer(): BelongsTo
    {
        return $this->belongsTo(ExamAttemptAnswer::class, 'exam_attempt_answer_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
