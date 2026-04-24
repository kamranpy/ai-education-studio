<?php

namespace App\Models;

use App\Traits\HasInstitute;
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
}
