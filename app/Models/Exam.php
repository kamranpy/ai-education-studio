<?php

namespace App\Models;

use App\Traits\HasInstitute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory, HasInstitute;

    protected $fillable = [
        'title',
        'description',
        'class_name',
        'subject_name',
        'time_limit_minutes',
        'passing_score',
        'status',
        'evaluation_strategy',
        'results_announced_at',
        'institute_id',
    ];

    protected $attributes = [
        'status' => 'draft',
        'passing_score' => 50,
    ];

    protected function casts(): array
    {
        return [
            'time_limit_minutes' => 'integer',
            'passing_score' => 'integer',
            'results_announced_at' => 'datetime',
        ];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }

    public function isManualEvaluation(): bool
    {
        return $this->evaluation_strategy === 'manual';
    }

    public function isResultsAnnounced(): bool
    {
        return $this->results_announced_at !== null;
    }

    /**
     * Check if a student can see their results based on evaluation strategy.
     */
    public function canStudentSeeResults(): bool
    {
        if ($this->evaluation_strategy === 'instant') {
            return true;
        }

        return $this->isResultsAnnounced();
    }
}
